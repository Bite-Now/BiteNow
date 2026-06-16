import React from 'react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const SignUp = () => {
    return (
        <div className="bg-[#121212] text-white font-sans min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[400px] relative z-10 flex flex-col items-center">
                <ClerkSignUp 
                    routing="path" 
                    path="/signup" 
                    signInUrl="/login" 
                    fallbackRedirectUrl="/home"
                />
                
                {/* Vendor Link preserved outside the Clerk component */}
                <div className="mt-6 flex items-center justify-center">
                    <button 
                        type="button"
                        onClick={() => alert("Vendor Application Flow not fully implemented yet!")}
                        className="text-[14px] text-[#3B82F6] hover:text-[#60A5FA] font-medium hover:underline transition-colors focus:outline-none"
                    >
                        Request to join as a vendor
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUp;