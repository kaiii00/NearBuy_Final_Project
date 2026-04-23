import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { springApi, phpApi } from '../services/api';

const StoreOwnerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddStore, setShowAddStore] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [storeForm, setStoreForm] = useState({ name: '', address: '', description: '' });
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', category: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchMyStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchProducts(selectedStore.id);
      fetchOrders(selectedStore.id);
      fetchRatings(selectedStore.id);
    }
  }, [selectedStore]);

  const fetchMyStores = async () => {
    try {
      const res = await springApi.get('/stores/my');
      setStores(res.data);
      if (res.data.length > 0) setSelectedStore(res.data[0]);
    } catch (err) {
      console.error('Failed to load stores', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (storeId) => {
    try {
      const res = await springApi.get(`/stores/${storeId}/products/all`);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const fetchOrders = async (storeId) => {
    try {
      const res = await springApi.get(`/orders/store/${storeId}`);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders', err);
    }
  };

  const fetchRatings = async (storeId) => {
    try {
      const res = await phpApi.get(`/ratings/store/${storeId}`);
      setRatings(res.data.ratings || []);
      setRatingSummary({
        average: res.data.average_rating,
        total: res.data.total_ratings,
      });
    } catch (err) {
      console.error('Failed to load ratings', err);
    }
  };

  const handleAddStore = async () => {
    try {
      const res = await springApi.post('/stores', storeForm);
      setStores([...stores, res.data]);
      setShowAddStore(false);
      setStoreForm({ name: '', address: '', description: '' });
    } catch (err) {
      console.error('Failed to create store', err);
    }
  };

  const handleAddProduct = async () => {
    try {
      const res = await springApi.post(`/stores/${selectedStore.id}/products`, productForm);
      setProducts([...products, res.data]);
      setShowAddProduct(false);
      setProductForm({ name: '', description: '', price: '', stock: '', category: '' });
    } catch (err) {
      console.error('Failed to create product', err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await springApi.delete(`/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await springApi.patch(`/orders/${orderId}/status`, { status });
      fetchOrders(selectedStore.id);
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
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

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span key={star} style={{ fontSize: '18px', color: star <= rating ? '#f59e0b' : '#333' }}>★</span>
    ));
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>🛒 NearBuy</h1>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Hi, {user.username}! 🏪</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Store Selector */}
      <div style={styles.storeBar}>
        <div style={styles.storeList}>
          {stores.map(store => (
            <button
              key={store.id}
              style={{ ...styles.storeTab, ...(selectedStore?.id === store.id ? styles.storeTabActive : {}) }}
              onClick={() => setSelectedStore(store)}
            >
              🏪 {store.name}
            </button>
          ))}
          <button style={styles.addStoreBtn} onClick={() => setShowAddStore(true)}>
            + Add Store
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(activeTab === 'products' ? styles.tabActive : {}) }} onClick={() => setActiveTab('products')}>
          📦 Products
        </button>
        <button style={{ ...styles.tab, ...(activeTab === 'orders' ? styles.tabActive : {}) }} onClick={() => setActiveTab('orders')}>
          🛍️ Orders
        </button>
        <button style={{ ...styles.tab, ...(activeTab === 'ratings' ? styles.tabActive : {}) }} onClick={() => setActiveTab('ratings')}>
          ⭐ Ratings
        </button>
      </div>

      <div style={styles.main}>
        {/* Add Store Modal */}
        {showAddStore && (
          <div style={styles.modal}>
            <div style={styles.modalCard}>
              <h2 style={styles.modalTitle}>Add New Store</h2>
              <input style={styles.input} placeholder="Store Name" value={storeForm.name}
                onChange={e => setStoreForm({ ...storeForm, name: e.target.value })} />
              <input style={styles.input} placeholder="Address" value={storeForm.address}
                onChange={e => setStoreForm({ ...storeForm, address: e.target.value })} />
              <input style={styles.input} placeholder="Description" value={storeForm.description}
                onChange={e => setStoreForm({ ...storeForm, description: e.target.value })} />
              <div style={styles.modalButtons}>
                <button style={styles.cancelBtn} onClick={() => setShowAddStore(false)}>Cancel</button>
                <button style={styles.saveBtn} onClick={handleAddStore}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddProduct && (
          <div style={styles.modal}>
            <div style={styles.modalCard}>
              <h2 style={styles.modalTitle}>Add New Product</h2>
              <input style={styles.input} placeholder="Product Name" value={productForm.name}
                onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
              <input style={styles.input} placeholder="Description" value={productForm.description}
                onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
              <input style={styles.input} placeholder="Price" type="number" value={productForm.price}
                onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
              <input style={styles.input} placeholder="Stock" type="number" value={productForm.stock}
                onChange={e => setProductForm({ ...productForm, stock: e.target.value })} />
              <input style={styles.input} placeholder="Category" value={productForm.category}
                onChange={e => setProductForm({ ...productForm, category: e.target.value })} />
              <div style={styles.modalButtons}>
                <button style={styles.cancelBtn} onClick={() => setShowAddProduct(false)}>Cancel</button>
                <button style={styles.saveBtn} onClick={handleAddProduct}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            <div style={styles.tabHeader}>
              <h2 style={styles.sectionTitle}>
                {selectedStore ? `${selectedStore.name} — Products` : 'Select a Store'}
              </h2>
              {selectedStore && (
                <button style={styles.addBtn} onClick={() => setShowAddProduct(true)}>
                  + Add Product
                </button>
              )}
            </div>
            {loading && <div style={styles.loading}>Loading...</div>}
            {!loading && products.length === 0 && (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>📦</div>
                <p style={styles.emptyText}>No products yet. Add your first product!</p>
              </div>
            )}
            <div style={styles.grid}>
              {products.map(product => (
                <div key={product.id} style={styles.productCard}>
                  <h3 style={styles.productName}>{product.name}</h3>
                  <p style={styles.productCategory}>🏷️ {product.category}</p>
                  <p style={styles.productPrice}>💰 ₱{product.price}</p>
                  <p style={styles.productStock}>📦 Stock: {product.stock}</p>
                  <p style={styles.productDesc}>{product.description}</p>
                  <button style={styles.deleteBtn} onClick={() => handleDeleteProduct(product.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            <h2 style={styles.sectionTitle}>Orders</h2>
            {orders.length === 0 && (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>🛍️</div>
                <p style={styles.emptyText}>No orders yet.</p>
              </div>
            )}
            <div style={styles.ordersList}>
              {orders.map(order => (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <span style={styles.orderId}>Order #{order.id}</span>
                    <span style={{ ...styles.orderStatus, backgroundColor: getStatusColor(order.status) }}>
                      {order.status}
                    </span>
                  </div>
                  <p style={styles.orderInfo}>👤 Customer ID: {order.buyerId}</p>
                  <p style={styles.orderTotal}>💰 ₱{order.totalAmount}</p>
                  <p style={styles.orderDate}>📅 {new Date(order.createdAt).toLocaleDateString()}</p>
                  <button style={styles.chatBtn} onClick={() => navigate(`/chat/${order.buyerId}`)}>
                    💬 Chat with Customer
                  </button>
                  <div style={styles.statusButtons}>
                    {order.status === 'PENDING' ? (
                      <>
                        <button style={styles.acceptBtn} onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}>
                          ✅ Accept Order
                        </button>
                        <button style={styles.rejectBtn} onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}>
                          ❌ Reject Order
                        </button>
                      </>
                    ) : (
                      ['PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(status => (
                        <button
                          key={status}
                          style={{ ...styles.statusBtn, backgroundColor: getStatusColor(status), opacity: order.status === status ? 1 : 0.5 }}
                          onClick={() => handleUpdateOrderStatus(order.id, status)}
                        >
                          {status}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <>
            <h2 style={styles.sectionTitle}>⭐ Store Ratings</h2>

            {/* Summary Card */}
            {ratingSummary && (
              <div style={styles.summaryCard}>
                <div style={styles.summaryLeft}>
                  <div style={styles.avgScore}>{ratingSummary.average || '—'}</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {renderStars(Math.round(ratingSummary.average || 0))}
                  </div>
                  <p style={styles.totalRatings}>{ratingSummary.total} total ratings</p>
                </div>
              </div>
            )}

            {ratings.length === 0 ? (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>⭐</div>
                <p style={styles.emptyText}>No ratings yet.</p>
              </div>
            ) : (
              <div style={styles.ratingsList}>
                {ratings.map((r, index) => (
                  <div key={index} style={styles.ratingCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>{renderStars(r.rating)}</div>
                      <span style={styles.ratingDate}>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={styles.ratingComment}>{r.comment || 'No comment left.'}</p>
                  </div>
                ))}
              </div>
            )}
          </>
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
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: '#aaa', fontSize: '14px' },
  logoutBtn: {
    backgroundColor: '#ff4444', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  },
  storeBar: { backgroundColor: '#111', padding: '12px 32px', borderBottom: '1px solid #333' },
  storeList: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  storeTab: {
    backgroundColor: '#252525', color: '#aaa', border: '1px solid #333',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  },
  storeTabActive: { backgroundColor: '#1a2e1a', color: '#4CAF50', border: '1px solid #4CAF50' },
  addStoreBtn: {
    backgroundColor: 'transparent', color: '#4CAF50',
    border: '1px dashed #4CAF50', padding: '8px 16px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  },
  tabs: { display: 'flex', backgroundColor: '#1a1a1a', padding: '0 32px', borderBottom: '1px solid #333' },
  tab: {
    backgroundColor: 'transparent', color: '#888', border: 'none',
    padding: '16px 24px', cursor: 'pointer', fontSize: '14px',
    borderBottom: '2px solid transparent',
  },
  tabActive: { color: '#4CAF50', borderBottom: '2px solid #4CAF50' },
  main: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalCard: {
    backgroundColor: '#1a1a1a', padding: '32px', borderRadius: '16px',
    width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px',
  },
  modalTitle: { color: '#fff', fontSize: '20px', marginBottom: '8px' },
  input: {
    width: '100%', padding: '12px', borderRadius: '8px',
    border: '1px solid #333', backgroundColor: '#252525',
    color: '#fff', fontSize: '14px', boxSizing: 'border-box',
  },
  modalButtons: { display: 'flex', gap: '12px', marginTop: '8px' },
  cancelBtn: { flex: 1, padding: '10px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  saveBtn: { flex: 1, padding: '10px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  tabHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  sectionTitle: { fontSize: '24px', margin: 0, marginBottom: '24px' },
  addBtn: {
    backgroundColor: '#4CAF50', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  },
  loading: { textAlign: 'center', color: '#888', padding: '40px' },
  empty: { textAlign: 'center', padding: '60px' },
  emptyIcon: { fontSize: '64px' },
  emptyText: { color: '#888', fontSize: '18px', marginTop: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' },
  productCard: { backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '20px', border: '1px solid #333' },
  productName: { fontSize: '18px', color: '#fff', marginBottom: '8px' },
  productCategory: { color: '#888', fontSize: '13px', marginBottom: '4px' },
  productPrice: { color: '#4CAF50', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' },
  productStock: { color: '#aaa', fontSize: '13px', marginBottom: '4px' },
  productDesc: { color: '#888', fontSize: '13px', marginBottom: '16px' },
  deleteBtn: {
    backgroundColor: '#ff4444', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', width: '100%',
  },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  orderCard: { backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '20px', border: '1px solid #333' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  orderId: { fontWeight: 'bold', fontSize: '16px' },
  orderStatus: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', color: '#fff' },
  orderInfo: { color: '#aaa', fontSize: '14px', marginBottom: '4px' },
  orderTotal: { color: '#4CAF50', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' },
  orderDate: { color: '#888', fontSize: '13px', marginBottom: '12px' },
  statusButtons: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' },
  statusBtn: { color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
  chatBtn: {
    backgroundColor: '#3b82f6', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', width: '100%', marginTop: '8px',
  },
  acceptBtn: {
    backgroundColor: '#4CAF50', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', flex: 1,
  },
  rejectBtn: {
    backgroundColor: '#ff4444', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', flex: 1,
  },
  summaryCard: {
    backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '24px',
    border: '1px solid #333', marginBottom: '24px', display: 'flex', alignItems: 'center',
  },
  summaryLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  avgScore: { fontSize: '48px', fontWeight: 'bold', color: '#f59e0b' },
  totalRatings: { color: '#888', fontSize: '14px' },
  ratingsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  ratingCard: { backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '20px', border: '1px solid #333' },
  ratingComment: { color: '#aaa', fontSize: '14px' },
  ratingDate: { color: '#555', fontSize: '12px' },
};

export default StoreOwnerDashboard;