#!/usr/bin/env python3
import requests
import json
import os
import time
import uuid
import unittest
from dotenv import load_dotenv

# Load environment variables from frontend .env file
load_dotenv('/app/frontend/.env')

# Backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL')
if not BACKEND_URL:
    raise ValueError("REACT_APP_BACKEND_URL not found in environment variables")

API_URL = f"{BACKEND_URL}/api"
print(f"Testing backend at: {API_URL}")

class ChatPDFBackendTest(unittest.TestCase):
    def setUp(self):
        # Generate unique email for each test run to avoid conflicts
        self.test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        self.test_password = "TestPassword123!"
        self.access_token = None
        self.user_id = None
        self.session_id = None
        
        print(f"\n=== Using test account: {self.test_email} ===")

    def test_01_register(self):
        """Test user registration endpoint"""
        print("\n=== Testing User Registration ===")
        
        url = f"{API_URL}/auth/register"
        payload = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        response = requests.post(url, json=payload)
        data = response.json()
        
        print(f"Registration Response Status: {response.status_code}")
        print(f"Registration Response: {json.dumps(data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("access_token", data)
        self.assertIn("user", data)
        self.assertIn("id", data["user"])
        self.assertEqual(data["user"]["email"], self.test_email)
        
        # Save token and user_id for subsequent tests
        self.access_token = data["access_token"]
        self.user_id = data["user"]["id"]
        
        print(f"User registered successfully with ID: {self.user_id}")

    def test_02_login(self):
        """Test user login endpoint"""
        print("\n=== Testing User Login ===")
        
        # Make sure we have a registered user
        if not self.access_token:
            self.test_01_register()
            # Add a small delay to ensure database consistency
            time.sleep(1)
        
        url = f"{API_URL}/auth/login"
        payload = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        response = requests.post(url, json=payload)
        data = response.json()
        
        print(f"Login Response Status: {response.status_code}")
        print(f"Login Response: {json.dumps(data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("access_token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], self.test_email)
        
        # Update token for subsequent tests
        self.access_token = data["access_token"]
        
        print("User logged in successfully")

    def test_03_get_current_user(self):
        """Test get current user endpoint"""
        print("\n=== Testing Get Current User ===")
        
        if not self.access_token:
            self.test_01_register()
        
        url = f"{API_URL}/auth/me"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(url, headers=headers)
        data = response.json()
        
        print(f"Get User Response Status: {response.status_code}")
        print(f"Get User Response: {json.dumps(data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["email"], self.test_email)
        
        print("Retrieved user information successfully")

    def test_04_create_session(self):
        """Test creating a chat session"""
        print("\n=== Testing Create Chat Session ===")
        
        if not self.access_token:
            self.test_01_register()
        
        url = f"{API_URL}/sessions"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        payload = {"title": "Test Chat Session"}
        
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()
        
        print(f"Create Session Response Status: {response.status_code}")
        print(f"Create Session Response: {json.dumps(data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("id", data)
        self.assertEqual(data["title"], "Test Chat Session")
        self.assertEqual(data["user_id"], self.user_id)
        
        # Save session_id for subsequent tests
        self.session_id = data["id"]
        
        print(f"Chat session created successfully with ID: {self.session_id}")

    def test_05_get_sessions(self):
        """Test retrieving chat sessions"""
        print("\n=== Testing Get Chat Sessions ===")
        
        if not self.access_token:
            self.test_01_register()
        
        if not self.session_id:
            self.test_04_create_session()
        
        url = f"{API_URL}/sessions"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(url, headers=headers)
        data = response.json()
        
        print(f"Get Sessions Response Status: {response.status_code}")
        print(f"Get Sessions Response: {json.dumps(data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)
        
        # Verify our session is in the list
        session_ids = [session["id"] for session in data]
        self.assertIn(self.session_id, session_ids)
        
        print(f"Retrieved {len(data)} chat sessions successfully")

    def test_06_upload_pdf(self):
        """Test uploading a PDF to a session"""
        print("\n=== Testing PDF Upload ===")
        
        if not self.access_token:
            self.test_01_register()
        
        if not self.session_id:
            self.test_04_create_session()
        
        url = f"{API_URL}/sessions/{self.session_id}/upload-pdf"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Use the sample PDF file created earlier
        pdf_path = "/app/sample.pdf"
        
        with open(pdf_path, "rb") as pdf_file:
            files = {"file": ("sample.pdf", pdf_file, "application/pdf")}
            response = requests.post(url, headers=headers, files=files)
        
        data = response.json()
        
        print(f"Upload PDF Response Status: {response.status_code}")
        print(f"Upload PDF Response: {json.dumps(data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "PDF uploaded successfully")
        self.assertIn("filename", data)
        self.assertIn("content_length", data)
        
        print("PDF uploaded successfully")

    def test_07_get_available_models(self):
        """Test retrieving available AI models"""
        print("\n=== Testing Get Available Models ===")
        
        url = f"{API_URL}/models"
        
        response = requests.get(url)
        data = response.json()
        
        print(f"Get Models Response Status: {response.status_code}")
        print(f"Get Models Response: {json.dumps(data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("models", data)
        self.assertIsInstance(data["models"], list)
        self.assertGreaterEqual(len(data["models"]), 1)
        
        # Verify model structure
        for model in data["models"]:
            self.assertIn("id", model)
            self.assertIn("name", model)
            self.assertIn("provider", model)
            self.assertIn("free", model)
        
        print(f"Retrieved {len(data['models'])} AI models successfully")

    def test_08_send_message(self):
        """Test sending a message to the AI"""
        print("\n=== Testing Send Message to AI ===")
        
        if not self.access_token:
            self.test_01_register()
        
        if not self.session_id:
            self.test_04_create_session()
            self.test_06_upload_pdf()  # Upload PDF for context
        
        url = f"{API_URL}/sessions/{self.session_id}/messages"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "session_id": self.session_id,
            "content": "What is this PDF about?",
            "model": "meta-llama/llama-3.1-8b-instruct:free"
        }
        
        response = requests.post(url, headers=headers, json=payload)
        data = response.json()
        
        print(f"Send Message Response Status: {response.status_code}")
        print(f"Send Message Response: {json.dumps(data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("user_message", data)
        self.assertIn("ai_response", data)
        self.assertEqual(data["user_message"]["content"], "What is this PDF about?")
        self.assertEqual(data["user_message"]["role"], "user")
        self.assertEqual(data["ai_response"]["role"], "assistant")
        self.assertIsNotNone(data["ai_response"]["content"])
        
        print("Message sent to AI and received response successfully")

    def test_09_get_messages(self):
        """Test retrieving messages from a session"""
        print("\n=== Testing Get Messages ===")
        
        if not self.access_token:
            self.test_01_register()
        
        if not self.session_id:
            self.test_04_create_session()
            self.test_08_send_message()  # Send a message first
        
        url = f"{API_URL}/sessions/{self.session_id}/messages"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(url, headers=headers)
        data = response.json()
        
        print(f"Get Messages Response Status: {response.status_code}")
        print(f"Get Messages Response: {json.dumps(data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 2)  # At least user message and AI response
        
        # Verify message structure
        for message in data:
            self.assertIn("id", message)
            self.assertIn("session_id", message)
            self.assertIn("user_id", message)
            self.assertIn("content", message)
            self.assertIn("role", message)
            self.assertIn("timestamp", message)
        
        print(f"Retrieved {len(data)} messages successfully")

    def test_10_delete_session(self):
        """Test deleting a chat session"""
        print("\n=== Testing Delete Session ===")
        
        if not self.access_token:
            self.test_01_register()
        
        if not self.session_id:
            self.test_04_create_session()
        
        url = f"{API_URL}/sessions/{self.session_id}"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.delete(url, headers=headers)
        data = response.json()
        
        print(f"Delete Session Response Status: {response.status_code}")
        print(f"Delete Session Response: {json.dumps(data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Session deleted successfully")
        
        # Verify session is deleted by trying to get it
        get_url = f"{API_URL}/sessions"
        get_response = requests.get(get_url, headers=headers)
        get_data = get_response.json()
        
        session_ids = [session["id"] for session in get_data]
        self.assertNotIn(self.session_id, session_ids)
        
        print("Session deleted successfully")

    def test_11_invalid_token(self):
        """Test authentication with invalid token"""
        print("\n=== Testing Invalid Token ===")
        
        url = f"{API_URL}/auth/me"
        headers = {"Authorization": "Bearer invalid_token"}
        
        response = requests.get(url, headers=headers)
        
        print(f"Invalid Token Response Status: {response.status_code}")
        
        self.assertEqual(response.status_code, 401)
        
        print("Invalid token correctly rejected")

    def test_12_invalid_login(self):
        """Test login with invalid credentials"""
        print("\n=== Testing Invalid Login ===")
        
        url = f"{API_URL}/auth/login"
        payload = {
            "email": f"nonexistent_{uuid.uuid4().hex[:8]}@example.com",
            "password": "WrongPassword123!"
        }
        
        response = requests.post(url, json=payload)
        
        print(f"Invalid Login Response Status: {response.status_code}")
        
        self.assertEqual(response.status_code, 401)
        
        print("Invalid login correctly rejected")

def run_tests():
    # Create a test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add tests in order
    test_cases = [
        ChatPDFBackendTest('test_01_register'),
        ChatPDFBackendTest('test_02_login'),
        ChatPDFBackendTest('test_03_get_current_user'),
        ChatPDFBackendTest('test_04_create_session'),
        ChatPDFBackendTest('test_05_get_sessions'),
        ChatPDFBackendTest('test_06_upload_pdf'),
        ChatPDFBackendTest('test_07_get_available_models'),
        ChatPDFBackendTest('test_08_send_message'),
        ChatPDFBackendTest('test_09_get_messages'),
        ChatPDFBackendTest('test_10_delete_session'),
        ChatPDFBackendTest('test_11_invalid_token'),
        ChatPDFBackendTest('test_12_invalid_login')
    ]
    
    for test_case in test_cases:
        suite.addTest(test_case)
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result

if __name__ == "__main__":
    print("=" * 80)
    print(f"CHATPDF BACKEND TEST SUITE")
    print(f"Backend URL: {API_URL}")
    print("=" * 80)
    
    result = run_tests()
    
    # Print summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY:")
    print(f"Ran {result.testsRun} tests")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.wasSuccessful():
        print("\n✅ ALL TESTS PASSED")
        exit(0)
    else:
        print("\n❌ SOME TESTS FAILED")
        exit(1)
