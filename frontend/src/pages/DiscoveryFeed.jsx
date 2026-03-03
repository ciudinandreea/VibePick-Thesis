import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPopularMovies, searchMovies, getMovieDetails } from '../services/movies';
import { logout, getCurrentUser } from '../services/api';

const BG   = '#CFB9E5';
const PUR  = '#7C3AED';
const PUR2 = '#9333ea';
const TEXT = '#1a0533';
const MUT  = '#6b5c7e';
const FONT = "'Montserrat', sans-serif";

const SearchIco = ({ color = MUT, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const XIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const HamIco = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const CalIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
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
const UserIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const ShieldIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const LogoutIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const StarIco = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const ClockIco = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CheckIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function MovieCard({ movie, onClick }) {
  const [hov, setHov] = useState(false);
  const rating = movie.vote_average?.toFixed(1) || '—';
  const year   = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  return (
    <div
      onClick={() => onClick(movie)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(124,58,237,0.10)',
        borderRadius: 16, overflow: 'hidden',
        cursor: 'pointer', fontFamily: FONT,
        transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s',
        transform: hov ? 'translateY(-6px) scale(1.02)' : 'none',
        boxShadow: hov ? '0 18px 40px rgba(91,33,182,0.22)' : '0 2px 10px rgba(91,33,182,0.09)',
      }}
    >
      {movie.poster_url
        ? <img src={movie.poster_url} alt={movie.title} loading="lazy"
            style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
        : <div style={{
            width: '100%', aspectRatio: '2/3',
            background: 'linear-gradient(135deg,#e9d5ff,#c4b5fd)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: PUR, fontSize: 12, fontWeight: 600,
          }}>No Image</div>
      }
      <div style={{ padding: '12px 13px 14px' }}>
        <div style={{
          fontSize: 15, fontWeight: 700, color: TEXT,
          marginBottom: 8, lineHeight: 1.35,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{movie.title}</div>
        <div style={{ display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: MUT }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <StarIco /><span>{rating}</span>
          </div>
          <span>{year}</span>
        </div>
      </div>
    </div>
  );
}

function MovieModal({ movieId, onClose }) {
  const [movie,   setMovie]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved,   setSaved]   = useState(false);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    if (!movieId) return;
    setLoading(true); setSaved(false); setWatched(false);
    getMovieDetails(movieId)
      .then(setMovie)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [movieId]);

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const rating  = movie?.vote_average?.toFixed(1) || '—';
  const year    = movie?.release_date ? new Date(movie.release_date).getFullYear() : '';
  const runtime = movie?.runtime ? `${movie.runtime} min` : '';

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(10,0,30,0.72)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      animation: 'md-in 0.2s ease both',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'relative',
        background: 'rgba(28,10,58,0.90)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 22,
        width: '100%', maxWidth: 680,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.65)',
        animation: 'modal-up 0.28s cubic-bezier(.34,1.56,.64,1) both',
        color: 'white', fontFamily: FONT,
      }}>
        {}
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.13)',
          color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10, transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}>
          <XIcon size={13} color="rgba(255,255,255,0.75)" />
        </button>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '60px 40px', gap: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTop: '3px solid #a855f7',
              animation: 'vp-spin 0.7s linear infinite',
            }}/>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
              Loading…
            </span>
          </div>
        ) : movie ? (
          <div style={{ display: 'flex', minHeight: 0 }}>
            {}
            <div style={{ flexShrink: 0, padding: '26px 0 26px 26px' }}>
              {movie.poster_url
                ? <img src={movie.poster_url} alt={movie.title} style={{
                    width: 155, height: 232, borderRadius: 14,
                    objectFit: 'cover',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
                    display: 'block',
                  }} />
                : <div style={{
                    width: 155, height: 232, borderRadius: 14,
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.25)', fontSize: 12,
                  }}>No Image</div>
              }
            </div>
            {}
            <div style={{ flex: 1, padding: '26px 26px 26px 22px', minWidth: 0 }}>
              <div style={{ fontSize: 25, fontWeight: 900, color: 'white',
                letterSpacing: '-0.4px', lineHeight: 1.2,
                marginBottom: 4, paddingRight: 30 }}>
                {movie.title}
              </div>
              {movie.tagline && (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)',
                  fontStyle: 'italic', marginBottom: 14, fontWeight: 500 }}>
                  "{movie.tagline}"
                </div>
              )}
              {}
              <div style={{ display: 'flex', alignItems: 'center',
                gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.28)',
                  borderRadius: 8, padding: '4px 10px',
                  fontSize: 14, fontWeight: 800, color: '#fcd34d',
                }}>
                  <StarIco size={14} /> {rating}
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#fbbf24' }}>/10</span>
                </div>
                {year && <span style={{ fontSize: 13, fontWeight: 600,
                  color: 'rgba(255,255,255,0.6)' }}>{year}</span>}
                {runtime && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
                    <ClockIco /> {runtime}
                  </span>
                )}
                {movie.status && (
                  <span style={{
                    background: 'rgba(168,85,247,0.18)',
                    border: '1px solid rgba(168,85,247,0.28)',
                    borderRadius: 20, padding: '3px 10px',
                    fontSize: 12, fontWeight: 700, color: '#c084fc',
                  }}>{movie.status}</span>
                )}
              </div>
              {}
              {movie.genres?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {movie.genres.map(g => (
                    <span key={g.id} style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: 20, padding: '4px 11px',
                      fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)',
                    }}>{g.name}</span>
                  ))}
                </div>
              )}
              {}
              {movie.overview && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 800,
                    color: 'rgba(255,255,255,0.35)',
                    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                    Overview
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.75)', marginBottom: 18 }}>
                    {movie.overview}
                  </div>
                </>
              )}
              {}
              {movie.vote_count > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 800,
                    color: 'rgba(255,255,255,0.35)',
                    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
                    Votes
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>
                    {movie.vote_count.toLocaleString()}
                  </div>
                </div>
              )}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 18 }} />
              {}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {!saved ? (
                  <button onClick={() => setSaved(true)} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    borderRadius: 10, padding: '10px 18px',
                    fontSize: 13, fontWeight: 700, color: 'white',
                    cursor: 'pointer', fontFamily: FONT,
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}>
                    <HeartIco /> Save to Wishlist
                  </button>
                ) : (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(168,85,247,0.18)',
                    border: '1px solid rgba(168,85,247,0.28)',
                    borderRadius: 20, padding: '7px 14px',
                    fontSize: 13, fontWeight: 700, color: '#c084fc',
                  }}><HeartIco /> Saved!</div>
                )}
                {!watched ? (
                  <button onClick={() => setWatched(true)} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: 'linear-gradient(135deg,#7C3AED,#9333ea)',
                    border: 'none', borderRadius: 10, padding: '10px 20px',
                    fontSize: 13, fontWeight: 700, color: 'white',
                    cursor: 'pointer', fontFamily: FONT,
                    boxShadow: '0 4px 14px rgba(124,58,237,0.45)',
                    transition: 'opacity 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity='0.86'}
                    onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                    <CheckIco /> Mark as Watched
                  </button>
                ) : (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(34,197,94,0.14)',
                    border: '1px solid rgba(34,197,94,0.22)',
                    borderRadius: 20, padding: '7px 14px',
                    fontSize: 13, fontWeight: 700, color: '#86efac',
                  }}><CheckIco /> Watched!</div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function DiscoveryFeed() {
  const [movies,     setMovies]    = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState('');
  const [searchQ,    setSearchQ]   = useState('');
  const [activeQ,    setActiveQ]   = useState('');
  const [showSearch, setShowSearch]= useState(false);
  const [menuOpen,   setMenuOpen]  = useState(false);
  const [modalId,    setModalId]   = useState(null);

  const navigate  = useNavigate();
  const user      = getCurrentUser();
  const menuRef   = useRef(null);
  const searchRef = useRef(null);

  const displayName = user?.fullName || user?.email || 'User';

  useEffect(() => {
    const fn = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  useEffect(() => {
    document.body.style.overflow = modalId ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalId]);

  useEffect(() => { loadPopular(); }, []);

  async function loadPopular() {
    try {
      setLoading(true); setError('');
      const data = await getPopularMovies();
      setMovies(data.results); setActiveQ('');
    } catch { setError('Failed to load movies.'); }
    finally   { setLoading(false); }
  }

  async function handleSearch(e) {
    e?.preventDefault();
    const q = searchQ.trim();
    if (!q) return loadPopular();
    try {
      setLoading(true); setError('');
      const data = await searchMovies(q);
      setMovies(data.results); setActiveQ(q);
    } catch { setError('Search failed.'); }
    finally   { setLoading(false); }
  }

  function clearSearch() {
    setSearchQ(''); setActiveQ('');
    setShowSearch(false);
    loadPopular();
  }

  const openModal  = useCallback(movie => setModalId(movie.id), []);
  const closeModal = useCallback(() => setModalId(null), []);

  const nh = (e, on) => {
    e.currentTarget.style.color      = on ? PUR : TEXT;
    e.currentTarget.style.background = on ? 'rgba(124,58,237,0.07)' : 'none';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes vp-spin   { to { transform: rotate(360deg); } }
        @keyframes vp-fadeUp { from { opacity:0; transform:translateY(14px);} to { opacity:1; transform:translateY(0);} }
        @keyframes md-in     { from { opacity:0; } to { opacity:1; } }
        @keyframes modal-up  { from { opacity:0; transform:scale(0.94) translateY(16px);} to { opacity:1; transform:scale(1) translateY(0);} }
        @keyframes srch-in   { from { opacity:0; transform:translateX(-8px);} to { opacity:1; transform:translateX(0);} }
        body { margin:0; background:${BG}; }
        * { box-sizing:border-box; }
        ::placeholder { color:#a080c0 !important; font-family:${FONT} !important; }
        @media(max-width:1200px){ .vp-grid{ grid-template-columns:repeat(4,1fr)!important; } }
        @media(max-width:900px) { .vp-grid{ grid-template-columns:repeat(3,1fr)!important; } }
        @media(max-width:600px) { .vp-grid{ grid-template-columns:repeat(2,1fr)!important; } }
      `}</style>

      <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT }}>

        {}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          height: 62,
          background: 'rgba(255,255,255,0.60)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(124,58,237,0.13)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px', gap: 12,
        }}>

          {}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <img
              src="/logo.png"
              alt="VibePick"
              style={{
                width: 36, height: 36, borderRadius: 10,
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
              }}
            />
            <span style={{ fontSize: 19, fontWeight: 800, color: TEXT, letterSpacing: '-0.3px' }}>
              VibePick
            </span>
          </div>

          {}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2,
            flex: 1, justifyContent: 'flex-end', marginRight: 12 }}>
            {[
              { ico: <CalIco />,   label: 'Mood History Calendar', to: '/mood-history'  },
              { ico: <HeartIco />, label: 'Wishlist',              to: '/wishlist'       },
              { ico: <TvIco />,    label: 'Subscription Manager',  to: '/subscriptions' },
            ].map(({ ico, label, to }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px', borderRadius: 9,
                  fontSize: 13, fontWeight: 600, color: TEXT,
                  cursor: 'pointer', border: 'none', background: 'none',
                  fontFamily: FONT, transition: 'background 0.15s, color 0.15s',
                  whiteSpace: 'nowrap',
                }}
                  onMouseEnter={e => nh(e, true)}
                  onMouseLeave={e => nh(e, false)}>
                  {ico} {label}
                </div>
              </Link>
            ))}

            {}
            {!showSearch ? (
              <button onClick={() => setShowSearch(true)} title="Search" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 9,
                background: 'none', border: 'none',
                cursor: 'pointer', transition: 'background 0.15s', marginLeft: 4,
              }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background='none'}>
                <SearchIco color={TEXT} size={18} />
              </button>
            ) : (
              <form onSubmit={handleSearch} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                animation: 'srch-in 0.2s ease both', marginLeft: 4,
              }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%',
                    transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                    <SearchIco color={MUT} size={15} />
                  </span>
                  <input
                    ref={searchRef}
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search movies…"
                    style={{
                      width: 220,
                      background: 'rgba(255,255,255,0.78)',
                      border: '1.5px solid rgba(124,58,237,0.22)',
                      borderRadius: 9, padding: '7px 10px 7px 32px',
                      fontSize: 13, fontWeight: 500, color: TEXT,
                      fontFamily: FONT, outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor='rgba(124,58,237,0.55)'}
                    onBlur={e  => e.target.style.borderColor='rgba(124,58,237,0.22)'}
                  />
                </div>
                <button type="submit" style={{
                  padding: '7px 14px',
                  background: `linear-gradient(135deg,${PUR},${PUR2})`,
                  border: 'none', borderRadius: 9,
                  color: 'white', fontSize: 13, fontWeight: 700,
                  fontFamily: FONT, cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(124,58,237,0.35)',
                  transition: 'opacity 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity='0.87'}
                  onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                  Search
                </button>
                <button type="button" onClick={clearSearch} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 30, height: 30, borderRadius: 8,
                  background: 'rgba(124,58,237,0.07)',
                  border: '1px solid rgba(124,58,237,0.15)',
                  cursor: 'pointer', color: MUT, transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.14)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(124,58,237,0.07)'}>
                  <XIcon size={13} />
                </button>
              </form>
            )}
          </div>

          {}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
            ref={menuRef}>
            {}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: 24, padding: '5px 12px 5px 8px',
              fontSize: 13, fontWeight: 600, color: TEXT,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: `linear-gradient(135deg,${PUR},#ec4899)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 10, fontWeight: 700, flexShrink: 0,
              }}>
                {displayName[0]?.toUpperCase()}
              </div>
              {displayName}
            </div>

            {}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(v => !v)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 9,
                background: menuOpen ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(124,58,237,0.15)',
                cursor: 'pointer', color: TEXT, transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.1)'}
                onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background='rgba(255,255,255,0.5)'; }}>
                <HamIco />
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 200,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(124,58,237,0.14)',
                  borderRadius: 14,
                  boxShadow: '0 16px 48px rgba(91,33,182,0.18)',
                  overflow: 'hidden',
                  animation: 'vp-fadeUp 0.18s ease both',
                  zIndex: 300,
                }}>
                  {[
                    { ico: <ShieldIco />, label: 'Privacy & Data', to: '/privacy' },
                    { ico: <UserIco />,   label: 'Your Account',   to: '/account' },
                  ].map(({ ico, label, to }) => (
                    <Link key={to} to={to} style={{ textDecoration: 'none' }}
                      onClick={() => setMenuOpen(false)}>
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

        {}
        <div style={{ padding: '28px 32px 56px' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: TEXT,
            letterSpacing: '-0.5px', marginBottom: 4 }}>
            {activeQ ? `Search Results for "${activeQ}"` : 'Popular Movies'}
          </div>
          {!activeQ && (
            <div style={{ fontSize: 13, fontWeight: 500, color: MUT, marginBottom: 24 }}>
              Trending films from around the world
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              minHeight: 320, gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: `3px solid rgba(124,58,237,0.15)`,
                borderTop: `3px solid ${PUR}`,
                animation: 'vp-spin 0.75s linear infinite',
              }}/>
              <span style={{ fontSize: 14, fontWeight: 600, color: MUT }}>Loading movies…</span>
            </div>
          )}

          {!loading && error && (
            <div style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.18)',
              borderRadius: 12, padding: '14px 18px',
              color: '#dc2626', fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              {error}
              <button onClick={activeQ ? handleSearch : loadPopular}
                style={{ background: 'none', border: 'none', color: PUR,
                  fontSize: 13, fontWeight: 700, textDecoration: 'underline',
                  cursor: 'pointer', fontFamily: FONT }}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="vp-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 20,
            }}>
              {movies.map((movie, i) => (
                <div key={movie.id} style={{
                  animation: 'vp-fadeUp 0.35s ease both',
                  animationDelay: `${Math.min(i * 22, 280)}ms`,
                }}>
                  <MovieCard movie={movie} onClick={openModal} />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && movies.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0',
              fontSize: 15, fontWeight: 600, color: MUT }}>
              No movies found.
            </div>
          )}
        </div>
      </div>

      {}
      {modalId && <MovieModal movieId={modalId} onClose={closeModal} />}
    </>
  );
}
