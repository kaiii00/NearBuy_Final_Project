import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { springApi, phpApi } from '../services/api';

// ── SVG Icons (same set as StoreOwnerDashboard) ──────────────────────────────

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const MessageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const PackageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const TruckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

// ── Owner Avatar ──────────────────────────────────────────────────────────────

const OwnerAvatar = ({ ownerId, fallback }) => {
  const [photo, setPhoto] = React.useState(null);
  React.useEffect(() => {
    if (!ownerId) return;
    fetch(`http://localhost:8080/api/users/${ownerId}/public`)
      .then(r => r.json())
      .then(d => { if (d.profilePhoto) setPhoto(`http://localhost:8080${d.profilePhoto}`); })
      .catch(() => {});
  }, [ownerId]);

  return photo
    ? <img src={photo} alt="owner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#eef4f1', color: '#1e4d3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '700', fontFamily: "'Libre Baskerville', Georgia, serif" }}>
        {fallback}
      </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const StoreProfilePage = () => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    fetchStore();
    fetchRatings();
    fetchProducts();
  }, [storeId]);

  const fetchStore = async () => {
    try {
      const res = await springApi.get(`/stores/${storeId}`);
      setStore(res.data);
    } catch (err) {
      console.error('Failed to load store', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await springApi.get(`/stores/${storeId}/products`);
      setProductCount(res.data.length);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const fetchRatings = async () => {
    try {
      const res = await phpApi.get(`/ratings/store/${storeId}`);
      setRatings(res.data.ratings || []);
      setRatingSummary({ average: res.data.average_rating, total: res.data.total_ratings });
    } catch (err) {
      console.error('Failed to load ratings', err);
    }
  };

  const renderStars = (rating) =>
    [1, 2, 3, 4, 5].map(star => (
      <span key={star} style={{ fontSize: '15px', color: star <= rating ? '#d97706' : '#d1d5db' }}>★</span>
    ));

  if (loading) return (
    <div style={s.page}>
      <div style={s.loadingWrap}>
        <div style={s.spinner} />
        <p style={s.loadingText}>Loading store...</p>
      </div>
    </div>
  );

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
        <button style={s.shopBtn} onClick={() => navigate(`/products/${storeId}`)}>
          <CartIcon />
          <span>Shop Now</span>
        </button>
      </nav>

      {/* ── Content ── */}
      <div style={s.main}>

        {/* ── Hero Card ── */}
        {store && (
          <div style={s.heroCard}>

            {/* Cover image */}
            <div style={{ position: 'relative', marginBottom: '52px' }}>
              <div style={{
                width: '100%',
                height: '190px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#e5e7eb',
                backgroundImage: store.imageUrl
                  ? `url(${store.imageUrl.startsWith('/api') ? `http://localhost:8080${store.imageUrl}` : store.imageUrl})`
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}>
                {/* Subtle overlay if no image */}
                {!store.imageUrl && (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #eef4f1 0%, #d0e8df 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '48px', opacity: 0.25, fontFamily: "'Libre Baskerville', Georgia, serif", fontWeight: '700', color: '#1e4d3a' }}>
                      {store.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Owner avatar overlapping cover */}
              <div style={{
                position: 'absolute',
                bottom: '-40px',
                left: '24px',
                width: '76px',
                height: '76px',
                borderRadius: '16px',
                border: '3px solid #f7f5f1',
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(30,77,58,0.15)',
              }}>
                <OwnerAvatar ownerId={store.ownerId} fallback={store.name?.[0]?.toUpperCase()} />
              </div>
            </div>

            {/* Store info */}
            <div style={s.heroBody}>
              {/* Push content past avatar */}
              <div style={{ paddingLeft: '100px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <h1 style={s.storeName}>{store.name}</h1>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    backgroundColor: store.status === 'ACTIVE' ? '#eef4f1' : '#fef2f2',
                    color: store.status === 'ACTIVE' ? '#1e4d3a' : '#dc2626',
                    border: `1px solid ${store.status === 'ACTIVE' ? '#c5d9ce' : '#fecaca'}`,
                  }}>
                    {store.status === 'ACTIVE' ? '● Open' : '● Closed'}
                  </span>
                </div>
              </div>

              {/* Meta tags row */}
              <div style={s.metaRow}>
                {store.address && (
                  <span style={s.metaTag}><MapPinIcon /> {store.address}{store.barangay ? `, ${store.barangay}` : ''}{store.city ? `, ${store.city}` : ''}</span>
                )}
                {store.estimatedDeliveryMinutes && (
                  <span style={s.metaTag}><ClockIcon /> {store.estimatedDeliveryMinutes} min delivery</span>
                )}
                {store.deliveryFee !== undefined && (
                  <span style={s.metaTag}><TruckIcon /> ₱{store.deliveryFee} delivery fee</span>
                )}
                {store.minimumOrder > 0 && (
                  <span style={s.metaTag}><CartIcon /> Min. ₱{store.minimumOrder}</span>
                )}
                {store.contactNumber && (
                  <span style={s.metaTag}><PhoneIcon /> {store.contactNumber}</span>
                )}
              </div>

              {store.description && (
                <p style={s.storeDesc}>{store.description}</p>
              )}
            </div>

            {/* Stat chips */}
            <div style={s.statChips}>
              {[
                { icon: <PackageIcon />, value: productCount, label: 'Products' },
                { icon: <StarIcon />, value: ratingSummary?.average || 'N/A', label: 'Avg Rating' },
                { icon: <UserIcon />, value: ratingSummary?.total || 0, label: 'Reviews' },
              ].map((chip, i) => (
                <div key={i} style={s.statChip}>
                  <span style={{ color: '#1e4d3a' }}>{chip.icon}</span>
                  <span style={s.chipValue}>{chip.value}</span>
                  <span style={s.chipLabel}>{chip.label}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button style={s.browseBtn} onClick={() => navigate(`/products/${storeId}`)}>
                <CartIcon />
                Browse {productCount > 0 ? `${productCount} Products` : 'Products'}
              </button>
              {store.ownerId && (
                <button style={s.chatBtn} onClick={() => navigate(`/chat/${store.ownerId}`)}>
                  <MessageIcon />
                  Chat with Seller
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Rating Summary ── */}
        {ratingSummary && (
          <div style={s.ratingsSummaryCard}>
            <div style={s.summaryLeft}>
              <span style={s.avgNum}>{ratingSummary.average || 'N/A'}</span>
              <div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                  {ratingSummary.average ? renderStars(Math.round(ratingSummary.average)) : null}
                </div>
                <p style={s.totalRatings}>{ratingSummary.total} review{ratingSummary.total !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div style={s.ratingDivider} />
            <p style={s.ratingCaption}>
              {ratingSummary.average >= 4.5
                ? 'Excellent — customers love this store!'
                : ratingSummary.average >= 3.5
                  ? 'Great store with positive feedback.'
                  : 'Store has mixed reviews.'}
            </p>
          </div>
        )}

        {/* ── Reviews ── */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Customer Reviews</h2>

          {ratings.length === 0 ? (
            <div style={s.empty}>
              <div style={s.emptyIcon}><StarIcon /></div>
              <p style={s.emptyText}>No reviews yet. Be the first to rate!</p>
              <button style={s.rateBtn} onClick={() => navigate('/buyer/ratings')}>Rate this Store</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ratings.map(r => (
                <div key={r.id} style={s.ratingCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={s.userAvatar}><UserIcon /></div>
                      <span style={s.userName}>User #{r.user_id}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>{renderStars(r.rating)}</div>
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Libre+Baskerville:wght@400;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
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

  // Loading
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' },
  spinner: { width: '30px', height: '30px', border: '3px solid #e7e5e4', borderTop: '3px solid #1e4d3a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: '#94a3b8', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" },

  // Navbar — mirrors dashboard topbar style
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
  navLeft: { display: 'flex', alignItems: 'center', gap: '18px' },
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
  shopBtn: {
    display: 'flex', alignItems: 'center', gap: '7px',
    backgroundColor: '#1e4d3a', color: '#fff',
    border: 'none', padding: '9px 18px',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
  },

  // Main content
  main: {
    maxWidth: '820px', margin: '0 auto',
    padding: '28px 24px',
    display: 'flex', flexDirection: 'column', gap: '20px',
  },

  // Hero card — same style as dashboard profileForm card
  heroCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e5e4',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
    animation: 'fadeUp 0.4s ease both',
  },
  heroBody: { marginBottom: '16px' },
  storeName: {
    fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0,
    letterSpacing: '-0.4px', fontFamily: "'Libre Baskerville', Georgia, serif",
  },

  // Meta tags — same pill style as dashboard
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '12px 0' },
  metaTag: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', color: '#475569',
    backgroundColor: '#faf9f7', padding: '5px 11px',
    borderRadius: '20px', border: '1px solid #e7e5e4',
    fontWeight: '500',
  },
  storeDesc: {
    fontSize: '14px', color: '#64748b',
    lineHeight: '1.65', margin: '4px 0 0',
  },

  // Stat chips row — like mini stat cards
  statChips: {
    display: 'flex', gap: '10px', flexWrap: 'wrap',
    padding: '16px 0', borderTop: '1px solid #f5f5f4', borderBottom: '1px solid #f5f5f4',
    marginBottom: '4px',
  },
  statChip: {
    flex: '1 1 100px',
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#faf9f7', borderRadius: '10px',
    border: '1px solid #e7e5e4', padding: '10px 14px',
  },
  chipValue: { fontSize: '16px', fontWeight: '700', color: '#0f172a', fontFamily: "'Libre Baskerville', Georgia, serif" },
  chipLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: '500' },

  // CTA buttons
  browseBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    flex: 1, padding: '12px 20px',
    backgroundColor: '#1e4d3a', color: '#fff',
    border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    fontFamily: "'DM Sans', sans-serif",
  },
  chatBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#fff', color: '#1e4d3a',
    border: '1px solid #c5d9ce', borderRadius: '10px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    fontFamily: "'DM Sans', sans-serif",
  },

  // Rating summary card
  ratingsSummaryCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e5e4',
    borderRadius: '14px',
    padding: '20px 24px',
    display: 'flex', alignItems: 'center', gap: '20px',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
    animation: 'fadeUp 0.4s ease 0.1s both',
  },
  summaryLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  avgNum: {
    fontSize: '44px', fontWeight: '700', color: '#d97706', lineHeight: 1,
    fontFamily: "'Libre Baskerville', Georgia, serif",
  },
  totalRatings: { fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' },
  ratingDivider: { width: '1px', height: '40px', backgroundColor: '#e7e5e4', flexShrink: 0 },
  ratingCaption: { fontSize: '13px', color: '#64748b', lineHeight: '1.6', flex: 1 },

  // Reviews section
  section: {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e5e4',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
    animation: 'fadeUp 0.4s ease 0.15s both',
  },
  sectionTitle: {
    fontSize: '16px', fontWeight: '700', color: '#0f172a',
    margin: '0 0 18px',
    fontFamily: "'Libre Baskerville', Georgia, serif",
    letterSpacing: '-0.2px',
  },

  // Empty state
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '12px' },
  emptyIcon: { color: '#d97706', display: 'flex' },
  emptyText: { color: '#94a3b8', fontSize: '13px', margin: 0 },
  rateBtn: {
    backgroundColor: '#1e4d3a', color: '#fff',
    border: 'none', padding: '10px 20px',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
  },

  // Rating cards — same card style as ratingCard in dashboard
  ratingCard: {
    backgroundColor: '#faf9f7',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #f5f5f4',
  },
  userAvatar: {
    width: '34px', height: '34px', borderRadius: '8px',
    backgroundColor: '#eef4f1', color: '#1e4d3a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userName: { fontSize: '13px', fontWeight: '600', color: '#334155' },
  ratingComment: {
    fontSize: '14px', color: '#475569',
    fontStyle: 'italic', margin: '4px 0 10px',
    lineHeight: '1.6',
  },

  // Reply box — mirrors dashboard replyBox
  replyBox: {
    backgroundColor: '#eef4f1',
    borderLeft: '3px solid #1e4d3a',
    padding: '10px 14px',
    borderRadius: '0 6px 6px 0',
    marginBottom: '10px',
  },
  replyLabel: {
    fontSize: '11px', color: '#1e4d3a',
    fontWeight: '600', margin: '0 0 4px',
    letterSpacing: '0.5px',
  },
  replyText: { fontSize: '13px', color: '#475569', margin: 0 },
  ratingDate: { fontSize: '11px', color: '#94a3b8', margin: '8px 0 0' },
};

export default StoreProfilePage;