import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance
const apiClient = axios.create({
  baseURL: API,
});

// Markdown renderer component with custom styling for dark theme
const MarkdownRenderer = ({ content, messageType = 'assistant' }) => {
  const isDark = messageType === 'assistant';
  
  return (
    <div className={`markdown-content rounded-lg p-4 my-2 ${
      isDark 
        ? 'bg-black/40 border border-green-400/20' 
        : 'bg-black/20 border border-green-400/30'
    }`}>
      <ReactMarkdown
        components={{
          // Custom styling for different markdown elements
          p: ({ children }) => (
            <p className={`mb-3 leading-relaxed font-['Inter','system-ui',sans-serif] ${
              isDark ? 'text-gray-200' : 'text-white'
            }`}>
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className={`font-semibold font-['Inter','system-ui',sans-serif] ${
              isDark ? 'text-green-400' : 'text-green-300'
            }`}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={`italic font-['Inter','system-ui',sans-serif] ${
              isDark ? 'text-gray-300' : 'text-gray-100'
            }`}>
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-3 mb-4 pl-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-3 mb-4 pl-0 list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={`flex items-start space-x-3 py-3 px-4 rounded-md border shadow-sm ${
              isDark 
                ? 'bg-black/60 border-green-400/30' 
                : 'bg-black/40 border-green-400/40'
            }`}>
              <span className="text-green-400 font-bold text-sm mt-0.5 flex-shrink-0">•</span>
              <span className={`flex-1 font-['Inter','system-ui',sans-serif] leading-relaxed ${
                isDark ? 'text-gray-200' : 'text-white'
              }`}>
                {children}
              </span>
            </li>
          ),
          h1: ({ children }) => (
            <h1 className={`text-2xl font-bold mb-4 font-['Inter','system-ui',sans-serif] border-b pb-2 ${
              isDark 
                ? 'text-green-400 border-green-400/30' 
                : 'text-green-300 border-green-300/30'
            }`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-xl font-semibold mb-3 font-['Inter','system-ui',sans-serif] ${
              isDark ? 'text-green-400' : 'text-green-300'
            }`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-lg font-medium mb-2 font-['Inter','system-ui',sans-serif] ${
              isDark ? 'text-green-400' : 'text-green-300'
            }`}>
              {children}
            </h3>
          ),
          code: ({ inline, children }) => (
            inline ? (
              <code className={`px-2 py-1 rounded text-sm font-mono ${
                isDark 
                  ? 'bg-black/80 text-green-400 border border-green-400/20' 
                  : 'bg-black/60 text-green-300 border border-green-300/20'
              }`}>
                {children}
              </code>
            ) : (
              <pre className={`p-4 rounded-lg overflow-x-auto mb-4 ${
                isDark 
                  ? 'bg-black/80 border border-green-400/20' 
                  : 'bg-black/60 border border-green-300/20'
              }`}>
                <code className={`font-mono text-sm ${
                  isDark ? 'text-green-400' : 'text-green-300'
                }`}>{children}</code>
              </pre>
            )
          ),
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 pl-4 py-2 rounded-r-lg mb-4 italic ${
              isDark 
                ? 'border-green-400 bg-green-400/10 text-gray-300' 
                : 'border-green-300 bg-green-300/10 text-gray-200'
            }`}>
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [currentFeature, setCurrentFeature] = useState('chat');

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900">
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
    <div className="min-h-screen flex flex-col grid-background" style={{background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a1a1a 50%, #003d20 100%)'}}>
      {/* Header */}
      <header className="p-6 relative z-10">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-black">🤖</span>
            </div>
            <h1 className="font-display text-primary">Baloch AI chat PdF & GPT</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-primary mb-8 leading-tight">
            Transform Your PDFs into 
            <span className="text-green-300 block mt-2"> Interactive Conversations</span>
          </h2>
          
          <div className="content-spacing">
            <p className="font-body-lg text-secondary mb-4 leading-relaxed max-w-3xl">
              Upload any PDF document and unlock the power of AI-driven conversations.
            </p>
            <ul className="bullet-list max-w-2xl font-body text-secondary">
              <li>Ask intelligent questions about your documents</li>
              <li>Generate comprehensive Q&As automatically</li>
              <li>Get detailed summaries and research insights</li>
              <li>All powered by advanced AI models</li>
            </ul>
          </div>

          {/* Feature Cards with Enhanced Styling */}
          <div className="feature-cards-container mb-12 p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCardEnhanced
                icon="💬"
                title="AI Chat"
                description="Interactive conversations with your PDF documents using advanced AI models"
              />
              <FeatureCardEnhanced
                icon="❓"
                title="Auto Q&A"
                description="Generate comprehensive question-answer pairs automatically from any document"
              />
              <FeatureCardEnhanced
                icon="🤖"
                title="General AI"
                description="Access powerful AI assistance beyond your documents for any query"
              />
              <FeatureCardEnhanced
                icon="📊"
                title="Research & Analysis"
                description="Detailed document analysis with insights and comprehensive summaries"
              />
              <FeatureCardEnhanced
                icon="🎤"
                title="Voice Input"
                description="Ask questions using natural voice commands with speech recognition"
              />
              <FeatureCardEnhanced
                icon="🔍"
                title="Advanced Search"
                description="Search across all documents and conversations with intelligent results"
              />
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setCurrentView('app')}
            className="bg-gradient-to-r from-green-400 to-green-600 text-black px-12 py-4 rounded-full btn-text-xl hover:from-green-300 hover:to-green-500 transform hover:scale-105 transition-all duration-300 shadow-2xl relative z-10 font-bold"
          >
            Start Chatting with Your PDFs
          </button>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 text-center relative z-10">
            <div>
              <div className="font-heading-lg text-primary">8</div>
              <div className="font-body-sm text-secondary">AI Features Available</div>
            </div>
            <div>
              <div className="font-heading-lg text-primary">100%</div>
              <div className="font-body-sm text-secondary">Free to Use</div>
            </div>
            <div>
              <div className="font-heading-lg text-primary">∞</div>
              <div className="font-body-sm text-secondary">PDF Uploads</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center font-body-sm text-secondary relative z-10">
        <p>This project is developed BY SHAYAK SIRAJ & AHMED ❤️</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-black/80 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-black/90 transition-all duration-300 border border-green-400/30">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-green-100 text-sm">{description}</p>
    </div>
  );
};

const FeatureCardEnhanced = ({ icon, title, description, isNew = false }) => {
  return (
    <div className="feature-card-enhanced rounded-xl text-white group">
      {isNew && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-600 text-black text-xs px-2 py-1 rounded-full font-medium">
          NEW
        </div>
      )}
      <div className="feature-card-icon group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="feature-card-title group-hover:text-green-300 transition-colors duration-300">
        {title}
      </h3>
      <p className="feature-card-description group-hover:opacity-100 transition-opacity duration-300">
        {description}
      </p>
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
  const [voiceLanguage, setVoiceLanguage] = useState('ur-PK'); // Default to Urdu
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Helper function to create valid message objects
  const createMessage = (role, content, featureType = 'chat', timestamp = null) => {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      role: role || 'assistant',
      content: content || '',
      timestamp: timestamp || new Date().toISOString(),
      feature_type: featureType || 'chat'
    };
  };

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
      recognitionRef.current.lang = 'ur-PK'; // Set to Urdu (Pakistan) as default

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
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access to use voice input.');
        } else if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        } else {
          alert('Speech recognition error: ' + event.error);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
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
      
      // Filter out any invalid messages
      const validMessages = (response.data || []).filter(message => 
        message && 
        typeof message === 'object' && 
        message.role && 
        (message.content !== undefined && message.content !== null)
      );
      
      setMessages(validMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]); // Set empty array on error
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

      setMessages(prev => [...prev, createMessage(
        'system',
        `📄 PDF "${response.data.filename}" uploaded successfully! You can now use all features with this document.`,
        'system'
      )]);

    } catch (error) {
      alert('Error uploading PDF: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || loading) return;

    const userMessage = createMessage('user', inputMessage, currentFeature);

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

      // Ensure AI response has valid structure
      const aiResponse = response.data.ai_response;
      if (aiResponse && aiResponse.role && aiResponse.content !== undefined) {
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Fallback with valid structure
        setMessages(prev => [...prev, createMessage(
          'assistant',
          aiResponse?.content || 'Response received but content is missing.',
          currentFeature
        )]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, createMessage(
        'assistant',
        'Sorry, I encountered an error. Please try again.',
        currentFeature
      )]);
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
    <div className="h-screen flex" style={{background: '#000000'}}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} text-white transition-all duration-300 flex flex-col border-r border-green-400/30`} style={{background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)'}}>
        <div className="p-4 border-b border-green-400/30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentView('home')}
              className={`${sidebarOpen ? 'block' : 'hidden'} font-heading-sm text-green-400 hover:text-green-300 transition-colors`}
            >
              ← Baloch AI chat PdF & GPT
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-green-400/20 rounded text-green-400"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
          {sidebarOpen && (
            <button
              onClick={createNewSession}
              className="w-full mt-4 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black py-2 px-4 rounded btn-text transition-colors font-semibold"
            >
              + New Chat
            </button>
          )}
        </div>

        {sidebarOpen && (
          <>
            {/* Feature Tabs */}
            <div className="p-4 border-b border-green-400/30">
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
                    className={`p-3 rounded cursor-pointer group hover:bg-green-400/20 transition-colors border border-transparent hover:border-green-400/30 ${
                      currentSession?.id === session.id ? 'bg-green-400/20 border-green-400/30' : ''
                    }`}
                    onClick={() => selectSession(session)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-ui text-primary truncate">{session.title}</div>
                        {session.pdf_filename && (
                          <div className="font-caption text-quaternary truncate">📄 {session.pdf_filename}</div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 font-ui-sm transition-opacity"
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
      <div className="flex-1 flex flex-col" style={{background: '#000000'}}>
        {currentSession ? (
          <>
            {/* Chat Header - Enhanced Layout */}
            <div className="border-b border-green-400/30 p-4 space-y-4" style={{background: '#0a0a0a'}}>
              {/* Title Row */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading-md text-primary">{getFeatureTitle()}</h2>
                  {currentSession.pdf_filename && (
                    <div className="font-body-sm text-quaternary mt-1 flex items-center">
                      <span className="status-badge status-badge-info mr-2">PDF</span>
                      <span className="text-secondary font-medium">{currentSession.pdf_filename}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {/* AI Model Selection */}
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-black border border-green-400/30 rounded-lg px-4 py-2 font-ui text-primary hover:bg-green-400/10 focus:ring-2 focus:ring-green-400 transition-all"
                  >
                    {models.map(model => (
                      <option key={model.id} value={model.id} className="bg-black">
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
                  <h4 className="ui-label">📁 File Actions</h4>
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
                      className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black px-4 py-2 rounded-lg btn-text disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                    >
                      {uploading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                  <h4 className="ui-label">🔍 Discovery</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowSearch(!showSearch)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-black px-4 py-2 rounded-lg btn-text transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                    >
                      🔍 Search
                    </button>
                  </div>
                </div>
              </div>

              {/* Feature-Specific Actions */}
              {(currentFeature === 'qa_generation' || currentFeature === 'research') && (
                <div className="border-t border-green-400/30 pt-4">
                  <div className="flex flex-wrap gap-3">
                    {currentFeature === 'qa_generation' && (
                      <button
                        onClick={generateQA}
                        disabled={generatingQA || !currentSession.pdf_filename}
                        className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black px-6 py-2 rounded-lg btn-text disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                      >
                        {generatingQA ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                          className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black px-6 py-2 rounded-lg btn-text disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                        >
                          {researching ? 'Processing...' : '📋 Summarize'}
                        </button>
                        <button
                          onClick={() => conductResearch('detailed_research')}
                          disabled={researching || !currentSession.pdf_filename}
                          className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-black px-6 py-2 rounded-lg btn-text disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
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
              <div className="mt-4 bg-gradient-to-r from-black to-green-900/20 rounded-xl p-6 border border-green-400/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search across all PDFs and conversations..."
                      className="w-full pl-10 pr-4 py-3 bg-black border border-green-400/30 rounded-lg text-primary placeholder-quaternary focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all font-body"
                      onKeyPress={(e) => e.key === 'Enter' && searchContent()}
                    />
                  </div>
                  <button
                    onClick={searchContent}
                    className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black px-6 py-3 rounded-lg btn-text transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                  >
                    Search
                  </button>
                  <button
                    onClick={() => setShowSearch(false)}
                    className="text-green-400 hover:text-green-300 p-2"
                  >
                    ✕
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div key={index} className="bg-black rounded-lg p-4 border border-green-400/30">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full font-ui-sm ${
                            result.type === 'pdf' 
                              ? 'bg-green-400 text-black' 
                              : 'bg-green-500 text-black'
                          }`}>
                            {result.type === 'pdf' ? '📄 PDF' : '💬 Chat'}
                          </span>
                          {result.timestamp && (
                            <span className="font-caption text-muted">
                              {new Date(result.timestamp).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {result.type === 'pdf' ? (
                          <div>
                            <div className="font-ui text-primary mb-1">{result.filename}</div>
                            <div className="font-body-sm text-secondary">{result.snippet}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-ui text-primary mb-1">{result.session_title}</div>
                            <div className="font-body-sm text-secondary">
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
                <div className="flex items-center justify-center h-full text-quaternary">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="font-heading-sm text-primary mb-2">Ready to Chat!</h3>
                    <p className="font-body text-secondary">
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
                messages.filter(message => message && message.role && message.content).map((message, index) => (
                  <div key={message.id || index} className="message-bubble">
                    <div className={`p-4 rounded-lg shadow-lg max-w-4xl ${
                      message.role === 'user' 
                        ? 'ml-auto bg-gradient-to-r from-green-400 to-green-600 text-black message-user'
                        : message.role === 'system'
                        ? 'mr-auto bg-gradient-to-r from-green-500 to-green-700 text-black message-system'
                        : 'bg-black text-white border border-green-400/30 message-assistant'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {message.role === 'user' ? (
                            <div className="w-8 h-8 bg-black bg-opacity-20 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-green-400">You</span>
                            </div>
                          ) : message.role === 'system' ? (
                            <div className="w-8 h-8 bg-black bg-opacity-20 rounded-full flex items-center justify-center">
                              <span className="text-sm">🔧</span>
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                              <span className="text-sm text-black">🤖</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-ui text-primary">
                              {message.role === 'user' ? 'You' : message.role === 'system' ? 'System' : 'AI Assistant'}
                            </span>
                            {message.feature_type && message.feature_type !== 'chat' && (
                              <span className="bg-green-400 bg-opacity-20 px-2 py-1 rounded-full font-ui-sm text-green-400">
                                {message.feature_type.replace('_', ' ').toUpperCase()}
                              </span>
                            )}
                            <span className="font-caption text-muted">
                              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                            </span>
                          </div>
                          <div className="message-content leading-relaxed">
                            {/* Check if content contains markdown syntax */}
                            {message.content && (
                              message.content.includes('**') || 
                              message.content.includes('*') || 
                              message.content.includes('#') ||
                              message.content.includes('-') ||
                              message.content.includes('1.') ||
                              message.content.includes('\n\n')
                            ) ? (
                              <MarkdownRenderer 
                                content={message.content} 
                                messageType={message.role}
                              />
                            ) : (
                              <span className="font-['Inter','system-ui',sans-serif] text-white whitespace-pre-wrap">
                                {message.content || ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start message-bubble">
                  <div className="bg-black text-white border border-green-400/30 rounded-lg p-4 shadow-lg max-w-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                        <span className="text-sm text-black">🤖</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div className="border-t border-green-400/30 p-4" style={{background: '#0a0a0a'}}>
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={getPlaceholder()}
                    disabled={loading || (currentFeature !== 'general_ai' && !currentSession?.pdf_filename)}
                    className="w-full bg-black border border-green-400/30 rounded-lg px-4 py-3 text-primary placeholder-quaternary resize-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:opacity-50 transition-all font-body"
                    rows={inputMessage.split('\n').length || 1}
                    style={{minHeight: '52px', maxHeight: '120px'}}
                  />
                  {recognitionRef.current && (currentFeature === 'chat' || currentFeature === 'general_ai') && (
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`absolute right-3 top-3 p-2 rounded-lg transition-all font-ui-sm ${
                        isListening 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-400/20 hover:bg-green-400/30 text-green-400'
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
                  className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black px-6 py-3 rounded-lg btn-text disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2 font-semibold"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
              <h3 className="text-xl font-medium mb-2 text-green-400">No chat selected</h3>
              <p className="text-secondary">Create a new chat or select an existing one to get started.</p>
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
      className={`w-full text-left px-3 py-2 rounded transition-colors font-ui ${
        isActive 
          ? 'bg-gradient-to-r from-green-400 to-green-600 text-black font-semibold' 
          : 'text-secondary hover:bg-green-400/20 hover:text-primary'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {name}
    </button>
  );
};

export default App;