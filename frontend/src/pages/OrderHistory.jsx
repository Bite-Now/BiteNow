import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { getStudentOrders } from '../services/ordersApi';

const OrderHistory = () => {
  const navigate = useNavigate();
  const addToCart = useCartStore(state => state.addToCart);

  const handleReorder = (items) => {
    items.forEach(item => {
      const menuItem = {
        id: item.id || Math.random().toString(),
        name: item.name,
        price: item.price,
        image: 'https://images.unsplash.com/photo-1599487405620-8e10629a2016?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      };
      for(let i = 0; i < item.quantity; i++) {
        addToCart(menuItem, item.canteenId || 'c1');
      }
    });
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
