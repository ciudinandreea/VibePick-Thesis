import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api';
import api from '../services/api';

const BG   = '#CFB9E5';
const PUR  = '#7C3AED';
const TEXT = '#1a0533';
const MUT  = '#6b5c7e';
const FONT = "'Montserrat', sans-serif";

const MOOD_EMOJI = {
  happy: '😊', sad: '😢', stressed: '😰',
  tired: '😴', excited: '🤩', bored: '😐',
};
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];


const CalIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const HeartNavIco = () => (
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
const CheckNavIco = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
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

  const nh = (e, on) => {
    e.currentTarget.style.color      = on ? '#c084fc' : 'rgba(255,255,255,0.75)';
    e.currentTarget.style.background = on ? 'rgba(124,58,237,0.18)' : 'none';
  };

  const NAV_LINKS = [
    { ico: <CalIco />,      label: 'Mood History Calendar', to: '/mood-history'  },
    { ico: <HeartNavIco />, label: 'Wishlist',              to: '/wishlist'       },
    { ico: <TvIco />,       label: 'Subscription Manager',  to: '/subscriptions' },
    { ico: <CheckNavIco />, label: 'Watched Movies',        to: '/watched'       },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100, height: 68,
      background: 'rgba(20,8,45,0.95)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(124,58,237,0.25)',
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

        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24, padding: '5px 13px 5px 8px',
          fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'linear-gradient(135deg,#7C3AED,#ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 11, fontWeight: 700,
          }}>{name[0]?.toUpperCase()}</div>
          {name}
        </div>

        <button onClick={() => { logout(); navigate('/login'); }} style={{
          padding: '8px 16px', borderRadius: 9,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.75)',
          cursor: 'pointer', fontFamily: FONT,
        }}>Logout</button>
      </div>
    </nav>
  );
}

