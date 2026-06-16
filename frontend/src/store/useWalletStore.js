import { create } from 'zustand';

export const useWalletStore = create((set, get) => ({
    // State
    weeklyLimit: 2000,
    currentBalance: 2000,
    dailyCap: 500,
    treatVaultAmount: 0,
    transactions: [],

    // Actions
    setWeeklyLimit: (amount) => set((state) => {
        const diff = amount - state.weeklyLimit;
        return { 
            weeklyLimit: amount,
            currentBalance: Math.max(0, state.currentBalance + diff)
        };
    }),
    
    setDailyCap: (amount) => set({ dailyCap: amount }),
    
    setTreatVaultAmount: (amount) => set((state) => {
        // Can't lock more than current balance
        const lockAmount = Math.min(amount, state.currentBalance);
        return { treatVaultAmount: lockAmount };
    }),

    // Process a checkout order
    processOrderDeduction: (amount, canteenId, category = 'Food') => set((state) => {
        if (amount > state.currentBalance) {
            // Technically shouldn't happen if UI prevents it, but safety check
            return state;
        }
        
        const newTransaction = {
            id: Date.now().toString(),
            amount: amount,
            canteenId: canteenId || 'Unknown Canteen',
            category: category,
            timestamp: new Date().toISOString()
        };

        return {
            currentBalance: state.currentBalance - amount,
            transactions: [newTransaction, ...state.transactions]
        };
    }),

    // Seeder action (for testing charts)
    seedTransactions: (mockTransactions) => set({ transactions: mockTransactions })
}));
