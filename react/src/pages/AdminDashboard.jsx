import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { springApi } from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stores');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [toast, setToast] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const storesRes = await springApi.get('/stores/all');
      setStores(storesRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleStatus = async (store) => {
    const newStatus = store.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setTogglingId(store.id);
    try {
      await springApi.patch(`/stores/${store.id}/status`, { status: newStatus });
      setStores(prev =>
        prev.map(s => s.id === store.id ? { ...s, status: newStatus } : s)
      );
      showToast(
        `"${store.name}" has been ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}.`,
        newStatus === 'ACTIVE' ? 'success' : 'warning'
      );
    } catch (err) {
      console.error('Failed to update store status', err);
      showToast('Failed to update store status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: '#22c55e',
      INACTIVE: '#ef4444',
      PENDING: '#f59e0b',
    };
    return colors[status] || '#6b7280';
  };

  const activeStores = stores.filter(s => s.status === 'ACTIVE').length;
  const inactiveStores = stores.filter(s => s.status === 'INACTIVE').length;

  return (
    <div style={styles.root}>
      {/* Toast */}
      {toast && (
        <div style={{
          ...styles.toast,
          backgroundColor: toast.type === 'success' ? '#16a34a' : toast.type === 'warning' ? '#d97706' : '#dc2626',
        }}>
          {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'} {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>NearBuy</span>
        </div>

        <div style={styles.sidebarSection}>
          <span style={styles.sidebarSectionLabel}>OVERVIEW</span>
          <button
            style={{ ...styles.sidebarBtn, ...(activeTab === 'stores' ? styles.sidebarBtnActive : {}) }}
            onClick={() => setActiveTab('stores')}
          >
            <span style={styles.sidebarBtnIcon}>▦</span>
            Stores
          </button>
        </div>

        <div style={styles.sidebarBottom}>
          <div style={styles.adminProfile}>
            <div style={styles.adminAvatar}>
              {user.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <div style={styles.adminName}>{user.username}</div>
              <div style={styles.adminRole}>Administrator</div>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            ⎋ Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Top bar */}
        <header style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>Store Management</h1>
            <p style={styles.pageSubtitle}>Monitor and manage all registered stores</p>
          </div>
          <div style={styles.topbarRight}>
            <button style={styles.refreshBtn} onClick={fetchAll}>↻ Refresh</button>
            <div style={styles.liveIndicator}>
              <span style={styles.liveDot}></span>
              Live
            </div>
          </div>
        </header>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statTop}>
              <span style={styles.statLabel}>Total Stores</span>
              <span style={{ ...styles.statIcon, color: '#6366f1' }}>▦</span>
            </div>
            <div style={styles.statValue}>{stores.length}</div>
            <div style={styles.statBar}>
              <div style={{ ...styles.statBarFill, width: '100%', backgroundColor: '#6366f1' }}></div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statTop}>
              <span style={styles.statLabel}>Active Stores</span>
              <span style={{ ...styles.statIcon, color: '#22c55e' }}>◉</span>
            </div>
            <div style={styles.statValue}>{activeStores}</div>
            <div style={styles.statBar}>
              <div style={{
                ...styles.statBarFill,
                width: stores.length ? `${(activeStores / stores.length) * 100}%` : '0%',
                backgroundColor: '#22c55e'
              }}></div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statTop}>
              <span style={styles.statLabel}>Inactive Stores</span>
              <span style={{ ...styles.statIcon, color: '#ef4444' }}>◎</span>
            </div>
            <div style={styles.statValue}>{inactiveStores}</div>
            <div style={styles.statBar}>
              <div style={{
                ...styles.statBarFill,
                width: stores.length ? `${(inactiveStores / stores.length) * 100}%` : '0%',
                backgroundColor: '#ef4444'
              }}></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={styles.contentArea}>
          {loading ? (
            <div style={styles.loadingState}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Fetching stores...</p>
            </div>
          ) : stores.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>▦</div>
              <p style={styles.emptyText}>No stores registered yet.</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Store</th>
                    <th style={styles.th}>Address</th>
                    <th style={styles.th}>Owner ID</th>
                    <th style={styles.th}>Delivery</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store, i) => (
                    <tr
                      key={store.id}
                      style={{
                        ...styles.tr,
                        animationDelay: `${i * 40}ms`,
                        opacity: store.status === 'INACTIVE' ? 0.6 : 1,
                      }}
                    >
                      <td style={styles.td}>
                        <div style={styles.storeName}>{store.name}</div>
                        <div style={styles.storeDesc}>{store.description}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.tdMuted}>📍 {store.address}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.ownerBadge}>#{store.ownerId}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.tdMuted}>{store.estimatedDeliveryMinutes} min</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: `${getStatusColor(store.status)}18`,
                          color: getStatusColor(store.status),
                          borderColor: `${getStatusColor(store.status)}40`,
                        }}>
                          <span style={{ ...styles.statusDot, backgroundColor: getStatusColor(store.status) }}></span>
                          {store.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            style={styles.actionBtn}
                            onClick={() => navigate(`/products/${store.id}`)}
                          >
                            View →
                          </button>
                          <button
                            style={{
                              ...styles.toggleBtn,
                              ...(store.status === 'ACTIVE' ? styles.deactivateBtn : styles.activateBtn),
                              opacity: togglingId === store.id ? 0.6 : 1,
                              cursor: togglingId === store.id ? 'not-allowed' : 'pointer',
                            }}
                            onClick={() => handleToggleStatus(store)}
                            disabled={togglingId === store.id}
                          >
                            {togglingId === store.id
                              ? '...'
                              : store.status === 'ACTIVE'
                                ? 'Deactivate'
                                : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0c0c0e',
    fontFamily: "'DM Sans', sans-serif",
    color: '#e4e4e7',
  },

  // Toast
  toast: {
    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
    padding: '12px 20px', borderRadius: '10px', color: '#fff',
    fontSize: '14px', fontWeight: '500', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    animation: 'toastIn 0.3s ease',
  },

  // Sidebar
  sidebar: {
    width: '220px',
    minWidth: '220px',
    backgroundColor: '#111114',
    borderRight: '1px solid #1f1f24',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 20px 28px',
    borderBottom: '1px solid #1f1f24',
    marginBottom: '20px',
  },
  logoIcon: { fontSize: '22px', color: '#6366f1' },
  logoText: { fontSize: '18px', fontWeight: '600', color: '#fff', letterSpacing: '-0.3px' },
  sidebarSection: { padding: '0 12px', marginBottom: '8px' },
  sidebarSectionLabel: {
    fontSize: '10px', fontWeight: '600', color: '#52525b',
    letterSpacing: '1.2px', padding: '0 8px', display: 'block', marginBottom: '6px',
  },
  sidebarBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 12px', borderRadius: '8px', border: 'none',
    backgroundColor: 'transparent', color: '#71717a',
    fontSize: '14px', cursor: 'pointer', textAlign: 'left',
    fontFamily: "'DM Sans', sans-serif", fontWeight: '500',
  },
  sidebarBtnActive: {
    backgroundColor: '#1e1e2e', color: '#818cf8',
  },
  sidebarBtnIcon: { fontSize: '15px' },
  sidebarBottom: {
    marginTop: 'auto', padding: '20px 16px 0', borderTop: '1px solid #1f1f24',
    paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
  },
  adminProfile: {
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  adminAvatar: {
    width: '34px', height: '34px', borderRadius: '8px',
    backgroundColor: '#6366f1', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff',
    flexShrink: 0,
  },
  adminName: { fontSize: '13px', fontWeight: '600', color: '#d4d4d8' },
  adminRole: { fontSize: '11px', color: '#52525b' },
  logoutBtn: {
    width: '100%', padding: '8px', backgroundColor: '#1a1a1f',
    color: '#71717a', border: '1px solid #27272a', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
  },

  // Main
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  topbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '32px 36px 20px', borderBottom: '1px solid #1f1f24',
  },
  pageTitle: { fontSize: '22px', fontWeight: '600', color: '#fff', margin: '0 0 4px', letterSpacing: '-0.3px' },
  pageSubtitle: { fontSize: '13px', color: '#52525b', margin: 0 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  refreshBtn: {
    padding: '6px 14px', backgroundColor: 'transparent',
    color: '#71717a', border: '1px solid #27272a', borderRadius: '6px',
    cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Sans', sans-serif",
  },
  liveIndicator: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '12px', color: '#22c55e', fontWeight: '500',
  },
  liveDot: {
    width: '7px', height: '7px', borderRadius: '50%',
    backgroundColor: '#22c55e', animation: 'pulse 2s infinite',
    display: 'inline-block',
  },

  // Stats
  statsRow: {
    display: 'flex', gap: '16px', padding: '24px 36px',
  },
  statCard: {
    flex: 1, backgroundColor: '#111114', border: '1px solid #1f1f24',
    borderRadius: '12px', padding: '20px',
    animation: 'fadeSlideIn 0.4s ease both',
  },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  statLabel: { fontSize: '12px', color: '#52525b', fontWeight: '500', letterSpacing: '0.3px' },
  statIcon: { fontSize: '16px' },
  statValue: { fontSize: '32px', fontWeight: '600', color: '#fff', letterSpacing: '-1px', marginBottom: '12px' },
  statBar: { height: '3px', backgroundColor: '#1f1f24', borderRadius: '999px', overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: '999px', transition: 'width 0.6s ease' },

  // Table
  contentArea: { flex: 1, padding: '0 36px 36px' },
  tableWrapper: {
    backgroundColor: '#111114', border: '1px solid #1f1f24',
    borderRadius: '12px', overflow: 'hidden',
    animation: 'fadeSlideIn 0.5s ease both',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '13px 16px', textAlign: 'left',
    fontSize: '11px', fontWeight: '600', color: '#52525b',
    letterSpacing: '0.8px', textTransform: 'uppercase',
    borderBottom: '1px solid #1f1f24', backgroundColor: '#0e0e12',
    fontFamily: "'DM Mono', monospace",
  },
  tr: {
    borderBottom: '1px solid #1a1a1f',
    animation: 'fadeSlideIn 0.4s ease both',
    transition: 'background 0.15s, opacity 0.3s',
  },
  td: { padding: '14px 16px', verticalAlign: 'middle' },
  storeName: { fontSize: '14px', fontWeight: '500', color: '#e4e4e7', marginBottom: '2px' },
  storeDesc: { fontSize: '12px', color: '#52525b' },
  tdMuted: { fontSize: '13px', color: '#71717a' },
  ownerBadge: {
    fontFamily: "'DM Mono', monospace", fontSize: '12px',
    color: '#818cf8', backgroundColor: '#1e1e2e',
    padding: '2px 8px', borderRadius: '4px',
  },
  statusBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '3px 10px', borderRadius: '20px', border: '1px solid',
    fontSize: '11px', fontWeight: '600', letterSpacing: '0.3px',
  },
  statusDot: { width: '5px', height: '5px', borderRadius: '50%', display: 'inline-block' },
  actionBtn: {
    padding: '6px 14px', backgroundColor: 'transparent',
    color: '#6366f1', border: '1px solid #2d2d3d',
    borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
    fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
  },
  toggleBtn: {
    padding: '6px 14px', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
    fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.2s',
  },
  deactivateBtn: {
    backgroundColor: '#3f1515', color: '#ef4444',
    border: '1px solid #7f1d1d',
  },
  activateBtn: {
    backgroundColor: '#14291a', color: '#22c55e',
    border: '1px solid #14532d',
  },

  // States
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px', gap: '16px' },
  spinner: {
    width: '28px', height: '28px', border: '2px solid #1f1f24',
    borderTop: '2px solid #6366f1', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { fontSize: '14px', color: '#52525b' },
  emptyState: { textAlign: 'center', padding: '80px', color: '#52525b' },
  emptyIcon: { fontSize: '36px', marginBottom: '12px' },
  emptyText: { fontSize: '14px' },
};

export default AdminDashboard;