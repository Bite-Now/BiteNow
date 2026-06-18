import React, { useState } from 'react';
import { initialPendingBatches, initialSuccessfulBatches } from '../../data/mockVendorData';
import GoldenGlowButton from '../../components/ui/GoldenGlowButton';
import { useNotificationStore } from '../../store/useNotificationStore';

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
                        Ready
                    </span>
                )}
            </div>

            <div className="flex justify-between items-center mt-1">
                <div>
                    <h3 className="text-on-surface font-bold text-xl">₹{batch.total_amount}</h3>
                    <p className="text-on-surface-variant text-sm mt-1">
                        Items: {batch.items?.length || 0}
                    </p>
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
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingBatches, setPendingBatches] = useState(initialPendingBatches);
    const [successfulBatches, setSuccessfulBatches] = useState(initialSuccessfulBatches);
    const { addNotification } = useNotificationStore();

    const handleMarkReady = (batchId) => {
        const batchToMove = pendingBatches.find(b => b.id === batchId);
        if (batchToMove) {
            setPendingBatches(prev => prev.filter(b => b.id !== batchId));
            setSuccessfulBatches(prev => [
                { ...batchToMove, completedAt: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }, 
                ...prev
            ]);
            addNotification({
                type: 'order',
                title: 'Order Ready!',
                message: `Batch ${batchId} (${batchToMove.itemName}) is ready for pickup.`
            });
        }
    };

    const pendingBatches = orders.filter(o => o.status === 'PAID' || o.status === 'PREPARING');
    const successfulBatches = orders.filter(o => o.status === 'READY');

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
