import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getStores,
  getOrders,
  placeOrder,
  cancelOrder,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getMessages,
  springApi,
} from '../services/api';
import OrderReceiptModal from '../components/OrderReceiptModal';
import Feedback from './Feedback';

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

const storeImageUrl = (url) => {
  if (!url) return null;
  return url.startsWith('/api') ? `http://localhost:8080${url}` : url;
};

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'OUT_FOR_DELIVERY', label: 'On the way' },
  { key: 'DELIVERED', label: 'Delivered' },
];

const statusStyles = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' },
  PREPARING: { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200', dot: 'bg-violet-500' },
  OUT_FOR_DELIVERY: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  DELIVERED: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-600' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', dot: 'bg-red-500' },
};

const notifTypeStyle = {
  order_placed: 'bg-amber-100 text-amber-800',
  order_confirmed: 'bg-blue-100 text-blue-800',
  order_preparing: 'bg-violet-100 text-violet-800',
  order_out_for_delivery: 'bg-cyan-100 text-cyan-800',
  order_delivered: 'bg-emerald-100 text-emerald-800',
  order_cancelled: 'bg-red-100 text-red-800',
  general: 'bg-stone-100 text-stone-700',
};

// ── Cart drawer ─────────────────────────────────────────────────────────────
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
    if (savedStoreId) {
      springApi.get(`/stores/${savedStoreId}`).then((res) => setStoreName(res.data.name)).catch(() => {});
    }
  };

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const increase = (productId) => {
    updateCart(cart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item)));
  };

  const decrease = (productId) => {
    const item = cart.find((i) => i.id === productId);
    if (item?.quantity === 1) updateCart(cart.filter((i) => i.id !== productId));
    else updateCart(cart.map((i) => (i.id === productId ? { ...i, quantity: i.quantity - 1 } : i)));
  };

  const remove = (productId) => updateCart(cart.filter((i) => i.id !== productId));

  const clearCart = () => {
    updateCart([]);
    localStorage.removeItem('storeId');
  };

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const storeId = localStorage.getItem('storeId');

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[400] bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
      )}
      <div
        className={`fixed right-0 top-0 z-[500] flex h-full w-full max-w-md flex-col border-l border-stone-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <h2 className="font-['Libre_Baskerville'] text-lg font-bold text-slate-900">Your cart</h2>
            {storeName && <p className="mt-0.5 text-xs text-slate-500">from {storeName}</p>}
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-slate-500 hover:bg-stone-50"
              aria-label="Close cart"
            >
              <Icon className="h-4 w-4">
                <path d="M18 6L6 18M6 6l12 12" />
              </Icon>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4f1] text-[#1e4d3a]">
                <Icon className="h-7 w-7">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                </Icon>
              </div>
              <p className="font-semibold text-slate-800">Your cart is empty</p>
              <p className="max-w-[220px] text-sm text-slate-500">Browse stores and add items to checkout.</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 rounded-lg bg-[#1e4d3a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163d2f]"
              >
                Browse stores
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-stone-200 bg-[#faf9f7] p-3"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-xs font-bold text-[#1e4d3a] ring-1 ring-stone-200">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      item.name?.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                    {item.category && <p className="text-xs text-slate-500">{item.category}</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-[#1e4d3a]">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => decrease(item.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-stone-300 bg-white text-slate-700"
                        >
                          −
                        </button>
                        <span className="min-w-[1.25rem] text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => increase(item.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1e4d3a] text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="shrink-0 text-slate-400 hover:text-red-600"
                    aria-label="Remove item"
                  >
                    <Icon className="h-4 w-4">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </Icon>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-stone-200 p-5">
            <div className="mb-3 flex justify-between text-sm text-slate-600">
              <span>
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
              <span>Subtotal</span>
            </div>
            <p className="mb-4 font-['Libre_Baskerville'] text-2xl font-bold text-slate-900">
              ₱{totalPrice.toFixed(2)}
            </p>
            {storeId && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/products/${storeId}`);
                }}
                className="mb-2 w-full rounded-lg border border-stone-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-stone-50"
              >
                Continue shopping
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onClose();
                onCheckout?.();
                navigate('/checkout');
              }}
              className="w-full rounded-lg bg-[#1e4d3a] py-3 text-sm font-semibold text-white hover:bg-[#163d2f]"
            >
              Checkout · ₱{totalPrice.toFixed(2)}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ── Order card ────────────────────────────────────────────────────────────────
