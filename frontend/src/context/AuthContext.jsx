import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import api from '../services/api';

export const AuthContext = createContext({
  currentUser: null,
  role: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  refreshUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshUser = useCallback(async () => {
    if (!isSignedIn) {
      setCurrentUser(null);
      setRole(null);
      setError(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/auth/me');
      if (response.data) {
        setCurrentUser(response.data);
        setRole(response.data.role);
      }
    } catch (err) {
      console.error("Failed to fetch user from /auth/me:", err);
      setCurrentUser(null);
      setRole(null);
      // If the backend says the user is not found but Clerk thinks we are signed in,
      // force a sign out to prevent infinite redirect loops.
      if (err.response && (err.response.status === 404 || err.response.status === 401)) {
        await signOut();
      } else {
        // Network Error or 500 Server Error
        setError(err.message || "Failed to connect to backend");
      }
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      refreshUser();
    }
  }, [isLoaded, isSignedIn, refreshUser]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      role,
      isAuthenticated: !!currentUser,
      loading: !isLoaded || loading,
      error,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
