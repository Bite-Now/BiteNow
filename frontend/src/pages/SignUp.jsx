import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isVendor, setIsVendor] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = (e) => {
        e.preventDefault();
        // Mock signup logic -> redirect to login
        navigate('/login');
    };

    return (
        <div className="bg-[#121212] text-white font-sans min-h-screen flex flex-col items-center justify-center p-4">
            
            <div className="w-full max-w-[400px] bg-[#1A1A1A] rounded-[32px] p-8 shadow-2xl border border-white/5 relative z-10">
                
                {/* Logo (Fork and Spoon) */}
                <div className="flex justify-center mb-8">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 11V19C11 19.5523 10.5523 20 10 20C9.44772 20 9 19.5523 9 19V11C9 10.4477 9 10 9 10V6.5C9 5.67157 9.67157 5 10.5 5C11.3284 5 12 5.67157 12 6.5V10C12 10 12 10.4477 11 11Z" stroke="#E89D66" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 7H12" stroke="#E89D66" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M15 13L18.5 9.5C19.3284 8.67157 19.3284 7.32843 18.5 6.5C17.6716 5.67157 16.3284 5.67157 15.5 6.5L12 10" stroke="#E89D66" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13 19L16 16" stroke="#E89D66" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 6L18 18" stroke="#E89D66" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18 6L6 18" stroke="#E89D66" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                
                {/* Header */}
                <div className="flex items-center mb-8">
                    <Link to="/login" className="w-10 h-10 flex items-center justify-start text-white hover:text-white/80 transition-colors">
                        <span className="material-symbols-outlined text-[24px]" data-icon="arrow_back">arrow_back</span>
                    </Link>
                    <div className="flex-1 text-center pr-10">
                        <h1 className="text-[24px] font-bold text-white tracking-wide">Create Account</h1>
                    </div>
                </div>

                {/* Form */}
                <form className="space-y-5" onSubmit={handleSignUp}>
                    
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-[#E89D66] ml-1">Full Name</label>
                        <div className="flex items-center bg-transparent border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-[#E89D66]/50 transition-colors">
                            <span className="material-symbols-outlined text-[#E89D66] text-[20px] mr-3" data-icon="person">person</span>
                            <input 
                                className="w-full bg-transparent border-none p-0 text-white placeholder-white/40 focus:ring-0 text-[15px] outline-none" 
                                placeholder="John Doe" 
                                required 
                                type="text" 
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-[#E89D66] ml-1">Email</label>
                        <div className="flex items-center bg-transparent border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-[#E89D66]/50 transition-colors">
                            <span className="material-symbols-outlined text-[#E89D66] text-[20px] mr-3" data-icon="badge">badge</span>
                            <input 
                                className="w-full bg-transparent border-none p-0 text-white placeholder-white/40 focus:ring-0 text-[15px] outline-none" 
                                placeholder="e.g. john@example.com" 
                                required 
                                type="email" 
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-[#E89D66] ml-1">Password</label>
                        <div className="flex items-center bg-transparent border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-[#E89D66]/50 transition-colors">
                            <span className="material-symbols-outlined text-[#E89D66] text-[20px] mr-3" data-icon="lock">lock</span>
                            <input 
                                className="w-full bg-transparent border-none p-0 text-white placeholder-white/40 focus:ring-0 text-[15px] outline-none tracking-widest" 
                                placeholder="••••••••" 
                                required 
                                type={showPassword ? "text" : "password"} 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[#E89D66] hover:text-[#E89D66]/80 flex items-center justify-center ml-2"
                            >
                                <span className="material-symbols-outlined text-[20px]" data-icon={showPassword ? "visibility_off" : "visibility"}>
                                    {showPassword ? "visibility_off" : "visibility"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="flex items-center justify-center space-x-4 py-3">
                        <div className="h-[1px] bg-white/10 flex-1"></div>
                        <span className="text-[13px] font-medium text-[#E89D66]">Or continue with</span>
                        <div className="h-[1px] bg-white/10 flex-1"></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="flex justify-center gap-4 mb-2">
                        <button type="button" className="w-12 h-12 rounded-full bg-[#242424] hover:bg-[#303030] flex items-center justify-center transition-colors">
                            {/* Google Logo SVG */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.86 16.79 15.69 17.57V20.34H19.26C21.34 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                                <path d="M12 23C14.97 23 17.46 22.02 19.26 20.34L15.69 17.57C14.71 18.23 13.46 18.63 12 18.63C9.17001 18.63 6.76001 16.72 5.90001 14.16H2.21001V17.02C4.01001 20.59 7.71001 23 12 23Z" fill="#34A853"/>
                                <path d="M5.90001 14.16C5.68001 13.5 5.56001 12.77 5.56001 12C5.56001 11.23 5.68001 10.5 5.90001 9.84001V6.98001H2.21001C1.47001 8.46001 1.05001 10.18 1.05001 12C1.05001 13.82 1.47001 15.54 2.21001 17.02L5.90001 14.16Z" fill="#FBBC05"/>
                                <path d="M12 5.38C13.62 5.38 15.06 5.93 16.21 7.02L19.34 3.89C17.45 2.13 14.97 1.05 12 1.05C7.71001 1.05 4.01001 3.41 2.21001 6.98001L5.90001 9.84001C6.76001 7.28 9.17001 5.38 12 5.38Z" fill="#EA4335"/>
                            </svg>
                        </button>
                        <button type="button" className="w-12 h-12 rounded-full bg-[#242424] hover:bg-[#303030] flex items-center justify-center transition-colors">
                            {/* Apple Logo SVG */}
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.364 8.0163C16.3262 5.86433 18.0664 4.80164 18.1472 4.75013C17.0544 3.15177 15.3142 2.91136 14.717 2.8255C13.3323 2.68812 11.9664 3.64983 11.2483 3.64983C10.5492 3.64983 9.43444 2.84268 8.28189 2.85984C6.81525 2.87702 5.46187 3.7185 4.70777 5.02364C3.16104 7.70265 4.31061 11.666 5.81827 13.847C6.55353 14.9117 7.4208 16.1138 8.57335 16.0623C9.6881 16.0108 10.1217 15.341 11.4593 15.341C12.7969 15.341 13.1929 16.0623 14.3642 16.0452C15.5733 16.028 16.3262 14.946 17.0614 13.8642C17.9272 12.5934 18.2848 11.357 18.3037 11.2883C18.2659 11.2711 16.4018 10.5671 16.364 8.0163Z" fill="white"/>
                                <path d="M14.0759 1.76121C14.716 0.988457 15.1301 0.0096647 15.0166 -0.969238C14.1695 -0.934891 13.0587 -0.402534 12.3999 0.387258C11.8164 1.07415 11.3086 2.08736 11.4592 3.03187C12.4194 3.10056 13.4359 2.53386 14.0759 1.76121Z" fill="white"/>
                            </svg>
                        </button>
                    </div>

                    {/* Vendor Link */}
                    <div className="flex items-center justify-center py-2">
                        <button 
                            type="button"
                            onClick={() => setIsVendor(!isVendor)} // Or open a modal here
                            className="text-[14px] text-[#3B82F6] hover:text-[#60A5FA] font-medium hover:underline transition-colors focus:outline-none"
                        >
                            Request to join as a vendor
                        </button>
                    </div>

                    {/* Sign Up Button */}
                    <div className="pt-2">
                        <button 
                            className="w-full bg-[#FE9A44] hover:bg-[#F08A34] text-black font-semibold text-[15px] py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(254,154,68,0.25)] active:scale-[0.98]" 
                            type="submit"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-[14px] text-white/70">
                        Already have an account?{' '}
                        <Link className="text-[#FE9A44] font-semibold hover:underline" to="/login">Log In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
