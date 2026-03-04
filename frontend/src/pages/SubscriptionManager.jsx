import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api';
import api from '../services/api';

const BG   = '#CFB9E5';
const PUR  = '#7C3AED';
const TEXT = '#1a0533';
const MUT  = '#6b5c7e';
const FONT = "'Montserrat', sans-serif";

const ALL_PLATFORMS = [
  { id: 'netflix',      label: 'Netflix',       logo: '/logos/netflix_logo.png',     logoBg: '#141414' },
  { id: 'disneyplus',   label: 'Disney+',        logo: '/logos/disneyplus_logo.png',  logoBg: '#1a6a8a' },
  { id: 'prime',        label: 'Prime Video',    logo: '/logos/primevideo_logo.png',  logoBg: '#00A8E0' },
  { id: 'hbomax',       label: 'HBO Max',        logo: '/logos/hbomax_logo.png',      logoBg: '#1C0533' },
  { id: 'appletv',      label: 'Apple TV+',      logo: '/logos/appletv_logo.png',     logoBg: '#ffffff' },
  { id: 'hulu',         label: 'Hulu',           logo: '/logos/hulu_logo.png',        logoBg: '#000000' },
  { id: 'paramount',    label: 'Paramount+',     logo: '/logos/paramount_logo.png',   logoBg: '#0064FF' },
  { id: 'peacock',      label: 'Peacock',        logo: '/logos/peacock_logo.png',     logoBg: '#ffffff' },
  { id: 'skyshowtime',  label: 'SkyShowtime',    logo: '/logos/skyshowtime_logo.png', logoBg: '#000000' },
];

const ALIASES = { disney: 'disneyplus', hbo: 'hbomax', amazon: 'prime', 'hbo-max': 'hbomax', 'disney-plus': 'disneyplus' };
const norm = (id) => ALIASES[id] || id;

function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const name = user?.fullName || user?.email || 'User';
  const path = window.location.pathname;
  const ls = (to) => ({
    textDecoration:'none', padding:'7px 13px', borderRadius:9,
    fontSize:13, fontWeight:600,
    color: path===to ? PUR : TEXT,
    background: path===to ? 'rgba(124,58,237,0.07)' : 'none',
    whiteSpace:'nowrap', fontFamily:FONT,
  });
  return (
    <nav style={{
      position:'sticky', top:0, zIndex:100, height:62,
      background:'rgba(255,255,255,0.60)', backdropFilter:'blur(20px)',
      borderBottom:'1px solid rgba(124,58,237,0.13)',
      display:'flex', alignItems:'center',
      justifyContent:'space-between', padding:'0 28px', fontFamily:FONT,
    }}>
      <Link to="/browse" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:10}}>
        <img src="/logo.png" alt="VibePick" style={{width:36,height:36,borderRadius:10,objectFit:'cover'}}/>
        <span style={{fontSize:19,fontWeight:800,color:TEXT}}>VibePick</span>
      </Link>
      <div style={{display:'flex',alignItems:'center',gap:2}}>
        {[
          {label:'Mood History Calendar',to:'/mood-history'},
          {label:'Wishlist',to:'/wishlist'},
          {label:'Subscription Manager',to:'/subscriptions'},
        ].map(({label,to}) => <Link key={to} to={to} style={ls(to)}>{label}</Link>)}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <div style={{
          display:'flex',alignItems:'center',gap:7,
          background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.15)',
          borderRadius:24,padding:'5px 12px 5px 8px',fontSize:13,fontWeight:600,color:TEXT,
        }}>
          <div style={{
            width:24,height:24,borderRadius:'50%',
            background:'linear-gradient(135deg,#7C3AED,#ec4899)',
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'white',fontSize:10,fontWeight:700,
          }}>{name[0]?.toUpperCase()}</div>
          {name}
        </div>
        <button onClick={() => {logout(); navigate('/login');}} style={{
          padding:'7px 13px',borderRadius:9,background:'none',border:'none',
          fontSize:13,fontWeight:600,color:TEXT,cursor:'pointer',fontFamily:FONT,
        }}>Logout</button>
      </div>
    </nav>
  );
}

