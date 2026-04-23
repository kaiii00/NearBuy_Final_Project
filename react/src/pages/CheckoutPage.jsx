import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    contact: '',
    notes: '',
  });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const savedStoreId = localStorage.getItem('storeId');
    setCart(savedCart);
    setStoreId(savedStoreId);
    if (user.address) setDeliveryInfo(prev => ({ ...prev, address: user.address }));
    if (user.contact) setDeliveryInfo(prev => ({ ...prev, contact: user.contact }));
  }, []);

  const getTotalPrice = () =>
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getTotalItems = () =>
    cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!deliveryInfo.address) {
      setError('Please enter a delivery address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const orderData = {
        storeId: parseInt(storeId),
        deliveryAddress: deliveryInfo.address,
        contactNumber: deliveryInfo.contact,
        notes: deliveryInfo.notes,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };
      await placeOrder(orderData);
      localStorage.removeItem('cart');
      localStorage.removeItem('storeId');
      setSuccess(true);
    } catch (err) {
      setError('Failed to place order. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>🎉</div>
          <h2 style={styles.successTitle}>Order Placed Successfully!</h2>
          <p style={styles.successText}>
            Your order has been placed and is being processed.
          </p>
          <button
            style={styles.successBtn}
            onClick={() => navigate('/buyer/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 style={styles.logo}>🛒 NearBuy</h1>
        <div />
      </div>

      <div style={styles.main}>
        <h2 style={styles.pageTitle}>Checkout</h2>

        <div style={styles.layout}>
          {/* Left — Order Summary */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Order Summary</h3>
            <div style={styles.orderItems}>
              {cart.map(item => (
                <div key={item.id} style={styles.orderItem}>
                  <div style={styles.itemInfo}>
                    <span style={styles.itemName}>{item.name}</span>
                    <span style={styles.itemQty}>x{item.quantity}</span>
                  </div>
                  <span style={styles.itemPrice}>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div style={styles.divider} />
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total ({getTotalItems()} items)</span>
              <span style={styles.totalPrice}>₱{getTotalPrice().toFixed(2)}</span>
            </div>
          </div>

          {/* Right — Delivery Info */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Delivery Information</h3>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Delivery Address *</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Enter your delivery address"
                value={deliveryInfo.address}
                onChange={e => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Contact Number</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Enter your contact number"
                value={deliveryInfo.contact}
                onChange={e => setDeliveryInfo({ ...deliveryInfo, contact: e.target.value })}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Order Notes (optional)</label>
              <textarea
                style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                placeholder="Any special instructions?"
                value={deliveryInfo.notes}
                onChange={e => setDeliveryInfo({ ...deliveryInfo, notes: e.target.value })}
              />
            </div>

            <button
              style={styles.placeOrderBtn}
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? 'Placing Order...' : `Place Order — ₱${getTotalPrice().toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f0f0f',
    color: '#fff',
  },
  navbar: {
    backgroundColor: '#1a1a1a',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
  },
  backBtn: {
    backgroundColor: 'transparent',
    color: '#4CAF50',
    border: '1px solid #4CAF50',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  logo: { fontSize: '24px', color: '#4CAF50', margin: 0 },
  main: {
    padding: '32px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  pageTitle: {
    fontSize: '28px',
    marginBottom: '32px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #333',
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#fff',
    marginBottom: '20px',
  },
  orderItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  itemName: { color: '#fff', fontSize: '14px' },
  itemQty: { color: '#888', fontSize: '13px' },
  itemPrice: { color: '#4CAF50', fontSize: '14px', fontWeight: 'bold' },
  divider: {
    height: '1px',
    backgroundColor: '#333',
    margin: '16px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { color: '#aaa', fontSize: '16px' },
  totalPrice: { color: '#4CAF50', fontSize: '24px', fontWeight: 'bold' },
  error: {
    backgroundColor: '#ff4444',
    color: '#fff',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  inputGroup: { marginBottom: '16px' },
  label: {
    color: '#aaa',
    fontSize: '14px',
    marginBottom: '6px',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#252525',
    color: '#fff',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  placeOrderBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
  },
  successCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
  },
  successIcon: { fontSize: '80px' },
  successTitle: { fontSize: '28px', color: '#4CAF50' },
  successText: { color: '#888', fontSize: '16px' },
  successBtn: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '16px',
  },
};

export default CheckoutPage;