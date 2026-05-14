import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProducts } from '../services/api';
import { springApi } from '../services/api';

const ProductListingPage = () => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    // Load existing cart from localStorage (same store only)
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const savedStoreId = localStorage.getItem('storeId');
    if (savedStoreId === storeId) setCart(savedCart);

    fetchStore();
    fetchProducts();
  }, [storeId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('storeId', storeId);
    }
  }, [cart, storeId]);

  const fetchStore = async () => {
    try {
      const res = await springApi.get(`/stores/${storeId}`);
      setStore(res.data);
    } catch (err) {
      console.error('Failed to load store', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await getProducts(storeId);
      setProducts(res.data);
      const unique = [...new Set(res.data.map(p => p.category).filter(Boolean))];
      setCategories(['All', ...unique]);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    const existing = cart.find(item => item.id === productId);
    if (existing?.quantity === 1) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item));
    }
  };

  const getCartQuantity = (productId) => cart.find(item => item.id === productId)?.quantity || 0;
  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCheckout = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('storeId', storeId);
    navigate('/checkout');
  };

  const handleBack = () => {
    const role = localStorage.getItem('role');
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'store_owner') navigate('/store/dashboard');
    else navigate('/buyer/dashboard');
  };

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <button style={s.backBtn} onClick={handleBack}>← Back</button>
          <div style={s.logoWrap}>
            <div style={s.logoIcon}>🛒</div>
            <span style={s.logoText}>NearBuy</span>
          </div>
        </div>
        {getTotalItems() > 0 && (
          <button style={s.cartBtn} onClick={handleCheckout}>
            🛒 {getTotalItems()} items · ₱{getTotalPrice().toFixed(2)}
          </button>
        )}
      </nav>

      {/* Store Hero */}
      {store && (
        <div style={s.storeHero}>
          <div style={s.storeHeroInner}>
            <div style={s.storeAvatar}>{store.name?.[0]?.toUpperCase()}</div>
            <div>
              <h1 style={s.storeName}>{store.name}</h1>
              <p style={s.storeMeta}>
                📍 {store.address}
                {store.estimatedDeliveryMinutes && ` · ⏱ ${store.estimatedDeliveryMinutes} min delivery`}
                {store.deliveryFee !== undefined && ` · 🚚 ₱${store.deliveryFee} delivery fee`}
              </p>
              {store.description && <p style={s.storeDesc}>{store.description}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div style={s.filterSection}>
        <div style={s.filterInner}>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button style={s.clearBtn} onClick={() => setSearch('')}>✕</button>}
          </div>
          <div style={s.cats}>
            {categories.map(cat => (
              <button
                key={cat}
                style={{ ...s.catBtn, ...(selectedCategory === cat ? s.catBtnActive : {}) }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div style={s.main}>
        {loading && (
          <div style={s.loadingWrap}>
            <div style={s.spinner}></div>
            <p style={s.loadingText}>Loading products...</p>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📦</div>
            <p style={s.emptyTitle}>No products found</p>
            <p style={s.emptyText}>Try a different search or category</p>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <>
            <p style={s.resultsLabel}>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
            <div style={s.grid}>
              {filteredProducts.map(product => {
                const qty = getCartQuantity(product.id);
                const outOfStock = product.stock === 0;
                return (
                  <div key={product.id} style={{ ...s.card, ...(outOfStock ? s.cardDisabled : {}) }}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} style={s.cardImg} />
                    ) : (
                      <div style={s.cardImgPlaceholder}>🛍️</div>
                    )}
                    {outOfStock && <div style={s.outOfStockBadge}>Out of Stock</div>}
                    <div style={s.cardBody}>
                      <p style={s.cardCategory}>{product.category}</p>
                      <h3 style={s.cardName}>{product.name}</h3>
                      {product.description && <p style={s.cardDesc}>{product.description}</p>}
                      <div style={s.cardFooter}>
                        <span style={s.cardPrice}>₱{product.price}</span>
                        {!outOfStock && (
                          qty === 0 ? (
                            <button style={s.addBtn} onClick={() => addToCart(product)}>Add</button>
                          ) : (
                            <div style={s.qtyRow}>
                              <button style={s.qtyBtn} onClick={() => removeFromCart(product.id)}>−</button>
                              <span style={s.qtyNum}>{qty}</span>
                              <button style={s.qtyBtn} onClick={() => addToCart(product)}>+</button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Floating Checkout */}
      {getTotalItems() > 0 && (
        <div style={s.floatingBar}>
          <div style={s.floatingInner}>
            <div>
              <p style={s.floatingTitle}>Your cart</p>
              <p style={s.floatingMeta}>{getTotalItems()} items · ₱{getTotalPrice().toFixed(2)}</p>
            </div>
            <button style={s.checkoutBtn} onClick={handleCheckout}>
              Checkout →
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const GREEN = '#059669';
const GREEN_LIGHT = '#d1fae5';

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f9fafb', color: '#111827', fontFamily: "'Inter', -apple-system, sans-serif", paddingBottom: '100px' },
  navbar: { backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '20px' },
  backBtn: { backgroundColor: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoIcon: { fontSize: '20px' },
  logoText: { fontSize: '18px', fontWeight: '700', color: GREEN },
  cartBtn: { backgroundColor: GREEN, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 2px 8px rgba(5,150,105,0.3)' },
  storeHero: { backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '28px 32px' },
  storeHeroInner: { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px' },
  storeAvatar: { width: '64px', height: '64px', borderRadius: '16px', backgroundColor: GREEN_LIGHT, color: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', flexShrink: 0 },
  storeName: { fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 6px' },
  storeMeta: { fontSize: '13px', color: '#6b7280', margin: '0 0 4px' },
  storeDesc: { fontSize: '14px', color: '#374151', margin: 0 },
  filterSection: { backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 32px' },
  filterInner: { maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f3f4f6', borderRadius: '10px', padding: '10px 16px', border: '1px solid #e5e7eb' },
  searchIcon: { fontSize: '16px', flexShrink: 0 },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#111827', fontSize: '14px' },
  clearBtn: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' },
  cats: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  catBtn: { backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  catBtnActive: { backgroundColor: GREEN_LIGHT, color: GREEN, border: `1px solid ${GREEN}` },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '28px 32px' },
  resultsLabel: { fontSize: '13px', color: '#9ca3af', marginBottom: '20px' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px', gap: '16px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTop: `3px solid ${GREEN}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: '#9ca3af', fontSize: '14px' },
  empty: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { fontSize: '56px', marginBottom: '16px' },
  emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  emptyText: { color: '#9ca3af', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s', position: 'relative' },
  cardDisabled: { opacity: 0.6 },
  cardImg: { width: '100%', height: '180px', objectFit: 'cover' },
  cardImgPlaceholder: { width: '100%', height: '180px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' },
  outOfStockBadge: { position: 'absolute', top: '12px', left: '12px', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },
  cardBody: { padding: '14px 16px' },
  cardCategory: { fontSize: '11px', fontWeight: '600', color: GREEN, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' },
  cardName: { fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 6px' },
  cardDesc: { fontSize: '12px', color: '#9ca3af', margin: '0 0 12px', lineHeight: '1.5' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: '18px', fontWeight: '700', color: '#111827' },
  addBtn: { backgroundColor: GREEN, color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  qtyBtn: { width: '30px', height: '30px', borderRadius: '8px', backgroundColor: GREEN_LIGHT, color: GREEN, border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyNum: { fontSize: '15px', fontWeight: '700', color: '#111827', minWidth: '20px', textAlign: 'center' },
  floatingBar: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTop: '1px solid #e5e7eb', padding: '16px 32px', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' },
  floatingInner: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  floatingTitle: { fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 },
  floatingMeta: { fontSize: '13px', color: '#6b7280', margin: '2px 0 0' },
  checkoutBtn: { backgroundColor: GREEN, color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', boxShadow: '0 2px 8px rgba(5,150,105,0.3)' },
};

export default ProductListingPage;