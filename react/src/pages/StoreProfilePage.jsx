import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { springApi, phpApi } from '../services/api';
  



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
    : <div style={{ width: '100%', height: '100%', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700' }}>{fallback}</div>;
};


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

  const renderStars = (rating) => [1, 2, 3, 4, 5].map(star => (
    <span key={star} style={{ fontSize: '16px', color: star <= rating ? '#f59e0b' : '#d1d5db' }}>★</span>
  ));

  const handleBack = () => navigate('/buyer/dashboard');
  const handleShop = () => navigate(`/products/${storeId}`);

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
      {/* Navbar */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <button style={s.backBtn} onClick={handleBack}>← Back</button>
          <div style={s.logoWrap}>
            <div style={s.logoIcon}>🛒</div>
            <span style={s.logoText}>NearBuy</span>
          </div>
        </div>
        <button style={s.shopBtn} onClick={handleShop}>Shop Now →</button>
      </nav>

      <div style={s.main}>
        {/* Store Hero */}
        {store && (
          <div style={s.heroCard}>
            {/* Cover photo */}
            <div style={{ position: 'relative', marginBottom: '48px' }}>
              <div style={{
                width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden',
                backgroundColor: '#e5e7eb',
                backgroundImage: store.imageUrl ? `url(${store.imageUrl.startsWith('/api') ? `http://localhost:8080${store.imageUrl}` : store.imageUrl})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
              }} />
              {/* Owner avatar overlapping cover */}
              <div style={{
                position: 'absolute', bottom: '-36px', left: '24px',
                width: '72px', height: '72px', borderRadius: '16px',
                border: '3px solid #fff', overflow: 'hidden',
                backgroundColor: '#d1fae5', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}>
                <OwnerAvatar ownerId={store.ownerId} fallback={store.name?.[0]?.toUpperCase()} />
              </div>
            </div>
            <div style={s.heroTop}>
              <div style={{ width: '72px', flexShrink: 0 }} />
              <div style={s.heroInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <h1 style={{ ...s.storeName, margin: 0 }}>{store.name}</h1>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                    backgroundColor: store.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                    color: store.status === 'ACTIVE' ? '#059669' : '#dc2626',
                  }}>
                    {store.status === 'ACTIVE' ? '🟢 Open' : '🔴 Closed'}
                  </span>
                </div>
                <div style={s.metaRow}>
                  {store.address && <span style={s.metaTag}>📍 {store.address}</span>}
                  {store.city && <span style={s.metaTag}>🏙 {store.city}</span>}
                  {store.barangay && <span style={s.metaTag}>📌 {store.barangay}</span>}
                </div>
                <div style={s.metaRow}>
                  {store.estimatedDeliveryMinutes && <span style={s.metaTag}>⏱ {store.estimatedDeliveryMinutes} min delivery</span>}
                  {store.deliveryFee !== undefined && <span style={s.metaTag}>🚚 ₱{store.deliveryFee} delivery fee</span>}
                  {store.minimumOrder > 0 && <span style={s.metaTag}>🛒 Min. ₱{store.minimumOrder}</span>}
                  {store.contactNumber && <span style={s.metaTag}>📞 {store.contactNumber}</span>}
                </div>
                {store.description && <p style={s.storeDesc}>{store.description}</p>}
              </div>
            </div>
           <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button style={s.shopBtnLarge} onClick={handleShop}>🛍 Browse {productCount > 0 ? `${productCount} Products` : 'Products'}</button>
              {store.ownerId && (
                <button
                  onClick={() => navigate(`/chat/${store.ownerId}`)}
                  style={{ padding: '13px 20px', backgroundColor: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  💬 Chat
                </button>
              )}
            </div>
          </div>
        )}

        {/* Rating Summary */}
        {ratingSummary && (
          <div style={s.ratingsSummary}>
            <div style={s.avgRating}>
              <span style={s.avgNum}>{ratingSummary.average || 'N/A'}</span>
              <div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {ratingSummary.average ? renderStars(Math.round(ratingSummary.average)) : null}
                </div>
                <p style={s.totalRatings}>{ratingSummary.total} review{ratingSummary.total !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Ratings List */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Customer Reviews</h2>
          {ratings.length === 0 ? (
            <div style={s.empty}>
              <span style={{ fontSize: '40px' }}>⭐</span>
              <p style={s.emptyText}>No reviews yet. Be the first to rate!</p>
              <button style={s.rateBtn} onClick={() => navigate('/buyer/ratings')}>Rate this Store</button>
            </div>
          ) : (
            <div style={s.ratingsList}>
              {ratings.map(r => (
                <div key={r.id} style={s.ratingCard}>
                  <div style={s.ratingTop}>
                    <div style={s.ratingUser}>
                      <div style={s.userAvatar}>U</div>
                      <span style={s.userName}>User #{r.user_id}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>{renderStars(r.rating)}</div>
                  </div>
                  {r.comment && <p style={s.ratingComment}>"{r.comment}"</p>}
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const GREEN = '#059669';
const GREEN_LIGHT = '#d1fae5';

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: "'Inter', -apple-system, sans-serif", color: '#111827' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTop: `3px solid ${GREEN}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: '#9ca3af', fontSize: '14px' },
  navbar: { backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '20px' },
  backBtn: { backgroundColor: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoIcon: { fontSize: '20px' },
  logoText: { fontSize: '18px', fontWeight: '700', color: GREEN },
  shopBtn: { backgroundColor: GREEN, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  main: { maxWidth: '800px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' },
  heroCard: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  heroTop: { display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' },
  storeAvatar: { width: '72px', height: '72px', borderRadius: '16px', backgroundColor: GREEN_LIGHT, color: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700', flexShrink: 0 },
  heroInfo: { flex: 1 },
  storeName: { fontSize: '26px', fontWeight: '700', color: '#111827', margin: '0 0 10px' },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' },
  metaTag: { fontSize: '12px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '20px' },
  storeDesc: { fontSize: '14px', color: '#374151', margin: '10px 0 0', lineHeight: '1.6' },
  shopBtnLarge: { backgroundColor: GREEN, color: '#fff', border: 'none', padding: '13px 28px', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', width: '100%', boxShadow: '0 2px 8px rgba(5,150,105,0.3)' },
  ratingsSummary: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '20px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  avgRating: { display: 'flex', alignItems: 'center', gap: '16px' },
  avgNum: { fontSize: '48px', fontWeight: '700', color: '#f59e0b', lineHeight: 1 },
  totalRatings: { fontSize: '13px', color: '#9ca3af', margin: '4px 0 0' },
  section: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 20px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '12px' },
  emptyText: { color: '#9ca3af', fontSize: '14px', margin: 0 },
  rateBtn: { backgroundColor: GREEN, color: '#fff', border: 'none', padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  ratingsList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  ratingCard: { backgroundColor: '#f9fafb', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb' },
  ratingTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  ratingUser: { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: GREEN_LIGHT, color: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700' },
  userName: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  ratingComment: { fontSize: '14px', color: '#374151', fontStyle: 'italic', margin: '0 0 10px', lineHeight: '1.6' },
  replyBox: { backgroundColor: '#eff6ff', borderLeft: '3px solid #3b82f6', padding: '10px 14px', borderRadius: '6px', marginBottom: '10px' },
  replyLabel: { fontSize: '11px', color: '#3b82f6', fontWeight: '700', margin: '0 0 4px' },
  replyText: { fontSize: '13px', color: '#374151', margin: 0 },
  ratingDate: { fontSize: '12px', color: '#9ca3af', margin: 0 },
};

export default StoreProfilePage;