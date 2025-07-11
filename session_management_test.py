#!/usr/bin/env python3
"""
Focused Session Management Tests for ChatPDF Backend
Tests specifically requested: Session Management, Session API Endpoints, Message Functionality, PDF Upload, General API Health
"""
import requests
import json
import os
import time
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env.development')

# Backend URL configuration
API_URL = "http://localhost:8001/api"

print(f"Testing ChatPDF Session Management at: {API_URL}")

class SessionManagementTest:
    def __init__(self):
        self.test_sessions = []
        self.test_results = {
            "session_creation": False,
            "session_retrieval": False,
            "session_update": False,
            "session_deletion": False,
            "message_storage": False,
            "pdf_upload": False,
            "api_health": False
        }
    
    def cleanup_test_sessions(self):
        """Clean up any test sessions created during testing"""
        for session_id in self.test_sessions:
            try:
                requests.delete(f"{API_URL}/sessions/{session_id}")
            except:
                pass
        self.test_sessions.clear()
    
    def test_api_health(self):
        """Test general API health"""
        print("\n=== Testing General API Health ===")
        
        try:
            # Test health endpoint
            health_response = requests.get(f"{API_URL}/health")
            print(f"Health endpoint status: {health_response.status_code}")
            
            if health_response.status_code == 200:
                health_data = health_response.json()
                print(f"Health response: {json.dumps(health_data, indent=2)}")
                assert health_data["status"] == "healthy"
                print("✅ Health endpoint working correctly")
            
            # Test models endpoint
            models_response = requests.get(f"{API_URL}/models")
            print(f"Models endpoint status: {models_response.status_code}")
            
            if models_response.status_code == 200:
                models_data = models_response.json()
                print(f"Available models: {len(models_data['models'])}")
                assert len(models_data["models"]) >= 7  # Should have Claude + Gemini models
                print("✅ Models endpoint working correctly")
            
            self.test_results["api_health"] = True
            return True
            
        except Exception as e:
            print(f"❌ API Health test failed: {str(e)}")
            return False
    
    def test_session_creation(self):
        """Test creating new sessions"""
        print("\n=== Testing Session Creation ===")
        
        try:
            # Test creating session with default title
            response1 = requests.post(f"{API_URL}/sessions", json={"title": "Test Session 1"})
            print(f"Create session 1 status: {response1.status_code}")
            
            if response1.status_code == 200:
                session1_data = response1.json()
                print(f"Session 1 created: {session1_data['id']}")
                self.test_sessions.append(session1_data["id"])
                
                # Verify session structure
                assert "id" in session1_data
                assert "title" in session1_data
                assert "created_at" in session1_data
                assert "updated_at" in session1_data
                assert session1_data["title"] == "Test Session 1"
                print("✅ Session 1 created with correct structure")
            
            # Test creating session with custom title
            response2 = requests.post(f"{API_URL}/sessions", json={"title": "Custom Session Title"})
            print(f"Create session 2 status: {response2.status_code}")
            
            if response2.status_code == 200:
                session2_data = response2.json()
                print(f"Session 2 created: {session2_data['id']}")
                self.test_sessions.append(session2_data["id"])
                assert session2_data["title"] == "Custom Session Title"
                print("✅ Session 2 created with custom title")
            
            # Test creating session with default title (no title provided)
            response3 = requests.post(f"{API_URL}/sessions", json={})
            print(f"Create session 3 status: {response3.status_code}")
            
            if response3.status_code == 200:
                session3_data = response3.json()
                print(f"Session 3 created: {session3_data['id']}")
                self.test_sessions.append(session3_data["id"])
                assert session3_data["title"] == "New Chat"  # Default title
                print("✅ Session 3 created with default title")
            
            self.test_results["session_creation"] = True
            return True
            
        except Exception as e:
            print(f"❌ Session creation test failed: {str(e)}")
            return False
    
    def test_session_retrieval(self):
        """Test retrieving sessions (GET /api/sessions)"""
        print("\n=== Testing Session Retrieval ===")
        
        try:
            response = requests.get(f"{API_URL}/sessions")
            print(f"Get sessions status: {response.status_code}")
            
            if response.status_code == 200:
                sessions_data = response.json()
                print(f"Retrieved {len(sessions_data)} sessions")
                
                # Verify we can find our test sessions
                session_ids = [session["id"] for session in sessions_data]
                for test_session_id in self.test_sessions:
                    assert test_session_id in session_ids, f"Test session {test_session_id} not found in retrieved sessions"
                
                # Verify session structure
                for session in sessions_data:
                    assert "id" in session
                    assert "title" in session
                    assert "created_at" in session
                    assert "updated_at" in session
                
                print("✅ Session retrieval working correctly")
                self.test_results["session_retrieval"] = True
                return True
            
        except Exception as e:
            print(f"❌ Session retrieval test failed: {str(e)}")
            return False
    
    def test_session_update(self):
        """Test updating session titles (implicit through PDF upload and messages)"""
        print("\n=== Testing Session Update (via PDF upload) ===")
        
        if not self.test_sessions:
            print("❌ No test sessions available for update test")
            return False
        
        try:
            session_id = self.test_sessions[0]
            
            # Create a simple PDF for testing
            pdf_path = "/tmp/test_session_update.pdf"
            from reportlab.pdfgen import canvas
            c = canvas.Canvas(pdf_path)
            c.drawString(100, 750, "Session Update Test PDF")
            c.drawString(100, 700, "This PDF is used to test session updates.")
            c.save()
            
            # Upload PDF to session (this should update the session)
            with open(pdf_path, "rb") as pdf_file:
                files = {"file": ("test_session_update.pdf", pdf_file, "application/pdf")}
                upload_response = requests.post(f"{API_URL}/sessions/{session_id}/upload-pdf", files=files)
            
            print(f"PDF upload status: {upload_response.status_code}")
            
            if upload_response.status_code == 200:
                upload_data = upload_response.json()
                print(f"PDF uploaded: {upload_data['filename']}")
                
                # Verify session was updated
                session_response = requests.get(f"{API_URL}/sessions")
                if session_response.status_code == 200:
                    sessions = session_response.json()
                    updated_session = next((s for s in sessions if s["id"] == session_id), None)
                    
                    if updated_session:
                        assert updated_session["pdf_filename"] == "test_session_update.pdf"
                        assert updated_session["pdf_content"] is not None
                        print("✅ Session updated correctly after PDF upload")
                        self.test_results["session_update"] = True
                        return True
            
            # Clean up
            os.remove(pdf_path)
            
        except Exception as e:
            print(f"❌ Session update test failed: {str(e)}")
            return False
    
    def test_pdf_upload(self):
        """Test PDF upload and session association"""
        print("\n=== Testing PDF Upload and Session Association ===")
        
        if not self.test_sessions:
            print("❌ No test sessions available for PDF upload test")
            return False
        
        try:
            session_id = self.test_sessions[1] if len(self.test_sessions) > 1 else self.test_sessions[0]
            
            # Create a test PDF
            pdf_path = "/tmp/test_pdf_upload.pdf"
            from reportlab.pdfgen import canvas
            c = canvas.Canvas(pdf_path)
            c.drawString(100, 750, "PDF Upload Test Document")
            c.drawString(100, 700, "This document tests PDF upload functionality.")
            c.drawString(100, 650, "It should be properly associated with the session.")
            c.save()
            
            # Test PDF upload
            with open(pdf_path, "rb") as pdf_file:
                files = {"file": ("test_pdf_upload.pdf", pdf_file, "application/pdf")}
                response = requests.post(f"{API_URL}/sessions/{session_id}/upload-pdf", files=files)
            
            print(f"PDF upload status: {response.status_code}")
            
            if response.status_code == 200:
                upload_data = response.json()
                print(f"Upload response: {json.dumps(upload_data, indent=2)}")
                
                # Verify upload response structure
                assert "message" in upload_data
                assert "filename" in upload_data
                assert "content_length" in upload_data
                assert upload_data["filename"] == "test_pdf_upload.pdf"
                assert upload_data["content_length"] > 0
                
                print("✅ PDF upload working correctly")
                self.test_results["pdf_upload"] = True
                
                # Clean up
                os.remove(pdf_path)
                return True
            
        except Exception as e:
            print(f"❌ PDF upload test failed: {str(e)}")
            return False
    
    def test_message_functionality(self):
        """Test sending messages and ensuring they're properly stored"""
        print("\n=== Testing Message Functionality ===")
        
        if not self.test_sessions:
            print("❌ No test sessions available for message test")
            return False
        
        try:
            session_id = self.test_sessions[0]
            
            # Test sending a message (this will fail due to API keys, but we can test storage)
            message_data = {
                "session_id": session_id,
                "content": "This is a test message for session management testing",
                "model": "claude-3-sonnet-20240229",
                "feature_type": "general_ai"
            }
            
            # Send message (expect 500 due to invalid API keys, but message should be stored)
            message_response = requests.post(f"{API_URL}/sessions/{session_id}/messages", json=message_data)
            print(f"Send message status: {message_response.status_code}")
            
            # Even if AI response fails, the user message should be stored
            # Let's check if we can retrieve messages
            messages_response = requests.get(f"{API_URL}/sessions/{session_id}/messages")
            print(f"Get messages status: {messages_response.status_code}")
            
            if messages_response.status_code == 200:
                messages_data = messages_response.json()
                print(f"Retrieved {len(messages_data)} messages")
                
                # Look for our test message
                user_messages = [msg for msg in messages_data if msg["role"] == "user" and "test message for session management" in msg["content"]]
                
                if user_messages:
                    test_message = user_messages[0]
                    print(f"Found test message: {test_message['id']}")
                    
                    # Verify message structure
                    assert "id" in test_message
                    assert "session_id" in test_message
                    assert "content" in test_message
                    assert "role" in test_message
                    assert "timestamp" in test_message
                    assert "feature_type" in test_message
                    
                    assert test_message["session_id"] == session_id
                    assert test_message["role"] == "user"
                    assert test_message["feature_type"] == "general_ai"
                    
                    print("✅ Message storage working correctly")
                    self.test_results["message_storage"] = True
                    return True
                else:
                    print("❌ Test message not found in stored messages")
                    return False
            
        except Exception as e:
            print(f"❌ Message functionality test failed: {str(e)}")
            return False
    
    def test_session_deletion(self):
        """Test deleting sessions and cleanup"""
        print("\n=== Testing Session Deletion ===")
        
        if not self.test_sessions:
            print("❌ No test sessions available for deletion test")
            return False
        
        try:
            # Keep one session for other tests, delete the rest
            sessions_to_delete = self.test_sessions[1:] if len(self.test_sessions) > 1 else []
            
            for session_id in sessions_to_delete:
                print(f"Deleting session: {session_id}")
                
                # Delete session
                delete_response = requests.delete(f"{API_URL}/sessions/{session_id}")
                print(f"Delete session status: {delete_response.status_code}")
                
                if delete_response.status_code == 200:
                    delete_data = delete_response.json()
                    print(f"Delete response: {json.dumps(delete_data, indent=2)}")
                    assert "message" in delete_data
                    assert delete_data["message"] == "Session deleted successfully"
                    
                    # Verify session is actually deleted
                    sessions_response = requests.get(f"{API_URL}/sessions")
                    if sessions_response.status_code == 200:
                        sessions = sessions_response.json()
                        session_ids = [s["id"] for s in sessions]
                        assert session_id not in session_ids, f"Session {session_id} still exists after deletion"
                        print(f"✅ Session {session_id} deleted successfully")
                    
                    # Remove from our tracking list
                    self.test_sessions.remove(session_id)
            
            self.test_results["session_deletion"] = True
            return True
            
        except Exception as e:
            print(f"❌ Session deletion test failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all session management tests"""
        print("=" * 80)
        print("CHATPDF SESSION MANAGEMENT TEST SUITE")
        print("=" * 80)
        
        # Run tests in order
        tests = [
            ("API Health", self.test_api_health),
            ("Session Creation", self.test_session_creation),
            ("Session Retrieval", self.test_session_retrieval),
            ("PDF Upload", self.test_pdf_upload),
            ("Session Update", self.test_session_update),
            ("Message Functionality", self.test_message_functionality),
            ("Session Deletion", self.test_session_deletion),
        ]
        
        results = {}
        
        for test_name, test_func in tests:
            print(f"\n{'='*20} {test_name} {'='*20}")
            try:
                results[test_name] = test_func()
            except Exception as e:
                print(f"❌ {test_name} failed with exception: {str(e)}")
                results[test_name] = False
        
        # Cleanup any remaining test sessions
        self.cleanup_test_sessions()
        
        # Print summary
        print("\n" + "=" * 80)
        print("SESSION MANAGEMENT TEST SUMMARY")
        print("=" * 80)
        
        passed = 0
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{test_name}: {status}")
            if result:
                passed += 1
        
        print(f"\nOverall Result: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 ALL SESSION MANAGEMENT TESTS PASSED!")
            return True
        else:
            print("⚠️  SOME SESSION MANAGEMENT TESTS FAILED")
            return False

if __name__ == "__main__":
    tester = SessionManagementTest()
    success = tester.run_all_tests()
    exit(0 if success else 1)