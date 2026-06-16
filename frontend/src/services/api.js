import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Clerk JWT
api.interceptors.request.use(
  async (config) => {
    // Attempt to grab the active token securely from Clerk
    // The window.Clerk object is available globally once Clerk React SDK loads
    if (window.Clerk && window.Clerk.session) {
      try {
        const token = await window.Clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error("Failed to retrieve Clerk token:", err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global Auth Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or missing -> Redirection handled mostly by Clerk guards,
        // but we can enforce logging out or returning error.
        // We do not auto-redirect via window.location to prevent loops if Clerk is actively syncing.
        console.warn("Unauthorized API call. Token may be expired.");
      } else if (error.response.status === 403) {
        console.warn("Forbidden API call. Insufficient permissions.");
        window.location.href = '/unauthorized';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
