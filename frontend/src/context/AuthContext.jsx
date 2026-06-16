import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import api from '../services/api';

export const AuthContext = createContext({
  currentUser: null,
  role: null,
  isAuthenticated: false,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { signOut, getToken } = useClerkAuth();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDbUser = useCallback(async () => {
    if (!isSignedIn) {
      setCurrentUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = response.data;
      
      setCurrentUser(userData);
      setRole(userData.role);
    } catch (error) {
      if (error.response?.status === 404 && clerkUser) {
        console.log("User not found in DB. Syncing from Clerk to backend...");
        try {
          const token = await getToken();
          const syncResponse = await api.post('/auth/sync', {
            clerk_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            full_name: clerkUser.fullName
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const newUserData = syncResponse.data;
          setCurrentUser(newUserData);
          setRole(newUserData.role);
        } catch (syncError) {
          console.error("Failed to sync user:", syncError);
          await signOut();
          setCurrentUser(null);
          setRole(null);
        }
      } else {
        console.error("Failed to fetch user from DB:", error);
        await signOut();
        setCurrentUser(null);
        setRole(null);
      }
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, clerkUser, signOut, getToken]);

  useEffect(() => {
    if (isClerkLoaded) {
      fetchDbUser();
    }
  }, [isClerkLoaded, fetchDbUser, isSignedIn]);

  const refreshUser = async () => {
    await fetchDbUser();
  };

  const logout = async () => {
    await signOut();
    setCurrentUser(null);
    setRole(null);
  };

  // While Clerk itself is initializing
  if (!isClerkLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const value = {
    currentUser,
    role,
    isAuthenticated: isSignedIn && !!currentUser,
    loading,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
