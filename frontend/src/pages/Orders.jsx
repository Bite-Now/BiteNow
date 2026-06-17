import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentOrders } from '../services/ordersApi';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
    // Optional: setup polling here
    const intervalId = setInterval(fetchOrders, 10000); // 10s polling
    return () => clearInterval(intervalId);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getStudentOrders();
      // Filter out completed/cancelled if needed, but typically backend returns active
      const activeOrders = data.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status));
      setOrders(activeOrders);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      // setError("Failed to fetch live orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PAID': return 'text-primary-container bg-primary-container/20';
      case 'PREPARING': return 'text-primary bg-primary/20';
      case 'READY': return 'text-secondary bg-secondary/20';
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

  return (
    <div className="font-body-md flex flex-col pb-32 md:pb-8 relative">
      {/* TopAppBar */}
      <header className="sticky top-0 z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-md shadow-lg shadow-primary/5 flex justify-between items-center px-container-margin py-md">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim" style={{ fontVariationSettings: '"FILL" 1' }}>restaurant_menu</span>
          <span className="font-headline-md text-headline-md-mobile font-bold text-primary dark:text-primary-fixed-dim">BiteNow</span>
        </div>
        <div className="flex items-center gap-sm">
          <button onClick={() => navigate('/history')} className="p-xs text-on-surface hover:text-primary transition-colors active:scale-95">
            <span className="material-symbols-outlined text-[24px]">history</span>
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-container-margin max-w-2xl">
        <div className="flex justify-between items-end mb-lg mt-md">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Live Tracking</h1>
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
              <div key={order.id} className="bg-surface-container-low rounded-xl p-md border border-surface-variant">
                <div className="flex justify-between items-start mb-md pb-md border-b border-surface-variant/50">
                  <div>
                    <div className="flex items-center gap-xs mb-xs">
                      <span className="material-symbols-outlined text-primary text-[18px]">storefront</span>
                      <h2 className="font-label-md text-label-md text-on-surface">Order at Canteen {order.canteen_id?.substring(0,4)}</h2>
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Order {order.id.substring(0,8)}</div>
                  </div>
                  <div className={`font-label-sm text-label-sm px-sm py-xs rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </div>
                </div>

                <div className="space-y-sm">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-md">
                      <div className="w-16 h-16 rounded-lg bg-surface-container-highest overflow-hidden flex-shrink-0 relative">
                        {/* No image in backend response for order items currently, show placeholder */}
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
