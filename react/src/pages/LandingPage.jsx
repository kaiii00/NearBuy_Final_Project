import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: '🛒', title: 'Browse Local Stores', desc: 'Discover stores near you with fresh products daily.' },
    { icon: '⚡', title: 'Fast Delivery', desc: 'Get your orders delivered in 30 minutes or less.' },
    { icon: '💬', title: 'Live Chat', desc: 'Talk directly to store owners in real time.' },
    { icon: '⭐', title: 'Ratings & Reviews', desc: 'Rate your experience and help others decide.' },
  ];

  const steps = [
    { num: '01', title: 'Create Account', desc: 'Sign up as a buyer or store owner in seconds.' },
    { num: '02', title: 'Browse Stores', desc: 'Find local stores and explore their products.' },
    { num: '03', title: 'Place Order', desc: 'Add to cart and checkout with ease.' },
    { num: '04', title: 'Get Delivered', desc: 'Receive your order fresh at your doorstep.' },
  ];

  const testimonials = [
    { name: 'Maria Santos', role: 'Regular Buyer', text: 'NearBuy changed how I grocery shop. So fast and convenient!', avatar: 'M' },
    { name: 'Juan dela Cruz', role: 'Store Owner', desc: 'My sales doubled since joining NearBuy. Great platform!', text: 'My sales doubled since joining NearBuy. Great platform!', avatar: 'J' },
    { name: 'Ana Reyes', role: 'Regular Buyer', text: 'Love the chat feature. I can ask the store directly!', avatar: 'A' },
  ];

  return (
    <div style={s.root}>
      {/* Background blobs */}
      <div style={s.blob1} />
      <div style={s.blob2} />
      <div style={s.blob3} />

      {/* NAV */}
      <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <div style={s.logoIcon}>N</div>
            <span style={s.logoText}>NearBuy</span>
          </div>
          <div style={s.navLinks}>
            <a href="#features" style={s.navLink}>Features</a>
            <a href="#how" style={s.navLink}>How It Works</a>
            <a href="#testimonials" style={s.navLink}>Reviews</a>
          </div>
          <div style={s.navActions}>
            <Link to="/login" style={s.navLoginBtn}>Sign In</Link>
            <Link to="/register" style={s.navRegisterBtn}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroLeft}>
          <div style={s.heroBadge}>
            <span style={s.badgeDot} />
            Local Delivery Platform · Vigan, Ilocos
          </div>
          <h1 style={s.heroTitle}>
            Fresh & Fast,<br />
            <span style={s.heroTitleAccent}>Delivered Near</span><br />
            <span style={s.heroTitleAccent2}>You.</span>
          </h1>
          <p style={s.heroDesc}>
            Order from local stores around you. Groceries, essentials, and more —
            delivered straight to your door in minutes.
          </p>
          <div style={s.heroCtas}>
            <Link to="/register" style={s.ctaPrimary}>Start Shopping →</Link>
            <Link to="/register" style={s.ctaSecondary}>Sell on NearBuy</Link>
          </div>
          <div style={s.heroStats}>
            {[['500+', 'Local Stores'], ['10k+', 'Happy Buyers'], ['30min', 'Avg Delivery']].map(([n, l]) => (
              <div key={l} style={s.heroStat}>
                <span style={s.heroStatNum}>{n}</span>
                <span style={s.heroStatLabel}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={s.heroRight}>
          {/* Phone mockup */}
          <div style={s.phoneMockup}>
            <div style={s.phoneScreen}>
              <div style={s.phoneHeader}>
                <div style={s.phoneHeaderLeft}>
                  <span style={s.phonePin}>📍</span>
                  <span style={s.phoneLocation}>Vigan City</span>
                </div>
                <div style={s.phoneAvatar}>N</div>
              </div>
              <div style={s.phoneBanner}>
                <div>
                  <div style={s.phoneBannerTag}>Limited Offer</div>
                  <div style={s.phoneBannerTitle}>Free Delivery</div>
                  <div style={s.phoneBannerSub}>on first order!</div>
                </div>
                <div style={s.phoneBannerEmoji}>🛵</div>
              </div>
              <div style={s.phoneSection}>Nearby Stores</div>
              {[
                { name: 'Balagbag Fresh', cat: 'Groceries', rating: '4.8', time: '20 min', color: '#dcfce7' },
                { name: 'Vigan Deli', cat: 'Deli & Meats', rating: '4.6', time: '25 min', color: '#fef3c7' },
              ].map((store) => (
                <div key={store.name} style={s.phoneStoreCard}>
                  <div style={{ ...s.phoneStoreImg, backgroundColor: store.color }}>🏪</div>
                  <div style={s.phoneStoreInfo}>
                    <div style={s.phoneStoreName}>{store.name}</div>
                    <div style={s.phoneStoreMeta}>{store.cat}</div>
                    <div style={s.phoneStoreBottom}>
                      <span style={s.phoneStoreRating}>⭐ {store.rating}</span>
                      <span style={s.phoneStoreDot}>·</span>
                      <span style={s.phoneStoreTime}>🕐 {store.time}</span>
                    </div>
                  </div>
                  <div style={s.phoneStoreArrow}>›</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating cards */}
          <div style={s.floatCard1}>
            <span style={s.floatCardIcon}>✅</span>
            <div>
              <div style={s.floatCardTitle}>Order Delivered!</div>
              <div style={s.floatCardSub}>Just now · 28 mins</div>
            </div>
          </div>
          <div style={s.floatCard2}>
            <span style={s.floatCard2Icon}>⭐</span>
            <div style={s.floatCard2Text}>4.9 / 5.0</div>
            <div style={s.floatCard2Sub}>Avg Rating</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={s.section}>
        <div style={s.sectionBadge}>Why NearBuy</div>
        <h2 style={s.sectionTitle}>Everything you need,<br />in one place</h2>
        <p style={s.sectionDesc}>From browsing to delivery, we've got the whole experience covered.</p>
        <div style={s.featuresGrid}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{ ...s.featureCard, ...(activeFeature === i ? s.featureCardActive : {}) }}
              onMouseEnter={() => setActiveFeature(i)}
            >
              <div style={s.featureIcon}>{f.icon}</div>
              <h3 style={s.featureTitle}>{f.title}</h3>
              <p style={s.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={s.howSection}>
        <div style={s.howInner}>
          <div style={s.howLeft}>
            <div style={s.sectionBadge}>How It Works</div>
            <h2 style={s.sectionTitle}>Order in just<br />4 simple steps</h2>
            <p style={s.sectionDesc}>Getting started with NearBuy is fast and easy.</p>
            <Link to="/register" style={s.ctaPrimary}>Get Started Free →</Link>
          </div>
          <div style={s.howRight}>
            {steps.map((step, i) => (
              <div key={i} style={s.stepCard}>
                <div style={s.stepNum}>{step.num}</div>
                <div style={s.stepContent}>
                  <div style={s.stepTitle}>{step.title}</div>
                  <div style={s.stepDesc}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES SECTION */}
      <section style={s.section}>
        <div style={s.sectionBadge}>Join As</div>
        <h2 style={s.sectionTitle}>Made for everyone<br />in the community</h2>
        <div style={s.rolesGrid}>
          <div style={s.roleCard}>
            <div style={{ ...s.roleCardTop, background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
              <span style={s.roleEmoji}>🛒</span>
            </div>
            <div style={s.roleCardBody}>
              <h3 style={s.roleCardTitle}>For Buyers</h3>
              <p style={s.roleCardDesc}>Shop from local stores near you. Get fresh groceries, daily essentials, and more delivered fast.</p>
              <ul style={s.roleList}>
                <li style={s.roleListItem}>✔ Browse nearby stores</li>
                <li style={s.roleListItem}>✔ Track your orders live</li>
                <li style={s.roleListItem}>✔ Chat with store owners</li>
                <li style={s.roleListItem}>✔ Rate your experience</li>
              </ul>
              <Link to="/register" style={s.roleBtn}>Shop Now →</Link>
            </div>
          </div>
          <div style={s.roleCard}>
            <div style={{ ...s.roleCardTop, background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
              <span style={s.roleEmoji}>🏪</span>
            </div>
            <div style={s.roleCardBody}>
              <h3 style={s.roleCardTitle}>For Store Owners</h3>
              <p style={s.roleCardDesc}>Reach more customers in your area. List your products, manage orders, and grow your business.</p>
              <ul style={s.roleList}>
                <li style={s.roleListItem}>✔ List unlimited products</li>
                <li style={s.roleListItem}>✔ Manage orders easily</li>
                <li style={s.roleListItem}>✔ Chat with buyers</li>
                <li style={s.roleListItem}>✔ Track your earnings</li>
              </ul>
              <Link to="/register" style={{ ...s.roleBtn, background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>Start Selling →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={s.testimonialsSection}>
        <div style={s.sectionBadge}>Reviews</div>
        <h2 style={s.sectionTitle}>What our users say</h2>
        <div style={s.testimonialsGrid}>
          {testimonials.map((t, i) => (
            <div key={i} style={s.testimonialCard}>
              <div style={s.testimonialStars}>⭐⭐⭐⭐⭐</div>
              <p style={s.testimonialText}>"{t.text}"</p>
              <div style={s.testimonialAuthor}>
                <div style={s.testimonialAvatar}>{t.avatar}</div>
                <div>
                  <div style={s.testimonialName}>{t.name}</div>
                  <div style={s.testimonialRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={s.ctaBanner}>
        <div style={s.ctaBannerInner}>
          <h2 style={s.ctaBannerTitle}>Ready to get started?</h2>
          <p style={s.ctaBannerDesc}>Join thousands of buyers and store owners in your community.</p>
          <div style={s.ctaBannerBtns}>
            <Link to="/register" style={s.ctaBannerPrimary}>Create Free Account</Link>
            <Link to="/login" style={s.ctaBannerSecondary}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerBrand}>
            <div style={s.logo}>
              <div style={s.logoIcon}>N</div>
              <span style={s.logoText}>NearBuy</span>
            </div>
            <p style={s.footerBrandDesc}>Fast & fresh delivery from local stores near you.</p>
          </div>
          <div style={s.footerLinks}>
            <div style={s.footerLinkGroup}>
              <div style={s.footerLinkTitle}>Platform</div>
              <Link to="/register" style={s.footerLink}>For Buyers</Link>
              <Link to="/register" style={s.footerLink}>For Store Owners</Link>
              <Link to="/login" style={s.footerLink}>Sign In</Link>
            </div>
            <div style={s.footerLinkGroup}>
              <div style={s.footerLinkTitle}>Company</div>
              <a href="#features" style={s.footerLink}>Features</a>
              <a href="#how" style={s.footerLink}>How It Works</a>
              <a href="#testimonials" style={s.footerLink}>Reviews</a>
            </div>
          </div>
        </div>
        <div style={s.footerBottom}>© 2025 NearBuy. All rights reserved.</div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Sora:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Sora', sans-serif; }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes floatDelay { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blob { 0%,100% { border-radius: 60% 40% 30% 70%/60% 30% 70% 40%; } 50% { border-radius: 30% 60% 70% 40%/50% 60% 30% 60%; } }
      `}</style>
    </div>
  );
};

const s = {
  root: {
    minHeight: '100vh',
    backgroundColor: '#f8faff',
    fontFamily: "'Sora', sans-serif",
    position: 'relative',
    overflowX: 'hidden',
  },
  blob1: {
    position: 'fixed', top: '-100px', right: '-100px',
    width: '500px', height: '500px', borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
    animation: 'blob 8s ease-in-out infinite', pointerEvents: 'none', zIndex: 0,
  },
  blob2: {
    position: 'fixed', bottom: '100px', left: '-150px',
    width: '600px', height: '600px', borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
    animation: 'blob 10s ease-in-out infinite reverse', pointerEvents: 'none', zIndex: 0,
  },
  blob3: {
    position: 'fixed', top: '50%', left: '50%',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
    transform: 'translate(-50%,-50%)',
    pointerEvents: 'none', zIndex: 0,
  },

  // NAV
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    padding: '16px 0',
    transition: 'all 0.3s ease',
  },
  navScrolled: {
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 1px 30px rgba(0,0,0,0.08)',
    padding: '12px 0',
  },
  navInner: {
    maxWidth: '1200px', margin: '0 auto', padding: '0 40px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  logoIcon: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: '800', fontSize: '16px',
    boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
  },
  logoText: { fontSize: '20px', fontWeight: '700', color: '#1e293b', fontFamily: "'Clash Display', sans-serif" },
  navLinks: { display: 'flex', gap: '32px' },
  navLink: { color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' },
  navActions: { display: 'flex', gap: '12px', alignItems: 'center' },
  navLoginBtn: {
    padding: '8px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
    color: '#3b82f6', textDecoration: 'none', border: '1.5px solid rgba(59,130,246,0.3)',
    background: 'rgba(59,130,246,0.05)', transition: 'all 0.2s',
  },
  navRegisterBtn: {
    padding: '8px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
    color: '#fff', textDecoration: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
  },

  // HERO
  hero: {
    maxWidth: '1200px', margin: '0 auto', padding: '140px 40px 80px',
    display: 'flex', alignItems: 'center', gap: '60px', position: 'relative', zIndex: 1,
  },
  heroLeft: { flex: 1 },
  heroBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: '100px', padding: '6px 16px',
    fontSize: '12px', fontWeight: '600', color: '#3b82f6',
    marginBottom: '24px', letterSpacing: '0.5px',
  },
  badgeDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: '#3b82f6', display: 'inline-block',
    boxShadow: '0 0 6px rgba(59,130,246,0.6)',
    animation: 'floatDelay 2s ease-in-out infinite',
  },
  heroTitle: {
    fontSize: '64px', fontWeight: '700', lineHeight: '1.1',
    color: '#0f172a', marginBottom: '20px',
    fontFamily: "'Clash Display', sans-serif",
  },
  heroTitleAccent: { color: '#3b82f6' },
  heroTitleAccent2: {
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  heroDesc: {
    fontSize: '17px', color: '#64748b', lineHeight: '1.7',
    maxWidth: '440px', marginBottom: '36px',
  },
  heroCtas: { display: 'flex', gap: '14px', marginBottom: '48px', flexWrap: 'wrap' },
  ctaPrimary: {
    padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
    color: '#fff', textDecoration: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
    display: 'inline-block', transition: 'all 0.2s',
  },
  ctaSecondary: {
    padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
    color: '#1e293b', textDecoration: 'none',
    background: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(0,0,0,0.08)',
    backdropFilter: 'blur(10px)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    display: 'inline-block',
  },
  heroStats: { display: 'flex', gap: '40px' },
  heroStat: { display: 'flex', flexDirection: 'column', gap: '2px' },
  heroStatNum: { fontSize: '28px', fontWeight: '700', color: '#1e293b', fontFamily: "'Clash Display', sans-serif" },
  heroStatLabel: { fontSize: '13px', color: '#94a3b8', fontWeight: '500' },

  // PHONE
  heroRight: { flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' },
  phoneMockup: {
    width: '280px', height: '560px', borderRadius: '40px',
    background: '#fff', border: '8px solid #e2e8f0',
    boxShadow: '0 40px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
    overflow: 'hidden', position: 'relative', zIndex: 2,
    animation: 'float 6s ease-in-out infinite',
  },
  phoneScreen: { padding: '20px 16px', height: '100%', overflowY: 'hidden' },
  phoneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  phoneHeaderLeft: { display: 'flex', alignItems: 'center', gap: '4px' },
  phonePin: { fontSize: '14px' },
  phoneLocation: { fontSize: '13px', fontWeight: '600', color: '#1e293b' },
  phoneAvatar: {
    width: '28px', height: '28px', borderRadius: '8px',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: '700', fontSize: '12px',
  },
  phoneBanner: {
    borderRadius: '16px', padding: '16px',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  phoneBannerTag: { fontSize: '9px', color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: '4px', letterSpacing: '1px' },
  phoneBannerTitle: { fontSize: '16px', fontWeight: '700', color: '#fff' },
  phoneBannerSub: { fontSize: '11px', color: 'rgba(255,255,255,0.8)' },
  phoneBannerEmoji: { fontSize: '32px' },
  phoneSection: { fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' },
  phoneStoreCard: {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
    borderRadius: '12px', background: '#f8faff', border: '1px solid #e2e8f0',
    marginBottom: '8px',
  },
  phoneStoreImg: {
    width: '40px', height: '40px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
  },
  phoneStoreInfo: { flex: 1 },
  phoneStoreName: { fontSize: '12px', fontWeight: '600', color: '#1e293b' },
  phoneStoreMeta: { fontSize: '10px', color: '#94a3b8', marginTop: '1px' },
  phoneStoreBottom: { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' },
  phoneStoreRating: { fontSize: '10px', color: '#f59e0b', fontWeight: '600' },
  phoneStoreDot: { fontSize: '10px', color: '#cbd5e1' },
  phoneStoreTime: { fontSize: '10px', color: '#64748b' },
  phoneStoreArrow: { fontSize: '18px', color: '#cbd5e1', fontWeight: '300' },

  // FLOAT CARDS
  floatCard1: {
    position: 'absolute', left: '-20px', bottom: '120px', zIndex: 3,
    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.6)', borderRadius: '16px',
    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    animation: 'floatDelay 5s ease-in-out infinite',
  },
  floatCardIcon: { fontSize: '22px' },
  floatCardTitle: { fontSize: '13px', fontWeight: '700', color: '#1e293b' },
  floatCardSub: { fontSize: '11px', color: '#94a3b8', marginTop: '1px' },
  floatCard2: {
    position: 'absolute', right: '-10px', top: '80px', zIndex: 3,
    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.6)', borderRadius: '16px',
    padding: '14px 18px', textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    animation: 'float 4s ease-in-out infinite',
  },
  floatCard2Icon: { fontSize: '22px', display: 'block', marginBottom: '4px' },
  floatCard2Text: { fontSize: '20px', fontWeight: '700', color: '#1e293b', fontFamily: "'Clash Display', sans-serif" },
  floatCard2Sub: { fontSize: '11px', color: '#94a3b8' },

  // SECTIONS
  section: {
    maxWidth: '1200px', margin: '0 auto', padding: '80px 40px',
    textAlign: 'center', position: 'relative', zIndex: 1,
  },
  sectionBadge: {
    display: 'inline-block', marginBottom: '16px',
    background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: '100px', padding: '5px 16px',
    fontSize: '12px', fontWeight: '600', color: '#3b82f6', letterSpacing: '0.5px',
  },
  sectionTitle: {
    fontSize: '44px', fontWeight: '700', color: '#0f172a',
    lineHeight: '1.2', marginBottom: '16px',
    fontFamily: "'Clash Display', sans-serif",
  },
  sectionDesc: { fontSize: '16px', color: '#64748b', marginBottom: '56px', lineHeight: '1.6' },

  // FEATURES
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' },
  featureCard: {
    padding: '32px 24px', borderRadius: '20px',
    background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.8)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease', cursor: 'default', textAlign: 'left',
  },
  featureCardActive: {
    background: 'rgba(255,255,255,0.95)',
    boxShadow: '0 12px 40px rgba(59,130,246,0.15)',
    border: '1px solid rgba(59,130,246,0.2)',
    transform: 'translateY(-4px)',
  },
  featureIcon: { fontSize: '36px', marginBottom: '16px' },
  featureTitle: { fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' },
  featureDesc: { fontSize: '14px', color: '#64748b', lineHeight: '1.6' },

  // HOW IT WORKS
  howSection: {
    background: 'linear-gradient(135deg, rgba(59,130,246,0.04), rgba(99,102,241,0.04))',
    padding: '80px 0', position: 'relative', zIndex: 1,
  },
  howInner: {
    maxWidth: '1200px', margin: '0 auto', padding: '0 40px',
    display: 'flex', gap: '80px', alignItems: 'center',
  },
  howLeft: { flex: 1 },
  howRight: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
  stepCard: {
    display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '24px',
    borderRadius: '16px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
  },
  stepNum: {
    fontSize: '13px', fontWeight: '800', color: '#3b82f6',
    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: '8px', padding: '6px 10px', letterSpacing: '1px', flexShrink: 0,
  },
  stepContent: {},
  stepTitle: { fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' },
  stepDesc: { fontSize: '13px', color: '#64748b', lineHeight: '1.6' },

  // ROLES
  rolesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '900px', margin: '0 auto' },
  roleCard: {
    borderRadius: '24px', overflow: 'hidden',
    background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.9)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.06)', textAlign: 'left',
  },
  roleCardTop: {
    padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  roleEmoji: { fontSize: '64px' },
  roleCardBody: { padding: '28px' },
  roleCardTitle: { fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '10px', fontFamily: "'Clash Display', sans-serif" },
  roleCardDesc: { fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' },
  roleList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' },
  roleListItem: { fontSize: '14px', color: '#475569', fontWeight: '500' },
  roleBtn: {
    display: 'inline-block', padding: '12px 24px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '600',
    boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
  },

  // TESTIMONIALS
  testimonialsSection: {
    background: 'linear-gradient(135deg, rgba(59,130,246,0.03), rgba(99,102,241,0.03))',
    padding: '80px 0', textAlign: 'center', position: 'relative', zIndex: 1,
  },
  testimonialsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px',
    maxWidth: '1100px', margin: '0 auto', padding: '0 40px',
  },
  testimonialCard: {
    padding: '28px', borderRadius: '20px', textAlign: 'left',
    background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
  },
  testimonialStars: { fontSize: '14px', marginBottom: '12px' },
  testimonialText: { fontSize: '14px', color: '#475569', lineHeight: '1.7', marginBottom: '20px', fontStyle: 'italic' },
  testimonialAuthor: { display: 'flex', alignItems: 'center', gap: '12px' },
  testimonialAvatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: '700', fontSize: '16px',
  },
  testimonialName: { fontSize: '14px', fontWeight: '700', color: '#1e293b' },
  testimonialRole: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },

  // CTA BANNER
  ctaBanner: {
    margin: '80px 40px', borderRadius: '32px',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    padding: '80px 40px', textAlign: 'center', position: 'relative', zIndex: 1,
    boxShadow: '0 20px 60px rgba(59,130,246,0.3)',
    overflow: 'hidden',
  },
  ctaBannerInner: { position: 'relative', zIndex: 1 },
  ctaBannerTitle: { fontSize: '48px', fontWeight: '700', color: '#fff', marginBottom: '14px', fontFamily: "'Clash Display', sans-serif" },
  ctaBannerDesc: { fontSize: '17px', color: 'rgba(255,255,255,0.8)', marginBottom: '36px' },
  ctaBannerBtns: { display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' },
  ctaBannerPrimary: {
    padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
    color: '#3b82f6', textDecoration: 'none', background: '#fff',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  },
  ctaBannerSecondary: {
    padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
    color: '#fff', textDecoration: 'none',
    background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)',
    backdropFilter: 'blur(10px)',
  },

  // FOOTER
  footer: {
    background: '#0f172a', padding: '60px 0 0', position: 'relative', zIndex: 1,
  },
  footerInner: {
    maxWidth: '1200px', margin: '0 auto', padding: '0 40px 48px',
    display: 'flex', justifyContent: 'space-between', gap: '60px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  footerBrand: { maxWidth: '280px' },
  footerBrandDesc: { fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginTop: '12px' },
  footerLinks: { display: 'flex', gap: '60px' },
  footerLinkGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
  footerLinkTitle: { fontSize: '13px', fontWeight: '700', color: '#fff', letterSpacing: '1px', marginBottom: '4px' },
  footerLink: { fontSize: '14px', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' },
  footerBottom: {
    maxWidth: '1200px', margin: '0 auto', padding: '20px 40px',
    fontSize: '13px', color: '#475569',
  },
};

export default LandingPage;