import { create } from 'zustand';
import { useWalletStore } from './useWalletStore';

export const useCartStore = create((set, get) => ({
    items: [], // Array of { ...menuItem, quantity, canteenId }
    
    addToCart: (item, canteenId) => set((state) => {
        const existingItem = state.items.find(i => i.id === item.id);
        if (existingItem) {
            return {
                items: state.items.map(i => 
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            };
        }
        return { items: [...state.items, { ...item, quantity: 1, canteenId }] };
    }),

    removeFromCart: (itemId) => set((state) => {
        const existingItem = state.items.find(i => i.id === itemId);
        if (existingItem && existingItem.quantity > 1) {
            return {
                items: state.items.map(i => 
                    i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
                )
            };
        }
        return {
            items: state.items.filter(i => i.id !== itemId)
        };
    }),

    clearCart: () => set({ items: [] }),

    getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
    },

    getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    checkout: () => {
        const state = get();
        if (state.items.length === 0) return false;
        
        const total = state.getTotalPrice();
        const walletState = useWalletStore.getState();
        
        if (total > walletState.remainingBalance) {
            return false; // Insufficient funds
        }
        
        // Note: The actual order placement is handled by MockPayment.jsx,
        // which calls the API and updates the wallet store via onOrderPlaced.
        state.clearCart();
        return true;
    }
}));
