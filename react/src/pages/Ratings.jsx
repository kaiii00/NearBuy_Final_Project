import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitRating, getStoreRatings } from '../services/api';
import { springApi } from '../services/api';

// ── Icons ─────────────────────────────────────────────────────────────────────

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const StarIcon = ({ filled, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const StoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

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

  useEffect(() => { fetchStores(); }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchRatings(selectedStore.id);
      setForm(f => ({ ...f, store_id: selectedStore.id }));
    }
  }, [selectedStore]);

  const fetchStores = async () => {
    try {
      const res = await springApi.get('/stores');
      setStores(res.data);
    } catch (err) { console.error('Failed to load stores', err); }
  };

  const fetchRatings = async (storeId) => {
    try {
      const res = await getStoreRatings(storeId);
      setRatings(res.data.ratings || []);
    } catch (err) { console.error('Failed to load ratings', err); }
  };

  const handleSubmit = async () => {
    if (!form.store_id || form.rating === 0) {
      setError('Please select a store and a rating.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await submitRating(form);
      setSuccess('Rating submitted successfully!');
      setForm(f => ({ ...f, rating: 0, comment: '' }));
      fetchRatings(selectedStore.id);
    } catch {
      setError('Failed to submit. You may have already rated this store.');
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = { 0: '', 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent!' };
  const activeRating = hoveredStar || form.rating;

  const renderDisplayStars = (rating) =>
    [1, 2, 3, 4, 5].map(star => (
      <span key={star} style={{ color: star <= rating ? '#d97706' : '#e7e5e4', fontSize: '15px' }}>★</span>
    ));

  return (
    <div style={s.page}>

      {/* ── Navbar ── */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <button style={s.backBtn} onClick={() => navigate('/buyer/dashboard')}>
            <ArrowLeftIcon />
            <span>Back</span>
          </button>
          <div style={s.logoWrap}>
            <div style={s.logoBox}>N</div>
            <span style={s.logoText}>NearBuy</span>
          </div>
        </div>
        <div style={s.navRight}>
          <span style={s.navTitle}>Rate a Store</span>
        </div>
      </nav>

      <div style={s.main}>

        {/* ── Store Selector ── */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={{ color: '#1e4d3a' }}><StoreIcon /></span>
            <h3 style={s.cardTitle}>Select a Store</h3>
          </div>
          <div style={s.selectWrap}>
            <select
              style={s.select}
              onChange={(e) => {
                const store = stores.find(st => st.id === parseInt(e.target.value));
                setSelectedStore(store || null);
                setSuccess('');
                setError('');
              }}
            >
              <option value="">— Choose a store —</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedStore && (
          <div style={s.twoCol}>

            {/* ── Left: Rating Form ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={s.card}>
                <div style={s.cardHeader}>
                  <span style={{ color: '#d97706' }}><StarIcon filled size={18} /></span>
                  <h3 style={s.cardTitle}>Rate {selectedStore.name}</h3>
                </div>

                {/* Interactive stars */}
                <div style={s.starsRow}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      style={{
                        ...s.starBtn,
                        color: star <= activeRating ? '#d97706' : '#d1d5db',
                        transform: star <= activeRating ? 'scale(1.15)' : 'scale(1)',
                      }}
                      onClick={() => setForm(f => ({ ...f, rating: star }))}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                    >
                      ★
                    </button>
                  ))}
                </div>

                {/* Rating label */}
                <div style={s.ratingLabelWrap}>
                  {activeRating > 0 ? (
                    <span style={s.ratingLabelActive}>{ratingLabels[activeRating]}</span>
                  ) : (
                    <span style={s.ratingLabelEmpty}>Click to select a rating</span>
                  )}
                </div>

                {/* Comment */}
                <div style={s.fieldGroup}>
                  <label style={s.fieldLabel}>COMMENT (OPTIONAL)</label>
                  <textarea
                    style={s.textarea}
                    placeholder="Share your experience with this store..."
                    value={form.comment}
                    onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* Feedback messages */}
                {error && (
                  <div style={s.errorBox}>
                    <AlertIcon /> {error}
                  </div>
                )}
                {success && (
                  <div style={s.successBox}>
                    <CheckCircleIcon /> {success}
                  </div>
                )}

                <button
                  style={{ ...s.submitBtn, opacity: loading ? 0.65 : 1 }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  <StarIcon filled size={15} />
                  {loading ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </div>

            {/* ── Right: Existing Ratings ── */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={{ color: '#1e4d3a' }}><UserIcon /></span>
                <h3 style={s.cardTitle}>Reviews for {selectedStore.name}</h3>
              </div>

              {ratings.length === 0 ? (
                <div style={s.empty}>
                  <div style={s.emptyIcon}><StarIcon size={28} /></div>
                  <p style={s.emptyText}>No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div style={s.ratingsList}>
                  {ratings.map((r, i) => (
                    <div key={i} style={s.ratingItem}>
                      <div style={s.ratingItemTop}>
                        <div style={s.ratingUserRow}>
                          <div style={s.userAvatar}><UserIcon /></div>
                          <span style={s.ratingUser}>User #{r.user_id}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {renderDisplayStars(r.rating)}
                        </div>
                      </div>

                      {r.comment && (
                        <p style={s.ratingComment}>"{r.comment}"</p>
                      )}

                      {r.reply && (
                        <div style={s.replyBox}>
                          <p style={s.replyLabel}>Store Reply</p>
                          <p style={s.replyText}>{r.reply}</p>
                        </div>
                      )}

                      <p style={s.ratingDate}>{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Libre+Baskerville:wght@400;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        select option { background: #fff; color: #1e293b; }
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
    padding: '0 28px',
    height: '62px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  navRight: { display: 'flex', alignItems: 'center' },
  navTitle: {
    fontSize: '14px', fontWeight: '600', color: '#64748b',
    fontFamily: "'DM Sans', sans-serif",
  },
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
    maxWidth: '900px', margin: '0 auto',
    padding: '28px 24px',
    display: 'flex', flexDirection: 'column', gap: '20px',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    alignItems: 'start',
    animation: 'fadeUp 0.35s ease both',
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
    marginBottom: '18px',
  },
  cardTitle: {
    fontSize: '15px', fontWeight: '700', color: '#0f172a',
    margin: 0, fontFamily: "'Libre Baskerville', Georgia, serif",
  },

  // Store select
  selectWrap: { position: 'relative' },
  select: {
    width: '100%', padding: '11px 14px',
    backgroundColor: '#faf9f7',
    border: '1px solid #e7e5e4',
    borderRadius: '10px',
    color: '#1e293b', fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none', cursor: 'pointer',
    appearance: 'none',
  },

  // Stars
  starsRow: {
    display: 'flex', gap: '6px',
    marginBottom: '10px',
  },
  starBtn: {
    background: 'none', border: 'none',
    fontSize: '36px', cursor: 'pointer',
    padding: '0', lineHeight: 1,
    transition: 'color 0.1s, transform 0.1s',
  },
  ratingLabelWrap: { marginBottom: '20px', minHeight: '22px' },
  ratingLabelActive: {
    fontSize: '13px', fontWeight: '600',
    color: '#1e4d3a', backgroundColor: '#eef4f1',
    padding: '3px 12px', borderRadius: '20px',
    border: '1px solid #c5d9ce',
  },
  ratingLabelEmpty: { fontSize: '13px', color: '#94a3b8' },

  // Comment field
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  fieldLabel: {
    fontSize: '10px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.8px',
  },
  textarea: {
    width: '100%', padding: '12px 14px',
    backgroundColor: '#faf9f7',
    border: '1px solid #e7e5e4',
    borderRadius: '10px',
    color: '#1e293b', fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    resize: 'vertical', outline: 'none',
    boxSizing: 'border-box',
    lineHeight: '1.5',
  },

  // Feedback
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#fef2f2', color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '10px 14px', borderRadius: '8px',
    fontSize: '13px', marginBottom: '14px',
  },
  successBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#eef4f1', color: '#1e4d3a',
    border: '1px solid #c5d9ce',
    padding: '10px 14px', borderRadius: '8px',
    fontSize: '13px', marginBottom: '14px',
  },

  // Submit
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%', padding: '12px',
    backgroundColor: '#1e4d3a', color: '#fff',
    border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.2s',
  },

  // Ratings list
  ratingsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  ratingItem: {
    backgroundColor: '#faf9f7',
    border: '1px solid #f5f5f4',
    borderRadius: '10px',
    padding: '14px',
  },
  ratingItemTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '8px',
  },
  ratingUserRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  userAvatar: {
    width: '30px', height: '30px', borderRadius: '8px',
    backgroundColor: '#eef4f1', color: '#1e4d3a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  ratingUser: { fontSize: '13px', fontWeight: '600', color: '#334155' },
  ratingComment: {
    fontSize: '13px', color: '#475569',
    fontStyle: 'italic', margin: '0 0 8px',
    lineHeight: '1.6',
  },
  replyBox: {
    backgroundColor: '#eef4f1',
    borderLeft: '3px solid #1e4d3a',
    padding: '10px 14px',
    borderRadius: '0 6px 6px 0',
    marginBottom: '8px',
  },
  replyLabel: {
    fontSize: '11px', color: '#1e4d3a',
    fontWeight: '600', margin: '0 0 4px',
    letterSpacing: '0.5px',
  },
  replyText: { fontSize: '13px', color: '#475569', margin: 0 },
  ratingDate: { fontSize: '11px', color: '#94a3b8', margin: 0 },

  // Empty
  empty: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '32px 0', gap: '10px',
  },
  emptyIcon: { color: '#d97706' },
  emptyText: { fontSize: '13px', color: '#94a3b8', margin: 0 },
};

export default Ratings;