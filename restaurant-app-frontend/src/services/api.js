// src/services/api.js
// ---------------------------------------------------------------------
// Centralized API service module using Axios for HTTP communication
// with the backend Rails API. This service sets up a shared Axios
// instance configured with base URL, JSON headers, credential inclusion,
// and request/response interceptors for authentication token management
// and global error handling.
// ---------------------------------------------------------------------

import axios from "axios";

// ---------------------------------------------------------------------
// Base URL configuration
// ---------------------------------------------------------------------
// Use the environment variable REACT_APP_API_URL if defined (e.g., in .env),
// otherwise default to localhost on port 3001. This allows flexibility
// between development, staging, and production environments.
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

// ---------------------------------------------------------------------
// Create Axios instance
// ---------------------------------------------------------------------
// We create a custom Axios instance so that all HTTP requests share
// common configuration: base URL prefix, default headers, and cookie
// support. This avoids repetition across service modules.
const api = axios.create({
  // Prepend this URL to all request paths, e.g., api.get('/menu_items')
  baseURL: `${API_BASE_URL}/api/v1`,

  // Default headers sent with every request
  headers: {
    "Content-Type": "application/json", // Send JSON payloads by default
    Accept: "application/json", // Expect JSON responses by default
  },

  // Include credentials (cookies, HTTP auth) in cross-site requests
  // Important if your Rails API uses session cookies for authentication
  withCredentials: true,
});

// ---------------------------------------------------------------------
// Request interceptor: attach auth token
// ---------------------------------------------------------------------
// Before each request, this interceptor runs, allowing us to add
// an Authorization header if the user has a token stored in localStorage.
api.interceptors.request.use(
  (config) => {
    // Retrieve the JWT or auth token from browser storage
    const token = localStorage.getItem("authToken");

    // If a token exists, set the Authorization header
    if (token) {
      // Bearer scheme is commonly used for JWT tokens
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Always return the config object, whether modified or not
    return config;
  },
  (error) => {
    // If an error occurs while setting up the request configs,
    // reject the promise so the calling code can handle it.
    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------
// Response interceptor: global error handling
// ---------------------------------------------------------------------
// After each response (or error), this interceptor allows us to
// handle certain status codes in one place rather than repeating
// logic in every API call.
api.interceptors.response.use(
  (response) => {
    // If the response is successful (status code 2xx), simply return it
    return response;
  },
  (error) => {
    // If the server responds with a 401 Unauthorized, the token
    // is no longer valid or user is not authenticated.
    if (error.response?.status === 401) {
      // Remove any stale token from storage
      localStorage.removeItem("authToken");
      // Redirect the user to the login page to re-authenticate
      window.location.href = "/login";
    }

    // For other errors, forward the rejection so calling code can catch it
    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------
// Export the configured Axios instance
// ---------------------------------------------------------------------
// Other modules can import this `api` instance and call methods like:
// api.get('/menu_items'), api.post('/reservations', data), etc.
export default api;
