import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

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
          <div style={styles.brandBadge}>🎉 Join NearBuy Today</div>
          <h1 style={styles.brandTitle}>Start Your<br />Journey 🚀</h1>
          <p style={styles.brandDesc}>
            Whether you're a buyer looking for fresh groceries or a store owner
            wanting to reach more customers — NearBuy has got you covered!
          </p>
          <div style={styles.rolesShowcase}>
            <div style={styles.roleShowcaseCard}>
              <span style={styles.roleShowcaseIcon}>🛍️</span>
              <div>
                <p style={styles.roleShowcaseTitle}>Join as a Buyer</p>
                <p style={styles.roleShowcaseDesc}>Order from local stores near you</p>
              </div>
            </div>
            <div style={styles.roleShowcaseCard}>
              <span style={styles.roleShowcaseIcon}>🏪</span>
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
              <span style={styles.logoEmoji}>🛒</span>
              <span style={styles.logoText}>NearBuy</span>
            </div>
            <h2 style={styles.title}>Create Account</h2>
            <p style={styles.subtitle}>Fill in your details to get started</p>
          </div>

          {error && (
            <div style={styles.error}>
              <span>⚠️</span>
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
                  <span style={styles.roleIcon}>🛍️</span>
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
                  <span style={styles.roleIcon}>🏪</span>
                  <span style={styles.roleText}>Store Owner</span>
                  <span style={styles.roleDesc}>Sell products</span>
                </div>
              </div>
            </div>

            {/* Username */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>USERNAME</label>
              <div style={styles.inputBox}>
                <span style={styles.inputEmoji}>👤</span>
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
                <span style={styles.inputEmoji}>📧</span>
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
                <span style={styles.inputEmoji}>🔒</span>
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
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            {/* Address & Contact Row */}
            <div style={styles.rowGroup}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>ADDRESS</label>
                <div style={styles.inputBox}>
                  <span style={styles.inputEmoji}>📍</span>
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
              <div style={{ flex: 1 }}>
                <label style={styles.label}>CONTACT</label>
                <div style={styles.inputBox}>
                  <span style={styles.inputEmoji}>📞</span>
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
              {loading ? '⏳ Creating Account...' : '🎉 Create Account'}
            </button>
          </form>

          <p style={styles.orText}>Already have an account?</p>

          <Link to="/login" style={styles.loginBtn}>
            Sign In Instead →
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
    background: 'linear-gradient(145deg, #1a0a00 0%, #0a0a0a 60%)',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow1: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
    top: '-200px',
    left: '-100px',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)',
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
    display: 'inline-block',
    backgroundColor: 'rgba(249,115,22,0.15)',
    color: '#f97316',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '24px',
    border: '1px solid rgba(249,115,22,0.3)',
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
  roleShowcaseIcon: { fontSize: '28px' },
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
    color: '#f97316',
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
    alignItems: 'center',        // vertically centered
    justifyContent: 'center',    // horizontally centered
    padding: '40px 60px 40px 20px', // more padding on right, less gap to center
    overflowY: 'auto',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
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
    gap: '8px',
    marginBottom: '20px',
  },
  logoEmoji: { fontSize: '28px' },
  logoText: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#f97316',
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
  inputEmoji: { padding: '0 12px', fontSize: '15px' },
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
    fontSize: '16px',
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
    border: '1px solid #f97316',
    backgroundColor: 'rgba(249,115,22,0.1)',
  },
  roleIcon: { fontSize: '24px' },
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
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
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
    color: '#f97316',
    border: '1px solid rgba(249,115,22,0.4)',
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