import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const SettingsLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getTitle = () => {
        if (location.pathname.includes('/profile')) return 'Personal Profile';
        if (location.pathname.includes('/canteen')) return 'Canteen Settings';
        return 'Settings';
    };

    return (
        <div className="flex flex-col min-h-screen bg-background relative pb-24 font-body-md transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 flex items-center px-4 py-4 shadow-sm">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 -ml-2 text-on-surface hover:bg-surface-variant rounded-full transition-colors active:scale-95"
                >
                    <span className="material-symbols-outlined text-2xl leading-none">arrow_back</span>
                </button>
                <h1 className="font-headline-sm font-bold text-on-surface ml-2">{getTitle()}</h1>
            </header>

            <main className="px-4 py-6 flex flex-col gap-8 flex-grow animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default SettingsLayout;
