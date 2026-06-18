import React from 'react';
import { dashboardStats, payoutHistory } from '../../data/mockVendorData';
import GoldenGlowButton from '../../components/ui/GoldenGlowButton';

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
                    <GoldenGlowButton className="w-full">
                        Withdraw Funds
                    </GoldenGlowButton>
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
                        <div className="flex-1">
                            <GoldenGlowButton variant="neutral" className="w-full">
                                <span className="material-symbols-outlined text-lg mr-1">description</span>
                                CSV
                            </GoldenGlowButton>
                        </div>
                        <div className="flex-1">
                            <GoldenGlowButton variant="neutral" className="w-full">
                                <span className="material-symbols-outlined text-lg mr-1">picture_as_pdf</span>
                                PDF
                            </GoldenGlowButton>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default VendorEarnings;
