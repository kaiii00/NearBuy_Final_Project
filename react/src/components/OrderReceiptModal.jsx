import React from 'react';

const OrderReceiptModal = ({ order, onClose }) => {
  if (!order) return null;

  const subtotal = (order.items || []).reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const deliveryFee = order.deliveryFee || 0;

  const getStatusStyle = (status) => ({
    PENDING:          { bg: '#f59e0b18', color: '#f59e0b', border: '#f59e0b40', label: 'Pending' },
    CONFIRMED:        { bg: '#3b82f618', color: '#3b82f6', border: '#3b82f640', label: 'Confirmed' },
    PREPARING:        { bg: '#8b5cf618', color: '#8b5cf6', border: '#8b5cf640', label: 'Preparing' },
    OUT_FOR_DELIVERY: { bg: '#06b6d418', color: '#06b6d4', border: '#06b6d440', label: 'Out for Delivery' },
    DELIVERED:        { bg: '#eef4f1',   color: '#1e4d3a', border: '#c5d9ce',   label: 'Delivered' },
    CANCELLED:        { bg: '#fef2f2',   color: '#dc2626', border: '#fecaca',   label: 'Cancelled' },
  }[status] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: status });

  const statusStyle = getStatusStyle(order.status);

  const formatDate = (dt) => dt
    ? new Date(dt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Order #${order.id} Receipt</title>
      <style>
        body { font-family: 'DM Sans', sans-serif; padding: 32px; color: #1e293b; max-width: 480px; margin: 0 auto; background: #fff; }
        .logo { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        h2 { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
        .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        td, th { padding: 8px 4px; font-size: 13px; text-align: left; border-bottom: 1px solid #e7e5e4; }
        th { font-size: 10px; color: #94a3b8; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; }
        .right { text-align: right; }
        .grand { font-size: 15px; font-weight: 700; color: #1e4d3a; }
        .footer { font-size: 11px; color: #94a3b8; margin-top: 28px; text-align: center; border-top: 1px solid #e7e5e4; padding-top: 16px; }
      </style></head><body>
      <div class="logo">NearBuy</div>
      <h2>Order Receipt — #${order.id}</h2>
      <div class="meta">${order.storeName} · ${formatDate(order.createdAt)} · ${order.status?.replace(/_/g, ' ')}</div>
      <table>
        <tr><th>Item</th><th>Qty</th><th class="right">Unit price</th><th class="right">Subtotal</th></tr>
        ${(order.items || []).map(item => `
          <tr>
            <td>${item.productName}</td>
            <td>${item.quantity}${item.unit ? ' ' + item.unit : ''}</td>
            <td class="right">₱${Number(item.unitPrice).toFixed(2)}</td>
            <td class="right">₱${Number(item.subtotal).toFixed(2)}</td>
          </tr>`).join('')}
      </table>
      <table>
        <tr><td>Subtotal</td><td class="right">₱${subtotal.toFixed(2)}</td></tr>
        <tr><td>Delivery fee</td><td class="right">₱${deliveryFee.toFixed(2)}</td></tr>
        <tr class="grand"><td>Total paid</td><td class="right">₱${Number(order.totalAmount).toFixed(2)}</td></tr>
      </table>
      <div><strong>Delivery address:</strong> ${order.deliveryAddress}</div>
      ${order.deliveryNotes ? `<div style="margin-top:6px"><strong>Notes:</strong> ${order.deliveryNotes}</div>` : ''}
      <div class="footer">NearBuy · Thank you for your order!</div>
      </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Libre+Baskerville:wght@400;700&family=DM+Mono:wght@400;500&display=swap');

        .receipt-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 16px;
          backdrop-filter: blur(4px);
        }

        .receipt-modal {
          background-color: #ffffff;
          border: 1px solid #e7e5e4;
          border-radius: 16px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          font-family: 'DM Sans', system-ui, sans-serif;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
        }

        .receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 20px 16px;
          border-bottom: 1px solid #f5f5f4;
        }

        .receipt-header-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .receipt-title {
          font-family: 'Libre Baskerville', Georgia, serif;
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.2px;
        }

        .receipt-store {
          font-size: 13px;
          color: #64748b;
        }

        .receipt-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid;
          white-space: nowrap;
          letter-spacing: 0.3px;
        }

        .receipt-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 16px 20px;
          background-color: #faf9f7;
          border-bottom: 1px solid #f5f5f4;
        }

        .receipt-meta-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .receipt-meta-label {
          font-size: 10px;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        .receipt-meta-value {
          font-size: 13px;
          color: #334155;
          font-weight: 600;
          font-family: 'DM Mono', monospace;
        }

        .receipt-divider {
          height: 1px;
          background-color: #f5f5f4;
        }

        .receipt-section {
          padding: 16px 20px;
        }

        .receipt-section-label {
          font-size: 10px;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .receipt-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 10px;
          margin-bottom: 10px;
          border-bottom: 1px solid #f5f5f4;
        }

        .receipt-item-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .receipt-item-img {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
          border: 1px solid #e7e5e4;
        }

        .receipt-item-img-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background-color: #faf9f7;
          border: 1px solid #e7e5e4;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .receipt-item-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .receipt-item-qty {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .receipt-item-subtotal {
          font-size: 13px;
          font-weight: 600;
          color: #1e4d3a;
          white-space: nowrap;
          margin-left: auto;
        }

        .receipt-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
          font-size: 13px;
        }

        .receipt-total-label { color: #64748b; }
        .receipt-total-value { color: #334155; font-weight: 500; }

        .receipt-grand-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0 0;
          margin-top: 8px;
          border-top: 1px solid #e7e5e4;
        }

        .receipt-grand-label {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .receipt-grand-value {
          font-size: 16px;
          font-weight: 700;
          color: #1e4d3a;
        }

        .receipt-delivery-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .receipt-delivery-row:last-child { margin-bottom: 0; }

        .receipt-delivery-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background-color: #eef4f1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #1e4d3a;
        }

        .receipt-delivery-text {
          font-size: 13px;
          color: #64748b;
          line-height: 1.6;
          padding-top: 4px;
        }

        .receipt-delivery-text.italic { font-style: italic; }

        .receipt-footer {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          padding: 14px 20px;
          border-top: 1px solid #f5f5f4;
          background-color: #faf9f7;
          border-radius: 0 0 16px 16px;
        }

        .receipt-close-btn {
          padding: 9px 18px;
          background-color: #ffffff;
          color: #64748b;
          border: 1px solid #e7e5e4;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 500;
          transition: all 0.15s;
        }

        .receipt-close-btn:hover {
          background-color: #f5f5f4;
          border-color: #d6d3d1;
        }

        .receipt-print-btn {
          padding: 9px 18px;
          background-color: #1e4d3a;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', system-ui, sans-serif;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }

        .receipt-print-btn:hover {
          background-color: #174032;
        }
      `}</style>

      <div className="receipt-overlay" onClick={onClose}>
        <div className="receipt-modal" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="receipt-header">
            <div className="receipt-header-left">
              <div className="receipt-title">Order Receipt</div>
              <div className="receipt-store">{order.storeName}</div>
            </div>
            <span
              className="receipt-badge"
              style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, borderColor: statusStyle.border }}
            >
              {statusStyle.label}
            </span>
          </div>

          {/* Meta */}
          <div className="receipt-meta-grid">
            <div className="receipt-meta-cell">
              <span className="receipt-meta-label">Order ID</span>
              <span className="receipt-meta-value">#{order.id}</span>
            </div>
            <div className="receipt-meta-cell">
              <span className="receipt-meta-label">Date placed</span>
              <span className="receipt-meta-value" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px' }}>
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          <div className="receipt-divider" />

          {/* Items */}
          <div className="receipt-section">
            <div className="receipt-section-label">Items ordered</div>
            {(order.items || []).map(item => (
              <div key={item.id} className="receipt-item-row">
                {item.productImageUrl
                  ? <img src={item.productImageUrl} alt={item.productName} className="receipt-item-img" />
                  : (
                    <div className="receipt-item-img-placeholder">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      </svg>
                    </div>
                  )
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="receipt-item-name">{item.productName}</div>
                  <div className="receipt-item-qty">
                    x{item.quantity}{item.unit ? ` ${item.unit}` : ''} &nbsp;·&nbsp; ₱{Number(item.unitPrice).toFixed(2)} each
                  </div>
                </div>
                <div className="receipt-item-subtotal">₱{Number(item.subtotal).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="receipt-divider" />

          {/* Totals */}
          <div className="receipt-section">
            <div className="receipt-section-label">Payment summary</div>
            <div className="receipt-total-row">
              <span className="receipt-total-label">Subtotal</span>
              <span className="receipt-total-value">₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="receipt-total-row">
              <span className="receipt-total-label">Delivery fee</span>
              <span className="receipt-total-value">₱{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="receipt-grand-row">
              <span className="receipt-grand-label">Total paid</span>
              <span className="receipt-grand-value">₱{Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div className="receipt-divider" />

          {/* Delivery */}
          <div className="receipt-section">
            <div className="receipt-section-label">Delivery details</div>
            <div className="receipt-delivery-row">
              <div className="receipt-delivery-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <span className="receipt-delivery-text">{order.deliveryAddress}</span>
            </div>
            {order.deliveryNotes && (
              <div className="receipt-delivery-row">
                <div className="receipt-delivery-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <span className="receipt-delivery-text italic">{order.deliveryNotes}</span>
              </div>
            )}
            {order.estimatedDeliveryTime && (
              <div className="receipt-delivery-row">
                <div className="receipt-delivery-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <span className="receipt-delivery-text">Est. delivery: {formatDate(order.estimatedDeliveryTime)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="receipt-footer">
            <button className="receipt-close-btn" onClick={onClose}>Close</button>
            {order.status !== 'CANCELLED' && (
              <button className="receipt-print-btn" onClick={handlePrint}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Print Receipt
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default OrderReceiptModal;