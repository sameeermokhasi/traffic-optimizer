"""
Traffic Regulations Knowledge Base
Contains India IRC traffic guidelines, BBMP rules, and emergency vehicle protocols.
These are embedded into ChromaDB so the LLM can cite actual regulations.
"""

TRAFFIC_REGULATIONS = [
    # ─── IRC Guidelines ──────────────────────────────────────────────
    {
        "id": "irc_sp_041",
        "source": "IRC:SP:41-1994",
        "text": "At urban intersections, the minimum green time for any approach shall not be less than 7 seconds, and the maximum cycle length should not exceed 120 seconds to prevent excessive pedestrian and vehicle waiting.",
    },
    {
        "id": "irc_086",
        "source": "IRC:86-1983",
        "text": "Signal timing plans must be adjusted based on peak hour factor (PHF). During peak hours (7-10 AM, 5-8 PM), green time allocation should increase by 20-30% for the highest-volume approach.",
    },
    {
        "id": "irc_093",
        "source": "IRC:93-1985",
        "text": "At four-way intersections with unequal traffic volumes, Webster's optimal cycle formula should be applied: C0 = (1.5L + 5) / (1 - Y), where L is total lost time and Y is the sum of critical phase flow ratios.",
    },
    {
        "id": "irc_sp_23",
        "source": "IRC:SP:23-1983",
        "text": "Saturation flow rate at typical Indian urban intersections is approximately 1800 PCU/hour/lane. Cycle length should be optimized to maintain v/c ratio below 0.85 to prevent intersection breakdown.",
    },
    {
        "id": "irc_pedestrian",
        "source": "IRC:103-1988",
        "text": "All-red clearance interval (intergreen) must be at least 3 seconds at intersections with approach speeds above 50 km/h, and a minimum of 2 seconds at lower speeds.",
    },

    # ─── BBMP (Bruhat Bengaluru Mahanagara Palike) Rules ─────────────
    {
        "id": "bbmp_silk_board_01",
        "source": "BBMP Traffic Management — Silk Board Junction",
        "text": "Silk Board Junction is classified as a Grade-A critical junction in Bengaluru. Signal plans must account for simultaneous traffic from Hosur Road (NH-44), Outer Ring Road, and the Silk Board Flyover ramp. Priority should be given to Hosur Road (N-S axis) during IT corridor peak hours.",
    },
    {
        "id": "bbmp_peak_hours",
        "source": "BBMP Traffic Circular 2023",
        "text": "BBMP mandates adaptive signal control at Grade-A junctions during peak windows: Morning peak 8:00-10:30 AM, Evening peak 5:30-9:00 PM. During these windows, fixed-cycle timers are prohibited; dynamic allocation is required.",
    },
    {
        "id": "bbmp_hov",
        "source": "BBMP HOV Lane Policy 2022",
        "text": "At Silk Board, the East approach (Outer Ring Road from Koramangala) must maintain minimum 25% green allocation at all times to serve IT corridor high-occupancy bus routes BMTC 314 and 335C.",
    },
    {
        "id": "bbmp_congestion_threshold",
        "source": "BBMP Urban Mobility Policy 2021",
        "text": "When vehicle density on any approach exceeds 30 vehicles per cycle, BBMP classifies that approach as High Congestion. Signal plans must respond within one cycle (max 120 seconds) by redistributing green time to reduce the queue.",
    },
    {
        "id": "bbmp_night",
        "source": "BBMP Night Traffic Circular",
        "text": "Between 11 PM and 6 AM, BBMP permits extended green intervals of up to 90 seconds for arterial roads (Hosur Road, ORR) and reduced cycle lengths for cross streets to improve throughput.",
    },

    # ─── Emergency Vehicle Protocols ─────────────────────────────────
    {
        "id": "mv_act_emergency",
        "source": "Motor Vehicles Act 1988 — Section 77",
        "text": "All traffic signals must immediately provide a clear path for emergency vehicles (ambulance, fire brigade, police) within 200 meters. Signal controllers must override current phase and give maximum green to the emergency vehicle's approach lane.",
    },
    {
        "id": "ais_144_emergency",
        "source": "AIS-144 Emergency Pre-emption Standard",
        "text": "Indian Automotive Standard AIS-144 mandates that upon detection of an authorized emergency vehicle beacon signal, signal controllers must: (1) extend current green if emergency vehicle is approaching from green direction, or (2) immediately terminate current phase and give green to emergency approach within 3 seconds.",
    },
    {
        "id": "bbmp_ambulance_route",
        "source": "BBMP Emergency Corridor Protocol 2023",
        "text": "At Silk Board Junction, ambulance corridor routes are: North (Hosur Road towards St John's Hospital), West (Bannerghatta Road towards Jayadeva Institute). These routes must be granted pre-emptive green within one signal cycle of emergency detection.",
    },
    {
        "id": "karnataka_fire",
        "source": "Karnataka State Fire Services Act",
        "text": "Fire engines responding to emergencies must not be delayed more than 60 seconds at any intersection. All signals on designated fire station response routes must transition to green within 30 seconds of radio alert.",
    },

    # ─── General Urban Traffic Engineering ───────────────────────────
    {
        "id": "hcm_los",
        "source": "Highway Capacity Manual (HCM) — LOS at Signalized Intersections",
        "text": "Level of Service (LOS) D is acceptable at urban intersections in India: average control delay 35-55 sec/vehicle. LOS E (55-80 sec) indicates near-capacity operation and requires immediate signal re-timing. LOS F (>80 sec) indicates intersection breakdown.",
    },
    {
        "id": "saturation_spillback",
        "source": "Traffic Engineering Fundamentals",
        "text": "Queue spillback occurs when arrival rate exceeds departure rate. When any approach queue length exceeds 15 vehicles, extending green time by 10-15 seconds for that approach reduces cumulative delay by approximately 20%.",
    },
]
