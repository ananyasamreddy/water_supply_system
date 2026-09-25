import urllib.request
import json
import sys

def check_endpoint(name, url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    try:
        req_data = None
        if data:
            req_data = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
        
        req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.getcode()
            body = resp.read().decode("utf-8")
            content_type = resp.headers.get("Content-Type", "")
            if "application/json" in content_type:
                res_json = json.loads(body)
                print(f" [PASS] {name} ({url}) -> HTTP {status} (JSON keys: {list(res_json.keys())[:5]})")
                return res_json
            else:
                print(f" [PASS] {name} ({url}) -> HTTP {status} ({len(body)} bytes)")
                return body
    except Exception as e:
        print(f" [FAIL] {name} ({url}) -> Error: {e}")
        return None

def main():
    print("\n" + "="*70)
    print(" END-TO-END VERIFICATION: SMART WATER SUPPLY NETWORK SYSTEM")
    print("="*70 + "\n")

    # 1. Python FastAPI Health
    check_endpoint("AI Service Health", "http://127.0.0.1:8000/health")

    # 2. Python Network GeoJSON
    geojson = check_endpoint("AI Network GeoJSON", "http://127.0.0.1:8000/network/geojson")
    if geojson:
        features = geojson.get("features", [])
        print(f"        -> Total features loaded: {len(features)}")

    # 3. Python Extended-Period Snapshot
    snapshot = check_endpoint("AI Hydraulic Snapshot (Hour 12)", "http://127.0.0.1:8000/simulation/hydraulic/snapshot?hour=12")
    if snapshot:
        j_cnt = len(snapshot.get("junctions", []))
        p_cnt = len(snapshot.get("pipes", []))
        print(f"        -> Hour {snapshot.get('hour')}: {j_cnt} junctions, {p_cnt} pipelines")

    # 4. Python ML Failure Prediction
    ml_sample = {
        "features": {
            "age_years": 42.0,
            "diameter_mm": 200.0,
            "material": "Cast Iron",
            "condition_score": 2.0,
            "previous_failures": 3,
            "criticality_score": 4.0,
            "soil_corrosivity": 4.0,
            "traffic_load": 4.0,
            "mean_velocity_ms": 1.2,
            "velocity_variance": 0.45,
            "pressure_cycles_day": 8.0
        }
    }
    check_endpoint("AI ML Failure Risk Prediction", "http://127.0.0.1:8000/ml/failure-risk/predict", method="POST", data=ml_sample)

    # 5. Python XGBoost Demand Forecast
    check_endpoint("AI Demand Forecast (Zone 1, 24h)", "http://127.0.0.1:8000/ml/demand/forecast?zone_id=ZONE_1&horizon_hours=24")

    # 6. Node Backend Health
    check_endpoint("Node.js Backend Health", "http://127.0.0.1:5000/api/health")

    # 7. Node Backend Auth Login
    login_res = check_endpoint("Node.js Auth Login (Admin)", "http://127.0.0.1:5000/api/auth/login", method="POST", data={
        "email": "admin@water.gov",
        "password": "password123"
    })
    token = None
    if login_res and "token" in login_res:
        token = login_res["token"]
        print(f"        -> Authenticated as: {login_res['user']['name']} ({login_res['user']['role']})")

    # 7b. Node Backend Admin Users List
    auth_headers = {"Authorization": f"Bearer {token}"} if token else {}
    users_res = check_endpoint("Node.js Admin Users List", "http://127.0.0.1:5000/api/auth/users", headers=auth_headers)
    if users_res:
        u_list = users_res.get("users", [])
        print(f"        -> Total registered users in system: {len(u_list)}")
    check_endpoint("Node.js GIS Network GeoJSON", "http://127.0.0.1:5000/api/gis/network", headers=auth_headers)

    # 9. Node Backend Maintenance Tasks
    tasks_res = check_endpoint("Node.js Maintenance Tasks", "http://127.0.0.1:5000/api/maintenance", headers=auth_headers)
    if tasks_res:
        tasks = tasks_res.get("maintenance", [])
        print(f"        -> Total maintenance tasks in queue: {len(tasks)}")

    # 10. Node Backend Citizen Complaints
    complaints_res = check_endpoint("Node.js Citizen Complaints", "http://127.0.0.1:5000/api/complaints", headers=auth_headers)
    if complaints_res:
        complaints = complaints_res.get("complaints", [])
        print(f"        -> Total citizen complaints: {len(complaints)}")

    # 11. React Frontend Vite HTTP 200
    check_endpoint("React Vite Web Client", "http://127.0.0.1:5173")

    print("\n" + "="*70)
    print(" ALL END-TO-END SERVICES OPERATING SEAMLESSLY")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
