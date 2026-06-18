import React from 'react';
import { useLocation } from 'react-router-dom';
import ProfileDropdown from '../common/ProfileDropdown';
import { BiteNowNotificationPopover } from '../ui/bitenow-notification-popover';
import { useWalletStore } from '../../store/useWalletStore';

const TopAppBar = () => {
    const location = useLocation();
    const { currentBalance } = useWalletStore();
    
    // Hide TopAppBar on deep linking pages that have their own custom headers
    const hiddenPaths = ['/cart', '/history', '/canteen', '/settings', '/surprise'];
    const isHidden = hiddenPaths.some(path => location.pathname.startsWith(path));

    if (isHidden) return null;

    return (
        <header className="z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-md shadow-lg shadow-primary/5 flex justify-between items-center px-4 py-3 shrink-0 border-b border-outline-variant/10">
            <div className="flex items-center gap-2">
                
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => {
                    const scrollContainer = document.getElementById('app-scroll-container');
                    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
                    <h1 className="font-headline-md text-xl font-bold text-primary dark:text-primary-fixed-dim active:scale-95 transition-transform duration-200">BiteNow</h1>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <BiteNowNotificationPopover />
                <ProfileDropdown />
            </div>
        </header>
    );
};

export default TopAppBar;
