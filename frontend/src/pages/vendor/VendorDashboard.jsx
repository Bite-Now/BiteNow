import React, { useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { monthlyData, yearlyData, topItems, dashboardStats } from '../../data/mockVendorData';

const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-surface-container rounded-[24px] p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-2">
        <div className="flex justify-between items-start">
            <span className={`material-symbols-outlined text-[28px] ${colorClass}`}>{icon}</span>
        </div>
        <div>
            <p className="text-on-surface-variant text-sm font-medium">{title}</p>
            <h3 className="text-on-surface font-bold text-2xl mt-1">{value}</h3>
        </div>
    </div>
);

const VendorDashboard = () => {
    const [timeframe, setTimeframe] = useState('Monthly');
    const chartData = timeframe === 'Monthly' ? monthlyData : yearlyData;
    
    // Scroll tracking for Top Moving Items
    const [activeItem, setActiveItem] = useState(0);
    const scrollContainerRef = useRef(null);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft } = scrollContainerRef.current;
        // 140px min-w + 12px gap = 152px per item
        const itemWidth = 152; 
        const newIndex = Math.round(scrollLeft / itemWidth);
        setActiveItem(Math.min(Math.max(newIndex, 0), topItems.length - 1));
    };

    return (
        <div className="flex flex-col gap-6 w-full pb-32 pt-6 px-4 relative">
            
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display-sm text-on-surface">Hello Enugu Kitchen</h1>
                    <p className="text-on-surface-variant text-sm">Here's a quick overview of your business</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface relative">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Earnings" value={dashboardStats.earnings} icon="payments" colorClass="text-primary" />
                <StatCard title="Orders completed" value={dashboardStats.ordersCompleted} icon="check_circle" colorClass="text-tertiary" />
                <StatCard title="Orders pending" value={dashboardStats.ordersPending} icon="pending_actions" colorClass="text-error" />
                <StatCard title="Batching Efficiency" value={dashboardStats.batchingEfficiency} icon="speed" colorClass="text-[#3b82f6]" />
            </div>

            {/* Top Moving Items Carousel */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-1">
                    <span className="material-symbols-outlined text-tertiary text-xl">local_fire_department</span>
                    <h2 className="text-on-surface font-semibold text-lg">Top Moving Items</h2>
                </div>
                
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1 snap-x snap-mandatory"
                >
                    {topItems.map((item, idx) => (
                        <div key={idx} className="min-w-[140px] snap-start bg-surface-container rounded-[20px] p-4 shadow-sm border border-outline-variant/20 flex flex-col gap-1 shrink-0">
                            <h4 className="text-on-surface font-medium truncate">{item.name}</h4>
                            <div className="flex justify-between items-end mt-2">
                                <span className="text-on-surface-variant text-sm">Quantity: {item.orders}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dots Indicator */}
                <div className="flex justify-center items-center gap-2 mt-1">
                    {topItems.map((_, idx) => (
                        <div 
                            key={idx}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                activeItem === idx ? 'w-4 bg-primary' : 'w-2 bg-on-surface-variant/30'
                            }`}
                        />
                    ))}
                </div>
            </div>

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
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
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
                </div>
            </div>

        </div>
    );
};

export default VendorDashboard;
