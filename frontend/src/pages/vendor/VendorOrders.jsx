import React, { useState, useEffect } from 'react';
import GoldenGlowButton from '../../components/ui/GoldenGlowButton';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuth } from '../../hooks/useAuth';
import { getOwnerOrders, getStaffOrders, markOrderReadyOwner, markOrderReadyStaff, getNotifications } from '../../services/ordersApi';

const BatchCard = ({ batch, onMarkReady, isPending }) => {
    return (
        <div className="bg-surface-container rounded-[20px] p-4 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <span className="bg-primary/20 text-primary font-bold text-xs px-2 py-1 rounded-md">
                        #{batch.order_number || batch.id.substring(0,8)}
                    </span>
                    <span className="text-on-surface-variant text-xs">{new Date(batch.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                {isPending ? (
                    <span className="bg-[#f59e0b]/20 text-[#f59e0b] font-medium text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse"></span>
                        Cooking
                    </span>
                ) : (
                    <span className="bg-[#22c55e]/20 text-[#22c55e] font-medium text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        {batch.status === 'READY' ? 'Ready' : batch.status === 'COLLECTED' ? 'Collected' : 'Completed'}
                    </span>
                )}
            </div>

            <div className="flex justify-between items-center mt-1">
                <div className="w-full">
                    <div className="flex flex-col gap-1 w-full border-b border-outline-variant/10 pt-2">
                        {batch.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between mb-2 text-sm">
                                <span className="text-on-surface font-medium truncate pr-2">{item.menu_item_name || 'Unknown Item'}</span>
                                <span className="text-on-surface-variant shrink-0">x{item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-2">    
                        <span className="text-on-surface font-bold text-md mb-2">Total</span>
                        <h3 className="text-on-surface font-bold text-md mb-2">₹{batch.total_amount}</h3>
                    </div>
                </div>
            </div>

            {isPending && (
                <div className="mt-2">
                    <GoldenGlowButton 
                        variant="neutral"
                        onClick={() => onMarkReady(batch.id)}
                        className="w-full"
                    >
                        Mark Ready
                    </GoldenGlowButton>
                </div>
            )}
        </div>
    );
};

const VendorOrders = () => {
    const { role } = useAuth();
    const [activeTab, setActiveTab] = useState('pending');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addNotification, setBackendNotifications } = useNotificationStore();

    const fetchOrders = async () => {
        try {
            let data;
            if (role === 'STAFF') {
                data = await getStaffOrders();
            } else {
                data = await getOwnerOrders();
            }
            setOrders(data);
            setError(null);
            
            try {
                const notifs = await getNotifications();
                setBackendNotifications(notifs);
            } catch (notifErr) {
                console.error("Failed to fetch notifications:", notifErr);
            }
        } catch (err) {
            console.error("Failed to fetch vendor orders:", err);
            setError("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!role) return;
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [role]);

    const handleMarkReady = async (batchId) => {
        try {
            if (role === 'STAFF') {
                await markOrderReadyStaff(batchId);
            } else {
                await markOrderReadyOwner(batchId);
            }
            
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === batchId ? { ...o, status: 'READY' } : o));
            
        } catch (err) {
            console.error("Failed to mark order ready", err);
            addNotification({
                type: 'error',
                title: 'Update Failed',
                message: err.response?.data?.detail || 'Could not mark order ready'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center mt-20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center mt-20 text-error">{error}</div>;
    }

    const pendingBatches = orders.filter(o => o.status === 'PAID' || o.status === 'PREPARING');
    const successfulBatches = orders.filter(o => ['READY', 'COMPLETED', 'COLLECTED'].includes(o.status));

    const currentBatches = activeTab === 'pending' ? pendingBatches : successfulBatches;

    return (
        <div className="flex flex-col gap-6 w-full pb-32 pt-6 px-4 relative">
            
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display-sm text-on-surface">Orders Pipeline</h1>
                    <p className="text-on-surface-variant text-sm">Manage kitchen batches</p>
                </div>
            </div>

            {/* Segmented Control */}
            <div className="flex bg-surface-container rounded-xl p-1 shadow-sm border border-outline-variant/20">
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'pending' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                    Pending ({pendingBatches.length})
                </button>
                <button 
                    onClick={() => setActiveTab('successful')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'successful' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                    Successful ({successfulBatches.length})
                </button>
            </div>

            {/* Batch List */}
            <div className="flex flex-col gap-4 mt-2">
                {currentBatches.length === 0 ? (
                    <div className="text-center text-on-surface-variant mt-10">
                        <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">inbox</span>
                        <p>No {activeTab} batches.</p>
                    </div>
                ) : (
                    currentBatches.map(batch => (
                        <BatchCard 
                            key={batch.id} 
                            batch={batch} 
                            isPending={activeTab === 'pending'}
                            onMarkReady={handleMarkReady} 
                        />
                    ))
                )}
            </div>

        </div>
    );
};

export default VendorOrders;
