import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProducts } from '../services/api';
import { springApi } from '../services/api';

// ── Icons ─────────────────────────────────────────────────────────────────────

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const PackageIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const TruckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

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
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const savedStoreId = localStorage.getItem('storeId');
    if (savedStoreId === storeId) setCart(savedCart);
    fetchStore();
    fetchProducts();
  }, [storeId]);

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
    } catch (err) { console.error('Failed to load store', err); }
  };

  const fetchProducts = async () => {
    try {
      const res = await getProducts(storeId);
      setProducts(res.data);
      const unique = [...new Set(res.data.map(p => p.category).filter(Boolean))];
      setCategories(['All', ...unique]);
    } catch (err) { console.error('Failed to load products', err); }
    finally { setLoading(false); }
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
    const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase());
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

  const inStockProducts = filteredProducts.filter(p => p.stock > 0);
  const outOfStockProducts = filteredProducts.filter(p => p.stock === 0);
  const sortedProducts = [...inStockProducts, ...outOfStockProducts];

  return (
    <div style={s.page}>

      {/* ── Navbar ── */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <button style={s.backBtn} onClick={handleBack}>
            <ArrowLeftIcon />
            <span>Back</span>
          </button>
          <div style={s.logoWrap}>
            <div style={s.logoBox}>N</div>
            <span style={s.logoText}>NearBuy</span>
          </div>
        </div>
        {getTotalItems() > 0 && (
          <button style={s.cartNavBtn} onClick={handleCheckout}>
            <CartIcon />
            <span>{getTotalItems()} items</span>
            <span style={s.cartNavPrice}>₱{getTotalPrice().toFixed(2)}</span>
          </button>
        )}
      </nav>

      {/* ── Store Hero ── */}
      {store && (
        <div style={s.storeHero}>
          {/* Cover */}
          <div style={{
            width: '100%', height: '160px',
            backgroundColor: '#e5e7eb',
            backgroundImage: store.imageUrl
              ? `url(${store.imageUrl.startsWith('/api') ? `http://localhost:8080${store.imageUrl}` : store.imageUrl})`
              : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center',
            position: 'relative',
          }}>
            {!store.imageUrl && (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #eef4f1 0%, #c5d9ce 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '64px', opacity: 0.2, fontWeight: '700', color: '#1e4d3a', fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                  {store.name?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Hero body */}
          <div style={s.storeHeroBody}>
            <div style={s.storeAvatarWrap}>
              <div style={s.storeAvatar}>
                {store.name?.[0]?.toUpperCase()}
              </div>
            </div>
            <div style={s.storeInfo}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={s.storeName}>{store.name}</h1>
                <span style={{
                  fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                  backgroundColor: store.status === 'ACTIVE' ? '#eef4f1' : '#fef2f2',
                  color: store.status === 'ACTIVE' ? '#1e4d3a' : '#dc2626',
                  border: `1px solid ${store.status === 'ACTIVE' ? '#c5d9ce' : '#fecaca'}`,
                }}>
                  {store.status === 'ACTIVE' ? '● Open' : '● Closed'}
                </span>
              </div>
              <div style={s.metaRow}>
                {store.address && <span style={s.metaTag}><MapPinIcon /> {store.address}</span>}
                {store.estimatedDeliveryMinutes && <span style={s.metaTag}><ClockIcon /> {store.estimatedDeliveryMinutes} min</span>}
                {store.deliveryFee !== undefined && <span style={s.metaTag}><TruckIcon /> ₱{store.deliveryFee} delivery</span>}
                {store.minimumOrder > 0 && <span style={s.metaTag}><CartIcon /> Min. ₱{store.minimumOrder}</span>}
              </div>
              {store.description && <p style={s.storeDesc}>{store.description}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Search + Filter ── */}
      <div style={s.filterBar}>
        <div style={s.filterInner}>
          <div style={s.searchWrap}>
            <span style={{ color: '#94a3b8', display: 'flex' }}><SearchIcon /></span>
            <input
              style={s.searchInput}
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button style={s.clearSearchBtn} onClick={() => setSearch('')}>
                <XIcon />
              </button>
            )}
          </div>
          <div style={s.catRow}>
            {categories.map(cat => (
              <button
                key={cat}
                style={{
                  ...s.catPill,
                  ...(selectedCategory === cat ? s.catPillActive : {}),
                }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Products ── */}
      <div style={s.main}>

        {loading && (
          <div style={s.centerWrap}>
            <div style={s.spinner} />
            <p style={s.centerText}>Loading products...</p>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div style={s.emptyWrap}>
            <div style={s.emptyIcon}><PackageIcon /></div>
            <p style={s.emptyTitle}>No products found</p>
            <p style={s.emptyText}>Try a different search or category</p>
            {search && (
              <button style={s.clearFilterBtn} onClick={() => { setSearch(''); setSelectedCategory('All'); }}>
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading && sortedProducts.length > 0 && (
          <>
            <div style={s.resultsRow}>
              <p style={s.resultsLabel}>
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              </p>
              {outOfStockProducts.length > 0 && (
                <span style={s.outOfStockNote}>{outOfStockProducts.length} out of stock</span>
              )}
            </div>

            <div style={s.grid}>
              {sortedProducts.map(product => {
                const qty = getCartQuantity(product.id);
                const outOfStock = product.stock === 0;
                const lowStock = product.stock > 0 && product.stock <= 5;

                return (
                  <div key={product.id} style={{ ...s.card, opacity: outOfStock ? 0.65 : 1 }}>

                    {/* Image */}
                    <div style={s.cardImgWrap}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} style={s.cardImg} />
                      ) : (
                        <div style={s.cardImgFallback}>
                          <PackageIcon />
                        </div>
                      )}
                      {/* Badges */}
                      {outOfStock && (
                        <div style={s.badgeOutOfStock}>Out of Stock</div>
                      )}
                      {lowStock && !outOfStock && (
                        <div style={s.badgeLowStock}>{product.stock} left</div>
                      )}
                      {qty > 0 && (
                        <div style={s.badgeInCart}>{qty} in cart</div>
                      )}
                    </div>

                    {/* Body */}
                    <div style={s.cardBody}>
                      {product.category && (
                        <p style={s.cardCategory}>{product.category}</p>
                      )}
                      <h3 style={s.cardName}>{product.name}</h3>
                      {product.description && (
                        <p style={s.cardDesc}>{product.description}</p>
                      )}

                      {/* Footer */}
                      <div style={s.cardFooter}>
                        <div>
                          <span style={s.cardPrice}>₱{product.price}</span>
                          {product.unit && (
                            <span style={s.cardUnit}>/{product.unit}</span>
                          )}
                        </div>

                        {!outOfStock && (
                          qty === 0 ? (
                            <button style={s.addBtn} onClick={() => addToCart(product)}>
                              <PlusIcon /> Add
                            </button>
                          ) : (
                            <div style={s.qtyRow}>
                              <button style={s.qtyBtn} onClick={() => removeFromCart(product.id)}>
                                <MinusIcon />
                              </button>
                              <span style={s.qtyNum}>{qty}</span>
                              <button style={s.qtyBtn} onClick={() => addToCart(product)}>
                                <PlusIcon />
                              </button>
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

      {/* ── Floating Checkout Bar ── */}
      {getTotalItems() > 0 && (
        <div style={s.floatingBar}>
          <div style={s.floatingInner}>
            <div style={s.floatingLeft}>
              <div style={s.floatingCartIcon}><CartIcon /></div>
              <div>
                <p style={s.floatingTitle}>Your Cart</p>
                <p style={s.floatingMeta}>
                  {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} · ₱{getTotalPrice().toFixed(2)}
                </p>
              </div>
            </div>
            <button style={s.checkoutBtn} onClick={handleCheckout}>
              Checkout <ArrowRightIcon />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Libre+Baskerville:wght@400;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f7f5f1',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: '#1e293b',
    paddingBottom: '100px',
  },

  // Navbar
  navbar: {
    backgroundColor: 'rgba(247,245,241,0.95)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #e7e5e4',
    padding: '0 28px', height: '62px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 100,
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: '#fff', color: '#64748b',
    border: '1px solid #e7e5e4', padding: '8px 14px',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '500', fontFamily: "'DM Sans', sans-serif",
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoBox: {
    width: '34px', height: '34px', borderRadius: '9px',
    backgroundColor: '#0f172a', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: '#fff',
  },
  logoText: {
    fontSize: '18px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.3px',
    fontFamily: "'Libre Baskerville', Georgia, serif",
  },
  cartNavBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#1e4d3a', color: '#fff',
    border: 'none', padding: '9px 16px',
    borderRadius: '10px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
    animation: 'fadeUp 0.3s ease both',
  },
  cartNavPrice: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '2px 8px', borderRadius: '6px',
    fontSize: '12px', fontFamily: "'DM Mono', monospace",
  },

  // Store Hero
  storeHero: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e7e5e4',
    marginBottom: '0',
  },
  storeHeroBody: {
    maxWidth: '1100px', margin: '0 auto',
    padding: '0 28px 24px',
    display: 'flex', gap: '20px',
    position: 'relative',
  },
  storeAvatarWrap: {
    position: 'relative',
    marginTop: '-28px',
    flexShrink: 0,
  },
  storeAvatar: {
    width: '70px', height: '70px', borderRadius: '14px',
    backgroundColor: '#eef4f1', color: '#1e4d3a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', fontWeight: '700',
    fontFamily: "'Libre Baskerville', Georgia, serif",
    border: '3px solid #fff',
    boxShadow: '0 2px 8px rgba(15,23,42,0.1)',
  },
  storeInfo: { flex: 1, paddingTop: '12px' },
  storeName: {
    fontSize: '22px', fontWeight: '700', color: '#0f172a',
    margin: 0, letterSpacing: '-0.3px',
    fontFamily: "'Libre Baskerville', Georgia, serif",
  },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '10px 0 8px' },
  metaTag: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '12px', color: '#475569',
    backgroundColor: '#faf9f7', padding: '4px 10px',
    borderRadius: '20px', border: '1px solid #e7e5e4', fontWeight: '500',
  },
  storeDesc: { fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.6' },

  // Filter bar
  filterBar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e7e5e4',
    padding: '14px 28px',
    position: 'sticky', top: '62px', zIndex: 90,
  },
  filterInner: {
    maxWidth: '1100px', margin: '0 auto',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: '#faf9f7',
    border: '1px solid #e7e5e4', borderRadius: '10px',
    padding: '9px 14px',
  },
  searchInput: {
    flex: 1, background: 'none', border: 'none', outline: 'none',
    color: '#1e293b', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
  },
  clearSearchBtn: {
    background: 'none', border: 'none', color: '#94a3b8',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    padding: '2px',
  },
  catRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  catPill: {
    backgroundColor: '#faf9f7', color: '#64748b',
    border: '1px solid #e7e5e4', padding: '5px 14px',
    borderRadius: '20px', cursor: 'pointer',
    fontSize: '12px', fontWeight: '500', fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s',
  },
  catPillActive: {
    backgroundColor: '#eef4f1', color: '#1e4d3a',
    border: '1px solid #c5d9ce', fontWeight: '600',
  },

  // Main content
  main: {
    maxWidth: '1100px', margin: '0 auto',
    padding: '24px 28px',
  },

  // Loading / empty
  centerWrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '80px 20px', gap: '14px',
  },
  spinner: {
    width: '28px', height: '28px',
    border: '3px solid #e7e5e4', borderTop: '3px solid #1e4d3a',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  centerText: { fontSize: '14px', color: '#94a3b8' },
  emptyWrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '80px 20px', gap: '10px',
  },
  emptyIcon: { color: '#94a3b8', marginBottom: '4px' },
  emptyTitle: { fontSize: '16px', fontWeight: '600', color: '#334155', margin: 0 },
  emptyText: { fontSize: '13px', color: '#94a3b8', margin: 0 },
  clearFilterBtn: {
    marginTop: '8px', padding: '8px 18px',
    backgroundColor: '#eef4f1', color: '#1e4d3a',
    border: '1px solid #c5d9ce', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
    fontFamily: "'DM Sans', sans-serif",
  },

  // Results row
  resultsRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '16px',
  },
  resultsLabel: {
    fontSize: '12px', color: '#94a3b8',
    fontFamily: "'DM Mono', monospace", margin: 0,
  },
  outOfStockNote: {
    fontSize: '12px', color: '#d97706',
    backgroundColor: '#fffbeb', border: '1px solid #fde68a',
    padding: '3px 10px', borderRadius: '20px',
  },

  // Product grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    gap: '16px',
  },

  // Product card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e7e5e4',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
    display: 'flex', flexDirection: 'column',
    transition: 'all 0.2s ease',
    animation: 'fadeUp 0.35s ease both',
  },
  cardImgWrap: { position: 'relative' },
  cardImg: {
    width: '100%', height: '170px',
    objectFit: 'cover', display: 'block',
  },
  cardImgFallback: {
    width: '100%', height: '170px',
    backgroundColor: '#faf9f7',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#d1d5db', border: 'none',
  },

  // Badges
  badgeOutOfStock: {
    position: 'absolute', top: '10px', left: '10px',
    backgroundColor: '#fef2f2', color: '#dc2626',
    fontSize: '10px', fontWeight: '700',
    padding: '3px 9px', borderRadius: '20px',
    border: '1px solid #fecaca', letterSpacing: '0.3px',
  },
  badgeLowStock: {
    position: 'absolute', top: '10px', left: '10px',
    backgroundColor: '#fffbeb', color: '#d97706',
    fontSize: '10px', fontWeight: '700',
    padding: '3px 9px', borderRadius: '20px',
    border: '1px solid #fde68a', letterSpacing: '0.3px',
  },
  badgeInCart: {
    position: 'absolute', top: '10px', right: '10px',
    backgroundColor: '#1e4d3a', color: '#fff',
    fontSize: '10px', fontWeight: '700',
    padding: '3px 9px', borderRadius: '20px',
    letterSpacing: '0.3px',
  },

  // Card body
  cardBody: {
    padding: '14px 16px',
    display: 'flex', flexDirection: 'column',
    flex: 1,
  },
  cardCategory: {
    fontSize: '10px', fontWeight: '600', color: '#1e4d3a',
    textTransform: 'uppercase', letterSpacing: '0.8px',
    margin: '0 0 5px',
    fontFamily: "'DM Mono', monospace",
  },
  cardName: {
    fontSize: '14px', fontWeight: '700', color: '#0f172a',
    margin: '0 0 5px', lineHeight: '1.3',
    fontFamily: "'Libre Baskerville', Georgia, serif",
  },
  cardDesc: {
    fontSize: '12px', color: '#94a3b8',
    margin: '0 0 12px', lineHeight: '1.55',
    flex: 1,
  },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 'auto',
  },
  cardPrice: {
    fontSize: '17px', fontWeight: '700', color: '#0f172a',
    fontFamily: "'Libre Baskerville', Georgia, serif",
  },
  cardUnit: {
    fontSize: '11px', color: '#94a3b8',
    fontFamily: "'DM Sans', sans-serif", marginLeft: '2px',
  },

  // Add / qty controls
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    backgroundColor: '#1e4d3a', color: '#fff',
    border: 'none', padding: '7px 14px',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.15s',
  },
  qtyRow: {
    display: 'flex', alignItems: 'center', gap: '6px',
  },
  qtyBtn: {
    width: '30px', height: '30px', borderRadius: '8px',
    backgroundColor: '#eef4f1', color: '#1e4d3a',
    border: '1px solid #c5d9ce', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  },
  qtyNum: {
    fontSize: '14px', fontWeight: '700', color: '#0f172a',
    minWidth: '22px', textAlign: 'center',
    fontFamily: "'DM Mono', monospace",
  },

  // Floating checkout bar
  floatingBar: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e7e5e4',
    padding: '14px 28px',
    boxShadow: '0 -4px 20px rgba(15,23,42,0.08)',
    animation: 'slideUp 0.3s ease both',
    zIndex: 200,
  },
  floatingInner: {
    maxWidth: '1100px', margin: '0 auto',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  floatingLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  floatingCartIcon: {
    width: '40px', height: '40px', borderRadius: '10px',
    backgroundColor: '#eef4f1', color: '#1e4d3a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  floatingTitle: {
    fontSize: '14px', fontWeight: '700', color: '#0f172a',
    margin: 0, fontFamily: "'Libre Baskerville', Georgia, serif",
  },
  floatingMeta: {
    fontSize: '12px', color: '#64748b', margin: '2px 0 0',
    fontFamily: "'DM Mono', monospace",
  },
  checkoutBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#1e4d3a', color: '#fff',
    border: 'none', padding: '12px 24px',
    borderRadius: '10px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600',
    fontFamily: "'DM Sans', sans-serif",
  },
};

export default ProductListingPage;