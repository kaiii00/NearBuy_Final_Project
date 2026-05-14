import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../services/api';

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
    if (!deliveryInfo.address) { setError('Please enter a delivery address'); return; }
    setLoading(true);
    setError('');
    try {
      const orderData = {
        storeId: parseInt(storeId),
        deliveryAddress: deliveryInfo.address,
        contactNumber: deliveryInfo.contact,
        notes: deliveryInfo.notes,
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

  // ── Receipt Screen ──────────────────────────────────────────────────────────
  if (orderResult) {
    const total = orderResult.cartSnapshot.reduce((s, i) => s + i.price * i.quantity, 0);
    return (
      <div style={styles.receiptBg}>
        <div style={styles.receiptCard}>
          <div style={styles.receiptHeader}>
            <div style={styles.receiptCheck}>✓</div>
            <h2 style={styles.receiptTitle}>Order Confirmed!</h2>
            <p style={styles.receiptSubtitle}>Your order has been placed and is being processed.</p>
            <div style={styles.receiptOrderId}>Order #{orderResult.id || '—'}</div>
          </div>

          <div style={styles.statusBanner}>
            <span style={styles.statusDot}></span>
            <span style={styles.statusText}>PENDING — Waiting for store confirmation</span>
          </div>

          <div style={styles.receiptSection}>
            <p style={styles.receiptSectionLabel}>ITEMS ORDERED</p>
            <div style={styles.receiptItems}>
              {orderResult.cartSnapshot.map(item => (
                <div key={item.id} style={styles.receiptItem}>
                  <div style={styles.receiptItemLeft}>
                    <span style={styles.receiptItemName}>{item.name}</span>
                    <span style={styles.receiptItemQty}>× {item.quantity}</span>
                  </div>
                  <span style={styles.receiptItemPrice}>₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={styles.receiptDivider} />
            <div style={styles.receiptTotal}>
              <span>Total</span>
              <span style={styles.receiptTotalAmount}>₱{total.toFixed(2)}</span>
            </div>
          </div>

          <div style={styles.receiptSection}>
            <p style={styles.receiptSectionLabel}>DELIVERY DETAILS</p>
            <div style={styles.receiptDetail}>
              <span style={styles.receiptDetailIcon}>📍</span>
              <span style={styles.receiptDetailText}>{orderResult.deliveryInfo.address}</span>
            </div>
            {orderResult.deliveryInfo.contact && (
              <div style={styles.receiptDetail}>
                <span style={styles.receiptDetailIcon}>📞</span>
                <span style={styles.receiptDetailText}>{orderResult.deliveryInfo.contact}</span>
              </div>
            )}
            {orderResult.deliveryInfo.notes && (
              <div style={styles.receiptDetail}>
                <span style={styles.receiptDetailIcon}>📝</span>
                <span style={styles.receiptDetailText}>{orderResult.deliveryInfo.notes}</span>
              </div>
            )}
          </div>

          <div style={styles.receiptActions}>
            <button style={styles.trackBtn} onClick={() => navigate('/buyer/dashboard')}>
              Track My Order →
            </button>
            <button style={styles.shopMoreBtn} onClick={() => navigate('/buyer/dashboard')}>
              Continue Shopping
            </button>
          </div>

          <p style={styles.receiptFooter}>🛒 Thank you for shopping with NearBuy!</p>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    );
  }

  // ── Checkout Form ───────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h1 style={styles.logo}>🛒 NearBuy</h1>
        <div />
      </div>

      <div style={styles.main}>
        <h2 style={styles.pageTitle}>Checkout</h2>

        <div style={styles.layout}>
          {/* Order Summary */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Order Summary</h3>
            {cart.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Your cart is empty.</p>
            ) : (
              <>
                <div style={styles.orderItems}>
                  {cart.map(item => (
                    <div key={item.id} style={styles.orderItem}>
                      <div style={styles.itemInfo}>
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name}
                            style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                        )}
                        <div>
                          <p style={styles.itemName}>{item.name}</p>
                          <p style={styles.itemCategory}>{item.category}</p>
                        </div>
                        <span style={styles.itemQty}>×{item.quantity}</span>
                      </div>
                      <span style={styles.itemPrice}>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div style={styles.divider} />
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Total ({getTotalItems()} items)</span>
                  <span style={styles.totalPrice}>₱{getTotalPrice().toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Delivery Info */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Delivery Information</h3>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Delivery Address *</label>
              <input style={styles.input} type="text" placeholder="Enter your delivery address"
                value={deliveryInfo.address} onChange={e => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Contact Number</label>
              <input style={styles.input} type="text" placeholder="Enter your contact number"
                value={deliveryInfo.contact} onChange={e => setDeliveryInfo({ ...deliveryInfo, contact: e.target.value })} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Order Notes (optional)</label>
              <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                placeholder="Any special instructions?"
                value={deliveryInfo.notes} onChange={e => setDeliveryInfo({ ...deliveryInfo, notes: e.target.value })} />
            </div>

            <button style={{ ...styles.placeOrderBtn, opacity: loading ? 0.7 : 1 }}
              onClick={handlePlaceOrder} disabled={loading || cart.length === 0}>
              {loading ? '⏳ Placing Order...' : `Place Order — ₱${getTotalPrice().toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0f0f0f', color: '#fff' },
  navbar: { backgroundColor: '#1a1a1a', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' },
  backBtn: { backgroundColor: 'transparent', color: '#4CAF50', border: '1px solid #4CAF50', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  logo: { fontSize: '24px', color: '#4CAF50', margin: 0 },
  main: { padding: '32px', maxWidth: '1000px', margin: '0 auto' },
  pageTitle: { fontSize: '28px', marginBottom: '32px' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' },
  section: { backgroundColor: '#1a1a1a', borderRadius: '16px', padding: '24px', border: '1px solid #333' },
  sectionTitle: { fontSize: '18px', color: '#fff', marginBottom: '20px' },
  orderItems: { display: 'flex', flexDirection: 'column', gap: '12px' },
  orderItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemInfo: { display: 'flex', gap: '10px', alignItems: 'center' },
  itemName: { color: '#fff', fontSize: '14px', margin: 0 },
  itemCategory: { color: '#888', fontSize: '11px', margin: 0 },
  itemQty: { color: '#888', fontSize: '13px' },
  itemPrice: { color: '#4CAF50', fontSize: '14px', fontWeight: 'bold' },
  divider: { height: '1px', backgroundColor: '#333', margin: '16px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#aaa', fontSize: '16px' },
  totalPrice: { color: '#4CAF50', fontSize: '24px', fontWeight: 'bold' },
  error: { backgroundColor: '#ff444433', color: '#ff6b6b', padding: '10px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', border: '1px solid #ff444455' },
  inputGroup: { marginBottom: '16px' },
  label: { color: '#aaa', fontSize: '14px', marginBottom: '6px', display: 'block' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#252525', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  placeOrderBtn: { width: '100%', padding: '14px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },

  // Receipt
  receiptBg: { minHeight: '100vh', backgroundColor: '#0a0a0c', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' },
  receiptCard: { backgroundColor: '#111114', border: '1px solid #1f1f24', borderRadius: '20px', padding: '40px', maxWidth: '480px', width: '100%' },
  receiptHeader: { textAlign: 'center', marginBottom: '24px' },
  receiptCheck: { width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#fff', fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 'bold' },
  receiptTitle: { fontSize: '24px', fontWeight: '700', color: '#fff', margin: '0 0 8px' },
  receiptSubtitle: { fontSize: '14px', color: '#71717a', margin: '0 0 12px' },
  receiptOrderId: { display: 'inline-block', backgroundColor: '#1f1f24', color: '#a1a1aa', fontSize: '12px', padding: '4px 12px', borderRadius: '20px' },
  statusBanner: { backgroundColor: '#f59e0b15', border: '1px solid #f59e0b30', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', flexShrink: 0, animation: 'pulse 2s infinite', display: 'inline-block' },
  statusText: { fontSize: '12px', color: '#f59e0b', fontWeight: '600', letterSpacing: '0.5px' },
  receiptSection: { marginBottom: '24px' },
  receiptSectionLabel: { fontSize: '10px', fontWeight: '700', color: '#52525b', letterSpacing: '1px', marginBottom: '12px' },
  receiptItems: { display: 'flex', flexDirection: 'column', gap: '10px' },
  receiptItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  receiptItemLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  receiptItemName: { fontSize: '14px', color: '#e4e4e7' },
  receiptItemQty: { fontSize: '12px', color: '#52525b', backgroundColor: '#1f1f24', padding: '2px 6px', borderRadius: '4px' },
  receiptItemPrice: { fontSize: '14px', color: '#4CAF50', fontWeight: '600' },
  receiptDivider: { height: '1px', backgroundColor: '#1f1f24', margin: '14px 0' },
  receiptTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px', color: '#a1a1aa', fontWeight: '600' },
  receiptTotalAmount: { fontSize: '22px', color: '#4CAF50', fontWeight: '700' },
  receiptDetail: { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' },
  receiptDetailIcon: { fontSize: '16px', flexShrink: 0 },
  receiptDetailText: { fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5' },
  receiptActions: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  trackBtn: { width: '100%', padding: '13px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  shopMoreBtn: { width: '100%', padding: '13px', backgroundColor: 'transparent', color: '#71717a', border: '1px solid #27272a', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' },
  receiptFooter: { textAlign: 'center', fontSize: '13px', color: '#3f3f46', margin: 0 },
};

export default CheckoutPage;