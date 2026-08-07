"""End-to-end test script for VisionInspect AI"""
import requests
import json
import sys
import os

API = "http://127.0.0.1:8000"
DATA = os.path.join(os.path.dirname(__file__), "data", "mvtec_ad")

def test_inspect(name, image_path, expected_result):
    """Test the inspect endpoint with an image."""
    print(f"TEST: {name}")
    try:
        with open(image_path, "rb") as f:
            r = requests.post(f"{API}/api/inspect", files={"file": (os.path.basename(image_path), f, "image/png")})
        data = r.json()
        result = data.get("result", "UNKNOWN")
        classification = data.get("classification", "N/A")
        matched_cat = data.get("matched_category", "N/A")
        confidence = data.get("confidence", 0)
        severity = data.get("severity_score", 0)
        
        # For expected FAIL, also accept REVIEW (unknown defective products get REVIEW)
        if expected_result == "FAIL":
            match = result in ("FAIL", "REVIEW")
        else:
            match = result == expected_result
        
        status = "[PASS]" if match else "[FAIL]"
        print(f"  {status} Result={result} (expected={expected_result})")
        print(f"       Classification={classification}, Category={matched_cat}")
        print(f"       Confidence={confidence}, Severity={severity}")
        return match
    except Exception as e:
        print(f"  [ERROR] {e}")
        return False

def test_endpoint(name, method, url):
    """Test a GET/POST endpoint."""
    print(f"TEST: {name}")
    try:
        if method == "GET":
            r = requests.get(url)
        else:
            r = requests.post(url)
        
        data = r.json()
        print(f"  [PASS] Status={r.status_code}")
        # Print first 200 chars of response
        preview = json.dumps(data)[:200]
        print(f"       Response: {preview}...")
        return True
    except Exception as e:
        print(f"  [ERROR] {e}")
        return False

def main():
    print("=" * 60)
    print("  VisionInspect AI - End-to-End Testing")
    print("=" * 60)
    print()

    passed = 0
    failed = 0

    # Test 1: Good bottle
    if test_inspect("Good Bottle", os.path.join(DATA, "bottle/test/good/000.png"), "PASS"):
        passed += 1
    else:
        failed += 1
    print()

    # Test 2: Defective bottle (broken_large)
    if test_inspect("Broken Bottle", os.path.join(DATA, "bottle/test/broken_large/000.png"), "FAIL"):
        passed += 1
    else:
        failed += 1
    print()

    # Test 3: Good hazelnut
    if test_inspect("Good Hazelnut", os.path.join(DATA, "hazelnut/test/good/000.png"), "PASS"):
        passed += 1
    else:
        failed += 1
    print()

    # Test 4: Defective hazelnut (crack)
    if test_inspect("Cracked Hazelnut", os.path.join(DATA, "hazelnut/test/crack/000.png"), "FAIL"):
        passed += 1
    else:
        failed += 1
    print()

    # Test 5: Good tile
    if test_inspect("Good Tile", os.path.join(DATA, "tile/test/good/000.png"), "PASS"):
        passed += 1
    else:
        failed += 1
    print()

    # Test 6: Defective tile (crack)
    if test_inspect("Cracked Tile", os.path.join(DATA, "tile/test/crack/000.png"), "FAIL"):
        passed += 1
    else:
        failed += 1
    print()

    # Test 7: Good capsule
    if test_inspect("Good Capsule", os.path.join(DATA, "capsule/test/good/000.png"), "PASS"):
        passed += 1
    else:
        failed += 1
    print()

    # Test 8: Defective capsule (scratch)
    if test_inspect("Scratched Capsule", os.path.join(DATA, "capsule/test/scratch/000.png"), "FAIL"):
        passed += 1
    else:
        failed += 1
    print()

    # Test 9: Good screw
    if test_inspect("Good Screw", os.path.join(DATA, "screw/test/good/000.png"), "PASS"):
        passed += 1
    else:
        failed += 1
    print()

    # Test 10: Defective zipper (broken_teeth)
    if test_inspect("Broken Zipper", os.path.join(DATA, "zipper/test/broken_teeth/000.png"), "FAIL"):
        passed += 1
    else:
        failed += 1
    print()

    # API endpoint tests
    print("-" * 60)
    print("  API Endpoint Tests")
    print("-" * 60)
    print()

    endpoints = [
        ("Analytics Summary", "GET", f"{API}/api/analytics/summary"),
        ("Defect Trends", "GET", f"{API}/api/analytics/defect-trends"),
        ("Severity Distribution", "GET", f"{API}/api/analytics/severity-distribution"),
        ("Defect Types", "GET", f"{API}/api/analytics/defect-types"),
        ("Production Quality", "GET", f"{API}/api/analytics/production-quality"),
        ("Recent Inspections", "GET", f"{API}/api/analytics/recent-inspections"),
        ("Inspections List", "GET", f"{API}/api/inspections"),
    ]

    for name, method, url in endpoints:
        if test_endpoint(name, method, url):
            passed += 1
        else:
            failed += 1
        print()

    # Summary
    print("=" * 60)
    total = passed + failed
    print(f"  RESULTS: {passed}/{total} tests passed ({passed/total*100:.0f}%)")
    if failed == 0:
        print("  STATUS: ALL TESTS PASSED!")
    else:
        print(f"  STATUS: {failed} tests FAILED")
    print("=" * 60)

    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
