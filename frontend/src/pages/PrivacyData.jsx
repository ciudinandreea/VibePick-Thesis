import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api';
import api from '../services/api';

const FONT = "'Montserrat', sans-serif";

const CalIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const HeartNavIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const TvIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/>
  </svg>
);
const FeedIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const ShieldIco = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const UserIco = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const LogoutIco = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const HamIco = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const WatchedIco = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const GenreIco = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const DatabaseIco = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);
const ExportIco = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const LegalIco = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const DownloadIco = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

function Navbar() {
  const navigate = useNavigate();
  const user     = getCurrentUser();
  const name     = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const path     = window.location.pathname;
  const menuRef  = useRef(null);
  const userRef  = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    const fn = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const nh = (e, on) => {
    e.currentTarget.style.color      = on ? '#c084fc' : 'rgba(255,255,255,0.75)';
    e.currentTarget.style.background = on ? 'rgba(124,58,237,0.18)' : 'none';
  };

  const NAV_LINKS = [
    { ico: <CalIco />,      label: 'Mood History Calendar', to: '/mood-history'  },
    { ico: <HeartNavIco />, label: 'Wishlist',              to: '/wishlist'       },
    { ico: <TvIco />,       label: 'Subscription Manager',  to: '/subscriptions' },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100, height: 68,
      background: 'rgba(30,10,60,0.55)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(124,58,237,0.30)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 28px', fontFamily: FONT,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Link to="/browse" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="VibePick" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }} />
          <span style={{ fontSize: 21, fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>VibePick</span>
        </Link>
        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
        <Link to="/browse" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 9, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', background: 'none', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.color='#c084fc'; e.currentTarget.style.background='rgba(124,58,237,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.85)'; e.currentTarget.style.background='none'; }}>
            <FeedIco /> Discovery Feed
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {NAV_LINKS.map(({ ico, label, to }) => {
          const active = path === to;
          return (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, fontSize: 13, fontWeight: 600, color: active ? '#c084fc' : 'rgba(255,255,255,0.75)', background: active ? 'rgba(124,58,237,0.2)' : 'none', whiteSpace: 'nowrap', transition: 'background 0.15s, color 0.15s' }}
                onMouseEnter={e => nh(e, true)}
                onMouseLeave={e => { e.currentTarget.style.color = active ? '#c084fc' : 'rgba(255,255,255,0.75)'; e.currentTarget.style.background = active ? 'rgba(124,58,237,0.2)' : 'none'; }}>
                {ico} {label}
              </div>
            </Link>
          );
        })}

        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

        <div style={{ position: 'relative' }} ref={userRef}>
          <div onClick={() => setUserOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: userOpen ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '5px 13px 5px 8px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)', cursor: 'pointer', transition: 'background 0.15s' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }}>{name[0]?.toUpperCase()}</div>
            {name}
          </div>
          {userOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 200, background: 'rgba(20,8,50,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(124,58,237,0.30)', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.45)', overflow: 'hidden', animation: 'pd-fadeUp 0.18s ease both', zIndex: 300 }}>
              {[{ ico: <WatchedIco />, label: 'Watched Movies', to: '/watched' }, { ico: <GenreIco />, label: 'Favorite Genres', to: '/genres' }].map(({ ico, label, to }) => (
                <Link key={to} to={to} style={{ textDecoration: 'none' }} onClick={() => setUserOpen(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', fontSize: 13, fontWeight: 600, color: 'white', borderBottom: '1px solid rgba(255,255,255,0.07)', transition: 'background 0.12s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.background='none'}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{ico}</span> {label}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button onClick={() => setMenuOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 9, background: menuOpen ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.75)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.18)'}
            onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}>
            <HamIco />
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 200, background: 'rgba(20,8,50,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(124,58,237,0.30)', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.45)', overflow: 'hidden', animation: 'pd-fadeUp 0.18s ease both', zIndex: 300 }}>
              {[{ ico: <ShieldIco />, label: 'Privacy & Data', to: '/privacy' }, { ico: <UserIco />, label: 'Your Account', to: '/account' }].map(({ ico, label, to }) => (
                <Link key={to} to={to} style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', fontSize: 13, fontWeight: 600, color: 'white', borderBottom: '1px solid rgba(255,255,255,0.07)', transition: 'background 0.12s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.background='none'}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{ico}</span> {label}
                  </div>
                </Link>
              ))}
              <div onClick={() => { setMenuOpen(false); logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#f87171', cursor: 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.10)'}
                onMouseLeave={e => e.currentTarget.style.background='none'}>
                <LogoutIco /> Log Out
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function DlButton({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '11px 20px', borderRadius: 10, cursor: 'pointer',
        fontFamily: FONT, fontSize: 13, fontWeight: 700,
        background: hov ? 'rgba(124,58,237,0.28)' : 'rgba(124,58,237,0.14)',
        border: `1px solid ${hov ? 'rgba(124,58,237,0.55)' : 'rgba(124,58,237,0.30)'}`,
        color: hov ? 'white' : 'rgba(255,255,255,0.85)',
        transition: 'all 0.18s ease',
        width: '100%', justifyContent: 'center',
      }}>
      <DownloadIco /> {label}
    </button>
  );
}

