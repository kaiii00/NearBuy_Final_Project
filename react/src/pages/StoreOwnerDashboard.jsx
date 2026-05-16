import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { springApi, phpApi, replyToRating } from '../services/api';
import OrderReceiptModal from '../components/OrderReceiptModal';

// SVG Icons
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const PackageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const MessageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const FeedbackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const StoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const XCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// Mini Bar Chart Component
const MiniBarChart = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px', padding: '8px 0' }}>
      {data.map((item, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div
            style={{
              width: '100%',
              maxWidth: '24px',
              height: `${(item.value / max) * 50}px`,
              minHeight: '4px',
              backgroundColor: color,
              borderRadius: '4px 4px 0 0',
              opacity: 0.8,
              transition: 'height 0.3s ease',
            }}
          />
          <span style={{ fontSize: '9px', color: '#52525b', marginTop: '4px' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// Donut Chart Component
const DonutChart = ({ data, size = 120 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativePercent = 0;
  
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <svg width={size} height={size} viewBox="-1.2 -1.2 2.4 2.4" style={{ transform: 'rotate(-90deg)' }}>
        {data.map((slice, i) => {
          if (slice.value === 0) return null;
          const percent = slice.value / total;
          const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
          cumulativePercent += percent;
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          const largeArcFlag = percent > 0.5 ? 1 : 0;
          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
          ].join(' ');
          return <path key={i} d={pathData} fill={slice.color} />;
        })}
        <circle cx="0" cy="0" r="0.6" fill="#0c0c0e" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {data.filter(d => d.value > 0).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: item.color }} />
            <span style={{ fontSize: '11px', color: '#a1a1aa' }}>{item.label}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReplyBox = ({ ratingId, onReplied }) => {
  const [text, setText] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const handleReply = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await replyToRating(ratingId, text.trim());
      onReplied();
    } catch (err) {
      console.error('Failed to reply', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write a reply..."
        style={{ flex: 1, padding: '8px 12px', backgroundColor: '#1a1a1f', border: '1px solid #27272a', borderRadius: '8px', color: '#e4e4e7', fontSize: '13px', outline: 'none' }}
      />
      <button
        onClick={handleReply}
        disabled={saving || !text.trim()}
        style={{ padding: '8px 14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', opacity: saving ? 0.6 : 1 }}>
        {saving ? '...' : 'Reply'}
      </button>
    </div>
  );
};
  const ConversationCard = ({ msg, otherId, otherName, onOpenChat, actionBtn, convAvatar, conversationCard }) => {
  const [photo, setPhoto] = React.useState(null);
  const [displayName, setDisplayName] = React.useState(otherName);

  React.useEffect(() => {
    const fetch = async () => {
      try {
        const res = await springApi.get(`/users/${otherId}/public`);
        if (res.data.profilePhoto) setPhoto(`http://localhost:8080${res.data.profilePhoto}`);
        if (res.data.displayName) setDisplayName(res.data.displayName);
      } catch {}
    };
    fetch();
  }, [otherId]);

  return (
    <div style={conversationCard}>
      {photo
        ? <img src={photo} alt="avatar" style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
        : <div style={convAvatar}><UserIcon /></div>
      }
      <div style={{ flex: 1 }}>
        <p style={{ color: '#e4e4e7', fontWeight: '600', fontSize: '14px', margin: 0 }}>{displayName}</p>
        <p style={{ color: '#71717a', fontSize: '12px', margin: '3px 0 0' }}>{msg.message}</p>
      </div>
      <button style={actionBtn} onClick={onOpenChat}>Open Chat</button>
    </div>
  );
};

 
  const StoreOwnerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStore, setShowAddStore] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [storeForm, setStoreForm] = useState({ name: '', address: '', description: '' });
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [profileForm, setProfileForm] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [toast, setToast] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchMyStores(); fetchMessages(); }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchProducts(selectedStore.id);
      fetchOrders(selectedStore.id);
      fetchRatings(selectedStore.id);
      setProfileForm({
        name: selectedStore.name || '',
        description: selectedStore.description || '',
        address: selectedStore.address || '',
        city: selectedStore.city || '',
        barangay: selectedStore.barangay || '',
        contactNumber: selectedStore.contactNumber || '',
        deliveryFee: selectedStore.deliveryFee || 0,
        minimumOrder: selectedStore.minimumOrder || 0,
        estimatedDeliveryMinutes: selectedStore.estimatedDeliveryMinutes || 30,
      });
    }
  }, [selectedStore]);

  useEffect(() => {
    if (activeTab === 'feedback' && orders.length > 0) fetchFeedbacksForOrders();
  }, [activeTab, orders]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMyStores = async () => {
    try {
      const res = await springApi.get('/stores/my');
      setStores(res.data);
      if (res.data.length > 0) setSelectedStore(res.data[0]);
    } catch (err) { console.error('Failed to load stores', err); }
    finally { setLoading(false); }
  };

  const fetchProducts = async (storeId) => {
    try { const res = await springApi.get(`/stores/${storeId}/products`); setProducts(res.data); }
    catch (err) { console.error('Failed to load products', err); }
  };

  const fetchOrders = async (storeId) => {
    try { const res = await springApi.get(`/orders/store/${storeId}`); setOrders(res.data); }
    catch (err) { console.error('Failed to load orders', err); }
  };

  const fetchRatings = async (storeId) => {
    try {
      const res = await phpApi.get(`/ratings/store/${storeId}`);
      setRatings(res.data.ratings || []);
      setRatingSummary({ average: res.data.average_rating, total: res.data.total_ratings });
    } catch (err) { console.error('Failed to load ratings', err); }
  };

  const fetchFeedbacksForOrders = async () => {
    try {
      const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
      const results = await Promise.all(deliveredOrders.map(async (order) => {
        try { const res = await phpApi.get(`/feedback/order/${order.id}`); return (res.data || []).map(fb => ({ ...fb, orderTotal: order.totalAmount })); }
        catch { return []; }
      }));
      setFeedbacks(results.flat());
    } catch (err) { console.error('Failed to load feedbacks', err); }
  };

  const fetchMessages = async () => {
    try { const res = await springApi.get('/chat'); setMessages(res.data); }
    catch (err) { console.error('Failed to load messages', err); }
  };

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) { setEditingProduct(prev => ({ ...prev, imageUrl: reader.result })); setEditImagePreview(reader.result); }
      else { setProductForm(prev => ({ ...prev, imageUrl: reader.result })); setProductImagePreview(reader.result); }
    };
    reader.readAsDataURL(file);
  };

  const handleAddStore = async () => {
    try {
      const res = await springApi.post('/stores', storeForm);
      setStores([...stores, res.data]);
      setShowAddStore(false);
      setStoreForm({ name: '', address: '', description: '' });
      showToast('Store created successfully!');
    } catch (err) { console.error('Failed to create store', err); }
  };

  const handleAddProduct = async () => {
    try {
      const res = await springApi.post(`/stores/${selectedStore.id}/products`, {
        ...productForm, price: Number(productForm.price), stock: Number(productForm.stock),
      });
      setProducts([...products, res.data]);
      setShowAddProduct(false);
      setProductForm({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
      setProductImagePreview(null);
      showToast('Product added!');
    } catch (err) { console.error('Failed to create product', err); }
  };

  const handleEditProduct = async () => {
    try {
      await springApi.put(`/products/${editingProduct.id}`, {
        name: editingProduct.name, description: editingProduct.description,
        price: Number(editingProduct.price), stock: Number(editingProduct.stock),
        category: editingProduct.category, imageUrl: editingProduct.imageUrl, unit: editingProduct.unit
      });
      fetchProducts(selectedStore.id);
      setShowEditProduct(false);
      setEditingProduct(null);
      showToast('Product updated!');
    } catch (err) { console.error('Failed to update product', err); }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await springApi.delete(`/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      showToast('Product deleted.', 'warning');
    } catch (err) { console.error('Failed to delete product', err); }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await springApi.patch(`/orders/${orderId}/status`, { status });
      fetchOrders(selectedStore.id);
      showToast(`Order marked as ${status.replace(/_/g, ' ')}.`);
    } catch (err) { console.error('Failed to update order status', err); }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await springApi.put(`/stores/${selectedStore.id}`, profileForm);
      setStores(stores.map(s => s.id === selectedStore.id ? res.data : s));
      setSelectedStore(res.data);
      setProfileSuccess(true);
      showToast('Store profile saved!');
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) { console.error('Failed to update store', err); }
    finally { setProfileSaving(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const getStatusColor = (status) => ({
    PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PREPARING: '#8b5cf6',
    OUT_FOR_DELIVERY: '#06b6d4', DELIVERED: '#10b981', CANCELLED: '#ef4444',
  }[status] || '#888');

  const renderStars = (rating) => [1,2,3,4,5].map(star => (
    <span key={star} style={{ fontSize: '16px', color: star <= rating ? '#f59e0b' : '#333' }}>&#9733;</span>
  ));

  const getUniqueConversations = () => {
    const myId = user.id;
    const seen = new Set();
    return messages.filter(msg => {
      const otherId = msg.senderId === myId ? msg.receiverId : msg.senderId;
      if (seen.has(otherId)) return false;
      seen.add(otherId);
      return true;
    });
  };

  const totalRevenue = orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
  const lowStockProducts = products.filter(p => p.stock <= 5);
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  const filteredOrders = orders.filter(order => {
    const matchesStatus = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;
    const searchLower = orderSearch.toLowerCase();
    const matchesSearch = !orderSearch || String(order.id).includes(searchLower) || String(order.buyerId).toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  // Chart data
  const orderStatusData = [
    { label: 'Pending', value: pendingOrders, color: '#f59e0b' },
    { label: 'Confirmed', value: orders.filter(o => o.status === 'CONFIRMED').length, color: '#3b82f6' },
    { label: 'Preparing', value: orders.filter(o => o.status === 'PREPARING').length, color: '#8b5cf6' },
    { label: 'Delivery', value: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length, color: '#06b6d4' },
    { label: 'Delivered', value: deliveredOrders, color: '#10b981' },
    { label: 'Cancelled', value: cancelledOrders, color: '#ef4444' },
  ];

  // Generate last 7 days revenue data
  const getLast7DaysRevenue = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return o.status === 'DELIVERED' && 
          orderDate.getDate() === date.getDate() &&
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear();
      });
      const revenue = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      data.push({ label: days[date.getDay()], value: revenue });
    }
    return data;
  };

  const tabs = [
    { key: 'overview',  label: 'Overview',     icon: <ChartIcon /> },
    { key: 'products',  label: 'Products',      icon: <PackageIcon /> },
    { key: 'orders',    label: 'Orders',        icon: <CartIcon /> },
    { key: 'messages',  label: 'Messages',      icon: <MessageIcon /> },
    { key: 'ratings',   label: 'Ratings',       icon: <StarIcon /> },
    { key: 'feedback',  label: 'Feedback',      icon: <FeedbackIcon /> },
    { key: 'profile',   label: 'Store Profile', icon: <SettingsIcon /> },
  ];

  return (
    <div style={styles.root}>
      {/* Toast */}
      {toast && (
        <div style={{ ...styles.toast, backgroundColor: toast.type === 'success' ? '#16a34a' : toast.type === 'warning' ? '#d97706' : '#dc2626' }}>
          <span style={{ marginRight: '8px' }}>
            {toast.type === 'success' ? <CheckCircleIcon /> : toast.type === 'warning' ? <AlertIcon /> : <XCircleIcon />}
          </span>
          {toast.message}
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          style={styles.overlay} 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, ...(sidebarOpen ? styles.sidebarOpen : {}) }}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarLogo}>
            <div style={styles.logoBox}>N</div>
            <span style={styles.logoText}>NearBuy</span>
          </div>
          <button style={styles.closeSidebarBtn} onClick={() => setSidebarOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        {/* Store Selector */}
        <div style={styles.storeSelectorSection}>
          <span style={styles.sidebarSectionLabel}>MY STORES</span>
          <div style={styles.storeList}>
            {stores.map(store => (
              <button key={store.id}
                style={{ ...styles.storeBtn, ...(selectedStore?.id === store.id ? styles.storeBtnActive : {}) }}
                onClick={() => { setSelectedStore(store); setSidebarOpen(false); }}>
                <span style={styles.storeBtnIcon}><StoreIcon /></span>
                <span style={styles.storeBtnName}>{store.name}</span>
              </button>
            ))}
            <button style={styles.addStoreBtn} onClick={() => setShowAddStore(true)}>
              <PlusIcon />
              <span>Add Store</span>
            </button>
          </div>
        </div>

        {/* Nav */}
        <div style={styles.sidebarNav}>
          <span style={styles.sidebarSectionLabel}>DASHBOARD</span>
          {tabs.map(tab => (
            <button key={tab.key}
              style={{ ...styles.sidebarBtn, ...(activeTab === tab.key ? styles.sidebarBtnActive : {}) }}
              onClick={() => { setActiveTab(tab.key); if (tab.key === 'messages') fetchMessages(); if (tab.key === 'ratings' && selectedStore) fetchRatings(selectedStore.id); setSidebarOpen(false); }}>
              <span style={styles.sidebarBtnIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.key === 'orders' && pendingOrders > 0 && (
                <span style={styles.sidebarBadge}>{pendingOrders}</span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom */}
        <div style={styles.sidebarBottom}>
          <div style={styles.ownerProfile}>
            <div style={styles.ownerAvatar}>{user.username?.[0]?.toUpperCase() || 'S'}</div>
            <div>
              <div style={styles.ownerName}>{user.username}</div>
              <div style={styles.ownerRole}>Store Owner</div>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Topbar */}
        <header style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <button style={styles.hamburgerBtn} onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </button>
            <div>
              <h1 style={styles.pageTitle}>
                <span style={styles.pageTitleIcon}>{tabs.find(t => t.key === activeTab)?.icon}</span>
                {tabs.find(t => t.key === activeTab)?.label}
                {selectedStore && activeTab !== 'overview' && <span style={styles.pageTitleStore}> - {selectedStore.name}</span>}
              </h1>
              <p style={styles.pageSubtitle}>
                {activeTab === 'overview' && `Showing stats for ${selectedStore?.name || 'your store'}`}
                {activeTab === 'products' && `${products.length} products`}
                {activeTab === 'orders' && `${orders.length} total orders`}
                {activeTab === 'messages' && `${getUniqueConversations().length} conversations`}
                {activeTab === 'ratings' && `${ratingSummary?.total || 0} reviews`}
                {activeTab === 'feedback' && `${feedbacks.length} feedback received`}
                {activeTab === 'profile' && 'Manage your store details'}
              </p>
            </div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.liveIndicator}>
              <span style={styles.liveDot}></span>
              Live
            </div>
          </div>
        </header>

        <div style={styles.content}>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <div style={styles.statsRow}>
                {[
                  { icon: <DollarIcon />, value: `P${totalRevenue.toFixed(2)}`, label: 'Total Revenue', color: '#3b82f6' },
                  { icon: <ClockIcon />, value: pendingOrders, label: 'Pending Orders', color: '#f59e0b' },
                  { icon: <CheckCircleIcon />, value: deliveredOrders, label: 'Delivered', color: '#10b981' },
                  { icon: <XCircleIcon />, value: cancelledOrders, label: 'Cancelled', color: '#ef4444' },
                  { icon: <PackageIcon />, value: products.length, label: 'Products', color: '#8b5cf6' },
                  { icon: <StarIcon />, value: ratingSummary?.average || 'N/A', label: 'Avg Rating', color: '#f59e0b' },
                ].map((stat, i) => (
                  <div key={i} style={{ ...styles.statCard, borderColor: stat.color + '40' }}>
                    <div style={styles.statTop}>
                      <span style={styles.statLabel}>{stat.label}</span>
                      <span style={{ color: stat.color }}>{stat.icon}</span>
                    </div>
                    <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
                    <div style={styles.statBar}>
                      <div style={{ ...styles.statBarFill, width: '100%', backgroundColor: stat.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div style={styles.chartsRow}>
                <div style={styles.chartCard}>
                  <div style={styles.chartHeader}>
                    <h3 style={styles.chartTitle}>
                      <TrendingUpIcon />
                      <span>Revenue (Last 7 Days)</span>
                    </h3>
                  </div>
                  <MiniBarChart data={getLast7DaysRevenue()} color="#3b82f6" />
                </div>
                <div style={styles.chartCard}>
                  <div style={styles.chartHeader}>
                    <h3 style={styles.chartTitle}>
                      <ChartIcon />
                      <span>Order Status Distribution</span>
                    </h3>
                  </div>
                  <DonutChart data={orderStatusData} />
                </div>
              </div>

              <div style={styles.overviewGrid}>
                <div style={styles.overviewCard}>
                  <h3 style={styles.overviewCardTitle}>
                    <AlertIcon />
                    <span>Low Stock Alerts</span>
                  </h3>
                  {lowStockProducts.length === 0 ? <p style={styles.overviewEmpty}><CheckCircleIcon /> All products well stocked!</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {lowStockProducts.map(p => (
                        <div key={p.id} style={styles.lowStockItem}>
                          <span style={{ fontSize: '13px', color: '#ddd' }}>{p.name}</span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '20px', backgroundColor: p.stock === 0 ? '#ef444422' : '#f59e0b22', color: p.stock === 0 ? '#ef4444' : '#f59e0b', border: `1px solid ${p.stock === 0 ? '#ef444466' : '#f59e0b66'}` }}>
                            {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.overviewCard}>
                  <h3 style={styles.overviewCardTitle}>
                    <ClockIcon />
                    <span>Recent Orders</span>
                  </h3>
                  {recentOrders.length === 0 ? <p style={styles.overviewEmpty}>No orders yet.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {recentOrders.map(order => (
                        <div key={order.id} style={styles.recentOrderItem}>
                          <div>
                            <p style={{ fontSize: '13px', color: '#fff', fontWeight: 'bold', margin: 0 }}>Order #{order.id}</p>
                            <p style={{ fontSize: '11px', color: '#52525b', margin: '2px 0 0' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 'bold', margin: '0 0 4px' }}>P{order.totalAmount}</p>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#fff', padding: '2px 8px', borderRadius: '20px', display: 'inline-block', backgroundColor: getStatusColor(order.status) }}>{order.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.overviewCard}>
                  <h3 style={styles.overviewCardTitle}>
                    <ChartIcon />
                    <span>Order Breakdown</span>
                  </h3>
                  {orders.length === 0 ? <p style={styles.overviewEmpty}>No orders yet.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {['PENDING','CONFIRMED','PREPARING','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'].map(status => {
                        const count = orders.filter(o => o.status === status).length;
                        if (count === 0) return null;
                        const pct = Math.round((count / orders.length) * 100);
                        return (
                          <div key={status}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '12px', color: '#a1a1aa' }}>{status.replace(/_/g, ' ')}</span>
                              <span style={{ fontSize: '12px', color: '#52525b' }}>{count} ({pct}%)</span>
                            </div>
                            <div style={styles.progressBar}>
                              <div style={{ ...styles.progressFill, width: `${pct}%`, backgroundColor: getStatusColor(status) }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={styles.overviewCard}>
                  <h3 style={styles.overviewCardTitle}>
                    <PackageIcon />
                    <span>Products by Category</span>
                  </h3>
                  {products.length === 0 ? <p style={styles.overviewEmpty}>No products yet.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(products.reduce((acc, p) => { const cat = p.category || 'Uncategorized'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).map(([cat, count]) => (
                        <div key={cat} style={styles.recentOrderItem}>
                          <span style={{ fontSize: '13px', color: '#ddd' }}>{cat}</span>
                          <span style={{ fontSize: '12px', color: '#52525b' }}>{count} product{count > 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* PRODUCTS */}
          {activeTab === 'products' && (
            <>
              <div style={styles.sectionHeader}>
                <div />
                <button style={styles.addBtn} onClick={() => setShowAddProduct(true)}>
                  <PlusIcon /> Add Product
                </button>
              </div>
              {products.length === 0 && <div style={styles.emptyState}><div style={styles.emptyIcon}><PackageIcon /></div><p style={styles.emptyText}>No products yet.</p></div>}
              <div style={styles.productsGrid}>
                {products.map(product => (
                  <div key={product.id} style={{ ...styles.productCard, borderColor: product.stock <= 5 ? '#f59e0b40' : '#1f1f24' }}>
                    {product.stock <= 5 && product.stock > 0 && <div style={styles.lowStockWarning}><AlertIcon /> Low Stock: {product.stock} left</div>}
                    {product.stock === 0 && <div style={{ ...styles.lowStockWarning, backgroundColor: '#ef444422', color: '#ef4444' }}><XCircleIcon /> Out of Stock</div>}
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
                    ) : (
                      <div style={styles.noImage}><PackageIcon /> No Image</div>
                    )}
                    <h3 style={styles.productName}>{product.name}</h3>
                    <p style={styles.productCategory}>{product.category}</p>
                    <p style={styles.productPrice}>P{product.price}</p>
                    <p style={styles.productStock}>Stock: {product.stock}</p>
                    <p style={styles.productDesc}>{product.description}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ ...styles.editBtn, flex: 1 }} onClick={() => { setEditingProduct(product); setEditImagePreview(null); setShowEditProduct(true); }}>Edit</button>
                      <button style={{ ...styles.deleteBtn, flex: 1 }} onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
                <div style={styles.searchWrap}>
                  <SearchIcon />
                  <input style={styles.searchInput} placeholder="Search by Order ID or Customer ID..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
                  {orderSearch && <button style={styles.clearSearch} onClick={() => setOrderSearch('')}><CloseIcon /></button>}
                </div>
              </div>
              <div style={styles.filterRow}>
                {STATUS_FILTERS.map(status => {
                  const count = status === 'ALL' ? orders.length : orders.filter(o => o.status === status).length;
                  return (
                    <button key={status}
                      style={{ ...styles.filterPill, ...(orderStatusFilter === status ? { backgroundColor: status === 'ALL' ? '#3b82f6' : getStatusColor(status), color: '#fff', borderColor: status === 'ALL' ? '#3b82f6' : getStatusColor(status) } : {}) }}
                      onClick={() => setOrderStatusFilter(status)}>
                      {status.replace(/_/g, ' ')}
                      <span style={{ ...styles.filterCount, backgroundColor: orderStatusFilter === status ? 'rgba(255,255,255,0.25)' : '#27272a' }}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {filteredOrders.length === 0 ? (
                <div style={styles.emptyState}><div style={styles.emptyIcon}><SearchIcon /></div><p style={styles.emptyText}>No orders match your filter.</p></div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {['Order', 'Customer', 'Total', 'Date', 'Notes', 'Status', 'Actions'].map(h => <th key={h} style={styles.th}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order, i) => (
                        <tr key={order.id} style={{ ...styles.tr, animationDelay: `${i * 30}ms` }}>
                          <td style={styles.td}><span style={styles.orderIdBadge}>#{order.id}</span></td>
                          <td style={styles.td}><span style={styles.tdMuted}>User #{order.buyerId}</span></td>
                          <td style={styles.td}><span style={{ color: '#3b82f6', fontWeight: '600', fontSize: '14px' }}>P{order.totalAmount}</span></td>
                          <td style={styles.td}><span style={styles.tdMuted}>{new Date(order.createdAt).toLocaleDateString()}</span></td>
                          <td style={styles.td}>
                            <div style={{ fontSize: '12px', color: '#a1a1aa', maxWidth: '180px' }}>
                              {order.deliveryAddress && <div>📍 {order.deliveryAddress}</div>}
                              {order.contactNumber && <div>📞 {order.contactNumber}</div>}
                              {order.deliveryNotes && <div style={{ color: '#f59e0b' }}>📝 {order.deliveryNotes}</div>}
                              {!order.deliveryAddress && !order.notes && <span style={{ color: '#3f3f46' }}>—</span>}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', border: '1px solid', fontSize: '11px', fontWeight: '600', backgroundColor: `${getStatusColor(order.status)}18`, color: getStatusColor(order.status), borderColor: `${getStatusColor(order.status)}40` }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: getStatusColor(order.status), display: 'inline-block' }}></span>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button style={styles.actionBtn} onClick={() => navigate(`/chat/${order.buyerId}`)}>Chat</button>
                              {order.status === 'DELIVERED' && (<button style={styles.actionBtn} onClick={() => setReceiptOrder(order)}>Receipt</button>)}
                              {order.status === 'PENDING' && (<><button style={{ ...styles.actionBtn, color: '#10b981', borderColor: '#10b98140' }} onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}>Accept</button><button style={{ ...styles.actionBtn, color: '#ef4444', borderColor: '#ef444440' }} onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}>Reject</button></>)}
                              {order.status === 'CONFIRMED' && <button style={{ ...styles.actionBtn, color: '#8b5cf6', borderColor: '#8b5cf640' }} onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}>Preparing</button>}
                              {order.status === 'PREPARING' && <button style={{ ...styles.actionBtn, color: '#06b6d4', borderColor: '#06b6d440' }} onClick={() => handleUpdateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}>Delivery</button>}
                              {order.status === 'OUT_FOR_DELIVERY' && <button style={{ ...styles.actionBtn, color: '#10b981', borderColor: '#10b98140' }} onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}>Delivered</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* MESSAGES */}
          {activeTab === 'messages' && (
            <>
              {messages.length === 0 && <div style={styles.emptyState}><div style={styles.emptyIcon}><MessageIcon /></div><p style={styles.emptyText}>No messages yet.</p></div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {getUniqueConversations().map(msg => {
                  const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
                  const otherName = msg.senderId === user.id ? `User #${msg.receiverId}` : msg.senderUsername;
                  return (
                    <ConversationCard
                      key={msg.id}
                      msg={msg}
                      otherId={otherId}
                      otherName={otherName}
                      onOpenChat={() => navigate(`/chat/${otherId}`)}
                      actionBtn={styles.actionBtn}
                      convAvatar={styles.convAvatar}
                      conversationCard={styles.conversationCard}
                    />
                  );
                })}
              </div>
            </>
          )}

          {/* RATINGS */}
          {activeTab === 'ratings' && (
            <>
              {ratingSummary && (
                <div style={styles.ratingsSummaryCard}>
                  <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}><StarIcon /> {ratingSummary.average || 'N/A'}</span>
                  <div>
                    <p style={{ color: '#e4e4e7', fontWeight: '600', margin: 0 }}>{ratingSummary.total} reviews</p>
                    <p style={{ color: '#52525b', fontSize: '12px', margin: '2px 0 0' }}>Overall store rating</p>
                  </div>
                </div>
              )}
              {ratings.length === 0 && <div style={styles.emptyState}><div style={styles.emptyIcon}><StarIcon /></div><p style={styles.emptyText}>No ratings yet.</p></div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ratings.map(rating => (
                  <div key={rating.id} style={styles.ratingCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#a1a1aa', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><UserIcon /> User #{rating.user_id}</span>
                      <div>{renderStars(rating.rating)}</div>
                    </div>
                   {rating.comment && <p style={{ color: '#e4e4e7', fontSize: '14px', marginBottom: '8px', fontStyle: 'italic' }}>"{rating.comment}"</p>}
                      {rating.reply ? (
                        <div style={{ backgroundColor: '#1e2a3b', borderLeft: '3px solid #3b82f6', padding: '10px 14px', borderRadius: '6px', marginTop: '8px' }}>
                          <p style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600', margin: '0 0 4px' }}>Store Reply</p>
                          <p style={{ fontSize: '13px', color: '#a1a1aa', margin: 0 }}>{rating.reply}</p>
                        </div>
                      ) : (
                        <ReplyBox ratingId={rating.id} onReplied={() => fetchRatings(selectedStore.id)} />
                      )}
                    <p style={{ color: '#52525b', fontSize: '12px', margin: 0 }}>{new Date(rating.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* FEEDBACK */}
          {activeTab === 'feedback' && (
            <>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
                {[
                  { num: feedbacks.length, label: 'Total Feedback' },
                  { num: orders.filter(o => o.status === 'DELIVERED').length, label: 'Delivered Orders' },
                  { num: orders.filter(o => o.status === 'DELIVERED').length > 0 ? Math.round((feedbacks.length / orders.filter(o => o.status === 'DELIVERED').length) * 100) + '%' : '0%', label: 'Response Rate' },
                ].map((item, i) => (
                  <div key={i} style={styles.feedbackStatCard}>
                    <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>{item.num}</span>
                    <span style={{ fontSize: '12px', color: '#52525b' }}>{item.label}</span>
                  </div>
                ))}
              </div>
              {feedbacks.length === 0 ? <div style={styles.emptyState}><div style={styles.emptyIcon}><FeedbackIcon /></div><p style={styles.emptyText}>No feedback yet.</p></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {feedbacks.map(fb => (
                    <div key={fb.id} style={styles.feedbackCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#1a1a1f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserIcon /></div>
                          <div>
                            <p style={{ color: '#e4e4e7', fontWeight: '600', fontSize: '13px', margin: 0 }}>User #{fb.user_id}</p>
                            <p style={{ color: '#52525b', fontSize: '11px', margin: '2px 0 0' }}>Order #{fb.order_id}</p>
                          </div>
                        </div>
                        <span style={{ color: '#3f3f46', fontSize: '11px' }}>{fb.created_at ? new Date(fb.created_at).toLocaleDateString() : 'Recently'}</span>
                      </div>
                      <div style={{ backgroundColor: '#1a1a1f', borderRadius: '8px', padding: '14px', borderLeft: '3px solid #3b82f6' }}>
                        <p style={{ color: '#d4d4d8', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>"{fb.comment}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* STORE PROFILE */}
          {activeTab === 'profile' && profileForm && (
            <div style={styles.profileForm}>
              {profileSuccess && (
                <div style={{ backgroundColor: '#1e293b', border: '1px solid #3b82f640', borderRadius: '10px', padding: '12px 16px', color: '#3b82f6', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircleIcon /> Store profile saved successfully!
                </div>
              )}
              <div style={styles.profileGrid}>
                {[
                  { label: 'Store Name', key: 'name', type: 'text' },
                  { label: 'Contact Number', key: 'contactNumber', type: 'text' },
                  { label: 'Address', key: 'address', type: 'text' },
                  { label: 'City', key: 'city', type: 'text' },
                  { label: 'Barangay', key: 'barangay', type: 'text' },
                  { label: 'Delivery Fee (P)', key: 'deliveryFee', type: 'number' },
                  { label: 'Minimum Order (P)', key: 'minimumOrder', type: 'number' },
                  { label: 'Est. Delivery (mins)', key: 'estimatedDeliveryMinutes', type: 'number' },
                ].map(field => (
                  <div key={field.key} style={styles.profileField}>
                    <label style={styles.profileLabel}>{field.label.toUpperCase()}</label>
                    <div style={styles.profileInputBox}>
                      <input
                        style={styles.profileInput}
                        type={field.type}
                        value={profileForm[field.key]}
                        onChange={e => setProfileForm({ ...profileForm, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                      />
                    </div>
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={styles.profileLabel}>DESCRIPTION</label>
                  <textarea
                    style={{ ...styles.profileInput, height: '90px', resize: 'vertical', padding: '12px', borderRadius: '10px', border: '1px solid #27272a', backgroundColor: '#1a1a1f', color: '#e4e4e7', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '14px', outline: 'none' }}
                    value={profileForm.description}
                    onChange={e => setProfileForm({ ...profileForm, description: e.target.value })}
                  />
                </div>
              </div>
              <button
                style={{ ...styles.saveProfileBtn, opacity: profileSaving ? 0.6 : 1, marginTop: '24px' }}
                onClick={handleSaveProfile}
                disabled={profileSaving}
              >
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Add Store Modal */}
      {showAddStore && (
        <div style={styles.modal}><div style={styles.modalBox}>
          <h2 style={styles.modalTitle}>Add New Store</h2>
          <input style={styles.modalInput} placeholder="Store name" value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })} />
          <input style={styles.modalInput} placeholder="Address" value={storeForm.address} onChange={e => setStoreForm({ ...storeForm, address: e.target.value })} />
          <input style={styles.modalInput} placeholder="Description" value={storeForm.description} onChange={e => setStoreForm({ ...storeForm, description: e.target.value })} />
          <div style={styles.modalButtons}>
            <button style={styles.cancelBtn} onClick={() => setShowAddStore(false)}>Cancel</button>
            <button style={styles.saveBtn} onClick={handleAddStore}>Save</button>
          </div>
        </div></div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div style={styles.modal}><div style={styles.modalBox}>
          <h2 style={styles.modalTitle}>Add New Product</h2>
          <input style={styles.modalInput} placeholder="Product name" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
          <input style={styles.modalInput} placeholder="Description" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
          <input style={styles.modalInput} placeholder="Price" type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
          <input style={styles.modalInput} placeholder="Stock" type="number" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} />
          <input style={styles.modalInput} placeholder="Category" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#71717a', fontSize: '11px', fontWeight: '600', letterSpacing: '0.8px' }}>PRODUCT IMAGE</label>
            <input type="file" accept="image/*" onChange={e => handleImageChange(e, false)} style={{ color: '#a1a1aa', fontSize: '13px' }} />
            {productImagePreview && <img src={productImagePreview} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #27272a' }} />}
          </div>
          <div style={styles.modalButtons}>
            <button style={styles.cancelBtn} onClick={() => { setShowAddProduct(false); setProductImagePreview(null); }}>Cancel</button>
            <button style={styles.saveBtn} onClick={handleAddProduct}>Save</button>
          </div>
        </div></div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && editingProduct && (
        <div style={styles.modal}><div style={styles.modalBox}>
          <h2 style={styles.modalTitle}>Edit Product</h2>
          <input style={styles.modalInput} placeholder="Product name" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} />
          <input style={styles.modalInput} placeholder="Description" value={editingProduct.description || ''} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} />
          <input style={styles.modalInput} placeholder="Price" type="number" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} />
          <input style={styles.modalInput} placeholder="Stock" type="number" value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: e.target.value })} />
          <input style={styles.modalInput} placeholder="Category" value={editingProduct.category || ''} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#71717a', fontSize: '11px', fontWeight: '600', letterSpacing: '0.8px' }}>PRODUCT IMAGE</label>
            <input type="file" accept="image/*" onChange={e => handleImageChange(e, true)} style={{ color: '#a1a1aa', fontSize: '13px' }} />
            {(editImagePreview || editingProduct?.imageUrl) && <img src={editImagePreview || editingProduct.imageUrl} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #27272a' }} />}
          </div>
          <div style={styles.modalButtons}>
            <button style={styles.cancelBtn} onClick={() => { setShowEditProduct(false); setEditingProduct(null); setEditImagePreview(null); }}>Cancel</button>
            <button style={styles.saveBtn} onClick={handleEditProduct}>Save</button>
          </div>
        </div></div>
      )}
        {receiptOrder && <OrderReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  root: { display: 'flex', minHeight: '100vh', backgroundColor: '#0c0c0e', fontFamily: "'DM Sans', sans-serif", color: '#e4e4e7' },

  toast: { position: 'fixed', top: '20px', right: '20px', zIndex: 9999, padding: '12px 20px', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '500', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', animation: 'toastIn 0.3s ease', display: 'flex', alignItems: 'center' },

  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 998 },

  // Sidebar
  sidebar: { 
    width: '260px', 
    minWidth: '260px', 
    backgroundColor: '#111114', 
    borderRight: '1px solid #1f1f24', 
    display: 'flex', 
    flexDirection: 'column', 
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh', 
    overflowY: 'auto',
    zIndex: 999,
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease',
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  sidebarHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #1f1f24' },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoBox: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#fff' },
  logoText: { fontSize: '18px', fontWeight: '600', color: '#fff', letterSpacing: '-0.3px' },
  closeSidebarBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', backgroundColor: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', borderRadius: '8px' },
  storeSelectorSection: { padding: '14px 12px 8px' },
  sidebarSectionLabel: { fontSize: '10px', fontWeight: '600', color: '#52525b', letterSpacing: '1.2px', padding: '0 8px', display: 'block', marginBottom: '6px' },
  storeList: { display: 'flex', flexDirection: 'column', gap: '3px' },
  storeBtn: { width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#71717a', fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' },
  storeBtnActive: { backgroundColor: '#1e2a3b', color: '#3b82f6' },
  storeBtnIcon: { fontSize: '14px', flexShrink: 0, display: 'flex', alignItems: 'center' },
  storeBtnName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  addStoreBtn: { width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '8px', border: '1px dashed #27272a', backgroundColor: 'transparent', color: '#52525b', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' },
  sidebarNav: { flex: 1, padding: '8px 12px' },
  sidebarBtn: { width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#71717a', fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans', sans-serif", fontWeight: '500', marginBottom: '2px', transition: 'all 0.15s' },
  sidebarBtnActive: { backgroundColor: '#1e2a3b', color: '#3b82f6' },
  sidebarBtnIcon: { fontSize: '15px', flexShrink: 0, display: 'flex', alignItems: 'center' },
  sidebarBadge: { marginLeft: 'auto', backgroundColor: '#f59e0b', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '999px', minWidth: '16px', textAlign: 'center' },
  sidebarBottom: { padding: '16px', borderTop: '1px solid #1f1f24', display: 'flex', flexDirection: 'column', gap: '12px' },
  ownerProfile: { display: 'flex', alignItems: 'center', gap: '10px' },
  ownerAvatar: { width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  ownerName: { fontSize: '13px', fontWeight: '600', color: '#d4d4d8' },
  ownerRole: { fontSize: '11px', color: '#52525b' },
  logoutBtn: { width: '100%', padding: '10px', backgroundColor: '#1a1a1f', color: '#71717a', border: '1px solid #27272a', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s' },

  // Main
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', marginLeft: '0' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #1f1f24', flexWrap: 'wrap', gap: '16px' },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  hamburgerBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', backgroundColor: '#1a1a1f', border: '1px solid #27272a', borderRadius: '10px', color: '#e4e4e7', cursor: 'pointer', transition: 'all 0.15s' },
  pageTitle: { fontSize: '18px', fontWeight: '600', color: '#fff', margin: '0 0 4px', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' },
  pageTitleIcon: { display: 'flex', alignItems: 'center', color: '#3b82f6' },
  pageTitleStore: { color: '#52525b', fontWeight: '400' },
  pageSubtitle: { fontSize: '13px', color: '#52525b', margin: 0 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  liveIndicator: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#3b82f6', fontWeight: '500' },
  liveDot: { width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#3b82f6', animation: 'pulse 2s infinite', display: 'inline-block' },
  content: { padding: '24px', flex: 1 },

  // Charts
  chartsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' },
  chartCard: { backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '14px', padding: '20px' },
  chartHeader: { marginBottom: '12px' },
  chartTitle: { fontSize: '13px', fontWeight: '600', color: '#e4e4e7', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },

  // Stats
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px', marginBottom: '24px' },
  statCard: { backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '12px', padding: '18px', animation: 'fadeSlideIn 0.4s ease both', transition: 'all 0.2s ease' },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  statLabel: { fontSize: '11px', color: '#52525b', fontWeight: '500', letterSpacing: '0.3px' },
  statValue: { fontSize: '24px', fontWeight: '600', letterSpacing: '-0.5px', marginBottom: '10px' },
  statBar: { height: '3px', backgroundColor: '#1f1f24', borderRadius: '999px', overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: '999px', opacity: '0.6' },

  // Overview
  overviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' },
  overviewCard: { backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '14px', padding: '22px' },
  overviewCardTitle: { fontSize: '14px', fontWeight: '600', color: '#e4e4e7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
  overviewEmpty: { color: '#3f3f46', fontSize: '13px', textAlign: 'center', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  lowStockItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#1a1a1f', borderRadius: '8px' },
  recentOrderItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#1a1a1f', borderRadius: '8px' },
  progressBar: { height: '5px', backgroundColor: '#1f1f24', borderRadius: '999px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '999px' },

  // Table
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  addBtn: { padding: '10px 18px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' },
  tableWrapper: { backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '12px', overflow: 'auto', animation: 'fadeSlideIn 0.4s ease both' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#52525b', letterSpacing: '0.8px', textTransform: 'uppercase', borderBottom: '1px solid #1f1f24', backgroundColor: '#0e0e12', fontFamily: "'DM Mono', monospace" },
  tr: { borderBottom: '1px solid #1a1a1f', animation: 'fadeSlideIn 0.4s ease both', transition: 'background 0.15s' },
  td: { padding: '13px 16px', verticalAlign: 'middle' },
  orderIdBadge: { fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#3b82f6', backgroundColor: '#1e2a3b', padding: '2px 8px', borderRadius: '4px' },
  tdMuted: { fontSize: '13px', color: '#71717a' },
  actionBtn: { padding: '6px 12px', backgroundColor: 'transparent', color: '#3b82f6', border: '1px solid #2d3a4d', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' },
  searchWrap: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '10px', padding: '10px 14px', maxWidth: '400px' },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e4e4e7', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" },
  clearSearch: { background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center' },
  filterRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', marginTop: '12px' },
  filterPill: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#111114', color: '#71717a', border: '1px solid #1f1f24', borderRadius: '20px', padding: '6px 14px', cursor: 'pointer', fontSize: '11px', fontWeight: '500', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" },
  filterCount: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', padding: '0 4px' },

  // Products
  productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '18px' },
  productCard: { backgroundColor: '#111114', borderRadius: '14px', padding: '18px', border: '1px solid #1f1f24', transition: 'all 0.2s ease' },
  noImage: { width: '100%', height: '150px', backgroundColor: '#1a1a1f', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f3f46', fontSize: '13px', marginBottom: '12px', gap: '8px' },
  productName: { fontSize: '16px', color: '#e4e4e7', marginBottom: '6px', fontWeight: '600' },
  productCategory: { color: '#3b82f6', fontSize: '12px', marginBottom: '4px' },
  productPrice: { color: '#3b82f6', fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' },
  productStock: { color: '#71717a', fontSize: '12px', marginBottom: '4px' },
  productDesc: { color: '#52525b', fontSize: '12px', marginBottom: '14px' },
  editBtn: { padding: '8px', backgroundColor: '#1c2a1a', color: '#3b82f6', border: '1px solid #2d3a4d', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' },
  deleteBtn: { padding: '8px', backgroundColor: '#1a1111', color: '#ef4444', border: '1px solid #2d1818', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' },
  lowStockWarning: { backgroundColor: '#f59e0b22', color: '#f59e0b', fontSize: '11px', fontWeight: 'bold', padding: '6px 10px', borderRadius: '6px', marginBottom: '10px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },

  // Messages
  conversationCard: { backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px', transition: 'all 0.15s' },
  convAvatar: { width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#1a1a1f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b', flexShrink: 0 },

  // Ratings
  ratingsSummaryCard: { backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' },
  ratingCard: { backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '12px', padding: '16px', marginBottom: '10px' },

  // Feedback
  feedbackStatCard: { flex: '1 1 150px', backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  feedbackCard: { backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '14px', padding: '20px' },

  // Profile
  profileForm: { backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '14px', padding: '28px' },
  profileGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' },
  profileField: { display: 'flex', flexDirection: 'column', gap: '8px' },
  profileLabel: { fontSize: '10px', fontWeight: '600', color: '#52525b', letterSpacing: '0.8px' },
  profileInputBox: { backgroundColor: '#1a1a1f', border: '1px solid #27272a', borderRadius: '10px', overflow: 'hidden' },
  profileInput: { width: '100%', padding: '12px 14px', backgroundColor: '#1a1a1f', border: '1px solid #27272a', borderRadius: '10px', color: '#e4e4e7', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  saveProfileBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 16px rgba(59,130,246,0.25)' },

  // Empty
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#52525b' },
  emptyIcon: { fontSize: '40px', marginBottom: '12px', display: 'flex', justifyContent: 'center' },
  emptyText: { fontSize: '14px' },

  // Modal
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modalBox: { backgroundColor: '#111114', borderRadius: '16px', padding: '28px', border: '1px solid #1f1f24', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '8px' },
  modalInput: { padding: '12px 14px', backgroundColor: '#1a1a1f', border: '1px solid #27272a', borderRadius: '10px', color: '#e4e4e7', fontSize: '14px', outline: 'none', fontFamily: 'inherit' },
  modalButtons: { display: 'flex', gap: '12px', marginTop: '8px' },
  cancelBtn: { flex: 1, padding: '11px', backgroundColor: 'transparent', color: '#71717a', border: '1px solid #27272a', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" },
  saveBtn: { flex: 1, padding: '11px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif" },

  // Desktop styles - added via media query in the style tag
  '@media (min-width: 769px)': {
    sidebar: { transform: 'translateX(0)', position: 'sticky' },
    main: { marginLeft: '260px' },
    hamburgerBtn: { display: 'none' },
  }
};

export default StoreOwnerDashboard;
