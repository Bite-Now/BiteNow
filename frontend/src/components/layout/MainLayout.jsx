import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';
import FloatingCartButton from '../common/FloatingCartButton';
import { useVendorStore } from '../../store/useVendorStore';

const MainLayout = () => {
    const navigate = useNavigate();
    const { isVendorMode, toggleVendorMode } = useVendorStore();

    const handleToggleRole = () => {
        toggleVendorMode();
        navigate('/'); // Push to root so RootRedirect takes over
    };

    return (
        <div className="min-h-screen flex justify-center bg-[#0a0a0a] selection:bg-primary-container selection:text-on-primary-container">
            <div className="relative w-full max-w-[440px] bg-background shadow-2xl h-[100dvh] overflow-hidden flex flex-col font-body-md text-body-md text-on-background antialiased">
                {/* Developer Role Toggle */}
                <button 
                    onClick={handleToggleRole}
                    className="absolute top-4 right-4 z-50 bg-primary/20 backdrop-blur-md border border-primary/50 text-primary px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
                >
                    <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                    {isVendorMode ? 'Vendor View' : 'Student View'}
                </button>

                <main className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
                    <Outlet />
                </main>
                <FloatingCartButton />
                <BottomNavBar />
            </div>
        </div>
    );
};

export default MainLayout;
