import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';

const FloatingCartButton = () => {
    const navigate = useNavigate();
    const { getTotalItems, getTotalPrice } = useCartStore();
    
    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();
    const location = useLocation();

    return (
        <div 
            className={`absolute bottom-28 right-6 z-50 transition-all duration-300 ease-in-out ${
                totalItems > 0 && location.pathname !== '/cart'
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-90 pointer-events-none'
            }`}
        >
            <button 
                onClick={() => navigate('/cart')}
                className="bg-primary-container text-on-primary-container px-4 py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-3 active:scale-95 group glow-effect border border-primary/20"
            >
                <div className="relative">
                    <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
                    <span className="absolute -top-2 -right-2 bg-error text-on-error font-label-sm text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
                        {totalItems}
                    </span>
                </div>
                <div className="flex flex-col items-start">
                    <span className="font-label-sm text-[10px] uppercase tracking-wider opacity-80">View Cart</span>
                    <span className="font-label-md font-bold leading-none">₹{totalPrice}</span>
                </div>
                <span className="material-symbols-outlined text-[20px] opacity-70 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
        </div>
    );
};

export default FloatingCartButton;
