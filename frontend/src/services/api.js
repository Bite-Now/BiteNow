import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setupInterceptors = (getToken, navigate) => {
  api.interceptors.request.clear();
  api.interceptors.response.clear();

  api.interceptors.request.use(
    async (config) => {
      if (getToken) {
        try {
          const token = await getToken();
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

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          console.warn("Unauthorized API call. Redirecting to login.");
          if (window.Clerk) {
            window.Clerk.redirectToSignIn();
          } else {
            window.location.href = '/';
          }
        } else if (error.response.status === 403) {
          console.warn("Forbidden API call. Insufficient permissions.");
          if (navigate) {
            navigate('/unauthorized');
          } else {
            window.location.href = '/unauthorized';
          }
        }
      }
      return Promise.reject(error);
    }
  );
};

export default api;
