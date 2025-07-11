import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

// Enhanced axios instance with better error handling
const apiClient = axios.create({
  baseURL: API,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced markdown detection
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

// Enhanced Markdown Renderer with better styling
const MarkdownRenderer = ({ content, messageType = 'assistant' }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className={`mb-4 leading-relaxed ${
              messageType === 'user' ? 'text-neutral-200' : 'text-neutral-100'
            }`}>
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className={`font-semibold ${
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
            <li className={`leading-relaxed ${
              messageType === 'user' ? 'text-neutral-200' : 'text-neutral-100'
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
          h1: ({ children }) => (
            <h1 className="text-heading-2 mb-4 text-green-400">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-heading-3 mb-3 text-green-400">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mb-2 text-green-400">{children}</h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Enhanced Loading Component
const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      {text && <span className="text-body-small text-neutral-400">{text}</span>}
    </div>
  );
};

// Enhanced Typing Indicator
const TypingIndicator = () => {
  return (
    <div className="message-container">
      <div className="message-avatar assistant">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="message-content assistant">
        <div className="flex items-center gap-2">
          <span className="text-body-small text-neutral-400">AI is thinking</span>
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Status Indicator Component
const StatusIndicator = ({ status, text }) => {
  const statusConfig = {
    online: { color: 'online', icon: '●' },
    offline: { color: 'offline', icon: '●' },
    processing: { color: 'processing', icon: '●' }
  };

  const config = statusConfig[status] || statusConfig.offline;

  return (
    <div className={`status-indicator ${config.color}`}>
      <span className={`status-dot ${status === 'processing' ? 'pulse' : ''}`}></span>
      {text}
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [currentFeature, setCurrentFeature] = useState('chat');

  return (
    <div className="App">
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

// Professional HomePage Component
const HomePage = ({ setCurrentView }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
    
    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: 'url(/download (1).jpeg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Lighter Professional Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50"></div>
      
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-grid opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-36 h-36 sm:w-72 sm:h-72 bg-primary-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-8 -left-4 w-36 h-36 sm:w-72 sm:h-72 bg-accent-blue/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Professional Header */}
      <header className={`relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between py-4 sm:py-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-primary-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">ChatPDF</h1>
                <p className="text-xs sm:text-sm text-neutral-400">Next-Gen AI Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 sm:space-x-8">
              <div className="hidden sm:flex items-center space-x-6 lg:space-x-8">
                <a href="#features" className="text-sm sm:text-base text-neutral-300 hover:text-white transition-colors">Features</a>
                <a href="#about" className="text-sm sm:text-base text-neutral-300 hover:text-white transition-colors">About</a>
              </div>
              <button
                onClick={() => setCurrentView('app')}
                className="btn btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Professional Hero Section */}
      <main className="relative z-10 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`max-w-5xl mx-auto mb-12 sm:mb-16 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-6 sm:mb-8">
              <span className="inline-block px-3 py-1 sm:px-4 sm:py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-xs sm:text-sm mb-4 sm:mb-6">
                🚀 Powered by Advanced AI
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 leading-tight">
              Transform Your
              <span className="block text-gradient mt-1 sm:mt-2">
                PDFs into Intelligence
              </span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed text-neutral-300 px-4">
              Experience the future of document interaction. Upload any PDF and engage in natural conversations, 
              extract insights, generate summaries, and unlock the full potential of your documents with cutting-edge AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-16">
              <button
                onClick={() => setCurrentView('app')}
                className="btn btn-primary btn-lg group w-full sm:w-auto"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Free Trial
              </button>
              <button className="btn btn-secondary btn-lg group w-full sm:w-auto">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base text-neutral-400">100% Free</span>
              </div>
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base text-neutral-400">Secure & Private</span>
              </div>
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base text-neutral-400">Unlimited Access</span>
              </div>
            </div>
          </div>

          {/* Professional Feature Showcase */}
          <div id="features" className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto mb-16 sm:mb-20 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <ProfessionalFeatureCard
              icon={
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              title="Intelligent Conversations"
              description="Engage in natural, context-aware conversations with your PDF documents. Ask complex questions and receive detailed, accurate answers."
              gradient="from-blue-500 to-purple-600"
              isActive={activeFeature === 0}
            />
            <ProfessionalFeatureCard
              icon={
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="Smart Analysis"
              description="Automatically extract key insights, generate summaries, and create questions from your documents using advanced AI algorithms."
              gradient="from-green-500 to-teal-600"
              isActive={activeFeature === 1}
            />
            <ProfessionalFeatureCard
              icon={
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              }
              title="Voice Interaction"
              description="Use natural voice commands to interact with your documents. Speak your questions and get audio responses for hands-free productivity."
              gradient="from-orange-500 to-red-600"
              isActive={activeFeature === 2}
            />
          </div>

          {/* Professional Stats Section */}
          <div className={`max-w-6xl mx-auto mb-16 sm:mb-20 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="card card-feature">
              <div className="card-body p-6 sm:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient mb-2">7+</div>
                    <div className="text-xs sm:text-sm text-neutral-400">AI Models</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient mb-2">99.9%</div>
                    <div className="text-xs sm:text-sm text-neutral-400">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient mb-2">∞</div>
                    <div className="text-xs sm:text-sm text-neutral-400">PDF Uploads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient mb-2">24/7</div>
                    <div className="text-xs sm:text-sm text-neutral-400">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional CTA Section */}
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="card bg-gradient-primary p-8 sm:p-12 rounded-2xl sm:rounded-3xl">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                Ready to Transform Your PDFs?
              </h3>
              <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8">
                Join thousands of professionals who are already using ChatPDF to unlock the power of their documents.
              </p>
              <button
                onClick={() => setCurrentView('app')}
                className="btn btn-secondary btn-lg w-full sm:w-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Professional Footer */}
      <footer className="relative z-10 py-8 sm:py-12 border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6 md:mb-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg sm:rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white">ChatPDF</h4>
                <p className="text-xs sm:text-sm text-neutral-400">AI-Powered Document Intelligence</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-xs sm:text-sm text-neutral-400 mb-1 sm:mb-2">
                Built with ❤️ for the future of document interaction
              </p>
              <p className="text-xs text-neutral-500">
                © 2024 ChatPDF. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Professional FeatureCard Component
const ProfessionalFeatureCard = ({ icon, title, description, gradient, isActive }) => {
  return (
    <div className={`card card-feature group cursor-pointer transition-all duration-500 ${isActive ? 'scale-105' : ''}`}>
      <div className="card-body text-center relative p-4 sm:p-6 md:p-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${gradient} rounded-xl sm:rounded-2xl mb-4 sm:mb-6 md:mb-8 text-white shadow-2xl group-hover:scale-110 transition-all duration-300 relative`}>
          {icon}
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
        </div>
        
        <h3 className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-white font-semibold">
          {title}
        </h3>
        
        <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
          {description}
        </p>
        
        <div className="mt-4 sm:mt-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-2 text-primary-400">
            <span className="text-xs sm:text-sm font-medium">Learn More</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced ChatInterface Component
const ChatInterface = ({ currentFeature, setCurrentFeature, setCurrentView }) => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('claude-3-opus-20240229');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [generatingQA, setGeneratingQA] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('online');
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
    checkConnectionStatus();
    
    // Check for mobile device and handle resize
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      setSidebarOpen(!isMobileDevice); // Open sidebar on desktop, closed on mobile
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkConnectionStatus = async () => {
    try {
      await apiClient.get('/health');
      setConnectionStatus('online');
    } catch (error) {
      setConnectionStatus('offline');
    }
  };

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
      setConnectionStatus('processing');
      const response = await apiClient.get('/sessions');
      // Limit to 10 most recent sessions to avoid clutter
      const limitedSessions = response.data.slice(0, 10);
      setSessions(limitedSessions);
      setConnectionStatus('online');
      if (limitedSessions.length === 0) {
        await createNewSession();
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
      setConnectionStatus('offline');
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
      const timestamp = new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const response = await apiClient.post('/sessions', { title: `Chat ${timestamp}` });
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

  const clearAllSessions = async () => {
    if (window.confirm('Are you sure you want to clear all chat sessions? This action cannot be undone.')) {
      try {
        // Delete all sessions
        const deletePromises = sessions.map(session => 
          apiClient.delete(`/sessions/${session.id}`)
        );
        await Promise.all(deletePromises);
        
        // Clear local state
        setSessions([]);
        setCurrentSession(null);
        setMessages([]);
        
        // Create a new session
        await createNewSession();
      } catch (error) {
        console.error('Error clearing sessions:', error);
      }
    }
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
          await createNewSession();
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

  const updateSessionTitle = async (sessionId, content) => {
    try {
      // Generate a title from the first message (first 30 characters)
      const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
      await apiClient.put(`/sessions/${sessionId}`, { title });
      
      // Update the session in the local state
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title } : s
      ));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => ({ ...prev, title }));
      }
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || loading) return;

    const userMessage = createMessage('user', inputMessage, currentFeature);
    const messageContent = inputMessage;

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await apiClient.post(`/sessions/${currentSession.id}/messages`, {
        session_id: currentSession.id,
        content: messageContent,
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

      // Update session title if it's a new session (still has default title)
      if (currentSession.title.startsWith('Chat ') && !currentSession.title.includes('...')) {
        await updateSessionTitle(currentSession.id, messageContent);
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

  return (
    <div className="flex h-screen relative overflow-hidden" style={{
      backgroundImage: 'url(/download (1).jpeg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Same background overlay as home page */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50"></div>
      
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-grid opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-accent-blue/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Responsive Sidebar */}
      <div className={`${
        isMobile 
          ? `fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }` 
          : `${sidebarOpen ? 'w-80' : 'w-16'} relative z-10 transition-all duration-300`
      } flex flex-col`}>
        <div className="h-full bg-gradient-to-b from-black/20 via-black/30 to-black/20 backdrop-blur-xl border-r border-white/10">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              {(sidebarOpen || !isMobile) && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-white font-semibold">ChatPDF</span>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusIndicator status={connectionStatus} text={connectionStatus} />
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="btn btn-ghost btn-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          {(sidebarOpen || !isMobile) && (
            <div className="p-4">
              <button
                onClick={() => {
                  createNewSession();
                  if (isMobile) setSidebarOpen(false);
                }}
                className="btn btn-primary w-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Chat
              </button>
            </div>
          )}

          {/* Feature Navigation */}
          {(sidebarOpen || !isMobile) && (
            <div className="px-4 py-2">
              <div className="space-y-1">
                {[
                  { key: 'chat', label: 'PDF Chat', icon: '💬' },
                  { key: 'question_generation', label: 'Question Generator', icon: '❓' },
                  { key: 'general_ai', label: 'General AI', icon: '🤖' },
                  { key: 'research', label: 'Research & Summary', icon: '📊' },
                  { key: 'translation', label: 'Translation', icon: '🌐' },
                  { key: 'annotations', label: 'Annotations', icon: '📝' }
                ].map((feature) => (
                  <button
                    key={feature.key}
                    onClick={() => {
                      setCurrentFeature(feature.key);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      currentFeature === feature.key 
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg' 
                        : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{feature.icon}</span>
                    <span className="truncate">{feature.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sessions List */}
          {(sidebarOpen || !isMobile) && (
            <div className="flex-1 overflow-y-auto px-4">
              <div className="py-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-caption text-neutral-400">Recent Chats</h3>
                  {sessions.length > 0 && (
                    <button
                      onClick={clearAllSessions}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group cursor-pointer transition-all duration-200 p-3 rounded-lg backdrop-blur-sm ${
                        currentSession?.id === session.id
                          ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30'
                          : 'bg-black/20 hover:bg-black/30 border border-white/10'
                      }`}
                      onClick={() => {
                        selectSession(session);
                        if (isMobile) setSidebarOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate mb-1">
                            {session.title && session.title !== 'New Chat' ? session.title : 'Untitled Chat'}
                          </p>
                          {session.pdf_filename && (
                            <p className="text-xs text-green-400 truncate flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                              {session.pdf_filename}
                            </p>
                          )}
                          {session.created_at && (
                            <p className="text-xs text-neutral-500 truncate">
                              {new Date(session.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
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
          {(sidebarOpen || !isMobile) && (
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => setCurrentView('home')}
                className="btn btn-ghost w-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Enhanced Mobile-First Header */}
        <div className="bg-gradient-to-r from-black/30 via-black/20 to-black/30 border-b border-white/10 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="btn btn-ghost btn-sm md:hidden"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl text-white font-semibold truncate">
                    {getFeatureName(currentFeature)}
                  </h1>
                  {currentSession && (
                    <p className="text-xs sm:text-sm text-neutral-300 mt-1 truncate">
                      {currentSession.pdf_filename ? `📄 ${currentSession.pdf_filename}` : 'No PDF uploaded'}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Model Selection - Responsive */}
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-lg px-2 sm:px-4 py-2 text-white text-xs sm:text-sm w-24 sm:w-48 focus:outline-none focus:border-primary-500"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id} className="bg-black text-white">
                      {isMobile ? model.name.substring(0, 15) + '...' : model.name} {model.free ? '(Free)' : ''}
                    </option>
                  ))}
                </select>

                {/* Upload PDF Button - Responsive */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-4 py-2"
                >
                  {uploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">{uploading ? 'Uploading...' : 'Upload PDF'}</span>
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

                {/* Generate Questions Button - Responsive */}
                {currentFeature === 'question_generation' && (
                  <button
                    onClick={() => generateQuestions('mixed')}
                    disabled={generatingQA || !currentSession?.pdf_filename}
                    className="btn btn-primary text-xs sm:text-sm px-2 sm:px-4 py-2"
                  >
                    {generatingQA ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className="hidden sm:inline">{generatingQA ? 'Generating...' : 'Generate Questions'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Responsive Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl mb-2 sm:mb-4 text-white">Start a conversation</h3>
                <p className="text-sm sm:text-base text-neutral-300 max-w-md">
                  Upload a PDF and ask questions, or use General AI for any topic
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-2 sm:gap-4 max-w-full">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : message.role === 'system' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.role === 'user' ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  ) : message.role === 'system' ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className={`flex-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-sm border max-w-full ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30' 
                    : message.role === 'system' 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30' 
                    : 'bg-black/20 border-white/10'
                }`}>
                  {containsMarkdown(message.content) ? (
                    <MarkdownRenderer content={message.content} messageType={message.role} />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm sm:text-base text-white break-words">{message.content}</p>
                  )}
                  <div className="text-xs text-neutral-400 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Responsive Input Area */}
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-black/20 via-black/30 to-black/20 backdrop-blur-sm border-t border-white/10">
          <div className="flex items-end gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`Ask about your ${currentFeature === 'general_ai' ? 'anything' : 'PDF'} or type a message...`}
                className="w-full bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-3 sm:py-4 text-white placeholder-neutral-400 resize-none min-h-[2.5rem] sm:min-h-[3rem] max-h-32 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm sm:text-base"
                disabled={loading}
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: isMobile ? '2.5rem' : '3rem'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
              />
            </div>
            
            {/* Voice Input Button - Responsive */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25' 
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20'
              }`}
              disabled={loading}
            >
              {isListening ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a2 2 0 114 0v4a2 2 0 11-4 0V7z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            
            {/* Send Button - Responsive */}
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || loading}
              className="btn btn-primary px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <span className="hidden sm:inline">Send</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;