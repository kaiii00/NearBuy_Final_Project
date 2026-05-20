import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { springApi, uploadProfilePhoto } from '../services/api';

// ── Icons ─────────────────────────────────────────────────────────────────────

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

const CameraIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    email: '', address: '', contact: '',
    currentPassword: '', newPassword: '', confirmPassword: '',
    displayName: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPassSection, setShowPassSection] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await springApi.get('/users/profile');
        setForm(prev => ({
          ...prev,
          email: res.data.email || '',
          address: res.data.address || '',
          contact: res.data.contact || '',
          displayName: res.data.displayName || '',
        }));
        if (res.data.profilePhoto) {
          setProfilePhoto(`http://localhost:8080${res.data.profilePhoto}`);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);
    try {
      const res = await uploadProfilePhoto(file);
      setProfilePhoto(`http://localhost:8080${res.data.photoUrl}`);
      setSuccess('Photo updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (showPassSection && form.newPassword !== form.confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        email: form.email,
        address: form.address,
        contact: form.contact,
        displayName: form.displayName,
      };
      if (showPassSection && form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      const res = await springApi.put('/users/profile', payload);
      const updatedUser = { ...user, email: res.data.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile updated successfully!');
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setShowPassSection(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = (role) => ({
    buyer: 'Buyer',
    store_owner: 'Store Owner',
    admin: 'Admin',
    driver: 'Driver',
  }[role?.toLowerCase()] || role);

  if (loading) return (
    <div style={s.loadingWrap}>
      <div style={s.spinner} />
      <p style={s.loadingText}>Loading profile...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const displayName = form.displayName || user.username || 'User';
  const initials = displayName?.[0]?.toUpperCase() || 'U';

  return (
    <div style={s.page}>

      {/* ── Navbar ── */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeftIcon />
            <span>Back</span>
          </button>
          <div style={s.logoWrap}>
            <div style={s.logoBox}>N</div>
            <span style={s.logoText}>NearBuy</span>
          </div>
        </div>
        <div style={s.navRight}>
          <span style={s.navCaption}>My Profile</span>
        </div>
      </nav>

      <div style={s.main}>

        {/* ── Profile Hero Card ── */}
        <div style={s.heroCard}>
          <div style={s.heroLeft}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {profilePhoto || photoPreview ? (
                <img
                  src={photoPreview || profilePhoto}
                  alt="profile"
                  style={s.avatarImg}
                />
              ) : (
                <div style={s.avatarFallback}>{initials}</div>
              )}
              <button
                style={s.cameraBtn}
                onClick={() => fileInputRef.current.click()}
                title="Change photo"
              >
                {uploadingPhoto ? <div style={s.miniSpinner} /> : <CameraIcon />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />
            </div>

            {/* Info */}
            <div>
              <h1 style={s.heroName}>{displayName}</h1>
              <p style={s.heroUsername}>@{user.username}</p>
              <div style={s.heroBadgeRow}>
                <span style={s.roleBadge}>{getRoleLabel(user.role)}</span>
                {form.email && <span style={s.emailBadge}>{form.email}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Feedback banners ── */}
        {success && (
          <div style={s.successBox}>
            <CheckCircleIcon /> {success}
          </div>
        )}
        {error && (
          <div style={s.errorBox}>
            <AlertIcon /> {error}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── Basic Info Card ── */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={{ color: '#1e4d3a' }}><UserIcon /></span>
              <h2 style={s.cardTitle}>Basic Information</h2>
            </div>

            <div style={s.grid}>
              {/* Username (locked) */}
              <div style={s.field}>
                <label style={s.fieldLabel}>USERNAME</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}><UserIcon /></span>
                  <input
                    style={{ ...s.input, color: '#94a3b8' }}
                    value={user.username}
                    disabled
                  />
                  <span style={s.lockTag}>Locked</span>
                </div>
                <p style={s.hint}>Username cannot be changed</p>
              </div>

              {/* Display name */}
              <div style={s.field}>
                <label style={s.fieldLabel}>DISPLAY NAME</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}><EditIcon /></span>
                  <input
                    style={s.input}
                    type="text"
                    name="displayName"
                    placeholder="Your display name"
                    value={form.displayName}
                    onChange={handleChange}
                  />
                </div>
                <p style={s.hint}>Shown to other users instead of your username</p>
              </div>

              {/* Email */}
              <div style={s.field}>
                <label style={s.fieldLabel}>EMAIL</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}><MailIcon /></span>
                  <input
                    style={s.input}
                    type="email"
                    name="email"
                    placeholder="Your email address"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Address */}
              <div style={s.field}>
                <label style={s.fieldLabel}>ADDRESS</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}><MapPinIcon /></span>
                  <input
                    style={s.input}
                    type="text"
                    name="address"
                    placeholder="Your delivery address"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Contact */}
              <div style={s.field}>
                <label style={s.fieldLabel}>CONTACT NUMBER</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}><PhoneIcon /></span>
                  <input
                    style={s.input}
                    type="text"
                    name="contact"
                    placeholder="Your phone number"
                    value={form.contact}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Password Card ── */}
          <div style={s.card}>
            <div style={s.cardHeaderRow}>
              <div style={s.cardHeader}>
                <span style={{ color: '#1e4d3a' }}><ShieldIcon /></span>
                <h2 style={s.cardTitle}>Password</h2>
              </div>
              <button
                type="button"
                style={s.togglePassBtn}
                onClick={() => setShowPassSection(!showPassSection)}
              >
                {showPassSection ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {!showPassSection && (
              <p style={s.passHint}>
                <LockIcon />
                <span>••••••••••••  <span style={{ color: '#94a3b8', fontSize: '12px' }}>Click "Change Password" to update</span></span>
              </p>
            )}

            {showPassSection && (
              <div style={s.grid}>
                <div style={s.field}>
                  <label style={s.fieldLabel}>CURRENT PASSWORD</label>
                  <div style={s.inputWrap}>
                    <span style={s.inputIcon}><LockIcon /></span>
                    <input
                      style={s.input}
                      type="password"
                      name="currentPassword"
                      placeholder="Enter current password"
                      value={form.currentPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.fieldLabel}>NEW PASSWORD</label>
                  <div style={s.inputWrap}>
                    <span style={s.inputIcon}><LockIcon /></span>
                    <input
                      style={s.input}
                      type="password"
                      name="newPassword"
                      placeholder="At least 8 characters"
                      value={form.newPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div style={{ ...s.field, gridColumn: '1 / -1' }}>
                  <label style={s.fieldLabel}>CONFIRM NEW PASSWORD</label>
                  <div style={s.inputWrap}>
                    <span style={s.inputIcon}><LockIcon /></span>
                    <input
                      style={s.input}
                      type="password"
                      name="confirmPassword"
                      placeholder="Repeat new password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Save Row ── */}
          <div style={s.saveRow}>
            <button type="button" style={s.cancelBtn} onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...s.saveBtn, opacity: saving ? 0.6 : 1 }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Libre+Baskerville:wght@400;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
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
  loadingWrap: {
    minHeight: '100vh', backgroundColor: '#f7f5f1',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '16px',
  },
  spinner: {
    width: '28px', height: '28px',
    border: '3px solid #e7e5e4', borderTop: '3px solid #1e4d3a',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  loadingText: { fontSize: '14px', color: '#94a3b8', fontFamily: "'DM Sans', sans-serif" },

  // Navbar
  navbar: {
    backgroundColor: 'rgba(247,245,241,0.95)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #e7e5e4',
    padding: '0 28px', height: '62px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 100,
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  navRight: { display: 'flex', alignItems: 'center' },
  navCaption: { fontSize: '13px', fontWeight: '500', color: '#64748b' },
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
    maxWidth: '760px', margin: '0 auto',
    padding: '28px 24px 60px',
    display: 'flex', flexDirection: 'column', gap: '20px',
  },

  // Hero card
  heroCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e5e4',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
    animation: 'fadeUp 0.35s ease both',
  },
  heroLeft: { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
  avatarImg: {
    width: '80px', height: '80px',
    borderRadius: '16px', objectFit: 'cover',
    border: '3px solid #eef4f1',
  },
  avatarFallback: {
    width: '80px', height: '80px', borderRadius: '16px',
    backgroundColor: '#1e4d3a', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', fontWeight: '700',
    fontFamily: "'Libre Baskerville', Georgia, serif",
  },
  cameraBtn: {
    position: 'absolute', bottom: '-8px', right: '-8px',
    width: '28px', height: '28px', borderRadius: '50%',
    backgroundColor: '#fff', border: '2px solid #1e4d3a',
    cursor: 'pointer', color: '#1e4d3a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  miniSpinner: {
    width: '12px', height: '12px',
    border: '2px solid #c5d9ce', borderTop: '2px solid #1e4d3a',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },
  heroName: {
    fontSize: '22px', fontWeight: '700', color: '#0f172a',
    margin: '0 0 2px', letterSpacing: '-0.3px',
    fontFamily: "'Libre Baskerville', Georgia, serif",
  },
  heroUsername: { fontSize: '13px', color: '#94a3b8', margin: '0 0 10px' },
  heroBadgeRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  roleBadge: {
    fontSize: '11px', fontWeight: '600',
    padding: '3px 10px', borderRadius: '20px',
    backgroundColor: '#eef4f1', color: '#1e4d3a',
    border: '1px solid #c5d9ce',
  },
  emailBadge: {
    fontSize: '12px', color: '#64748b',
    backgroundColor: '#faf9f7', padding: '3px 10px',
    borderRadius: '20px', border: '1px solid #e7e5e4',
  },

  // Feedback
  successBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#eef4f1', color: '#1e4d3a',
    border: '1px solid #c5d9ce',
    padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
    animation: 'fadeUp 0.3s ease both',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#fef2f2', color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
  },

  // Cards
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
    marginBottom: '20px',
  },
  cardHeaderRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '15px', fontWeight: '700', color: '#0f172a',
    margin: 0, fontFamily: "'Libre Baskerville', Georgia, serif",
  },

  // Form grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  fieldLabel: {
    fontSize: '10px', fontWeight: '600',
    color: '#94a3b8', letterSpacing: '0.8px',
  },
  inputWrap: {
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: '#faf9f7',
    border: '1px solid #e7e5e4',
    borderRadius: '10px',
    padding: '0 12px',
    overflow: 'hidden',
  },
  inputIcon: {
    color: '#94a3b8', flexShrink: 0,
    display: 'flex', alignItems: 'center',
  },
  input: {
    flex: 1, padding: '11px 4px',
    backgroundColor: 'transparent',
    border: 'none', outline: 'none',
    color: '#1e293b', fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
  },
  lockTag: {
    fontSize: '10px', fontWeight: '600', color: '#94a3b8',
    backgroundColor: '#f1f5f9', padding: '2px 8px',
    borderRadius: '6px', flexShrink: 0,
    letterSpacing: '0.5px',
  },
  hint: { fontSize: '11px', color: '#94a3b8', margin: 0 },

  // Password section
  togglePassBtn: {
    backgroundColor: '#fff', color: '#1e4d3a',
    border: '1px solid #c5d9ce',
    padding: '7px 14px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '12px', fontWeight: '600',
    fontFamily: "'DM Sans', sans-serif",
  },
  passHint: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '14px', color: '#64748b', margin: 0,
  },

  // Save row
  saveRow: {
    display: 'flex', gap: '12px', justifyContent: 'flex-end',
    paddingTop: '4px',
  },
  cancelBtn: {
    padding: '11px 24px',
    backgroundColor: '#fff', color: '#64748b',
    border: '1px solid #e7e5e4', borderRadius: '10px',
    cursor: 'pointer', fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
  },
  saveBtn: {
    padding: '11px 28px',
    backgroundColor: '#1e4d3a', color: '#fff',
    border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.2s',
  },
};

export default ProfilePage;