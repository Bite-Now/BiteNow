import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Canteen from './pages/Canteen';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderHistory from './pages/OrderHistory';
import Surprise from './pages/Surprise';
import Budget from './pages/Budget';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import { useVendorStore } from './store/useVendorStore';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorEarnings from './pages/vendor/VendorEarnings';
import VendorStaff from './pages/vendor/VendorStaff';

const RootRedirect = () => {
  const isVendorMode = useVendorStore(state => state.isVendorMode);
  return <Navigate to={isVendorMode ? "/vendor/dashboard" : "/home"} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {/* Root Redirect based on Role */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* Student Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/canteen/:id" element={<Canteen />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/history" element={<OrderHistory />} />
          <Route path="/surprise" element={<Surprise />} />
          <Route path="/budget" element={<Budget />} />
          
          {/* Vendor Routes */}
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/orders" element={<VendorOrders />} />
          <Route path="/vendor/products" element={<VendorProducts />} />
          <Route path="/vendor/earnings" element={<VendorEarnings />} />
          <Route path="/vendor/staff" element={<VendorStaff />} />
        </Route>
        
        {/* Catch all unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
