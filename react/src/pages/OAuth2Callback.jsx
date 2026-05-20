import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuth2Callback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const userId = params.get('userId');
    const username = params.get('username');
    const role = params.get('role');
    const email = params.get('email');
    const isNewUser = params.get('isNewUser') === 'true';

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify({ id: userId, username, email, role }));

      if (isNewUser) {
        navigate('/complete-profile', { state: { userId, username, email, token } });
      } else if (role?.toLowerCase() === 'store_owner') {
        navigate('/store/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Libre+Baskerville:wght@400;700&display=swap');

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .oauth-root {
          min-height: 100vh;
          background-color: #f7f5f1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .oauth-card {
          background-color: #ffffff;
          border: 1px solid #e7e5e4;
          border-radius: 16px;
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
          animation: fadeIn 0.4s ease both;
          width: 100%;
          max-width: 360px;
          text-align: center;
        }

        .oauth-logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
        }

        .oauth-logo-box {
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

        .oauth-logo-text {
          font-family: 'Libre Baskerville', Georgia, serif;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.3px;
        }

        .oauth-spinner {
          width: 44px;
          height: 44px;
          border: 3px solid #e7e5e4;
          border-top-color: #1e4d3a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 24px;
        }

        .oauth-title {
          font-family: 'Libre Baskerville', Georgia, serif;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px;
          letter-spacing: -0.2px;
        }

        .oauth-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          animation: pulse 2s ease infinite;
        }

        .oauth-dots {
          display: flex;
          gap: 6px;
          margin-top: 28px;
        }

        .oauth-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #1e4d3a;
          opacity: 0.3;
          animation: pulse 1.2s ease infinite;
        }

        .oauth-dot:nth-child(2) { animation-delay: 0.2s; }
        .oauth-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div className="oauth-root">
        <div className="oauth-card">
          <div className="oauth-logo-row">
            <div className="oauth-logo-box">N</div>
            <span className="oauth-logo-text">NearBuy</span>
          </div>

          <div className="oauth-spinner" />

          <h2 className="oauth-title">Signing you in</h2>
          <p className="oauth-subtitle">Please wait a moment...</p>

          <div className="oauth-dots">
            <div className="oauth-dot" />
            <div className="oauth-dot" />
            <div className="oauth-dot" />
          </div>
        </div>
      </div>
    </>
  );
};

export default OAuth2Callback;