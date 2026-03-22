import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails } from '../services/movies';

const C = {
  bg:         '#CFB9E5',
  purple:     '#7C3AED',
  purpleGlow: 'rgba(124,58,237,0.3)',
  text:       '#1a0533',
  muted:      '#6b5c7e',
  border:     'rgba(124,58,237,0.13)',
};
const FONT = "'Montserrat', sans-serif";

const BackIco = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);
const StarIco = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const HeartIco = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CheckIco = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ClockIco = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

function fmtMoney(n) {
  if (!n || n === 0) return null;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export default function MovieDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [movie,   setMovie]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [saved,   setSaved]   = useState(false);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setLoading(true); setError('');
    getMovieDetails(id)
      .then(setMovie)
      .catch(() => setError('Failed to load movie details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const year    = movie?.release_date ? new Date(movie.release_date).getFullYear() : '';
  const runtime = movie?.runtime      ? `${movie.runtime} min` : '';
  const rating  = movie?.vote_average?.toFixed(1) || '—';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes md-spin    { to { transform: rotate(360deg); } }
        @keyframes md-fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        body { margin:0; background:${C.bg}; }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT }}>

        {}
        <div style={{ padding: '18px 32px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${C.border}`,
              borderRadius: 11, padding: '8px 16px',
              fontSize: 13, fontWeight: 700, color: C.text,
              cursor: 'pointer', fontFamily: FONT,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.6)'}>
            <BackIco /> Back to Movies
          </button>
        </div>

        {}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: '55vh', gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              border: `3px solid rgba(124,58,237,0.15)`,
              borderTop: `3px solid ${C.purple}`,
              animation: 'md-spin 0.75s linear infinite',
            }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>Loading…</span>
          </div>
        )}

        {}
        {!loading && error && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '40vh' }}>
            <span style={{ color: '#dc2626', fontSize: 14, fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {}
        {!loading && !error && movie && (
          <>
            {}
            <div style={{ position: 'relative', width: '100%', height: 360, overflow: 'hidden' }}>
              {movie.backdrop_url ? (
                <img src={movie.backdrop_url} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover',
                    filter: 'brightness(0.52)', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%',
                  background: 'linear-gradient(135deg,#4c1d95,#7c3aed)' }} />
              )}
              {}
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(to bottom,
                  transparent 20%,
                  rgba(207,185,229,0.7) 75%,
                  ${C.bg} 100%)`,
              }} />
            </div>

            {}
            <div style={{ maxWidth: 900, margin: '-72px auto 0', padding: '0 32px 64px',
              position: 'relative', zIndex: 2 }}>
              <div style={{
                background: 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(22px)',
                WebkitBackdropFilter: 'blur(22px)',
                border: `1px solid ${C.border}`,
                borderRadius: 22,
                padding: '30px 30px 32px',
                boxShadow: '0 8px 40px rgba(91,33,182,0.14)',
                display: 'flex', gap: 30,
                animation: 'md-fadeUp 0.45s ease both',
              }}>

                {}
                {movie.poster_url ? (
                  <img src={movie.poster_url} alt={movie.title}
                    style={{
                      flexShrink: 0, width: 195, height: 292,
                      borderRadius: 14, objectFit: 'cover',
                      boxShadow: '0 8px 28px rgba(91,33,182,0.28)',
                    }} />
                ) : (
                  <div style={{
                    flexShrink: 0, width: 195, height: 292, borderRadius: 14,
                    background: 'linear-gradient(135deg,#e9d5ff,#c4b5fd)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: C.purple, fontSize: 12, fontWeight: 600,
                  }}>No Image</div>
                )}

                {}
                <div style={{ flex: 1, minWidth: 0 }}>

                  {}
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.text,
                    letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: 4 }}>
                    {movie.title}
                  </div>

                  {}
                  {movie.tagline && (
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.muted,
                      fontStyle: 'italic', marginBottom: 14 }}>
                      "{movie.tagline}"
                    </div>
                  )}

                  {}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10,
                    flexWrap: 'wrap', marginBottom: 16 }}>
                    {}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: 'rgba(245,158,11,0.1)',
                      border: '1px solid rgba(245,158,11,0.28)',
                      borderRadius: 8, padding: '4px 10px',
                      fontSize: 14, fontWeight: 800, color: '#92400e',
                    }}>
                      <StarIco /> {rating}
                      <span style={{ fontSize: 10, fontWeight: 600 }}>/10</span>
                    </div>
                    {year && (
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                        {year}
                      </span>
                    )}
                    {runtime && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 13, fontWeight: 600, color: C.text }}>
                        <ClockIco /> {runtime}
                      </span>
                    )}
                    {movie.status && (
                      <span style={{
                        background: 'rgba(124,58,237,0.07)',
                        border: `1px solid ${C.border}`,
                        borderRadius: 20, padding: '3px 10px',
                        fontSize: 12, fontWeight: 700, color: C.purple,
                      }}>
                        {movie.status}
                      </span>
                    )}
                  </div>

                  {}
                  {movie.genres?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
                      {movie.genres.map(g => (
                        <span key={g.id} style={{
                          background: 'rgba(124,58,237,0.09)',
                          border: `1px solid rgba(124,58,237,0.18)`,
                          borderRadius: 20, padding: '4px 12px',
                          fontSize: 12, fontWeight: 700, color: C.purple,
                          letterSpacing: '0.2px',
                        }}>
                          {g.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {}
                  {movie.overview && (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted,
                        textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 7 }}>
                        Overview
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.text,
                        lineHeight: 1.72, marginBottom: 20 }}>
                        {movie.overview}
                      </div>
                    </>
                  )}

                  {}
                  {(fmtMoney(movie.budget) || fmtMoney(movie.revenue) || movie.vote_count > 0) && (
                    <div style={{
                      display: 'flex', gap: 24, marginBottom: 26,
                      paddingBottom: 20,
                      borderBottom: `1px solid rgba(124,58,237,0.1)`,
                    }}>
                      {fmtMoney(movie.budget) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: C.muted,
                            textTransform: 'uppercase', letterSpacing: '0.8px' }}>Budget</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                            {fmtMoney(movie.budget)}
                          </span>
                        </div>
                      )}
                      {fmtMoney(movie.revenue) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: C.muted,
                            textTransform: 'uppercase', letterSpacing: '0.8px' }}>Revenue</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                            {fmtMoney(movie.revenue)}
                          </span>
                        </div>
                      )}
                      {movie.vote_count > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: C.muted,
                            textTransform: 'uppercase', letterSpacing: '0.8px' }}>Votes</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                            {movie.vote_count.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {!saved ? (
                      <button onClick={() => setSaved(true)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          background: 'rgba(255,255,255,0.8)',
                          border: `1.5px solid rgba(124,58,237,0.22)`,
                          borderRadius: 11, padding: '11px 20px',
                          fontSize: 14, fontWeight: 700, color: C.text,
                          cursor: 'pointer', fontFamily: FONT,
                          transition: 'background 0.15s, border-color 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(124,58,237,0.07)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.22)'; }}>
                        <HeartIco /> Save to Wishlist
                      </button>
                    ) : (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(124,58,237,0.09)',
                        border: `1px solid rgba(124,58,237,0.2)`,
                        borderRadius: 20, padding: '8px 16px',
                        fontSize: 13, fontWeight: 700, color: C.purple,
                      }}>
                        <HeartIco /> Saved to Wishlist!
                      </div>
                    )}

                    {!watched ? (
                      <button onClick={() => setWatched(true)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          background: `linear-gradient(135deg, ${C.purple} 0%, #9333ea 100%)`,
                          border: 'none', borderRadius: 11, padding: '11px 20px',
                          fontSize: 14, fontWeight: 700, color: '#fff',
                          cursor: 'pointer', fontFamily: FONT,
                          boxShadow: `0 4px 14px ${C.purpleGlow}`,
                          transition: 'opacity 0.15s, transform 0.12s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
                        onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                        <CheckIco /> Mark as Watched
                      </button>
                    ) : (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(34,197,94,0.09)',
                        border: '1px solid rgba(34,197,94,0.22)',
                        borderRadius: 20, padding: '8px 16px',
                        fontSize: 13, fontWeight: 700, color: '#166534',
                      }}>
                        <CheckIco /> Marked as Watched!
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
