import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Login = () => {
    return (
        <div className="bg-[#121212] text-white font-sans min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[400px] relative z-10 flex justify-center">
                <SignIn 
                    routing="path" 
                    path="/login" 
                    signUpUrl="/signup" 
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
            </div>
        </div>
    );
};

export default Login;
