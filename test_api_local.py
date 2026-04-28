import urllib.request
import urllib.error
import json
import traceback

url = "http://localhost:8000/api/intersection/update"
data = json.dumps({
    "N": 10, "S": 20, "E": 30, "W": 40, "cycle_number": 1
}).encode("utf-8")
headers = {"Content-Type": "application/json"}

req = urllib.request.Request(url, data=data, headers=headers, method="POST")

try:
    with urllib.request.urlopen(req) as response:
        with open("error_log.txt", "w") as f:
            f.write(str(response.status) + "\n")
            f.write(response.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    with open("error_log.txt", "w") as f:
        f.write(str(e.code) + "\n")
        f.write(e.read().decode("utf-8"))
except Exception as e:
    with open("error_log.txt", "w") as f:
        f.write(traceback.format_exc())
