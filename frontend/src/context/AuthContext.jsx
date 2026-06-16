import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import api from '../services/api';

export const AuthContext = createContext({
  currentUser: null,
  role: null,
  isAuthenticated: false,
  isProfileLoaded: false,
  loading: true,
  isAuthLoading: true,
  isProfileLoading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { signOut, getToken } = useClerkAuth();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const fetchDbUser = useCallback(async () => {
    if (!isSignedIn) {
      console.log("[AuthContext] User not signed in. Clearing profile.");
      setCurrentUser(null);
      setRole(null);
      setIsProfileLoading(false);
      return;
    }

    try {
      console.log("[AuthContext] Fetching backend profile...");
      setIsProfileLoading(true);
      const token = await getToken();
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = response.data;
      
      console.log("[AuthContext] Backend profile loaded successfully.");
      setCurrentUser(userData);
      setRole(userData.role);
    } catch (error) {
      if (error.response?.status === 404 && clerkUser) {
        console.log("[AuthContext] User not found in DB (404). Syncing from Clerk to backend...");
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
          console.log("[AuthContext] Sync successful. Profile loaded.");
          setCurrentUser(newUserData);
          setRole(newUserData.role);
        } catch (syncError) {
          console.error("[AuthContext] Failed to sync user:", syncError);
          // Do NOT signOut here to prevent infinite redirect loops!
          // Let the UI handle the missing profile gracefully.
          setCurrentUser(null);
          setRole(null);
        }
      } else {
        console.error("[AuthContext] Failed to fetch user from DB:", error);
        // Do NOT signOut here automatically. Network failures shouldn't kill Clerk sessions.
        setCurrentUser(null);
        setRole(null);
      }
    } finally {
      setIsProfileLoading(false);
    }
  }, [isSignedIn, clerkUser, getToken]);

  useEffect(() => {
    if (isClerkLoaded) {
      fetchDbUser();
    }
  }, [isClerkLoaded, fetchDbUser, isSignedIn]);

  const refreshUser = async () => {
    await fetchDbUser();
  };

  const logout = async () => {
    console.log("[AuthContext] Logging out...");
    await signOut();
    setCurrentUser(null);
    setRole(null);
  };

  // The unified loading state reflects whether we are still resolving the final state.
  const isAuthLoading = !isClerkLoaded;
  // We only consider the overall 'loading' true if auth is loading, OR if we are actively fetching the profile.
  const loading = isAuthLoading || isProfileLoading;

  console.log(`[AuthContext State] ClerkLoaded: ${isClerkLoaded}, SignedIn: ${isSignedIn}, ProfileLoading: ${isProfileLoading}, ProfileLoaded: ${!!currentUser}`);

  const value = {
    isAuthenticated: !!isSignedIn, // Source of truth is purely Clerk!
    isProfileLoaded: !!currentUser,
    currentUser,
    role,
    loading,
    isAuthLoading,
    isProfileLoading,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
