import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api';
import api from '../services/api';

const PUR  = '#7C3AED';
const TEXT = '#1a0533';
const MUT  = '#6b5c7e';
const FONT = "'Montserrat', sans-serif";

const ALL_PLATFORMS = [
  { id: 'netflix',     label: 'Netflix',      logo: '/logos/netflix_logo.png',     logoBg: '#141414' },
  { id: 'disneyplus',  label: 'Disney+',       logo: '/logos/disneyplus_logo.png',  logoBg: '#1a6a8a' },
  { id: 'prime',       label: 'Prime Video',   logo: '/logos/primevideo_logo.png',  logoBg: '#00A8E0' },
  { id: 'hbomax',      label: 'HBO Max',       logo: '/logos/hbomax_logo.png',      logoBg: '#1C0533' },
  { id: 'appletv',     label: 'Apple TV+',     logo: '/logos/appletv_logo.png',     logoBg: '#1d3a2f' },
  { id: 'hulu',        label: 'Hulu',          logo: '/logos/hulu_logo.png',        logoBg: '#000000' },
  { id: 'paramount',   label: 'Paramount+',    logo: '/logos/paramount_logo.png',   logoBg: '#0064FF' },
  { id: 'peacock',     label: 'Peacock',       logo: '/logos/peacock_logo.png',     logoBg: '#ffffff' },
  { id: 'skyshowtime', label: 'SkyShowtime',   logo: '/logos/skyshowtime_logo.png', logoBg: '#000000' },
];

const ALIASES = { disney: 'disneyplus', hbo: 'hbomax', amazon: 'prime', 'hbo-max': 'hbomax', 'disney-plus': 'disneyplus' };
const norm = (id) => ALIASES[id] || id;

const CalIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const HeartNavIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const TvIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="2"/>
    <polyline points="17 2 12 7 7 2"/>
  </svg>
);
const FeedIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const ShieldIco = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const UserIco = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const LogoutIco = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const HamIco = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const WatchedIco = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const GenreIco = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

