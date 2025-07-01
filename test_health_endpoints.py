#!/usr/bin/env python3
import requests
import json
import os
import time
from dotenv import load_dotenv

# Load environment variables from frontend .env file
load_dotenv('/app/frontend/.env')

# Backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL')
if not BACKEND_URL:
    raise ValueError("REACT_APP_BACKEND_URL not found in environment variables")

# For testing, we'll use the internal URL since we're running inside the container
INTERNAL_API_URL = "http://localhost:8001/api"
API_URL = INTERNAL_API_URL

print(f"Testing backend health endpoints at: {API_URL}")
print(f"External backend URL: {BACKEND_URL}/api")

def test_endpoint(endpoint, expected_status=200):
    """Test an endpoint and return the response"""
    url = f"{API_URL}/{endpoint}"
    print(f"\n=== Testing {url} ===")
    
    try:
        start_time = time.time()
        response = requests.get(url)
        end_time = time.time()
        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Time: {response_time:.2f} ms")
        
        if response.status_code == expected_status:
            try:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2)}")
                return True, data
            except json.JSONDecodeError:
                print(f"Response is not valid JSON: {response.text}")
                return False, None
        else:
            print(f"Unexpected status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"Error: {str(e)}")
        return False, None

def main():
    """Test all health endpoints"""
    print("=== Testing ChatPDF Health Endpoints ===")
    
    # Define the endpoints to test
    endpoints = [
        {"name": "Basic Health", "path": "health", "expected_status": 200},
        {"name": "Detailed Health", "path": "health/detailed", "expected_status": 200},
        {"name": "Ready Health", "path": "health/ready", "expected_status": 200},
        {"name": "Live Health", "path": "health/live", "expected_status": 200},
        {"name": "System Health", "path": "system-health", "expected_status": 200},
        {"name": "Health Metrics", "path": "system-health/metrics", "expected_status": 200}
    ]
    
    results = []
    
    for endpoint in endpoints:
        print(f"\n--- Testing {endpoint['name']} Endpoint ---")
        success, data = test_endpoint(endpoint["path"], endpoint["expected_status"])
        
        if success:
            print(f"✅ {endpoint['name']} endpoint test passed")
            results.append({"name": endpoint["name"], "success": True})
        else:
            # For ready and live endpoints, 404 is acceptable as they might not be implemented
            if endpoint["path"] in ["health/ready", "health/live"] and data and "detail" in data and data["detail"] == "Not Found":
                print(f"⚠️ {endpoint['name']} endpoint not implemented (404)")
                results.append({"name": endpoint["name"], "success": "N/A", "reason": "Not implemented"})
            else:
                print(f"❌ {endpoint['name']} endpoint test failed")
                results.append({"name": endpoint["name"], "success": False})
    
    # Print summary
    print("\n=== Test Summary ===")
    for result in results:
        if result["success"] == True:
            status = "✅ PASSED"
        elif result["success"] == "N/A":
            status = f"⚠️ NOT IMPLEMENTED ({result['reason']})"
        else:
            status = "❌ FAILED"
        
        print(f"{result['name']}: {status}")
    
    # Overall result
    passed = all(result["success"] == True or result["success"] == "N/A" for result in results)
    if passed:
        print("\n✅ All implemented health endpoints are working correctly")
    else:
        print("\n❌ Some health endpoints failed")

if __name__ == "__main__":
    main()