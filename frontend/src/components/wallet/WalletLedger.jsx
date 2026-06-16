import React from 'react';
import { useWalletStore } from '../../store/useWalletStore';
import CollapsibleSection from '../common/CollapsibleSection';

const IOU_MOCK_DATA = [
    { id: 1, name: 'Rahul', amount: 150, type: 'owes_you' },
    { id: 2, name: 'Priya', amount: 80, type: 'you_owe' },
];

export const WalletLedger = () => {
    const transactions = useWalletStore(state => state.transactions);

    return (
        <section className="flex flex-col gap-4 w-full">
            {/* IOU Ledger */}
            <CollapsibleSection title="Social Ledger" icon="group" defaultOpen={false}>
                <div className="flex flex-col gap-3">
                    {IOU_MOCK_DATA.map(iou => (
                        <div key={iou.id} className="flex justify-between items-center bg-surface border border-outline-variant/30 p-3 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold">
                                    {iou.name.charAt(0)}
                                </div>
                                <span className="text-on-surface font-medium">{iou.name}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-sm ${iou.type === 'owes_you' ? 'text-primary' : 'text-error'}`}>
                                    {iou.type === 'owes_you' ? 'Owes You' : 'You Owe'}
                                </span>
                                <span className="text-on-surface font-bold">₹{iou.amount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>

            {/* Past Transactions */}
            <CollapsibleSection title="Recent Transactions" icon="receipt_long" defaultOpen={false}>
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                    {transactions.length === 0 ? (
                        <p className="text-on-surface-variant text-center py-4 text-sm">No transactions yet.</p>
                    ) : (
                        transactions.slice(0, 10).map(tx => {
                            const date = new Date(tx.timestamp);
                            const isRecent = (Date.now() - date.getTime()) < 24 * 60 * 60 * 1000;
                            
                            return (
                                <div key={tx.id} className="flex justify-between items-center bg-surface border border-outline-variant/30 p-3 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                                            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                                                {tx.category === 'Food' ? 'restaurant' : 
                                                 tx.category === 'Beverages' ? 'local_cafe' : 
                                                 tx.category === 'Dessert' ? 'icecream' : 'fastfood'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-on-surface font-medium">{tx.canteenId}</span>
                                            <span className="text-on-surface-variant text-xs">
                                                {isRecent ? 'Today' : date.toLocaleDateString()}
                                            </span>
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
