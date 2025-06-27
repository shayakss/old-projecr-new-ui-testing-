#!/usr/bin/env python3
import requests
import json
import os
import time
import uuid
import unittest
import traceback
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

print(f"Testing backend health monitoring at: {API_URL}")
print(f"External backend URL: {BACKEND_URL}/api")

# Enable detailed error output for tests
unittest.TestCase.maxDiff = None

class HealthMonitoringTest(unittest.TestCase):
    """Test suite for the health monitoring endpoints"""

    def test_01_basic_health_check(self):
        """Test the basic health check endpoint (/api/health)"""
        print("\n=== Testing Basic Health Check Endpoint ===")
        
        url = f"{API_URL}/health"
        
        response = requests.get(url)
        print(f"Health Check Response Status: {response.status_code}")
        
        self.assertEqual(response.status_code, 200, f"Expected status code 200, got {response.status_code}")
        
        data = response.json()
        print(f"Health Check Response: {json.dumps(data, indent=2)}")
        
        # Verify response structure
        self.assertIn("status", data, "Response missing 'status' field")
        self.assertEqual(data["status"], "healthy", f"Expected status 'healthy', got '{data['status']}'")
        self.assertIn("timestamp", data, "Response missing 'timestamp' field")
        
        print("✅ Basic health check endpoint is working correctly")

    def test_02_comprehensive_system_health(self):
        """Test the comprehensive system health endpoint (/api/system-health)"""
        print("\n=== Testing Comprehensive System Health Endpoint ===")
        
        url = f"{API_URL}/system-health"
        
        response = requests.get(url)
        print(f"System Health Response Status: {response.status_code}")
        
        self.assertEqual(response.status_code, 200, f"Expected status code 200, got {response.status_code}")
        
        data = response.json()
        print(f"System Health Response: {json.dumps(data, indent=2)}")
        
        # Verify response structure
        self.assertIn("overall_status", data, "Response missing 'overall_status' field")
        self.assertIn(data["overall_status"], ["healthy", "warning", "critical"], 
                     f"Invalid overall_status: {data['overall_status']}")
        
        # Verify component statuses
        self.assertIn("backend_status", data, "Response missing 'backend_status' field")
        self.assertIn("frontend_status", data, "Response missing 'frontend_status' field")
        self.assertIn("database_status", data, "Response missing 'database_status' field")
        self.assertIn("api_status", data, "Response missing 'api_status' field")
        
        # Verify metrics
        self.assertIn("metrics", data, "Response missing 'metrics' field")
        metrics = data["metrics"]
        self.assertIn("cpu_usage", metrics, "Metrics missing 'cpu_usage' field")
        self.assertIn("memory_usage", metrics, "Metrics missing 'memory_usage' field")
        self.assertIn("disk_usage", metrics, "Metrics missing 'disk_usage' field")
        self.assertIn("response_time", metrics, "Metrics missing 'response_time' field")
        self.assertIn("active_sessions", metrics, "Metrics missing 'active_sessions' field")
        self.assertIn("total_api_calls", metrics, "Metrics missing 'total_api_calls' field")
        self.assertIn("error_rate", metrics, "Metrics missing 'error_rate' field")
        
        # Verify issues list
        self.assertIn("issues", data, "Response missing 'issues' field")
        self.assertIsInstance(data["issues"], list, "Issues should be a list")
        
        # Verify uptime
        self.assertIn("uptime", data, "Response missing 'uptime' field")
        self.assertIsInstance(data["uptime"], (int, float), "Uptime should be a number")
        self.assertGreaterEqual(data["uptime"], 0, "Uptime should be non-negative")
        
        # Verify last_check
        self.assertIn("last_check", data, "Response missing 'last_check' field")
        
        print("✅ Comprehensive system health endpoint is working correctly")

    def test_03_health_metrics(self):
        """Test the health metrics endpoint (/api/system-health/metrics)"""
        print("\n=== Testing Health Metrics Endpoint ===")
        
        url = f"{API_URL}/system-health/metrics"
        
        response = requests.get(url)
        print(f"Health Metrics Response Status: {response.status_code}")
        
        self.assertEqual(response.status_code, 200, f"Expected status code 200, got {response.status_code}")
        
        data = response.json()
        print(f"Health Metrics Response: {json.dumps(data, indent=2)}")
        
        # Verify response structure
        self.assertIn("current_metrics", data, "Response missing 'current_metrics' field")
        self.assertIn("history", data, "Response missing 'history' field")
        self.assertIn("uptime", data, "Response missing 'uptime' field")
        
        # Verify current metrics
        current_metrics = data["current_metrics"]
        self.assertIn("cpu_usage", current_metrics, "Current metrics missing 'cpu_usage' field")
        self.assertIn("memory_usage", current_metrics, "Current metrics missing 'memory_usage' field")
        self.assertIn("disk_usage", current_metrics, "Current metrics missing 'disk_usage' field")
        self.assertIn("response_time", current_metrics, "Current metrics missing 'response_time' field")
        self.assertIn("active_sessions", current_metrics, "Current metrics missing 'active_sessions' field")
        self.assertIn("total_api_calls", current_metrics, "Current metrics missing 'total_api_calls' field")
        self.assertIn("error_rate", current_metrics, "Current metrics missing 'error_rate' field")
        
        # Verify history
        self.assertIsInstance(data["history"], list, "History should be a list")
        
        # Verify uptime
        self.assertIsInstance(data["uptime"], (int, float), "Uptime should be a number")
        self.assertGreaterEqual(data["uptime"], 0, "Uptime should be non-negative")
        
        print("✅ Health metrics endpoint is working correctly")

    def test_04_auto_fix_without_confirmation(self):
        """Test the auto-fix endpoint without confirmation (/api/system-health/fix)"""
        print("\n=== Testing Auto-Fix Endpoint Without Confirmation ===")
        
        # First, get the system health to find an issue to fix
        health_url = f"{API_URL}/system-health"
        health_response = requests.get(health_url)
        health_data = health_response.json()
        
        # Check if there are any issues
        if not health_data.get("issues"):
            print("No issues found to test auto-fix. Creating a mock request.")
            issue_id = str(uuid.uuid4())
        else:
            # Get the first auto-fixable issue
            auto_fixable_issues = [issue for issue in health_data["issues"] if issue.get("auto_fixable")]
            if auto_fixable_issues:
                issue_id = auto_fixable_issues[0]["id"]
                print(f"Found auto-fixable issue with ID: {issue_id}")
            else:
                print("No auto-fixable issues found. Creating a mock request.")
                issue_id = str(uuid.uuid4())
        
        # Test without confirmation
        url = f"{API_URL}/system-health/fix"
        payload = {
            "issue_id": issue_id,
            "confirm_fix": False
        }
        
        response = requests.post(url, json=payload)
        print(f"Auto-Fix Without Confirmation Response Status: {response.status_code}")
        
        self.assertEqual(response.status_code, 200, f"Expected status code 200, got {response.status_code}")
        
        data = response.json()
        print(f"Auto-Fix Without Confirmation Response: {json.dumps(data, indent=2)}")
        
        # Verify that confirmation is required
        self.assertIn("error", data, "Response missing 'error' field")
        self.assertEqual(data["error"], "Fix confirmation required", 
                        f"Expected error 'Fix confirmation required', got '{data['error']}'")
        self.assertIn("confirmed", data, "Response missing 'confirmed' field")
        self.assertEqual(data["confirmed"], False, "Expected confirmed to be False")
        
        print("✅ Auto-fix endpoint correctly requires confirmation")

    def test_05_auto_fix_with_confirmation(self):
        """Test the auto-fix endpoint with confirmation (/api/system-health/fix)"""
        print("\n=== Testing Auto-Fix Endpoint With Confirmation ===")
        
        # First, get the system health to find an issue to fix
        health_url = f"{API_URL}/system-health"
        health_response = requests.get(health_url)
        health_data = health_response.json()
        
        # Check if there are any issues
        if not health_data.get("issues"):
            print("No issues found to test auto-fix. Skipping test.")
            return
        
        # Get the first auto-fixable issue
        auto_fixable_issues = [issue for issue in health_data["issues"] if issue.get("auto_fixable")]
        if not auto_fixable_issues:
            print("No auto-fixable issues found. Skipping test.")
            return
        
        issue_id = auto_fixable_issues[0]["id"]
        print(f"Found auto-fixable issue with ID: {issue_id}")
        
        # Test with confirmation
        url = f"{API_URL}/system-health/fix"
        payload = {
            "issue_id": issue_id,
            "confirm_fix": True
        }
        
        response = requests.post(url, json=payload)
        print(f"Auto-Fix With Confirmation Response Status: {response.status_code}")
        
        # If the issue doesn't exist anymore (was fixed by another test), we might get a 404
        if response.status_code == 404:
            print("Issue not found (may have been fixed by another test). Skipping validation.")
            return
        
        self.assertEqual(response.status_code, 200, f"Expected status code 200, got {response.status_code}")
        
        data = response.json()
        print(f"Auto-Fix With Confirmation Response: {json.dumps(data, indent=2)}")
        
        # Verify response structure for successful fix
        self.assertIn("success", data, "Response missing 'success' field")
        self.assertIn("issue_id", data, "Response missing 'issue_id' field")
        
        if data["success"]:
            self.assertIn("fix_applied", data, "Response missing 'fix_applied' field")
            self.assertIn("result", data, "Response missing 'result' field")
            self.assertIn("message", data, "Response missing 'message' field")
        else:
            self.assertIn("error", data, "Response missing 'error' field")
        
        print("✅ Auto-fix endpoint with confirmation is working correctly")

    def test_06_auto_fix_invalid_issue(self):
        """Test the auto-fix endpoint with an invalid issue ID"""
        print("\n=== Testing Auto-Fix Endpoint With Invalid Issue ID ===")
        
        url = f"{API_URL}/system-health/fix"
        payload = {
            "issue_id": str(uuid.uuid4()),  # Random UUID that doesn't exist
            "confirm_fix": True
        }
        
        response = requests.post(url, json=payload)
        print(f"Auto-Fix Invalid Issue Response Status: {response.status_code}")
        
        self.assertEqual(response.status_code, 404, f"Expected status code 404, got {response.status_code}")
        
        data = response.json()
        print(f"Auto-Fix Invalid Issue Response: {json.dumps(data, indent=2)}")
        
        # Verify error response
        self.assertIn("detail", data, "Response missing 'detail' field")
        self.assertEqual(data["detail"], "Issue not found", 
                        f"Expected detail 'Issue not found', got '{data['detail']}'")
        
        print("✅ Auto-fix endpoint correctly handles invalid issue IDs")

    def test_07_error_handling(self):
        """Test error handling in the health monitoring endpoints"""
        print("\n=== Testing Error Handling in Health Monitoring Endpoints ===")
        
        # Test invalid endpoint
        url = f"{API_URL}/system-health/invalid-endpoint"
        response = requests.get(url)
        print(f"Invalid Endpoint Response Status: {response.status_code}")
        
        self.assertEqual(response.status_code, 404, f"Expected status code 404, got {response.status_code}")
        
        # Test invalid method
        url = f"{API_URL}/health"
        response = requests.post(url)
        print(f"Invalid Method Response Status: {response.status_code}")
        
        self.assertEqual(response.status_code, 405, f"Expected status code 405, got {response.status_code}")
        
        print("✅ Error handling in health monitoring endpoints is working correctly")

