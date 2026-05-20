import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../services/api';

// ── Icons ─────────────────────────────────────────────────────────────────────

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const NoteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const PackageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState({ address: '', contact: '', notes: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const savedStoreId = localStorage.getItem('storeId');
    setCart(savedCart);
    setStoreId(savedStoreId);
    if (user.address) setDeliveryInfo(prev => ({ ...prev, address: user.address }));
    if (user.contact) setDeliveryInfo(prev => ({ ...prev, contact: user.contact }));
  }, []);

  const getTotalPrice = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!deliveryInfo.address) { setError('Please enter a delivery address.'); return; }
    setLoading(true);
    setError('');
    try {
      const orderData = {
        storeId: parseInt(storeId),
        deliveryAddress: deliveryInfo.address,
        contactNumber: deliveryInfo.contact,
        deliveryNotes: deliveryInfo.notes,
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
      };
      const res = await placeOrder(orderData);
      localStorage.removeItem('cart');
      localStorage.removeItem('storeId');
      setOrderResult({ ...res.data, cartSnapshot: cart, deliveryInfo });
    } catch (err) {
      setError('Failed to place order. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Receipt ─────────────────────────────────────────────────────────────────
  if (orderResult) {
    const total = orderResult.cartSnapshot.reduce((s, i) => s + i.price * i.quantity, 0);
    return (
      <div style={s.receiptPage}>
        <div style={s.receiptCard}>

          {/* Success header */}
          <div style={s.receiptTop}>
            <div style={s.checkCircle}><CheckIcon /></div>
            <h2 style={s.receiptTitle}>Order Confirmed!</h2>
            <p style={s.receiptSubtitle}>Your order is being processed by the store.</p>
            <div style={s.orderIdPill}>
              Order <span style={{ fontFamily: "'DM Mono', monospace", color: '#1e4d3a' }}>#{orderResult.id || '—'}</span>
            </div>
          </div>

          {/* Status banner */}
          <div style={s.statusBanner}>
            <span style={s.statusDot} />
            <span style={s.statusText}>PENDING — Waiting for store confirmation</span>
          </div>

          {/* Items */}
          <div style={s.receiptSection}>
            <p style={s.receiptSectionLabel}>ITEMS ORDERED</p>
            <div style={s.receiptItems}>
              {orderResult.cartSnapshot.map(item => (
                <div key={item.id} style={s.receiptItem}>
                  <div style={s.receiptItemLeft}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} style={s.receiptItemImg} />
                      : <div style={s.receiptItemImgFallback}><PackageIcon /></div>
                    }
                    <div>
                      <p style={s.receiptItemName}>{item.name}</p>
                      <p style={s.receiptItemQty}>× {item.quantity}</p>
                    </div>
                  </div>
                  <span style={s.receiptItemPrice}>₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={s.receiptDivider} />
            <div style={s.receiptTotalRow}>
              <span style={s.receiptTotalLabel}>Total</span>
              <span style={s.receiptTotalAmount}>₱{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery */}
          <div style={s.receiptSection}>
            <p style={s.receiptSectionLabel}>DELIVERY DETAILS</p>
            <div style={s.receiptDetails}>
              <div style={s.receiptDetail}>
                <span style={{ color: '#1e4d3a' }}><MapPinIcon /></span>
                <span style={s.receiptDetailText}>{orderResult.deliveryInfo.address}</span>
              </div>
              {orderResult.deliveryInfo.contact && (
                <div style={s.receiptDetail}>
                  <span style={{ color: '#1e4d3a' }}><PhoneIcon /></span>
                  <span style={s.receiptDetailText}>{orderResult.deliveryInfo.contact}</span>
                </div>
              )}
              {orderResult.deliveryInfo.notes && (
                <div style={s.receiptDetail}>
                  <span style={{ color: '#1e4d3a' }}><NoteIcon /></span>
                  <span style={s.receiptDetailText}>{orderResult.deliveryInfo.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={s.receiptActions}>
            <button style={s.trackBtn} onClick={() => navigate('/buyer/dashboard')}>
              Track My Order <ArrowRightIcon />
            </button>
            <button style={s.shopMoreBtn} onClick={() => navigate('/buyer/dashboard')}>
              Continue Shopping
            </button>
          </div>

          <p style={s.receiptFooter}>Thank you for shopping with NearBuy!</p>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Libre+Baskerville:wght@400;700&family=DM+Mono:wght@400;500&display=swap');
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    );
  }

  // ── Checkout Form ───────────────────────────────────────────────────────────
  return (
    <div style={s.page}>

      {/* Navbar */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeftIcon />
            <span>Back</span>
          </button>
          <div style={s.logoWrap}>
            <div style={s.logoBox}>N</div>
            <span style={s.logoText}>NearBuy</span>
          </div>
        </div>
        <span style={s.navCaption}>Checkout</span>
      </nav>

      <div style={s.main}>
        <div style={s.layout}>

          {/* ── Left: Order Summary ── */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={{ color: '#1e4d3a' }}><CartIcon /></span>
              <h3 style={s.cardTitle}>Order Summary</h3>
            </div>

            {cart.length === 0 ? (
              <div style={s.emptyCart}>
                <CartIcon />
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Your cart is empty.</p>
              </div>
            ) : (
              <>
                <div style={s.itemsList}>
                  {cart.map(item => (
                    <div key={item.id} style={s.orderItem}>
                      <div style={s.itemLeft}>
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt={item.name} style={s.itemImg} />
                          : <div style={s.itemImgFallback}><PackageIcon /></div>
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={s.itemName}>{item.name}</p>
                          {item.category && <p style={s.itemCategory}>{item.category}</p>}
                        </div>
                        <span style={s.itemQtyBadge}>×{item.quantity}</span>
                      </div>
                      <span style={s.itemPrice}>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={s.divider} />

                <div style={s.totalRow}>
                  <div>
                    <p style={s.totalLabel}>Order Total</p>
                    <p style={s.totalSub}>{getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}</p>
                  </div>
                  <span style={s.totalPrice}>₱{getTotalPrice().toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* ── Right: Delivery Info ── */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={{ color: '#1e4d3a' }}><MapPinIcon /></span>
              <h3 style={s.cardTitle}>Delivery Information</h3>
            </div>

            {error && (
              <div style={s.errorBox}>
                <AlertIcon /> {error}
              </div>
            )}

            <div style={s.fieldGroup}>
              <label style={s.fieldLabel}>DELIVERY ADDRESS *</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}><MapPinIcon /></span>
                <input
                  style={s.input}
                  type="text"
                  placeholder="Enter your delivery address"
                  value={deliveryInfo.address}
                  onChange={e => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                />
              </div>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.fieldLabel}>CONTACT NUMBER</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}><PhoneIcon /></span>
                <input
                  style={s.input}
                  type="text"
                  placeholder="Enter your contact number"
                  value={deliveryInfo.contact}
                  onChange={e => setDeliveryInfo({ ...deliveryInfo, contact: e.target.value })}
                />
              </div>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.fieldLabel}>ORDER NOTES (OPTIONAL)</label>
              <div style={{ ...s.inputWrap, alignItems: 'flex-start', padding: '10px 12px' }}>
                <span style={{ ...s.inputIcon, marginTop: '2px' }}><NoteIcon /></span>
                <textarea
                  style={{ ...s.input, padding: '0', height: '80px', resize: 'vertical' }}
                  placeholder="Any special instructions for the store or rider?"
                  value={deliveryInfo.notes}
                  onChange={e => setDeliveryInfo({ ...deliveryInfo, notes: e.target.value })}
                />
              </div>
            </div>

            {/* Order summary mini */}
            <div style={s.miniSummary}>
              <div style={s.miniSummaryRow}>
                <span style={s.miniSummaryLabel}>Subtotal</span>
                <span style={s.miniSummaryVal}>₱{getTotalPrice().toFixed(2)}</span>
              </div>
              <div style={{ ...s.miniSummaryRow, marginTop: '6px', paddingTop: '10px', borderTop: '1px solid #f5f5f4' }}>
                <span style={{ ...s.miniSummaryLabel, fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>Total</span>
                <span style={{ ...s.miniSummaryVal, fontSize: '20px', fontWeight: '700', color: '#1e4d3a', fontFamily: "'Libre Baskerville', Georgia, serif" }}>₱{getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <button
              style={{ ...s.placeOrderBtn, opacity: loading || cart.length === 0 ? 0.6 : 1 }}
              onClick={handlePlaceOrder}
              disabled={loading || cart.length === 0}
            >
              {loading
                ? <><div style={s.btnSpinner} /> Placing Order...</>
                : <>Place Order · ₱{getTotalPrice().toFixed(2)} <ArrowRightIcon /></>
              }
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Libre+Baskerville:wght@400;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
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
  navCaption: { fontSize: '13px', fontWeight: '500', color: '#64748b' },
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

  // Layout
  main: {
    maxWidth: '960px', margin: '0 auto',
    padding: '28px 24px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '20px',
    alignItems: 'start',
  },

  // Card
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e5e4',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
    animation: 'fadeUp 0.35s ease both',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '15px', fontWeight: '700', color: '#0f172a',
    margin: 0, fontFamily: "'Libre Baskerville', Georgia, serif",
  },

  // Empty cart
  emptyCart: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '10px', padding: '32px 0', color: '#94a3b8',
  },

  // Order items
  itemsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  orderItem: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: '12px',
  },
  itemLeft: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 },
  itemImg: {
    width: '42px', height: '42px', borderRadius: '8px',
    objectFit: 'cover', flexShrink: 0, border: '1px solid #f5f5f4',
  },
  itemImgFallback: {
    width: '42px', height: '42px', borderRadius: '8px',
    backgroundColor: '#faf9f7', border: '1px solid #f5f5f4',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#94a3b8', flexShrink: 0,
  },
  itemName: {
    fontSize: '13px', fontWeight: '600', color: '#0f172a',
    margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  itemCategory: {
    fontSize: '11px', color: '#94a3b8', margin: '2px 0 0',
    fontFamily: "'DM Mono', monospace",
  },
  itemQtyBadge: {
    fontSize: '11px', color: '#64748b',
    backgroundColor: '#faf9f7', border: '1px solid #e7e5e4',
    padding: '2px 8px', borderRadius: '6px',
    fontFamily: "'DM Mono', monospace", flexShrink: 0,
  },
  itemPrice: {
    fontSize: '14px', fontWeight: '700', color: '#1e4d3a',
    fontFamily: "'DM Mono', monospace", flexShrink: 0,
  },
  divider: { height: '1px', backgroundColor: '#f5f5f4', margin: '16px 0' },
  totalRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: '13px', fontWeight: '600', color: '#334155', margin: 0 },
  totalSub: { fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' },
  totalPrice: {
    fontSize: '22px', fontWeight: '700', color: '#1e4d3a',
    fontFamily: "'Libre Baskerville', Georgia, serif",
  },

  // Form fields
  fieldGroup: { marginBottom: '16px' },
  fieldLabel: {
    display: 'block', fontSize: '10px', fontWeight: '600',
    color: '#94a3b8', letterSpacing: '0.8px', marginBottom: '8px',
  },
  inputWrap: {
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: '#faf9f7',
    border: '1px solid #e7e5e4', borderRadius: '10px',
    padding: '0 12px', overflow: 'hidden',
  },
  inputIcon: { color: '#94a3b8', display: 'flex', alignItems: 'center', flexShrink: 0 },
  input: {
    flex: 1, padding: '11px 4px',
    backgroundColor: 'transparent', border: 'none', outline: 'none',
    color: '#1e293b', fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    width: '100%', boxSizing: 'border-box',
  },

  errorBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#fef2f2', color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '10px 14px', borderRadius: '8px',
    fontSize: '13px', marginBottom: '16px',
  },

  // Mini summary
  miniSummary: {
    backgroundColor: '#faf9f7',
    border: '1px solid #f5f5f4',
    borderRadius: '10px',
    padding: '14px 16px',
    marginBottom: '16px',
  },
  miniSummaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  miniSummaryLabel: { fontSize: '13px', color: '#64748b' },
  miniSummaryVal: {
    fontSize: '14px', fontWeight: '600', color: '#334155',
    fontFamily: "'DM Mono', monospace",
  },

  // Place order button
  placeOrderBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%', padding: '13px',
    backgroundColor: '#1e4d3a', color: '#fff',
    border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.2s',
  },
  btnSpinner: {
    width: '16px', height: '16px',
    border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },

  // ── Receipt ──────────────────────────────────────────────────────────────────
  receiptPage: {
    minHeight: '100vh',
    backgroundColor: '#f7f5f1',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '32px 24px',
  },
  receiptCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e5e4',
    borderRadius: '16px',
    padding: '36px',
    maxWidth: '480px', width: '100%',
    boxShadow: '0 4px 24px rgba(15,23,42,0.08)',
    animation: 'fadeUp 0.4s ease both',
  },

  // Receipt header
  receiptTop: { textAlign: 'center', marginBottom: '24px' },
  checkCircle: {
    width: '64px', height: '64px', borderRadius: '50%',
    backgroundColor: '#1e4d3a', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  receiptTitle: {
    fontSize: '22px', fontWeight: '700', color: '#0f172a',
    margin: '0 0 6px',
    fontFamily: "'Libre Baskerville', Georgia, serif",
    letterSpacing: '-0.3px',
  },
  receiptSubtitle: { fontSize: '13px', color: '#64748b', margin: '0 0 14px' },
  orderIdPill: {
    display: 'inline-block',
    backgroundColor: '#eef4f1', color: '#475569',
    fontSize: '12px', padding: '5px 14px',
    borderRadius: '20px', border: '1px solid #c5d9ce',
  },

  // Status
  statusBanner: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '10px', padding: '11px 16px',
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '24px',
  },
  statusDot: {
    width: '7px', height: '7px', borderRadius: '50%',
    backgroundColor: '#d97706', flexShrink: 0,
    display: 'inline-block', animation: 'pulse 2s infinite',
  },
  statusText: {
    fontSize: '11px', color: '#92400e',
    fontWeight: '700', letterSpacing: '0.5px',
    fontFamily: "'DM Mono', monospace",
  },

  // Receipt sections
  receiptSection: { marginBottom: '22px' },
  receiptSectionLabel: {
    fontSize: '10px', fontWeight: '700', color: '#94a3b8',
    letterSpacing: '1px', marginBottom: '12px',
    fontFamily: "'DM Mono', monospace",
  },

  // Receipt items
  receiptItems: { display: 'flex', flexDirection: 'column', gap: '10px' },
  receiptItem: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: '12px',
  },
  receiptItemLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  receiptItemImg: {
    width: '36px', height: '36px', borderRadius: '8px',
    objectFit: 'cover', border: '1px solid #f5f5f4', flexShrink: 0,
  },
  receiptItemImgFallback: {
    width: '36px', height: '36px', borderRadius: '8px',
    backgroundColor: '#faf9f7', border: '1px solid #f5f5f4',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#94a3b8', flexShrink: 0,
  },
  receiptItemName: { fontSize: '13px', color: '#334155', fontWeight: '600', margin: 0 },
  receiptItemQty: {
    fontSize: '11px', color: '#94a3b8', margin: '2px 0 0',
    fontFamily: "'DM Mono', monospace",
  },
  receiptItemPrice: {
    fontSize: '13px', fontWeight: '700', color: '#1e4d3a',
    fontFamily: "'DM Mono', monospace",
  },
  receiptDivider: { height: '1px', backgroundColor: '#f5f5f4', margin: '14px 0' },
  receiptTotalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  receiptTotalLabel: { fontSize: '13px', fontWeight: '600', color: '#334155' },
  receiptTotalAmount: {
    fontSize: '22px', fontWeight: '700', color: '#1e4d3a',
    fontFamily: "'Libre Baskerville', Georgia, serif",
  },

  // Receipt delivery
  receiptDetails: { display: 'flex', flexDirection: 'column', gap: '10px' },
  receiptDetail: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    backgroundColor: '#faf9f7', borderRadius: '8px',
    padding: '10px 12px', border: '1px solid #f5f5f4',
  },
  receiptDetailText: { fontSize: '13px', color: '#475569', lineHeight: '1.5' },

  // Actions
  receiptActions: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  trackBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%', padding: '13px',
    backgroundColor: '#1e4d3a', color: '#fff',
    border: 'none', borderRadius: '10px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  shopMoreBtn: {
    width: '100%', padding: '12px',
    backgroundColor: '#fff', color: '#64748b',
    border: '1px solid #e7e5e4', borderRadius: '10px',
    fontSize: '13px', cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  receiptFooter: {
    textAlign: 'center', fontSize: '12px',
    color: '#94a3b8', margin: 0,
  },
};

export default CheckoutPage;