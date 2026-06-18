import React, { useState, useEffect } from 'react';
import { getStaffOrders, markOrderReadyStaff } from '../services/ordersApi';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const data = await getStaffOrders();
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkReady = async (batchId) => {
        try {
            await markOrderReadyStaff(batchId);
            fetchOrders();
        } catch (err) {
            console.error("Failed to mark ready", err);
            alert("Failed to mark order ready.");
        }
    };

    const pendingOrders = orders.filter(o => o.status === 'PAID' || o.status === 'PREPARING');
    const completedOrders = orders.filter(o => o.status === 'READY');

    return (
        <div className="font-body-md flex flex-col p-8">
            <h1 className="font-headline-lg text-on-surface mb-6">Staff Dashboard</h1>
            
            <h2 className="font-headline-sm text-primary mb-4">Pending Orders ({pendingOrders.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {pendingOrders.map(order => (
                    <div key={order.id} className="bg-surface-container rounded-xl p-4 border border-outline-variant/30">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold">Order #{order.order_number || order.id.substring(0,8)}</span>
                            <span className="text-xs text-on-surface-variant">{new Date(order.created_at).toLocaleTimeString()}</span>
                        </div>
                        <div className="mb-4">
                            Items: {order.items?.length || 0}
                        </div>
                        <button 
                            onClick={() => handleMarkReady(order.id)}
                            className="w-full bg-primary text-on-primary py-2 rounded-lg font-bold hover:bg-primary/90"
                        >
                            Mark Ready
                        </button>
                    </div>
                ))}
                {pendingOrders.length === 0 && <div className="text-on-surface-variant">No pending orders.</div>}
            </div>

            <h2 className="font-headline-sm text-secondary mb-4">Ready Orders ({completedOrders.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedOrders.map(order => (
                    <div key={order.id} className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 opacity-70">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold">Order #{order.order_number || order.id.substring(0,8)}</span>
                            <span className="text-xs text-on-surface-variant">{new Date(order.created_at).toLocaleTimeString()}</span>
                        </div>
                        <div className="mb-2">
                            Items: {order.items?.length || 0}
                        </div>
                        <span className="text-[#22c55e] font-bold text-sm">Ready</span>
                    </div>
                ))}
                {completedOrders.length === 0 && <div className="text-on-surface-variant">No ready orders.</div>}
            </div>
        </div>
    );
};

export default StaffDashboard;
