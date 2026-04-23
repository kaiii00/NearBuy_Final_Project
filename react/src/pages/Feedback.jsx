import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitFeedback, getOrderFeedback } from '../services/api';
import { springApi } from '../services/api';

const Feedback = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [form, setForm] = useState({ order_id: '', comment: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      fetchFeedback(selectedOrder.id);
      setForm({ ...form, order_id: selectedOrder.id });
    }
  }, [selectedOrder]);

  const fetchOrders = async () => {
    try {
      const res = await springApi.get('/orders/my');
      const delivered = res.data.filter(o => o.status === 'DELIVERED');
      setOrders(delivered);
    } catch (err) {
      console.error('Failed to load orders', err);
    }
  };

  const fetchFeedback = async (orderId) => {
    try {
      const res = await getOrderFeedback(orderId);
      // If empty array or no data, set to null
      if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
        setExistingFeedback(null);
      } else {
        setExistingFeedback(Array.isArray(res.data) ? res.data[0] : res.data);
      }
    } catch (err) {
      setExistingFeedback(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.order_id || !form.comment.trim()) {
      setError('Please select an order and write a comment!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitFeedback(form);
      setSuccess('Feedback submitted successfully! 🎉');
      setForm({ ...form, comment: '' });
      fetchFeedback(selectedOrder.id);
    } catch (err) {
      setError('Failed to submit feedback. You may have already submitted feedback for this order.');
    } finally {
      setLoading(false);
    }
  };

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
        <button style={styles.backBtn} onClick={() => navigate('/buyer/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.main}>
        <h2 style={styles.title}>💬 Leave Feedback</h2>
        <p style={styles.subtitle}>Only delivered orders can receive feedback</p>

        {/* Order Selector */}
        <div style={styles.card}>
          <label style={styles.label}>Select Delivered Order</label>
          {orders.length === 0 ? (
            <p style={styles.empty}>No delivered orders yet!</p>
          ) : (
            <div style={styles.ordersList}>
              {orders.map(order => (
                <div
                  key={order.id}
                  style={{
                    ...styles.orderItem,
                    ...(selectedOrder?.id === order.id ? styles.orderItemActive : {})
                  }}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div style={styles.orderItemHeader}>
                    <span style={styles.orderId}>Order #{order.id}</span>
                    <span style={{
                      ...styles.orderStatus,
                      backgroundColor: getStatusColor(order.status)
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <p style={styles.orderTotal}>₱{order.totalAmount}</p>
                  <p style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedOrder && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Feedback for Order #{selectedOrder.id}</h3>

            {existingFeedback ? (
              <div style={styles.existingFeedback}>
                <p style={styles.existingLabel}>✅ You already submitted feedback:</p>
                <p style={styles.existingComment}>"{existingFeedback.comment}"</p>
                <p style={styles.existingDate}>
                  {existingFeedback.created_at ? new Date(existingFeedback.created_at.replace(' ', 'T')).toLocaleDateString() : ''}
                </p>
              </div>
            ) : (
              <>
                <textarea
                  style={styles.textarea}
                  placeholder="How was your experience? Tell us about the delivery, product quality, etc."
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  rows={5}
                />

                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <button
                  style={styles.submitBtn}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : '💬 Submit Feedback'}
                </button>
              </>
            )}
          </div>
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
  backBtn: {
    backgroundColor: '#252525', color: '#fff', border: '1px solid #333',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  },
  main: { padding: '32px', maxWidth: '800px', margin: '0 auto' },
  title: { fontSize: '28px', marginBottom: '8px' },
  subtitle: { color: '#888', marginBottom: '24px' },
  card: {
    backgroundColor: '#1a1a1a', borderRadius: '12px',
    padding: '24px', border: '1px solid #333', marginBottom: '24px',
  },
  cardTitle: { fontSize: '18px', marginBottom: '16px', color: '#fff' },
  label: { color: '#aaa', fontSize: '14px', marginBottom: '12px', display: 'block' },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  orderItem: {
    backgroundColor: '#252525', borderRadius: '8px',
    padding: '16px', border: '2px solid #333', cursor: 'pointer',
  },
  orderItemActive: { border: '2px solid #4CAF50', backgroundColor: '#1a2e1a' },
  orderItemHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '8px',
  },
  orderId: { fontWeight: 'bold', fontSize: '16px' },
  orderStatus: {
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: 'bold', color: '#fff',
  },
  orderTotal: { color: '#4CAF50', fontSize: '14px', marginBottom: '4px' },
  orderDate: { color: '#888', fontSize: '12px' },
  textarea: {
    width: '100%', padding: '12px', borderRadius: '8px',
    border: '1px solid #333', backgroundColor: '#252525',
    color: '#fff', fontSize: '14px', resize: 'vertical',
    boxSizing: 'border-box', marginBottom: '16px',
  },
  error: {
    backgroundColor: '#ff444433', color: '#ff4444',
    padding: '10px', borderRadius: '8px', marginBottom: '12px',
  },
  success: {
    backgroundColor: '#4CAF5033', color: '#4CAF50',
    padding: '10px', borderRadius: '8px', marginBottom: '12px',
  },
  submitBtn: {
    backgroundColor: '#4CAF50', color: '#fff', border: 'none',
    padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '16px', fontWeight: 'bold', width: '100%',
  },
  existingFeedback: {
    backgroundColor: '#252525', borderRadius: '8px',
    padding: '16px', border: '1px solid #4CAF50',
  },
  existingLabel: { color: '#4CAF50', marginBottom: '8px', fontSize: '14px' },
  existingComment: { color: '#fff', fontSize: '16px', marginBottom: '8px', fontStyle: 'italic' },
  existingDate: { color: '#888', fontSize: '12px' },
  empty: { color: '#888', textAlign: 'center', padding: '20px' },
};

export default Feedback;