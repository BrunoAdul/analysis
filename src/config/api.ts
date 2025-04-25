// API configuration that works in both development and production environments

// Determine if we're in development or production
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

// Base API URL - use localhost in development, relative path in production
const BASE_API_URL = isDevelopment ? 'http://localhost:3001/api' : `${window.location.origin}/api`;

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${BASE_API_URL}/auth/login`,
    REGISTER: `${BASE_API_URL}/auth/register`,
    LOGOUT: `${BASE_API_URL}/auth/logout`,
    VERIFY_SESSION: `${BASE_API_URL}/auth/verify-session`,
  },
  
  // Sales endpoints
  SALES: {
    GET_ALL: `${BASE_API_URL}/sales`,
    ADD: `${BASE_API_URL}/sales`,
    DELETE: `${BASE_API_URL}/sales`, // Use with /${id} for specific item
    UPLOAD: `${BASE_API_URL}/sales/upload`,
  }
};

export default API_ENDPOINTS;