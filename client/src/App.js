import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Spin } from 'antd';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/Navbar';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CartScreen from './screens/CartScreen';
import PaymentSuccess from './screens/PaymentSuccess';
import PrivateRoute from './components/PrivateRoute';
import OAuthCallback from './components/auth/OAuthCallback';
import { logDeviceInfo } from './utils/deviceDetection';

// Lazy load heavy components
const MenuItems = lazy(() => import('./components/MenuItems'));
const Reservations = lazy(() => import('./components/Reservations'));
const Tables = lazy(() => import('./components/Tables'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const DashboardHome = lazy(() => import('./components/DashboardHome'));
const ManageMenu = lazy(() => import('./components/ManageMenu'));
const ManageOrders = lazy(() => import('./components/ManagerOrders'));
const ManageReservations = lazy(() => import('./components/ManageReservations'));
const ManageUsers = lazy(() => import('./components/ManageUsers'));
const ManageTables = lazy(() => import('./components/ManageTables'));
const MyOrders = lazy(() => import('./components/MyOrders'));

// Component wrapper to conditionally show Navbar
function AppContent({ currentUser, cart, removeFromCart, addToCart, updateQuantity, clearCart }) {
  const location = useLocation();

  // Hide Navbar on login, register, and oauth callback pages
  const hideNavbar = ['/login', '/register', '/oauth/callback'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar cart={cart} removeFromCart={removeFromCart} />}
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Spin size="large" /></div>}>
        <Routes>
          {/* OAuth callback route */}
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          {/* Redirect root to /menu if logged in, otherwise to /login */}
          <Route path="/" element={
            currentUser ? <Navigate to="/menu" replace /> : <Navigate to="/login" replace />
          } />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/cart" element={<CartScreen cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} clearCart={clearCart} />} />
          <Route path="/payment-success" element={<PaymentSuccess clearCart={clearCart} />} />
          <Route path="/reservations" element={
            <PrivateRoute>
              <Reservations />
            </PrivateRoute>
          } />
          <Route path="/tables" element={
            <PrivateRoute>
              <Tables />
            </PrivateRoute>
          } />
          <Route path="/menu" element={
            <PrivateRoute>
              <MenuItems addToCart={addToCart} />
            </PrivateRoute>
          } />
          <Route path="/myorders" element={
            <PrivateRoute>
              <MyOrders />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfileScreen />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute isAdmin={true}>
              <AdminDashboard />
            </PrivateRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="menu" element={<ManageMenu />} />
            <Route path="tables" element={<ManageTables />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="reservations" element={<ManageReservations />} />
            <Route path="users" element={<ManageUsers />} />
          </Route>
          {/* Redirect any unknown routes to root */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('currentUser'))
  );
  const [cart, setCart] = useState([]);

  // Log device info on mount
  useEffect(() => {
    logDeviceInfo();
  }, []);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUser(JSON.parse(localStorage.getItem('currentUser')));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleStorageChange);
    };
  }, []);

  const addToCart = item => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem._id === item._id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = id => {
    setCart(prevCart => prevCart.filter(item => item._id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item => (item._id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <ErrorBoundary>
      <PayPalScriptProvider
        options={{
          clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || "AULTM5n6VFmcrUr5_J8V3vUjghjXqeqJfCG4_l11cgt5TSQa0SvdnLjSoysFG6t1tp3YIJrMwV7LOlVc",
          currency: "USD",
          intent: "capture",
        }}
      >
        <Router>
          <AppContent
            currentUser={currentUser}
            cart={cart}
            removeFromCart={removeFromCart}
            addToCart={addToCart}
            updateQuantity={updateQuantity}
            clearCart={clearCart}
          />
        </Router>
      </PayPalScriptProvider>
    </ErrorBoundary>
  );
}

export default App;