export default function MoodHistoryCalendar() {
  const today   = new Date();
  const [year,     setYear]     = useState(today.getFullYear());
  const [month,    setMonth]    = useState(today.getMonth());
  const [moodData, setMoodData] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/mood/history?year=${year}&month=${month + 1}`)
      .then(r => {
        const map = {};
        (r.data.entries || []).forEach(e => { map[e.date] = e; });
        setMoodData(map);
      })
      .catch(() => setMoodData({}))
      .finally(() => setLoading(false));
  }, [year, month]);

  const prevMonth = () => { setSelected(null); if (month === 0) { setMonth(11); setYear(y=>y-1); } else setMonth(m=>m-1); };
  const nextMonth = () => { setSelected(null); if (month === 11) { setMonth(0); setYear(y=>y+1); } else setMonth(m=>m+1); };

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Math.ceil(cells.length / 7);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const fmtKey = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const fmtLabel = (s) => {
    const [y,m,d] = s.split('-').map(Number);
    return new Date(y,m-1,d).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  };

  const selectedEntry = selected ? moodData[selected] : null;

  const navH   = 62;
  const padV   = 20;
  const headerH = 56; 
  const calHeaderH = 64; 
  const dayLabelsH = 36;
  const detailH = selected ? 180 : 0;
  const availH  = `calc(100vh - ${navH + padV*2 + headerH + calHeaderH + dayLabelsH + detailH + 20}px)`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
        @keyframes spin    { to{transform:rotate(360deg);} }
        body,html { margin:0; background:${BG}; height:100%; }
        * { box-sizing:border-box; }
        .cal-cell:hover { background: rgba(124,58,237,0.12) !important; }
      `}</style>

      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:BG, fontFamily:FONT }}>
        <Navbar />

        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:`${padV}px 28px 40px` }}>

          {}
          <div style={{ marginBottom:12, flexShrink:0 }}>
            <div style={{ fontSize:30, fontWeight:900, color:TEXT, letterSpacing:'-0.5px', marginBottom:2 }}>
              Mood History Calendar
            </div>
            <div style={{ fontSize:14, fontWeight:500, color:MUT }}>
              Track your emotional journey through cinema
            </div>
          </div>

          {}
          <div style={{
            background:'rgba(255,255,255,0.82)', backdropFilter:'blur(12px)',
            border:'1px solid rgba(124,58,237,0.10)', borderRadius:20,
            padding:'18px 22px 14px',
            boxShadow:'0 4px 24px rgba(91,33,182,0.10)',
            display:'flex', flexDirection:'column',
            marginBottom: selected ? 14 : 0,
            height: 'calc(100vh - 62px - 40px - 56px - 20px)',
            animation:'fadeUp 0.3s ease both',
          }}>
            {}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexShrink:0 }}>
              <button onClick={prevMonth} style={{
                width:36, height:36, borderRadius:10,
                background:'rgba(124,58,237,0.07)', border:'1px solid rgba(124,58,237,0.18)',
                cursor:'pointer', color:PUR, fontSize:20, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>‹</button>
              <div style={{ fontSize:20, fontWeight:800, color:TEXT }}>{MONTHS[month]} {year}</div>
              <button onClick={nextMonth} style={{
                width:36, height:36, borderRadius:10,
                background:'rgba(124,58,237,0.07)', border:'1px solid rgba(124,58,237,0.18)',
                cursor:'pointer', color:PUR, fontSize:20, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>›</button>
            </div>

            {}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:5, marginBottom:5, flexShrink:0 }}>
              {DAYS.map(d => (
                <div key={d} style={{
                  textAlign:'center', fontSize:11, fontWeight:700, color:MUT,
                  padding:'4px 0', textTransform:'uppercase', letterSpacing:'0.6px',
                }}>{d}</div>
              ))}
            </div>

            {}
            <div style={{
              flex:1, minHeight:0,
              display:'grid',
              gridTemplateColumns:'repeat(7,1fr)',
              gridTemplateRows:`repeat(${weeks},1fr)`,
              gap:5,
            }}>
              {cells.map((day, i) => {
                if (!day) return <div key={`e${i}`} />;
                const key     = fmtKey(day);
                const entry   = moodData[key];
                const isToday = key === todayStr;
                const isSel   = key === selected;
                return (
                  <div
                    key={key}
                    className="cal-cell"
                    onClick={() => setSelected(isSel ? null : key)}
                    style={{
                      borderRadius:12,
                      padding:'8px 6px 6px',
                      background: isSel ? 'rgba(124,58,237,0.14)' : isToday ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.03)',
                      border: isSel ? '2px solid rgba(124,58,237,0.50)' : isToday ? '2px solid rgba(124,58,237,0.35)' : '2px solid rgba(124,58,237,0.07)',
                      cursor:'pointer',
                      display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                      transition:'background 0.15s',
                      overflow:'hidden',
                    }}>
                    <span style={{
                      fontSize:13, fontWeight: isToday ? 800 : 600,
                      color: isToday ? PUR : TEXT, lineHeight:1, flexShrink:0,
                    }}>{day}</span>
                    {entry?.mood && (
                      <span style={{ fontSize:'min(20px,2vw)', lineHeight:1, flexShrink:0 }}>
                        {MOOD_EMOJI[entry.mood] || '😊'}
                      </span>
                    )}
                    {entry?.mood_after && (
                      <span style={{ fontSize:'min(16px,1.6vw)', lineHeight:1, flexShrink:0, opacity:0.75 }}>
                        {MOOD_EMOJI[entry.mood_after] || '😊'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {loading && (
              <div style={{ textAlign:'center', padding:'8px 0', flexShrink:0 }}>
                <div style={{ width:22,height:22,borderRadius:'50%',display:'inline-block',
                  border:`2px solid rgba(124,58,237,0.15)`,borderTop:`2px solid ${PUR}`,
                  animation:'spin 0.75s linear infinite' }}/>
              </div>
            )}
          </div>

          {}
          {selected && (
            <div style={{
              flexShrink:0,
              background:'rgba(255,255,255,0.82)', backdropFilter:'blur(12px)',
              border:'1px solid rgba(124,58,237,0.10)', borderRadius:18,
              padding:'20px 24px',
              boxShadow:'0 4px 20px rgba(91,33,182,0.10)',
              animation:'fadeUp 0.22s ease both',
            }}>
              <div style={{ fontSize:16, fontWeight:800, color:TEXT, marginBottom:14 }}>
                {fmtLabel(selected)}
              </div>

              {!selectedEntry ? (
                <div style={{ fontSize:13, fontWeight:500, color:MUT, fontStyle:'italic' }}>
                  No mood logged on this day.
                </div>
              ) : (
                <>
                  {selectedEntry.movies?.length > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                      {selectedEntry.movies[0].poster_url && (
                        <img src={selectedEntry.movies[0].poster_url} alt=""
                          style={{ width:50,height:74,borderRadius:9,objectFit:'cover',
                            boxShadow:'0 3px 10px rgba(0,0,0,0.15)',flexShrink:0 }}/>
                      )}
                      <div style={{ fontSize:15, fontWeight:700, color:TEXT }}>
                        {selectedEntry.movies[0].title}
                      </div>
                    </div>
                  )}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {[
                      { label:'Mood before watching:', val: selectedEntry.mood },
                      { label:'Mood after watching:',  val: selectedEntry.mood_after },
                    ].map(({ label, val }) => (
                      <div key={label} style={{
                        background:'rgba(124,58,237,0.06)',
                        border:'1px solid rgba(124,58,237,0.13)',
                        borderRadius:12, padding:'14px 16px',
                      }}>
                        <div style={{ fontSize:10,fontWeight:700,color:MUT,
                          textTransform:'uppercase',letterSpacing:'0.9px',marginBottom:6 }}>{label}</div>
                        <div style={{ fontSize:15,fontWeight:800,color:TEXT }}>
                          {val ? `${val.charAt(0).toUpperCase()+val.slice(1)} ${MOOD_EMOJI[val]||''}` : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
