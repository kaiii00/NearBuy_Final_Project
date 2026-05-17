import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStores, getOrders, placeOrder, cancelOrder, getNotifications, markNotificationRead, markAllNotificationsRead, getMessages, springApi } from '../services/api';
import OrderReceiptModal from '../components/OrderReceiptModal';
import Feedback from './Feedback';

// ── Cart Drawer ───────────────────────────────────────────────────────────────
const CartDrawer = ({ open, onClose, onCheckout }) => {
  const [cart, setCart] = useState([]);
  const [storeName, setStoreName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (open) loadCart();
  }, [open]);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const savedStoreId = localStorage.getItem('storeId');
    setCart(savedCart);
    // Try to get store name
    if (savedStoreId) {
      springApi.get(`/stores/${savedStoreId}`).then(res => setStoreName(res.data.name)).catch(() => {});
    }
  };

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const increase = (productId) => {
    updateCart(cart.map(item => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const decrease = (productId) => {
    const item = cart.find(i => i.id === productId);
    if (item?.quantity === 1) {
      updateCart(cart.filter(i => i.id !== productId));
    } else {
      updateCart(cart.map(i => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i));
    }
  };

  const remove = (productId) => {
    updateCart(cart.filter(i => i.id !== productId));
  };

  const clearCart = () => {
    updateCart([]);
    localStorage.removeItem('storeId');
  };

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const storeId = localStorage.getItem('storeId');

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 400, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '380px',
        backgroundColor: '#0e0e11', borderLeft: '1px solid #1f1f24',
        zIndex: 500, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? '-20px 0 60px rgba(0,0,0,0.5)' : 'none',
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #1f1f24', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>🛒 Your Cart</h2>
            {storeName && <p style={{ fontSize: '12px', color: '#52525b', margin: '3px 0 0' }}>from {storeName}</p>}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {cart.length > 0 && (
              <button onClick={clearCart} style={{ fontSize: '11px', color: '#ef4444', backgroundColor: 'transparent', border: '1px solid #ef444440', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Clear
              </button>
            )}
            <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1a1a1f', border: '1px solid #27272a', color: '#71717a', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
              <div style={{ fontSize: '56px' }}>🛒</div>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#52525b', margin: 0 }}>Your cart is empty</p>
              <p style={{ fontSize: '13px', color: '#3f3f46', margin: 0, textAlign: 'center' }}>Browse stores and add items to get started!</p>
              <button onClick={onClose} style={{ marginTop: '8px', padding: '10px 24px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit' }}>
                Browse Stores
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '12px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {/* Image or placeholder */}
                  <div style={{ width: '52px', height: '52px', borderRadius: '10px', backgroundColor: '#1c1c22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, overflow: 'hidden' }}>
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛍️'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ fontSize: '11px', color: '#52525b', margin: '0 0 8px' }}>{item.category}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#f97316' }}>₱{(item.price * item.quantity).toFixed(2)}</span>
                      {/* Qty controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => decrease(item.id)} style={{ width: '26px', height: '26px', borderRadius: '6px', backgroundColor: '#1c1c22', border: '1px solid #27272a', color: '#e4e4e7', cursor: 'pointer', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff', minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => increase(item.id)} style={{ width: '26px', height: '26px', borderRadius: '6px', backgroundColor: '#f97316', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button onClick={() => remove(item.id)} style={{ color: '#3f3f46', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', flexShrink: 0 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid #1f1f24' }}>
            {/* Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: '#71717a' }}>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
              <span style={{ fontSize: '13px', color: '#71717a' }}>Subtotal</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#f97316' }}>₱{totalPrice.toFixed(2)}</span>
              <span style={{ fontSize: '13px', color: '#52525b', alignSelf: 'flex-end' }}>+ delivery fee</span>
            </div>

            {/* View store button */}
            {storeId && (
              <button
                onClick={() => { onClose(); navigate(`/products/${storeId}`); }}
                style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#71717a', border: '1px solid #27272a', borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'inherit', marginBottom: '8px' }}
              >
                ← Continue Shopping
              </button>
            )}

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              style={{ width: '100%', padding: '13px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '9px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }}
            >
              Checkout → ₱{totalPrice.toFixed(2)}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

  const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stores');
  const [search, setSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [reordering, setReordering] = useState(null);
  const [reorderSuccess, setReorderSuccess] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites') || '[]'));
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const notifRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [unreadChats, setUnreadChats] = useState(0);
  const [unreadFromId, setUnreadFromId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [storeRatings, setStoreRatings] = useState({});

  // Refresh cart count whenever localStorage changes
  const refreshCartCount = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((s, i) => s + i.quantity, 0);
    setCartCount(total);
  }, []);

  useEffect(() => {
    refreshCartCount();
    const interval = setInterval(refreshCartCount, 2000);
    return () => clearInterval(interval);
  }, [refreshCartCount]);

  const checkUnreadMessages = useCallback(async () => {
    try {
      const storesRes = await getStores();
      let totalUnread = 0;
      let firstUnreadId = null;
      for (const store of storesRes.data) {
        const ownerId = store.ownerId;
        if (!ownerId) continue;
        const res = await getMessages(ownerId);
        const msgs = res.data || [];
        const lastSeenKey = `chat_seen_${user.id}_${ownerId}`;
        const lastSeen = localStorage.getItem(lastSeenKey);
        const unread = msgs.filter(m =>
          m.senderId !== user.id &&
          (!lastSeen || new Date(m.createdAt) > new Date(lastSeen))
        );
        if (unread.length > 0 && !firstUnreadId) firstUnreadId = ownerId;
        totalUnread += unread.length;
      }
      setUnreadChats(totalUnread);
      setUnreadFromId(firstUnreadId);
    } catch (err) {
      console.error('Failed to check unread messages', err);
    }
  }, [user.id]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchConversations = useCallback(async () => {
    try {
      const storesRes = await getStores();
      const convos = [];
      for (const store of storesRes.data) {
        const ownerId = store.ownerId;
        if (!ownerId) continue;
        const res = await getMessages(ownerId);
        const msgs = res.data || [];
        if (msgs.length === 0) continue;
        const lastMsg = msgs[msgs.length - 1];
        const lastSeenKey = `chat_seen_${user.id}_${ownerId}`;
        const lastSeen = localStorage.getItem(lastSeenKey);
        const unread = msgs.filter(m =>
          Number(m.senderId) !== Number(user.id) &&
          (!lastSeen || new Date(m.createdAt) > new Date(lastSeen))
        ).length;
        convos.push({ ownerId, storeName: store.name, lastMsg, unread });
      }
      setConversations(convos);
    } catch (err) { console.error('Failed to fetch conversations', err); }
  }, [user.id]);

  const STATUS_STEPS = [
    { key: 'PENDING',          label: 'Order Placed', emoji: '📋' },
    { key: 'CONFIRMED',        label: 'Confirmed',    emoji: '✅' },
    { key: 'PREPARING',        label: 'Preparing',    emoji: '👨‍🍳' },
    { key: 'OUT_FOR_DELIVERY', label: 'On the Way',   emoji: '🛵' },
    { key: 'DELIVERED',        label: 'Delivered',    emoji: '📦' },
  ];

  const fetchNotifications = useCallback(async () => {
    if (!user.id) return;
    try { const res = await getNotifications(user.id); setNotifications(res.data); }
    catch (err) { console.error('Failed to load notifications', err); }
  }, [user.id]);

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [displayName, setDisplayName] = useState(user.username);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await springApi.get('/users/profile');
        if (res.data.profilePhoto) setProfilePhoto(`http://localhost:8080${res.data.profilePhoto}`);
        if (res.data.displayName) setDisplayName(res.data.displayName);
      } catch (err) {}
    };
    fetchProfile();
  }, []);

  const fetchStoreRatings = useCallback(async (storeList) => {
    const results = {};
    await Promise.all(storeList.map(async (store) => {
      try {
        const { phpApi } = await import('../services/api');
        const res = await phpApi.get(`/ratings/store/${store.id}`);
        results[store.id] = { average: res.data.average_rating, total: res.data.total_ratings };
      } catch {}
    }));
    setStoreRatings(results);
  }, []);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [storesRes, ordersRes] = await Promise.all([getStores(), getOrders()]);
      setStores(storesRes.data);
      setOrders(ordersRes.data);
      setLastRefreshed(new Date());
      fetchStoreRatings(storesRes.data);
    } catch (err) { console.error('Failed to load data', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); fetchNotifications(); fetchConversations(); }, [fetchData, fetchNotifications, fetchConversations]);

  useEffect(() => {
    if (activeTab !== 'orders') return;
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [activeTab, fetchData]);

  useEffect(() => {
    const interval = setInterval(() => fetchNotifications(), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    checkUnreadMessages();
    const interval = setInterval(checkUnreadMessages, 15000);
    return () => clearInterval(interval);
  }, [checkUnreadMessages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) { console.error('Failed to mark notification read', err); }
  };

  const handleMarkAllRead = async () => {
    if (!user.id) return;
    try {
      await markAllNotificationsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) { console.error('Failed to mark all read', err); }
  };

  const getNotifIcon = (type) => ({ order_placed: '📋', order_confirmed: '✅', order_preparing: '👨‍🍳', order_out_for_delivery: '🛵', order_delivered: '📦', order_cancelled: '❌', general: '🔔' }[type] || '🔔');
  const getNotifColor = (type) => ({ order_placed: '#f59e0b', order_confirmed: '#3b82f6', order_preparing: '#8b5cf6', order_out_for_delivery: '#06b6d4', order_delivered: '#22c55e', order_cancelled: '#ef4444', general: '#f97316' }[type] || '#f97316');

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const toggleFavorite = (storeId, e) => {
    e.stopPropagation();
    const updated = favorites.includes(storeId) ? favorites.filter(id => id !== storeId) : [...favorites, storeId];
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFav = showFavoritesOnly ? favorites.includes(store.id) : true;
    return matchesSearch && matchesFav;
  });

  const getStatusColor = (status) => ({ PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PREPARING: '#8b5cf6', OUT_FOR_DELIVERY: '#06b6d4', DELIVERED: '#22c55e', CANCELLED: '#ef4444' }[status] || '#6b7280');
  const getStatusEmoji = (status) => ({ PENDING: '⏳', CONFIRMED: '✅', PREPARING: '👨‍🍳', OUT_FOR_DELIVERY: '🛵', DELIVERED: '📦', CANCELLED: '✕' }[status] || '•');
  const getStepIndex = (status) => STATUS_STEPS.findIndex(s => s.key === status);

  const handleReorder = async (order) => {
    setReordering(order.id);
    try {
      await placeOrder({ storeId: order.storeId, items: (order.items || []).map(item => ({ productId: item.productId, quantity: item.quantity })) });
      setReorderSuccess(order.id);
      setTimeout(() => setReorderSuccess(null), 3000);
      fetchData(true);
    } catch (err) { console.error('Reorder failed', err); }
    finally { setReordering(null); }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await cancelOrder(orderId);
      fetchData(true);
    } catch (err) {
      alert('Failed to cancel order.');
      console.error(err);
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const pastOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED');

  return (
    <div style={styles.root}>
      {/* Cart Drawer */}
      <CartDrawer open={showCart} onClose={() => { setShowCart(false); refreshCartCount(); }} />

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <span style={styles.navLogo}>◈</span>
          <span style={styles.navBrand}>NearBuy</span>
        </div>

        <div style={styles.navTabs}>
          <button style={{ ...styles.navTab, ...(activeTab === 'stores' ? styles.navTabActive : {}) }} onClick={() => setActiveTab('stores')}>
            ▦ Stores
          </button>
          <button style={{ ...styles.navTab, ...(activeTab === 'orders' ? styles.navTabActive : {}) }} onClick={() => setActiveTab('orders')}>
            ◫ My Orders
            {activeOrders.length > 0 && <span style={styles.badge}>{activeOrders.length}</span>}
          </button>
          <button style={{ ...styles.navTab, ...(activeTab === 'chats' ? styles.navTabActive : {}) }} onClick={() => { setActiveTab('chats'); setUnreadChats(0); setUnreadFromId(null); fetchConversations(); }}>
            💬 Chats
            {unreadChats > 0 && <span style={styles.badge}>{unreadChats > 9 ? '9+' : unreadChats}</span>}
          </button>
          <button style={{ ...styles.navTab, ...(activeTab === 'feedback' ? styles.navTabActive : {}) }} onClick={() => setActiveTab('feedback')}>
            📝 Feedback
          </button>
        </div>

        <div style={styles.navRight}>
          {/* Cart Button */}
          <button
            style={{ ...styles.iconBtn, ...(cartCount > 0 ? { borderColor: '#f97316', backgroundColor: '#1c1a16' } : {}) }}
            onClick={() => setShowCart(true)}
            title="Cart"
          >
            🛒
            {cartCount > 0 && (
              <span style={{ ...styles.iconBadge, backgroundColor: '#f97316' }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button style={{ ...styles.iconBtn, backgroundColor: showNotifications ? '#1f1f2e' : '#111114', borderColor: showNotifications ? '#f97316' : '#27272a' }}
              onClick={() => setShowNotifications(!showNotifications)} title="Notifications">
              🔔
              {unreadCount > 0 && <span style={styles.iconBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>

            {showNotifications && (
              <div style={styles.notifPanel}>
                <div style={styles.notifHeader}>
                  <span style={styles.notifHeaderTitle}>Notifications</span>
                  {unreadCount > 0 && <button style={styles.markAllBtn} onClick={handleMarkAllRead}>Mark all read</button>}
                </div>
                {notifications.length === 0 ? (
                  <div style={styles.notifEmpty}>
                    <span style={{ fontSize: '32px' }}>🔔</span>
                    <p style={{ color: '#52525b', fontSize: '13px', margin: '10px 0 0' }}>No notifications yet</p>
                  </div>
                ) : (
                  <div style={styles.notifList}>
                    {notifications.map(n => (
                      <div key={n.id}
                        style={{ ...styles.notifItem, backgroundColor: n.is_read ? 'transparent' : `${getNotifColor(n.type)}08`, borderLeft: `3px solid ${n.is_read ? 'transparent' : getNotifColor(n.type)}` }}
                        onClick={() => !n.is_read && handleMarkRead(n.id)}>
                        <div style={{ ...styles.notifIconWrap, backgroundColor: `${getNotifColor(n.type)}18` }}>
                          <span style={{ fontSize: '16px' }}>{getNotifIcon(n.type)}</span>
                        </div>
                        <div style={styles.notifContent}>
                          <p style={styles.notifTitle}>{n.title}</p>
                          <p style={styles.notifMsg}>{n.message}</p>
                          <p style={styles.notifTime}>{new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {!n.is_read && <div style={{ ...styles.notifDot, backgroundColor: getNotifColor(n.type) }} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Favorites Filter */}
          <button
            style={{ ...styles.iconBtn, backgroundColor: showFavoritesOnly ? '#2d1515' : '#111114', borderColor: showFavoritesOnly ? '#ef4444' : '#27272a' }}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            title={showFavoritesOnly ? 'Show all stores' : 'Show favorites'}
          >
            {showFavoritesOnly ? '❤️' : '🤍'}
            {favorites.length > 0 && !showFavoritesOnly && <span style={{ ...styles.iconBadge, backgroundColor: '#ef4444' }}>{favorites.length}</span>}
          </button>

          <button style={styles.iconBtn} onClick={() => navigate('/buyer/ratings')} title="Ratings">⭐</button>

          <div style={styles.navDivider} />

          <button style={styles.profileChip} onClick={() => navigate('/profile')} title="Edit Profile">
            {profilePhoto ? (
              <img src={profilePhoto} alt="profile" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={styles.profileAvatar}>{user.username?.[0]?.toUpperCase() || 'U'}</div>
            )}
            <span style={styles.profileName}>{displayName}</span>
          </button>

          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main style={styles.main}>

        {/* STORES TAB */}
        {activeTab === 'stores' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeader}>
              <div>
                <h1 style={styles.pageTitle}>
                  {showFavoritesOnly ? '❤️ Favorite Stores' : 'Discover Stores'}
                </h1>
                <p style={styles.pageSubtitle}>
                  {showFavoritesOnly
                    ? `${filteredStores.length} saved store${filteredStores.length !== 1 ? 's' : ''}`
                    : `${stores.length} stores near you`}
                </p>
              </div>
              <div style={styles.headerActions}>
                {showFavoritesOnly && (
                  <button style={styles.clearFavBtn} onClick={() => setShowFavoritesOnly(false)}>← Show All</button>
                )}
                <div style={styles.searchBar}>
                  <span style={styles.searchIcon}>⌕</span>
                  <input
                    style={styles.searchInput}
                    type="text"
                    placeholder="Search stores..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && <button style={styles.clearSearch} onClick={() => setSearch('')}>✕</button>}
                </div>
              </div>
            </div>

            {loading ? (
              <div style={styles.centerState}>
                <div style={styles.spinner} />
                <p style={styles.stateText}>Finding stores near you...</p>
              </div>
            ) : filteredStores.length === 0 ? (
              <div style={styles.centerState}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>{showFavoritesOnly ? '🤍' : '▦'}</div>
                <p style={styles.stateTitle}>{showFavoritesOnly ? 'No favorites yet' : 'No stores found'}</p>
                <p style={styles.stateText}>{showFavoritesOnly ? 'Tap 🤍 on a store card to save it here' : 'Try a different search'}</p>
              </div>
            ) : (
              <div style={styles.storeGrid}>
                {filteredStores.map((store, i) => (
                  <div key={store.id}
                    style={{ ...styles.storeCard, animationDelay: `${i * 40}ms`, borderColor: favorites.includes(store.id) ? '#ef444430' : '#1f1f24' }}
                    onClick={() => navigate(`/store/${store.id}`)}>
                    <div style={styles.storeCardTop}>
                      <div style={styles.storeAvatar}>
                        {store.imageUrl
                          ? <img src={store.imageUrl.startsWith('/api') ? `http://localhost:8080${store.imageUrl}` : store.imageUrl} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                          : '🏪'
                        }
                      </div>
                      <div style={styles.storeMetaRow}>
                        {store.estimatedDeliveryMinutes && (
                          <span style={styles.storeTag}>🕐 {store.estimatedDeliveryMinutes}min</span>
                        )}
                        {favorites.includes(store.id) && (
                          <span style={styles.favTag}>❤️ Saved</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <h3 style={{ ...styles.storeTitle, margin: 0 }}>{store.name}</h3>
                      <span style={{
                        fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
                        backgroundColor: store.status === 'ACTIVE' ? '#05966920' : '#ef444420',
                        color: store.status === 'ACTIVE' ? '#059669' : '#ef4444',
                      }}>
                        {store.status === 'ACTIVE' ? '🟢 Open' : '🔴 Closed'}
                      </span>
                    </div>
                    <p style={styles.storeAddress}>📍 {store.address}</p>
                    {storeRatings[store.id]?.total > 0 && (
                      <p style={{ fontSize: '11px', color: '#f59e0b', margin: '0 0 6px' }}>
                        ⭐ {storeRatings[store.id].average} · {storeRatings[store.id].total} review{storeRatings[store.id].total !== 1 ? 's' : ''}
                      </p>
                    )}
                    {store.description && <p style={styles.storeDesc}>{store.description}</p>}

                    <div style={styles.storeActions}>
                      <button style={styles.shopBtn} onClick={(e) => { e.stopPropagation(); navigate(`/store/${store.id}`); }}>
                        Shop Now →
                      </button>
                      <button style={styles.storeIconBtn} onClick={(e) => { e.stopPropagation(); navigate(`/chat/${store.ownerId}`); }} title="Chat">
                        💬
                      </button>
                      <button
                        style={{ ...styles.storeIconBtn, color: favorites.includes(store.id) ? '#ef4444' : '#52525b', borderColor: favorites.includes(store.id) ? '#ef444450' : '#27272a' }}
                        onClick={(e) => toggleFavorite(store.id, e)}
                        title={favorites.includes(store.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {favorites.includes(store.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === 'feedback' && (
          <div style={styles.tabContent}>
            <Feedback embedded={true} />
          </div>
        )}

        {/* CHATS TAB */}
        {activeTab === 'chats' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeader}>
              <div>
                <h1 style={styles.pageTitle}>💬 Messages</h1>
                <p style={styles.pageSubtitle}>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {conversations.length === 0 ? (
              <div style={styles.centerState}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                <p style={styles.stateTitle}>No conversations yet</p>
                <p style={styles.stateText}>Chat with a store from the Stores tab!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {conversations.map(convo => (
                  <div key={convo.ownerId}
                    onClick={() => navigate(`/chat/${convo.ownerId}`)}
                    style={{ backgroundColor: '#111114', border: `1px solid ${convo.unread > 0 ? '#3b82f640' : '#1f1f24'}`, borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1c1c22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🏪</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#e4e4e7', margin: 0 }}>{convo.storeName}</p>
                        <span style={{ fontSize: '11px', color: '#52525b' }}>{new Date(convo.lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#71717a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{convo.lastMsg.message}</p>
                    </div>
                    {convo.unread > 0 && (
                      <span style={{ backgroundColor: '#3b82f6', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '2px 7px', borderRadius: '999px', flexShrink: 0 }}>
                        {convo.unread > 9 ? '9+' : convo.unread}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div style={styles.tabContent}>
            <div style={styles.pageHeader}>
              <div>
                <h1 style={styles.pageTitle}>My Orders</h1>
                <p style={styles.pageSubtitle}>{orders.length} total orders</p>
              </div>
              <div style={styles.headerActions}>
                {lastRefreshed && <span style={styles.refreshTime}>Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                <button style={styles.refreshBtn} onClick={() => fetchData(true)}>🔄 Refresh</button>
              </div>
            </div>

            {loading ? (
              <div style={styles.centerState}>
                <div style={styles.spinner} />
                <p style={styles.stateText}>Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div style={styles.centerState}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>◫</div>
                <p style={styles.stateTitle}>No orders yet</p>
                <p style={styles.stateText}>Browse stores and place your first order!</p>
                <button style={styles.shopNowCta} onClick={() => setActiveTab('stores')}>Browse Stores →</button>
              </div>
            ) : (
              <>
                {activeOrders.length > 0 && (
                  <section style={styles.orderSection}>
                    <div style={styles.orderSectionHeader}>
                      <span style={styles.orderSectionDot} />
                      <span style={styles.orderSectionTitle}>Active Orders</span>
                      <span style={styles.orderSectionCount}>{activeOrders.length}</span>
                    </div>
                    <div style={styles.ordersList}>
                      {activeOrders.map(order => (
                        <OrderCard key={order.id} order={order}
                          expanded={expandedOrder === order.id}
                          onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          onReorder={handleReorder}
                          onCancel={handleCancel}
                          reordering={reordering === order.id}
                          reorderSuccess={reorderSuccess === order.id}
                          getStatusColor={getStatusColor} getStatusEmoji={getStatusEmoji}
                          getStepIndex={getStepIndex} STATUS_STEPS={STATUS_STEPS} navigate={navigate} onReceipt={setReceiptOrder} />
                      ))}
                    </div>
                  </section>
                )}
                {pastOrders.length > 0 && (
                  <section style={styles.orderSection}>
                    <div style={styles.orderSectionHeader}>
                      <span style={{ ...styles.orderSectionDot, backgroundColor: '#52525b' }} />
                      <span style={styles.orderSectionTitle}>Past Orders</span>
                      <span style={styles.orderSectionCount}>{pastOrders.length}</span>
                    </div>
                    <div style={styles.ordersList}>
                      {pastOrders.map(order => (
                        <OrderCard key={order.id} order={order}
                          expanded={expandedOrder === order.id}
                          onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          onReorder={handleReorder}
                          onCancel={handleCancel}
                          reordering={reordering === order.id}
                          reorderSuccess={reorderSuccess === order.id}
                          getStatusColor={getStatusColor} getStatusEmoji={getStatusEmoji}
                          getStepIndex={getStepIndex} STATUS_STEPS={STATUS_STEPS} navigate={navigate} onReceipt={setReceiptOrder} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {receiptOrder && <OrderReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes trackPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.35); } 50% { box-shadow: 0 0 0 6px rgba(249,115,22,0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .store-card-hover:hover { border-color: #f9731640 !important; transform: translateY(-2px); }
      `}</style>
    </div>
  );
};

// ── Order Card ────────────────────────────────────────────────────────────────
const OrderCard = ({ order, expanded, onToggle, onReorder, onCancel, reordering, reorderSuccess, getStatusColor, getStatusEmoji, getStepIndex, STATUS_STEPS, navigate, onReceipt }) => {
  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const currentStep = getStepIndex(order.status);

  return (
    <div style={{ ...card.wrap, borderColor: isCancelled ? '#ef444428' : expanded ? '#f9731628' : '#1f1f24' }}>
      <div style={card.header} onClick={onToggle}>
        <div style={card.headerLeft}>
          <div style={card.idRow}>
            <span style={card.id}>Order #{order.id}</span>
            <span style={card.date}>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <span style={card.store}>🏪 {order.storeName || `Store #${order.storeId}`}</span>
          <span style={card.amount}>₱{order.totalAmount}</span>
        </div>
        <div style={card.headerRight}>
          <span style={{ ...card.pill, backgroundColor: `${getStatusColor(order.status)}15`, color: getStatusColor(order.status), borderColor: `${getStatusColor(order.status)}35`, animation: !isCancelled && !isDelivered ? 'trackPulse 2s ease infinite' : 'none' }}>
            {getStatusEmoji(order.status)} {order.status?.replace(/_/g, ' ')}
          </span>
          <span style={card.hint}>{expanded ? '▲ Hide' : '▼ Track'}</span>
        </div>
      </div>

      {expanded && (
        <div style={card.body}>
          {isCancelled ? (
            <div style={card.cancelled}>❌ This order was cancelled.</div>
          ) : (
            <>
              <div style={card.timeline}>
                {STATUS_STEPS.map((step, idx) => {
                  const done = currentStep >= idx;
                  const active = currentStep === idx;
                  return (
                    <div key={step.key} style={card.step}>
                      {idx > 0 && <div style={{ ...card.connector, backgroundColor: done ? '#f97316' : '#27272a' }} />}
                      <div style={{ ...card.circle, backgroundColor: done ? '#f97316' : '#1a1a1f', border: `2px solid ${done ? '#f97316' : '#27272a'}`, boxShadow: active ? '0 0 0 4px rgba(249,115,22,0.2)' : 'none' }}>
                        {done ? step.emoji : <span style={{ color: '#3f3f46', fontSize: '12px' }}>○</span>}
                      </div>
                      <div style={card.stepLabel}>
                        <span style={{ fontSize: '13px', color: done ? '#e4e4e7' : '#52525b', fontWeight: active ? '600' : '400' }}>{step.label}</span>
                        {active && <span style={{ fontSize: '11px', color: '#f97316', fontWeight: '600', marginLeft: '6px' }}>← Now</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {!isDelivered && (
                <div style={card.eta}>
                  <span style={{ fontSize: '15px' }}>🕐</span>
                  <span style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5' }}>
                    {order.status === 'PENDING' && 'Waiting for store to confirm your order...'}
                    {order.status === 'CONFIRMED' && 'Your order has been confirmed and will be prepared soon.'}
                    {order.status === 'PREPARING' && 'The store is preparing your order right now.'}
                    {order.status === 'OUT_FOR_DELIVERY' && "Your order is on the way — shouldn't be long!"}
                  </span>
                </div>
              )}
            </>
          )}
          <div style={card.actions}>
            <button style={card.chatBtn} onClick={() => navigate(`/chat/${order.storeOwnerId || order.storeId}`)}>💬 Chat with Store</button>
            <button style={card.chatBtn} onClick={() => onReceipt(order)}>🧾 Receipt</button>
            {order.status === 'PENDING' && (
              <button style={card.cancelBtn} onClick={() => onCancel(order.id)}>❌ Cancel Order</button>
            )}
            {isDelivered && (
              <>
                <button style={card.rateBtn} onClick={() => navigate('/buyer/ratings')}>⭐ Rate</button>
                <button style={card.feedbackBtn} onClick={() => navigate('/buyer/feedback')}>📝 Feedback</button>
                <button
                  style={{ ...card.reorderBtn, opacity: reordering ? 0.6 : 1, backgroundColor: reorderSuccess ? '#14291a' : '#1c2a1c', borderColor: reorderSuccess ? '#22c55e' : '#1a3a1a', color: reorderSuccess ? '#22c55e' : '#22c55e' }}
                  onClick={() => !reordering && onReorder(order)} disabled={reordering}>
                  {reordering ? '⏳ Placing...' : reorderSuccess ? '✅ Reordered!' : '🔁 Reorder'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const card = {
  wrap: { backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s', animation: 'fadeUp 0.4s ease both' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', cursor: 'pointer', flexWrap: 'wrap', gap: '12px' },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
  idRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  id: { fontSize: '14px', fontWeight: '600', color: '#e4e4e7', fontFamily: "'DM Mono', monospace" },
  date: { fontSize: '11px', color: '#52525b' },
  store: { fontSize: '12px', color: '#71717a' },
  amount: { fontSize: '17px', fontWeight: '700', color: '#f97316' },
  headerRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  pill: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', border: '1px solid', fontSize: '11px', fontWeight: '600', letterSpacing: '0.3px' },
  hint: { fontSize: '11px', color: '#3f3f46' },
  body: { borderTop: '1px solid #1f1f24', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  cancelled: { backgroundColor: '#ef444412', border: '1px solid #ef444428', borderRadius: '10px', padding: '12px 16px', color: '#ef4444', fontSize: '13px', textAlign: 'center' },
  timeline: { display: 'flex', flexDirection: 'column', paddingLeft: '8px' },
  step: { display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' },
  connector: { position: 'absolute', left: '17px', top: '-16px', width: '2px', height: '16px' },
  circle: { width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px', transition: 'all 0.3s', marginBottom: '12px' },
  stepLabel: { display: 'flex', alignItems: 'center', paddingTop: '7px' },
  eta: { backgroundColor: '#1a1a1f', border: '1px solid #27272a', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  chatBtn: { padding: '8px 14px', backgroundColor: '#131b2e', color: '#60a5fa', border: '1px solid #1e3056', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', fontFamily: "'DM Sans', sans-serif" },
  rateBtn: { padding: '8px 14px', backgroundColor: '#1c1a10', color: '#f59e0b', border: '1px solid #2d2a18', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', fontFamily: "'DM Sans', sans-serif" },
  feedbackBtn: { padding: '8px 14px', backgroundColor: '#1a1422', color: '#a78bfa', border: '1px solid #2a1e40', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', fontFamily: "'DM Sans', sans-serif" },
  reorderBtn: { padding: '8px 14px', border: '1px solid', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.25s' },
  cancelBtn: { padding: '8px 14px', backgroundColor: '#2a1010', color: '#ef4444', border: '1px solid #ef444440', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', fontFamily: "'DM Sans', sans-serif" },
};

const styles = {
  root: { minHeight: '100vh', backgroundColor: '#090909', fontFamily: "'DM Sans', sans-serif", color: '#e4e4e7' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: '58px', backgroundColor: '#0e0e11', borderBottom: '1px solid #1a1a1f', position: 'sticky', top: 0, zIndex: 200, backdropFilter: 'blur(12px)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  navLogo: { fontSize: '18px', color: '#f97316' },
  navBrand: { fontSize: '16px', fontWeight: '700', color: '#fff', letterSpacing: '-0.4px' },
  navTabs: { display: 'flex', gap: '2px', backgroundColor: '#111114', borderRadius: '10px', padding: '3px' },
  navTab: { padding: '6px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#71717a', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' },
  navTabActive: { backgroundColor: '#1c1c22', color: '#f97316' },
  badge: { backgroundColor: '#f97316', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '999px', minWidth: '16px', textAlign: 'center' },
  navRight: { display: 'flex', alignItems: 'center', gap: '6px' },
  iconBtn: { width: '34px', height: '34px', borderRadius: '9px', backgroundColor: '#111114', border: '1px solid #27272a', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'all 0.15s' },
  iconBadge: { position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: '700', padding: '1px 4px', borderRadius: '999px', minWidth: '14px', textAlign: 'center', lineHeight: '14px' },
  navDivider: { width: '1px', height: '20px', backgroundColor: '#27272a', margin: '0 2px' },
  profileChip: { display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px 4px 4px', backgroundColor: '#111114', border: '1px solid #27272a', borderRadius: '30px', cursor: 'pointer', transition: 'border-color 0.15s' },
  profileAvatar: { width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff' },
  profileName: { fontSize: '12px', color: '#a1a1aa', fontWeight: '500' },
  logoutBtn: { padding: '6px 13px', backgroundColor: 'transparent', color: '#71717a', border: '1px solid #27272a', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' },
  notifPanel: { position: 'absolute', top: '44px', right: 0, width: '348px', backgroundColor: '#0e0e11', border: '1px solid #1f1f24', borderRadius: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.7)', zIndex: 300, overflow: 'hidden', animation: 'slideDown 0.18s ease' },
  notifHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 12px', borderBottom: '1px solid #1a1a1f' },
  notifHeaderTitle: { fontSize: '13px', fontWeight: '600', color: '#e4e4e7' },
  markAllBtn: { fontSize: '11px', color: '#f97316', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' },
  notifEmpty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 16px' },
  notifList: { maxHeight: '380px', overflowY: 'auto' },
  notifItem: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid #1a1a1f', transition: 'background 0.12s' },
  notifIconWrap: { flexShrink: 0, width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1, minWidth: 0 },
  notifTitle: { fontSize: '12px', fontWeight: '600', color: '#e4e4e7', margin: '0 0 2px' },
  notifMsg: { fontSize: '11px', color: '#71717a', margin: '0 0 4px', lineHeight: '1.4' },
  notifTime: { fontSize: '10px', color: '#3f3f46', margin: 0 },
  notifDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, marginTop: '4px' },
  main: { maxWidth: '1260px', margin: '0 auto', padding: '0 28px 60px' },
  tabContent: { paddingTop: '32px' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' },
  pageTitle: { fontSize: '22px', fontWeight: '700', color: '#fff', margin: '0 0 4px', letterSpacing: '-0.4px' },
  pageSubtitle: { fontSize: '13px', color: '#52525b', margin: 0 },
  headerActions: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  clearFavBtn: { padding: '7px 14px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef444440', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" },
  searchBar: { display: 'flex', alignItems: 'center', backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '10px', padding: '0 12px', gap: '8px', minWidth: '240px' },
  searchIcon: { fontSize: '16px', color: '#3f3f46' },
  searchInput: { backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#e4e4e7', fontSize: '13px', padding: '9px 0', fontFamily: "'DM Sans', sans-serif", flex: 1 },
  clearSearch: { background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', fontSize: '13px', padding: 0 },
  refreshTime: { fontSize: '11px', color: '#3f3f46' },
  refreshBtn: { padding: '7px 14px', backgroundColor: '#111114', color: '#a1a1aa', border: '1px solid #1f1f24', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" },
  storeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(272px, 1fr))', gap: '18px' },
  storeCard: { backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s', animation: 'fadeUp 0.4s ease both' },
  storeCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
  storeAvatar: { width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#1c1c22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' },
  storeMetaRow: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  storeTag: { fontSize: '11px', color: '#52525b', backgroundColor: '#1a1a1f', padding: '3px 8px', borderRadius: '6px' },
  favTag: { fontSize: '10px', color: '#ef4444', backgroundColor: '#ef444412', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' },
  storeTitle: { fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 5px', letterSpacing: '-0.2px' },
  storeAddress: { fontSize: '12px', color: '#71717a', margin: '0 0 6px' },
  storeDesc: { fontSize: '12px', color: '#3f3f46', margin: '0 0 16px', lineHeight: '1.5' },
  storeActions: { display: 'flex', gap: '8px' },
  shopBtn: { flex: 1, padding: '9px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif" },
  storeIconBtn: { width: '36px', height: '36px', backgroundColor: '#1c1c22', border: '1px solid #27272a', borderRadius: '9px', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' },
  orderSection: { marginBottom: '28px' },
  orderSectionHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' },
  orderSectionDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 2s infinite', display: 'inline-block' },
  orderSectionTitle: { fontSize: '14px', fontWeight: '600', color: '#a1a1aa' },
  orderSectionCount: { backgroundColor: '#1f1f24', color: '#52525b', fontSize: '11px', padding: '2px 8px', borderRadius: '20px' },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  centerState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', textAlign: 'center' },
  spinner: { width: '28px', height: '28px', border: '2px solid #1f1f24', borderTop: '2px solid #f97316', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' },
  stateTitle: { fontSize: '15px', fontWeight: '600', color: '#52525b', margin: '0 0 6px' },
  stateText: { fontSize: '13px', color: '#3f3f46', margin: '0 0 20px' },
  shopNowCta: { padding: '10px 24px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '9px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif" },
};

export default BuyerDashboard;