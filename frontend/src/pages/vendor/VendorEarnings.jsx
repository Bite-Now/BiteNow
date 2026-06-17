import React from 'react';
import { dashboardStats, payoutHistory } from '../../data/mockVendorData';

const VendorEarnings = () => {
    return (
        <div className="flex flex-col gap-6 w-full pb-32 pt-6 px-4 relative">
            
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display-sm text-on-surface">Data & Reports</h1>
                    <p className="text-on-surface-variant text-sm">Financial overview and exports</p>
                </div>
            </div>

            {/* Wallet Balance Card */}
            <div className="bg-surface-container rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-4 relative">
                {/* Decorative background glow */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex justify-between items-start z-10">
                    <div>
                        <p className="text-on-surface-variant text-sm font-medium">Available Balance</p>
                        <h2 className="text-on-surface font-display-md mt-1">{dashboardStats.earnings}</h2>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
                    </div>
                </div>

                <div className="flex gap-3 z-10 mt-2">
                    <button className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-[0_4px_14px_0_rgba(255,159,67,0.39)] transition-transform active:scale-[0.98]">
                        Withdraw Funds
                    </button>
                </div>
            </div>

            {/* Payout History */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-1">
                    <span className="material-symbols-outlined text-tertiary text-xl">history</span>
                    <h2 className="text-on-surface font-bold text-lg">Recent Payouts</h2>
                </div>
                
                <div className="bg-surface-container rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
                    {payoutHistory.map((payout, idx) => (
                        <div 
                            key={payout.id} 
                            className={`p-4 flex justify-between items-center ${idx !== payoutHistory.length - 1 ? 'border-b border-outline-variant/20' : ''}`}
                        >
                            <div className="flex flex-col gap-1">
                                <span className="text-on-surface font-bold">{payout.amount}</span>
                                <span className="text-on-surface-variant text-xs">{payout.date} • {payout.id}</span>
                            </div>
                            <div>
                                {payout.status === 'Completed' ? (
                                    <span className="bg-[#22c55e]/10 text-[#22c55e] text-xs font-bold px-2 py-1 rounded-md">Completed</span>
                                ) : (
                                    <span className="bg-[#f59e0b]/10 text-[#f59e0b] text-xs font-bold px-2 py-1 rounded-md">Pending</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="border-outline-variant/20 my-2" />

            {/* Data Export UI */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-1">
                    <span className="material-symbols-outlined text-primary text-xl">download</span>
                    <h2 className="text-on-surface font-bold text-lg">Export Reports</h2>
                </div>

                <div className="bg-surface-container rounded-2xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-4">
                    {/* Filters */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-on-surface-variant font-medium ml-1">Date Range</label>
                            <select className="bg-surface border border-outline-variant/50 rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-primary">
                                <option>This Month</option>
                                <option>Last Month</option>
                                <option>Last 3 Months</option>
                                <option>This Year</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-on-surface-variant font-medium ml-1">Category</label>
                            <select className="bg-surface border border-outline-variant/50 rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-primary">
                                <option>All Sales</option>
                                <option>Payouts Only</option>
                                <option>Item Performance</option>
                            </select>
                        </div>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex gap-3 mt-2">
                        <button className="flex-1 py-2.5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors flex justify-center items-center gap-2">
                            <span className="material-symbols-outlined text-lg">description</span>
                            CSV
                        </button>
                        <button className="flex-1 py-2.5 rounded-xl border-2 border-tertiary text-tertiary font-bold hover:bg-tertiary/5 transition-colors flex justify-center items-center gap-2">
                            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                            PDF
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default VendorEarnings;
