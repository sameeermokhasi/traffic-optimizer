from google import genai
from google.genai import types
import os
import json
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout
from dotenv import load_dotenv
from state import TrafficState, CongestionReport

# RAG layer — graceful import so backend starts even if chromadb not installed yet
try:
    from rag.retriever import build_regulation_context
    from rag.memory import retrieve_similar_cycles
    _rag_available = True
except ImportError:
    _rag_available = False
    def build_regulation_context(counts): return ""
    def retrieve_similar_cycles(counts): return ""

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def congestion_agent(state: TrafficState) -> TrafficState:
    counts = state["vehicle_counts"]
    total = sum(counts.values())

    # ── RAG: Retrieve relevant BBMP / IRC regulations ─────────────────
    regulation_context = build_regulation_context(counts)

    # ── Memory: Retrieve similar past cycles ───────────────────────────
    memory_context = retrieve_similar_cycles(counts)

    prompt = f"""You are a traffic management AI for Silk Board Junction, Bengaluru.

Current vehicle counts:
- North: {counts['N']} vehicles  (Hosur Road / NH-44)
- South: {counts['S']} vehicles  (Hosur Road towards Electronic City)
- East:  {counts['E']} vehicles  (Outer Ring Road / Koramangala)
- West:  {counts['W']} vehicles  (Outer Ring Road / BTM Layout)
- Total: {total} vehicles
{regulation_context}
{memory_context}

Return ONLY a JSON object, no other text:
{{
  "priority_order": ["X","Y","Z","W"],
  "severity": "low|medium|high|critical",
  "reasoning": "one sentence citing specific vehicle counts AND referencing any relevant regulation above"
}}

Rules:
- priority_order: lanes sorted highest to lowest vehicle count (use N/S/E/W)
- severity: low(<50 total), medium(50-150), high(150-300), critical(>300)
- reasoning: MUST mention actual lane counts and cite the regulation source if applicable"""

    def _call_gemini():
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=300,
                response_mime_type="application/json"
            )
        )
        return response.text.strip()

    try:
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_call_gemini)
            raw = future.result(timeout=8)   # hard 8-second cap

        if raw.startswith("```json"):
            raw = raw[7:-3].strip()
        elif raw.startswith("```"):
            raw = raw[3:-3].strip()

        report: CongestionReport = json.loads(raw)
    except Exception as e:
        error_msg = str(e).replace('"', "'")
        print(f"[Agent 2 - ERROR] {error_msg}")
        report = {
            "priority_order": ["N", "S", "E", "W"],
            "severity": "medium",
            "reasoning": f"Google Gemini API Error: {error_msg[:100]}..."
        }

    print(f"[Agent 2 - Congestion] Severity: {report['severity']} | Priority: {report['priority_order']}")
    print(f"  Reasoning: {report['reasoning']}")
    return {**state, "congestion_report": report}
