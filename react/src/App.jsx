import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerDashboard from './pages/BuyerDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import ProductListingPage from './pages/ProductListingPage';
import StoreProfilePage from './pages/StoreProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import ChatPage from './pages/ChatPage';
import AdminDashboard from './pages/AdminDashboard';
import CompleteProfile from './pages/CompleteProfile';
import Ratings from './pages/Ratings';
import Feedback from './pages/Feedback';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import OAuth2Callback from './pages/OAuth2Callback';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  if (!token || !user?.id) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role?.toUpperCase())) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oauth2/callback" element={<OAuth2Callback />} />
      <Route path="/buyer/dashboard" element={<ProtectedRoute roles={['BUYER']}><BuyerDashboard /></ProtectedRoute>} />
      <Route path="/store/dashboard" element={<ProtectedRoute roles={['STORE_OWNER']}><StoreOwnerDashboard /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/store/:storeId" element={<ProtectedRoute><StoreProfilePage /></ProtectedRoute>} />
      <Route path="/products/:storeId" element={<ProtectedRoute><ProductListingPage /></ProtectedRoute>} />
      <Route path="/chat/:userId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/buyer/ratings" element={<ProtectedRoute roles={['BUYER']}><Ratings /></ProtectedRoute>} />
      <Route path="/buyer/feedback" element={<ProtectedRoute roles={['BUYER']}><Feedback /></ProtectedRoute>} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;