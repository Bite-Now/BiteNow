import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';

const ProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { signOut } = useClerk();

    // Check system preference or localStorage for initial dark mode state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        // Apply dark mode on mount based on state
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const handleAction = async (action) => {
        setIsOpen(false);
        switch (action) {
            case 'logout':
                await signOut();
                navigate('/');
                break;
            default:
                console.log(`Action clicked: ${action}`);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Trigger */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:bg-surface-variant transition-colors active:scale-95"
            >
                <span className="material-symbols-outlined text-on-surface" data-icon="person">person</span>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-14 w-[280px] z-50 bg-[#1c1c1e] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-outline-variant/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    
                    {/* Header */}
                    <div className="p-4 border-b border-outline-variant/10 flex items-center gap-3 bg-[#1a1a1c]">
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 shadow-inner">
                            <span className="font-headline-sm text-on-primary-container font-bold">AE</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-label-md font-bold text-white">Ayman E.</span>
                            <span className="font-body-sm text-white/50">@ayman</span>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 flex flex-col gap-1">
                        <button onClick={() => handleAction('profile')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#2c2c2e] text-white/80 hover:text-white transition-all group">
                            <span className="material-symbols-outlined text-[20px] text-white/50 group-hover:text-white transition-colors" style={{ fontVariationSettings: "'wght' 300" }}>person</span>
                            <span className="font-label-md">Profile</span>
                        </button>
                        <button onClick={() => handleAction('settings')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#2c2c2e] text-white/80 hover:text-white transition-all group">
                            <span className="material-symbols-outlined text-[20px] text-white/50 group-hover:text-white transition-colors" style={{ fontVariationSettings: "'wght' 300" }}>settings</span>
                            <span className="font-label-md">Settings</span>
                        </button>
                        <button onClick={() => handleAction('notifications')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#2c2c2e] text-white/80 hover:text-white transition-all group">
                            <span className="material-symbols-outlined text-[20px] text-white/50 group-hover:text-white transition-colors" style={{ fontVariationSettings: "'wght' 300" }}>notifications</span>
                            <span className="font-label-md">Notifications</span>
                        </button>

                        <div className="h-[1px] bg-white/5 my-1 mx-2"></div>

                        <button onClick={toggleDarkMode} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#2c2c2e] text-white/80 hover:text-white transition-all group">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[20px] text-white/50 group-hover:text-white transition-colors" style={{ fontVariationSettings: "'wght' 300" }}>
                                    {isDarkMode ? 'dark_mode' : 'light_mode'}
                                </span>
                                <span className="font-label-md">Appearance</span>
                            </div>
                            <span className="font-body-sm text-white/40 group-hover:text-white/60 capitalize transition-colors">
                                {isDarkMode ? 'Dark' : 'Light'}
                            </span>
                        </button>

                        <div className="h-[1px] bg-white/5 my-1 mx-2"></div>

                        <button onClick={() => handleAction('logout')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-error/20 text-error/90 hover:text-error transition-all group">
                            <span className="material-symbols-outlined text-[20px] transition-colors" style={{ fontVariationSettings: "'wght' 300" }}>logout</span>
                            <span className="font-label-md">Log out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
