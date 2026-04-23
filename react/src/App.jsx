import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerDashboard from './pages/BuyerDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import ProductListingPage from './pages/ProductListingPage';
import CheckoutPage from './pages/CheckoutPage';
import ChatPage from './pages/ChatPage';
import AdminDashboard from './pages/AdminDashboard';
import Ratings from './pages/Ratings';
import Feedback from './pages/Feedback';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
      <Route path="/store/dashboard" element={<StoreOwnerDashboard />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/products/:storeId" element={<ProductListingPage />} />
      <Route path="/chat/:userId" element={<ChatPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/buyer/ratings" element={<Ratings />} />
      <Route path="/buyer/feedback" element={<Feedback />} />
    </Routes>
  );
}

export default App;