import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api';
import api from '../services/api';

const BG   = '#CFB9E5';
const PUR  = '#7C3AED';
const PUR2 = '#9333ea';
const TEXT = '#1a0533';
const MUT  = '#6b5c7e';
const FONT = "'Montserrat', sans-serif";

const CalIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const HeartIco = () => (
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
const CheckIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
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
const StarIco = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

function Navbar() {
  const navigate    = useNavigate();
  const user        = getCurrentUser();
  const displayName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const path        = window.location.pathname;
  const menuRef     = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const nh = (e, on) => {
    e.currentTarget.style.color      = on ? '#c084fc' : 'rgba(255,255,255,0.75)';
    e.currentTarget.style.background = on ? 'rgba(124,58,237,0.18)' : 'none';
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100, height: 68,
      background: 'rgba(20,8,45,0.95)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(124,58,237,0.25)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 28px', fontFamily: FONT,
    }}>
      {}
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
            transition: 'background 0.15s, color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color='#c084fc'; e.currentTarget.style.background='rgba(124,58,237,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.85)'; e.currentTarget.style.background='none'; }}>
            <FeedIco /> Discovery Feed
          </div>
        </Link>
      </div>

      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }} ref={menuRef}>
        {[
          { ico: <CalIco />,   label: 'Mood History Calendar', to: '/mood-history'  },
          { ico: <HeartIco />, label: 'Wishlist',              to: '/wishlist'       },
          { ico: <TvIco />,    label: 'Subscription Manager',  to: '/subscriptions' },
          { ico: <CheckIco />, label: 'Watched Movies',        to: '/watched'       },
        ].map(({ ico, label, to }) => {
          const active = path === to;
          return (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 9,
                fontSize: 13, fontWeight: 600,
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

        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24, padding: '5px 13px 5px 8px',
          fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)',
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: `linear-gradient(135deg,${PUR},#ec4899)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 10, fontWeight: 700, flexShrink: 0,
          }}>{displayName[0]?.toUpperCase()}</div>
          {displayName}
        </div>

        <div style={{ position: 'relative' }}>
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
              background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(124,58,237,0.14)', borderRadius: 14,
              boxShadow: '0 16px 48px rgba(91,33,182,0.18)',
              overflow: 'hidden', animation: 'wm-fadeUp 0.18s ease both', zIndex: 300,
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

export default function WatchedMovies() {
  const [movies,  setMovies]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const user      = getCurrentUser();
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'you';

  useEffect(() => {
    api.get('/mood/watched')
      .then(r => setMovies(r.data.watched || []))
      .catch(() => setError('Failed to load watched movies.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes wm-fadeUp { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Navbar />

        <div style={{ padding: '32px 32px 56px' }}>
          {}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: TEXT, margin: '0 0 6px', letterSpacing: '-0.4px' }}>
              Watched Movies
            </h1>
            <p style={{ fontSize: 14, color: MUT, margin: 0, fontWeight: 500 }}>
              {movies.length > 0
                ? `${movies.length} movie${movies.length !== 1 ? 's' : ''} watched — filtered from your recommendations`
                : `Movies you mark as watched won't appear in your recommendations`}
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '3px solid rgba(124,58,237,0.15)', borderTop: `3px solid ${PUR}`,
                animation: 'wm-spin 0.7s linear infinite',
              }} />
            </div>
          ) : error ? (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12, padding: '18px 20px', color: '#dc2626', fontWeight: 600, fontSize: 14,
            }}>{error}</div>
          ) : movies.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              background: 'rgba(255,255,255,0.5)', borderRadius: 20,
              border: '1px solid rgba(124,58,237,0.1)',
            }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🎬</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: TEXT, marginBottom: 8 }}>No watched movies yet</div>
              <div style={{ fontSize: 14, color: MUT, fontWeight: 500 }}>
                Click "Mark as Watched" on any movie to track it here
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 18,
            }}>
              {movies.map(movie => (
                <WatchedCard key={`${movie.tmdb_id}-${movie.watched_at}`} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes wm-spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

function WatchedCard({ movie }) {
  const watchedDate = movie.watched_at
    ? new Date(movie.watched_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
    : null;

  return (
    <div style={{
      background: 'white', borderRadius: 14,
      boxShadow: '0 2px 12px rgba(124,58,237,0.08)',
      border: '1px solid rgba(124,58,237,0.08)',
      overflow: 'hidden', animation: 'wm-fadeUp 0.3s ease both',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(124,58,237,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 12px rgba(124,58,237,0.08)'; }}>
      {}
      <div style={{ position: 'relative', aspectRatio: '2/3', background: '#e9e0f5' }}>
        {movie.poster_url ? (
          <img src={`https://image.tmdb.org/t/p/w300${movie.poster_url}`}
            alt={movie.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display='none'; }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: MUT, fontSize: 12, fontWeight: 600,
          }}>No Image</div>
        )}
        {}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: 'rgba(34,197,94,0.9)', borderRadius: '50%',
          width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}>
          <CheckIco />
        </div>
      </div>

      {}
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: TEXT,
          lineHeight: 1.3, marginBottom: 4,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {movie.title}
        </div>
        {movie.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <StarIco size={12} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>{Number(movie.rating).toFixed(1)}</span>
          </div>
        )}
        {watchedDate && (
          <div style={{ fontSize: 11, color: MUT, fontWeight: 500 }}>
            Watched {watchedDate}
          </div>
        )}
      </div>
    </div>
  );
}
