import React, { useMemo, useState } from 'react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { useWalletStore } from '../../store/useWalletStore';
import CollapsibleSection from '../common/CollapsibleSection';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

const renderCustomizedLabel = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value, index, name } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) + 5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const textRadius = outerRadius + 25; 
    const xTex = cx + textRadius * Math.cos(-midAngle * RADIAN);
    const yTex = cy + textRadius * Math.sin(-midAngle * RADIAN);

    const textAnchor = xTex > cx ? 'start' : 'end';
    
    return (
        <g>
            <path d={`M${x},${y} L${xTex},${yTex}`} stroke="currentColor" className="text-outline-variant opacity-60" fill="none" strokeWidth={1} />
            <circle cx={xTex} cy={yTex} r={2} fill={COLORS[index % COLORS.length]} stroke="none" />
            <text 
                x={xTex + (xTex > cx ? 6 : -6)} 
                y={yTex} 
                textAnchor={textAnchor} 
                fill="currentColor" 
                className="text-on-surface text-[10px] font-medium" 
                dominantBaseline="central"
            >
                {name} (₹{Math.round(value)})
            </text>
        </g>
    );
};

export const WalletAnalytics = () => {
    const transactions = useWalletStore(state => state.transactions);
    const canteenBreakdown = useWalletStore(state => state.canteenBreakdown);
    const totalSpentThisMonth = useWalletStore(state => state.totalSpentThisMonth);
    const monthlyLimit = useWalletStore(state => state.monthlyLimit);
    const [activeChart, setActiveChart] = useState('donut');

    // Use backend-provided canteen breakdown (pre-computed for current month)
    const canteenData = useMemo(() => {
        if (canteenBreakdown && canteenBreakdown.length > 0) {
            return canteenBreakdown;
        }
        // Fallback: compute from transactions
        const counts = {};
        transactions.forEach(tx => {
            counts[tx.canteenId] = (counts[tx.canteenId] || 0) + tx.amount;
        });
        return Object.keys(counts).map(key => ({
            name: key,
            value: counts[key]
        })).sort((a, b) => b.value - a.value);
    }, [canteenBreakdown, transactions]);

    const radarData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = months.map(m => ({ subject: m, totalSpend: 0 }));

        transactions.forEach(tx => {
            if (tx.timestamp) {
                const m = new Date(tx.timestamp).getMonth();
                data[m].totalSpend += tx.amount;
            }
        });

        return data;
    }, [transactions]);

    const generateInsight = () => {
        if (!monthlyLimit || totalSpentThisMonth === 0) {
            return "You're off to a great start this month!";
        }

        const percentage = Math.round((totalSpentThisMonth / monthlyLimit) * 100);
        
        if (percentage >= 90) {
            return `You've used ${percentage}% of your monthly budget! Consider slowing down.`;
        } else if (percentage >= 60) {
            return `You've used ${percentage}% of your monthly budget. Stay mindful of your spending!`;
        } else if (percentage >= 30) {
            return `You've used ${percentage}% of your budget. Great pace so far!`;
        }
        return `Only ${percentage}% of your budget used — plenty of room this month!`;
    };

    if (canteenData.length === 0 && transactions.length === 0) return null;

    return (
        <section className="flex flex-col gap-4 w-full mt-2">
            <CollapsibleSection title="Analytics" icon="analytics" defaultOpen={true}>
                <div className="bg-surface-container rounded-[24px] p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-5">
                {/* Smart Insight Banner */}
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">tips_and_updates</span>
                    <p className="text-on-surface text-sm leading-relaxed">
                        <span className="font-bold text-primary block mb-0.5">Smart Insight</span>
                        {generateInsight()}
                    </p>
                </div>

                {/* Segmented Toggle */}
                <div className="flex bg-surface-container-highest p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveChart('donut')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeChart === 'donut' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        Breakdown
                    </button>
                    <button 
                        onClick={() => setActiveChart('radar')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeChart === 'radar' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        Trends
                    </button>
                </div>

                {/* Chart Container (Fixed Height) */}
                <div className="h-[260px] w-full relative">
                    {activeChart === 'donut' ? (
                        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-300">
                            {canteenData.length > 0 ? (
                                <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <defs>
                                            <filter id="glowPie" x="-20%" y="-20%" width="140%" height="140%">
                                                <feGaussianBlur stdDeviation="3" result="blur" />
                                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                            </filter>
                                        </defs>
                                        <Pie
                                            data={canteenData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={65}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                        >
                                            {canteenData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={COLORS[index % COLORS.length]} 
                                                    filter="url(#glowPie)"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'var(--color-surface-container-high, #1e293b)', border: '1px solid var(--color-outline-variant, #334155)', borderRadius: '12px' }}
                                            itemStyle={{ color: 'var(--color-on-surface, #f8fafc)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Custom Legend (Center Text) */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                    <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">This Month</span>
                                    <span className="text-on-surface font-bold text-lg drop-shadow-sm">
                                        ₹{Math.round(canteenData.reduce((sum, item) => sum + item.value, 0))}
                                    </span>
                                </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-on-surface-variant text-sm">
                                    No spending data this month yet
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-300">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                    <PolarGrid stroke="currentColor" className="text-outline-variant opacity-30" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-on-surface-variant, #94a3b8)', fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                    
                                    <Radar name="Total Spend" dataKey="totalSpend" stroke="var(--color-primary, #22c55e)" fill="var(--color-primary, #22c55e)" fillOpacity={0.4} filter="url(#glowPie)" />
                                    
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--color-surface-container-high, #1e293b)', border: '1px solid var(--color-outline-variant, #334155)', borderRadius: '12px' }}
                                        itemStyle={{ color: 'var(--color-on-surface, #f8fafc)' }}
                                        formatter={(value) => [`₹${value}`, 'Total Spend']}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
            </CollapsibleSection>
        </section>
    );
};