function PlatformCard({ platform, deleteMode, onRemove, index }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      position:'relative',
      background:'rgba(255,255,255,0.82)', backdropFilter:'blur(8px)',
      border: hov ? '1px solid rgba(124,58,237,0.25)' : '1px solid rgba(124,58,237,0.10)',
      borderRadius:18, padding:'28px 20px 22px',
      display:'flex', flexDirection:'column', alignItems:'center', gap:14,
      transition:'transform 0.2s, box-shadow 0.2s',
      transform: hov ? 'translateY(-4px)' : 'none',
      boxShadow: hov ? '0 12px 32px rgba(91,33,182,0.18)' : '0 2px 10px rgba(91,33,182,0.08)',
      animation:'fadeUp 0.3s ease both',
      animationDelay:`${index*60}ms`,
    }}>
      <div style={{
        width:80, height:80, borderRadius:18, overflow:'hidden',
        background: platform.logoBg,
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 4px 16px rgba(0,0,0,0.18)',
      }}>
        <img src={platform.logo} alt={platform.label}
          style={{width:'100%',height:'100%',objectFit:'cover'}}/>
      </div>
      <div style={{fontSize:14,fontWeight:800,color:TEXT}}>{platform.label}</div>
      {deleteMode && (
        <button onClick={()=>onRemove(platform.id)} style={{
          position:'absolute', top:-8, right:-8,
          width:26, height:26, borderRadius:'50%',
          background:'#ef4444', border:'2px solid white',
          color:'white', fontSize:14, fontWeight:900,
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 2px 6px rgba(239,68,68,0.4)', lineHeight:1,
        }}>×</button>
      )}
    </div>
  );
}

