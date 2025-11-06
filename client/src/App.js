import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import Navbar from './components/Navbar';
import Reservations from './components/Reservations';
import Tables from './components/Tables';
import MenuItems from './components/MenuItems';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminDashboard from './components/AdminDashboard';
import DashboardHome from './components/DashboardHome';
import ManageMenu from './components/ManageMenu';
import PrivateRoute from './components/PrivateRoute';
import ManageOrders from './components/ManagerOrders';
import ManageReservations from './components/ManageReservations';
import ManageUsers from './components/ManageUsers';
import ManageTables from './components/ManageTables';
import CartScreen from './screens/CartScreen';
import PaymentResult from './screens/PaymentResult';
import { logDeviceInfo } from './utils/deviceDetection';
// ...other imports...

// Component wrapper to conditionally show Navbar
function AppContent({ currentUser, cart, removeFromCart, addToCart, clearCart }) {
  const location = useLocation();
  
  // Hide Navbar on login and register pages
  const hideNavbar = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar cart={cart} removeFromCart={removeFromCart} />}
      <Routes>
        {/* Redirect root to /menu if logged in, otherwise to /login */}
        <Route path="/" element={
          currentUser ? <Navigate to="/menu" replace /> : <Navigate to="/login" replace />
        } />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
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
        <Route path="/cart" element={<CartScreen cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} />} />
        <Route path="/payment-result" element={<PaymentResult />} />
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
    </>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('currentUser'))
  );
  const [cart, setCart] = useState([]);

  // Log device info on mount (for debugging mobile issues)
  useEffect(() => {
    logDeviceInfo();
  }, []);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUser(JSON.parse(localStorage.getItem('currentUser')));
    };

    // Listen for custom event when user logs in/out
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleStorageChange);
    };
  }, []);

  // Thêm mục vào giỏ hàng
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem._id === item._id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  // Xóa mục khỏi giỏ hàng
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== id));
  };

  // Xóa toàn bộ giỏ hàng (sau khi thanh toán)
  const clearCart = () => {
    setCart([]);
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: "AULTM5n6VFmcrUr5_J8V3vUjghjXqeqJfCG4_l11cgt5TSQa0SvdnLjSoysFG6t1tp3YIJrMwV7LOlVc",
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
          clearCart={clearCart}
        />
      </Router>
    </PayPalScriptProvider>
  );
}

export default App;