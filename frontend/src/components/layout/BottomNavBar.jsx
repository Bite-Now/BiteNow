import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { useAuth } from '../../hooks/useAuth';

const STUDENT_NAV_ITEMS = [
    { icon: 'home', id: 'home', path: '/home' },
    { icon: 'receipt_long', id: 'orders', path: '/orders' },
    { icon: 'restaurant', id: 'surprise', path: '/surprise' },
    { icon: 'account_balance_wallet', id: 'budget', path: '/budget' }
];

const VENDOR_NAV_ITEMS = [
    { icon: 'home', id: 'vendor_dashboard', path: '/vendor/dashboard' },
    { icon: 'receipt_long', id: 'vendor_orders', path: '/vendor/orders' },
    { icon: 'inventory_2', id: 'vendor_products', path: '/vendor/products' },
    { icon: 'account_balance_wallet', id: 'vendor_earnings', path: '/vendor/earnings' },
    { icon: 'group', id: 'vendor_staff', path: '/vendor/staff' }
];

const STAFF_NAV_ITEMS = [
    { icon: 'receipt_long', id: 'staff_orders', path: '/staff/orders' },
    { icon: 'inventory_2', id: 'staff_products', path: '/staff/products' }
];

const BottomNavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const scrollDirection = useScrollDirection();
    const { role } = useAuth();

    const currentNavItems = role === 'OWNER' 
        ? VENDOR_NAV_ITEMS 
        : role === 'STAFF' 
        ? STAFF_NAV_ITEMS 
        : STUDENT_NAV_ITEMS;
    const mainTabPaths = currentNavItems.map(item => item.path);
    
    // Spotlight memory state
    const [activeTab, setActiveTab] = useState(0);

    // Determine if the navbar should be visible
    // It's visible if we are on a main tab AND the user hasn't scrolled down.
    const isMainTab = mainTabPaths.includes(location.pathname);
    const showNavBar = isMainTab && scrollDirection !== 'down';

    useEffect(() => {
        // Only update activeTab if we are navigating to a main tab.
        // This ensures the spotlight stays in place when hiding.
        const index = currentNavItems.findIndex(item => item.path === location.pathname);
        if (index !== -1) {
            setActiveTab(index);
        }
    }, [location.pathname, currentNavItems]);

    const itemWidthPercent = 100 / currentNavItems.length;

    return (
        <nav 
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] rounded-[24px] bg-[#1c1c1e] shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex justify-between items-center py-4 overflow-hidden z-40 transition-transform duration-300 ease-in-out ${
                showNavBar ? 'translate-y-0' : 'translate-y-[150%]'
            }`}
        >
            {/* Spotlight animated indicator */}
            <div
                className="absolute top-0 h-[3px] bg-white rounded-b-md shadow-[0_2px_8px_rgba(255,255,255,0.8)] transition-all duration-300 ease-out z-10"
                style={{
                    left: `calc(${activeTab * itemWidthPercent}% + ${itemWidthPercent / 2}% - 16px)`,
                    width: '32px'
                }}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-[40px] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}></div>
            </div>

            {currentNavItems.map((item, index) => {
                const isActive = activeTab === index;
                return (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center justify-center transition-all duration-300 z-20 ${isActive && showNavBar ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                        style={{ width: `${itemWidthPercent}%` }}
                    >
                        <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNavBar;
