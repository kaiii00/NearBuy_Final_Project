import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { springApi, uploadProfilePhoto } from '../services/api';

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
    } catch (err) {
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
    buyer: '🛍️ Buyer', store_owner: '🏪 Store Owner', admin: '🔑 Admin', driver: '🛵 Driver',
  }[role] || role);

  if (loading) return (
    <div style={styles.loadingWrap}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading profile...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div style={styles.navLogo}>
          <span style={styles.navLogoIcon}>🛒</span>
          <span style={styles.navLogoText}>NearBuy</span>
        </div>
        <div style={{ width: '80px' }} />
      </nav>

      <div style={styles.main}>
        {/* Profile Header */}
        <div style={styles.profileHeader}>
          <div style={styles.avatarWrap}>
            {/* Photo */}
            <div style={styles.avatarContainer}>
              {profilePhoto || photoPreview ? (
                <img
                  src={photoPreview || profilePhoto}
                  alt="profile"
                  style={styles.avatarImg}
                />
              ) : (
                <div style={styles.avatar}>
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <button
                style={styles.photoEditBtn}
                onClick={() => fileInputRef.current.click()}
                title="Change photo"
              >
                {uploadingPhoto ? '⏳' : '📷'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />
            </div>
            <div style={styles.roleBadge}>{getRoleLabel(user.role)}</div>
          </div>
          <div style={styles.profileInfo}>
            <h1 style={styles.profileName}>{form.displayName || user.username}</h1>
            <p style={styles.profileUsername}>@{user.username}</p>
            <p style={styles.profileEmail}>{form.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} style={styles.form}>
          {success && <div style={styles.successBanner}>✅ {success}</div>}
          {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

          {/* Basic Info */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>👤 Basic Information</h2>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>USERNAME</label>
                <div style={styles.inputBox}>
                  <span style={styles.inputIcon}>👤</span>
                  <input style={{ ...styles.input, color: '#52525b' }} value={user.username} disabled />
                  <span style={styles.lockedIcon}>🔒</span>
                </div>
                <p style={styles.hint}>Username cannot be changed</p>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>DISPLAY NAME</label>
                <div style={styles.inputBox}>
                  <span style={styles.inputIcon}>✏️</span>
                  <input
                    style={styles.input}
                    type="text"
                    name="displayName"
                    placeholder="Your display name"
                    value={form.displayName}
                    onChange={handleChange}
                  />
                </div>
                <p style={styles.hint}>This is shown instead of your username</p>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>EMAIL</label>
                <div style={styles.inputBox}>
                  <span style={styles.inputIcon}>📧</span>
                  <input style={styles.input} type="email" name="email" placeholder="Your email address" value={form.email} onChange={handleChange} />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>ADDRESS</label>
                <div style={styles.inputBox}>
                  <span style={styles.inputIcon}>📍</span>
                  <input style={styles.input} type="text" name="address" placeholder="Your delivery address" value={form.address} onChange={handleChange} />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>CONTACT NUMBER</label>
                <div style={styles.inputBox}>
                  <span style={styles.inputIcon}>📞</span>
                  <input style={styles.input} type="text" name="contact" placeholder="Your phone number" value={form.contact} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Password */}
          <div style={styles.section}>
            <div style={styles.sectionTitleRow}>
              <h2 style={styles.sectionTitle}>🔐 Password</h2>
              <button type="button" style={styles.togglePassBtn} onClick={() => setShowPassSection(!showPassSection)}>
                {showPassSection ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            {showPassSection && (
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>CURRENT PASSWORD</label>
                  <div style={styles.inputBox}>
                    <span style={styles.inputIcon}>🔑</span>
                    <input style={styles.input} type="password" name="currentPassword" placeholder="Enter current password" value={form.currentPassword} onChange={handleChange} />
                  </div>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>NEW PASSWORD</label>
                  <div style={styles.inputBox}>
                    <span style={styles.inputIcon}>🔒</span>
                    <input style={styles.input} type="password" name="newPassword" placeholder="At least 8 characters" value={form.newPassword} onChange={handleChange} />
                  </div>
                </div>
                <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>CONFIRM NEW PASSWORD</label>
                  <div style={styles.inputBox}>
                    <span style={styles.inputIcon}>🔒</span>
                    <input style={styles.input} type="password" name="confirmPassword" placeholder="Repeat new password" value={form.confirmPassword} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}
            {!showPassSection && (
              <p style={styles.passHint}>••••••••••••  <span style={{ color: '#52525b', fontSize: '12px' }}>Click "Change Password" to update</span></p>
            )}
          </div>

          <div style={styles.saveRow}>
            <button type="button" style={styles.cancelBtn} onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" style={{ ...styles.saveBtn, opacity: saving ? 0.6 : 1 }} disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#0c0c0e', color: '#e4e4e7', fontFamily: "'DM Sans', -apple-system, sans-serif" },
  loadingWrap: { minHeight: '100vh', backgroundColor: '#0c0c0e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' },
  spinner: { width: '28px', height: '28px', border: '2px solid #1f1f24', borderTop: '2px solid #f97316', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { fontSize: '14px', color: '#52525b' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '60px', backgroundColor: '#111114', borderBottom: '1px solid #1f1f24', position: 'sticky', top: 0, zIndex: 100 },
  backBtn: { backgroundColor: 'transparent', color: '#a1a1aa', border: '1px solid #27272a', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  navLogo: { display: 'flex', alignItems: 'center', gap: '8px' },
  navLogoIcon: { fontSize: '20px' },
  navLogoText: { fontSize: '17px', fontWeight: '600', color: '#f97316' },
  main: { maxWidth: '720px', margin: '0 auto', padding: '40px 32px 80px' },
  profileHeader: { display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px', padding: '28px', backgroundColor: '#111114', borderRadius: '16px', border: '1px solid #1f1f24', animation: 'fadeIn 0.4s ease' },
  avatarWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  avatarContainer: { position: 'relative', width: '80px', height: '80px' },
  avatarImg: { width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #f97316' },
  avatar: { width: '80px', height: '80px', borderRadius: '16px', backgroundColor: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: '#fff' },
  photoEditBtn: { position: 'absolute', bottom: '-8px', right: '-8px', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1f1f24', border: '2px solid #f97316', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  roleBadge: { backgroundColor: 'rgba(249,115,22,0.15)', color: '#f97316', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(249,115,22,0.3)', whiteSpace: 'nowrap' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: '22px', fontWeight: '700', color: '#fff', margin: '0 0 2px' },
  profileUsername: { fontSize: '13px', color: '#52525b', margin: '0 0 4px' },
  profileEmail: { fontSize: '14px', color: '#71717a', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  successBanner: { backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', animation: 'fadeIn 0.3s ease' },
  errorBanner: { backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px' },
  section: { backgroundColor: '#111114', borderRadius: '16px', border: '1px solid #1f1f24', padding: '24px', animation: 'fadeIn 0.4s ease' },
  sectionTitle: { fontSize: '15px', fontWeight: '600', color: '#e4e4e7', margin: '0 0 20px' },
  sectionTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  togglePassBtn: { backgroundColor: 'transparent', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  passHint: { color: '#52525b', fontSize: '14px', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#52525b', letterSpacing: '0.8px' },
  inputBox: { display: 'flex', alignItems: 'center', backgroundColor: '#1a1a1f', border: '1px solid #27272a', borderRadius: '10px', overflow: 'hidden' },
  inputIcon: { padding: '0 12px', fontSize: '15px', flexShrink: 0 },
  input: { flex: 1, padding: '12px 8px', backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#e4e4e7', fontSize: '14px', fontFamily: 'inherit' },
  lockedIcon: { padding: '0 12px', fontSize: '13px', color: '#3f3f46' },
  hint: { fontSize: '11px', color: '#3f3f46', margin: 0 },
  saveRow: { display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' },
  cancelBtn: { padding: '11px 24px', backgroundColor: 'transparent', color: '#71717a', border: '1px solid #27272a', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' },
  saveBtn: { padding: '11px 28px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' },
};

export default ProfilePage;