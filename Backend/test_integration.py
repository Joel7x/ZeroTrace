import subprocess
import time
import requests
import sys
import os

def run_test():
    print("=" * 60)
    print("      INTEGRATION TEST: BACKEND & ML PIPELINE CONNECTION")
    print("=" * 60)

    # 1. Start the FastAPI server using Uvicorn as a background subprocess
    print("[1/4] Starting FastAPI Uvicorn Server...")
    python_executable = sys.executable
    server_process = subprocess.Popen(
        [python_executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8088"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=os.path.dirname(os.path.abspath(__file__))
    )
    
    # Wait for the server to spin up
    print("  Waiting 6 seconds for Uvicorn server to complete boot sequence...")
    time.sleep(6)

    # 2. Check if the server is running by hitting the /health check
    print("[2/4] Verifying health check endpoint...")
    try:
        health_resp = requests.get("http://127.0.0.1:8088/health", timeout=10)
        print(f"  Health Check Status: {health_resp.status_code}")
        print(f"  Health Check Body  : {health_resp.json()}")
        assert health_resp.status_code == 200
        assert health_resp.json()["status"] == "healthy"
    except Exception as e:
        print(f"  [ERROR] Health check failed: {e}")
        # Print server logs if failed
        server_process.terminate()
        stdout, stderr = server_process.communicate()
        print(f"  Server Stdout:\n{stdout.decode('utf-8', errors='ignore')}")
        print(f"  Server Stderr:\n{stderr.decode('utf-8', errors='ignore')}")
        sys.exit(1)

    # 3. Hit the live ML analysis endpoint with a raw claim JSON payload
    print("[3/4] Sending live claim analysis request (POST /api/v1/claims/analyze)...")
    payload = {
        "Provider": "PRV99999",
        "BeneID": "BENE9999",
        "ClaimID": "CLM0001",
        "InscClaimAmtReimbursed": 25000,
        "DeductibleAmtPaid": 1068.0,
        "AdmissionDt": "2020-01-01",
        "DischargeDt": "2020-01-30"  # 29 hospitalization days
    }
    
    try:
        analysis_resp = requests.post(
            "http://127.0.0.1:8088/api/v1/claims/analyze",
            json=payload,
            timeout=10
        )
        print(f"  Analysis Status: {analysis_resp.status_code}")
        print(f"  Analysis Body  : {analysis_resp.json()}")
        
        # Verify the structure and values
        data = analysis_resp.json()
        assert analysis_resp.status_code == 200
        assert data["status"] == "success"
        assert "risk_score" in data
        assert isinstance(data["risk_score"], (int, float))
        assert "recommendation" in data
        
    except Exception as e:
        print(f"  [ERROR] Live analysis request failed: {e}")
        server_process.terminate()
        stdout, stderr = server_process.communicate()
        print(f"  Server Stdout:\n{stdout.decode('utf-8', errors='ignore')}")
        print(f"  Server Stderr:\n{stderr.decode('utf-8', errors='ignore')}")
        sys.exit(1)

    # 4. Clean up: Terminate the server
    print("[4/4] Shutting down FastAPI server...")
    server_process.terminate()
    server_process.wait()
    
    print("\n" + "=" * 60)
    print("  [SUCCESS] Integration Test Completed - 100% Working State!")
    print("=" * 60)

if __name__ == "__main__":
    run_test()
