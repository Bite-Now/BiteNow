import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Package, Bike, Store, Percent, Bell, Check, CheckCircle2 } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { markNotificationRead } from '../../services/ordersApi';

export function BiteNowNotificationPopover() {
  const [activeTab, setActiveTab] = useState('All');
  const [portalContainer, setPortalContainer] = useState(null);
  
  useEffect(() => {
    setPortalContainer(document.getElementById('app-root-frame'));
  }, []);
  
  const { notifications, getUnreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const unreadCount = getUnreadCount();

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Orders') return n.type === 'order';
    if (activeTab === 'Offers') return n.type === 'offer';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <Package className="w-4 h-4 text-on-surface" />;
      case 'offer': return <Percent className="w-4 h-4 text-on-surface" />;
      case 'restaurant': return <Store className="w-4 h-4 text-on-surface" />;
      default: return <Bell className="w-4 h-4 text-on-surface" />;
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button 
          className="relative p-2 rounded-full hover:bg-surface-variant transition-colors focus:outline-none"
          aria-label="Open notifications"
        >
          <Bell className="w-6 h-6 text-on-surface" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-on-error bg-error rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </Dialog.Trigger>

      {portalContainer && (
        <Dialog.Portal container={portalContainer}>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content 
            className="z-50 w-full bg-surface-container-low border-t border-outline-variant/30 shadow-lg flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=open]:slide-in-from-bottom-1/2 fixed bottom-0 inset-x-0 rounded-t-2xl max-h-[80vh] text-on-surface font-body-md"
          >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface">
            <Dialog.Title className="text-lg font-headline-sm font-bold text-on-surface">Notifications</Dialog.Title>
            <button 
              onClick={() => {
                markAllAsRead();
                filteredNotifications.forEach(n => {
                  if (n.id.includes('-') && !n.read) {
                    markNotificationRead(n.id).catch(()=>{});
                  }
                });
              }}
              className="text-sm font-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-4 py-3 gap-2 border-b border-outline-variant/20 overflow-x-auto no-scrollbar bg-surface-container">
            {['All', 'Orders', 'Offers'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-label-md rounded-full whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-2 bg-surface-container-lowest">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-on-surface-variant" />
                </div>
                <h3 className="text-lg font-bold text-on-surface">You're all caught up!</h3>
                <p className="text-sm text-on-surface-variant mt-1">No new notifications available.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filteredNotifications.map(notification => (
                  <button
                    key={notification.id}
                    onClick={async () => {
                      markAsRead(notification.id);
                      if (notification.id.includes('-')) {
                          try {
                              await markNotificationRead(notification.id);
                          } catch(err) {}
                      }
                    }}
                    className={`flex items-start gap-3 p-3 text-left rounded-lg transition-colors hover:bg-surface-container-high ${!notification.read ? 'bg-surface-container' : ''}`}
                  >
                    <div className="flex-shrink-0 mt-1 w-10 h-10 rounded-full bg-surface border border-outline-variant/20 flex items-center justify-center">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm truncate ${!notification.read ? 'text-on-surface font-bold' : 'text-on-surface font-medium'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-on-surface-variant whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 mt-2.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          </Dialog.Content>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  );
}
