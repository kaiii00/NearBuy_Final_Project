import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Icon = ({ children, className = '' }) => (
  <svg
    className={`w-5 h-5 ${className}`}
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

const MapPin = () => (
  <Icon>
    <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);

const Store = () => (
  <Icon>
    <path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" />
    <path d="M9 21V12h6v9" />
  </Icon>
);

const Truck = () => (
  <Icon>
    <path d="M14 18H4v-8h11v8z" />
    <path d="M14 10h3l3 3v5h-6" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </Icon>
);

const Message = () => (
  <Icon>
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />
  </Icon>
);

const Star = ({ filled }) => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" aria-hidden>
    <path
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      d="M10 2.5l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L10 2.5z"
    />
  </svg>
);

const Check = () => (
  <Icon className="w-4 h-4 text-emerald-700">
    <path d="M20 6L9 17l-5-5" />
  </Icon>
);

const Award = () => (
  <Icon>
    <path d="M12 15l-3.2 1.7.6-3.6-2.7-2.3 3.9-.3L12 6l1.4 4.5 3.9.3-2.7 2.3.6 3.6L12 15z" />
    <circle cx="12" cy="12" r="9" />
  </Icon>
);

const features = [
  {
    title: 'Browse local stores',
    desc: 'See what shops around Vigan have in stock before you leave home.',
    Icon: Store,
  },
  {
    title: 'Quick delivery',
    desc: 'Most orders reach buyers within the hour, depending on the store.',
    Icon: Truck,
  },
  {
    title: 'Chat with sellers',
    desc: 'Ask about availability, substitutions, or pickup times in one thread.',
    Icon: Message,
  },
  {
    title: 'Honest reviews',
    desc: 'Ratings from real orders help you choose stores you can trust.',
    Icon: Award,
  },
];

const steps = [
  { num: '1', title: 'Create an account', desc: 'Register as a buyer or store owner with a few details.' },
  { num: '2', title: 'Pick a store', desc: 'Browse listings and open a shop profile that fits what you need.' },
  { num: '3', title: 'Place your order', desc: 'Add items, confirm delivery details, and pay when you check out.' },
  { num: '4', title: 'Track delivery', desc: 'Follow status updates until your order arrives.' },
];