function Navbar() {
  const navigate   = useNavigate();
  const user       = getCurrentUser();
  const name       = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const path       = window.location.pathname;
  const menuRef    = useRef(null);
  const userRef    = useRef(null);
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
          <img src="/logo.png" alt="VibePick" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover',
            boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }} />
          <span style={{ fontSize: 21, fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>VibePick</span>
        </Link>
        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
        <Link to="/browse" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 13px', borderRadius: 9, fontSize: 14, fontWeight: 600,
            color: 'rgba(255,255,255,0.85)', background: 'none', whiteSpace: 'nowrap',
          }}
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
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                color: active ? '#c084fc' : 'rgba(255,255,255,0.75)',
                background: active ? 'rgba(124,58,237,0.2)' : 'none',
                whiteSpace: 'nowrap', transition: 'background 0.15s, color 0.15s',
              }}
                onMouseEnter={e => nh(e, true)}
                onMouseLeave={e => {
                  e.currentTarget.style.color = active ? '#c084fc' : 'rgba(255,255,255,0.75)';
                  e.currentTarget.style.background = active ? 'rgba(124,58,237,0.2)' : 'none';
                }}>
                {ico} {label}
              </div>
            </Link>
          );
        })}

        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

        <div style={{ position: 'relative' }} ref={userRef}>
          <div onClick={() => setUserOpen(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: userOpen ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 24, padding: '5px 13px 5px 8px',
            fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)',
            cursor: 'pointer', transition: 'background 0.15s',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg,#7C3AED,#ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 11, fontWeight: 700,
            }}>{name[0]?.toUpperCase()}</div>
            {name}
          </div>
          {userOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 200,
              background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(124,58,237,0.14)', borderRadius: 14,
              boxShadow: '0 16px 48px rgba(91,33,182,0.18)',
              overflow: 'hidden', animation: 'sm-fadeUp 0.18s ease both', zIndex: 300,
            }}>
              {[
                { ico: <WatchedIco />, label: 'Watched Movies',  to: '/watched' },
                { ico: <GenreIco />,   label: 'Favorite Genres', to: '/genres'  },
              ].map(({ ico, label, to }) => (
                <Link key={to} to={to} style={{ textDecoration: 'none' }} onClick={() => setUserOpen(false)}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '13px 16px', fontSize: 13, fontWeight: 600, color: TEXT,
                    borderBottom: '1px solid rgba(124,58,237,0.07)',
                    transition: 'background 0.12s', cursor: 'pointer',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background='none'}>
                    <span style={{ color: MUT }}>{ico}</span> {label}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button onClick={() => setMenuOpen(v => !v)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 9,
            background: menuOpen ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', color: 'rgba(255,255,255,0.75)', transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.18)'}
            onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}>
            <HamIco />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 200,
              background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(124,58,237,0.14)', borderRadius: 14,
              boxShadow: '0 16px 48px rgba(91,33,182,0.18)',
              overflow: 'hidden', animation: 'sm-fadeUp 0.18s ease both', zIndex: 300,
            }}>
              {[
                { ico: <ShieldIco />, label: 'Privacy & Data', to: '/privacy' },
                { ico: <UserIco />,   label: 'Your Account',   to: '/account' },
              ].map(({ ico, label, to }) => (
                <Link key={to} to={to} style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '13px 16px', fontSize: 13, fontWeight: 600, color: TEXT,
                    borderBottom: '1px solid rgba(124,58,237,0.07)',
                    transition: 'background 0.12s', cursor: 'pointer',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background='none'}>
                    <span style={{ color: MUT }}>{ico}</span> {label}
                  </div>
                </Link>
              ))}
              <div onClick={() => { setMenuOpen(false); logout(); navigate('/login'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#dc2626',
                  cursor: 'pointer', transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.06)'}
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

function PlatformCard({ platform, deleteMode, onRemove, index }) {
  const [hov, setHov] = useState(false);

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      position: 'relative',
      background: hov ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      border: hov ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.18)',
      borderRadius: 18, padding: '28px 20px 22px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      transition: 'transform 0.2s, box-shadow 0.2s',
      transform: hov ? 'translateY(-4px)' : 'none',
      boxShadow: hov ? '0 12px 32px rgba(91,33,182,0.35)' : '0 2px 10px rgba(0,0,0,0.20)',
      animation: 'sm-fadeUp 0.3s ease both',
      animationDelay: `${index * 60}ms`,
    }}>
      {}
      <div style={{
        width: 80, height: 80, borderRadius: 18,
        background: platform.logoBg,
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.30)',
      }}>
        <img src={platform.logo} alt={platform.label}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{platform.label}</div>

      {deleteMode && (
        <button onClick={() => onRemove(platform.id)} style={{
          position: 'absolute', top: -8, right: -8,
          width: 26, height: 26, borderRadius: '50%',
          background: '#ef4444', border: '2px solid white',
          color: 'white', fontSize: 14, fontWeight: 900,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(239,68,68,0.4)', lineHeight: 1,
        }}>×</button>
      )}
    </div>
  );
}

const CHART_PALETTE_SM = [
  '#7C3AED','#ec4899','#3b82f6','#10b981','#f59e0b',
  '#ef4444','#8b5cf6','#06b6d4','#84cc16','#f97316',
  '#a855f7','#14b8a6',
];

