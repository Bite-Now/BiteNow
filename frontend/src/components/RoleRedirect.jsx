import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleRedirect = () => {
  const { role, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (role === 'STUDENT') {
      navigate('/home');
    } else if (role === 'OWNER') {
      navigate('/vendor/dashboard');
    } else if (role === 'STAFF') {
      navigate('/staff');
    } else if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/unauthorized');
    }
  }, [role, loading, isAuthenticated, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Redirecting to your dashboard...</div>
    </div>
  );
};

export default RoleRedirect;
