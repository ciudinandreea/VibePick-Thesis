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
const EditIco = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const SaveIco = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const EyeIco = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const TrashIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
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
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 68, background: 'rgba(30,10,60,0.55)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(124,58,237,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Link to="/browse" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="VibePick" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }} />
          <span style={{ fontSize: 21, fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>VibePick</span>
        </Link>
        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
        <Link to="/browse" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 9, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}
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
          <div onClick={() => setUserOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: userOpen ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '5px 13px 5px 8px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)', cursor: 'pointer' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }}>{name[0]?.toUpperCase()}</div>
            {name}
          </div>
          {userOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 200, background: 'rgba(20,8,50,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(124,58,237,0.30)', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.45)', overflow: 'hidden', animation: 'ac-fadeUp 0.18s ease both', zIndex: 300 }}>
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
          <button onClick={() => setMenuOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 9, background: menuOpen ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.75)' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.18)'}
            onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}>
            <HamIco />
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 200, background: 'rgba(20,8,50,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(124,58,237,0.30)', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.45)', overflow: 'hidden', animation: 'ac-fadeUp 0.18s ease both', zIndex: 300 }}>
              {[{ ico: <ShieldIco />, label: 'Privacy & Data', to: '/privacy' }, { ico: <UserIco />, label: 'Your Account', to: '/account' }].map(({ ico, label, to }) => (
                <Link key={to} to={to} style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', fontSize: 13, fontWeight: 600, color: 'white', borderBottom: '1px solid rgba(255,255,255,0.07)', transition: 'background 0.12s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.background='none'}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{ico}</span> {label}
                  </div>
                </Link>
              ))}
              <div onClick={() => { setMenuOpen(false); logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#f87171', cursor: 'pointer' }}
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

function Field({ label, value, type = 'text', editable = true, onChange, onSave, saving, saved }) {
  const [editing, setEditing] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const handleSave = async () => {
    await onSave();
    setEditing(false);
  };

  const displayType = type === 'password' ? (showPw ? 'text' : 'password') : type;
  const displayValue = type === 'password' ? (editing ? value : '••••••••') : (value || '—');

  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {editing ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputRef}
                type={displayType}
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(124,58,237,0.45)',
                  borderRadius: 10, fontFamily: FONT, fontSize: 15,
                  fontWeight: 600, color: 'white', outline: 'none',
                  paddingRight: type === 'password' ? 40 : 14,
                }}
              />
              {type === 'password' && (
                <button onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', padding: 0 }}>
                  <EyeIco open={showPw} />
                </button>
              )}
            </div>
            <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 9, background: 'linear-gradient(135deg,#7C3AED,#9333ea)', border: 'none', color: 'white', fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, flexShrink: 0 }}>
              <SaveIco /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.6)', fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
              Cancel
            </button>
          </div>
        ) : (
          <>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: type === 'password' ? 'rgba(255,255,255,0.45)' : 'white', letterSpacing: type === 'password' ? '2px' : 'normal' }}>
              {displayValue}
            </span>
            {saved && <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>✓ Saved</span>}
            {editable && (
              <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)', fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                <EditIco /> Edit
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DeleteModal({ onConfirm, onCancel, deleting }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,0,30,0.70)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'ac-mdIn 0.2s ease both' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(20,8,50,0.96)', backdropFilter: 'blur(24px)', border: '1px solid rgba(239,68,68,0.30)', borderRadius: 22, padding: '36px 36px 30px', maxWidth: 440, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.60)', fontFamily: FONT }}>
        <div style={{ fontSize: 36, marginBottom: 16, textAlign: 'center' }}>⚠️</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: 'white', textAlign: 'center', marginBottom: 14 }}>Delete account &amp; history?</div>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.60)', lineHeight: 1.75, textAlign: 'center', marginBottom: 28 }}>
          This will permanently delete your account, all mood logs, watch history, wishlist, genre preferences, and subscription data. <strong style={{ color: '#f87171' }}>This action cannot be undone.</strong>
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '13px 0', borderRadius: 11, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting} style={{ flex: 1, padding: '13px 0', borderRadius: 11, background: 'linear-gradient(135deg,#dc2626,#ef4444)', border: 'none', color: 'white', fontFamily: FONT, fontSize: 14, fontWeight: 800, cursor: deleting ? 'default' : 'pointer', opacity: deleting ? 0.7 : 1 }}>
            {deleting ? 'Deleting…' : 'Yes, delete everything'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function YourAccount() {
  const navigate  = useNavigate();
  const rawUser   = getCurrentUser();

  const fullName  = rawUser?.fullName || rawUser?.full_name || '';
  const nameParts = fullName.trim().split(' ');
  const initFirst = nameParts[0] || '';
  const initLast  = nameParts.slice(1).join(' ') || '';

  const [firstName,   setFirstName]   = useState(initFirst);
  const [lastName,    setLastName]    = useState(initLast);
  const [email,       setEmail]       = useState(rawUser?.email || '');
  const [password,    setPassword]    = useState('');
  const [saving,      setSaving]      = useState({});
  const [saved,       setSaved]       = useState({});
  const [showDelete,  setShowDelete]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [createdAt,   setCreatedAt]   = useState(null);

  useEffect(() => {
    api.get('/profile/me').then(r => {
      setCreatedAt(r.data.createdAt);
      if (r.data.fullName) {
        const parts = r.data.fullName.trim().split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
      }
      if (r.data.email) setEmail(r.data.email);
    }).catch(() => {});
  }, []);

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : (rawUser?.createdAt || rawUser?.created_at)
      ? new Date(rawUser.createdAt || rawUser.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'N/A';

  const avatarLetter = (firstName[0] || email[0] || '?').toUpperCase();

  async function handleSave(field, payload) {
    setSaving(s => ({ ...s, [field]: true }));
    try {
      await api.put('/profile/account', payload);
      setSaved(s => ({ ...s, [field]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [field]: false })), 2500);
    } catch {
    } finally {
      setSaving(s => ({ ...s, [field]: false }));
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete('/profile/account');
    } catch {}
    logout();
    navigate('/login');
  }

  return (
    <div style={{ fontFamily: FONT, minHeight: '100vh', position: 'relative' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes ac-fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        @keyframes ac-mdIn   { from{opacity:0;}to{opacity:1;} }
        @keyframes ac-spin   { to{transform:rotate(360deg);} }
        input:focus { outline: none; box-shadow: 0 0 0 2px rgba(124,58,237,0.40); }
      `}</style>

      {}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'url(/pages-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(6px)', transform: 'scale(1.05)' }}/>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(15,5,35,0.55)' }}/>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar />

        <div style={{ padding: '52px 40px 80px', maxWidth: 700, margin: '0 auto' }}>

          {}
          <div style={{ marginBottom: 40, animation: 'ac-fadeUp 0.4s ease both' }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', marginBottom: 8 }}>Your Account</h1>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>Manage your personal information</p>
          </div>

          {}
          <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 24, overflow: 'hidden', animation: 'ac-fadeUp 0.4s ease 80ms both' }}>

            {}
            <div style={{ padding: '32px 28px 28px', background: 'rgba(124,58,237,0.10)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color: 'white', flexShrink: 0, boxShadow: '0 6px 20px rgba(124,58,237,0.45)' }}>
                {avatarLetter}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 4 }}>
                  {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'VibePick User'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.50)' }}>
                  {email}
                </div>
              </div>
            </div>

            {}
            <Field
              label="First Name"
              value={firstName}
              onChange={setFirstName}
              onSave={() => handleSave('name', { firstName, lastName })}
              saving={saving.name}
              saved={saved.name}
            />
            <Field
              label="Last Name"
              value={lastName}
              onChange={setLastName}
              onSave={() => handleSave('name', { firstName, lastName })}
              saving={saving.name}
              saved={saved.name}
            />
            <Field
              label="Email Address"
              value={email}
              type="email"
              onChange={setEmail}
              onSave={() => handleSave('email', { email })}
              saving={saving.email}
              saved={saved.email}
            />
            <Field
              label="Password"
              value={password}
              type="password"
              onChange={setPassword}
              onSave={() => handleSave('password', { password })}
              saving={saving.password}
              saved={saved.password}
            />
            <Field
              label="Member Since"
              value={memberSince}
              editable={false}
            />

            {}
            <div style={{ padding: '28px 24px', background: 'rgba(239,68,68,0.05)', borderTop: '1px solid rgba(239,68,68,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#f87171', marginBottom: 8 }}>
                    Delete Account &amp; History
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.50)', lineHeight: 1.7 }}>
                    Permanently removes your account along with all associated data — mood logs, watch history, wishlist, genres, and subscriptions. This cannot be reversed.
                  </p>
                </div>
                <button
                  onClick={() => setShowDelete(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 11, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.30)', color: '#f87171', fontFamily: FONT, fontSize: 13, fontWeight: 800, cursor: 'pointer', flexShrink: 0, transition: 'all 0.18s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.22)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.55)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.30)'; }}>
                  <TrashIco /> Delete account
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {showDelete && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          deleting={deleting}
        />
      )}
    </div>
  );
}