import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const { getToken } = useAuth();

  const fetchNotifications = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await axios.get('http://localhost:8000/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [getToken]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const token = await getToken();
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      // The backend has a DELETE /notifications/bulk endpoint. Let's use that to clear them.
      // Alternatively we can use PATCH /{id}/read. 
      // The current backend route is: DELETE /notifications/bulk (takes list of UUIDs)
      await axios.delete('http://localhost:8000/notifications/bulk', {
        headers: { Authorization: `Bearer ${token}` },
        data: unreadIds
      });
      
      setNotifications(notifications.filter(n => n.is_read));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-[#888888] hover:text-white transition-colors duration-200 cursor-pointer p-1 rounded-full hover:bg-white/5"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[#1a1a1a] border border-[#2e2e2e] rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e2e2e] bg-[#1a1a1a]">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-[#888888] hover:text-white transition-colors cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-[#888888] text-sm">
                No new notifications.
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#2e2e2e]">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 transition-colors hover:bg-[#1a1a1a] ${!notification.is_read ? 'bg-[#ff9f43]/5' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        {!notification.is_read && <div className="w-1.5 h-1.5 rounded-full bg-[#ff9f43]"></div>}
                        <h4 className={`text-sm ${!notification.is_read ? 'font-semibold text-white' : 'font-medium text-[#f5f5f5]'}`}>
                          {notification.title}
                        </h4>
                      </div>
                      <span className="text-xs text-[#888888] whitespace-nowrap ml-2">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-[#888888] leading-relaxed ml-3.5">
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
