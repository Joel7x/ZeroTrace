import requests
import time

# Wait a moment for uvicorn auto-reload to pick up the new scoring logic
time.sleep(3)

cases = [
    ("HIGH FRAUD: Rs55000 reimburse, Rs100 deductible (0.18% ratio)", {
        "Provider": "PRV55912", "BeneID": "BFNF11001", "ClaimID": "CLM_TEST01",
        "InscClaimAmtReimbursed": 55000, "DeductibleAmtPaid": 100,
        "AdmissionDt": "2020-01-01", "DischargeDt": "2020-01-03"
    }),
    ("LOW RISK: Rs1200 reimburse, Rs250 deductible (20% ratio)", {
        "Provider": "PRV51001", "BeneID": "BENE21004", "ClaimID": "CLM_TEST02",
        "InscClaimAmtReimbursed": 1200, "DeductibleAmtPaid": 250,
        "AdmissionDt": "2020-02-10", "DischargeDt": "2020-02-12"
    }),
    ("GENUINE: Rs5000 reimburse == Rs5000 deductible (100% ratio)", {
        "Provider": "PRV57009", "BeneID": "BENE77218", "ClaimID": "CLM_TEST03",
        "InscClaimAmtReimbursed": 5000, "DeductibleAmtPaid": 5000,
        "AdmissionDt": "2020-04-10", "DischargeDt": "2020-04-12"
    }),
    ("HIGH FRAUD: Rs42000 reimburse, Rs0 deductible (0% ratio)", {
        "Provider": "PRV58992", "BeneID": "BENE44219", "ClaimID": "CLM_TEST04",
        "InscClaimAmtReimbursed": 42000, "DeductibleAmtPaid": 0,
        "AdmissionDt": "2020-03-01", "DischargeDt": "2020-03-29"
    }),
]

print("=" * 65)
print("  HYBRID FRAUD SCORING VERIFICATION TEST")
print("=" * 65)

for label, case in cases:
    r = requests.post("http://127.0.0.1:8088/api/v1/claims/analyze", json=case)
    d = r.json()
    score = d.get("risk_score")
    level = d.get("risk_level")
    decision = d.get("recommendation")
    reason = d.get("reasons", "").encode("ascii", errors="replace").decode("ascii")

    print(f"\nCase: {label}")
    print(f"  Score    : {score}")
    print(f"  Level    : {level}")
    print(f"  Decision : {decision}")
    print(f"  Reason   : {reason[:120]}")

print("\n" + "=" * 65)
print("  Test complete!")
print("=" * 65)
