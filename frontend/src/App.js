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
              src="https://images.unsplash.com/photo-1697577418970-95d99b5a55cf" 
              alt="Baloch AI chat PdF & GPT Logo" 
              className="w-12 h-12 rounded-lg object-cover"
            />
            <h1 className="text-4xl font-bold text-white">Baloch AI chat PdF & GPT</h1>
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

const FeatureCardEnhanced = ({ icon, title, description, isNew = false }) => {
  return (
    <div className="feature-card-enhanced rounded-xl p-6 text-white group">
      {isNew && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          NEW
        </div>
      )}
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-200 transition-colors duration-300">{title}</h3>
      <p className="text-purple-100 text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">{description}</p>
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
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [insights, setInsights] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    loadSessions();
    loadModels();
    initializeSpeechRecognition();
  }, []);

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

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

  const translatePDF = async (targetLanguage) => {
    if (!currentSession || !currentSession.pdf_filename) {
      alert('Please upload a PDF first');
      return;
    }

    setTranslating(true);
    try {
      const response = await apiClient.post(`/sessions/${currentSession.id}/translate`, {
        target_language: targetLanguage,
        content_type: 'summary',
        model: selectedModel
      });

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.data.translation,
        timestamp: new Date().toISOString(),
        feature_type: 'translation'
      }]);
    } catch (error) {
      alert('Error translating PDF: ' + (error.response?.data?.detail || error.message));
    } finally {
      setTranslating(false);
    }
  };

  const comparePDFs = async () => {
    if (selectedSessions.length < 2) {
      alert('Please select at least 2 sessions with PDFs to compare');
      return;
    }

    setComparing(true);
    try {
      const response = await apiClient.post('/compare-pdfs', {
        session_ids: selectedSessions,
        comparison_type: 'content',
        model: selectedModel
      });

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `📊 PDF Comparison Results:\n\n${response.data.comparison_result}`,
        timestamp: new Date().toISOString(),
        feature_type: 'comparison'
      }]);
    } catch (error) {
      alert('Error comparing PDFs: ' + (error.response?.data?.detail || error.message));
    } finally {
      setComparing(false);
    }
  };

  const searchContent = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await apiClient.post('/search', {
        query: searchQuery,
        search_type: 'all',
        limit: 20
      });

      setSearchResults(response.data.results);
      setShowSearch(true);
    } catch (error) {
      alert('Error searching: ' + (error.response?.data?.detail || error.message));
    }
  };

  const loadInsights = async () => {
    try {
      const response = await apiClient.get('/insights/dashboard');
      setInsights(response.data);
      setShowInsights(true);
    } catch (error) {
      alert('Error loading insights: ' + (error.response?.data?.detail || error.message));
    }
  };

  const exportConversation = async (format) => {
    if (!currentSession) return;

    try {
      const response = await apiClient.post(`/sessions/${currentSession.id}/export`, {
        export_format: format,
        include_messages: true,
        feature_type: currentFeature !== 'chat' ? currentFeature : null
      });

      // Create and download file
      const blob = new Blob([response.data.content], { 
        type: response.data.content_type || 'text/plain' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Error exporting conversation: ' + (error.response?.data?.detail || error.message));
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
              ← Baloch AI chat PdF & GPT
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
                <FeatureTab 
                  isActive={currentFeature === 'translation'} 
                  onClick={() => setCurrentFeature('translation')}
                  icon="🌐"
                  name="Translation"
                />
                <FeatureTab 
                  isActive={currentFeature === 'comparison'} 
                  onClick={() => setCurrentFeature('comparison')}
                  icon="🔄"
                  name="Compare PDFs"
                />
                <FeatureTab 
                  isActive={currentFeature === 'annotations'} 
                  onClick={() => setCurrentFeature('annotations')}
                  icon="🎨"
                  name="Annotations"
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
            {/* Chat Header - Enhanced Layout */}
            <div className="bg-gray-800 border-b border-gray-700 p-4 space-y-4">
              {/* Title Row */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{getFeatureTitle()}</h2>
                  {currentSession.pdf_filename && (
                    <div className="text-sm text-gray-400 mt-1 flex items-center">
                      <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs mr-2">PDF</span>
                      {currentSession.pdf_filename}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {/* AI Model Selection */}
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white hover:bg-gray-600 focus:ring-2 focus:ring-purple-500 transition-all"
                  >
                    {models.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* File Management Group */}
                <div className="flex flex-col space-y-2">
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide">File Actions</h4>
                  <div className="flex space-x-2">
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
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      {uploading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </span>
                      ) : (
                        '📄 Upload PDF'
                      )}
                    </button>
                  </div>
                </div>

                {/* Search & Analytics Group */}
                <div className="flex flex-col space-y-2">
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Discovery</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowSearch(!showSearch)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      🔍 Search
                    </button>
                    <button
                      onClick={loadInsights}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      📈 Insights
                    </button>
                  </div>
                </div>

                {/* Export & Translation Group */}
                <div className="flex flex-col space-y-2">
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Export & Translate</h4>
                  <div className="flex space-x-2">
                    {/* Translation */}
                    {currentSession.pdf_filename && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            translatePDF(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 border border-indigo-500 rounded-lg px-3 py-2 text-sm text-white hover:from-indigo-700 hover:to-indigo-800 focus:ring-2 focus:ring-indigo-500 transition-all"
                        disabled={translating}
                      >
                        <option value="">🌐 Translate</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Portuguese">Portuguese</option>
                      </select>
                    )}
                    
                    {/* Export Options */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          exportConversation(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 border border-orange-500 rounded-lg px-3 py-2 text-sm text-white hover:from-orange-700 hover:to-orange-800 focus:ring-2 focus:ring-orange-500 transition-all"
                    >
                      <option value="">📄 Export</option>
                      <option value="txt">Text File</option>
                      <option value="pdf">PDF Document</option>
                      <option value="docx">Word Document</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Feature-Specific Actions */}
              {(currentFeature === 'qa_generation' || currentFeature === 'research') && (
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex flex-wrap gap-3">
                    {currentFeature === 'qa_generation' && (
                      <button
                        onClick={generateQA}
                        disabled={generatingQA || !currentSession.pdf_filename}
                        className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        {generatingQA ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating Q&A...
                          </span>
                        ) : (
                          '❓ Generate 15 Q&A'
                        )}
                      </button>
                    )}
                    
                    {currentFeature === 'research' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => conductResearch('summary')}
                          disabled={researching || !currentSession.pdf_filename}
                          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                          {researching ? 'Processing...' : '📋 Summarize'}
                        </button>
                        <button
                          onClick={() => conductResearch('detailed_research')}
                          disabled={researching || !currentSession.pdf_filename}
                          className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                          {researching ? 'Processing...' : '🔬 Detailed Research'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Search Interface */}
            {showSearch && (
              <div className="mt-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search across all PDFs and conversations..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      onKeyPress={(e) => e.key === 'Enter' && searchContent()}
                    />
                  </div>
                  <button
                    onClick={searchContent}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Search
                  </button>
                  <button
                    onClick={() => setShowSearch(false)}
                    className="text-gray-400 hover:text-white p-2"
                  >
                    ✕
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.type === 'pdf' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-green-600 text-white'
                          }`}>
                            {result.type === 'pdf' ? '📄 PDF' : '💬 Chat'}
                          </span>
                          {result.timestamp && (
                            <span className="text-xs text-gray-400">
                              {new Date(result.timestamp).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {result.type === 'pdf' ? (
                          <div>
                            <div className="font-medium text-white mb-1">{result.filename}</div>
                            <div className="text-sm text-gray-300">{result.snippet}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-white mb-1">{result.session_title}</div>
                            <div className="text-sm text-gray-300">
                              <span className="font-medium">{result.role === 'user' ? 'You' : 'AI'}:</span> {result.content}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-medium mb-2">Ready to Chat!</h3>
                    <p className="text-gray-500">
                      {currentFeature === 'general_ai' 
                        ? "Ask me anything, or upload a PDF to get started with document analysis."
                        : currentSession?.pdf_filename 
                          ? "Your PDF is loaded. Ask questions or use the features above!"
                          : "Upload a PDF document to start chatting with your content."
                      }
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={message.id || index} className="message-bubble">
                    <div className={`p-4 rounded-lg shadow-lg max-w-4xl ${
                      message.role === 'user' 
                        ? 'ml-auto bg-gradient-to-r from-purple-600 to-purple-700 text-white message-user'
                        : message.role === 'system'
                        ? 'mr-auto bg-gradient-to-r from-green-600 to-green-700 text-white message-system'
                        : 'bg-gray-700 text-white border border-gray-600 message-assistant'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {message.role === 'user' ? (
                            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold">You</span>
                            </div>
                          ) : message.role === 'system' ? (
                            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                              <span className="text-sm">🔧</span>
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-sm">🤖</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">
                              {message.role === 'user' ? 'You' : message.role === 'system' ? 'System' : 'AI Assistant'}
                            </span>
                            {message.feature_type && message.feature_type !== 'chat' && (
                              <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                                {message.feature_type.replace('_', ' ').toUpperCase()}
                              </span>
                            )}
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start message-bubble">
                  <div className="bg-gray-700 text-white border border-gray-600 rounded-lg p-4 shadow-lg max-w-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm">🤖</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div className="border-t border-gray-700 p-4 bg-gray-800">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={getPlaceholder()}
                    disabled={loading || (currentFeature !== 'general_ai' && !currentSession?.pdf_filename)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 transition-all"
                    rows={inputMessage.split('\n').length || 1}
                    style={{minHeight: '52px', maxHeight: '120px'}}
                  />
                  {recognitionRef.current && (currentFeature === 'chat' || currentFeature === 'general_ai') && (
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`absolute right-3 top-3 p-2 rounded-lg transition-all ${
                        isListening 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      }`}
                      disabled={loading}
                    >
                      {isListening ? '🛑 Stop' : '🎤 Voice'}
                    </button>
                  )}
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || loading || (currentFeature !== 'general_ai' && !currentSession?.pdf_filename)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <span>↗</span>
                    </>
                  )}
                </button>
              </div>
            </div>

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
      
      {/* Insights Modal */}
      {showInsights && insights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">📈 Insights Dashboard</h2>
              <button
                onClick={() => setShowInsights(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{insights.overview.total_sessions}</div>
                <div className="text-gray-400">Total Sessions</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{insights.overview.total_pdfs}</div>
                <div className="text-gray-400">PDFs Uploaded</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{insights.overview.total_messages}</div>
                <div className="text-gray-400">Messages Sent</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{Math.round(insights.overview.avg_messages_per_session)}</div>
                <div className="text-gray-400">Avg Messages/Session</div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Feature Usage</h3>
                {insights.feature_usage.map((feature, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">{feature._id}</span>
                    <span className="text-white font-medium">{feature.count}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Popular PDFs</h3>
                {insights.popular_pdfs.map((pdf, index) => (
                  <div key={index} className="mb-2">
                    <div className="text-gray-300 text-sm truncate">{pdf._id}</div>
                    <div className="text-white font-medium">{pdf.message_count} messages</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
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