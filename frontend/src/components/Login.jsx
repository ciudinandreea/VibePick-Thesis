import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
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

const VibeLogo = () => (
  <div style={{
    width: 64, height: 64,
    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
    borderRadius: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(168,85,247,0.4)',
    marginBottom: 16,
  }}>
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="10" stroke="white" strokeWidth="2.5"/>
      <circle cx="18" cy="18" r="3.5" fill="white"/>
      <circle cx="18" cy="8"  r="2" fill="white"/>
      <circle cx="18" cy="28" r="2" fill="white"/>
      <circle cx="8"  cy="18" r="2" fill="white"/>
      <circle cx="28" cy="18" r="2" fill="white"/>
      <rect x="24" y="22" width="10" height="7" rx="1.5"
        fill="white" fillOpacity="0.9"/>
      <line x1="27" y1="22" x2="27" y2="29" stroke="#a855f7" strokeWidth="1"/>
      <line x1="30" y1="22" x2="30" y2="29" stroke="#a855f7" strokeWidth="1"/>
    </svg>
  </div>
);
const S = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute', inset: 0,
    backgroundImage: 'url(/bg-movies.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'brightness(0.55) saturate(1.2)',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(88,28,135,0.6) 0%, rgba(30,10,60,0.7) 100%)',
    zIndex: 1,
  },
  card: {
    position: 'relative', zIndex: 2,
    width: '100%', maxWidth: 420,
    margin: '0 16px',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 24,
    padding: '40px 36px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    color: 'white',
    animation: 'fadeUp 0.5s ease both',
  },
  header: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', marginBottom: 28,
  },
  title: {
    fontSize: 26, fontWeight: 700, margin: '0 0 4px',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0,
  },
  fieldWrap: {
    position: 'relative', marginBottom: 16,
  },
  iconLeft: {
    position: 'absolute', left: 14, top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255,255,255,0.5)',
    pointerEvents: 'none',
    display: 'flex',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: '13px 44px',
    color: 'white',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
    boxSizing: 'border-box',
  },
  iconRight: {
    position: 'absolute', right: 14, top: '50%',
    transform: 'translateY(-50%)',
    background: 'none', border: 'none',
    color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
    display: 'flex', padding: 0,
  },
  forgotRow: {
    textAlign: 'right', marginBottom: 20, marginTop: -8,
  },
  forgot: {
    fontSize: 13, color: 'rgba(255,255,255,0.6)',
    textDecoration: 'none',
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(90deg, #a855f7, #ec4899)',
    border: 'none', borderRadius: 12,
    color: 'white', fontSize: 15, fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(168,85,247,0.45)',
    transition: 'opacity 0.2s, transform 0.15s',
    letterSpacing: '0.3px',
  },
  switchRow: {
    textAlign: 'center', marginTop: 20,
    fontSize: 14, color: 'rgba(255,255,255,0.6)',
  },
  switchLink: {
    color: '#c084fc', fontWeight: 600,
    textDecoration: 'none', marginLeft: 4,
  },
  legal: {
    position: 'relative', zIndex: 2,
    textAlign: 'center', marginTop: 20,
    fontSize: 12, color: 'rgba(255,255,255,0.35)',
    padding: '0 16px',
  },
  error: {
    background: 'rgba(239,68,68,0.2)',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: 10, padding: '10px 14px',
    fontSize: 13, color: '#fca5a5',
    marginBottom: 16,
  },
};

function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const btnHover   = e => { e.target.style.opacity = '0.88'; e.target.style.transform = 'translateY(-1px)'; };
  const btnUnhover = e => { e.target.style.opacity = '1';    e.target.style.transform = 'translateY(0)'; };
  const inputFocus = e => { e.target.style.borderColor = 'rgba(168,85,247,0.7)'; e.target.style.background = 'rgba(255,255,255,0.14)'; };
  const inputBlur  = e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.background = 'rgba(255,255,255,0.1)'; };

  return (
    <>
      {}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::placeholder { color: rgba(255,255,255,0.38) !important; }
      `}</style>

      <div style={S.page}>
        {}
        <div style={S.bg} />
        <div style={S.overlay} />

        {}
        <div style={S.card}>
          <div style={S.header}>
            <VibeLogo />
            <h1 style={S.title}>VibePick</h1>
            <p style={S.subtitle}>Welcome back!</p>
          </div>

          {error && <div style={S.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {}
            <div style={S.fieldWrap}>
              <span style={S.iconLeft}><MailIcon /></span>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={inputFocus}
                onBlur={inputBlur}
                style={S.input}
                required
              />
            </div>

            {}
            <div style={S.fieldWrap}>
              <span style={S.iconLeft}><LockIcon /></span>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={inputFocus}
                onBlur={inputBlur}
                style={S.input}
                required
              />
              <button type="button" style={S.iconRight}
                onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {}
            <div style={S.forgotRow}>
              <a href="#" style={S.forgot}>Forgot Password?</a>
            </div>

            {}
            <button
              type="submit"
              disabled={loading}
              style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
              onMouseEnter={btnHover}
              onMouseLeave={btnUnhover}
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p style={S.switchRow}>
            Don't have an account?
            <Link to="/register" style={S.switchLink}>Sign Up</Link>
          </p>
        </div>

        {}
        <div style={{ ...S.legal, position: 'absolute', bottom: 20, left: 0, right: 0 }}>
          By continuing, you agree to VibePick's Terms of Service and Privacy Policy
        </div>
      </div>
    </>
  );
}

export default Login;
