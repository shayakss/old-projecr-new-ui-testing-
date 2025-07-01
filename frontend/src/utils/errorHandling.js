// Error handling utility for ChatPDF frontend
import axios from 'axios';

// Error types for better categorization
export const ERROR_TYPES = {
  NETWORK: 'network',
  SERVER: 'server',
  CLIENT: 'client',
  AUTH: 'auth',
  VALIDATION: 'validation',
  UNKNOWN: 'unknown'
};

// User-friendly error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection and try again.',
  SERVER_ERROR: 'The server is currently experiencing issues. Please try again in a few moments.',
  NOT_FOUND: 'The requested resource could not be found.',
  UNAUTHORIZED: 'Your session has expired. Please refresh the page and try again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'The file is too large. Please select a smaller file.',
  UNSUPPORTED_FILE: 'This file type is not supported. Please select a PDF file.',
  PDF_PROCESSING_ERROR: 'There was an error processing your PDF. Please try with a different file.',
  AI_SERVICE_ERROR: 'The AI service is currently unavailable. Please try again later.',
  RATE_LIMIT: 'Too many requests. Please wait a moment before trying again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Error classification function
export const classifyError = (error) => {
  if (!error) return { type: ERROR_TYPES.UNKNOWN, message: ERROR_MESSAGES.GENERIC_ERROR };

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return { type: ERROR_TYPES.NETWORK, message: ERROR_MESSAGES.NETWORK_ERROR };
  }

  // Axios errors
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    switch (status) {
      case 400:
        return { 
          type: ERROR_TYPES.VALIDATION, 
          message: data?.detail || ERROR_MESSAGES.VALIDATION_ERROR 
        };
      case 401:
        return { type: ERROR_TYPES.AUTH, message: ERROR_MESSAGES.UNAUTHORIZED };
      case 403:
        return { type: ERROR_TYPES.AUTH, message: ERROR_MESSAGES.FORBIDDEN };
      case 404:
        return { type: ERROR_TYPES.CLIENT, message: ERROR_MESSAGES.NOT_FOUND };
      case 413:
        return { type: ERROR_TYPES.VALIDATION, message: ERROR_MESSAGES.FILE_TOO_LARGE };
      case 415:
        return { type: ERROR_TYPES.VALIDATION, message: ERROR_MESSAGES.UNSUPPORTED_FILE };
      case 422:
        return { 
          type: ERROR_TYPES.VALIDATION, 
          message: data?.detail || ERROR_MESSAGES.VALIDATION_ERROR 
        };
      case 429:
        return { type: ERROR_TYPES.CLIENT, message: ERROR_MESSAGES.RATE_LIMIT };
      case 500:
        // Check if it's an AI service error
        if (data?.detail?.includes('AI service error') || data?.detail?.includes('API key')) {
          return { type: ERROR_TYPES.SERVER, message: ERROR_MESSAGES.AI_SERVICE_ERROR };
        }
        if (data?.detail?.includes('PDF')) {
          return { type: ERROR_TYPES.SERVER, message: ERROR_MESSAGES.PDF_PROCESSING_ERROR };
        }
        return { type: ERROR_TYPES.SERVER, message: ERROR_MESSAGES.SERVER_ERROR };
      case 502:
      case 503:
      case 504:
        return { type: ERROR_TYPES.SERVER, message: ERROR_MESSAGES.SERVER_ERROR };
      default:
        return { type: ERROR_TYPES.UNKNOWN, message: ERROR_MESSAGES.GENERIC_ERROR };
    }
  }

  // JavaScript errors
  if (error instanceof Error) {
    return { type: ERROR_TYPES.CLIENT, message: error.message };
  }

  return { type: ERROR_TYPES.UNKNOWN, message: ERROR_MESSAGES.GENERIC_ERROR };
};

// Error handler with retry logic
export const handleErrorWithRetry = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const errorInfo = classifyError(error);
      
      // Don't retry certain error types
      if (errorInfo.type === ERROR_TYPES.AUTH || 
          errorInfo.type === ERROR_TYPES.VALIDATION ||
          errorInfo.type === ERROR_TYPES.CLIENT) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// Notification system
export class NotificationManager {
  static notifications = [];
  static listeners = [];

  static addNotification(notification) {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date(),
      ...notification
    };
    
    this.notifications.unshift(newNotification);
    this.notifyListeners();
    
    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(id);
    }, notification.duration || 5000);
    
    return id;
  }

  static removeNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  static subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  static showError(message, options = {}) {
    return this.addNotification({
      type: 'error',
      message,
      ...options
    });
  }

  static showSuccess(message, options = {}) {
    return this.addNotification({
      type: 'success',
      message,
      ...options
    });
  }

  static showWarning(message, options = {}) {
    return this.addNotification({
      type: 'warning',
      message,
      ...options
    });
  }

  static showInfo(message, options = {}) {
    return this.addNotification({
      type: 'info',
      message,
      ...options
    });
  }
}

// Connection status checker
export class ConnectionChecker {
  static isOnline = navigator.onLine;
  static listeners = [];

  static init() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      NotificationManager.showSuccess('Connection restored');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
      NotificationManager.showError('Connection lost. Please check your internet connection.', { duration: 0 });
    });
  }

  static subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static notifyListeners(status) {
    this.listeners.forEach(listener => listener(status));
  }

  static async checkConnection() {
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache',
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Initialize connection checker
ConnectionChecker.init();

export default {
  ERROR_TYPES,
  ERROR_MESSAGES,
  classifyError,
  handleErrorWithRetry,
  NotificationManager,
  ConnectionChecker
};