import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

// SVG Icons
const PartyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.8 11.3 2 22l10.7-3.79" /><path d="M4 3h.01" /><path d="M22 8h.01" /><path d="M15 2h.01" /><path d="M22 20h.01" /><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" /><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17" /><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7" /><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />
  </svg>
);

const RocketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const StoreIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const CartIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'buyer',
    address: '',
    contact: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerUser(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.username?.[0] || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgGlow1}></div>
      <div style={styles.bgGlow2}></div>

      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.brandBadge}>
            <PartyIcon />
            <span style={{ marginLeft: '8px' }}>Join NearBuy Today</span>
          </div>
          <h1 style={styles.brandTitle}>
            Start Your<br />
            <span style={{ color: '#3b82f6' }}>Journey.</span>
          </h1>
          <p style={styles.brandDesc}>
            Whether you're a buyer looking for fresh groceries or a store owner
            wanting to reach more customers — NearBuy has got you covered!
          </p>
          <div style={styles.rolesShowcase}>
            <div style={styles.roleShowcaseCard}>
              <span style={styles.roleShowcaseIcon}><ShoppingBagIcon /></span>
              <div>
                <p style={styles.roleShowcaseTitle}>Join as a Buyer</p>
                <p style={styles.roleShowcaseDesc}>Order from local stores near you</p>
              </div>
            </div>
            <div style={styles.roleShowcaseCard}>
              <span style={styles.roleShowcaseIcon}><StoreIcon /></span>
              <div>
                <p style={styles.roleShowcaseTitle}>Join as a Store Owner</p>
                <p style={styles.roleShowcaseDesc}>Sell your products to local customers</p>
              </div>
            </div>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.stat}>
              <span style={styles.statNum}>500+</span>
              <span style={styles.statLabel}>Local Stores</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.stat}>
              <span style={styles.statNum}>10k+</span>
              <span style={styles.statLabel}>Happy Buyers</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.stat}>
              <span style={styles.statNum}>30min</span>
              <span style={styles.statLabel}>Avg Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.logoRow}>
              <div style={styles.logoIcon}>N</div>
              <span style={styles.logoText}>NearBuy</span>
            </div>
            <h2 style={styles.title}>Create Account</h2>
            <p style={styles.subtitle}>Fill in your details to get started</p>
          </div>

          {error && (
            <div style={styles.error}>
              <WarningIcon />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role Selector */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>I AM A...</label>
              <div style={styles.roleContainer}>
                <div
                  style={{
                    ...styles.roleCard,
                    ...(formData.role === 'buyer' ? styles.roleCardActive : {}),
                  }}
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                >
                  <span style={styles.roleIcon}><ShoppingBagIcon /></span>
                  <span style={styles.roleText}>Buyer</span>
                  <span style={styles.roleDesc}>Order groceries</span>
                </div>
                <div
                  style={{
                    ...styles.roleCard,
                    ...(formData.role === 'store_owner' ? styles.roleCardActive : {}),
                  }}
                  onClick={() => setFormData({ ...formData, role: 'store_owner' })}
                >
                  <span style={styles.roleIcon}><StoreIcon /></span>
                  <span style={styles.roleText}>Store Owner</span>
                  <span style={styles.roleDesc}>Sell products</span>
                </div>
              </div>
            </div>

            {/* Username */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>USERNAME</label>
              <div style={styles.inputBox}>
                <span style={styles.inputIconWrapper}><UserIcon /></span>
                <input
                  style={styles.input}
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>EMAIL</label>
              <div style={styles.inputBox}>
                <span style={styles.inputIconWrapper}><EmailIcon /></span>
                <input
                  style={styles.input}
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>PASSWORD</label>
              <div style={styles.inputBox}>
                <span style={styles.inputIconWrapper}><LockIcon /></span>
                <input
                  style={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  style={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </span>
              </div>
            </div>

            {/* Address & Contact Row */}
            <div style={styles.rowGroup}>
              <div style={styles.rowField}>
                <label style={styles.label}>ADDRESS</label>
                <div style={styles.inputBox}>
                  <span style={styles.inputIconWrapper}><MapPinIcon /></span>
                  <input
                    style={styles.input}
                    type="text"
                    name="address"
                    placeholder="Your address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div style={styles.rowField}>
                <label style={styles.label}>CONTACT</label>
                <div style={styles.inputBox}>
                  <span style={styles.inputIconWrapper}><PhoneIcon /></span>
                  <input
                    style={styles.input}
                    type="text"
                    name="contact"
                    placeholder="Phone number"
                    value={formData.contact}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={styles.orText}>Already have an account?</p>

          <Link to="/login" style={styles.loginBtn}>
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    background: 'linear-gradient(145deg, #0a1628 0%, #0a0a0a 60%)',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow1: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
    top: '-200px',
    left: '-100px',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
    bottom: '-100px',
    right: '30%',
    pointerEvents: 'none',
  },
  leftPanel: {
    flex: 1.2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
  },
  leftContent: {
    maxWidth: '480px',
  },
  brandBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.15)',
    color: '#3b82f6',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '24px',
    border: '1px solid rgba(59,130,246,0.3)',
  },
  brandTitle: {
    fontSize: '52px',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: '1.1',
    marginBottom: '20px',
  },
  brandDesc: {
    fontSize: '16px',
    color: '#888',
    lineHeight: '1.7',
    marginBottom: '32px',
  },
  rolesShowcase: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '32px',
  },
  roleShowcaseCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    backgroundColor: '#111',
    borderRadius: '12px',
    border: '1px solid #1f1f1f',
  },
  roleShowcaseIcon: { 
    fontSize: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: '10px',
    color: '#3b82f6',
  },
  roleShowcaseTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '14px',
    margin: 0,
  },
  roleShowcaseDesc: {
    color: '#666',
    fontSize: '13px',
    margin: 0,
    marginTop: '4px',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    backgroundColor: '#111',
    padding: '20px 24px',
    borderRadius: '16px',
    border: '1px solid #222',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
  statDivider: {
    width: '1px',
    height: '40px',
    backgroundColor: '#222',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '40px 60px 40px 40px',
    overflowY: 'auto',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: '40px',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
    backdropFilter: 'blur(10px)',
  },
  cardHeader: { marginBottom: '24px' },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    backgroundColor: '#3b82f6',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '6px',
  },
  subtitle: { color: '#666', fontSize: '14px' },
  error: {
    backgroundColor: 'rgba(255,68,68,0.1)',
    color: '#ff6b6b',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '1px solid rgba(255,68,68,0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inputGroup: { marginBottom: '16px' },
  rowGroup: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  rowField: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: '#555',
    fontSize: '11px',
    marginBottom: '8px',
    display: 'block',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  inputBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  inputIconWrapper: { 
    padding: '0 12px', 
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '13px 10px',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '14px',
  },
  eyeBtn: {
    padding: '0 14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  roleContainer: {
    display: 'flex',
    gap: '12px',
  },
  roleCard: {
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  roleCardActive: {
    border: '1px solid #3b82f6',
    backgroundColor: 'rgba(59,130,246,0.1)',
  },
  roleIcon: { 
    fontSize: '24px',
    color: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '13px',
  },
  roleDesc: {
    color: '#666',
    fontSize: '11px',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
    letterSpacing: '0.5px',
  },
  orText: {
    textAlign: 'center',
    color: '#555',
    fontSize: '13px',
    margin: '20px 0 16px',
  },
  loginBtn: {
    display: 'block',
    width: '100%',
    padding: '15px',
    backgroundColor: 'transparent',
    color: '#3b82f6',
    border: '1px solid rgba(59,130,246,0.4)',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
};

export default Register;
