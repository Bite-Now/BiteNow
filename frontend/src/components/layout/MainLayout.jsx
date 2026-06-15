import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';
import FloatingCartButton from '../common/FloatingCartButton';

const MainLayout = () => {
    return (
        <div className="min-h-screen flex justify-center bg-[#0a0a0a] selection:bg-primary-container selection:text-on-primary-container">
            <div className="relative w-full max-w-[440px] bg-background shadow-2xl h-[100dvh] overflow-hidden flex flex-col font-body-md text-body-md text-on-background antialiased">
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
