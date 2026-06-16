import { create } from 'zustand';

export const useVendorStore = create((set) => ({
    isVendorMode: false, // Defaulting to true for development purposes
    toggleVendorMode: () => set((state) => ({ isVendorMode: !state.isVendorMode })),
    setVendorMode: (value) => set({ isVendorMode: value }),
}));
