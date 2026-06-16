import React from 'react';
import { ClerkProvider } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  if (!clerkPubKey || clerkPubKey === 'pk_test_xxxxxxxxx') {
    return (
      <div style={{ color: 'red', padding: '20px', backgroundColor: 'white' }}>
        <h2>Missing Clerk Publishable Key</h2>
        <p>Please add your valid Clerk Publishable Key in <code>frontend/.env</code> and restart the server.</p>
      </div>
    );
  }

  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      navigate={(to) => navigate(to)}
    >
      {children}
    </ClerkProvider>
  );
}