export default function PrivacyData() {
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  async function handleExportData() {
    setExporting(true);
    try {
      const resp = await api.get('/profile/export', { responseType: 'blob' });
      const url  = URL.createObjectURL(new Blob([resp.data]));
      const a    = document.createElement('a');
      a.href = url; a.download = 'vibepick-data.json'; a.click();
      URL.revokeObjectURL(url);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch {
      const user = getCurrentUser();
      const blob = new Blob([JSON.stringify({ user, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'vibepick-data.json'; a.click();
      URL.revokeObjectURL(url);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } finally {
      setExporting(false);
    }
  }

  function handleDocDownload(name) {
    alert(`"${name}" will be available for download soon.`);
  }

  const DATA_ITEMS = [
    { icon: '👤', label: 'Account info',       desc: 'Name and email address used at registration.' },
    { icon: '🎭', label: 'Genre preferences',   desc: 'Your selected favourite genres.' },
    { icon: '📺', label: 'Subscription data',   desc: 'Streaming platforms you have linked.' },
    { icon: '🎬', label: 'Watch history',        desc: 'Movies you have marked as watched.' },
    { icon: '💜', label: 'Wishlist',             desc: 'Movies saved for later viewing.' },
    { icon: '😊', label: 'Mood logs',            desc: 'Daily mood entries and post-watch moods.' },
    { icon: '🔍', label: 'Recommendation logs',  desc: 'Records of films shown to you and how they were ranked.' },
  ];

  return (
    <div style={{ fontFamily: FONT, minHeight: '100vh', position: 'relative' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes pd-fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        @keyframes pd-spin   { to{transform:rotate(360deg);} }
      `}</style>

      {}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'url(/pages-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(6px)', transform: 'scale(1.05)' }}/>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(15,5,35,0.55)' }}/>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar />

        <div style={{ padding: '52px 40px 80px', maxWidth: 1300, margin: '0 auto' }}>

          {}
          <div style={{ marginBottom: 48, animation: 'pd-fadeUp 0.4s ease both' }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', marginBottom: 8 }}>
              Privacy and Data Management
            </h1>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>
              Control your personal information and privacy settings
            </p>
          </div>

          {}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'start' }}>

            {}
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 22, padding: '32px 28px', animation: 'pd-fadeUp 0.4s ease 60ms both' }}>
              {}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(124,58,237,0.20)', border: '1px solid rgba(124,58,237,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0 }}>
                  <DatabaseIco />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'white' }}>Data Summary</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>What is stored & why</div>
                </div>
              </div>

              <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.60)', lineHeight: 1.75, marginBottom: 24, textAlign: 'justify' }}>
                 VibePick is committed to protecting your privacy. It collects only the data necessary to deliver personalised recommendations and improve your experience. Below is a full breakdown of every category of data we store on your behalf.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {DATA_ITEMS.map((item, i) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 12, background: i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {}
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 22, padding: '32px 28px', animation: 'pd-fadeUp 0.4s ease 120ms both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(124,58,237,0.20)', border: '1px solid rgba(124,58,237,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0 }}>
                  <ExportIco />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'white' }}>Data Portability</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Your GDPR rights</div>
                </div>
              </div>

              <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.60)', lineHeight: 1.75, marginBottom: 28, textAlign: 'justify' }}>
                Under the General Data Protection Regulation (GDPR — EU 2016/679), you have the right to receive a copy of all personal data we hold about you in a structured, commonly used and machine-readable format. You may also transmit that data to another service provider of your choosing without hindrance.
              </p>

              {}
              <div style={{ background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 16, padding: '24px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 20 }}>📦</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>Export My Data</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.58)', lineHeight: 1.75, marginBottom: 20, textAlign: 'justify' }}>
                  Download a complete JSON archive of your VibePick account data, including your profile, genre preferences, subscriptions, watch history, wishlist, and all mood logs. Your data will be ready instantly.
                </p>
                <button
                  onClick={handleExportData}
                  disabled={exporting}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                    width: '100%', padding: '13px 0', borderRadius: 11, cursor: exporting ? 'default' : 'pointer',
                    fontFamily: FONT, fontSize: 14, fontWeight: 800,
                    background: exportDone ? 'rgba(16,185,129,0.25)' : 'linear-gradient(135deg,#7C3AED,#9333ea)',
                    border: exportDone ? '1px solid rgba(16,185,129,0.5)' : 'none',
                    color: 'white',
                    boxShadow: exportDone ? 'none' : '0 6px 20px rgba(124,58,237,0.40)',
                    transition: 'all 0.2s ease',
                    opacity: exporting ? 0.7 : 1,
                  }}>
                  {exporting ? (
                    <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'pd-spin 0.7s linear infinite' }}/> Preparing…</>
                  ) : exportDone ? (
                    <>✓ Downloaded!</>
                  ) : (
                    <><DownloadIco /> Download my data</>
                  )}
                </button>
              </div>

              {}
              <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Right to Erasure</div>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, textAlign: 'justify' }}>
                  You may request full deletion of your account and all associated data at any time from the <Link to="/account" style={{ color: '#c084fc', textDecoration: 'none', fontWeight: 700 }}>Your Account</Link> page.
                </p>
              </div>
            </div>

            {}
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 22, padding: '32px 28px', animation: 'pd-fadeUp 0.4s ease 180ms both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(124,58,237,0.20)', border: '1px solid rgba(124,58,237,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0 }}>
                  <LegalIco />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'white' }}>Legal Documentation</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Official notices & policies</div>
                </div>
              </div>

              <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.60)', lineHeight: 1.75, marginBottom: 32, textAlign: 'justify' }}>
                All legal documents governing your use of VibePick are available below. We recommend reviewing them periodically as they may be updated. Each document is provided as a PDF and can be saved for your records.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Privacy Policy',    icon: '🔒', desc: 'How we collect, use, and protect your personal data.' },
                  { label: 'Terms of Service',  icon: '📋', desc: 'The rules and conditions governing use of the platform.' },
                  { label: 'GDPR Notice',       icon: '🇪🇺', desc: 'Your data rights under EU regulation 2016/679.' },
                ].map(doc => (
                  <div key={doc.label} style={{ padding: '18px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 18 }}>{doc.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{doc.label}</span>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.50)', lineHeight: 1.65, marginBottom: 14 }}>{doc.desc}</p>
                    <DlButton label={`Download ${doc.label}`} onClick={() => handleDocDownload(doc.label)} />
                  </div>
                ))}
              </div>

              {}
              <div style={{ marginTop: 24, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.5px' }}>
                  Documents last reviewed: January 2026
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
