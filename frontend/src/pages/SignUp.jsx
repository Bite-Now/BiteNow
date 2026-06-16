import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [role, setRole] = useState('student');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = (e) => {
        e.preventDefault();
        // Mock signup logic -> redirect to login
        navigate('/login');
    };

    return (
        <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col items-center justify-center p-container-margin md:p-xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-container/5 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-container/5 blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-surface-container-low rounded-[24px] shadow-[0_24px_40px_rgba(0,0,0,0.2)] p-lg md:p-xl relative z-10 border border-surface-variant">
                {/* Header */}
                <div className="flex justify-center mb-lg">
                    <img alt="BiteNow Logo" className="h-12 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQ2mo_wYAI65pCRmFGxq4TJ_lAua7Z5U4KZuNSr7vx2FL8Ten7Tad07jI_7t0peayIt-bcIywJAYmT2I130dCGWA33yNh9PPiSMdnH_s9EWykP5dNxq4-5J1hqz63SmYI3eWclrhIe29JN8Cvg6N4J8EU0VM89RQtkNXG4zgCfkLYmykUW3bwsaLFoahQWqv5o5_fSFD0fLsZ6Ie70CFDrmBsb8MSFfWLDASsYCycfYGtvt0dksD92cD_3q0JP0erDaP0rozUjY_nc"/>
                </div>
                
                <div className="flex items-center mb-xl">
                    <Link to="/login" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface">
                        <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
                    </Link>
                    <div className="flex-1 text-center pr-10">
                        <h1 className="font-headline-md text-headline-md text-on-surface">Create Account</h1>
                    </div>
                </div>

                {/* Segmented Control */}
                <div className="flex bg-surface-container-highest rounded-xl p-1 mb-xl relative">
                    <div 
                        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-primary-container rounded-lg shadow-sm transition-transform duration-300 ease-in-out" 
                        style={{ transform: role === 'student' ? 'translateX(0px)' : 'translateX(100%)' }}
                    ></div>
                    <button 
                        type="button"
                        onClick={() => setRole('student')}
                        className={`flex-1 py-sm text-center rounded-lg z-10 font-label-md text-label-md transition-colors ${role === 'student' ? 'text-surface-container-lowest' : 'text-on-surface-variant'}`}
                    >
                        User
                    </button>
                    <button 
                        type="button"
                        onClick={() => setRole('staff')}
                        className={`flex-1 py-sm text-center rounded-lg z-10 font-label-md text-label-md transition-colors ${role === 'staff' ? 'text-surface-container-lowest' : 'text-on-surface-variant'}`}
                    >
                        Staff
                    </button>
                </div>

                {/* Form */}
                <form className="space-y-md" onSubmit={handleSignUp}>
                    {/* Full Name */}
                    <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Full Name</label>
                        <div className="input-surface rounded-lg border border-surface-variant input-focus-ring flex items-center px-sm py-sm transition-colors">
                            <span className="material-symbols-outlined text-on-surface-variant mr-sm text-[20px]" data-icon="person">person</span>
                            <input className="w-full bg-transparent border-none p-0 text-on-surface placeholder-on-surface-variant/50 focus:ring-0 font-body-md text-body-md" placeholder="John Doe" required type="text" />
                        </div>
                    </div>

                    {/* Email / ID */}
                    <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">
                            {role === 'staff' ? 'Staff Email' : 'Student ID / Email'}
                        </label>
                        <div className="input-surface rounded-lg border border-surface-variant input-focus-ring flex items-center px-sm py-sm transition-colors">
                            <span className="material-symbols-outlined text-on-surface-variant mr-sm text-[20px]" data-icon="badge">badge</span>
                            <input className="w-full bg-transparent border-none p-0 text-on-surface placeholder-on-surface-variant/50 focus:ring-0 font-body-md text-body-md" placeholder={role === 'staff' ? 'name@staff.edu' : 'e.g. 12345678'} required type="text" />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Password</label>
                        <div className="input-surface rounded-lg border border-surface-variant input-focus-ring flex items-center px-sm py-sm transition-colors">
                            <span className="material-symbols-outlined text-on-surface-variant mr-sm text-[20px]" data-icon="lock">lock</span>
                            <input className="w-full bg-transparent border-none p-0 text-on-surface placeholder-on-surface-variant/50 focus:ring-0 font-body-md text-body-md" placeholder="••••••••" required type={showPassword ? "text" : "password"} />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-on-surface-variant hover:text-on-surface"
                            >
                                <span className="material-symbols-outlined text-[20px]" data-icon={showPassword ? "visibility_off" : "visibility"}>
                                    {showPassword ? "visibility_off" : "visibility"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Confirm Password</label>
                        <div className="input-surface rounded-lg border border-surface-variant input-focus-ring flex items-center px-sm py-sm transition-colors">
                            <span className="material-symbols-outlined text-on-surface-variant mr-sm text-[20px]" data-icon="lock_reset">lock_reset</span>
                            <input className="w-full bg-transparent border-none p-0 text-on-surface placeholder-on-surface-variant/50 focus:ring-0 font-body-md text-body-md" placeholder="••••••••" required type="password" />
                        </div>
                    </div>

                    {/* Sign Up Button */}
                    <div className="pt-sm">
                        <button className="w-full bg-primary-container text-surface-container-lowest font-label-md text-label-md py-md rounded-xl btn-glow transition-all duration-200 shadow-lg shadow-primary-container/20" type="submit">
                            Sign Up
                        </button>
                    </div>
                </form>

                {/* Login Link */}
                <div className="mt-lg text-center">
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Already have an account?{' '}
                        <Link className="text-primary-container font-label-md text-label-md hover:underline decoration-2 underline-offset-4" to="/login">Log In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
