// Secure storage utility for frontend
// Uses sessionStorage instead of localStorage for better security

const isDevelopment = import.meta.env.VITE_APP_ENVIRONMENT !== 'production';

export const SecureStorage = {
  setToken: (token) => {
    // Use sessionStorage instead of localStorage
    // SessionStorage is cleared when tab closes, reducing XSS risk
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('authToken', token);
    }
  },
  
  getToken: () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('authToken');
    }
    return null;
  },
  
  removeToken: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');
    }
  },
  
  setUserData: (userData) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('userData', JSON.stringify(userData));
    }
  },
  
  getUserData: () => {
    if (typeof window !== 'undefined') {
      const userData = sessionStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }
};

// Secure logger that only logs in development
export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  }
};

// Input sanitization utility
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// CSRF token handling
export const CSRF = {
  getToken: () => {
    if (typeof document !== 'undefined') {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta ? meta.getAttribute('content') : null;
    }
    return null;
  },
  
  setToken: (token) => {
    if (typeof document !== 'undefined') {
      let meta = document.querySelector('meta[name="csrf-token"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'csrf-token';
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', token);
    }
  }
};
