import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Canteen from './pages/Canteen';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderHistory from './pages/OrderHistory';
import Surprise from './pages/Surprise';
import Budget from './pages/Budget';
import SettingsLayout from './pages/settings/SettingsLayout';
import PersonalProfile from './pages/settings/PersonalProfile';
import CanteenSettings from './pages/settings/CanteenSettings';
import Unauthorized from './pages/Unauthorized';
import MainLayout from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRedirect } from './components/auth/RoleRedirect';
import { AuthProvider } from './context/AuthContext';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorEarnings from './pages/vendor/VendorEarnings';
import VendorStaff from './pages/vendor/VendorStaff';

// Dummy components for missing dashboards to satisfy router
const AdminDashboard = () => <div className="p-8 text-white">Admin Dashboard</div>;

function App() {
  
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Role Redirect (Index Route) */}
        <Route path="/" element={<RoleRedirect />} />

        {/* Protected Routes - STUDENT */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']}><MainLayout /></ProtectedRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/canteen/:id" element={<Canteen />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/history" element={<OrderHistory />} />
          <Route path="/surprise" element={<Surprise />} />
          <Route path="/budget" element={<Budget />} />
        </Route>

        {/* Protected Routes - STAFF */}
        <Route element={<ProtectedRoute allowedRoles={['STAFF']}><MainLayout /></ProtectedRoute>}>
          <Route path="/staff" element={<VendorOrders />} />
        </Route>

        {/* Protected Routes - OWNER (Vendor) */}
        <Route element={<ProtectedRoute allowedRoles={['OWNER']}><MainLayout /></ProtectedRoute>}>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/orders" element={<VendorOrders />} />
          <Route path="/vendor/products" element={<VendorProducts />} />
          <Route path="/vendor/earnings" element={<VendorEarnings />} />
          <Route path="/vendor/staff" element={<VendorStaff />} />
        </Route>

        {/* Protected Routes - ADMIN */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

        {/* Shared Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'OWNER', 'ADMIN']}><MainLayout /></ProtectedRoute>}>
            <Route path="/settings" element={<SettingsLayout />}>
                <Route path="profile" element={<PersonalProfile />} />
                <Route path="canteen" element={<CanteenSettings />} />
            </Route>
        </Route>
        {/* Catch all unknown routes */}
        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
