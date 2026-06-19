import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardStats, payoutHistory } from '../../data/mockVendorData';
import GoldenGlowButton from '../../components/ui/GoldenGlowButton';
import { getDashboardStats } from '../../services/ordersApi';

const VendorEarnings = () => {
    const [timeframe, setTimeframe] = useState('Monthly');
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getDashboardStats();
                setDashboardData(data);
                setError(null);
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
                setError("Failed to load dashboard stats");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const chartData = dashboardData ? (timeframe === 'Monthly' ? dashboardData.monthly_data : dashboardData.yearly_data) : [];
    return (
        <div className="flex flex-col gap-6 w-full pb-32 pt-6 px-4 relative">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display-md font-bold text-on-surface">Data & Reports</h1>
                    <p className="text-on-surface-variant text-sm">Financial overview and exports</p>
                </div>
            </div>

            {/* Wallet Balance Card */}
            <div className="bg-surface-container rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-4 relative">
                {/* Decorative background glow */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex justify-between items-start z-10 ">
                    <div>
                        <p className="text-on-surface-variant text-base font-bold">This Month's Earnings</p>
                        <h2 className="text-on-surface font-display-lg font-bold mt-1">{dashboardStats.earnings}</h2>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
                    </div>
                </div>
            </div>


            <hr className="border-outline-variant/20 my-2" />

            {/* Trend Chart */}
            <div className="bg-surface-container rounded-[24px] p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <span className="text-xs text-on-surface-variant">Earnings</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
                            <span className="text-xs text-on-surface-variant">Orders</span>
                        </div>
                    </div>
                    <select
                        className="bg-surface text-on-surface border border-outline-variant rounded-xl px-3 py-1 text-sm outline-none"
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                    >
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                    </select>
                </div>

                <div className="h-[220px] w-full mt-2">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center h-full text-error text-sm">
                            {error}
                        </div>
                    ) : dashboardData && (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Area type="monotone" dataKey="earnings" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                                <Area type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorEarnings;
