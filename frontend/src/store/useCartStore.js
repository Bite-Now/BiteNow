import { create } from 'zustand';

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
    }
}));
