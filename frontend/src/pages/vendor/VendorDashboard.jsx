import React, { useState, useRef, useEffect } from 'react';

import { getDashboardStats } from '../../services/ordersApi';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentCanteen } from '../../hooks/useCurrentCanteen';

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
    const { currentUser } = useAuth();
    const { canteenName } = useCurrentCanteen();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Scroll tracking for Top Moving Items
    const [activeItem, setActiveItem] = useState(0);
    const scrollContainerRef = useRef(null);

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

    const handleScroll = () => {
        if (!scrollContainerRef.current || !dashboardData?.top_items) return;
        const { scrollLeft } = scrollContainerRef.current;
        // 140px min-w + 12px gap = 152px per item
        const itemWidth = 152;
        const newIndex = Math.round(scrollLeft / itemWidth);
        setActiveItem(Math.min(Math.max(newIndex, 0), dashboardData.top_items.length - 1));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="flex justify-center items-center h-screen text-error">
                {error || "Failed to load dashboard"}
            </div>
        );
    }

    const topItems = dashboardData.top_items || [];

    return (
        <div className="flex flex-col gap-6 w-full pb-32 pt-6 px-4 relative">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display-sm text-on-surface">Hello {canteenName || currentUser?.name || 'Kitchen'}</h1>
                    <p className="text-on-surface-variant text-sm">Here's a quick overview of your business</p>
                </div>

            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Earnings" value={dashboardData.earnings} icon="payments" colorClass="text-primary" />
                <StatCard title="Orders completed" value={dashboardData.orders_completed} icon="check_circle" colorClass="text-tertiary" />
                <StatCard title="Orders pending" value={dashboardData.orders_pending} icon="pending_actions" colorClass="text-error" />
                <StatCard title="Batching Efficiency" value={dashboardData.batching_efficiency} icon="speed" colorClass="text-[#3b82f6]" />
            </div>

            {/* Top Moving Items Carousel */}
            {topItems.length > 0 && (
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
                                className={`h-2 rounded-full transition-all duration-300 ${activeItem === idx ? 'w-4 bg-primary' : 'w-2 bg-on-surface-variant/30'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default VendorDashboard;