const testimonials = [
  {
    name: 'Maria Santos',
    role: 'Buyer, Vigan',
    text: 'I stopped making separate trips for groceries. One app, a few taps, and it shows up.',
    avatar: 'MS',
  },
  {
    name: 'Juan dela Cruz',
    role: 'Store owner',
    text: 'We reach customers who never walked past our storefront. Orders are easier to manage now.',
    avatar: 'JD',
  },
  {
    name: 'Ana Reyes',
    role: 'Buyer',
    text: 'Being able to message the store before checkout saved me from wrong sizes twice.',
    avatar: 'AR',
  },
];

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f5f1] font-['DM_Sans',system-ui,sans-serif] text-slate-800 antialiased">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap"
      />

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'border-b border-stone-200/80 bg-[#f7f5f1]/90 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              N
            </span>
            <span className="font-['Libre_Baskerville'] text-lg font-bold tracking-tight text-slate-900">
              NearBuy
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Features
            </a>
            <a href="#how" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              How it works
            </a>
            <a href="#reviews" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Reviews
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 no-underline hover:bg-stone-200/60"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-slate-800"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(30,61,53,0.08),transparent)]" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2 md:gap-16 md:px-8">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Vigan &amp; nearby
              </p>
              <h1 className="font-['Libre_Baskerville'] text-4xl font-bold leading-[1.15] text-slate-900 sm:text-5xl lg:text-[3.25rem]">
                Local stores,
                <br />
                <span className="text-[#1e4d3a]">delivered nearby.</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600">
                NearBuy connects you with neighborhood shops for groceries, essentials, and daily
                needs—without the runaround.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-lg bg-[#1e4d3a] px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-[#163d2f]"
                >
                  Start shopping
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 no-underline hover:border-stone-400"
                >
                  List your store
                </Link>
              </div>
              <dl className="mt-12 flex flex-wrap gap-10 border-t border-stone-300/70 pt-8">
                {[
                  ['120+', 'Partner stores'],
                  ['8k', 'Orders placed'],
                  ['~45 min', 'Typical delivery'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="font-['Libre_Baskerville'] text-2xl font-bold text-slate-900">{value}</dt>
                    <dd className="mt-0.5 text-sm text-slate-500">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* App preview */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="rounded-[2rem] border border-stone-300 bg-white p-4 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.12)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    <MapPin />
                    <span>Vigan City</span>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
                    N
                  </span>
                </div>
                <div className="mb-4 rounded-xl bg-[#1e4d3a] px-4 py-3.5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                    First order
                  </p>
                  <p className="mt-1 text-lg font-semibold">Free delivery</p>
                  <p className="text-xs text-white/80">Within 3 km of the store</p>
                </div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Nearby stores
                </p>
                {[
                  { name: 'Balagbag Fresh Market', cat: 'Groceries', rating: '4.8', time: '20 min', tint: 'bg-emerald-50 text-emerald-800' },
                  { name: 'Vigan Deli & Meats', cat: 'Deli', rating: '4.6', time: '25 min', tint: 'bg-amber-50 text-amber-900' },
                ].map((store) => (
                  <div
                    key={store.name}
                    className="mb-2 flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/80 p-3"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${store.tint}`}
                    >
                      {store.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{store.name}</p>
                      <p className="text-xs text-slate-500">{store.cat}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                        <span className="flex text-amber-600">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} filled={i <= 4} />
                          ))}
                        </span>
                        <span>{store.rating}</span>
                        <span className="text-stone-400">·</span>
                        <span>{store.time}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute -left-4 bottom-8 hidden rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-lg sm:block">
                <p className="text-sm font-semibold text-slate-900">Order delivered</p>
                <p className="text-xs text-slate-500">28 minutes ago</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-stone-300/60 bg-white py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4d3a]">Why NearBuy</p>
            <h2 className="mt-2 max-w-lg font-['Libre_Baskerville'] text-3xl font-bold text-slate-900 md:text-4xl">
              Built for how people actually shop locally
            </h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ title, desc, Icon: FeatureIcon }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-stone-200 bg-[#faf9f7] p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#1e4d3a] shadow-sm ring-1 ring-stone-200">
                    <FeatureIcon />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-20 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2 md:items-start md:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4d3a]">How it works</p>
              <h2 className="mt-2 font-['Libre_Baskerville'] text-3xl font-bold text-slate-900 md:text-4xl">
                Four steps from browse to doorstep
              </h2>
              <p className="mt-4 max-w-md text-slate-600">
                Whether you are stocking the pantry or running a sari-sari store, the flow stays
                straightforward.
              </p>
              <Link
                to="/register"
                className="mt-8 inline-flex rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-slate-800"
              >
                Create free account
              </Link>
            </div>
            <ol className="space-y-4">
              {steps.map((step) => (
                <li
                  key={step.num}
                  className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e4d3a] text-sm font-bold text-white">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Roles */}
        <section className="border-y border-stone-300/60 bg-white py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <p className="text-center text-sm font-semibold uppercase tracking-wide text-[#1e4d3a]">
              Join as
            </p>
            <h2 className="mt-2 text-center font-['Libre_Baskerville'] text-3xl font-bold text-slate-900 md:text-4xl">
              Buyers and store owners use the same platform
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200">
                <div className="border-b border-stone-200 bg-[#eef4f1] px-8 py-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#1e4d3a] shadow-sm">
                    <Store />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="font-['Libre_Baskerville'] text-xl font-bold text-slate-900">For buyers</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Shop from stores you already know, with delivery to your address or a nearby
                    landmark.
                  </p>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {['Browse stores by category', 'Track order status', 'Message sellers', 'Leave ratings'].map(
                      (item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                          <Check />
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                  <Link
                    to="/register"
                    className="mt-6 inline-flex w-fit rounded-lg bg-[#1e4d3a] px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#163d2f]"
                  >
                    Shop now
                  </Link>
                </div>
              </article>

              <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200">
                <div className="border-b border-stone-200 bg-[#f5f0e8] px-8 py-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-amber-900 shadow-sm">
                    <Truck />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="font-['Libre_Baskerville'] text-xl font-bold text-slate-900">
                    For store owners
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Put your catalog online, take orders in one place, and reply when customers have
                    questions.
                  </p>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {['List products and prices', 'Manage incoming orders', 'Chat with buyers', 'View sales history'].map(
                      (item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                          <Check />
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                  <Link
                    to="/register"
                    className="mt-6 inline-flex w-fit rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-slate-800"
                  >
                    Start selling
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section id="reviews" className="py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4d3a]">Reviews</p>
            <h2 className="mt-2 font-['Libre_Baskerville'] text-3xl font-bold text-slate-900 md:text-4xl">
              From people in the area
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {testimonials.map((t) => (
                <blockquote
                  key={t.name}
                  className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6"
                >
                  <div className="mb-3 flex gap-0.5 text-amber-600">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} filled />
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-slate-700">&ldquo;{t.text}&rdquo;</p>
                  <footer className="mt-5 flex items-center gap-3 border-t border-stone-100 pt-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-200 text-xs font-bold text-slate-700">
                      {t.avatar}
                    </span>
                    <div>
                      <cite className="not-italic text-sm font-semibold text-slate-900">{t.name}</cite>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-5 mb-20 max-w-6xl rounded-2xl bg-slate-900 px-6 py-14 text-center md:mx-auto md:px-12">
          <h2 className="font-['Libre_Baskerville'] text-2xl font-bold text-white md:text-3xl">
            Ready to try NearBuy?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
            Set up an account in a few minutes. No card required to browse stores.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 no-underline hover:bg-stone-100"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-slate-600 px-6 py-3 text-sm font-semibold text-white no-underline hover:border-slate-500"
            >
              Sign in
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-300 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-12 md:flex-row md:justify-between md:px-8">
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2.5 no-underline">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                N
              </span>
              <span className="font-['Libre_Baskerville'] font-bold text-slate-900">NearBuy</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Local delivery for Vigan and nearby communities.
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-900">Platform</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link to="/register" className="text-sm text-slate-600 no-underline hover:text-slate-900">
                    For buyers
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm text-slate-600 no-underline hover:text-slate-900">
                    For store owners
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-sm text-slate-600 no-underline hover:text-slate-900">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-900">Site</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <a href="#features" className="text-sm text-slate-600 no-underline hover:text-slate-900">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how" className="text-sm text-slate-600 no-underline hover:text-slate-900">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#reviews" className="text-sm text-slate-600 no-underline hover:text-slate-900">
                    Reviews
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-stone-200 py-5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} NearBuy. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
