import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import api from '../services/api';

export const AuthContext = createContext({
  currentUser: null,
  role: null,
  isAuthenticated: false,
  loading: true,
  refreshUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser();
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!isSignedIn) {
      setCurrentUser(null);
      setRole(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      if (response.data) {
        setCurrentUser(response.data);
        setRole(response.data.role);
      }
    } catch (error) {
      console.error("Failed to fetch user from /auth/me:", error);
      setCurrentUser(null);
      setRole(null);
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
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
