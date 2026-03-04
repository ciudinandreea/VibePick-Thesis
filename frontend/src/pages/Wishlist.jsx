import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api';
import api from '../services/api';

const BG   = '#CFB9E5';
const PUR  = '#7C3AED';
const TEXT = '#1a0533';
const MUT  = '#6b5c7e';
const FONT = "'Montserrat', sans-serif";

function Navbar() {
  const navigate = useNavigate();
  const user     = getCurrentUser();
  const name     = user?.fullName || user?.email || 'User';
  const path     = window.location.pathname;
  const ls = (to) => ({
    textDecoration: 'none', padding: '7px 13px', borderRadius: 9,
    fontSize: 13, fontWeight: 600,
    color: path === to ? PUR : TEXT,
    background: path === to ? 'rgba(124,58,237,0.07)' : 'none',
    whiteSpace: 'nowrap', fontFamily: FONT,
  });
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100, height: 62,
      background: 'rgba(255,255,255,0.60)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(124,58,237,0.13)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 28px', fontFamily: FONT,
    }}>
      <Link to="/browse" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.png" alt="VibePick" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
        <span style={{ fontSize: 19, fontWeight: 800, color: TEXT }}>VibePick</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {[
          { label: 'Mood History Calendar', to: '/mood-history'  },
          { label: 'Wishlist',              to: '/wishlist'       },
          { label: 'Subscription Manager',  to: '/subscriptions' },
        ].map(({ label, to }) => <Link key={to} to={to} style={ls(to)}>{label}</Link>)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: 24, padding: '5px 12px 5px 8px', fontSize: 13, fontWeight: 600, color: TEXT,
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'linear-gradient(135deg,#7C3AED,#ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 10, fontWeight: 700,
          }}>{name[0]?.toUpperCase()}</div>
          {name}
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} style={{
          padding: '7px 13px', borderRadius: 9, background: 'none', border: 'none',
          fontSize: 13, fontWeight: 600, color: TEXT, cursor: 'pointer', fontFamily: FONT,
        }}>Logout</button>
      </div>
    </nav>
  );
}

function WishlistCard({ item, index, deleteMode, onRemove }) {
  const [hov, setHov] = useState(false);
  const year  = item.release_date ? new Date(item.release_date).getFullYear() : '';
  const genre = Array.isArray(item.genres) && item.genres[0]
    ? (typeof item.genres[0] === 'object' ? item.genres[0].name : item.genres[0])
    : '';

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(124,58,237,0.10)', borderRadius: 16,
      overflow: 'hidden', position: 'relative', fontFamily: FONT,
      transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s',
      transform: hov ? 'translateY(-6px) scale(1.02)' : 'none',
      boxShadow: hov ? '0 18px 40px rgba(91,33,182,0.22)' : '0 2px 10px rgba(91,33,182,0.09)',
      animation: 'fadeUp 0.35s ease both',
      animationDelay: `${Math.min(index * 40, 320)}ms`,
    }}>
      {item.poster_url
        ? <img src={item.poster_url} alt={item.title} loading="lazy"
            style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
        : <div style={{
            width: '100%', aspectRatio: '2/3',
            background: 'linear-gradient(135deg,#e9d5ff,#c4b5fd)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: PUR, fontSize: 13, fontWeight: 600,
          }}>No Image</div>
      }

      {}
      <button onClick={() => onRemove(item.id)} style={{
        position: 'absolute', top: 10, right: 10,
        width: 34, height: 34, borderRadius: '50%',
        background: deleteMode ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.92)',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        transition: 'transform 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        {deleteMode
          ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="#ec4899" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        }
      </button>

      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 4, lineHeight: 1.35,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{item.title}</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: MUT }}>
          {year}{year && genre ? ' · ' : ''}{genre}
        </div>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [deleteMode, setDeleteMode] = useState(false);

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        @keyframes spin    { to{transform:rotate(360deg);} }
        body { margin:0; background:${BG}; }
        * { box-sizing:border-box; }
        @media(max-width:1200px){.wl-grid{grid-template-columns:repeat(5,1fr)!important;}}
        @media(max-width:960px) {.wl-grid{grid-template-columns:repeat(4,1fr)!important;}}
        @media(max-width:700px) {.wl-grid{grid-template-columns:repeat(3,1fr)!important;}}
      `}</style>
      <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT }}>
        <Navbar />
        <div style={{ padding: '32px 32px 56px' }}>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 30, fontWeight: 900, color: TEXT, letterSpacing: '-0.5px', marginBottom: 4 }}>
                My Wishlist
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: MUT, display: 'flex', alignItems: 'center', gap: 8 }}>
                Movies you're excited to watch
                {items.length > 0 && (
                  <span style={{
                    background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                    borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700, color: PUR,
                  }}>{items.length}</span>
                )}
              </div>
            </div>
            {items.length > 0 && (
              <button onClick={() => setDeleteMode(v => !v)} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 10,
                background: deleteMode ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.07)',
                border: deleteMode ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(124,58,237,0.2)',
                color: deleteMode ? '#dc2626' : PUR,
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
              }}>
                {deleteMode ? '✓ Done' : '🗑 Remove Movies'}
              </button>
            )}
          </div>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%',
                border: `3px solid rgba(124,58,237,0.15)`, borderTop: `3px solid ${PUR}`,
                animation: 'spin 0.75s linear infinite' }} />
            </div>
          )}

          {!loading && error && <div style={{ color: '#dc2626', fontSize: 14, fontWeight: 500 }}>{error}</div>}

          {!loading && !error && items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 52 }}>🎬</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>Your wishlist is empty</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: MUT }}>
                Save movies from the discovery feed to see them here
              </div>
              <Link to="/browse" style={{
                marginTop: 8, padding: '11px 24px',
                background: 'linear-gradient(135deg,#7C3AED,#9333ea)',
                borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 700,
                textDecoration: 'none', boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
              }}>Browse Movies</Link>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="wl-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 18 }}>
              {items.map((item, i) => (
                <WishlistCard key={item.id} item={item} index={i}
                  deleteMode={deleteMode} onRemove={removeItem} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
