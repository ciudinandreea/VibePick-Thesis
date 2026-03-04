import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api';
import api from '../services/api';

const FONT = "'Montserrat', sans-serif";

const PLATFORMS = [
  { id: 'netflix',      label: 'Netflix',        logo: '/logos/netflix_logo.png',     logoBg: '#141414' },
  { id: 'disneyplus',   label: 'Disney+',        logo: '/logos/disneyplus_logo.png',  logoBg: '#1a6a8a' },
  { id: 'prime',        label: 'Prime Video',    logo: '/logos/primevideo_logo.png',  logoBg: '#00A8E0' },
  { id: 'hbomax',       label: 'HBO Max',        logo: '/logos/hbomax_logo.png',      logoBg: '#1C0533' },
  { id: 'appletv',      label: 'Apple TV+',      logo: '/logos/appletv_logo.png',     logoBg: '#ffffff' },
  { id: 'hulu',         label: 'Hulu',           logo: '/logos/hulu_logo.png',        logoBg: '#000000' },
  { id: 'paramount',    label: 'Paramount+',     logo: '/logos/paramount_logo.png',   logoBg: '#0064FF' },
  { id: 'peacock',      label: 'Peacock',        logo: '/logos/peacock_logo.png',     logoBg: '#ffffff' },
  { id: 'skyshowtime',  label: 'SkyShowtime',    logo: '/logos/skyshowtime_logo.png', logoBg: '#000000' },
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

export default function SubscriptionSetup() {
  const [selected, setSelected] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  const toggle = id =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleStart = async () => {
    try {
      setLoading(true);
      if (selected.length > 0) {
        await api.post('/profile/subscriptions', { platforms: selected });
      }
      const _user = getCurrentUser();
      const _uid  = _user?.id || _user?.userId || '';
      localStorage.setItem(`setupComplete_${_uid}`, 'true');
      navigate('/mood');
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
      `}</style>

      <div style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        fontFamily: FONT, overflowY: 'auto',
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

        <div style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: 580, margin: '76px 16px 16px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.18)', borderRadius: 24,
          padding: '28px 36px 28px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          color: 'white', animation: 'fadeUp 0.45s ease both',
          textAlign: 'center',
        }}>
          <img src="/logo.png" alt="VibePick" style={{
            width: 56, height: 56, borderRadius: 14, objectFit: 'cover',
            marginBottom: 14, boxShadow: '0 8px 32px rgba(168,85,247,0.45)',
          }} />
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.3px' }}>
            Personalize Your Experience
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginBottom: 28 }}>
            Select Your Subscriptions
          </div>

          {}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
            {PLATFORMS.map(p => {
              const on = selected.includes(p.id);
              return (
                <button key={p.id} onClick={() => toggle(p.id)} style={{
                  padding: '22px 12px',
                  borderRadius: 16,
                  border: on ? '2px solid #a855f7' : '2px solid rgba(255,255,255,0.12)',
                  background: on ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.06)',
                  color: 'white', cursor: 'pointer', fontFamily: FONT,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 10,
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background='rgba(255,255,255,0.11)'; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}>
                  <div style={{
                    width: 64, height: 40, borderRadius: 8, overflow: 'hidden',
                    background: p.logoBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <img src={p.logo} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: on ? 700 : 600 }}>{p.label}</span>
                </button>
              );
            })}
          </div>

          {error && <div style={{ color:'#fca5a5', fontSize:13, marginBottom:14, fontWeight:500 }}>{error}</div>}

          <button onClick={handleStart} disabled={loading} style={{
            width: '100%', padding: '14px',
            background: loading ? 'rgba(168,85,247,0.5)' : 'linear-gradient(90deg,#a855f7,#ec4899)',
            border: 'none', borderRadius: 12,
            color: 'white', fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: FONT,
            letterSpacing: '0.3px',
            boxShadow: loading ? 'none' : '0 4px 24px rgba(168,85,247,0.45)',
            marginBottom: 12,
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity='0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity='1'; }}>
            {loading ? 'Saving…' : 'Start Exploring'}
          </button>

          <button onClick={() => navigate('/setup/genres')} style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: FONT,
          }}>← Back</button>
        </div>
      </div>
    </>
  );
}
