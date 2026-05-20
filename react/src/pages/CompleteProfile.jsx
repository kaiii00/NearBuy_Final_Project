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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Libre+Baskerville:wght@400;700&display=swap');

        .cp-root * { box-sizing: border-box; }

        .cp-root {
          min-height: 100vh;
          background-color: #f7f5f1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', system-ui, sans-serif;
          padding: 24px;
        }

        .cp-card {
          background: #ffffff;
          border: 1px solid #e7e5e4;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .cp-logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }

        .cp-logo-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background-color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
        }

        .cp-logo-text {
          font-family: 'Libre Baskerville', Georgia, serif;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.3px;
        }

        .cp-title {
          font-family: 'Libre Baskerville', Georgia, serif;
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px;
          letter-spacing: -0.3px;
        }

        .cp-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 28px;
        }

        .cp-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .cp-label {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .cp-input {
          width: 100%;
          padding: 12px 14px;
          background: #faf9f7;
          border: 1px solid #e7e5e4;
          border-radius: 10px;
          color: #1e293b;
          font-size: 14px;
          font-family: 'DM Sans', system-ui, sans-serif;
          outline: none;
          transition: border-color 0.15s;
        }

        .cp-input:focus {
          border-color: #1e4d3a;
        }

        .cp-input::placeholder {
          color: #94a3b8;
        }

        .cp-role-row {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .cp-role-card {
          flex: 1;
          background: #faf9f7;
          border: 1px solid #e7e5e4;
          border-radius: 12px;
          padding: 20px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .cp-role-card:hover {
          border-color: #c5d9ce;
          background: #f0f7f4;
        }

        .cp-role-card.active {
          border-color: #1e4d3a;
          background: #eef4f1;
          border-width: 1.5px;
        }

        .cp-role-icon {
          font-size: 28px;
          line-height: 1;
          margin-bottom: 2px;
        }

        .cp-role-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
        }

        .cp-role-desc {
          font-size: 11px;
          color: #64748b;
          text-align: center;
          line-height: 1.4;
        }

        .cp-error {
          font-size: 13px;
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
        }

        .cp-btn {
          width: 100%;
          padding: 13px;
          background: #1e4d3a;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', system-ui, sans-serif;
          cursor: pointer;
          transition: all 0.15s ease;
          letter-spacing: 0.1px;
        }

        .cp-btn:hover:not(:disabled) {
          background: #174032;
        }

        .cp-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cp-divider {
          height: 1px;
          background: #f5f5f4;
          margin: 20px 0;
        }
      `}</style>

      <div className="cp-root">
        <div className="cp-card">

          {/* Logo */}
          <div className="cp-logo-row">
            <div className="cp-logo-box">N</div>
            <span className="cp-logo-text">NearBuy</span>
          </div>

          {/* Heading */}
          <h2 className="cp-title">Complete your profile</h2>
          <p className="cp-subtitle">Just a couple things before you get started</p>

          {/* Username */}
          <div className="cp-field">
            <label className="cp-label">Username</label>
            <input
              className="cp-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Choose a username"
            />
          </div>

          {/* Role */}
          <div className="cp-field">
            <label className="cp-label">How will you use NearBuy?</label>
            <div className="cp-role-row">
              <div
                className={`cp-role-card ${role === 'buyer' ? 'active' : ''}`}
                onClick={() => setRole('buyer')}
              >
                <span className="cp-role-icon">🛒</span>
                <span className="cp-role-name">Buyer</span>
                <span className="cp-role-desc">Shop from local stores</span>
              </div>
              <div
                className={`cp-role-card ${role === 'store_owner' ? 'active' : ''}`}
                onClick={() => setRole('store_owner')}
              >
                <span className="cp-role-icon">🏪</span>
                <span className="cp-role-name">Store Owner</span>
                <span className="cp-role-desc">Sell your products</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && <p className="cp-error">{error}</p>}

          {/* Submit */}
          <button className="cp-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Get Started'}
          </button>

        </div>
      </div>
    </>
  );
};

export default CompleteProfile;