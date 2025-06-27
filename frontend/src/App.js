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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

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
              <h1 className="text-2xl font-bold text-white">Baloch AI PDF</h1>
              <p className="text-sm text-gray-400">AI-Powered Document Assistant</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
            <a href="#blog" className="text-gray-300 hover:text-white transition-colors">Blog</a>
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
          {/* Hero Content */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="mb-8">
            </div>
            
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

            {/* CTA Buttons */}
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

            {/* Trust Indicators */}
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
              description="Auto-generate FAQs, MCQs, and True/False questions from your documents. Segment by chapters for targeted learning."
              gradient="from-emerald-500 to-cyan-500"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              }
              title="Quiz Generator"
              description="Generate daily revision quizzes or custom quizzes from your PDF library with adjustable difficulty levels."
              gradient="from-blue-500 to-indigo-500"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              }
              title="Voice Input"
              description="Use natural voice commands to ask questions about your documents with speech recognition."
              gradient="from-orange-500 to-red-500"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              }
              title="Advanced Search"
              description="Search across all your documents and conversations with intelligent, context-aware results."
              gradient="from-teal-500 to-green-500"
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              }
              title="Multi-Language Support"
              description="Translate your PDFs and interact with content in multiple languages powered by AI."
              gradient="from-violet-500 to-purple-500"
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

          {/* Blog Section */}
          <div id="blog" className="max-w-6xl mx-auto mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Latest from Our
                <span className="bg-gradient-to-r from-purple-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent block">
                  Blog
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Insights, updates, and stories from the Baloch AI PDF team about AI, document processing, and the future of intelligent document interaction.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Blog Post 1 - Developer Story */}
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group-hover:transform group-hover:scale-105">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-800">
                    <img 
                      src="https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg" 
                      alt="Developer working on Baloch AI PDF"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-emerald-400 text-sm font-medium mb-2">Development • 5 min read</div>
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-400 group-hover:to-emerald-400 transition-all duration-300">
                      Building Baloch AI PDF: From Concept to Reality
                    </h3>
                    <p className="text-gray-400 leading-relaxed mb-4">
                      Our journey developing an AI-powered PDF assistant that can understand, analyze, and interact with any document in natural language.
                    </p>
                    <div className="flex items-center text-gray-400 text-sm">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full mr-3"></div>
                      <span>Ahmed Hassan, Lead Developer</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blog Post 2 - Another Developer */}
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group-hover:transform group-hover:scale-105">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-800">
                    <img 
                      src="https://images.unsplash.com/photo-1549692520-acc6669e2f0c" 
                      alt="Software engineer developing AI features"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-blue-400 text-sm font-medium mb-2">AI Integration • 7 min read</div>
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                      Integrating Multiple AI Models for Better Results
                    </h3>
                    <p className="text-gray-400 leading-relaxed mb-4">
                      How we implemented Claude and Gemini models with intelligent fallback mechanisms to ensure reliable AI responses for document analysis.
                    </p>
                    <div className="flex items-center text-gray-400 text-sm">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                      <span>Shayak Siraj, AI Engineer</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blog Post 3 - Project Mentor */}
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group-hover:transform group-hover:scale-105">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-800">
                    <img 
                      src="https://images.pexels.com/photos/1181487/pexels-photo-1181487.jpeg" 
                      alt="Project mentor guiding Baloch AI PDF development"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-orange-400 text-sm font-medium mb-2">Project Management • 6 min read</div>
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-emerald-400 group-hover:to-orange-400 transition-all duration-300">
                      Leading AI Innovation: Lessons from Baloch AI PDF
                    </h3>
                    <p className="text-gray-400 leading-relaxed mb-4">
                      Strategic insights on managing AI-powered projects, balancing innovation with user needs, and building scalable document intelligence solutions.
                    </p>
                    <div className="flex items-center text-gray-400 text-sm">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full mr-3"></div>
                      <span>Dr. Sarah Mitchell, Project Mentor</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Blog CTA */}
            <div className="text-center mt-12">
              <button
                onClick={() => setCurrentView('app')}
                className="bg-gradient-to-r from-purple-500 to-emerald-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-emerald-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Try Baloch AI PDF Now
              </button>
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
              <span className="text-white font-semibold">Baloch AI PDF</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm mb-2">
                Built with ❤️ by <span className="text-white font-medium">Shayak Siraj & Ahmed</span>
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
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}></div>
      
      {/* Card content */}
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 group-hover:transform group-hover:scale-105">
        <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${gradient} rounded-xl mb-6 text-white shadow-lg`}>
          {icon}
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-400 group-hover:to-emerald-400 transition-all duration-300">
          {title}
        </h3>
        
        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>
        
        {/* Hover effect arrow */}
        <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
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
  const [selectedModel, setSelectedModel] = useState('claude-3-opus-20240229');
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

  // System Health States
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [showFixConfirmation, setShowFixConfirmation] = useState(null);
  const [fixingIssue, setFixingIssue] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState(null);
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

  // System Health Functions
  const loadSystemHealth = async () => {
    setHealthLoading(true);
    try {
      const response = await apiClient.get('/system-health');
      setHealthData(response.data);
    } catch (error) {
      console.error('Error loading system health:', error);
      setHealthData({
        overall_status: 'critical',
        backend_status: 'unhealthy',
        frontend_status: 'unhealthy',
        database_status: 'unknown',
        api_status: 'unknown',
        metrics: {
          cpu_usage: 0,
          memory_usage: 0,
          disk_usage: 0,
          response_time: 0,
          active_sessions: 0,
          total_api_calls: 0,
          error_rate: 100
        },
        issues: [{
          id: 'frontend-error',
          issue_type: 'critical',
          category: 'frontend',
          title: 'Frontend Connection Failed',
          description: 'Cannot connect to backend health endpoint',
          suggested_fix: 'Check backend service status',
          auto_fixable: false,
          severity: 5
        }],
        uptime: 0
      });
    } finally {
      setHealthLoading(false);
    }
  };

  const loadHealthMetrics = async () => {
    try {
      const response = await apiClient.get('/system-health/metrics');
      setHealthMetrics(response.data);
    } catch (error) {
      console.error('Error loading health metrics:', error);
    }
  };

  const fixSystemIssue = async (issueId) => {
    setFixingIssue(true);
    try {
      const response = await apiClient.post('/system-health/fix', {
        issue_id: issueId,
        confirm_fix: true
      });

      if (response.data.success) {
        // Refresh health data
        await loadSystemHealth();
        setShowFixConfirmation(null);
        alert(`Fix applied successfully: ${response.data.message}`);
      } else {
        alert(`Fix failed: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error fixing issue:', error);
      alert('Error applying fix: ' + (error.response?.data?.detail || error.message));
    } finally {
      setFixingIssue(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      case 'unhealthy': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-400/10 border-green-400/30';
      case 'warning': return 'bg-yellow-400/10 border-yellow-400/30';
      case 'critical': return 'bg-red-400/10 border-red-400/30';
      case 'unhealthy': return 'bg-red-400/10 border-red-400/30';
      default: return 'bg-gray-400/10 border-gray-400/30';
    }
  };

  const getSeverityColor = (severity) => {
    if (severity >= 4) return 'text-red-400';
    if (severity >= 3) return 'text-orange-400';
    if (severity >= 2) return 'text-yellow-400';
    return 'text-blue-400';
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

      // Switch to questions view and load messages
      setCurrentFeature('question_generation');
      setTimeout(() => loadMessages(currentSession.id, 'question_generation'), 500);
    } catch (error) {
      alert('Error generating questions: ' + (error.response?.data?.detail || error.message));
    } finally {
      setGeneratingQA(false);
    }
  };

  const generateQuiz = async (quizType = 'manual', difficulty = 'medium', questionCount = 10) => {
    if (!currentSession || !currentSession.pdf_filename) {
      alert('Please upload a PDF first');
      return;
    }

    setResearching(true);
    try {
      const response = await apiClient.post('/generate-quiz', {
        session_id: currentSession.id,
        quiz_type: quizType,
        difficulty: difficulty,
        question_count: questionCount,
        model: selectedModel
      });

      // Switch to quiz view and load messages
      setCurrentFeature('quiz_generation');
      setTimeout(() => loadMessages(currentSession.id, 'quiz_generation'), 500);
    } catch (error) {
      alert('Error generating quiz: ' + (error.response?.data?.detail || error.message));
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
      case 'question_generation': return 'Question Generator';
      case 'quiz_generation': return 'Quiz Generator';
      case 'general_ai': return 'General AI Assistant';
      default: return 'Chat';
    }
  };

  const getPlaceholder = () => {
    switch (currentFeature) {
      case 'chat': return currentSession?.pdf_filename 
        ? "Ask a question about your PDF..." 
        : "Upload a PDF to start chatting...";
      case 'general_ai': return "Ask me anything...";
      case 'question_generation': return "Upload a PDF and generate questions...";
      case 'quiz_generation': return "Upload a PDF and create quizzes...";
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
              isActive={currentFeature === 'question_generation'} 
              onClick={() => setCurrentFeature('question_generation')}
              icon="❓"
              name="Questions"
              isCompact={!sidebarOpen}
            />
            <ModernNavTab 
              isActive={currentFeature === 'quiz_generation'} 
              onClick={() => setCurrentFeature('quiz_generation')}
              icon="📝"
              name="Quiz"
              isCompact={!sidebarOpen}
            />
            <ModernNavTab 
              isActive={currentFeature === 'general_ai'} 
              onClick={() => setCurrentFeature('general_ai')}
              icon="🤖"
              name="General AI"
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
                    onClick={() => generateQuestions('mixed')}
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

                {currentFeature === 'quiz_generation' && (
                  <>
                    <button
                      onClick={() => generateQuiz('manual', 'easy')}
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
                          <span>Easy Quiz</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => generateQuiz('manual', 'hard')}
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
                          <span>Hard Quiz</span>
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
                        <div className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}>
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