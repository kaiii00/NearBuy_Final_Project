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
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('user', JSON.stringify({
        id: res.data.userId,
        username: res.data.username,
        email: res.data.email,
        role: res.data.role,
      }));
      if (res.data.role === 'buyer') navigate('/buyer/dashboard');
      else if (res.data.role === 'store_owner') navigate('/store/dashboard');
      else if (res.data.role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-[#0a0f1e] via-[#0d1117] to-[#0a0f1e]">

      {/* Ambient glows */}
      <div className="absolute pointer-events-none w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,transparent_70%)] -top-[200px] -left-[150px]" />
      <div className="absolute pointer-events-none w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.10)_0%,transparent_70%)] -bottom-[100px] right-1/4" />
      <div className="absolute pointer-events-none w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] top-[40%] right-[10%]" />

      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Left Panel */}
      <div className="flex-1 hidden lg:flex items-center justify-center px-8 xl:px-16">
        <div className="max-w-lg w-full">

          {/* Brand badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase bg-blue-500/10 border border-blue-500/25 text-blue-400 backdrop-blur-lg transition-all duration-300 hover:bg-blue-500/20 hover:border-blue-500/40 hover:scale-105 cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Local Delivery Platform
          </div>

          {/* Headline */}
          <h1 className="font-black leading-none mb-6 text-4xl sm:text-5xl xl:text-[58px] text-white tracking-tight">
            Fast &<br />
            <span className="bg-gradient-to-br from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Fresh.
            </span>
          </h1>

          <p className="text-base leading-relaxed mb-10 text-slate-500 max-w-[380px]">
            Order from local stores near you. Get groceries and essentials delivered straight to your door.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-0 mb-10 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
            {[
              { num: '500+', label: 'Local Stores' },
              { num: '10k+', label: 'Happy Buyers' },
              { num: '30min', label: 'Avg Delivery' },
            ].map((s, i) => (
              <div 
                key={i} 
                className={`flex-1 text-center py-5 transition-all duration-300 hover:bg-white/[0.03] cursor-default ${i < 2 ? 'border-r border-white/[0.06]' : ''}`}
              >
                <div className="font-bold text-xl text-blue-500 transition-transform duration-300 group-hover:scale-110">{s.num}</div>
                <div className="text-xs mt-1 text-slate-600">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="flex flex-col gap-3">
            {[
              { icon: '⌂', text: 'Browse nearby stores' },
              { icon: '↯', text: 'Real-time delivery tracking' },
              { icon: '◎', text: 'Chat with store owners' },
              { icon: '◈', text: 'Rate your experience' },
            ].map((f, i) => (
              <div 
                key={i} 
                className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-lg transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.10] hover:translate-x-2 hover:shadow-lg hover:shadow-blue-500/5 cursor-default group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20 transition-all duration-300 group-hover:bg-blue-500/25 group-hover:scale-110 group-hover:rotate-3">
                  {f.icon}
                </div>
                <span className="text-sm text-slate-400 transition-colors duration-300 group-hover:text-slate-300">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-16 py-8">
        <div className="w-full max-w-md">

          {/* Glass card */}
          <div className="rounded-3xl p-6 sm:p-8 lg:p-10 bg-white/[0.04] border border-white/[0.08] backdrop-blur-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-500 hover:bg-white/[0.05] hover:border-white/[0.12]">

            {/* Logo */}
            <div className="flex items-center gap-2 mb-8 group cursor-default">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-[0_4px_16px_rgba(59,130,246,0.4)] transition-all duration-300 group-hover:shadow-[0_6px_24px_rgba(59,130,246,0.5)] group-hover:scale-110">
                N
              </div>
              <span className="font-bold text-lg text-white tracking-tight transition-colors duration-300 group-hover:text-blue-400">NearBuy</span>
            </div>

            <h2 className="font-bold mb-1 text-2xl sm:text-[26px] text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm mb-8 text-slate-600">Sign in to continue shopping</p>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm bg-red-500/[0.08] border border-red-500/20 text-red-400 animate-[shake_0.5s_ease-in-out]">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Username */}
              <div className="group">
                <label className="block text-xs font-semibold mb-2 tracking-widest uppercase text-slate-700 transition-colors duration-300 group-focus-within:text-blue-400">
                  Username
                </label>
                <div className="flex items-center rounded-xl overflow-hidden bg-white/[0.05] border border-white/[0.08] transition-all duration-300 focus-within:border-blue-500/50 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] hover:border-white/[0.15]">
                  <div className="px-4 flex items-center justify-center text-slate-700 transition-colors duration-300 group-focus-within:text-blue-400">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="flex-1 py-4 pr-4 bg-transparent outline-none text-sm text-white placeholder:text-slate-700 caret-blue-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-xs font-semibold mb-2 tracking-widest uppercase text-slate-700 transition-colors duration-300 group-focus-within:text-blue-400">
                  Password
                </label>
                <div className="flex items-center rounded-xl overflow-hidden bg-white/[0.05] border border-white/[0.08] transition-all duration-300 focus-within:border-blue-500/50 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] hover:border-white/[0.15]">
                  <div className="px-4 flex items-center justify-center text-slate-700 transition-colors duration-300 group-focus-within:text-blue-400">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="flex-1 py-4 bg-transparent outline-none text-sm text-white placeholder:text-slate-700 caret-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-4 flex items-center justify-center text-slate-700 bg-transparent border-none cursor-pointer transition-all duration-300 hover:text-blue-400 hover:scale-110 active:scale-95"
                  >
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Sign in button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold text-sm mt-2 text-white border-none tracking-wide transition-all duration-300 ${
                  loading 
                    ? 'bg-blue-500/40 cursor-not-allowed' 
                    : 'bg-gradient-to-br from-blue-500 to-indigo-500 cursor-pointer shadow-[0_8px_32px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            {/* OAuth Buttons */}
            <div className="flex flex-col gap-3 my-6">
              
                <a href="http://localhost:8080/oauth2/authorization/google"
                className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl text-sm font-semibold bg-white/[0.04] border border-white/[0.08] text-slate-300 no-underline transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.15] hover:scale-[1.02] hover:-translate-y-0.5"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </a>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-slate-700">New to NearBuy?</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Register button */}
            <Link
              to="/register"
              className="block w-full py-4 rounded-xl text-center text-sm font-semibold bg-white/[0.04] border border-white/[0.08] text-blue-400 no-underline backdrop-blur-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-300 hover:bg-white/[0.08] hover:border-blue-500/30 hover:text-blue-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-[0.98] active:translate-y-0"
            >
              Create an Account
            </Link>
          </div>

          {/* Mobile-only brand badge */}
          <div className="lg:hidden flex justify-center mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase bg-blue-500/10 border border-blue-500/25 text-blue-400 backdrop-blur-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Local Delivery Platform
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
