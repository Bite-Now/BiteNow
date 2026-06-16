import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_ORDERS } from '../data/mockData';

const Orders = () => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch(status) {
      case 'IN_QUEUE': return 'text-primary-container bg-primary-container/20';
      case 'PREPARING': return 'text-primary bg-primary/20';
      case 'READY': return 'text-secondary bg-secondary/20';
      default: return 'text-on-surface-variant bg-surface-variant';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'IN_QUEUE': return '🟡 In Queue';
      case 'PREPARING': return '🟠 Preparing';
      case 'READY': return '🟢 Ready for Pickup';
      default: return '⚪ Unknown';
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

        {MOCK_ORDERS.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <span className="material-symbols-outlined text-6xl text-surface-variant mb-4">receipt_long</span>
            <h2 className="font-headline-md text-on-surface mb-2">No Active Orders</h2>
            <p className="text-body-md text-on-surface-variant">You don't have any orders right now.</p>
          </div>
        ) : (
          <div className="space-y-lg mb-lg">
            {MOCK_ORDERS.map((order) => (
              <div key={order.id} className="bg-surface-container-low rounded-xl p-md border border-surface-variant">
                <div className="flex justify-between items-start mb-md pb-md border-b border-surface-variant/50">
                  <div>
                    <div className="flex items-center gap-xs mb-xs">
                      <span className="material-symbols-outlined text-primary text-[18px]">storefront</span>
                      <h2 className="font-label-md text-label-md text-on-surface">{order.canteenName} Canteen</h2>
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Order {order.id}</div>
                  </div>
                  <div className={`font-label-sm text-label-sm px-sm py-xs rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </div>
                </div>

                <div className="space-y-sm">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-md">
                      <div className="w-16 h-16 rounded-lg bg-surface-container-highest overflow-hidden flex-shrink-0 relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      </div>
                      <div className="flex-grow flex justify-between items-center">
                        <div className="font-label-md text-label-md text-on-surface">{item.name}</div>
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
