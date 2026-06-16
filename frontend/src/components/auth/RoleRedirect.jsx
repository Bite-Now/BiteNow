import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function RoleRedirect() {
  const { role, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (role === 'STUDENT') {
      navigate('/student', { replace: true });
    } else if (role === 'OWNER') {
      navigate('/owner', { replace: true });
    } else if (role === 'STAFF') {
      navigate('/staff', { replace: true });
    } else if (role === 'ADMIN') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/unauthorized', { replace: true });
    }
  }, [role, loading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