const OrderCard = ({
  order,
  expanded,
  onToggle,
  onReorder,
  onCancel,
  reordering,
  reorderSuccess,
  getStepIndex,
  navigate,
  onReceipt,
}) => {
  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const currentStep = getStepIndex(order.status);
  const st = statusStyles[order.status] || statusStyles.PENDING;

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white transition-shadow ${
        expanded ? 'border-[#1e4d3a]/30 shadow-md' : 'border-stone-200 shadow-sm'
      } ${isCancelled ? 'border-red-200' : ''}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-wrap items-start justify-between gap-3 p-4 text-left hover:bg-stone-50/80 sm:p-5"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-slate-900">Order #{order.id}</span>
            <span className="text-xs text-slate-400">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{order.storeName || `Store #${order.storeId}`}</p>
          <p className="mt-1 text-lg font-bold text-[#1e4d3a]">₱{order.totalAmount}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${st.bg} ${st.text} ${st.border}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
            {order.status?.replace(/_/g, ' ')}
          </span>
          <span className="text-xs text-slate-400">{expanded ? 'Hide details' : 'Track order'}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-stone-100 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
          {isCancelled ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800">
              This order was cancelled.
            </p>
          ) : (
            <>
              <ol className="space-y-0 pl-1">
                {STATUS_STEPS.map((step, idx) => {
                  const done = currentStep >= idx;
                  const active = currentStep === idx;
                  return (
                    <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
                      {idx < STATUS_STEPS.length - 1 && (
                        <span
                          className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5 ${
                            done && currentStep > idx ? 'bg-[#1e4d3a]' : 'bg-stone-200'
                          }`}
                        />
                      )}
                      <span
                        className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          done
                            ? 'bg-[#1e4d3a] text-white'
                            : 'border-2 border-stone-300 bg-white text-stone-400'
                        } ${active ? 'ring-2 ring-[#1e4d3a]/25' : ''}`}
                      >
                        {done ? '✓' : idx + 1}
                      </span>
                      <div className="pt-0.5">
                        <span
                          className={`text-sm ${done ? 'font-medium text-slate-900' : 'text-slate-500'}`}
                        >
                          {step.label}
                        </span>
                        {active && (
                          <span className="ml-2 text-xs font-semibold text-[#1e4d3a]">Current</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
              {!isDelivered && (
                <p className="mt-3 rounded-lg bg-[#faf9f7] px-4 py-3 text-sm text-slate-600 ring-1 ring-stone-200">
                  {order.status === 'PENDING' && 'Waiting for the store to confirm your order.'}
                  {order.status === 'CONFIRMED' && 'Your order was confirmed and will be prepared soon.'}
                  {order.status === 'PREPARING' && 'The store is preparing your order now.'}
                  {order.status === 'OUT_FOR_DELIVERY' && 'Your order is on the way.'}
                </p>
              )}
            </>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(`/chat/${order.storeOwnerId || order.storeId}`)}
              className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-50"
            >
              Message store
            </button>
            <button
              type="button"
              onClick={() => onReceipt(order)}
              className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-stone-50"
            >
              Receipt
            </button>
            {order.status === 'PENDING' && (
              <button
                type="button"
                onClick={() => onCancel(order.id)}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                Cancel order
              </button>
            )}
            {isDelivered && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/buyer/ratings')}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900"
                >
                  Rate order
                </button>
                <button
                  type="button"
                  onClick={() => !reordering && onReorder(order)}
                  disabled={reordering}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                    reorderSuccess
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-[#1e4d3a]/30 bg-[#eef4f1] text-[#1e4d3a] hover:bg-[#e0ebe6]'
                  }`}
                >
                  {reordering ? 'Placing…' : reorderSuccess ? 'Reordered' : 'Reorder'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const notifRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [unreadChats, setUnreadChats] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [storeRatings, setStoreRatings] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [displayName, setDisplayName] = useState(user.username);

  const refreshCartCount = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
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
      for (const store of storesRes.data) {
        const ownerId = store.ownerId;
        if (!ownerId) continue;
        const res = await getMessages(ownerId);
        const msgs = res.data || [];
        const lastSeenKey = `chat_seen_${user.id}_${ownerId}`;
        const lastSeen = localStorage.getItem(lastSeenKey);
        totalUnread += msgs.filter(
          (m) => m.senderId !== user.id && (!lastSeen || new Date(m.createdAt) > new Date(lastSeen))
        ).length;
      }
      setUnreadChats(totalUnread);
    } catch (err) {
      console.error('Failed to check unread messages', err);
    }
  }, [user.id]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
        const unread = msgs.filter(
          (m) =>
            Number(m.senderId) !== Number(user.id) &&
            (!lastSeen || new Date(m.createdAt) > new Date(lastSeen))
        ).length;
        convos.push({ ownerId, storeName: store.name, lastMsg, unread });
      }
      setConversations(convos);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  }, [user.id]);

  const fetchNotifications = useCallback(async () => {
    if (!user.id) return;
    try {
      const res = await getNotifications(user.id);
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, [user.id]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await springApi.get('/users/profile');
        if (res.data.profilePhoto) setProfilePhoto(`http://localhost:8080${res.data.profilePhoto}`);
        if (res.data.displayName) setDisplayName(res.data.displayName);
      } catch {
        /* ignore */
      }
    };
    fetchProfile();
  }, []);

  const fetchStoreRatings = useCallback(async (storeList) => {
    const results = {};
    await Promise.all(
      storeList.map(async (store) => {
        try {
          const { phpApi } = await import('../services/api');
          const res = await phpApi.get(`/ratings/store/${store.id}`);
          results[store.id] = { average: res.data.average_rating, total: res.data.total_ratings };
        } catch {
          /* ignore */
        }
      })
    );
    setStoreRatings(results);
  }, []);

  const fetchData = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const [storesRes, ordersRes] = await Promise.all([getStores(), getOrders()]);
        setStores(storesRes.data);
        setOrders(ordersRes.data);
        setLastRefreshed(new Date());
        fetchStoreRatings(storesRes.data);
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    },
    [fetchStoreRatings]
  );

  useEffect(() => {
    fetchData();
    fetchNotifications();
    fetchConversations();
  }, [fetchData, fetchNotifications, fetchConversations]);

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
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user.id) return;
    try {
      await markAllNotificationsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const toggleFavorite = (storeId, e) => {
    e.stopPropagation();
    const updated = favorites.includes(storeId)
      ? favorites.filter((id) => id !== storeId)
      : [...favorites, storeId];
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const getStepIndex = (status) => STATUS_STEPS.findIndex((s) => s.key === status);

  const handleReorder = async (order) => {
    setReordering(order.id);
    try {
      await placeOrder({
        storeId: order.storeId,
        items: (order.items || []).map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });
      setReorderSuccess(order.id);
      setTimeout(() => setReorderSuccess(null), 3000);
      fetchData(true);
    } catch (err) {
      console.error('Reorder failed', err);
    } finally {
      setReordering(null);
    }
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

  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const pastOrders = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'CANCELLED');

  const searchQuery = search.trim().toLowerCase();
  const matchesSearchText = (...parts) => {
    if (!searchQuery) return true;
    return parts.some((p) => p != null && String(p).toLowerCase().includes(searchQuery));
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch = matchesSearchText(store.name, store.address, store.description);
    const matchesFav = showFavoritesOnly ? favorites.includes(store.id) : true;
    return matchesSearch && matchesFav;
  });

  const orderMatchesSearch = (order) =>
    matchesSearchText(
      order.id,
      order.storeName,
      order.storeId,
      order.status?.replace(/_/g, ' ')
    );

  const filteredActiveOrders = activeOrders.filter(orderMatchesSearch);
  const filteredPastOrders = pastOrders.filter(orderMatchesSearch);

  const filteredConversations = conversations.filter((convo) =>
    matchesSearchText(convo.storeName, convo.lastMsg?.message)
  );

  const tabs = [
    {
      id: 'stores',
      label: 'Stores',
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
      count: activeOrders.length,
      icon: (
        <>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.3 7 12 12l8.7-5M12 22V12" />
        </>
      ),
    },
    {
      id: 'chats',
      label: 'Messages',
      count: unreadChats,
      icon: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />,
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: (
        <>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </>
      ),
    },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
    setShowNotifications(false);
    if (tabId === 'chats') {
      setUnreadChats(0);
      fetchConversations();
    }
  };

  const TopIconButton = ({ children, onClick, active, badge, title }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
        active
          ? 'border-[#1e4d3a]/30 bg-[#eef4f1] text-[#1e4d3a]'
          : 'border-stone-200 bg-white text-slate-600 hover:bg-stone-50'
      }`}
    >
      {children}
      {badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#1e4d3a] px-1 text-[10px] font-bold text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );

  const searchPlaceholder =
    activeTab === 'stores'
      ? 'Search stores…'
      : activeTab === 'orders'
        ? 'Search orders…'
        : activeTab === 'chats'
          ? 'Search messages…'
          : 'Search stores, orders, messages…';

  return (
    <div className="min-h-screen bg-[#f7f5f1] font-['DM_Sans',system-ui,sans-serif] text-slate-800 antialiased">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Libre+Baskerville:ital,wght@0,400;0,700&display=swap"
      />

      <CartDrawer open={showCart} onClose={() => { setShowCart(false); refreshCartCount(); }} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col overflow-hidden border-r border-stone-200 bg-white shadow-lg transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-stone-100 px-4 py-5">
          <Link to="/" className="flex items-center gap-2.5 no-underline" onClick={() => setSidebarOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              N
            </span>
            <span className="font-['Libre_Baskerville'] text-lg font-bold text-slate-900">NearBuy</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
          <ul className="space-y-1">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#1e4d3a] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0">{tab.icon}</Icon>
                  <span className="flex-1 text-left">{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#1e4d3a] text-white'
                      }`}
                    >
                      {tab.count > 9 ? '9+' : tab.count}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

        </nav>

        <div className="border-t border-stone-100 p-3">
          <button
            type="button"
            onClick={() => {
              navigate('/profile');
              setSidebarOpen(false);
            }}
            className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-stone-100"
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-stone-200" />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e4d3a] text-sm font-bold text-white">
                {user.username?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-900">{displayName}</span>
              <span className="block text-xs text-slate-500">View profile</span>
            </span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-stone-50"
          >
            Logout
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f7f5f1]/95 backdrop-blur-md lg:ml-[240px]">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-slate-700 lg:hidden"
            aria-label="Open menu"
          >
            <Icon className="h-5 w-5">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </Icon>
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3">
            <Icon className="h-4 w-4 shrink-0 text-slate-400">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </Icon>
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="shrink-0 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <Icon className="h-4 w-4">
                  <path d="M18 6L6 18M6 6l12 12" />
                </Icon>
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <TopIconButton title="Cart" badge={cartCount} active={cartCount > 0} onClick={() => setShowCart(true)}>
              <Icon className="h-[18px] w-[18px]">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
              </Icon>
            </TopIconButton>

            <div className="relative" ref={notifRef}>
              <TopIconButton
                title="Notifications"
                badge={unreadCount}
                active={showNotifications}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Icon className="h-[18px] w-[18px]">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </Icon>
              </TopIconButton>
              {showNotifications && (
                <div className="absolute right-0 top-full z-[300] mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl animate-[fadeUp_0.15s_ease]">
                  <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-[#1e4d3a] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet</p>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto">
                      {notifications.map((n) => (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => !n.is_read && handleMarkRead(n.id)}
                            className={`flex w-full gap-3 border-b border-stone-50 px-4 py-3 text-left hover:bg-stone-50 ${
                              !n.is_read ? 'bg-[#faf9f7]' : ''
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase ${
                                notifTypeStyle[n.type] || notifTypeStyle.general
                              }`}
                            >
                              {(n.type || 'general').replace('order_', '').slice(0, 2)}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-slate-900">{n.title}</span>
                              <span className="block text-xs text-slate-500 line-clamp-2">{n.message}</span>
                              <span className="mt-1 block text-[10px] text-slate-400">
                                {new Date(n.created_at).toLocaleString()}
                              </span>
                            </span>
                            {!n.is_read && (
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1e4d3a]" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <TopIconButton
              title={showFavoritesOnly ? 'Show all stores' : 'Favorites only'}
              badge={!showFavoritesOnly && favorites.length ? favorites.length : 0}
              active={showFavoritesOnly}
              onClick={() => {
                if (activeTab !== 'stores') handleTabChange('stores');
                setShowFavoritesOnly(!showFavoritesOnly);
              }}
            >
              <Icon className={`h-[18px] w-[18px] ${showFavoritesOnly ? 'fill-red-500 text-red-500' : ''}`}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </Icon>
            </TopIconButton>

            <TopIconButton title="My ratings" onClick={() => navigate('/buyer/ratings')}>
              <Icon className="h-[18px] w-[18px]">
                <path d="M12 2.5l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L12 2.5z" />
              </Icon>
            </TopIconButton>
          </div>
        </div>
      </header>

      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:ml-[240px]">
        <div className="mx-auto max-w-6xl">
        {activeTab === 'stores' && (
          <>
            <div className="mb-6">
              <p className="text-sm text-slate-500">Hello, {displayName}</p>
              <h1 className="mt-1 font-['Libre_Baskerville'] text-2xl font-bold text-slate-900 sm:text-3xl">
                {showFavoritesOnly ? 'Saved stores' : 'Discover stores'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {showFavoritesOnly
                  ? `${filteredStores.length} favorite${filteredStores.length !== 1 ? 's' : ''}`
                  : `${stores.length} stores near you`}
                {searchQuery && ` · ${filteredStores.length} match${filteredStores.length !== 1 ? 'es' : ''}`}
              </p>
              {showFavoritesOnly && (
                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly(false)}
                  className="mt-3 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                >
                  Show all stores
                </button>
              )}
            </div>

            <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: 'Active orders', value: activeOrders.length },
                { label: 'Cart items', value: cartCount },
                { label: 'Saved stores', value: favorites.length },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-3 text-center sm:px-4"
                >
                  <p className="font-['Libre_Baskerville'] text-xl font-bold text-[#1e4d3a] sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">{stat.label}</p>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-[#1e4d3a]" />
                <p className="mt-4 text-sm text-slate-500">Loading stores…</p>
              </div>
            ) : filteredStores.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white py-16 text-center">
                <p className="font-semibold text-slate-800">
                  {showFavoritesOnly ? 'No favorites yet' : 'No stores found'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {showFavoritesOnly ? 'Save a store with the heart icon.' : 'Try another search term.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStores.map((store) => {
                  const isFav = favorites.includes(store.id);
                  const isOpen = store.status === 'ACTIVE';
                  const rating = storeRatings[store.id];
                  return (
                    <article
                      key={store.id}
                      onClick={() => navigate(`/store/${store.id}`)}
                      className={`group cursor-pointer rounded-2xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                        isFav ? 'border-red-200/80' : 'border-stone-200'
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#eef4f1] text-sm font-bold text-[#1e4d3a] ring-1 ring-stone-200">
                          {store.imageUrl ? (
                            <img
                              src={storeImageUrl(store.imageUrl)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            store.name?.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              isOpen
                                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                                : 'bg-stone-100 text-stone-600 ring-1 ring-stone-200'
                            }`}
                          >
                            {isOpen ? 'Open' : 'Closed'}
                          </span>
                          {store.estimatedDeliveryMinutes && (
                            <span className="text-[10px] text-slate-500">
                              ~{store.estimatedDeliveryMinutes} min
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-[#1e4d3a]">{store.name}</h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{store.address}</p>
                      {rating?.total > 0 && (
                        <p className="mt-1 text-xs font-medium text-amber-700">
                          {rating.average} · {rating.total} review{rating.total !== 1 ? 's' : ''}
                        </p>
                      )}
                      {store.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                          {store.description}
                        </p>
                      )}
                      <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => navigate(`/store/${store.id}`)}
                          className="flex-1 rounded-lg bg-[#1e4d3a] py-2 text-sm font-semibold text-white hover:bg-[#163d2f]"
                        >
                          Shop now
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/chat/${store.ownerId}`)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-slate-600 hover:bg-stone-50"
                          aria-label="Chat"
                        >
                          <Icon className="h-4 w-4">
                            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />
                          </Icon>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(store.id, e)}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                            isFav
                              ? 'border-red-200 bg-red-50 text-red-500'
                              : 'border-stone-200 text-slate-400 hover:bg-stone-50'
                          }`}
                          aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
                        >
                          <Icon className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`}>
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </Icon>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'feedback' && (
          <div className="rounded-2xl border border-stone-200 bg-white p-2 sm:p-4">
            <Feedback embedded />
          </div>
        )}

        {activeTab === 'chats' && (
          <>
            <div className="mb-6">
              <h1 className="font-['Libre_Baskerville'] text-2xl font-bold text-slate-900">Messages</h1>
              <p className="mt-1 text-sm text-slate-500">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
            {filteredConversations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white py-16 text-center">
                <p className="font-semibold text-slate-800">
                  {searchQuery ? 'No messages match your search' : 'No conversations yet'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {searchQuery ? 'Try a different keyword.' : 'Open a store and start a chat from the Stores tab.'}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredConversations.map((convo) => (
                  <li key={convo.ownerId}>
                    <button
                      type="button"
                      onClick={() => navigate(`/chat/${convo.ownerId}`)}
                      className={`flex w-full items-center gap-3 rounded-xl border bg-white p-4 text-left transition-colors hover:shadow-sm ${
                        convo.unread > 0 ? 'border-[#1e4d3a]/30' : 'border-stone-200'
                      }`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eef4f1] text-sm font-bold text-[#1e4d3a]">
                        {convo.storeName?.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900">{convo.storeName}</span>
                          <span className="shrink-0 text-xs text-slate-400">
                            {new Date(convo.lastMsg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-slate-500">{convo.lastMsg.message}</span>
                      </span>
                      {convo.unread > 0 && (
                        <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#1e4d3a] px-1.5 text-[10px] font-bold text-white">
                          {convo.unread > 9 ? '9+' : convo.unread}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-['Libre_Baskerville'] text-2xl font-bold text-slate-900">My orders</h1>
                <p className="mt-1 text-sm text-slate-500">{orders.length} total</p>
              </div>
              <div className="flex items-center gap-2">
                {lastRefreshed && (
                  <span className="text-xs text-slate-400">
                    Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => fetchData(true)}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-[#1e4d3a]" />
                <p className="mt-4 text-sm text-slate-500">Loading orders…</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white py-16 text-center">
                <p className="font-semibold text-slate-800">No orders yet</p>
                <p className="mt-1 text-sm text-slate-500">Browse stores and place your first order.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('stores')}
                  className="mt-4 rounded-lg bg-[#1e4d3a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163d2f]"
                >
                  Browse stores
                </button>
              </div>
            ) : filteredActiveOrders.length === 0 && filteredPastOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white py-16 text-center">
                <p className="font-semibold text-slate-800">No orders match your search</p>
                <p className="mt-1 text-sm text-slate-500">Try order ID, store name, or status.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredActiveOrders.length > 0 && (
                  <section>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                      Active · {filteredActiveOrders.length}
                    </h2>
                    <ul className="space-y-3">
                      {filteredActiveOrders.map((order) => (
                        <li key={order.id}>
                          <OrderCard
                            order={order}
                            expanded={expandedOrder === order.id}
                            onToggle={() =>
                              setExpandedOrder(expandedOrder === order.id ? null : order.id)
                            }
                            onReorder={handleReorder}
                            onCancel={handleCancel}
                            reordering={reordering === order.id}
                            reorderSuccess={reorderSuccess === order.id}
                            getStepIndex={getStepIndex}
                            navigate={navigate}
                            onReceipt={setReceiptOrder}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {filteredPastOrders.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Past · {filteredPastOrders.length}
                    </h2>
                    <ul className="space-y-3">
                      {filteredPastOrders.map((order) => (
                        <li key={order.id}>
                          <OrderCard
                            order={order}
                            expanded={expandedOrder === order.id}
                            onToggle={() =>
                              setExpandedOrder(expandedOrder === order.id ? null : order.id)
                            }
                            onReorder={handleReorder}
                            onCancel={handleCancel}
                            reordering={reordering === order.id}
                            reorderSuccess={reorderSuccess === order.id}
                            getStepIndex={getStepIndex}
                            navigate={navigate}
                            onReceipt={setReceiptOrder}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </>
        )}
        </div>
      </main>

      {receiptOrder && <OrderReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default BuyerDashboard;
