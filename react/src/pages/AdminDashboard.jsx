import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { springApi, getPublicProfile } from '../services/api';

const Icon = ({ children, className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {children}
  </svg>
);

const storeStatusStyles = {
  ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  INACTIVE: 'bg-red-50 text-red-800 border-red-200',
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
};

const orderStatusStyles = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-800 border-blue-200',
  PREPARING: 'bg-violet-50 text-violet-800 border-violet-200',
  OUT_FOR_DELIVERY: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  DELIVERED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-800 border-red-200',
};

const formatMoney = (n) =>
  `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';

const StatusBadge = ({ status, map = orderStatusStyles }) => {
  const cls = map[status] || 'bg-stone-100 text-stone-700 border-stone-200';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const StatCard = ({ label, value, sub, barWidth = '100%', accent = 'bg-[#1e4d3a]' }) => (
  <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-2 font-['Libre_Baskerville'] text-3xl font-bold text-slate-900">{value}</p>
    {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    <div className="mt-4 h-1 overflow-hidden rounded-full bg-stone-100">
      <div className={`h-full rounded-full transition-all duration-500 ${accent}`} style={{ width: barWidth }} />
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [activeTab, setActiveTab] = useState('overview');
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ownerNames, setOwnerNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('ALL');
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOwnerNames = useCallback(async (storeList) => {
    const ids = [...new Set(storeList.map((s) => s.ownerId).filter(Boolean))];
    const entries = await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await getPublicProfile(id);
          return [id, res.data.displayName || res.data.username || `User #${id}`];
        } catch {
          return [id, `User #${id}`];
        }
      })
    );
    setOwnerNames((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
  }, []);

  const fetchOrdersForStores = useCallback(async (storeList) => {
    if (!storeList.length) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    try {
      const results = await Promise.allSettled(
        storeList.map((s) => springApi.get(`/orders/store/${s.id}`))
      );
      const merged = [];
      results.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          const list = res.value.data || [];
          list.forEach((o) => merged.push({ ...o, storeName: o.storeName || storeList[i].name }));
        }
      });
      merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(merged);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const storesRes = await springApi.get('/stores/all');
      const list = storesRes.data || [];
      setStores(list);
      setLastRefreshed(new Date());
      await Promise.all([fetchOrdersForStores(list), fetchOwnerNames(list)]);
    } catch (err) {
      console.error('Failed to load admin data', err);
      showToast('Failed to refresh platform data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [fetchOrdersForStores, fetchOwnerNames]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const stats = useMemo(() => {
    const active = stores.filter((s) => s.status === 'ACTIVE').length;
    const inactive = stores.filter((s) => s.status === 'INACTIVE').length;
    const pending = stores.filter((s) => s.status === 'PENDING').length;
    const nonCancelled = orders.filter((o) => o.status !== 'CANCELLED');
    const revenue = nonCancelled.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const openOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
    const byStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
    return { active, inactive, pending, revenue, openOrders, byStatus };
  }, [stores, orders]);

  const searchQuery = search.trim().toLowerCase();
  const matchesText = (...parts) => {
    if (!searchQuery) return true;
    return parts.some((p) => p != null && String(p).toLowerCase().includes(searchQuery));
  };

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchFilter = storeFilter === 'ALL' || store.status === storeFilter;
      const matchSearch = matchesText(store.name, store.address, store.description, store.ownerId);
      return matchFilter && matchSearch;
    });
  }, [stores, storeFilter, searchQuery]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchFilter = orderFilter === 'ALL' || order.status === orderFilter;
      const matchSearch = matchesText(
        order.id,
        order.storeName,
        order.buyerId,
        order.status?.replace(/_/g, ' ')
      );
      return matchFilter && matchSearch;
    });
  }, [orders, orderFilter, searchQuery]);

  const recentOrders = useMemo(() => {
    const list = orders.filter((order) =>
      matchesText(order.id, order.storeName, order.buyerId, order.status?.replace(/_/g, ' '))
    );
    return list.slice(0, 8);
  }, [orders, searchQuery]);
  const pendingStores = useMemo(() => stores.filter((s) => s.status === 'PENDING'), [stores]);

  const handleStoreStatus = async (store, targetStatus) => {
    setTogglingId(store.id);
    try {
      await springApi.patch(`/stores/${store.id}/status`, { status: targetStatus });
      setStores((prev) => prev.map((s) => (s.id === store.id ? { ...s, status: targetStatus } : s)));
      const verb =
        targetStatus === 'ACTIVE' ? 'activated' : targetStatus === 'PENDING' ? 'updated' : 'deactivated';
      showToast(`"${store.name}" has been ${verb}.`, targetStatus === 'INACTIVE' ? 'warning' : 'success');
    } catch (err) {
      console.error(err);
      showToast('Could not update store status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order as admin?')) return;
    setCancellingId(orderId);
    try {
      await springApi.patch(`/orders/${orderId}/status`, { status: 'CANCELLED' });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o)));
      showToast(`Order #${orderId} cancelled.`, 'warning');
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel order.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </>
      ),
    },
    {
      id: 'stores',
      label: 'Stores',
      count: pendingStores.length || undefined,
      icon: (
        <>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </>
      ),
    },
    {
      id: 'orders',
      label: 'Orders',
      count: stats.openOrders || undefined,
      icon: (
        <>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
        </>
      ),
    },
  ];

  const storeFilters = ['ALL', 'ACTIVE', 'PENDING', 'INACTIVE'];
  const orderFilters = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

  const tabMeta = {
    overview: {
      title: 'Platform overview',
      subtitle: 'Health metrics and recent activity across NearBuy',
    },
    stores: {
      title: 'Store management',
      subtitle: 'Approve, activate, and monitor every registered store',
    },
    orders: {
      title: 'Order oversight',
      subtitle: 'Track and intervene on orders across all stores',
    },
  };

  const handleTabChange = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  const toastStyles = {
    success: 'bg-[#1e4d3a] text-white',
    warning: 'bg-amber-600 text-white',
    error: 'bg-red-600 text-white',
  };

  return (
    <div className="min-h-screen bg-[#f7f5f1] font-['DM_Sans',system-ui,sans-serif] text-slate-800">
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap"
        rel="stylesheet"
      />

      {toast && (
        <div
          role="status"
          className={`fixed right-4 top-4 z-[100] max-w-sm rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${toastStyles[toast.type]}`}
        >
          {toast.message}
        </div>
      )}

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-stone-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-stone-100 px-5 py-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e4d3a] text-sm font-bold text-white">
              N
            </span>
            <div>
              <span className="font-['Libre_Baskerville'] text-lg font-bold text-slate-900">NearBuy</span>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1e4d3a]">Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#eef4f1] text-[#1e4d3a]'
                  : 'text-slate-600 hover:bg-stone-50'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0">{tab.icon}</Icon>
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.count > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-stone-100 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-stone-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1e4d3a] text-sm font-bold text-white">
              {user.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user.username}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 py-2 text-sm font-medium text-slate-600 hover:bg-stone-50"
          >
            <Icon className="h-4 w-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </Icon>
            Sign out
          </button>
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f7f5f1]/95 backdrop-blur-md lg:ml-[240px]">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Icon className="h-5 w-5">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </Icon>
          </button>

          <div className="relative min-w-0 flex-1">
            <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </Icon>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === 'orders'
                  ? 'Search orders by ID, store, buyer…'
                  : activeTab === 'stores'
                    ? 'Search stores by name, address…'
                    : 'Search stores or orders…'
              }
              className="w-full rounded-lg border border-stone-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1e4d3a]/40 focus:outline-none focus:ring-2 focus:ring-[#1e4d3a]/15"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchAll(true)}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 disabled:opacity-50"
          >
            <Icon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}>
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </Icon>
            Refresh
          </button>
        </div>
      </header>

      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:ml-[240px]">
        <div className="mb-8">
          <h1 className="font-['Libre_Baskerville'] text-2xl font-bold text-slate-900 sm:text-3xl">
            {tabMeta[activeTab].title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{tabMeta[activeTab].subtitle}</p>
          {lastRefreshed && (
            <p className="mt-1 text-xs text-slate-400">
              Last updated {lastRefreshed.toLocaleTimeString()}
              {ordersLoading && ' · syncing orders…'}
            </p>
          )}
        </div>

        {loading && activeTab === 'overview' ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-stone-200 border-t-[#1e4d3a]" />
            <p className="mt-4 text-sm text-slate-500">Loading platform data…</p>
          </div>
        ) : (
          <>
            {/* ── Overview ── */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Total stores"
                    value={stores.length}
                    sub={`${stats.active} active · ${stats.pending} pending`}
                    barWidth={stores.length ? `${(stats.active / stores.length) * 100}%` : '0%'}
                  />
                  <StatCard
                    label="Total orders"
                    value={orders.length}
                    sub={`${stats.openOrders} in progress`}
                    accent="bg-emerald-600"
                    barWidth={orders.length ? `${((orders.length - stats.openOrders) / orders.length) * 100}%` : '0%'}
                  />
                  <StatCard
                    label="Gross volume"
                    value={formatMoney(stats.revenue)}
                    sub="Excludes cancelled orders"
                    accent="bg-amber-500"
                  />
                  <StatCard
                    label="Inactive stores"
                    value={stats.inactive}
                    sub={stats.pending ? `${stats.pending} awaiting approval` : 'All reviewed'}
                    accent="bg-red-500"
                    barWidth={stores.length ? `${(stats.inactive / stores.length) * 100}%` : '0%'}
                  />
                </div>

                {pendingStores.length > 0 && (
                  <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="font-['Libre_Baskerville'] text-lg font-bold text-amber-950">
                          {pendingStores.length} store{pendingStores.length !== 1 ? 's' : ''} awaiting approval
                        </h2>
                        <p className="mt-1 text-sm text-amber-800/80">Review and activate new registrations</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setStoreFilter('PENDING');
                          handleTabChange('stores');
                        }}
                        className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800"
                      >
                        Review queue
                      </button>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {pendingStores.slice(0, 3).map((s) => (
                        <li
                          key={s.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200/60 bg-white px-4 py-3"
                        >
                          <span className="font-medium text-slate-900">{s.name}</span>
                          <button
                            type="button"
                            disabled={togglingId === s.id}
                            onClick={() => handleStoreStatus(s, 'ACTIVE')}
                            className="rounded-md bg-[#1e4d3a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163d2f] disabled:opacity-50"
                          >
                            Approve
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section>
                  <h2 className="mb-4 font-['Libre_Baskerville'] text-lg font-bold text-slate-900">Recent orders</h2>
                  {recentOrders.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center text-sm text-slate-500">
                      No orders yet across the platform.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-stone-100 bg-stone-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Order</th>
                            <th className="hidden px-4 py-3 sm:table-cell">Store</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="hidden px-4 py-3 md:table-cell">When</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((order) => (
                            <tr key={order.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                              <td className="px-4 py-3 font-mono font-semibold text-slate-900">#{order.id}</td>
                              <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{order.storeName}</td>
                              <td className="px-4 py-3 font-medium text-[#1e4d3a]">{formatMoney(order.totalAmount)}</td>
                              <td className="px-4 py-3">
                                <StatusBadge status={order.status} />
                              </td>
                              <td className="hidden px-4 py-3 text-slate-500 md:table-cell">{formatDate(order.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section>
                  <h2 className="mb-4 font-['Libre_Baskerville'] text-lg font-bold text-slate-900">Orders by status</h2>
                  <div className="flex flex-wrap gap-2">
                    {orderFilters
                      .filter((f) => f !== 'ALL')
                      .map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setOrderFilter(status);
                            handleTabChange('orders');
                          }}
                          className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm hover:border-[#1e4d3a]/30"
                        >
                          <StatusBadge status={status} />
                          <span className="font-semibold text-slate-700">{stats.byStatus[status] || 0}</span>
                        </button>
                      ))}
                  </div>
                </section>
              </div>
            )}

            {/* ── Stores ── */}
            {activeTab === 'stores' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {storeFilters.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setStoreFilter(f)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        storeFilter === f
                          ? 'bg-[#1e4d3a] text-white'
                          : 'border border-stone-200 bg-white text-slate-600 hover:bg-stone-50'
                      }`}
                    >
                      {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                      {f !== 'ALL' && (
                        <span className="ml-1 opacity-70">
                          ({stores.filter((s) => s.status === f).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-stone-200 border-t-[#1e4d3a]" />
                  </div>
                ) : filteredStores.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
                    <p className="text-slate-500">No stores match your filters.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="border-b border-stone-100 bg-stone-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Store</th>
                            <th className="px-4 py-3">Address</th>
                            <th className="px-4 py-3">Owner</th>
                            <th className="px-4 py-3">Delivery</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStores.map((store) => (
                            <tr
                              key={store.id}
                              className={`border-b border-stone-50 last:border-0 hover:bg-stone-50/50 ${
                                store.status === 'INACTIVE' ? 'opacity-70' : ''
                              }`}
                            >
                              <td className="px-4 py-4">
                                <p className="font-medium text-slate-900">{store.name}</p>
                                {store.description && (
                                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{store.description}</p>
                                )}
                              </td>
                              <td className="max-w-[200px] px-4 py-4 text-slate-600">{store.address}</td>
                              <td className="px-4 py-4">
                                <span className="rounded-md bg-[#eef4f1] px-2 py-1 text-xs font-medium text-[#1e4d3a]">
                                  {ownerNames[store.ownerId] || `User #${store.ownerId}`}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-slate-600">{store.estimatedDeliveryMinutes} min</td>
                              <td className="px-4 py-4">
                                <StatusBadge status={store.status} map={storeStatusStyles} />
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/products/${store.id}`)}
                                    className="rounded-md border border-stone-200 px-3 py-1.5 text-xs font-semibold text-[#1e4d3a] hover:bg-[#eef4f1]"
                                  >
                                    View
                                  </button>
                                  {store.status === 'PENDING' && (
                                    <button
                                      type="button"
                                      disabled={togglingId === store.id}
                                      onClick={() => handleStoreStatus(store, 'ACTIVE')}
                                      className="rounded-md bg-[#1e4d3a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163d2f] disabled:opacity-50"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  {store.status === 'ACTIVE' && (
                                    <button
                                      type="button"
                                      disabled={togglingId === store.id}
                                      onClick={() => handleStoreStatus(store, 'INACTIVE')}
                                      className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                                    >
                                      Deactivate
                                    </button>
                                  )}
                                  {store.status === 'INACTIVE' && (
                                    <button
                                      type="button"
                                      disabled={togglingId === store.id}
                                      onClick={() => handleStoreStatus(store, 'ACTIVE')}
                                      className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                                    >
                                      Activate
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Orders ── */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {orderFilters.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setOrderFilter(f)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        orderFilter === f
                          ? 'bg-[#1e4d3a] text-white'
                          : 'border border-stone-200 bg-white text-slate-600 hover:bg-stone-50'
                      }`}
                    >
                      {f === 'ALL' ? 'All' : f.replace(/_/g, ' ')}
                      {f !== 'ALL' && (
                        <span className="ml-1 opacity-70">({stats.byStatus[f] || 0})</span>
                      )}
                    </button>
                  ))}
                </div>

                {loading || ordersLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-stone-200 border-t-[#1e4d3a]" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center">
                    <p className="text-slate-500">No orders match your filters.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px] text-left text-sm">
                        <thead className="border-b border-stone-100 bg-stone-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Store</th>
                            <th className="px-4 py-3">Buyer</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Placed</th>
                            <th className="px-4 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => {
                            const canCancel =
                              order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
                            return (
                              <tr key={order.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                                <td className="px-4 py-3 font-mono font-semibold">#{order.id}</td>
                                <td className="px-4 py-3 text-slate-700">{order.storeName}</td>
                                <td className="px-4 py-3">
                                  <span className="rounded-md bg-stone-100 px-2 py-1 font-mono text-xs">
                                    #{order.buyerId}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-[#1e4d3a]">
                                  {formatMoney(order.totalAmount)}
                                </td>
                                <td className="px-4 py-3">
                                  <StatusBadge status={order.status} />
                                </td>
                                <td className="px-4 py-3 text-slate-500">{formatDate(order.createdAt)}</td>
                                <td className="px-4 py-3">
                                  {canCancel ? (
                                    <button
                                      type="button"
                                      disabled={cancellingId === order.id}
                                      onClick={() => handleCancelOrder(order.id)}
                                      className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                                    >
                                      {cancellingId === order.id ? '…' : 'Cancel'}
                                    </button>
                                  ) : (
                                    <span className="text-xs text-slate-400">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
