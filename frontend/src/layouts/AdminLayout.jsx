import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UtensilsCrossed, Settings, LogOut, Bell, HelpCircle } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import NotificationDropdown from '../components/common/NotificationDropdown';
import logo from '../assets/logo.png';

const AdminLayout = () => {
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  const navItems = [
    { name: 'Vendor Requests', path: '/admin/vendor-requests', icon: Users },
    { name: 'Canteen Menus', path: '/admin/canteens', icon: UtensilsCrossed },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  // Map route paths to human-readable titles
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/vendor-requests')) return 'Vendor Requests Management';
    if (path.includes('/canteens')) return 'Canteen Menus';
    if (path.includes('/settings')) return 'Settings';
    return 'BiteNow Admin';
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#f5f5f5] font-sans">
      {/* Sidebar (256px) */}
      <aside className="w-64 flex-shrink-0 bg-[#0f0f0f] border-r border-[#2e2e2e] flex flex-col justify-between">
        <div>
          {/* Logo / Brand */}
          <div className="h-16 flex items-center px-6 border-b border-[#2e2e2e]">
            <img src={logo} alt="BiteNow Logo" className="w-8 h-8 mr-3 object-cover" />
            <div>
              <h1 className="font-bold text-white text-sm">BiteNow Admin</h1>
              <p className="text-xs text-[#888888] truncate max-w-[130px]">{user?.fullName || user?.firstName || 'Admin'}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-[#1a1a1a] text-[#ff9f43] border-l-4 border-[#ff9f43]'
                        : 'text-[#888888] hover:bg-[#1a1a1a] hover:text-[#f5f5f5] border-l-4 border-transparent'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#2e2e2e]">
          <button
            onClick={() => signOut()}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-[#888888] hover:bg-[#1a1a1a] hover:text-white rounded-lg cursor-pointer transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header (64px) */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-[#2e2e2e] bg-[#0f0f0f]">
          <h2 className="text-lg font-semibold text-white">{getPageTitle()}</h2>
          
          <div className="flex items-center space-x-6">
            <NotificationDropdown />
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold">{user?.firstName?.charAt(0) || 'A'}</span>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
