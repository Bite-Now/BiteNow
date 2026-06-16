import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface px-6">
      <div className="max-w-md w-full bg-surface-container-low p-8 rounded-[24px] border border-outline-variant shadow-lg text-center">
        <span className="material-symbols-outlined text-[48px] text-error mb-4">lock</span>
        <h1 className="font-headline-lg mb-2">Access Denied</h1>
        <p className="font-body-md text-on-surface-variant mb-8">
          You do not have permission to view this page. If you believe this is a mistake, please contact support.
        </p>
        <button 
          onClick={() => navigate('/', { replace: true })}
          className="w-full bg-primary-container text-on-primary-container font-label-md py-3 rounded-xl hover:bg-primary transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
