import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStores, getOrders } from '../services/api';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stores');
  const [search, setSearch] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [storesRes, ordersRes] = await Promise.all([
        getStores(),
        getOrders(),
      ]);
      setStores(storesRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredStores = stores.filter(store =>
    store.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      CONFIRMED: '#3b82f6',
      PREPARING: '#8b5cf6',
      OUT_FOR_DELIVERY: '#06b6d4',
      DELIVERED: '#10b981',
      CANCELLED: '#ef4444',
    };
    return colors[status] || '#888';
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>🛒 NearBuy</h1>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Hi, {user.username}! 👋</span>
          <button style={styles.navBtn} onClick={() => navigate('/buyer/ratings')}>⭐ Ratings</button>
          <button style={styles.navBtn} onClick={() => navigate('/buyer/feedback')}>💬 Feedback</button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'stores' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('stores')}
        >
          🏪 Browse Stores
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'orders' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('orders')}
        >
          📦 My Orders
        </button>
      </div>

      <div style={styles.main}>
        {/* Stores Tab */}
        {activeTab === 'stores' && (
          <>
            <div style={styles.searchBar}>
              <input
                style={styles.searchInput}
                type="text"
                placeholder="🔍 Search stores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading && <div style={styles.loading}>Loading stores...</div>}

            {!loading && filteredStores.length === 0 && (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>🏪</div>
                <p style={styles.emptyText}>No stores found.</p>
              </div>
            )}

            <div style={styles.grid}>
              {filteredStores.map((store) => (
                <div
                  key={store.id}
                  style={styles.card}
                  onClick={() => navigate(`/products/${store.id}`)}
                >
                  <div style={styles.cardIcon}>🏪</div>
                  <h3 style={styles.cardTitle}>{store.name}</h3>
                  <p style={styles.cardSub}>📍 {store.address}</p>
                  <p style={styles.cardDesc}>{store.description}</p>
                  <button style={styles.viewBtn}>View Products →</button>
                  <button
                    style={styles.chatBtn}
                    onClick={(e) => { e.stopPropagation(); navigate(`/chat/${store.ownerId}`); }}
                  >
                    💬 Chat with Store
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            <h2 style={styles.sectionTitle}>My Orders</h2>
            {loading && <div style={styles.loading}>Loading orders...</div>}

            {!loading && orders.length === 0 && (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>📦</div>
                <p style={styles.emptyText}>No orders yet.</p>
                <button style={styles.viewBtn} onClick={() => setActiveTab('stores')}>
                  Browse Stores
                </button>
              </div>
            )}

            <div style={styles.ordersList}>
              {orders.map((order) => (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <span style={styles.orderId}>Order #{order.id}</span>
                    <span style={{
                      ...styles.orderStatus,
                      backgroundColor: getStatusColor(order.status)
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <p style={styles.orderStore}>🏪 {order.storeName}</p>
                  <p style={styles.orderTotal}>💰 ₱{order.totalAmount}</p>
                  <p style={styles.orderDate}>
                    📅 {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  {order.status === 'DELIVERED' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        style={styles.ratingBtn}
                        onClick={() => navigate('/buyer/ratings')}
                      >
                        ⭐ Rate Store
                      </button>
                      <button
                        style={styles.feedbackBtn}
                        onClick={() => navigate('/buyer/feedback')}
                      >
                        💬 Leave Feedback
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0f0f0f', color: '#fff' },
  navbar: {
    backgroundColor: '#1a1a1a', padding: '16px 32px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
  },
  logo: { fontSize: '24px', color: '#4CAF50', margin: 0 },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: '#aaa', fontSize: '14px' },
  navBtn: {
    backgroundColor: '#252525', color: '#fff', border: '1px solid #333',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  },
  logoutBtn: {
    backgroundColor: '#ff4444', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  },
  tabs: {
    display: 'flex', backgroundColor: '#1a1a1a',
    padding: '0 32px', borderBottom: '1px solid #333',
  },
  tab: {
    backgroundColor: 'transparent', color: '#888', border: 'none',
    padding: '16px 24px', cursor: 'pointer', fontSize: '14px',
    borderBottom: '2px solid transparent',
  },
  tabActive: { color: '#4CAF50', borderBottom: '2px solid #4CAF50' },
  main: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  searchBar: { marginBottom: '24px' },
  searchInput: {
    width: '100%', padding: '12px 16px', borderRadius: '8px',
    border: '1px solid #333', backgroundColor: '#1a1a1a',
    color: '#fff', fontSize: '14px', boxSizing: 'border-box',
  },
  loading: { textAlign: 'center', color: '#888', padding: '40px' },
  empty: { textAlign: 'center', padding: '60px' },
  emptyIcon: { fontSize: '64px' },
  emptyText: { color: '#888', fontSize: '18px', marginTop: '16px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#1a1a1a', borderRadius: '16px',
    padding: '24px', cursor: 'pointer', border: '1px solid #333',
  },
  cardIcon: { fontSize: '48px', marginBottom: '12px' },
  cardTitle: { fontSize: '20px', color: '#fff', marginBottom: '8px' },
  cardSub: { color: '#888', fontSize: '14px', marginBottom: '8px' },
  cardDesc: { color: '#aaa', fontSize: '13px', marginBottom: '16px' },
  viewBtn: {
    backgroundColor: '#4CAF50', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', width: '100%',
  },
  chatBtn: {
    backgroundColor: '#3b82f6', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', width: '100%', marginTop: '8px',
  },
  sectionTitle: { fontSize: '24px', marginBottom: '24px' },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  orderCard: {
    backgroundColor: '#1a1a1a', borderRadius: '12px',
    padding: '20px', border: '1px solid #333',
  },
  orderHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px',
  },
  orderId: { fontWeight: 'bold', fontSize: '16px' },
  orderStatus: {
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: 'bold', color: '#fff',
  },
  orderStore: { color: '#aaa', fontSize: '14px', marginBottom: '4px' },
  orderTotal: { color: '#4CAF50', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' },
  orderDate: { color: '#888', fontSize: '13px' },
  ratingBtn: {
    flex: 1, backgroundColor: '#f59e0b', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
  },
  feedbackBtn: {
    flex: 1, backgroundColor: '#3b82f6', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
  },
};

export default BuyerDashboard;