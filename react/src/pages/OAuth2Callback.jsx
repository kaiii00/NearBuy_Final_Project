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

  return <div style={{ color: '#fff', textAlign: 'center', marginTop: '40vh' }}>Signing you in...</div>;
};

export default OAuth2Callback;