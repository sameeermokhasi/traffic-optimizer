import requests

res = requests.post("http://localhost:8000/api/intersection/update", json={
    "intersection_id": "test",
    "vehicle_counts": {"N": 10, "S": 20, "E": 30, "W": 40}
})
print(res.status_code)
print(res.text)
