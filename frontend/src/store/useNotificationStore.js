import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    
    addNotification: (notification) => set((state) => ({
        notifications: [
            {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: false,
                ...notification
            },
            ...state.notifications
        ]
    })),

    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        )
    })),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
    })),

    getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length;
    }
}));
