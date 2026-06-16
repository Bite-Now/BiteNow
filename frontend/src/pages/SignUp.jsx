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
                    fallbackRedirectUrl="/student"
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: "bg-[#1A1A1A] border border-white/5 shadow-2xl rounded-[32px] p-8 w-full",
                            headerTitle: "text-[26px] font-bold text-white tracking-wide",
                            headerSubtitle: "text-white/70",
                            socialButtonsBlockButton: "bg-[#242424] hover:bg-[#303030] text-white border-white/10",
                            socialButtonsBlockButtonText: "text-white",
                            dividerLine: "bg-white/10",
                            dividerText: "text-white/50",
                            formFieldLabel: "text-[#ECA473]",
                            formFieldInput: "bg-transparent border border-white/10 rounded-xl text-white focus:border-[#ECA473]/50",
                            formButtonPrimary: "bg-[#FE9A44] hover:bg-[#F08A34] text-black font-semibold rounded-xl normal-case",
                            footerActionText: "text-white/70",
                            footerActionLink: "text-[#FE9A44] hover:text-[#FE9A44]/80",
                            identityPreviewText: "text-white",
                            identityPreviewEditButtonIcon: "text-[#FE9A44]"
                        }
                    }}
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
