import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_HISTORY } from '../data/mockData';
import { useCartStore } from '../store/useCartStore';

const OrderHistory = () => {
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);

  const handleReorder = (items) => {
    // Add all items from the past order to the current cart
    items.forEach(item => {
      // Create a mock menu item format to add
      const menuItem = {
        id: item.id || Math.random().toString(), // fallback
        name: item.name,
        price: item.price,
        image: 'https://images.unsplash.com/photo-1599487405620-8e10629a2016?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' // default fallback image
      };
      // Add the requested quantity
      for(let i=0; i<item.quantity; i++) {
        addItem(menuItem);
      }
    });
    // Navigate to the cart (if we have a cart checkout page, but we are moving Orders to tracking)
    // For now we'll just show an alert or let them know it's added.
    alert('Items added to your cart!');
  };

  return (
    <div className="font-body-md relative flex flex-col">
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
        {MOCK_HISTORY.map((group, index) => (
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
                        <h3 className="font-label-md text-label-md text-on-surface">{order.canteenName} Canteen</h3>
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">
                        {order.id}
                      </div>
                    </div>
                    <div className="font-label-md text-label-md text-primary-container">
                      ₹{order.total}
                    </div>
                  </div>
                  
                  <div className="mb-md">
                    {order.items.map((item, i) => (
                      <div key={i} className="font-body-sm text-body-sm text-on-surface mb-xs flex justify-between">
                        <span>{item.name} <span className="text-on-surface-variant text-[12px]">x{item.quantity}</span></span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleReorder(order.items)}
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