export default function SubscriptionManager() {
  const [active,     setActive]     = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [modalSel,   setModalSel]   = useState([]);
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState('');

  useEffect(() => {
    api.get('/profile/subscriptions')
      .then(r => {
        const platforms = (r.data.platforms || []).map(norm);
        console.log('Loaded subscriptions:', platforms);
        setActive(platforms);
      })
      .catch(e => console.error('Failed to load subscriptions:', e));
  }, []);

  const removeSub = async (id) => {
    try {
      await api.delete(`/profile/subscriptions/${id}`);
      setActive(prev => prev.filter(p => p !== id));
    } catch (e) { console.error('Remove failed:', e); }
  };

  const addSubs = async () => {
    if (modalSel.length === 0) return;
    setSaveError('');
    try {
      setSaving(true);
      const combined = [...new Set([...active, ...modalSel])];
      console.log('Saving platforms:', combined);
      const response = await api.post('/profile/subscriptions', { platforms: combined });
      console.log('Save response:', response.data);
      setActive(combined);
      setShowModal(false);
      setModalSel([]);
    } catch (e) {
      console.error('Add subs failed:', e);
      setSaveError(e.response?.data?.detail || e.response?.data?.error || 'Failed to save. Check terminal for details.');
    } finally {
      setSaving(false);
    }
  };

  const available       = ALL_PLATFORMS.filter(p => !active.includes(p.id));
  const activePlatforms = ALL_PLATFORMS.filter(p => active.includes(p.id));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
        @keyframes mdIn   { from{opacity:0;}to{opacity:1;} }
        body { margin:0; background:${BG}; }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{minHeight:'100vh', background:BG, fontFamily:FONT}}>
        <Navbar />
        <div style={{padding:'32px 32px 56px'}}>
          <div style={{fontSize:30,fontWeight:900,color:TEXT,letterSpacing:'-0.5px',marginBottom:4}}>
            Subscription Manager
          </div>
          <div style={{fontSize:13,fontWeight:500,color:MUT,marginBottom:28}}>
            Manage your streaming platforms
          </div>

          <div style={{display:'flex',gap:12,marginBottom:32,flexWrap:'wrap',alignItems:'center'}}>
            <button onClick={()=>{setModalSel([]);setSaveError('');setShowModal(true);}} style={{
              display:'flex',alignItems:'center',gap:7,
              padding:'10px 22px',borderRadius:11,
              background:'linear-gradient(135deg,#7C3AED,#9333ea)',
              border:'none',color:'white',
              fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:FONT,
              boxShadow:'0 4px 14px rgba(124,58,237,0.35)',
            }}>+ Add Subscription</button>

            {activePlatforms.length > 0 && (
              <button onClick={()=>setDeleteMode(v=>!v)} style={{
                display:'flex',alignItems:'center',gap:7,
                padding:'10px 22px',borderRadius:11,
                background: deleteMode ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.7)',
                border: deleteMode ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(124,58,237,0.2)',
                color: deleteMode ? '#dc2626' : TEXT,
                fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:FONT,
              }}>
                🗑 {deleteMode ? 'Cancel Delete Mode' : 'Remove Subscription'}
              </button>
            )}
          </div>

          {activePlatforms.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 0',fontSize:15,fontWeight:600,color:MUT}}>
              No subscriptions yet — click Add Subscription to get started.
            </div>
          ) : (
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill, 180px)',
              gap:18,
            }}>
              {activePlatforms.map((p,i) => (
                <PlatformCard key={p.id} platform={p} index={i}
                  deleteMode={deleteMode} onRemove={removeSub}/>
              ))}
            </div>
          )}
        </div>
      </div>

      {}
      {showModal && (
        <div onClick={()=>setShowModal(false)} style={{
          position:'fixed',inset:0,zIndex:200,
          background:'rgba(10,0,30,0.55)',backdropFilter:'blur(8px)',
          display:'flex',alignItems:'center',justifyContent:'center',
          padding:24,animation:'mdIn 0.2s ease both',
        }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:'rgba(255,255,255,0.97)',
            border:'1px solid rgba(124,58,237,0.14)',
            borderRadius:22,padding:'30px 30px 24px',
            width:'100%',maxWidth:560,
            boxShadow:'0 24px 64px rgba(0,0,0,0.25)',
            fontFamily:FONT,
          }}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
              <div style={{fontSize:20,fontWeight:800,color:TEXT}}>Add Subscriptions</div>
              <button onClick={()=>setShowModal(false)} style={{
                width:30,height:30,borderRadius:'50%',
                background:'rgba(124,58,237,0.08)',border:'none',
                cursor:'pointer',fontSize:18,color:MUT,
                display:'flex',alignItems:'center',justifyContent:'center',
              }}>x</button>
            </div>

            {saveError && (
              <div style={{
                background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',
                borderRadius:10,padding:'10px 14px',marginBottom:16,
                fontSize:13,fontWeight:600,color:'#dc2626',
              }}>{saveError}</div>
            )}

            {available.length === 0 ? (
              <div style={{textAlign:'center',padding:'20px 0',fontSize:14,fontWeight:600,color:MUT}}>
                You've added all available platforms!
              </div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:22}}>
                {available.map(p => {
                  const on = modalSel.includes(p.id);
                  return (
                    <div key={p.id} onClick={()=>setModalSel(prev=>
                      prev.includes(p.id) ? prev.filter(x=>x!==p.id) : [...prev,p.id]
                    )} style={{
                      borderRadius:14,padding:'18px 10px 14px',
                      border: on ? `2px solid ${PUR}` : '2px solid rgba(124,58,237,0.12)',
                      background: on ? 'rgba(124,58,237,0.06)' : 'rgba(124,58,237,0.02)',
                      cursor:'pointer',textAlign:'center',transition:'all 0.15s',
                    }}>
                      <div style={{
                        width:60,height:60,borderRadius:14,
                        background:p.logoBg,margin:'0 auto 10px',overflow:'hidden',
                        boxShadow:'0 3px 10px rgba(0,0,0,0.2)',
                      }}>
                        <img src={p.logo} alt={p.label}
                          style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      </div>
                      <div style={{fontSize:12,fontWeight:700,color:TEXT}}>{p.label}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <button onClick={addSubs} disabled={modalSel.length===0||saving} style={{
              width:'100%',padding:'13px',
              background: modalSel.length===0
                ? 'rgba(124,58,237,0.2)'
                : 'linear-gradient(135deg,#7C3AED,#9333ea)',
              border:'none',borderRadius:12,color:'white',
              fontSize:14,fontWeight:700,fontFamily:FONT,
              cursor: modalSel.length===0 ? 'not-allowed' : 'pointer',
              boxShadow: modalSel.length>0 ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
              opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'Saving…'
                : modalSel.length>0
                  ? `Add ${modalSel.length} Subscription${modalSel.length>1?'s':''}`
                  : 'Select platforms above'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
