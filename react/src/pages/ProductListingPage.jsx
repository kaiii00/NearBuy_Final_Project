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

  // eslint-disable-next-line
  useEffect(() => {
    fetchStore();
    fetchProducts();
    fetchCategories();
  }, [storeId]);

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
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await springApi.get(`/stores/${storeId}/products/categories`);
      setCategories(['All', ...res.data]);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    const existing = cart.find(item => item.id === productId);
    if (existing?.quantity === 1) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    }
  };

  const getCartQuantity = (productId) => {
    return cart.find(item => item.id === productId)?.quantity || 0;
  };

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

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <button style={styles.backBtn} onClick={() => {
          const role = localStorage.getItem('role');
          if (role === 'admin') navigate('/admin/dashboard');
          else if (role === 'store_owner') navigate('/store/dashboard');
          else navigate('/buyer/dashboard');
        }}>
        </button>
        <h1 style={styles.logo}>🛒 NearBuy</h1>
        <div style={styles.cartSummary}>
          {getTotalItems() > 0 && (
            <button style={styles.cartBtn} onClick={handleCheckout}>
              🛒 {getTotalItems()} items — ₱{getTotalPrice().toFixed(2)}
            </button>
          )}
        </div>
      </div>

      {/* Store Header */}
      {store && (
        <div style={styles.storeHeader}>
          <h2 style={styles.storeName}>🏪 {store.name}</h2>
          <p style={styles.storeAddress}>📍 {store.address}</p>
          <p style={styles.storeDesc}>{store.description}</p>
        </div>
      )}

      {/* Search and Filter */}
      <div style={styles.filterBar}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={styles.categories}>
          {categories.map(cat => (
            <button
              key={cat}
              style={{
                ...styles.categoryBtn,
                ...(selectedCategory === cat ? styles.categoryBtnActive : {})
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div style={styles.main}>
        {loading && <div style={styles.loading}>Loading products...</div>}

        {!loading && filteredProducts.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📦</div>
            <p style={styles.emptyText}>No products found.</p>
          </div>
        )}

        <div style={styles.grid}>
          {filteredProducts.map(product => (
            <div key={product.id} style={styles.productCard}>
              <div style={styles.productIcon}>🛍️</div>
              <h3 style={styles.productName}>{product.name}</h3>
              <p style={styles.productCategory}>🏷️ {product.category}</p>
              <p style={styles.productDesc}>{product.description}</p>
              <p style={styles.productPrice}>₱{product.price}</p>
              <p style={styles.productStock}>Stock: {product.stock}</p>

              <div style={styles.cartControls}>
                {getCartQuantity(product.id) === 0 ? (
                  <button
                    style={styles.addBtn}
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div style={styles.quantityControls}>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => removeFromCart(product.id)}
                    >
                      -
                    </button>
                    <span style={styles.qty}>{getCartQuantity(product.id)}</span>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => addToCart(product)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Checkout Button */}
      {getTotalItems() > 0 && (
        <div style={styles.floatingCheckout}>
          <button style={styles.checkoutBtn} onClick={handleCheckout}>
            Proceed to Checkout ({getTotalItems()} items) — ₱{getTotalPrice().toFixed(2)}
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0f0f0f', color: '#fff', paddingBottom: '80px' },
  navbar: {
    backgroundColor: '#1a1a1a', padding: '16px 32px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
  },
  backBtn: {
    backgroundColor: 'transparent', color: '#4CAF50',
    border: '1px solid #4CAF50', padding: '8px 16px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  },
  logo: { fontSize: '24px', color: '#4CAF50', margin: 0 },
  cartSummary: { minWidth: '200px', display: 'flex', justifyContent: 'flex-end' },
  cartBtn: {
    backgroundColor: '#4CAF50', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  },
  storeHeader: {
    backgroundColor: '#1a1a1a', padding: '24px 32px',
    borderBottom: '1px solid #333',
  },
  storeName: { fontSize: '24px', color: '#fff', marginBottom: '4px' },
  storeAddress: { color: '#888', fontSize: '14px', marginBottom: '4px' },
  storeDesc: { color: '#aaa', fontSize: '14px' },
  filterBar: { padding: '16px 32px', backgroundColor: '#111', borderBottom: '1px solid #333' },
  searchInput: {
    width: '100%', padding: '12px 16px', borderRadius: '8px',
    border: '1px solid #333', backgroundColor: '#1a1a1a',
    color: '#fff', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px',
  },
  categories: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  categoryBtn: {
    backgroundColor: '#252525', color: '#aaa', border: '1px solid #333',
    padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px',
  },
  categoryBtnActive: { backgroundColor: '#1a2e1a', color: '#4CAF50', border: '1px solid #4CAF50' },
  main: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  loading: { textAlign: 'center', color: '#888', padding: '40px' },
  empty: { textAlign: 'center', padding: '60px' },
  emptyIcon: { fontSize: '64px' },
  emptyText: { color: '#888', fontSize: '18px', marginTop: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' },
  productCard: {
    backgroundColor: '#1a1a1a', borderRadius: '16px',
    padding: '24px', border: '1px solid #333',
  },
  productIcon: { fontSize: '48px', marginBottom: '12px' },
  productName: { fontSize: '18px', color: '#fff', marginBottom: '4px' },
  productCategory: { color: '#888', fontSize: '13px', marginBottom: '4px' },
  productDesc: { color: '#aaa', fontSize: '13px', marginBottom: '8px' },
  productPrice: { color: '#4CAF50', fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' },
  productStock: { color: '#888', fontSize: '12px', marginBottom: '16px' },
  cartControls: { marginTop: '8px' },
  addBtn: {
    backgroundColor: '#4CAF50', color: '#fff', border: 'none',
    padding: '10px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', width: '100%',
  },
  quantityControls: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
  },
  qtyBtn: {
    backgroundColor: '#333', color: '#fff', border: 'none',
    width: '36px', height: '36px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '18px',
  },
  qty: { fontSize: '18px', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' },
  floatingCheckout: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    padding: '16px 32px', backgroundColor: '#1a1a1a',
    borderTop: '1px solid #333',
  },
  checkoutBtn: {
    width: '100%', padding: '14px', backgroundColor: '#4CAF50',
    color: '#fff', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontSize: '16px', fontWeight: 'bold',
  },
};

export default ProductListingPage;