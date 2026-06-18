import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { getStudentOrders } from '../services/ordersApi';

const OrderHistory = () => {
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addToCart); // Changed from addItem to addToCart (which handles quantities properly)
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getStudentOrders();
      // Filter only completed or cancelled for history
      const historyOrders = data.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status));
      
      // Group by date
      const grouped = {};
      historyOrders.forEach(order => {
        const dateStr = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (!grouped[dateStr]) grouped[dateStr] = [];
        grouped[dateStr].push(order);
      });

      const historyArray = Object.keys(grouped).map(date => ({
        date,
        orders: grouped[date]
      }));

      // Sort by latest date first (simple approximation assuming string sort matches date order loosely, or we should sort orders before grouping)
      historyOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setHistory(historyArray);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError("Failed to load order history.");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (items, canteenId) => {
    // Add all items from the past order to the current cart
    items.forEach(item => {
      // Create a mock menu item format to add
      const menuItem = {
        id: item.menu_item_id, // backend response has menu_item_id
        name: `Item ${item.menu_item_id.substring(0,4)}`, // we don't have name in order item response currently
        price: parseFloat(item.unit_price) || 0,
        image: 'https://images.unsplash.com/photo-1599487405620-8e10629a2016?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        canteenId: canteenId
      };
      
      for(let i=0; i<item.quantity; i++) {
        addItem(menuItem, canteenId);
      }
    });
    alert('Items added to your cart!');
  };

  return (
    <div className="font-body-md relative flex flex-col min-h-screen">
      {/* TopAppBar */}
      <header className="sticky top-0 z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-md shadow-lg shadow-primary/5 flex items-center px-container-margin py-md">
        <button 
          onClick={() => navigate('/orders')}
          className="p-sm mr-sm text-on-surface hover:bg-surface-container rounded-full transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className="font-headline-md text-headline-md-mobile font-bold text-on-surface">
          Order History
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-container-margin pt-4 pb-8">
        {loading ? (
          <div className="flex justify-center mt-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center mt-20 text-error">{error}</div>
        ) : history.length === 0 ? (
          <div className="text-center mt-20 text-on-surface-variant">No history available.</div>
        ) : history.map((group, index) => (
          <div key={index} className="mb-xl">
            <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-sm">
              {group.date}
            </h2>
            <div className="space-y-sm">
              {group.orders.map((order) => (
                <div key={order.id} className="bg-surface-container-low rounded-xl p-md border border-surface-variant">
                  <div className="flex justify-between items-start mb-md pb-md border-b border-surface-variant/50">
                    <div>
                      <div className="flex items-center gap-xs mb-xs">
                        <span className="material-symbols-outlined text-primary text-[18px]">storefront</span>
                        <h3 className="font-label-md text-label-md text-on-surface">Canteen {order.canteen_id?.substring(0,4)}</h3>
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">
                        Order {order.id.substring(0,8)}
                      </div>
                    </div>
                    <div className="font-label-md text-label-md text-primary-container">
                      ₹{order.total_amount}
                    </div>
                  </div>
                  
                  <div className="mb-md">
                    {order.items && order.items.map((item, i) => (
                      <div key={i} className="font-body-sm text-body-sm text-on-surface mb-xs flex justify-between">
                        <span>Item {item.menu_item_id?.substring(0,4)} <span className="text-on-surface-variant text-[12px]">x{item.quantity}</span></span>
                        <span>₹{item.unit_price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleReorder(order.items || [], order.canteen_id)}
                    className="w-full flex items-center justify-center gap-xs py-sm rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">replay</span>
                    Reorder
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default OrderHistory;
