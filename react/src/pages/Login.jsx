import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';

const Icon = ({ children, className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {children}
  </svg>
);

const StoreIcon = () => (
  <Icon className="w-4 h-4">
    <path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" />
    <path d="M9 21V12h6v9" />
  </Icon>
);

const TruckIcon = () => (
  <Icon className="w-4 h-4">
    <path d="M14 18H4v-8h11v8z" />
    <path d="M14 10h3l3 3v5h-6" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </Icon>
);

const MessageIcon = () => (
  <Icon className="w-4 h-4">
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />
  </Icon>
);

const StarIcon = () => (
  <Icon className="w-4 h-4">
    <path d="M12 2.5l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L12 2.5z" />
  </Icon>
);

const highlights = [
  { Icon: StoreIcon, text: 'Local stores' },
  { Icon: TruckIcon, text: 'Fast delivery' },
  { Icon: MessageIcon, text: 'Seller chat' },
  { Icon: StarIcon, text: 'Reviews' },
];

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
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: res.data.userId,
          username: res.data.username,
          email: res.data.email,
          role: res.data.role,
        })
      );
      if (res.data.role === 'buyer') navigate('/buyer/dashboard');
      else if (res.data.role === 'store_owner') navigate('/store/dashboard');
      else if (res.data.role === 'admin') navigate('/admin/dashboard');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f1] font-['DM_Sans',system-ui,sans-serif] text-slate-800 antialiased">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap"
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(30,77,58,0.06),transparent)]" />

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col px-5 py-6 sm:px-8">
        <header className="mb-6 flex items-center justify-between lg:mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 no-underline">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              N
            </span>
            <span className="font-['Libre_Baskerville'] text-lg font-bold text-slate-900">NearBuy</span>
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 no-underline hover:text-slate-900 lg:hidden"
          >
            Home
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center pb-4">
          <div className="grid w-full max-w-3xl items-center gap-8 lg:grid-cols-2 lg:gap-10">
            {/* Left intro */}
            <aside className="hidden lg:block">
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_12px_32px_-12px_rgba(15,23,42,0.08)]">
                <div className="bg-[#1e4d3a] px-5 py-4 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
                    NearBuy · Vigan
                  </p>
                  <p className="mt-2 font-['Libre_Baskerville'] text-xl font-bold leading-snug">
                    Your neighborhood market, online.
                  </p>
                </div>

                <div className="space-y-4 p-5">
                  <p className="text-sm leading-relaxed text-slate-600">
                    Order from local shops or manage your store—all from one account.
                  </p>

                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#faf9f7] p-2.5 ring-1 ring-stone-200">
                    {[
                      ['120+', 'stores'],
                      ['8k', 'orders'],
                      ['~45m', 'delivery'],
                    ].map(([value, label]) => (
                      <div key={label} className="text-center">
                        <p className="font-['Libre_Baskerville'] text-base font-bold text-slate-900">
                          {value}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {highlights.map(({ Icon: ItemIcon, text }) => (
                      <div
                        key={text}
                        className="flex items-center gap-2 rounded-md bg-[#faf9f7] px-2.5 py-2 ring-1 ring-stone-100"
                      >
                        <span className="text-[#1e4d3a]">
                          <ItemIcon />
                        </span>
                        <span className="text-xs font-medium text-slate-700">{text}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-500">
                    Buyers and sari-sari stores across Ilocos Sur.
                  </p>
                </div>
              </div>
            </aside>

            {/* Sign in */}
            <div className="w-full">
              <div className="mb-4 text-center lg:hidden">
                <h1 className="font-['Libre_Baskerville'] text-2xl font-bold text-slate-900">
                  Sign in to <span className="text-[#1e4d3a]">NearBuy</span>
                </h1>
                <p className="mt-1 text-sm text-slate-500">Local stores, delivered nearby</p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.08)] sm:p-7">
                <h2 className="font-['Libre_Baskerville'] text-xl font-bold text-slate-900 lg:text-2xl">
                  Sign in
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">Use your NearBuy credentials</p>

                {error && (
                  <div
                    className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
                    role="alert"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3.5">
                  <div>
                    <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
                      Username
                    </label>
                    <div className="flex items-center overflow-hidden rounded-lg border border-stone-300 bg-[#faf9f7] transition-colors focus-within:border-[#1e4d3a] focus-within:ring-2 focus-within:ring-[#1e4d3a]/15">
                      <span className="px-3 text-slate-400">
                        <Icon className="h-[18px] w-[18px]">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </Icon>
                      </span>
                      <input
                        id="username"
                        type="text"
                        name="username"
                        placeholder="Your username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        autoComplete="username"
                        className="flex-1 border-0 bg-transparent py-2.5 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <div className="flex items-center overflow-hidden rounded-lg border border-stone-300 bg-[#faf9f7] transition-colors focus-within:border-[#1e4d3a] focus-within:ring-2 focus-within:ring-[#1e4d3a]/15">
                      <span className="px-3 text-slate-400">
                        <Icon className="h-[18px] w-[18px]">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </Icon>
                      </span>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                        className="flex-1 border-0 bg-transparent py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="px-3 text-slate-400 hover:text-slate-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <Icon className="h-[18px] w-[18px]">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </Icon>
                        ) : (
                          <Icon className="h-[18px] w-[18px]">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </Icon>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors ${
                      loading
                        ? 'cursor-not-allowed bg-[#1e4d3a]/50'
                        : 'bg-[#1e4d3a] hover:bg-[#163d2f]'
                    }`}
                  >
                    {loading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Signing in…
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </form>

                <div className="relative my-4 text-center text-xs text-slate-500">
                  <span className="relative z-10 bg-white px-2">or</span>
                  <div className="absolute inset-x-0 top-1/2 h-px bg-stone-200" aria-hidden />
                </div>

                <a
                  href="http://localhost:8080/oauth2/authorization/google"
                  className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-stone-300 bg-white py-2.5 text-sm font-semibold text-slate-700 no-underline transition-colors hover:border-stone-400 hover:bg-stone-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </a>

                <p className="mt-4 text-center text-sm text-slate-600">
                  New here?{' '}
                  <Link to="/register" className="font-semibold text-[#1e4d3a] no-underline hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
