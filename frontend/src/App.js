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

// Function to detect if content contains markdown syntax
const containsMarkdown = (content) => {
  if (!content) return false;
  
  // Check for various markdown patterns
  const markdownPatterns = [
    /\*\*.*?\*\*/,  // Bold text
    /\*.*?\*/,      // Italic text (not inside bold)
    /^#{1,6}\s/m,   // Headers
    /^[-*+]\s/m,    // Unordered lists
    /^\d+\.\s/m,    // Ordered lists
    /```[\s\S]*?```/, // Code blocks
    /`.*?`/,        // Inline code
    /^\>/m,         // Blockquotes
    /\n\n/,         // Multiple line breaks (paragraph separation)
  ];
  
  return markdownPatterns.some(pattern => pattern.test(content));
};
const MarkdownRenderer = ({ content, messageType = 'assistant' }) => {
  const isDark = messageType === 'assistant';
  
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
          // Custom styling for different markdown elements
          p: ({ children }) => (
            <p className={`mb-4 leading-relaxed font-['Inter','system-ui',sans-serif] ${
              messageType === 'user' ? 'text-gray-200' : 'text-gray-100'
            }`}>
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className={`font-semibold font-['Inter','system-ui',sans-serif] ${
              messageType === 'user' ? 'text-green-300' : 'text-green-400'
            }`}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={`italic font-['Inter','system-ui',sans-serif] ${
              messageType === 'user' ? 'text-gray-300' : 'text-gray-200'
            }`}>
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4 pl-6 list-disc">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-4 pl-6 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={`font-['Inter','system-ui',sans-serif] leading-relaxed ${
              messageType === 'user' ? 'text-gray-200' : 'text-gray-100'
            }`}>
              {children}
            </li>
          ),
          h1: ({ children }) => (
            <h1 className={`text-xl font-bold mb-4 font-['Inter','system-ui',sans-serif] ${
              messageType === 'user' ? 'text-green-300' : 'text-green-400'
            }`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-lg font-semibold mb-3 font-['Inter','system-ui',sans-serif] ${
              messageType === 'user' ? 'text-green-300' : 'text-green-400'
            }`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-base font-medium mb-2 font-['Inter','system-ui',sans-serif] ${
              messageType === 'user' ? 'text-green-300' : 'text-green-400'
            }`}>
              {children}
            </h3>
          ),
          code: ({ inline, children }) => (
            inline ? (
              <code className={`px-2 py-1 rounded text-sm font-mono ${
                messageType === 'user' 
                  ? 'bg-black/30 text-green-300' 
                  : 'bg-gray-800/50 text-green-400'
              }`}>
                {children}
              </code>
            ) : (
              <pre className={`p-4 rounded-lg overflow-x-auto mb-4 ${
                messageType === 'user' 
                  ? 'bg-black/30' 
                  : 'bg-gray-800/50'
              }`}>
                <code className={`font-mono text-sm ${
                  messageType === 'user' ? 'text-green-300' : 'text-green-400'
                }`}>{children}</code>
              </pre>
            )
          ),
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 pl-4 py-2 mb-4 italic ${
              messageType === 'user' 
                ? 'border-green-300 text-gray-300' 
                : 'border-green-400 text-gray-200'
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
      {/* Modern Compact Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} text-white transition-all duration-300 flex flex-col`} style={{background: 'linear-gradient(180deg, #0f1419 0%, #0a0e13 100%)'}}>
        {/* Header Section */}
        <div className="p-4 border-b border-green-400/20">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors font-medium text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center">
                  <span className="text-xs">←</span>
                </div>
                <span>Home</span>
              </button>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 rounded-full bg-green-400/10 hover:bg-green-400/20 flex items-center justify-center text-green-400 transition-all duration-200"
            >
              <span className="text-sm">{sidebarOpen ? '←' : '→'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Modern Circular Design */}
        <div className="flex-1 p-4 space-y-3">
          <div className="space-y-2">
            <ModernNavTab 
              isActive={currentFeature === 'chat'} 
              onClick={() => setCurrentFeature('chat')}
              icon="💬"
              name="Chat"
              isCompact={!sidebarOpen}
            />
            <ModernNavTab 
              isActive={currentFeature === 'qa_generation'} 
              onClick={() => setCurrentFeature('qa_generation')}
              icon="❓"
              name="Auto Q&A"
              isCompact={!sidebarOpen}
            />
            <ModernNavTab 
              isActive={currentFeature === 'general_ai'} 
              onClick={() => setCurrentFeature('general_ai')}
              icon="🤖"
              name="General AI"
              isCompact={!sidebarOpen}
            />
            <ModernNavTab 
              isActive={currentFeature === 'research'} 
              onClick={() => setCurrentFeature('research')}
              icon="📊"
              name="Research"
              isCompact={!sidebarOpen}
            />
          </div>

          {sidebarOpen && (
            <>
              {/* New Chat Button */}
              <div className="pt-4 border-t border-green-400/20">
                <button
                  onClick={createNewSession}
                  className="w-full bg-green-400/10 hover:bg-green-400/20 border border-green-400/30 hover:border-green-400/50 text-green-400 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span className="text-lg">+</span>
                  <span>New Chat</span>
                </button>
              </div>

              {/* Sessions List */}
              <div className="pt-4">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-2">Sessions</div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-xl cursor-pointer group transition-all duration-200 ${
                        currentSession?.id === session.id 
                          ? 'bg-green-400/15 border border-green-400/30' 
                          : 'hover:bg-green-400/10 border border-transparent hover:border-green-400/20'
                      }`}
                      onClick={() => selectSession(session)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{session.title}</div>
                          {session.pdf_filename && (
                            <div className="text-xs text-gray-400 truncate mt-1 flex items-center">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                              {session.pdf_filename}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-red-400/20 hover:bg-red-400/30 text-red-400 flex items-center justify-center text-xs transition-all duration-200"
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
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col" style={{background: '#000000'}}>
        {currentSession ? (
          <>
            {/* Modern Chat Header */}
            <div className="border-b border-green-400/20 p-6" style={{background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)'}}>
              {/* Title and Status Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    currentFeature === 'chat' ? 'bg-blue-500/20 text-blue-400' :
                    currentFeature === 'qa_generation' ? 'bg-purple-500/20 text-purple-400' :
                    currentFeature === 'general_ai' ? 'bg-green-500/20 text-green-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    <span className="text-lg">
                      {currentFeature === 'chat' ? '💬' :
                       currentFeature === 'qa_generation' ? '❓' :
                       currentFeature === 'general_ai' ? '🤖' : '📊'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{getFeatureTitle()}</h2>
                    {currentSession?.pdf_filename && (
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-400">{currentSession.pdf_filename}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* AI Model Selection */}
                <div className="flex items-center space-x-3">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Model</div>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-gray-800/50 border border-green-400/20 rounded-lg px-3 py-2 text-sm text-white focus:border-green-400/50 focus:ring-0 focus:outline-none transition-all"
                  >
                    {models.map(model => (
                      <option key={model.id} value={model.id} className="bg-gray-800">
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                {/* Upload PDF Button */}
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
                  className="flex items-center space-x-2 px-4 py-2 bg-green-400/10 hover:bg-green-400/20 border border-green-400/30 hover:border-green-400/50 text-green-400 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span>📄</span>
                      <span>Upload PDF</span>
                    </>
                  )}
                </button>

                {/* Search Button */}
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/30 hover:border-blue-400/50 text-blue-400 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  <span>🔍</span>
                  <span>Search</span>
                </button>

                {/* Feature-Specific Actions */}
                {currentFeature === 'qa_generation' && (
                  <button
                    onClick={generateQA}
                    disabled={generatingQA || !currentSession?.pdf_filename}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-400/10 hover:bg-purple-400/20 border border-purple-400/30 hover:border-purple-400/50 text-purple-400 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    {generatingQA ? (
                      <>
                        <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>❓</span>
                        <span>Generate Q&A</span>
                      </>
                    )}
                  </button>
                )}

                {currentFeature === 'research' && (
                  <>
                    <button
                      onClick={() => conductResearch('summary')}
                      disabled={researching || !currentSession?.pdf_filename}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-400/10 hover:bg-orange-400/20 border border-orange-400/30 hover:border-orange-400/50 text-orange-400 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      {researching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>📋</span>
                          <span>Summarize</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => conductResearch('detailed_research')}
                      disabled={researching || !currentSession?.pdf_filename}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-400/10 hover:bg-red-400/20 border border-red-400/30 hover:border-red-400/50 text-red-400 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      {researching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>🔬</span>
                          <span>Research</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Modern Search Interface */}
            {showSearch && (
              <div className="p-6 bg-gray-900/50 border-b border-green-400/20">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search across all PDFs and conversations..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all"
                        onKeyPress={(e) => e.key === 'Enter' && searchContent()}
                      />
                    </div>
                    <button
                      onClick={searchContent}
                      className="px-6 py-3 bg-green-400/10 hover:bg-green-400/20 border border-green-400/30 hover:border-green-400/50 text-green-400 rounded-xl font-medium transition-all duration-200"
                    >
                      Search
                    </button>
                    <button
                      onClick={() => setShowSearch(false)}
                      className="w-10 h-10 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <div key={index} className="p-4 bg-gray-800/30 rounded-xl border border-gray-600/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  result.type === 'pdf' ? 'bg-blue-400' : 'bg-green-400'
                                }`}></span>
                                <span className="text-sm font-medium text-white">
                                  {result.type === 'pdf' ? result.filename : result.session_title}
                                </span>
                                <span className="text-xs text-gray-400 uppercase">
                                  {result.type}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 leading-relaxed">
                                {result.type === 'pdf' ? result.snippet : result.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{background: '#000000'}}>
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
                messages.map((message, index) => (
                  <div key={message.id || index} className="message-bubble">
                    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-4xl ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {/* Message Header */}
                        <div className={`flex items-center mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-center space-x-2 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              message.role === 'user' 
                                ? 'bg-green-400/20 text-green-400' 
                                : message.role === 'system'
                                ? 'bg-blue-400/20 text-blue-400'
                                : 'bg-purple-400/20 text-purple-400'
                            }`}>
                              {message.role === 'user' ? '👤' : message.role === 'system' ? '📄' : '🤖'}
                            </div>
                            <span className="text-sm font-medium text-gray-400">
                              {message.role === 'user' ? 'You' : message.role === 'system' ? 'System' : 'AI Assistant'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                            </span>
                          </div>
                        </div>
                        
                        {/* Message Content */}
                        <div className={`${message.role === 'user' ? 'text-left' : 'text-right'}`}>
                          {containsMarkdown(message.content) ? (
                            <div className="prose prose-invert max-w-none">
                              <MarkdownRenderer 
                                content={message.content} 
                                messageType={message.role}
                              />
                            </div>
                          ) : (
                            <div className={`text-base leading-relaxed whitespace-pre-wrap ${
                              message.role === 'user' ? 'text-gray-200' : 'text-gray-100'
                            }`}>
                              {message.content || ''}
                            </div>
                          )}
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

            {/* Modern Message Input Area */}
            <div className="border-t border-green-400/20 p-4" style={{background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)'}}>
              <div className="flex items-end space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={getPlaceholder()}
                    disabled={loading || (currentFeature !== 'general_ai' && !currentSession?.pdf_filename)}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent disabled:opacity-50 transition-all"
                    rows={inputMessage.split('\n').length || 1}
                    style={{minHeight: '48px', maxHeight: '120px'}}
                  />
                  {recognitionRef.current && (currentFeature === 'chat' || currentFeature === 'general_ai') && (
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`absolute right-3 bottom-3 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                        isListening 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-green-400/10 text-green-400 border border-green-400/30 hover:bg-green-400/20'
                      }`}
                      disabled={loading}
                    >
                      {isListening ? '⏹' : '🎤'}
                    </button>
                  )}
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || loading || (currentFeature !== 'general_ai' && !currentSession?.pdf_filename)}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-400/10 hover:bg-green-400/20 border border-green-400/30 hover:border-green-400/50 text-green-400 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <span className="text-lg">↗</span>
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

const ModernNavTab = ({ isActive, onClick, icon, name, isCompact }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center transition-all duration-200 rounded-xl p-3 group ${
        isActive 
          ? 'bg-green-400/20 border border-green-400/40 text-green-400' 
          : 'hover:bg-green-400/10 border border-transparent hover:border-green-400/20 text-gray-400 hover:text-green-400'
      }`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-all duration-200 ${
        isActive 
          ? 'bg-green-400/30' 
          : 'bg-gray-700/50 group-hover:bg-green-400/20'
      }`}>
        {icon}
      </div>
      {!isCompact && (
        <span className="ml-3 font-medium text-sm truncate">{name}</span>
      )}
    </button>
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