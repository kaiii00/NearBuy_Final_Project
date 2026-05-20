import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitFeedback, getOrderFeedback } from '../services/api';
import { springApi } from '../services/api';

const Feedback = ({ embedded = false }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [form, setForm] = useState({ order_id: '', comment: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchOrders(); }, []);

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
      setSuccess('Feedback submitted successfully!');
      setForm({ ...form, comment: '' });
      fetchFeedback(selectedOrder.id);
    } catch (err) {
      setError('Failed to submit feedback. You may have already submitted feedback for this order.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => ({
    PENDING: '#f59e0b',
    CONFIRMED: '#3b82f6',
    PREPARING: '#8b5cf6',
    OUT_FOR_DELIVERY: '#06b6d4',
    DELIVERED: '#10b981',
    CANCELLED: '#ef4444',
  }[status] || '#888');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Libre+Baskerville:wght@400;700&family=DM+Mono:wght@400;500&display=swap');

        .fb-root * { box-sizing: border-box; }

        .fb-root {
          min-height: 100vh;
          background-color: #f7f5f1;
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #1e293b;
        }

        .fb-navbar {
          background-color: #ffffff;
          border-bottom: 1px solid #e7e5e4;
          padding: 14px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .fb-logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .fb-logo-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background-color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
        }

        .fb-logo-text {
          font-family: 'Libre Baskerville', Georgia, serif;
          font-size: 17px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.3px;
        }

        .fb-back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #ffffff;
          color: #64748b;
          border: 1px solid #e7e5e4;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', system-ui, sans-serif;
          transition: all 0.15s;
        }

        .fb-back-btn:hover {
          background-color: #faf9f7;
          border-color: #d6d3d1;
        }

        .fb-main {
          padding: 32px 24px;
          max-width: 760px;
          margin: 0 auto;
        }

        .fb-page-title {
          font-family: 'Libre Baskerville', Georgia, serif;
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.3px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .fb-page-title-icon {
          color: #1e4d3a;
          display: flex;
          align-items: center;
        }

        .fb-page-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 28px;
        }

        .fb-card {
          background-color: #ffffff;
          border: 1px solid #e7e5e4;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .fb-card-title {
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          margin: 0 0 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .fb-label {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          display: block;
          margin-bottom: 12px;
        }

        .fb-orders-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .fb-order-item {
          background-color: #faf9f7;
          border: 1px solid #e7e5e4;
          border-radius: 10px;
          padding: 14px 16px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .fb-order-item:hover {
          border-color: #c5d9ce;
          background-color: #f0f7f4;
        }

        .fb-order-item.active {
          border-color: #1e4d3a;
          background-color: #eef4f1;
          border-width: 1.5px;
        }

        .fb-order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .fb-order-id {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          color: #1e4d3a;
          background-color: #eef4f1;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .fb-order-status {
          font-size: 10px;
          font-weight: 700;
          color: #ffffff;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.3px;
        }

        .fb-order-total {
          font-size: 14px;
          font-weight: 600;
          color: #1e4d3a;
          margin: 0 0 2px;
        }

        .fb-order-date {
          font-size: 11px;
          color: #94a3b8;
          margin: 0;
        }

        .fb-textarea {
          width: 100%;
          padding: 12px 14px;
          background-color: #faf9f7;
          border: 1px solid #e7e5e4;
          border-radius: 10px;
          color: #1e293b;
          font-size: 14px;
          font-family: 'DM Sans', system-ui, sans-serif;
          resize: vertical;
          outline: none;
          margin-bottom: 16px;
          transition: border-color 0.15s;
          line-height: 1.6;
        }

        .fb-textarea:focus {
          border-color: #1e4d3a;
        }

        .fb-textarea::placeholder {
          color: #94a3b8;
        }

        .fb-error {
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .fb-success {
          background-color: #eef4f1;
          color: #1e4d3a;
          border: 1px solid #c5d9ce;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .fb-submit-btn {
          width: 100%;
          padding: 13px;
          background-color: #1e4d3a;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', system-ui, sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.1px;
        }

        .fb-submit-btn:hover:not(:disabled) {
          background-color: #174032;
        }

        .fb-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .fb-existing {
          background-color: #eef4f1;
          border: 1px solid #c5d9ce;
          border-radius: 10px;
          padding: 16px;
        }

        .fb-existing-label {
          font-size: 11px;
          font-weight: 600;
          color: #1e4d3a;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0 0 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .fb-existing-comment {
          font-size: 14px;
          color: #334155;
          font-style: italic;
          margin: 0 0 8px;
          line-height: 1.6;
        }

        .fb-existing-date {
          font-size: 11px;
          color: #94a3b8;
          margin: 0;
        }

        .fb-empty {
          text-align: center;
          padding: 28px 0;
          color: #94a3b8;
          font-size: 13px;
        }
      `}</style>

      <div className="fb-root">
        {!embedded && (
          <nav className="fb-navbar">
            <div className="fb-logo-row">
              <div className="fb-logo-box">N</div>
              <span className="fb-logo-text">NearBuy</span>
            </div>
            <button className="fb-back-btn" onClick={() => navigate('/buyer/dashboard')}>
              ← Back to Dashboard
            </button>
          </nav>
        )}

        <div className={embedded ? '' : 'fb-main'} style={embedded ? { padding: 0 } : {}}>
          {!embedded && (
            <>
              <h2 className="fb-page-title">
                <span className="fb-page-title-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </span>
                Leave Feedback
              </h2>
              <p className="fb-page-subtitle">Only delivered orders can receive feedback</p>
            </>
          )}

          {/* Order Selector */}
          <div className="fb-card">
            <h3 className="fb-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#1e4d3a' }}>
                <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Select Delivered Order
            </h3>
            {orders.length === 0 ? (
              <p className="fb-empty">No delivered orders yet.</p>
            ) : (
              <div className="fb-orders-list">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className={`fb-order-item ${selectedOrder?.id === order.id ? 'active' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="fb-order-header">
                      <span className="fb-order-id">#{order.id}</span>
                      <span
                        className="fb-order-status"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="fb-order-total">₱{order.totalAmount}</p>
                    <p className="fb-order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback Form */}
          {selectedOrder && (
            <div className="fb-card">
              <h3 className="fb-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#1e4d3a' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Feedback for Order #{selectedOrder.id}
              </h3>

              {existingFeedback ? (
                <div className="fb-existing">
                  <p className="fb-existing-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Feedback submitted
                  </p>
                  <p className="fb-existing-comment">"{existingFeedback.comment}"</p>
                  <p className="fb-existing-date">
                    {existingFeedback.created_at
                      ? new Date(existingFeedback.created_at.replace(' ', 'T')).toLocaleDateString()
                      : ''}
                  </p>
                </div>
              ) : (
                <>
                  <label className="fb-label">Your Comment</label>
                  <textarea
                    className="fb-textarea"
                    placeholder="How was your experience? Tell us about the delivery, product quality, etc."
                    value={form.comment}
                    onChange={e => setForm({ ...form, comment: e.target.value })}
                    rows={5}
                  />
                  {error && <div className="fb-error">{error}</div>}
                  {success && (
                    <div className="fb-success">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      {success}
                    </div>
                  )}
                  <button className="fb-submit-btn" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Feedback;