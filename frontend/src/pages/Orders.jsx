import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentOrders, getNotifications, markNotificationRead } from '../services/ordersApi';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    try {
      const [orderData, notifData] = await Promise.all([
        getStudentOrders(),
        getNotifications()
      ]);
      const activeOrders = orderData.filter(o => !['COMPLETED', 'CANCELLED', 'COLLECTED'].includes(o.status));
      setOrders(activeOrders);
      setNotifications(notifData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const intervalId = setInterval(fetchAll, 10000); // 10s polling
    return () => clearInterval(intervalId);
  }, []);

  const handleReadNotification = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PAID': return 'text-primary-container bg-primary-container/20';
      case 'PREPARING': return 'text-primary bg-primary/20';
      case 'READY': return 'text-[#22c55e] bg-[#22c55e]/20 animate-pulse border border-[#22c55e]/50';
      default: return 'text-on-surface-variant bg-surface-variant';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'PAID': return '🟡 Paid & Received';
      case 'PREPARING': return '🟠 Preparing';
      case 'READY': return '🟢 Ready for Pickup';
      default: return `⚪ ${status}`;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="font-body-md flex flex-col pb-32 md:pb-8 relative">
      <main className="flex-grow container mx-auto px-container-margin max-w-2xl">
        <div className="flex justify-between items-center mb-lg mt-md">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Live Tracking</h1>
          <button onClick={() => navigate('/history')} className="p-xs text-on-surface hover:text-primary transition-colors active:scale-95">
            <span className="material-symbols-outlined text-[24px]">history</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center mt-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center mt-20 text-error">{error}</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <span className="material-symbols-outlined text-6xl text-surface-variant mb-4">receipt_long</span>
            <h2 className="font-headline-md text-on-surface mb-2">No Active Orders</h2>
            <p className="text-body-md text-on-surface-variant">You don't have any orders right now.</p>
          </div>
        ) : (
          <div className="space-y-lg mb-lg">
            {orders.map((order) => (
              <div key={order.id} className={`bg-surface-container-low rounded-xl p-md border ${order.status === 'READY' ? 'border-[#22c55e]' : 'border-surface-variant'}`}>
                <div className="flex justify-between items-start mb-md pb-md border-b border-surface-variant/50">
                  <div>
                    <div className="flex items-center gap-xs mb-xs">
                      <span className="material-symbols-outlined text-primary text-[18px]">storefront</span>
                      <h2 className="font-label-md text-label-md text-on-surface">Order at Canteen {order.canteen_id?.substring(0,4)}</h2>
                    </div>
                    <div className="font-headline-sm text-on-surface font-bold">Order #{order.order_number || order.id.substring(0,8)}</div>
                  </div>
                  <div className={`font-label-sm text-label-sm px-sm py-xs rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </div>
                </div>

                <div className="space-y-sm">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-md">
                      <div className="w-16 h-16 rounded-lg bg-surface-container-highest overflow-hidden flex-shrink-0 relative">
                        <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant text-xl">fastfood</span>
                        </div>
                      </div>
                      <div className="flex-grow flex justify-between items-center">
                        <div className="font-label-md text-label-md text-on-surface">Item {item.menu_item_id.substring(0,4)}</div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container px-sm py-xs rounded-lg border border-surface-variant">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
