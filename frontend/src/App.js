import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance
const apiClient = axios.create({
  baseURL: API,
});

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [currentFeature, setCurrentFeature] = useState('chat');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {currentView === 'home' && <HomePage setCurrentView={setCurrentView} />}
      {currentView === 'app' && (
        <ChatInterface 
          currentFeature={currentFeature} 
          setCurrentFeature={setCurrentFeature}
          setCurrentView={setCurrentView}
        />
      )}
    </div>
  );
};

const HomePage = ({ setCurrentView }) => {
  return (
    <div className="min-h-screen flex flex-col grid-background">
      {/* Header */}
      <header className="p-6 relative z-10">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <img 
              src="https://images.unsplash.com/photo-1657114162943-04988ff671d9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwZG9jdW1lbnQlMjBsb2dvfGVufDB8fHx8MTc0OTE2MzUxNXww" 
              alt="ChatPDF Logo" 
              className="w-12 h-12 rounded-lg object-cover"
            />
            <h1 className="text-4xl font-bold text-white">ChatPDF</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold text-white mb-6 leading-tight">
            Transform Your PDFs into 
            <span className="text-purple-300"> Interactive Conversations</span>
          </h2>
          
          <p className="text-xl text-purple-100 mb-12 leading-relaxed">
            Upload any PDF document and unlock the power of AI-driven conversations. 
            Ask questions, generate Q&As, get summaries, and conduct detailed research - all powered by advanced AI models.
          </p>

          {/* Feature Cards with Enhanced Styling */}
          <div className="feature-cards-container mb-12 p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCardEnhanced
                icon="💬"
                title="AI Chat"
                description="Have intelligent conversations about your PDF content"
              />
              <FeatureCardEnhanced
                icon="❓"
                title="Auto Q&A"
                description="Generate 15 comprehensive questions and answers automatically"
              />
              <FeatureCardEnhanced
                icon="🤖"
                title="General AI"
                description="Ask anything beyond your PDF with our AI assistant"
              />
              <FeatureCardEnhanced
                icon="📊"
                title="Research & Summary"
                description="Get detailed analysis and comprehensive summaries"
              />
            </div>
          </div>

          {/* New Features Preview */}
          <div className="feature-cards-container mb-12 p-6">
            <h3 className="text-2xl font-bold text-white mb-6">✨ New Features Coming Soon</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FeatureCardEnhanced
                icon="🎨"
                title="PDF Annotations"
                description="Highlight and annotate important sections"
                isNew={true}
              />
              <FeatureCardEnhanced
                icon="🔄"
                title="Multi-PDF Comparison"
                description="Compare content between multiple documents"
                isNew={true}
              />
              <FeatureCardEnhanced
                icon="📄"
                title="Export Conversations"
                description="Export chats to PDF, Word, or TXT files"
                isNew={true}
              />
              <FeatureCardEnhanced
                icon="🎤"
                title="Voice Input"
                description="Ask questions using voice commands"
                isNew={true}
              />
              <FeatureCardEnhanced
                icon="🌐"
                title="AI Translation"
                description="Translate PDF content to any language"
                isNew={true}
              />
              <FeatureCardEnhanced
                icon="🔍"
                title="Advanced Search"
                description="Search across all your PDFs and conversations"
                isNew={true}
              />
              <FeatureCardEnhanced
                icon="📈"
                title="Insights Dashboard"
                description="Analytics on your reading patterns and insights"
                isNew={true}
              />
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setCurrentView('app')}
            className="bg-white text-purple-900 px-12 py-4 rounded-full text-xl font-semibold hover:bg-purple-100 transform hover:scale-105 transition-all duration-300 shadow-2xl relative z-10"
          >
            Start Chatting with Your PDFs
          </button>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 text-center relative z-10">
            <div>
              <div className="text-3xl font-bold text-white">11</div>
              <div className="text-purple-200">AI Features Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-purple-200">Free to Use</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">∞</div>
              <div className="text-purple-200">PDF Uploads</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-purple-200 relative z-10">
        <p>Powered by OpenRouter AI • Built with ❤️ for PDF enthusiasts</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-white/20 transition-all duration-300 border border-white/20">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-purple-100 text-sm">{description}</p>
    </div>
  );
};

