import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleRedirect = () => {
  const { role, loading, isAuthenticated, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (error) return;

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
  }, [role, loading, isAuthenticated, error, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Backend Connection Error</h2>
          <p className="text-gray-300">{error}</p>
          <p className="mt-4 text-sm text-gray-500">
            Please ensure your backend is running and CORS is configured correctly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Redirecting to your dashboard...</div>
    </div>
  );
};

export default RoleRedirect;
