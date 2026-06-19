import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Unauthorized from './pages/Unauthorized';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRedirect from './components/RoleRedirect';
import { AuthProvider } from './context/AuthContext';
import { setupInterceptors } from './services/api';

const Canteen = React.lazy(() => import('./pages/Canteen'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Orders = React.lazy(() => import('./pages/Orders'));
const OrderHistory = React.lazy(() => import('./pages/OrderHistory'));
const Surprise = React.lazy(() => import('./pages/Surprise'));
const Budget = React.lazy(() => import('./pages/Budget'));
const SettingsLayout = React.lazy(() => import('./pages/settings/SettingsLayout'));
const PersonalProfile = React.lazy(() => import('./pages/settings/PersonalProfile'));
const CanteenSettings = React.lazy(() => import('./pages/settings/CanteenSettings'));
const MockPayment = React.lazy(() => import('./pages/student/MockPayment'));
const AdminLayout = React.lazy(() => import('./layouts/AdminLayout'));
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'));
const VendorRequests = React.lazy(() => import('./pages/admin/VendorRequests'));
const AdminCanteens = React.lazy(() => import('./pages/admin/AdminCanteens'));

const VendorDashboard = React.lazy(() => import('./pages/vendor/VendorDashboard'));
const VendorOrders = React.lazy(() => import('./pages/vendor/VendorOrders'));
const VendorProducts = React.lazy(() => import('./pages/vendor/VendorProducts'));
const VendorEarnings = React.lazy(() => import('./pages/vendor/VendorEarnings'));
const VendorStaff = React.lazy(() => import('./pages/vendor/VendorStaff'));
const StaffDashboard = React.lazy(() => import('./pages/StaffDashboard'));

// Dummy components for missing dashboards to satisfy router

function App() {
  
  // We cannot easily get `navigate` here since we are outside BrowserRouter or we can pass it later.
  // Actually, setting up interceptors should be done inside a child component or with a fallback.
  // We'll call setupInterceptors inside a useEffect or just let the interceptor use window.Clerk.
  React.useEffect(() => {
    // window.Clerk.session.getToken is available after load
    const getToken = async () => {
      if (window.Clerk && window.Clerk.session) {
        return await window.Clerk.session.getToken();
      }
      return null;
    };
    setupInterceptors(getToken, null);
  }, []);

  return (
    <AuthProvider>
      <Suspense fallback={<div className="flex justify-center items-center h-screen bg-background"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div></div>}>
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

          <Route path="/checkout" element={<ProtectedRoute allowedRoles={['STUDENT']}><MockPayment /></ProtectedRoute>} />

          {/* Protected Routes - STAFF */}
          <Route element={<ProtectedRoute allowedRoles={['STAFF']}><MainLayout /></ProtectedRoute>}>
            <Route path="/staff" element={<VendorOrders />} />
            <Route path="/staff/orders" element={<VendorOrders />} />
            <Route path="/staff/products" element={<VendorProducts />} />
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
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<RoleRedirect />} />
            <Route path="/admin/vendor-requests" element={<VendorRequests />} />
            <Route path="/admin/canteens" element={<AdminCanteens />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

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
      </Suspense>
    </AuthProvider>
  );
}

export default App;
