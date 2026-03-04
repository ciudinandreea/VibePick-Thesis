import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api';
import api from '../services/api';

const FONT = "'Montserrat', sans-serif";

const GENRES = [
  'Action','Comedy','Drama','Science Fiction','Horror',
  'Romance','Thriller','Fantasy','Documentary',
  'Animation','Mystery','Adventure',
];

function OnboardingNav() {
  const user     = getCurrentUser();
  const navigate = useNavigate();
  const name     = user?.fullName || user?.email || 'User';
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: 60, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 28px',
      background: 'rgba(255,255,255,0.07)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      fontFamily: FONT,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.png" alt="VibePick"
          style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover',
            boxShadow: '0 2px 10px rgba(168,85,247,0.4)' }} />
        <span style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
          VibePick
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 24, padding: '5px 12px 5px 8px',
          fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'linear-gradient(135deg,#a855f7,#ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 10, fontWeight: 700,
          }}>{name[0]?.toUpperCase()}</div>
          {name}
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} style={{
          background: 'none', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 9, padding: '6px 12px',
          color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', fontFamily: FONT,
        }}>Logout</button>
      </div>
    </nav>
  );
}

export default function GenreSetup() {
  const [selected, setSelected] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  const toggle = g =>
    setSelected(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const handleContinue = async () => {
    if (selected.length === 0) { setError('Please select at least one genre.'); return; }
    try {
      setLoading(true);
      await api.put('/profile/genres', { genres: selected });
      navigate('/setup/subscriptions');
    } catch { setError('Failed to save. Please try again.'); }
    finally  { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        body { margin:0; font-family:${FONT}; }
        * { box-sizing:border-box; }
        ::placeholder { color:rgba(255,255,255,0.38)!important; font-family:${FONT}!important; }
      `}</style>

      {}
      <div style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/bg-movies.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.55) saturate(1.2)', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg,rgba(88,28,135,0.6) 0%,rgba(30,10,60,0.7) 100%)',
          zIndex: 1,
        }} />

        <OnboardingNav />

        {}
        <div style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: 520, margin: '80px 16px 32px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.18)', borderRadius: 24,
          padding: '40px 40px 36px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          color: 'white', animation: 'fadeUp 0.45s ease both',
          textAlign: 'center',
        }}>
          {}
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.3px' }}>
            Personalize Your Experience
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginBottom: 28 }}>
            Choose Your Favorite Genres
          </div>

          {}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
            {GENRES.map(g => {
              const on = selected.includes(g);
              return (
                <button key={g} onClick={() => toggle(g)} style={{
                  padding: '11px 6px', borderRadius: 24,
                  border: on ? '2px solid #a855f7' : '2px solid rgba(255,255,255,0.15)',
                  background: on ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.07)',
                  color: 'white', fontSize: 13, fontWeight: on ? 700 : 500,
                  cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background='rgba(255,255,255,0.12)'; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background='rgba(255,255,255,0.07)'; }}>
                  {g}
                </button>
              );
            })}
          </div>

          {error && <div style={{ color:'#fca5a5', fontSize:13, marginBottom:14, fontWeight:500 }}>{error}</div>}

          {}
          <button onClick={handleContinue} disabled={loading} style={{
            width: '100%', padding: '14px',
            background: loading ? 'rgba(168,85,247,0.5)' : 'linear-gradient(90deg,#a855f7,#ec4899)',
            border: 'none', borderRadius: 12,
            color: 'white', fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: FONT,
            letterSpacing: '0.3px',
            boxShadow: loading ? 'none' : '0 4px 24px rgba(168,85,247,0.45)',
            transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity='0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity='1'; }}>
            {loading ? 'Saving…' : 'Continue'}
          </button>
        </div>
      </div>
    </>
  );
}
