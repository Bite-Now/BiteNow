import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute({ allowedRoles, children }) {
  const { role, isAuthenticated, isAuthLoading, isProfileLoading, isProfileLoaded } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Once Auth is loaded, if they aren't authenticated in Clerk, boot them out immediately.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // They are authenticated in Clerk! Now we wait for the backend profile.
  if (isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface">Syncing your profile...</p>
        </div>
      </div>
    );
  }

  // Profile finished loading. Did it succeed?
  if (!isProfileLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-error">
        <p>There was an error loading your profile data. Please refresh the page.</p>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