function DonutChartSM({ data, size = 200, thickness = 36 }) {
  const r = (size / 2) - thickness / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = data.map((d, i) => {
    const len = (d.pct / 100) * circ;
    const slice = { ...d, offset, len, color: CHART_PALETTE_SM[i % CHART_PALETTE_SM.length] };
    offset += len;
    return slice;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:'block', flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255,255,255,0.07)" strokeWidth={thickness} />
      {slices.map((s, i) => (
        <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
          stroke={s.color} strokeWidth={thickness}
          strokeDasharray={`${s.len} ${circ - s.len}`}
          strokeDashoffset={-s.offset + circ * 0.25}
          style={{ transition:'stroke-dasharray 0.6s ease', cursor:'default' }}>
          <title>{s.label}: {s.pct}%</title>
        </circle>
      ))}
      <text x={size/2} y={size/2 - 8} textAnchor="middle" fontSize="22" fontWeight="800" fill="white">
        {data.reduce((a, d) => a + d.count, 0)}
      </text>
      <text x={size/2} y={size/2 + 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="rgba(255,255,255,0.5)">
        movies
      </text>
    </svg>
  );
}

function StatsBarsSM({ data }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10, justifyContent:'center' }}>
      {data.map((d, i) => (
        <div key={d.label}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'white' }}>{d.label}</span>
            <span style={{ fontSize:13, fontWeight:800, color: CHART_PALETTE_SM[i % CHART_PALETTE_SM.length] }}>{d.pct}%</span>
          </div>
          <div style={{ height:8, borderRadius:8, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:8,
              width:`${d.pct}%`,
              background: `linear-gradient(90deg, ${CHART_PALETTE_SM[i % CHART_PALETTE_SM.length]}, ${CHART_PALETTE_SM[(i+1) % CHART_PALETTE_SM.length]})`,
              transition:'width 0.7s cubic-bezier(.4,0,.2,1)',
            }}/>
          </div>
          <div style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', marginTop:2 }}>
            {d.count} movie{d.count !== 1 ? 's' : ''}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsPanelSM({ title, subtitle, data, loading }) {
  return (
    <div style={{
      background:'rgba(255,255,255,0.07)', backdropFilter:'blur(12px)',
      border:'1px solid rgba(255,255,255,0.12)', borderRadius:20,
      padding:'28px 32px', marginTop:40,
    }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:20, fontWeight:800, color:'white', marginBottom:4 }}>{title}</div>
        <div style={{ fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.55)' }}>{subtitle}</div>
      </div>
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'32px 0' }}>
          <div style={{ width:32, height:32, borderRadius:'50%',
            border:'3px solid rgba(255,255,255,0.1)', borderTop:'3px solid #a855f7',
            animation:'sm-spin 0.75s linear infinite' }}/>
        </div>
      ) : data.length === 0 ? (
        <div style={{ textAlign:'center', padding:'32px 0',
          fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.35)' }}>
          No data yet — start watching movies to see your stats!
        </div>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:32, flexWrap:'wrap' }}>
          <DonutChartSM data={data} />
          <StatsBarsSM data={data} />
        </div>
      )}
    </div>
  );
}
export default function SubscriptionManager() {
  const [active,     setActive]     = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [modalSel,   setModalSel]   = useState([]);
  const [saving,     setSaving]     = useState(false);
  const [saveError,    setSaveError]    = useState('');
  const [platformStats, setPlatformStats] = useState([]);
  const [statsLoading,  setStatsLoading]  = useState(true);

  useEffect(() => {
    api.get('/profile/stats/platforms')
      .then(r => setPlatformStats(r.data.breakdown || []))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    api.get('/profile/subscriptions')
      .then(r => setActive((r.data.platforms || []).map(norm)))
      .catch(e => console.error('Failed to load subscriptions:', e));
  }, []);

  const removeSub = async (id) => {
    try {
      await api.delete(`/profile/subscriptions/${id}`);
      setActive(prev => prev.filter(p => p !== id));
    } catch (e) { console.error('Remove failed:', e); }
  };

  const addSubs = async () => {
    if (modalSel.length === 0) return;
    setSaveError('');
    try {
      setSaving(true);
      const combined = [...new Set([...active, ...modalSel])];
      await api.post('/profile/subscriptions', { platforms: combined });
      setActive(combined);
      setShowModal(false);
      setModalSel([]);
    } catch (e) {
      setSaveError(e.response?.data?.detail || e.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const available       = ALL_PLATFORMS.filter(p => !active.includes(p.id));
  const activePlatforms = ALL_PLATFORMS.filter(p =>  active.includes(p.id));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes sm-fadeUp { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
        @keyframes sm-mdIn   { from{opacity:0;}to{opacity:1;} }
        @keyframes sm-spin   { to{transform:rotate(360deg);} }
        body { margin:0; }
        .sm-page-bg {
          min-height:100vh;
          background: url('/pages-bg.jpg') center/cover fixed no-repeat;
          position: relative;
        }
        .sm-page-bg::before {
          content:'';
          position:fixed; inset:0;
          backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
          background:rgba(15,5,35,0.45);
          pointer-events:none; z-index:0;
        }
        .sm-page-bg > * { position:relative; z-index:1; }
        * { box-sizing:border-box; }
      `}</style>

      <div className="sm-page-bg" style={{ fontFamily: FONT }}>
        <Navbar />
        <div style={{ padding: '32px 32px 56px' }}>

          <div style={{ fontSize: 34, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', marginBottom: 4 }}>
            Subscription Manager
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 28 }}>
            Manage your streaming platforms
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => { setModalSel([]); setSaveError(''); setShowModal(true); }} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 22px', borderRadius: 11,
              background: 'linear-gradient(135deg,#7C3AED,#9333ea)',
              border: 'none', color: 'white',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
              boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
            }}>+ Add Subscription</button>

            {activePlatforms.length > 0 && (
              <button onClick={() => setDeleteMode(v => !v)} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 22px', borderRadius: 11,
                background: deleteMode ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.7)',
                border: deleteMode ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(124,58,237,0.2)',
                color: deleteMode ? '#dc2626' : TEXT,
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
              }}>
                🗑 {deleteMode ? 'Cancel Delete Mode' : 'Remove Subscription'}
              </button>
            )}
          </div>

          {activePlatforms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>
              No subscriptions yet — click Add Subscription to get started.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, 180px)',
              gap: 18,
            }}>
              {activePlatforms.map((p, i) => (
                <PlatformCard key={p.id} platform={p} index={i}
                  deleteMode={deleteMode} onRemove={removeSub} />
              ))}
            </div>
          )}

          <StatsPanelSM
            title="Platform Breakdown"
            subtitle={`All your watched movies by streaming platform`}
            data={platformStats.map(d => ({ ...d, label: d.platform }))}
            loading={statsLoading}
          />
        </div>
      </div>

      {}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(10,0,30,0.55)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, animation: 'sm-mdIn 0.2s ease both',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'rgba(20,8,50,0.92)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(124,58,237,0.35)',
            borderRadius: 22, padding: '30px 30px 24px',
            width: '100%', maxWidth: 560,
            boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
            fontFamily: FONT,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>Add Subscriptions</div>
              <button onClick={() => setShowModal(false)} style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(124,58,237,0.08)', border: 'none',
                cursor: 'pointer', fontSize: 18, color: 'rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            </div>

            {saveError && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                fontSize: 13, fontWeight: 600, color: '#dc2626',
              }}>{saveError}</div>
            )}

            {available.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>
                You've added all available platforms!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
                {available.map(p => {
                  const on = modalSel.includes(p.id);
                  return (
                    <div key={p.id} onClick={() => setModalSel(prev =>
                      prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                    )} style={{
                      borderRadius: 14, padding: '16px 10px 12px',
                      border: on ? `2px solid ${PUR}` : '2px solid rgba(255,255,255,0.15)',
                      background: on ? 'rgba(124,58,237,0.30)' : 'rgba(255,255,255,0.06)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12, margin: '0 auto 8px',
                        background: p.logoBg, overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                      }}>
                        <img src={p.logo} alt={p.label}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{p.label}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <button onClick={addSubs} disabled={modalSel.length === 0 || saving} style={{
              width: '100%', padding: '13px',
              background: modalSel.length === 0 ? 'rgba(124,58,237,0.2)' : 'linear-gradient(135deg,#7C3AED,#9333ea)',
              border: 'none', borderRadius: 12, color: 'white',
              fontSize: 14, fontWeight: 700, fontFamily: FONT,
              cursor: modalSel.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: modalSel.length > 0 ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
              opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'Saving…'
                : modalSel.length > 0
                  ? `Add ${modalSel.length} Subscription${modalSel.length > 1 ? 's' : ''}`
                  : 'Select platforms above'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
