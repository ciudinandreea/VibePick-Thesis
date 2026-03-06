import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api';
import { getMovieDetails } from '../services/movies';
import api from '../services/api';

const BG   = '#CFB9E5';
const PUR  = '#7C3AED';
const PUR2 = '#9333ea';
const TEXT = '#1a0533';
const MUT  = '#6b5c7e';
const FONT = "'Montserrat', sans-serif";

const XIcon = ({ size=16, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const StarIco = ({ size=13 }) => (
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
const CalIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const HeartIco = ({ filled=false }) => (
  <svg width="15" height="15" viewBox="0 0 24 24"
    fill={filled ? "#ec4899" : "none"}
    stroke={filled ? "#ec4899" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
const CheckNavIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const MOOD_OPTIONS = [
  { id:'happy',    emoji:'😊', label:'Happy'    },
  { id:'sad',      emoji:'😢', label:'Sad'      },
  { id:'stressed', emoji:'😰', label:'Stressed' },
  { id:'tired',    emoji:'😴', label:'Tired'    },
  { id:'excited',  emoji:'🤩', label:'Excited'  },
  { id:'bored',    emoji:'😐', label:'Bored'    },
];

function MovieModal({ tmdbId, onClose }) {
  const [movie,        setMovie]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [watched,      setWatched]      = useState(false);
  const [showMoodPick, setShowMoodPick] = useState(false);
  const [moodAfter,    setMoodAfter]    = useState(null);
  const user = getCurrentUser();
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'you';

  useEffect(() => {
    if (!tmdbId) return;
    setLoading(true); setWatched(false); setShowMoodPick(false); setMoodAfter(null);
    getMovieDetails(tmdbId)
      .then(setMovie).catch(console.error).finally(() => setLoading(false));
  }, [tmdbId]);

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleMarkWatched = async () => {
    setWatched(true);
    setShowMoodPick(true);
    try {
      await api.post('/mood/watch', {
        tmdb_id: movie?.id || tmdbId,
        title: movie?.title,
        poster_path: movie?.poster_url || null,
      });
    } catch (e) { console.error('Failed to log watched:', e); }
  };

  const handleMoodAfter = async (moodId) => {
    setMoodAfter(moodId); setShowMoodPick(false);
    try { await api.post('/mood/log-after', { mood_after: moodId, tmdb_id: tmdbId, title: movie?.title, poster_path: movie?.poster_url || null }); }
    catch (e) { console.error('Failed to log mood after:', e); }
  };

  const rating  = movie?.vote_average?.toFixed(1) || '—';
  const year    = movie?.release_date ? new Date(movie.release_date).getFullYear() : '';
  const runtime = movie?.runtime ? `${movie.runtime} min` : '';

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:300,
      background:'rgba(10,0,30,0.75)',
      backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:24, animation:'wl-fadeIn 0.2s ease both',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        position:'relative',
        background:'rgba(28,10,58,0.92)',
        backdropFilter:'blur(32px)',
        border:'1px solid rgba(255,255,255,0.10)', borderRadius:22,
        width:'100%', maxWidth:700, maxHeight:'90vh', overflow:'auto',
        boxShadow:'0 32px 80px rgba(0,0,0,0.65)',
        animation:'wl-slideUp 0.28s cubic-bezier(.34,1.56,.64,1) both',
        color:'white', fontFamily:FONT,
      }}>
        <button onClick={onClose} style={{
          position:'absolute', top:14, right:14,
          width:32, height:32, borderRadius:'50%',
          background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.13)',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10,
        }}>
          <XIcon size={13} color="rgba(255,255,255,0.75)" />
        </button>

        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
            justifyContent:'center', padding:'60px 40px', gap:14 }}>
            <div style={{ width:36, height:36, borderRadius:'50%',
              border:'3px solid rgba(255,255,255,0.1)', borderTop:'3px solid #a855f7',
              animation:'wl-spin 0.7s linear infinite' }}/>
            <span style={{ fontSize:15, color:'rgba(255,255,255,0.45)', fontWeight:600 }}>Loading…</span>
          </div>
        ) : movie ? (
          <div style={{ display:'flex', minHeight:0 }}>
            <div style={{ flexShrink:0, padding:'26px 0 26px 26px' }}>
              {movie.poster_url
                ? <img src={movie.poster_url} alt={movie.title} style={{
                    width:160, height:240, borderRadius:14, objectFit:'cover',
                    boxShadow:'0 8px 28px rgba(0,0,0,0.55)', display:'block' }}/>
                : <div style={{ width:160, height:240, borderRadius:14,
                    background:'rgba(255,255,255,0.05)', display:'flex',
                    alignItems:'center', justifyContent:'center',
                    color:'rgba(255,255,255,0.25)', fontSize:13 }}>No Image</div>
              }
            </div>
            <div style={{ flex:1, padding:'26px 26px 26px 22px', minWidth:0 }}>
              <div style={{ fontSize:26, fontWeight:900, color:'white',
                letterSpacing:'-0.4px', lineHeight:1.2, marginBottom:6, paddingRight:30 }}>
                {movie.title}
              </div>
              {movie.tagline && (
                <div style={{ fontSize:14, color:'rgba(255,255,255,0.45)',
                  fontStyle:'italic', marginBottom:14 }}>"{movie.tagline}"</div>
              )}
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:5,
                  background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.28)',
                  borderRadius:8, padding:'4px 10px', fontSize:15, fontWeight:800, color:'#fcd34d' }}>
                  <StarIco size={14}/> {rating}
                  <span style={{ fontSize:11, color:'#fbbf24' }}>/10</span>
                </div>
                {year && <span style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.6)' }}>{year}</span>}
                {runtime && (
                  <span style={{ display:'flex', alignItems:'center', gap:4,
                    fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.6)' }}>
                    <ClockIco/> {runtime}
                  </span>
                )}
              </div>
              {movie.genres?.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
                  {movie.genres.map(g => (
                    <span key={g.id} style={{ background:'rgba(255,255,255,0.07)',
                      border:'1px solid rgba(255,255,255,0.14)', borderRadius:20,
                      padding:'4px 11px', fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.75)' }}>
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
              {movie.overview && (
                <>
                  <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.35)',
                    textTransform:'uppercase', letterSpacing:'1px', marginBottom:6 }}>Overview</div>
                  <div style={{ fontSize:14, fontWeight:500, lineHeight:1.7,
                    color:'rgba(255,255,255,0.75)', marginBottom:18 }}>{movie.overview}</div>
                </>
              )}
              <div style={{ height:1, background:'rgba(255,255,255,0.07)', marginBottom:16 }}/>

              {}
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom: showMoodPick || moodAfter ? 16 : 0 }}>
                {!watched ? (
                  <button onClick={handleMarkWatched} style={{
                    display:'flex', alignItems:'center', gap:7,
                    background:'linear-gradient(135deg,#7C3AED,#9333ea)',
                    border:'none', borderRadius:10, padding:'10px 20px',
                    fontSize:14, fontWeight:700, color:'white', cursor:'pointer', fontFamily:FONT,
                    boxShadow:'0 4px 14px rgba(124,58,237,0.45)',
                  }}>✓ Mark as Watched</button>
                ) : (
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6,
                    background:'rgba(34,197,94,0.14)', border:'1px solid rgba(34,197,94,0.22)',
                    borderRadius:20, padding:'8px 15px', fontSize:14, fontWeight:700, color:'#86efac' }}>
                    ✓ Watched!
                  </div>
                )}
              </div>

              {}
              {showMoodPick && (
                <div style={{
                  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)',
                  borderRadius:14, padding:'16px 18px', animation:'wl-fadeIn 0.2s ease both',
                }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.85)', marginBottom:12 }}>
                    How do you feel after watching, {firstName}? 🎬
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {MOOD_OPTIONS.map(m => (
                      <button key={m.id} onClick={() => handleMoodAfter(m.id)} style={{
                        display:'flex', alignItems:'center', gap:6,
                        padding:'8px 14px', borderRadius:10,
                        border:'1px solid rgba(255,255,255,0.15)',
                        background:'rgba(255,255,255,0.07)', color:'white',
                        fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:FONT,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(124,58,237,0.3)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; }}>
                        {m.emoji} {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {moodAfter && !showMoodPick && (
                <div style={{ display:'inline-flex', alignItems:'center', gap:8,
                  background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)',
                  borderRadius:12, padding:'10px 16px', fontSize:14, fontWeight:600, color:'#c084fc' }}>
                  {MOOD_OPTIONS.find(m => m.id === moodAfter)?.emoji} Mood logged: {MOOD_OPTIONS.find(m => m.id === moodAfter)?.label}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const HeartNavIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
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
const FeedIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
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
            onMouseEnter={e => { e.currentTarget.style.color = '#c084fc'; e.currentTarget.style.background = 'rgba(124,58,237,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; e.currentTarget.style.background = 'none'; }}>
            <FeedIco /> Discovery Feed
          </div>
        </Link>
      </div>

      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {NAV_LINKS.map(({ ico, label, to }) => {
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

        {}
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
              overflow: 'hidden', zIndex: 300,
            }}>
              {[
                { label: '✓ Watched Movies',  to: '/watched' },
                { label: '★ Favorite Genres', to: '/genres'  },
              ].map(({ label, to }) => (
                <Link key={to} to={to} style={{ textDecoration: 'none' }} onClick={() => setUserOpen(false)}>
                  <div style={{
                    padding: '13px 16px', fontSize: 13, fontWeight: 600, color: TEXT,
                    borderBottom: '1px solid rgba(124,58,237,0.07)',
                    transition: 'background 0.12s', cursor: 'pointer',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background='none'}>
                    {label}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {}
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
              overflow: 'hidden', zIndex: 300,
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

function WishlistCard({ item, index, deleteMode, onRemove, onCardClick }) {
  const [hov, setHov] = useState(false);
  const genre = Array.isArray(item.genres) && item.genres[0]
    ? (typeof item.genres[0] === 'object' ? item.genres[0].name : item.genres[0])
    : '';

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => { if (!deleteMode) onCardClick(item.tmdb_id); }}
      style={{
        background:'rgba(255,255,255,0.13)', backdropFilter:'blur(12px)',
        WebkitBackdropFilter:'blur(12px)',
        border:'1px solid rgba(255,255,255,0.18)', borderRadius:16,
        overflow:'hidden', position:'relative', fontFamily:FONT,
        cursor: deleteMode ? 'default' : 'pointer',
        transition:'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s',
        transform: hov ? 'translateY(-6px) scale(1.02)' : 'none',
        boxShadow: hov ? '0 18px 40px rgba(91,33,182,0.22)' : '0 2px 10px rgba(91,33,182,0.09)',
        animation:'wl-fadeUp 0.35s ease both',
        animationDelay:`${Math.min(index * 40, 320)}ms`,
      }}>
      {item.poster_url
        ? <img src={item.poster_url} alt={item.title} loading="lazy"
            style={{ width:'100%', aspectRatio:'2/3', objectFit:'cover', display:'block' }}/>
        : <div style={{
            width:'100%', aspectRatio:'2/3',
            background:'linear-gradient(135deg,#e9d5ff,#c4b5fd)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:PUR, fontSize:13, fontWeight:600,
          }}>No Image</div>
      }

      {}
      <button onClick={e => { e.stopPropagation(); onRemove(item.id); }} style={{
        position:'absolute', top:10, right:10,
        width:34, height:34, borderRadius:'50%',
        background: deleteMode ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.92)',
        border:'none', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 2px 8px rgba(0,0,0,0.18)', transition:'transform 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform='scale(1.15)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
        {deleteMode
          ? <XIcon size={13} color="white"/>
          : <HeartIco filled={true}/>
        }
      </button>

      <div style={{ padding:'12px 14px 14px', background:'rgba(255,255,255,0.08)' }}>
        <div style={{
          fontSize:15, fontWeight:700, color:'white', marginBottom:4, lineHeight:1.35,
          display:'-webkit-box', WebkitLineClamp:2,
          WebkitBoxOrient:'vertical', overflow:'hidden',
        }}>{item.title}</div>
        {genre && <div style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.6)' }}>{genre}</div>}
      </div>
    </div>
  );
}

export default function Wishlist() {
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [modalTmdbId, setModalTmdbId] = useState(null);

  useEffect(() => {
    api.get('/wishlist')
      .then(r => setItems(r.data.items || []))
      .catch(() => setError('Failed to load wishlist.'))
      .finally(() => setLoading(false));
  }, []);

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/wishlist/${itemId}`);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch {}
  };

  const openModal  = useCallback(tmdbId => setModalTmdbId(tmdbId), []);
  const closeModal = useCallback(() => setModalTmdbId(null), []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes wl-fadeUp  { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        @keyframes wl-fadeIn  { from{opacity:0;}to{opacity:1;} }
        @keyframes wl-slideUp { from{opacity:0;transform:scale(0.94) translateY(16px);}to{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes wl-spin    { to{transform:rotate(360deg);} }
        body { margin:0; }
        .wl-page-bg {
          min-height:100vh;
          background: url('/pages-bg.jpg') center/cover fixed no-repeat;
          position: relative;
        }
        .wl-page-bg::before {
          content:'';
          position:fixed; inset:0;
          backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
          background:rgba(15,5,35,0.45);
          pointer-events:none; z-index:0;
        }
        .wl-page-bg > * { position:relative; z-index:1; }
        * { box-sizing:border-box; }
        @media(max-width:1100px){.wl-grid{grid-template-columns:repeat(4,1fr)!important;}}
        @media(max-width:800px){.wl-grid{grid-template-columns:repeat(3,1fr)!important;}}
        @media(max-width:550px){.wl-grid{grid-template-columns:repeat(2,1fr)!important;}}
      `}</style>
      <div className="wl-page-bg" style={{ fontFamily:FONT }}>
        <Navbar />
        <div style={{ padding:'32px 32px 56px' }}>

          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:28 }}>
            <div>
              <div style={{ fontSize:34, fontWeight:900, color:'white', letterSpacing:'-0.5px', marginBottom:4 }}>
                My Wishlist
              </div>
              <div style={{ fontSize:15, fontWeight:500, color:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', gap:8 }}>
                Movies you're excited to watch
                {items.length > 0 && (
                  <span style={{
                    background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)',
                    borderRadius:20, padding:'2px 10px', fontSize:13, fontWeight:700, color:PUR,
                  }}>{items.length}</span>
                )}
              </div>
            </div>
            {items.length > 0 && (
              <button onClick={() => setDeleteMode(v => !v)} style={{
                display:'flex', alignItems:'center', gap:7,
                padding:'10px 20px', borderRadius:10,
                background: deleteMode ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.07)',
                border: deleteMode ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(124,58,237,0.2)',
                color: deleteMode ? '#dc2626' : PUR,
                fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:FONT,
              }}>
                {deleteMode ? '✓ Done' : '🗑 Remove Movies'}
              </button>
            )}
          </div>

          {loading && (
            <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
              <div style={{ width:36, height:36, borderRadius:'50%',
                border:`3px solid rgba(124,58,237,0.15)`, borderTop:`3px solid ${PUR}`,
                animation:'wl-spin 0.75s linear infinite' }}/>
            </div>
          )}

          {!loading && error && <div style={{ color:'#dc2626', fontSize:15, fontWeight:500 }}>{error}</div>}

          {!loading && !error && items.length === 0 && (
            <div style={{ textAlign:'center', padding:'80px 0',
              display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
              <div style={{ fontSize:52 }}>🎬</div>
              <div style={{ fontSize:20, fontWeight:700, color:TEXT }}>Your wishlist is empty</div>
              <div style={{ fontSize:15, fontWeight:500, color:MUT }}>
                Save movies from the discovery feed to see them here
              </div>
              <Link to="/browse" style={{
                marginTop:8, padding:'12px 26px',
                background:'linear-gradient(135deg,#7C3AED,#9333ea)',
                borderRadius:12, color:'white', fontSize:15, fontWeight:700,
                textDecoration:'none', boxShadow:'0 4px 14px rgba(124,58,237,0.35)',
              }}>Browse Movies</Link>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="wl-grid" style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:18 }}>
              {items.map((item, i) => (
                <WishlistCard key={item.id} item={item} index={i}
                  deleteMode={deleteMode} onRemove={removeItem} onCardClick={openModal}/>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalTmdbId && <MovieModal tmdbId={modalTmdbId} onClose={closeModal}/>}
    </>
  );
}
