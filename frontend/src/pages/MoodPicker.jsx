import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api';
import api from '../services/api';

const FONT = "'Montserrat', sans-serif";

const MOODS = [
  { id: 'happy',    label: 'Happy',    emoji: '😊' },
  { id: 'sad',      label: 'Sad',      emoji: '😢' },
  { id: 'stressed', label: 'Stressed', emoji: '😰' },
  { id: 'tired',    label: 'Tired',    emoji: '😴' },
  { id: 'excited',  label: 'Excited',  emoji: '🤩' },
  { id: 'bored',    label: 'Bored',    emoji: '😐' },
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

export default function MoodGate() {
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();
  const user     = getCurrentUser();
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  const handleContinue = async () => {
    if (!selected) { setError('Please choose your mood first.'); return; }
    try {
      setLoading(true);
      await api.post('/mood/log', { mood: selected });
      const today  = new Date().toISOString().slice(0, 10);
      const _user  = getCurrentUser();
      const _uid   = _user?.id || _user?.userId || '';
      localStorage.setItem(`moodDate_${_uid}`, today);
      localStorage.setItem(`currentMood_${_uid}`, selected);
      localStorage.setItem('currentMood', selected); 
      navigate('/browse');
    } catch { setError('Failed to save mood. Please try again.'); }
    finally  { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        @keyframes moodPop { from{transform:scale(0.9);}to{transform:scale(1);} }
        body { margin:0; font-family:${FONT}; }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT, overflow: 'hidden',
      }}>
        {}
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
          width: '100%', maxWidth: 600, margin: '80px 16px 32px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.18)', borderRadius: 24,
          padding: '44px 40px 40px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          color: 'white', animation: 'fadeUp 0.45s ease both',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.4px' }}>
            How are you feeling today, {firstName}?
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginBottom: 32 }}>
            Choose an emoji that matches your vibe.
          </div>

          {}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
            {MOODS.map(m => {
              const on = selected === m.id;
              return (
                <button key={m.id} onClick={() => setSelected(m.id)} style={{
                  padding: '22px 10px',
                  borderRadius: 18,
                  border: on ? '2px solid #a855f7' : '2px solid rgba(255,255,255,0.12)',
                  background: on ? 'rgba(168,85,247,0.28)' : 'rgba(255,255,255,0.06)',
                  color: 'white', cursor: 'pointer', fontFamily: FONT,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  transition: 'all 0.15s',
                  transform: on ? 'scale(1.04)' : 'scale(1)',
                  boxShadow: on ? '0 0 0 4px rgba(168,85,247,0.2)' : 'none',
                }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background='rgba(255,255,255,0.11)'; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}>
                  <span style={{ fontSize: 44, lineHeight: 1 }}>{m.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: on ? 700 : 600 }}>{m.label}</span>
                </button>
              );
            })}
          </div>

          {}
          {selected && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginBottom: 16 }}>
              You selected: {MOODS.find(m => m.id === selected)?.label}
            </div>
          )}

          {error && <div style={{ color:'#fca5a5', fontSize:13, marginBottom:14, fontWeight:500 }}>{error}</div>}

          <button onClick={handleContinue} disabled={loading || !selected} style={{
            width: '100%', padding: '14px',
            background: (!selected || loading)
              ? 'rgba(168,85,247,0.35)'
              : 'linear-gradient(90deg,#a855f7,#ec4899)',
            border: 'none', borderRadius: 12,
            color: 'white', fontSize: 15, fontWeight: 700,
            cursor: (!selected || loading) ? 'not-allowed' : 'pointer', fontFamily: FONT,
            letterSpacing: '0.3px',
            boxShadow: selected ? '0 4px 24px rgba(168,85,247,0.45)' : 'none',
            transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => { if (selected && !loading) e.currentTarget.style.opacity='0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity='1'; }}>
            {loading ? 'Saving…' : 'See your discovery feed →'}
          </button>
        </div>
      </div>
    </>
  );
}
