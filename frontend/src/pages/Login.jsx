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
                    fallbackRedirectUrl="/home"
                />
            </div>
        </div>
    );
};

export default Login;
