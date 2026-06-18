import React from 'react';
import { useWalletStore } from '../../store/useWalletStore';
import CollapsibleSection from '../common/CollapsibleSection';


export const WalletLedger = () => {
    const transactions = useWalletStore(state => state.transactions);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'text-blue-400';
            case 'PREPARING': return 'text-amber-400';
            case 'READY': return 'text-green-400';
            case 'PICKED_UP': return 'text-emerald-500';
            default: return 'text-on-surface-variant';
        }
    };

    return (
        <section className="flex flex-col gap-4 w-full">
            
            {/* Past Transactions */}
            <CollapsibleSection title="Recent Orders" icon="receipt_long" defaultOpen={false}>
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                    {transactions.length === 0 ? (
                        <p className="text-on-surface-variant text-center py-4 text-sm">No orders this month yet.</p>
                    ) : (
                        transactions.slice(0, 15).map(tx => {
                            const date = tx.timestamp ? new Date(tx.timestamp) : new Date();
                            const isRecent = (Date.now() - date.getTime()) < 24 * 60 * 60 * 1000;
                            
                            return (
                                <div key={tx.id} className="flex justify-between items-center bg-surface border border-outline-variant/30 p-3 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                                            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                                                restaurant
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-on-surface font-medium">{tx.canteenId}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-on-surface-variant text-xs">
                                                    {isRecent ? 'Today' : date.toLocaleDateString()}
                                                </span>
                                                {tx.status && (
                                                    <span className={`text-[10px] font-semibold uppercase ${getStatusColor(tx.status)}`}>
                                                        {tx.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-error font-semibold">-₹{tx.amount}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </CollapsibleSection>
        </section>
    );
};
