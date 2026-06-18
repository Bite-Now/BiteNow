import React, { useState, useEffect } from 'react';
import { useWalletStore } from '../store/useWalletStore';
import CollapsibleSection from '../components/common/CollapsibleSection';
import { WalletAnalytics } from '../components/wallet/WalletAnalytics';
import { WalletLedger } from '../components/wallet/WalletLedger';

const WalletGauge = ({ spent, total }) => {
    const safeTotal = total || 1; // prevent division by zero
    const percentage = Math.min((spent / safeTotal) * 100, 100);
    const radius = 120;
    const circumference = Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    // Cyberpunk glow color logic
    const isOver = spent >= safeTotal;
    const isWarning = percentage > 80 && !isOver;
    const strokeColor = isOver ? '#ef4444' : isWarning ? '#eab308' : '#22c55e'; // red-500, yellow-500, green-500
    
    return (
        <div className="relative w-[280px] h-[160px] mx-auto overflow-hidden flex flex-col items-center justify-end">
            <svg viewBox="0 0 280 140" className="w-full absolute top-0 left-0">
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                
                {/* Background Track */}
                <path
                    d={`M 20 140 A ${radius} ${radius} 0 0 1 260 140`}
                    fill="none"
                    stroke="currentColor"
                    className="text-surface-container-highest opacity-50"
                    strokeWidth="16"
                    strokeLinecap="round"
                />
                
                {/* Progress Indicator */}
                <path
                    d={`M 20 140 A ${radius} ${radius} 0 0 1 260 140`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    filter="url(#glow)"
                />
            </svg>
            
            {/* Center Info */}
            <div className="absolute bottom-2 flex flex-col items-center">
                <p className="text-on-surface-variant font-body-sm mb-1 uppercase tracking-wider text-xs">Remaining Balance</p>
                <h2 className="text-4xl font-bold text-on-surface drop-shadow-md">
                    ₹{Math.max(0, Math.round(total - spent))}
                </h2>
            </div>
        </div>
    );
};

const Budget = () => {
    const { 
        monthlyLimit, 
        totalSpentThisMonth, 
        remainingBalance,
        loading,
        fetchWalletData,
        updateBudgetLimit,
    } = useWalletStore();
    
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [tempBudget, setTempBudget] = useState(monthlyLimit || 5000);

    useEffect(() => {
        fetchWalletData();
    }, [fetchWalletData]);

    // Keep tempBudget in sync when monthlyLimit loads from the backend
    useEffect(() => {
        if (monthlyLimit !== null) {
            setTempBudget(monthlyLimit);
        }
    }, [monthlyLimit]);

    const spent = totalSpentThisMonth;
    const limit = monthlyLimit || 5000;

    const handleSaveBudget = async () => {
        const value = parseInt(tempBudget);
        if (!isNaN(value) && value > 0) {
            await updateBudgetLimit(value);
        }
        setIsEditingBudget(false);
    };

    if (loading && monthlyLimit === null) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-on-surface items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
                <p className="text-on-surface-variant mt-4 text-sm">Loading wallet...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background dark:bg-background text-on-surface pb-48 font-body-md transition-colors duration-300">
            <main className="px-6 flex flex-col gap-6 pt-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-2xl drop-shadow-sm">
                            account_balance_wallet
                        </span>
                        <h1 className="font-headline-md text-xl font-bold text-primary">Wallet</h1>
                    </div>

                </div>
                {/* Hero Section */}
                <CollapsibleSection title="Budget Overview" icon="speed" defaultOpen={true}>
                    <div className="relative">
                        {/* Glowing background accent */}
                        <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary/10 rounded-full blur-[60px] pointer-events-none"></div>
                        
                        <WalletGauge spent={spent} total={limit} />
                        
                        <div className="flex justify-between items-end mt-6 border-t border-outline-variant/30 pt-4 relative z-10">
                            <div className="flex flex-col">
                                <span className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">Monthly Limit</span>
                                {isEditingBudget ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-on-surface-variant">₹</span>
                                        <input 
                                            type="number" 
                                            value={tempBudget}
                                            onChange={(e) => setTempBudget(e.target.value)}
                                            className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-2 py-1 text-on-surface w-24 focus:outline-none focus:border-primary"
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    <span className="text-lg font-semibold text-on-surface">₹{limit}</span>
                                )}
                            </div>
                            
                            <button 
                                onClick={isEditingBudget ? handleSaveBudget : () => setIsEditingBudget(true)}
                                className="bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary rounded-xl px-4 py-2 transition-colors flex items-center gap-2 border border-outline-variant/30 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    {isEditingBudget ? 'check' : 'edit'}
                                </span>
                                {isEditingBudget ? 'Save' : 'Edit Limit'}
                            </button>
                        </div>
                    </div>
                </CollapsibleSection>
                
                {/* Analytics */}
                <WalletAnalytics />
                <WalletLedger />
            </main>
        </div>
    );
};

export default Budget;