def run_all_tests():
    """Run all health monitoring tests"""
    test_cases = [
        HealthMonitoringTest('test_01_basic_health_check'),
        HealthMonitoringTest('test_02_comprehensive_system_health'),
        HealthMonitoringTest('test_03_health_metrics'),
        HealthMonitoringTest('test_04_auto_fix_without_confirmation'),
        HealthMonitoringTest('test_05_auto_fix_with_confirmation'),
        HealthMonitoringTest('test_06_auto_fix_invalid_issue'),
        HealthMonitoringTest('test_07_error_handling')
    ]
    
    results = []
    for test_case in test_cases:
        test_name = test_case._testMethodName
        print(f"\n{'='*40}\nRunning {test_name}\n{'='*40}")
        try:
            test_case.setUp()
            getattr(test_case, test_name)()
            results.append((test_name, True, None))
            print(f"✅ {test_name} PASSED")
        except Exception as e:
            results.append((test_name, False, str(e)))
            print(f"❌ {test_name} FAILED: {str(e)}")
            traceback.print_exc()
    
    # Print summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY:")
    
    all_passed = True
    for name, passed, error in results:
        status = "✅ PASSED" if passed else f"❌ FAILED: {error}"
        print(f"{name}: {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\n✅ ALL TESTS PASSED")
        return 0
    else:
        print("\n❌ SOME TESTS FAILED")
        return 1

if __name__ == "__main__":
    print("=" * 80)
    print(f"CHATPDF HEALTH MONITORING TEST SUITE")
    print(f"Backend URL: {API_URL}")
    print("=" * 80)
    
    exit_code = run_all_tests()
    exit(exit_code)