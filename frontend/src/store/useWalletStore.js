import { create } from 'zustand';
import api from '../services/api';

export const useWalletStore = create((set, get) => ({
    // State
    monthlyLimit: null,
    totalSpentThisMonth: 0,
    remainingBalance: 0,
    transactions: [],
    canteenBreakdown: [],
    loading: false,
    error: null,

    // Fetch wallet data from the backend
    fetchWalletData: async () => {
        const { monthlyLimit } = get();
        // SWR: only show loading spinner on first load
        if (monthlyLimit === null) {
            set({ loading: true });
        }

        try {
            const response = await api.get('/student/wallet');
            const data = response.data;
            set({
                monthlyLimit: data.monthly_budget_limit,
                totalSpentThisMonth: data.total_spent_this_month,
                remainingBalance: data.remaining_balance,
                transactions: data.transactions || [],
                canteenBreakdown: data.canteen_breakdown || [],
                loading: false,
                error: null,
            });
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
            set({ loading: false, error: error.message });
        }
    },

    // Update the monthly budget limit
    updateBudgetLimit: async (newLimit) => {
        try {
            const response = await api.patch('/student/wallet/limit', {
                monthly_budget_limit: newLimit,
            });
            const data = response.data;
            set({
                monthlyLimit: data.monthly_budget_limit,
                totalSpentThisMonth: data.total_spent_this_month,
                remainingBalance: data.remaining_balance,
                transactions: data.transactions || [],
                canteenBreakdown: data.canteen_breakdown || [],
                error: null,
            });
            return true;
        } catch (error) {
            console.error('Failed to update budget limit:', error);
            set({ error: error.message });
            return false;
        }
    },

    // Called after a successful checkout to instantly update spending
    onOrderPlaced: (totalSpentThisMonth) => set((state) => ({
        totalSpentThisMonth: totalSpentThisMonth,
        remainingBalance: Math.max(0, (state.monthlyLimit || 0) - totalSpentThisMonth),
    })),
}));
