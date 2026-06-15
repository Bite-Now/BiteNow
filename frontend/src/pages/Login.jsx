import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const Login = () => {
    const [role, setRole] = useState('student');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        login({ role });
        navigate('/home');
    };

    return (
        <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-xl">
            {/* Decorative background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-container/5 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-container/5 blur-[120px] pointer-events-none"></div>

            <main className="w-full max-w-[380px] px-container-margin z-10 relative bg-surface-container-low rounded-[24px] shadow-[0_24px_40px_rgba(0,0,0,0.2)] p-lg border border-surface-variant pt-xl">
                {/* Header */}
                <div className="text-center mb-xl">
                    <div className="flex justify-center mb-md">
                        <img 
                            alt="BiteNow Logo" 
                            className="h-16 w-auto object-contain" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGObH6p6w85KoEbQ0_H3IQVbrGJlevFUcLRDjdRkBNkpJVpwYx2IqN0UxpqXwSXw4iS4M59AZgsxoepXO35pQHVivY-6jw63nyRzzgqv3tiHE6di1J9H_pIGq4-NojCWnxiIW1XPkGf_A_YxSgcmuduAeo7xlyxVNBqXZnPi1oC-i089xPCBt8VgnJIVjccqekExzXzebtqkR0NCDZr3Fh3pWpeFWEP4P6S3ZAM7ZVlEgW1r-WPQ5w34P3XjdE7ciImHGCvzjez3Y-"
                        />
                    </div>
                    <h1 className="font-headline-xl text-headline-xl text-on-surface mb-xs hidden md:block">Welcome Back</h1>
                    <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-xs md:hidden">Welcome Back</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">Log in to continue your BiteNow experience.</p>
                </div>

                {/* Role Selector */}
                <div className="flex bg-surface-container-highest rounded-xl p-1 mb-xl relative">
                    <div 
                        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-primary-container rounded-lg shadow-sm transition-transform duration-300 ease-in-out" 
                        style={{ transform: role === 'student' ? 'translateX(0px)' : 'translateX(100%)' }}
                    ></div>
                    <button 
                        type="button"
                        onClick={() => setRole('student')}
                        className={`flex-1 py-sm font-label-md text-label-md relative z-10 text-center transition-colors ${role === 'student' ? 'text-on-primary-container' : 'text-on-surface-variant'}`}
                    >
                        User
                    </button>
                    <button 
                        type="button"
                        onClick={() => setRole('staff')}
                        className={`flex-1 py-sm font-label-md text-label-md relative z-10 text-center transition-colors ${role === 'staff' ? 'text-on-primary-container' : 'text-on-surface-variant'}`}
                    >
                        Staff
                    </button>
                </div>

                {/* Login Form */}
                <form className="space-y-md" onSubmit={handleLogin}>
                    <div className="space-y-md p-md bg-surface-container-low rounded-xl border border-outline-variant">
                        {/* Email/ID Input */}
                        <div className="space-y-xs">
                            <label className="font-label-sm text-label-sm text-on-surface-variant block" htmlFor="identifier">
                                {role === 'staff' ? 'Staff Email' : 'Email or Student ID'}
                            </label>
                            <div className="relative flex items-center bg-[#1A1A1A] rounded-lg border border-outline-variant input-focus-ring transition-all duration-200">
                                <span className="material-symbols-outlined absolute left-sm text-on-surface-variant" data-icon="person">person</span>
                                <input 
                                    id="identifier" 
                                    className="w-full bg-transparent border-none py-sm pl-[40px] pr-sm text-on-surface font-body-md focus:ring-0 placeholder:text-surface-variant rounded-lg" 
                                    placeholder={role === 'staff' ? 'name@staff.edu' : 'Enter your email or ID'}
                                    required 
                                    type="text" 
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-xs">
                            <div className="flex justify-between items-center">
                                <label className="font-label-sm text-label-sm text-on-surface-variant block" htmlFor="password">Password</label>
                            </div>
                            <div className="relative flex items-center bg-[#1A1A1A] rounded-lg border border-outline-variant input-focus-ring transition-all duration-200">
                                <span className="material-symbols-outlined absolute left-sm text-on-surface-variant" data-icon="lock">lock</span>
                                <input 
                                    id="password" 
                                    className="w-full bg-transparent border-none py-sm pl-[40px] pr-[40px] text-on-surface font-body-md focus:ring-0 placeholder:text-surface-variant rounded-lg" 
                                    placeholder="Enter your password" 
                                    required 
                                    type={showPassword ? "text" : "password"}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-sm text-on-surface-variant hover:text-on-surface transition-colors" 
                                >
                                    <span className="material-symbols-outlined" data-icon={showPassword ? "visibility_off" : "visibility"}>
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                            <div className="flex mt-2">
                                <Link className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors" to="#">Forgot Password?</Link>
                            </div>
                        </div>
                    </div>

                    {/* Primary Action */}
                    <div className="pt-sm">
                        <button className="w-full bg-primary-container text-on-primary-container font-label-md text-label-md py-sm hover:bg-primary transition-colors active:scale-[0.98] glow-effect flex items-center justify-center gap-2 rounded-xl py-md" type="submit">
                            Log In
                            <span className="material-symbols-outlined text-lg" data-icon="arrow_forward">arrow_forward</span>
                        </button>
                    </div>
                </form>

                {/* Sign Up Link */}
                <div className="text-center mt-xl">
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Don't have an account?{' '}
                        <Link className="font-label-md text-label-md text-primary hover:text-primary-fixed transition-colors underline-offset-4 hover:underline" to="/signup">Sign Up</Link>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Login;
