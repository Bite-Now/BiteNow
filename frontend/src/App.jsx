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
import Unauthorized from './pages/Unauthorized';
import MainLayout from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRedirect } from './components/auth/RoleRedirect';
import { AuthProvider } from './context/AuthContext';

// Dummy components for missing dashboards to satisfy router
const StaffDashboard = () => <div className="p-8 text-white">Staff Dashboard</div>;
const OwnerDashboard = () => <div className="p-8 text-white">Owner Dashboard</div>;
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
        <Route path="/staff" element={<ProtectedRoute allowedRoles={['STAFF']}><StaffDashboard /></ProtectedRoute>} />

        {/* Protected Routes - OWNER */}
        <Route path="/owner" element={<ProtectedRoute allowedRoles={['OWNER']}><OwnerDashboard /></ProtectedRoute>} />

        {/* Protected Routes - ADMIN */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

        {/* Catch all unknown routes */}
        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
