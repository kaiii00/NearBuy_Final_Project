import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitRating, getStoreRatings } from '../services/api';
import { springApi } from '../services/api';

const Ratings = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [form, setForm] = useState({ store_id: '', rating: 0, comment: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchRatings(selectedStore.id);
      setForm({ ...form, store_id: selectedStore.id });
    }
  }, [selectedStore]);

  const fetchStores = async () => {
    try {
      const res = await springApi.get('/stores');
      setStores(res.data);
    } catch (err) {
      console.error('Failed to load stores', err);
    }
  };

  const fetchRatings = async (storeId) => {
    try {
      const res = await getStoreRatings(storeId);
      setRatings(res.data.ratings || []);
    } catch (err) {
      console.error('Failed to load ratings', err);
    }
  };
  
  const handleSubmit = async () => {
    if (!form.store_id || form.rating === 0) {
      setError('Please select a store and a rating!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitRating(form);
      setSuccess('Rating submitted successfully! ⭐');
      setForm({ ...form, rating: 0, comment: '' });
      fetchRatings(selectedStore.id);
    } catch (err) {
      setError('Failed to submit rating. You may have already rated this store.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        style={{
          fontSize: interactive ? '36px' : '18px',
          cursor: interactive ? 'pointer' : 'default',
          color: star <= (interactive ? (hoveredStar || form.rating) : rating)
            ? '#f59e0b'
            : '#333',
          transition: 'color 0.1s',
        }}
        onClick={() => interactive && setForm({ ...form, rating: star })}
        onMouseEnter={() => interactive && setHoveredStar(star)}
        onMouseLeave={() => interactive && setHoveredStar(0)}
      >
        ★
      </span>
    ));
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
        <h2 style={styles.title}>⭐ Rate a Store</h2>

        {/* Store Selector */}
        <div style={styles.card}>
          <label style={styles.label}>Select Store</label>
          <select
            style={styles.select}
            onChange={(e) => {
              const store = stores.find(s => s.id === parseInt(e.target.value));
              setSelectedStore(store);
            }}
          >
            <option value="">-- Choose a store --</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>

        {selectedStore && (
          <>
            {/* Rating Form */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Rate {selectedStore.name}</h3>

              <div style={styles.starsContainer}>
                {renderStars(0, true)}
              </div>
              <p style={styles.ratingLabel}>
                {form.rating === 0 && 'Select a rating'}
                {form.rating === 1 && 'Poor 😞'}
                {form.rating === 2 && 'Fair 😐'}
                {form.rating === 3 && 'Good 🙂'}
                {form.rating === 4 && 'Very Good 😊'}
                {form.rating === 5 && 'Excellent! 🤩'}
              </p>

              <textarea
                style={styles.textarea}
                placeholder="Leave a comment (optional)"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                rows={3}
              />

              {error && <div style={styles.error}>{error}</div>}
              {success && <div style={styles.success}>{success}</div>}

              <button
                style={styles.submitBtn}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : '⭐ Submit Rating'}
              </button>
            </div>

            {/* Existing Ratings */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>All Ratings for {selectedStore.name}</h3>
              {ratings.length === 0 ? (
                <p style={styles.empty}>No ratings yet. Be the first!</p>
              ) : (
                <div style={styles.ratingsList}>
                  {ratings.map((r, index) => (
                    <div key={index} style={styles.ratingItem}>
                      <div style={styles.ratingStars}>{renderStars(r.rating)}</div>
                      <p style={styles.ratingComment}>{r.comment || 'No comment'}</p>
                      <p style={styles.ratingDate}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
  backBtn: {
    backgroundColor: '#252525', color: '#fff', border: '1px solid #333',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  },
  main: { padding: '32px', maxWidth: '800px', margin: '0 auto' },
  title: { fontSize: '28px', marginBottom: '24px' },
  card: {
    backgroundColor: '#1a1a1a', borderRadius: '12px',
    padding: '24px', border: '1px solid #333', marginBottom: '24px',
  },
  cardTitle: { fontSize: '18px', marginBottom: '16px', color: '#fff' },
  label: { color: '#aaa', fontSize: '14px', marginBottom: '8px', display: 'block' },
  select: {
    width: '100%', padding: '12px', borderRadius: '8px',
    border: '1px solid #333', backgroundColor: '#252525',
    color: '#fff', fontSize: '14px',
  },
  starsContainer: { display: 'flex', gap: '8px', marginBottom: '8px' },
  ratingLabel: { color: '#aaa', fontSize: '14px', marginBottom: '16px' },
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
    backgroundColor: '#f59e0b', color: '#fff', border: 'none',
    padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '16px', fontWeight: 'bold', width: '100%',
  },
  ratingsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  ratingItem: {
    backgroundColor: '#252525', borderRadius: '8px',
    padding: '16px', border: '1px solid #333',
  },
  ratingStars: { display: 'flex', gap: '4px', marginBottom: '8px' },
  ratingComment: { color: '#aaa', fontSize: '14px', marginBottom: '4px' },
  ratingDate: { color: '#555', fontSize: '12px' },
  empty: { color: '#888', textAlign: 'center', padding: '20px' },
};

export default Ratings;