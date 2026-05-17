import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CompleteProfile = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState(state?.username?.split('_')[0] || '');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) return setError('Username is required.');
    if (!role) return setError('Please choose how you want to use NearBuy.');

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8080/api/auth/oauth2/complete-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.userId, username, role }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Something went wrong.');

      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user', JSON.stringify({
        id: data.userId,
        username: data.username,
        email: data.email,
        role: data.role,
      }));

      if (data.role === 'store_owner') {
        navigate('/store/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Complete Your Profile</h2>
        <p style={styles.subtitle}>Just a couple things before you get started</p>

        <label style={styles.label}>Username</label>
        <input
          style={styles.input}
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Choose a username"
        />

        <label style={styles.label}>How will you use NearBuy?</label>
        <div style={styles.roleRow}>
          <div
            style={{ ...styles.roleCard, ...(role === 'buyer' ? styles.roleCardActive : {}) }}
            onClick={() => setRole('buyer')}
          >
            <span style={styles.roleIcon}>🛒</span>
            <span style={styles.roleName}>Buyer</span>
            <span style={styles.roleDesc}>Shop from local stores</span>
          </div>
          <div
            style={{ ...styles.roleCard, ...(role === 'store_owner' ? styles.roleCardActive : {}) }}
            onClick={() => setRole('store_owner')}
          >
            <span style={styles.roleIcon}>🏪</span>
            <span style={styles.roleName}>Store Owner</span>
            <span style={styles.roleDesc}>Sell your products</span>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.button} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Get Started'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0f1117',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: '#1a1d2e',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  title: { color: '#fff', fontSize: '24px', fontWeight: 700, margin: 0 },
  subtitle: { color: '#888', fontSize: '14px', margin: 0 },
  label: { color: '#aaa', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' },
  input: {
    background: '#0f1117',
    border: '1px solid #2a2d3e',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  },
  roleRow: { display: 'flex', gap: '12px' },
  roleCard: {
    flex: 1,
    background: '#0f1117',
    border: '2px solid #2a2d3e',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  roleCardActive: { borderColor: '#4f6ef7' },
  roleIcon: { fontSize: '28px' },
  roleName: { color: '#fff', fontWeight: 600, fontSize: '14px' },
  roleDesc: { color: '#888', fontSize: '12px', textAlign: 'center' },
  error: { color: '#ff4d4f', fontSize: '13px', margin: 0 },
  button: {
    background: '#4f6ef7',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
  },
};

export default CompleteProfile;