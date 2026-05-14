import React from 'react';

const OrderReceiptModal = ({ order, onClose }) => {
  if (!order) return null;

  const subtotal = (order.items || []).reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const deliveryFee = order.deliveryFee || 0;

  const getStatusStyle = (status) => ({
    PENDING:          { bg: '#f59e0b22', color: '#f59e0b', label: 'Pending' },
    CONFIRMED:        { bg: '#3b82f622', color: '#3b82f6', label: 'Confirmed' },
    PREPARING:        { bg: '#8b5cf622', color: '#8b5cf6', label: 'Preparing' },
    OUT_FOR_DELIVERY: { bg: '#06b6d422', color: '#06b6d4', label: 'Out for Delivery' },
    DELIVERED:        { bg: '#10b98122', color: '#10b981', label: 'Delivered' },
    CANCELLED:        { bg: '#ef444422', color: '#ef4444', label: 'Cancelled' },
  }[status] || { bg: '#88888822', color: '#888', label: status });

  const statusStyle = getStatusStyle(order.status);

  const formatDate = (dt) => dt
    ? new Date(dt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Order #${order.id} Receipt</title>
      <style>
        body { font-family: sans-serif; padding: 24px; color: #111; max-width: 480px; margin: 0 auto; }
        h2 { font-size: 18px; margin-bottom: 4px; }
        .meta { font-size: 12px; color: #666; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        td, th { padding: 8px 4px; font-size: 13px; text-align: left; border-bottom: 1px solid #eee; }
        th { font-size: 11px; color: #888; font-weight: 500; }
        .right { text-align: right; }
        .total { font-size: 15px; font-weight: bold; }
        .footer { font-size: 11px; color: #999; margin-top: 24px; text-align: center; }
      </style></head><body>
      <h2>Order Receipt — #${order.id}</h2>
      <div class="meta">${order.storeName} · ${formatDate(order.createdAt)} · Status: ${order.status?.replace(/_/g, ' ')}</div>
      <table>
        <tr><th>Item</th><th>Qty</th><th class="right">Unit</th><th class="right">Subtotal</th></tr>
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
        <tr class="total"><td>Total paid</td><td class="right">₱${Number(order.totalAmount).toFixed(2)}</td></tr>
      </table>
      <div><strong>Delivery address:</strong> ${order.deliveryAddress}</div>
      ${order.deliveryNotes ? `<div style="margin-top:6px"><strong>Notes:</strong> ${order.deliveryNotes}</div>` : ''}
      <div class="footer">NearBuy · Thank you for your order!</div>
      </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.title}>Order Receipt</div>
            <div style={s.storeName}>{order.storeName}</div>
          </div>
          <span style={{ ...s.badge, backgroundColor: statusStyle.bg, color: statusStyle.color }}>
            {statusStyle.label}
          </span>
        </div>

        {/* Order meta */}
        <div style={s.metaGrid}>
          <div style={s.metaCell}>
            <div style={s.metaLabel}>Order ID</div>
            <div style={s.metaValue}>#{order.id}</div>
          </div>
          <div style={s.metaCell}>
            <div style={s.metaLabel}>Date placed</div>
            <div style={s.metaValue}>{formatDate(order.createdAt)}</div>
          </div>
        </div>

        <div style={s.divider} />

        {/* Items */}
        <div style={s.section}>
          <div style={s.sectionLabel}>Items ordered</div>
          {(order.items || []).map(item => (
            <div key={item.id} style={s.itemRow}>
              {item.productImageUrl
                ? <img src={item.productImageUrl} alt={item.productName} style={s.itemImg} />
                : <div style={s.itemImgPlaceholder}>📦</div>
              }
              <div style={s.itemInfo}>
                <div style={s.itemName}>{item.productName}</div>
                <div style={s.itemQty}>
                  x{item.quantity}{item.unit ? ` ${item.unit}` : ''} &nbsp;·&nbsp; ₱{Number(item.unitPrice).toFixed(2)} each
                </div>
              </div>
              <div style={s.itemSubtotal}>₱{Number(item.subtotal).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div style={s.divider} />

        {/* Totals */}
        <div style={s.section}>
          <div style={s.sectionLabel}>Payment summary</div>
          <div style={s.totalRow}>
            <span style={s.totalLabel}>Subtotal</span>
            <span style={s.totalValue}>₱{subtotal.toFixed(2)}</span>
          </div>
          <div style={s.totalRow}>
            <span style={s.totalLabel}>Delivery fee</span>
            <span style={s.totalValue}>₱{deliveryFee.toFixed(2)}</span>
          </div>
          <div style={{ ...s.totalRow, ...s.grandTotalRow }}>
            <span style={s.grandTotalLabel}>Total paid</span>
            <span style={s.grandTotalValue}>₱{Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        <div style={s.divider} />

        {/* Delivery */}
        <div style={s.section}>
          <div style={s.sectionLabel}>Delivery details</div>
          <div style={s.deliveryRow}>
            <span style={s.deliveryIcon}>📍</span>
            <span style={s.deliveryText}>{order.deliveryAddress}</span>
          </div>
          {order.deliveryNotes && (
            <div style={{ ...s.deliveryRow, marginTop: 6 }}>
              <span style={s.deliveryIcon}>📝</span>
              <span style={{ ...s.deliveryText, fontStyle: 'italic' }}>{order.deliveryNotes}</span>
            </div>
          )}
          {order.estimatedDeliveryTime && (
            <div style={{ ...s.deliveryRow, marginTop: 6 }}>
              <span style={s.deliveryIcon}>🕐</span>
              <span style={s.deliveryText}>Est. delivery: {formatDate(order.estimatedDeliveryTime)}</span>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={s.footer}>
          <button style={s.closeBtn} onClick={onClose}>Close</button>
          {order.status !== 'CANCELLED' && (
            <button style={s.printBtn} onClick={handlePrint}>🖨️ Print Receipt</button>
          )}
        </div>
      </div>
    </div>
  );
};

const s = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000, padding: '16px',
  },
  modal: {
    backgroundColor: '#111114', border: '1px solid #1f1f24',
    borderRadius: '16px', width: '100%', maxWidth: '480px',
    maxHeight: '90vh', overflowY: 'auto', fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '20px 20px 16px',
  },
  title: { fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '4px' },
  storeName: { fontSize: '13px', color: '#71717a' },
  badge: {
    fontSize: '11px', fontWeight: '600', padding: '4px 10px',
    borderRadius: '20px', whiteSpace: 'nowrap',
  },
  metaGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '0 20px 16px',
  },
  metaCell: {
    backgroundColor: '#1a1a1f', borderRadius: '8px', padding: '8px 12px',
  },
  metaLabel: { fontSize: '11px', color: '#52525b', marginBottom: '3px' },
  metaValue: { fontSize: '13px', color: '#e4e4e7', fontWeight: '600' },
  divider: { height: '1px', backgroundColor: '#1f1f24' },
  section: { padding: '16px 20px' },
  sectionLabel: {
    fontSize: '10px', fontWeight: '600', color: '#52525b',
    letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px',
  },
  itemRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    paddingBottom: '10px', marginBottom: '10px',
    borderBottom: '1px solid #1a1a1f',
  },
  itemImg: { width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
  itemImgPlaceholder: {
    width: '40px', height: '40px', borderRadius: '8px',
    backgroundColor: '#1a1a1f', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '18px', flexShrink: 0,
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: {
    fontSize: '13px', fontWeight: '500', color: '#e4e4e7',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  itemQty: { fontSize: '12px', color: '#71717a', marginTop: '2px' },
  itemSubtotal: { fontSize: '13px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap' },
  totalRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '5px 0', fontSize: '13px',
  },
  totalLabel: { color: '#71717a' },
  totalValue: { color: '#e4e4e7' },
  grandTotalRow: {
    marginTop: '8px', paddingTop: '12px',
    borderTop: '1px solid #1f1f24', fontSize: '15px',
  },
  grandTotalLabel: { color: '#e4e4e7', fontWeight: '600' },
  grandTotalValue: { color: '#10b981', fontWeight: '700', fontSize: '16px' },
  deliveryRow: { display: 'flex', gap: '8px', alignItems: 'flex-start' },
  deliveryIcon: { fontSize: '14px', flexShrink: 0, marginTop: '1px' },
  deliveryText: { fontSize: '13px', color: '#a1a1aa', lineHeight: '1.6' },
  footer: {
    display: 'flex', gap: '8px', justifyContent: 'flex-end',
    padding: '14px 20px', borderTop: '1px solid #1f1f24',
  },
  closeBtn: {
    padding: '8px 18px', backgroundColor: 'transparent', color: '#71717a',
    border: '1px solid #27272a', borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
  },
  printBtn: {
    padding: '8px 18px', backgroundColor: '#1e2e1e', color: '#22c55e',
    border: '1px solid #22c55e40', borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
  },
};

export default OrderReceiptModal;