const ChatInterface = ({ currentFeature, setCurrentFeature, setCurrentView }) => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('meta-llama/llama-3.1-8b-instruct:free');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [generatingQA, setGeneratingQA] = useState(false);
  const [researching, setResearching] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSessions();
    loadModels();
  }, []);

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id, currentFeature);
    }
  }, [currentSession, currentFeature]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
      const response = await apiClient.get('/sessions');
      setSessions(response.data);
      if (response.data.length === 0) {
        createNewSession();
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadModels = async () => {
    try {
      const response = await apiClient.get('/models');
      setModels(response.data.models);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const loadMessages = async (sessionId, featureType = null) => {
    try {
      const params = featureType && featureType !== 'chat' ? { feature_type: featureType } : {};
      const response = await apiClient.get(`/sessions/${sessionId}/messages`, { params });
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await apiClient.post('/sessions', { title: 'New Chat' });
      const newSession = response.data;
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const selectSession = (session) => {
    setCurrentSession(session);
  };

  const deleteSession = async (sessionId) => {
    try {
      await apiClient.delete(`/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSession(remainingSessions[0]);
        } else {
          setCurrentSession(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const uploadPDF = async (file) => {
    if (!currentSession) {
      alert('Please create a session first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post(`/sessions/${currentSession.id}/upload-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setCurrentSession(prev => ({
        ...prev,
        pdf_filename: response.data.filename
      }));

      setSessions(prev => prev.map(s => 
        s.id === currentSession.id 
          ? { ...s, pdf_filename: response.data.filename }
          : s
      ));

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: `📄 PDF "${response.data.filename}" uploaded successfully! You can now use all features with this document.`,
        timestamp: new Date().toISOString(),
        feature_type: 'system'
      }]);

    } catch (error) {
      alert('Error uploading PDF: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      feature_type: currentFeature
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await apiClient.post(`/sessions/${currentSession.id}/messages`, {
        session_id: currentSession.id,
        content: inputMessage,
        model: selectedModel,
        feature_type: currentFeature
      });

      setMessages(prev => [...prev, response.data.ai_response]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        feature_type: currentFeature
      }]);
    } finally {
      setLoading(false);
    }
  };

  const generateQA = async () => {
    if (!currentSession || !currentSession.pdf_filename) {
      alert('Please upload a PDF first');
      return;
    }

    setGeneratingQA(true);
    try {
      const response = await apiClient.post(`/sessions/${currentSession.id}/generate-qa`, {
        session_id: currentSession.id,
        model: selectedModel
      });

      // Switch to Q&A view and load messages
      setCurrentFeature('qa_generation');
      setTimeout(() => loadMessages(currentSession.id, 'qa_generation'), 500);
    } catch (error) {
      alert('Error generating Q&A: ' + (error.response?.data?.detail || error.message));
    } finally {
      setGeneratingQA(false);
    }
  };

  const conductResearch = async (researchType) => {
    if (!currentSession || !currentSession.pdf_filename) {
      alert('Please upload a PDF first');
      return;
    }

    setResearching(true);
    try {
      const response = await apiClient.post(`/sessions/${currentSession.id}/research`, {
        session_id: currentSession.id,
        research_type: researchType,
        model: selectedModel
      });

      // Switch to research view and load messages
      setCurrentFeature('research');
      setTimeout(() => loadMessages(currentSession.id, 'research'), 500);
    } catch (error) {
      alert('Error conducting research: ' + (error.response?.data?.detail || error.message));
    } finally {
      setResearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getFeatureTitle = () => {
    switch (currentFeature) {
      case 'chat': return 'PDF Chat';
      case 'qa_generation': return 'Auto Q&A Generation';
      case 'general_ai': return 'General AI Assistant';
      case 'research': return 'Research & Summary';
      default: return 'Chat';
    }
  };

  const getPlaceholder = () => {
    switch (currentFeature) {
      case 'chat': return currentSession?.pdf_filename 
        ? "Ask a question about your PDF..." 
        : "Upload a PDF to start chatting...";
      case 'general_ai': return "Ask me anything...";
      case 'qa_generation': return "Click 'Generate Q&A' to create questions from your PDF";
      case 'research': return "Click 'Summarize' or 'Detailed Research' to analyze your PDF";
      default: return "Type a message...";
    }
  };

  return (
    <div className="h-screen flex bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-gray-800 text-white transition-all duration-300 flex flex-col border-r border-gray-700`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentView('home')}
              className={`${sidebarOpen ? 'block' : 'hidden'} text-lg font-bold text-purple-300 hover:text-white transition-colors`}
            >
              ← ChatPDF
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
          {sidebarOpen && (
            <button
              onClick={createNewSession}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
            >
              + New Chat
            </button>
          )}
        </div>

        {sidebarOpen && (
          <>
            {/* Feature Tabs */}
            <div className="p-4 border-b border-gray-700">
              <div className="space-y-2">
                <FeatureTab 
                  isActive={currentFeature === 'chat'} 
                  onClick={() => setCurrentFeature('chat')}
                  icon="💬"
                  name="PDF Chat"
                />
                <FeatureTab 
                  isActive={currentFeature === 'qa_generation'} 
                  onClick={() => setCurrentFeature('qa_generation')}
                  icon="❓"
                  name="Auto Q&A"
                />
                <FeatureTab 
                  isActive={currentFeature === 'general_ai'} 
                  onClick={() => setCurrentFeature('general_ai')}
                  icon="🤖"
                  name="General AI"
                />
                <FeatureTab 
                  isActive={currentFeature === 'research'} 
                  onClick={() => setCurrentFeature('research')}
                  icon="📊"
                  name="Research"
                />
              </div>
            </div>

            {/* Sessions */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className={`p-3 rounded cursor-pointer group hover:bg-gray-700 transition-colors ${
                      currentSession?.id === session.id ? 'bg-gray-700' : ''
                    }`}
                    onClick={() => selectSession(session)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium truncate">{session.title}</div>
                        {session.pdf_filename && (
                          <div className="text-xs text-gray-400 truncate">📄 {session.pdf_filename}</div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {currentSession ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{getFeatureTitle()}</h2>
                  {currentSession.pdf_filename && (
                    <div className="text-sm text-gray-400">📄 {currentSession.pdf_filename}</div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        uploadPDF(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors"
                  >
                    {uploading ? 'Uploading...' : '📄 Upload PDF'}
                  </button>
                  
                  {currentFeature === 'qa_generation' && (
                    <button
                      onClick={generateQA}
                      disabled={generatingQA || !currentSession.pdf_filename}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors"
                    >
                      {generatingQA ? 'Generating...' : 'Generate 15 Q&A'}
                    </button>
                  )}
                  
                  {currentFeature === 'research' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => conductResearch('summary')}
                        disabled={researching || !currentSession.pdf_filename}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors"
                      >
                        {researching ? 'Processing...' : 'Summarize'}
                      </button>
                      <button
                        onClick={() => conductResearch('detailed_research')}
                        disabled={researching || !currentSession.pdf_filename}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors"
                      >
                        {researching ? 'Processing...' : 'Detailed Research'}
                      </button>
                    </div>
                  )}
                  
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
                  >
                    {models.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                  <h3 className="text-xl font-medium mb-2">Welcome to {getFeatureTitle()}!</h3>
                  <p>
                    {currentFeature === 'chat' && "Upload a PDF document and start asking questions about it."}
                    {currentFeature === 'qa_generation' && "Upload a PDF and click 'Generate 15 Q&A' to create comprehensive questions and answers."}
                    {currentFeature === 'general_ai' && "Ask me anything! I'm here to help with any questions."}
                    {currentFeature === 'research' && "Upload a PDF and choose 'Summarize' or 'Detailed Research' for comprehensive analysis."}
                  </p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : message.role === 'system'
                          ? 'bg-green-600 text-white border border-green-500'
                          : 'bg-gray-700 text-white border border-gray-600'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-2 opacity-70`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-white p-4 rounded-lg max-w-3xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {(currentFeature === 'chat' || currentFeature === 'general_ai') && (
              <div className="border-t border-gray-700 p-4">
                <div className="flex space-x-4">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={getPlaceholder()}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                    disabled={loading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !inputMessage.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2">No chat selected</h3>
              <p>Create a new chat or select an existing one to get started.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FeatureTab = ({ isActive, onClick, icon, name }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded transition-colors ${
        isActive 
          ? 'bg-purple-600 text-white' 
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {name}
    </button>
  );
};

export default App;
