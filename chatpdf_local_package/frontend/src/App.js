import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

// Enhanced axios instance
const apiClient = axios.create({
  baseURL: API,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to detect if content contains markdown syntax
const containsMarkdown = (content) => {
  if (!content) return false;
  
  const markdownPatterns = [
    /\*\*.*?\*\*/,  // Bold text
    /\*.*?\*/,      // Italic text
    /^#{1,6}\s/m,   // Headers
    /^[-*+]\s/m,    // Unordered lists
    /^\d+\.\s/m,    // Ordered lists
    /```[\s\S]*?```/, // Code blocks
    /`.*?`/,        // Inline code
    /^\>/m,         // Blockquotes
    /\n\n/,         // Multiple line breaks
  ];
  
  return markdownPatterns.some(pattern => pattern.test(content));
};

const MarkdownRenderer = ({ content, messageType = 'assistant' }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]"></div>
      
      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ChatPDF</h1>
              <p className="text-sm text-gray-400">AI-Powered PDF Assistant</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <button
              onClick={() => setCurrentView('app')}
              className="bg-gradient-to-r from-purple-500 to-emerald-500 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-16 pb-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Transform Your
              <span className="bg-gradient-to-r from-purple-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent block">
                PDFs into Conversations
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Upload any PDF document and engage in intelligent conversations with your content. 
              Get instant answers, generate summaries, and unlock insights with the power of AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => setCurrentView('app')}
                className="bg-gradient-to-r from-purple-500 to-emerald-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-emerald-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Start Chatting Now</span>
              </button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Free to Use</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Unlimited PDFs</span>
              </div>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div id="features" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              }
              title="AI Chat"
              description="Have natural conversations with your PDF documents. Ask questions and get instant, contextual answers."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H16a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L11.47 14H8.53l-.56 2.242a1 1 0 11-1.94-.485L6.47 14H4a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.53 8l-1 4h2.94l1-4H9.53z" clipRule="evenodd" />
                </svg>
              }
              title="Question Generator"
              description="Auto-generate FAQs, MCQs, and True/False questions from your documents."
              gradient="from-emerald-500 to-cyan-500"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              }
              title="Voice Input"
              description="Use natural voice commands to ask questions about your documents."
              gradient="from-orange-500 to-red-500"
            />
          </div>

          {/* Stats Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">7+</div>
                <div className="text-sm text-gray-400">AI Models</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-sm text-gray-400">Free to Use</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">∞</div>
                <div className="text-sm text-gray-400">PDF Uploads</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-sm text-gray-400">Available</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white font-semibold">ChatPDF</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm mb-2">
                Built with ❤️ for PDF lovers
              </p>
              <p className="text-gray-500 text-xs">
                AI-Powered Document Assistant
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, gradient }) => {
  return (
    <div className="group relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}></div>
      
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 group-hover:transform group-hover:scale-105">
        <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${gradient} rounded-xl mb-6 text-white shadow-lg`}>
          {icon}
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-4">
          {title}
        </h3>
        
        <p className="text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

const ChatInterface = ({ currentFeature, setCurrentFeature, setCurrentView }) => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('claude-3-opus-20240229');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [generatingQA, setGeneratingQA] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

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
        await createNewSession();
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
    }
  };

  const loadModels = async () => {
    try {
      const response = await apiClient.get('/models');
      setModels(response.data.models);
      if (response.data.models && response.data.models.length > 0) {
        if (!selectedModel || !response.data.models.some(model => model.id === selectedModel)) {
          setSelectedModel(response.data.models[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading models:', error);
      setModels([]);
    }
  };

  const loadMessages = async (sessionId, featureType = null) => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    try {
      const params = featureType && featureType !== 'chat' ? { feature_type: featureType } : {};
      const response = await apiClient.get(`/sessions/${sessionId}/messages`, { params });
      
      const validMessages = (response.data || []).filter(message => 
        message && 
        typeof message === 'object' && 
        message.role && 
        (message.content !== undefined && message.content !== null)
      );
      
      setMessages(validMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
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
        `📄 PDF "${response.data.filename}" uploaded successfully! You can now ask questions about this document.`,
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

      const aiResponse = response.data.ai_response;
      if (aiResponse && aiResponse.role && aiResponse.content !== undefined) {
        setMessages(prev => [...prev, aiResponse]);
      } else {
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

  const generateQuestions = async (questionType = 'mixed', chapterSegment = null) => {
    if (!currentSession || !currentSession.pdf_filename) {
      alert('Please upload a PDF first');
      return;
    }

    setGeneratingQA(true);
    try {
      const response = await apiClient.post('/generate-questions', {
        session_id: currentSession.id,
        question_type: questionType,
        chapter_segment: chapterSegment,
        model: selectedModel
      });

      setCurrentFeature('question_generation');
      setTimeout(() => loadMessages(currentSession.id, 'question_generation'), 500);
    } catch (error) {
      alert('Error generating questions: ' + (error.response?.data?.detail || error.message));
    } finally {
      setGeneratingQA(false);
    }
  };

  const getFeatureName = (feature) => {
    const featureNames = {
      'chat': 'PDF Chat',
      'question_generation': 'Question Generator',
      'general_ai': 'General AI'
    };
    return featureNames[feature] || feature;
  };

  const getMessageTypeColor = (role) => {
    switch (role) {
      case 'user':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'assistant':
        return 'bg-gray-800 text-white border border-gray-600';
      case 'system':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white font-semibold">ChatPDF</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        {sidebarOpen && (
          <div className="p-4">
            <button
              onClick={createNewSession}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Chat</span>
            </button>
          </div>
        )}

        {/* Feature Tabs */}
        {sidebarOpen && (
          <div className="px-4 py-2">
            <div className="space-y-1">
              {[
                { key: 'chat', label: 'PDF Chat', icon: '💬' },
                { key: 'question_generation', label: 'Question Generator', icon: '❓' },
                { key: 'general_ai', label: 'General AI', icon: '🤖' }
              ].map((feature) => (
                <button
                  key={feature.key}
                  onClick={() => setCurrentFeature(feature.key)}
                  className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 ${
                    currentFeature === feature.key
                      ? 'bg-green-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{feature.icon}</span>
                  {feature.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sessions List */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto px-4">
            <div className="py-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recent Chats</h3>
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentSession?.id === session.id
                        ? 'bg-gray-800 border border-green-500'
                        : 'hover:bg-gray-800'
                    }`}
                    onClick={() => selectSession(session)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {session.title}
                        </p>
                        {session.pdf_filename && (
                          <p className="text-xs text-gray-400 truncate">
                            📄 {session.pdf_filename}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Back to Home */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => setCurrentView('home')}
              className="w-full text-gray-400 hover:text-white py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors text-sm flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">
                {getFeatureName(currentFeature)}
              </h1>
              {currentSession && (
                <p className="text-sm text-gray-400">
                  {currentSession.pdf_filename ? `📄 ${currentSession.pdf_filename}` : 'No PDF uploaded'}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Model Selection */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-1 text-sm"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} {model.free ? '(Free)' : ''}
                  </option>
                ))}
              </select>

              {/* Upload PDF Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : '📄 Upload PDF'}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPDF(file);
                }}
                className="hidden"
              />

              {/* Generate Questions Button */}
              {currentFeature === 'question_generation' && (
                <button
                  onClick={() => generateQuestions('mixed')}
                  disabled={generatingQA || !currentSession?.pdf_filename}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {generatingQA ? 'Generating...' : '❓ Generate Questions'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg font-medium mb-2">Start a conversation</p>
                <p className="text-sm">Upload a PDF and ask questions, or use General AI for any topic</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl p-4 rounded-lg ${getMessageTypeColor(message.role)}`}
                >
                  {containsMarkdown(message.content) ? (
                    <MarkdownRenderer content={message.content} messageType={message.role} />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  <div className="text-xs opacity-70 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <span className="text-gray-400 text-sm ml-2">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-gray-900 border-t border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Ask about your ${currentFeature === 'general_ai' ? 'anything' : 'PDF'} or type a message...`}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            
            {/* Voice Input Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {isListening ? '🛑' : '🎤'}
            </button>
            
            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;