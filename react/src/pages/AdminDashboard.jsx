import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { djangoApi, springApi } from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [usersRes, storesRes] = await Promise.all([
        djangoApi.get('/users/all/'),
        springApi.get('/stores'),
      ]);
      setUsers(usersRes.data);
      setStores(storesRes.data);
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

  const getRoleColor = (role) => {
    const colors = {
      admin: '#ef4444',
      store_owner: '#f59e0b',
      buyer: '#3b82f6',
    };
    return colors[role] || '#888';
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      CONFIRMED: '#3b82f6',
      PREPARING: '#8b5cf6',
      OUT_FOR_DELIVERY: '#06b6d4',
      DELIVERED: '#10b981',
      CANCELLED: '#ef4444',
      ACTIVE: '#10b981',
      INACTIVE: '#888',
    };
    return colors[status] || '#888';
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>🛒 NearBuy Admin</h1>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Hi, {user.username}! 🔑</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{users.length}</span>
          <span style={styles.statLabel}>Total Users</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{stores.length}</span>
          <span style={styles.statLabel}>Total Stores</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>
            {users.filter(u => u.role === 'buyer').length}
          </span>
          <span style={styles.statLabel}>Buyers</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>
            {users.filter(u => u.role === 'store_owner').length}
          </span>
          <span style={styles.statLabel}>Store Owners</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'users' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'stores' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('stores')}
        >
          🏪 Stores
        </button>
      </div>

      <div style={styles.main}>
        {loading && <div style={styles.loading}>Loading...</div>}

        {/* Users Tab */}
        {activeTab === 'users' && !loading && (
          <>
            <h2 style={styles.sectionTitle}>All Users ({users.length})</h2>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span style={styles.tableCol}>ID</span>
                <span style={styles.tableCol}>Username</span>
                <span style={styles.tableCol}>Email</span>
                <span style={styles.tableCol}>Role</span>
                <span style={styles.tableCol}>Contact</span>
                <span style={styles.tableCol}>Actions</span>
              </div>
              {users.map(u => (
                <div key={u.id} style={styles.tableRow}>
                  <span style={styles.tableCol}>#{u.id}</span>
                  <span style={styles.tableCol}>{u.username}</span>
                  <span style={styles.tableCol}>{u.email}</span>
                  <span style={styles.tableCol}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: getRoleColor(u.role)
                    }}>
                      {u.role}
                    </span>
                  </span>
                  <span style={styles.tableCol}>{u.contact || '—'}</span>
                  <span style={styles.tableCol}>
                    <button
                      style={styles.chatBtnSmall}
                      onClick={() => navigate(`/chat/${u.id}`)}
                    >
                      💬
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Stores Tab */}
        {activeTab === 'stores' && !loading && (
          <>
            <h2 style={styles.sectionTitle}>All Stores ({stores.length})</h2>
            <div style={styles.grid}>
              {stores.map(store => (
                <div key={store.id} style={styles.storeCard}>
                  <div style={styles.storeCardHeader}>
                    <h3 style={styles.storeName}>{store.name}</h3>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: getStatusColor(store.status)
                    }}>
                      {store.status}
                    </span>
                  </div>
                  <p style={styles.storeInfo}>📍 {store.address}</p>
                  <p style={styles.storeInfo}>👤 Owner ID: {store.ownerId}</p>
                  <p style={styles.storeInfo}>🕐 Est. delivery: {store.estimatedDeliveryMinutes} mins</p>
                  <p style={styles.storeDesc}>{store.description}</p>
                  <button
                    style={styles.viewBtn}
                    onClick={() => navigate(`/products/${store.id}`)}
                  >
                    View Products →
                  </button>
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
  logo: { fontSize: '24px', color: '#ef4444', margin: 0 },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: '#aaa', fontSize: '14px' },
  logoutBtn: {
    backgroundColor: '#ff4444', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  },
  statsBar: {
    display: 'flex', gap: '16px', padding: '16px 32px',
    backgroundColor: '#111', borderBottom: '1px solid #333',
  },
  statCard: {
    backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '16px 24px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    border: '1px solid #333', flex: 1,
  },
  statNumber: { fontSize: '28px', fontWeight: 'bold', color: '#4CAF50' },
  statLabel: { fontSize: '12px', color: '#888' },
  tabs: {
    display: 'flex', backgroundColor: '#1a1a1a',
    padding: '0 32px', borderBottom: '1px solid #333',
  },
  tab: {
    backgroundColor: 'transparent', color: '#888', border: 'none',
    padding: '16px 24px', cursor: 'pointer', fontSize: '14px',
    borderBottom: '2px solid transparent',
  },
  tabActive: { color: '#ef4444', borderBottom: '2px solid #ef4444' },
  main: { padding: '32px', maxWidth: '1400px', margin: '0 auto' },
  loading: { textAlign: 'center', color: '#888', padding: '40px' },
  sectionTitle: { fontSize: '24px', marginBottom: '24px' },
  table: { display: 'flex', flexDirection: 'column', gap: '8px' },
  tableHeader: {
    display: 'grid', gridTemplateColumns: '60px 1fr 1fr 120px 120px 80px',
    padding: '12px 16px', backgroundColor: '#252525', borderRadius: '8px',
    fontSize: '12px', color: '#888', fontWeight: 'bold',
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '60px 1fr 1fr 120px 120px 80px',
    padding: '12px 16px', backgroundColor: '#1a1a1a', borderRadius: '8px',
    border: '1px solid #333', alignItems: 'center',
  },
  tableCol: { fontSize: '14px', color: '#fff' },
  badge: {
    padding: '4px 10px', borderRadius: '20px',
    fontSize: '11px', fontWeight: 'bold', color: '#fff',
    display: 'inline-block',
  },
  chatBtnSmall: {
    backgroundColor: '#3b82f6', color: '#fff', border: 'none',
    padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
  storeCard: {
    backgroundColor: '#1a1a1a', borderRadius: '16px',
    padding: '24px', border: '1px solid #333',
  },
  storeCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  storeName: { fontSize: '18px', color: '#fff', margin: 0 },
  storeInfo: { color: '#888', fontSize: '13px', marginBottom: '4px' },
  storeDesc: { color: '#aaa', fontSize: '13px', marginBottom: '16px' },
  viewBtn: {
    backgroundColor: '#4CAF50', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', width: '100%',
  },
};

export default AdminDashboard;