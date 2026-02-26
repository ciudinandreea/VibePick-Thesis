import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const S = {
  page: {
    position: 'relative', minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Montserrat', sans-serif", overflow: 'hidden',
  },
  bg: {
    position: 'absolute', inset: 0, backgroundImage: 'url(/bg-movies.jpg)',
    backgroundSize: 'cover', backgroundPosition: 'center',
    filter: 'brightness(0.55) saturate(1.2)', zIndex: 0,
  },
  overlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(88,28,135,0.6) 0%, rgba(30,10,60,0.7) 100%)',
    zIndex: 1,
  },
  card: {
    position: 'relative', zIndex: 2,
    width: '100%', maxWidth: 420, margin: '24px 16px',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.18)', borderRadius: 24,
    padding: '36px 36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    color: 'white', animation: 'fadeUp 0.5s ease both',
  },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 },
  logo: {
    width: 72, height: 72, borderRadius: 18, objectFit: 'cover',
    marginBottom: 14, boxShadow: '0 8px 32px rgba(168,85,247,0.45)',
  },
  title: { fontSize: 26, fontWeight: 700, margin: '0 0 4px', letterSpacing: '0.5px' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 500 },
  fieldWrap: { position: 'relative', marginBottom: 14 },
  iconLeft: {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    color: 'rgba(255,255,255,0.5)', pointerEvents: 'none', display: 'flex',
  },
  input: {
    width: '100%', background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12,
    padding: '13px 44px', color: 'white', fontSize: 14,
    fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
    outline: 'none', transition: 'border-color 0.2s, background 0.2s',
    boxSizing: 'border-box',
  },
  iconRight: {
    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer', display: 'flex', padding: 0,
  },
  btn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(90deg, #a855f7, #ec4899)',
    border: 'none', borderRadius: 12, color: 'white',
    fontSize: 15, fontWeight: 700, fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.5px', cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(168,85,247,0.45)',
    transition: 'opacity 0.2s, transform 0.15s', marginTop: 6,
  },
  switchRow: { textAlign: 'center', marginTop: 18, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' },
  switchLink: { color: '#c084fc', fontWeight: 700, textDecoration: 'none', marginLeft: 4 },
  error: {
    background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#fca5a5',
    marginBottom: 14, fontWeight: 500,
  },
  success: {
    background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)',
    borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#86efac',
    marginBottom: 14, fontWeight: 500,
  },
};

function Register() {
  const [fullName, setFullName]               = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw]                   = useState(false);
  const [showConfirmPw, setShowConfirmPw]     = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState('');
  const [loading, setLoading]                 = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      await register(fullName, email, password);
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const btnHover   = e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; };
  const btnUnhover = e => { e.currentTarget.style.opacity = '1';    e.currentTarget.style.transform = 'translateY(0)'; };
  const inputFocus = e => { e.target.style.borderColor = 'rgba(168,85,247,0.8)'; e.target.style.background = 'rgba(255,255,255,0.14)'; };
  const inputBlur  = e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.background = 'rgba(255,255,255,0.1)'; };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::placeholder { color: rgba(255,255,255,0.38) !important; font-family: 'Montserrat', sans-serif !important; }
        input[type="password"]::-ms-reveal { display: none; }
        input[type="password"]::-ms-clear { display: none; }
        input::-webkit-credentials-auto-fill-button { display: none !important; }
      `}</style>

      <div style={S.page}>
        <div style={S.bg} />
        <div style={S.overlay} />

        <div style={S.card}>
          <div style={S.header}>
            <img src="/logo.png" alt="VibePick" style={S.logo} />
            <h1 style={S.title}>VibePick</h1>
            <p style={S.subtitle}>Join the community</p>
          </div>

          {error   && <div style={S.error}>{error}</div>}
          {success && <div style={S.success}>{success}</div>}

          <form onSubmit={handleSubmit}>
            {}
            <div style={S.fieldWrap}>
              <span style={S.iconLeft}><UserIcon /></span>
              <input type="text" placeholder="Full Name" value={fullName}
                onChange={e => setFullName(e.target.value)}
                onFocus={inputFocus} onBlur={inputBlur}
                style={S.input} required />
            </div>

            <div style={S.fieldWrap}>
              <span style={S.iconLeft}><MailIcon /></span>
              <input type="email" placeholder="Email Address" value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={inputFocus} onBlur={inputBlur}
                style={S.input} required />
            </div>

            <div style={S.fieldWrap}>
              <span style={S.iconLeft}><LockIcon /></span>
              <input type={showPw ? 'text' : 'password'} placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={inputFocus} onBlur={inputBlur}
                style={S.input} required />
              <button type="button" style={S.iconRight} onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <div style={S.fieldWrap}>
              <span style={S.iconLeft}><LockIcon /></span>
              <input type={showConfirmPw ? 'text' : 'password'} placeholder="Confirm Password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onFocus={inputFocus} onBlur={inputBlur}
                style={S.input} required />
              <button type="button" style={S.iconRight} onClick={() => setShowConfirmPw(v => !v)}>
                {showConfirmPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              style={{ ...S.btn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              onMouseEnter={btnHover} onMouseLeave={btnUnhover}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p style={S.switchRow}>
            Already have an account?
            <Link to="/login" style={S.switchLink}>Login</Link>
          </p>
        </div>

        <div style={{
          position: 'absolute', bottom: 20, left: 0, right: 0, zIndex: 2,
          textAlign: 'center', fontSize: 11, fontWeight: 500,
          color: 'rgba(255,255,255,0.3)', padding: '0 16px',
          fontFamily: "'Montserrat', sans-serif",
        }}>
          By continuing, you agree to VibePick's Terms of Service and Privacy Policy
        </div>
      </div>
    </>
  );
}

export default Register;
