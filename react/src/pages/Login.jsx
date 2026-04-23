import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
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
      const res = await loginUser(formData);
      localStorage.setItem('token', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user.role === 'buyer') {
        navigate('/buyer/dashboard');
      } else if (res.data.user.role === 'store_owner') {
        navigate('/store/dashboard');
      } else if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError('Invalid username or password');
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
          <div style={styles.brandBadge}>🚀 #1 Local Delivery App</div>
          <h1 style={styles.brandTitle}>Fast & Fresh<br />Delivery 🛒</h1>
          <p style={styles.brandDesc}>
            Order groceries and essentials from local stores near you.
            Get them delivered straight to your door!
          </p>
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
          <div style={styles.featureList}>
            {[
              { icon: '🏪', text: 'Browse nearby stores' },
              { icon: '⚡', text: 'Fast delivery tracking' },
              { icon: '💬', text: 'Chat with store owners' },
              { icon: '⭐', text: 'Rate your experience' },
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
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
            <h2 style={styles.title}>Welcome back!</h2>
            <p style={styles.subtitle}>Sign in to continue shopping</p>
          </div>

          {error && (
            <div style={styles.error}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>USERNAME</label>
              <div style={styles.inputBox}>
                <span style={styles.inputEmoji}>👤</span>
                <input
                  style={styles.input}
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>PASSWORD</label>
              <div style={styles.inputBox}>
                <span style={styles.inputEmoji}>🔒</span>
                <input
                  style={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
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

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={styles.orText}>New to NearBuy?</p>

          <Link to="/register" style={styles.registerBtn}>
            Create an Account 🎉
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
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
    justifyContent: 'center',  // ← back to center
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
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '32px',
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
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#111',
    borderRadius: '12px',
    border: '1px solid #1f1f1f',
  },
  featureIcon: { fontSize: '20px' },
  featureText: { color: '#ccc', fontSize: '14px' },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding:  '40px 40px 40px 60px'
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: '48px 40px',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
    backdropFilter: 'blur(10px)',
  },
  cardHeader: {
    marginBottom: '32px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  logoEmoji: { fontSize: '28px' },
  logoText: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#f97316',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#666',
    fontSize: '15px',
  },
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
  inputGroup: { marginBottom: '20px' },
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
  inputEmoji: {
    padding: '0 14px',
    fontSize: '16px',
  },
  input: {
    flex: 1,
    padding: '15px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '15px',
  },
  eyeBtn: {
    padding: '0 14px',
    cursor: 'pointer',
    fontSize: '16px',
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
    margin: '24px 0 16px',
  },
  registerBtn: {
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

export default Login;