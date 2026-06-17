import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function RoleRedirect() {
  const { role, isAuthLoading, isProfileLoading, isAuthenticated, isProfileLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Wait for Clerk to initialize
    if (isAuthLoading) {
      console.log("[RoleRedirect] Waiting for Clerk...");
      return;
    }

    // 2. If Clerk is loaded and user is NOT signed in, redirect to login
    if (!isAuthenticated) {
      console.log("[RoleRedirect] Not authenticated. Redirecting to login.");
      navigate('/login', { replace: true });
      return;
    }

    // 3. User is signed in. Wait for backend profile sync to finish.
    if (isProfileLoading) {
      console.log("[RoleRedirect] Waiting for Profile Sync...");
      return;
    }

    // 4. Profile sync finished. Did it succeed?
    if (!isProfileLoaded) {
      console.log("[RoleRedirect] Profile load failed. Halting.");
      return;
    }

    // 5. Success! We have the role, perform the redirect.
    console.log(`[RoleRedirect] Authenticated with role: ${role}. Redirecting...`);
    if (role === 'STUDENT') {
      navigate('/home', { replace: true });
    } else if (role === 'OWNER') {
      navigate('/vendor/dashboard', { replace: true });
    } else if (role === 'STAFF') {
      navigate('/staff', { replace: true });
    } else if (role === 'ADMIN') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/unauthorized', { replace: true });
    }
  }, [role, isAuthLoading, isProfileLoading, isAuthenticated, isProfileLoaded, navigate]);

  if (!isAuthLoading && isAuthenticated && !isProfileLoading && !isProfileLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-error">
        <p>There was an error loading your profile data. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
