import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

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

const BagIcon = () => (
  <Icon className="w-5 h-5">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </Icon>
);

const ShopIcon = () => (
  <Icon className="w-5 h-5">
    <path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" />
    <path d="M9 21V12h6v9" />
  </Icon>
);

const Field = ({ id, label, icon, children }) => (
  <div>
    <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
      {label}
    </label>
    <div className="flex items-center overflow-hidden rounded-lg border border-stone-300 bg-[#faf9f7] transition-colors focus-within:border-[#1e4d3a] focus-within:ring-2 focus-within:ring-[#1e4d3a]/15">
      {icon && <span className="px-3 text-slate-400">{icon}</span>}
      {children}
    </div>
  </div>
);

const inputClass =
  'w-full border-0 bg-transparent py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400';

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

  const roles = [
    {
      id: 'buyer',
      label: 'Buyer',
      desc: 'Shop local stores',
      Icon: BagIcon,
    },
    {
      id: 'store_owner',
      label: 'Store owner',
      desc: 'Sell your products',
      Icon: ShopIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f1] font-['DM_Sans',system-ui,sans-serif] text-slate-800 antialiased">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap"
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(30,77,58,0.06),transparent)]" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-6 sm:px-8">
        <header className="mb-6 flex shrink-0 items-center justify-between lg:mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 no-underline">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              N
            </span>
            <span className="font-['Libre_Baskerville'] text-lg font-bold text-slate-900">NearBuy</span>
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-slate-600 no-underline hover:text-slate-900"
          >
            Sign in
          </Link>
        </header>

        <div className="flex flex-1 items-start justify-center pb-6 lg:items-center">
          <div className="grid w-full items-start gap-8 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-10">
            {/* Left intro */}
            <aside className="hidden lg:block lg:sticky lg:top-8">
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_12px_32px_-12px_rgba(15,23,42,0.08)]">
                <div className="bg-[#1e4d3a] px-5 py-4 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
                    Join NearBuy
                  </p>
                  <p className="mt-2 font-['Libre_Baskerville'] text-xl font-bold leading-snug">
                    Open an account in minutes.
                  </p>
                </div>

                <div className="space-y-4 p-5">
                  <p className="text-sm leading-relaxed text-slate-600">
                    Register as a buyer to order from neighborhood shops, or as a store owner to list
                    products and take orders online.
                  </p>

                  <div className="space-y-2">
                    <div className="rounded-lg border border-stone-200 bg-[#faf9f7] p-3">
                      <p className="text-xs font-semibold text-[#1e4d3a]">Buyers</p>
                      <p className="mt-1 text-xs text-slate-600">
                        Browse stores, chat with sellers, and get delivery to your door.
                      </p>
                    </div>
                    <div className="rounded-lg border border-stone-200 bg-[#faf9f7] p-3">
                      <p className="text-xs font-semibold text-[#1e4d3a]">Store owners</p>
                      <p className="mt-1 text-xs text-slate-600">
                        Reach more customers in Vigan and manage orders from one dashboard.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#faf9f7] p-2.5 ring-1 ring-stone-200">
                    {[
                      ['120+', 'stores'],
                      ['8k', 'orders'],
                      ['Free', 'to join'],
                    ].map(([value, label]) => (
                      <div key={label} className="text-center">
                        <p className="font-['Libre_Baskerville'] text-base font-bold text-slate-900">
                          {value}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Form */}
            <div className="w-full min-w-0">
              <div className="mb-4 text-center lg:hidden">
                <h1 className="font-['Libre_Baskerville'] text-2xl font-bold text-slate-900">
                  Join <span className="text-[#1e4d3a]">NearBuy</span>
                </h1>
                <p className="mt-1 text-sm text-slate-500">Create your account below</p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.08)] sm:p-7">
                <h2 className="font-['Libre_Baskerville'] text-xl font-bold text-slate-900 lg:text-2xl">
                  Create account
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">Fill in your details to get started</p>

                {error && (
                  <div
                    className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
                    role="alert"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0">
                      <path d="M12 9v4M12 17h.01" />
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    </Icon>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700">I am a</p>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map(({ id, label, desc, Icon: RoleIcon }) => {
                        const active = formData.role === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setFormData({ ...formData, role: id })}
                            className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-3 text-center transition-colors ${
                              active
                                ? 'border-[#1e4d3a] bg-[#eef4f1] ring-1 ring-[#1e4d3a]/20'
                                : 'border-stone-200 bg-[#faf9f7] hover:border-stone-300'
                            }`}
                          >
                            <span className={active ? 'text-[#1e4d3a]' : 'text-slate-500'}>
                              <RoleIcon />
                            </span>
                            <span className="text-sm font-semibold text-slate-900">{label}</span>
                            <span className="text-[11px] text-slate-500">{desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Field
                    id="username"
                    label="Username"
                    icon={
                      <Icon className="h-[18px] w-[18px]">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </Icon>
                    }
                  >
                    <input
                      id="username"
                      className={inputClass}
                      type="text"
                      name="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      autoComplete="username"
                    />
                  </Field>

                  <Field
                    id="email"
                    label="Email"
                    icon={
                      <Icon className="h-[18px] w-[18px]">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </Icon>
                    }
                  >
                    <input
                      id="email"
                      className={inputClass}
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </Field>

                  <Field
                    id="password"
                    label="Password"
                    icon={
                      <Icon className="h-[18px] w-[18px]">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </Icon>
                    }
                  >
                    <input
                      id="password"
                      className={`${inputClass} flex-1`}
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
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
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </Icon>
                      ) : (
                        <Icon className="h-[18px] w-[18px]">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </Icon>
                      )}
                    </button>
                  </Field>

                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <Field
                      id="address"
                      label="Address"
                      icon={
                        <Icon className="h-[18px] w-[18px]">
                          <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </Icon>
                      }
                    >
                      <input
                        id="address"
                        className={inputClass}
                        type="text"
                        name="address"
                        placeholder="Your address"
                        value={formData.address}
                        onChange={handleChange}
                        autoComplete="street-address"
                      />
                    </Field>

                    <Field
                      id="contact"
                      label="Contact"
                      icon={
                        <Icon className="h-[18px] w-[18px]">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.37 1.58.7 2.29a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.73.39 1.53.67 2.36.84A2 2 0 0 1 22 16.92z" />
                        </Icon>
                      }
                    >
                      <input
                        id="contact"
                        className={inputClass}
                        type="text"
                        name="contact"
                        placeholder="Phone number"
                        value={formData.contact}
                        onChange={handleChange}
                        autoComplete="tel"
                      />
                    </Field>
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
                    {loading ? 'Creating account…' : 'Create account'}
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-[#1e4d3a] no-underline hover:underline">
                    Sign in
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

export default Register;
