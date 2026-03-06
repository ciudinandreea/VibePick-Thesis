import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const FONT = "'Montserrat', sans-serif";

function StatCounter({ value, label, isNA }) {
  const [displayed, setDisplayed] = useState(0);
  const [started, setStarted]     = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (isNA) return;
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true);
        let start = 0;
        const end = parseInt(value);
        const duration = 1400;
        const step = 16;
        const inc = end / (duration / step);
        const timer = setInterval(() => {
          start += inc;
          if (start >= end) { setDisplayed(end); clearInterval(timer); }
          else setDisplayed(Math.floor(start));
        }, step);
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started, value, isNA]);

  return (
    <div ref={ref} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 900, fontFamily: FONT,
        background: 'linear-gradient(135deg, #c084fc, #7C3AED)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        letterSpacing: '-2px', lineHeight: 1,
      }}>
        {isNA ? 'N/A' : `${displayed}%`}
      </div>
      <div style={{
        fontSize: 14, fontWeight: 600, fontFamily: FONT,
        color: 'rgba(255,255,255,0.55)', textAlign: 'center',
        maxWidth: 180, lineHeight: 1.5,
      }}>{label}</div>
    </div>
  );
}

function Reveal({ children, delay = 0, from = 'bottom' }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); observer.disconnect(); }
    }, { threshold: 0.12 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const translate = from === 'left' ? 'translateX(-40px)' : from === 'right' ? 'translateX(40px)' : 'translateY(40px)';
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : translate,
      transition: `opacity 0.75s ease ${delay}ms, transform 0.75s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

function QARow({ q, a, delay = 0 }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '40px 80px',
      padding: '64px 0',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      <Reveal from="left" delay={delay}>
        <div style={{
          fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 900, fontFamily: FONT,
          color: 'white', lineHeight: 1.2, letterSpacing: '-0.5px',
          position: 'sticky', top: 100,
        }}>
          {q}
        </div>
      </Reveal>
      <Reveal from="right" delay={delay + 80}>
        <div style={{
          fontSize: 'clamp(15px, 1.4vw, 18px)', fontWeight: 500, fontFamily: FONT,
          color: 'rgba(255,255,255,0.72)', lineHeight: 1.8,
          textAlign: 'justify', hyphens: 'auto',
        }}>
          {a}
        </div>
      </Reveal>
    </div>
  );
}

export default function About() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ fontFamily: FONT, background: '#0a0014', minHeight: '100vh', overflowX: 'hidden' }}>

      {}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        @keyframes ab-heroWord {
          0%   { opacity: 0; transform: translateY(60px) skewY(4deg); }
          100% { opacity: 1; transform: translateY(0) skewY(0); }
        }
        @keyframes ab-fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ab-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.5); }
          50%       { box-shadow: 0 0 0 12px rgba(124,58,237,0); }
        }
        .ab-cta:hover {
          transform: translateY(-3px) scale(1.03) !important;
          box-shadow: 0 20px 50px rgba(124,58,237,0.55) !important;
        }
        .ab-cta:hover .ab-arrow {
          transform: translateX(5px);
        }
        .ab-arrow { transition: transform 0.25s ease; display: inline-block; }
      `}</style>

      {}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/pages-bg.jpg)',
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}/>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'rgba(10,0,20,0.62)',
      }}/>

      {}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', padding: '0 48px', height: 64,
        background: scrolled ? 'rgba(15,5,35,0.72)' : 'rgba(15,5,35,0.30)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(124,58,237,0.20)' : '1px solid rgba(255,255,255,0.06)',
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="VibePick" style={{
                width:38, height:38, borderRadius:10, objectFit:'cover',
                boxShadow:'0 2px 8px rgba(124,58,237,0.3)' }} />
          <span style={{
            fontSize: 21, fontWeight: 800, fontFamily: FONT,
            background: 'linear-gradient(90deg, #c084fc, #7C3AED)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px',
          }}>VibePick</span>
        </div>
      </nav>

      {}
      <div style={{ position: 'relative', zIndex: 2 }}>

        {}
        <section style={{
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'flex-start',
          padding: 'clamp(80px, 10vw, 140px) clamp(24px, 8vw, 120px) 80px',
        }}>
          {}
          <div style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '3px',
            color: '#c084fc', textTransform: 'uppercase', marginBottom: 36,
            animation: 'ab-fadeUp 0.6s ease both',
          }}>
            Emotion-based entertainment recommendation application
          </div>

          {}
          {[
            { text: 'YOUR',  color: 'white' },
            { text: 'MOOD',  color: 'white' },
            { text: 'MATTERS.', color: 'url(#heroGrad)', isGrad: true },
          ].map((w, i) => (
            <div key={w.text} style={{
              fontSize: 'clamp(52px, 12vw, 148px)',
              fontWeight: 900, fontFamily: FONT,
              lineHeight: 0.92, letterSpacing: '-3px',
              display: 'block',
              animation: `ab-heroWord 0.8s cubic-bezier(.22,1,.36,1) ${i * 130 + 100}ms both`,
              ...(w.isGrad ? {
                background: 'linear-gradient(110deg, #c084fc 0%, #7C3AED 50%, #ec4899 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              } : { color: w.color }),
            }}>
              {w.text}
            </div>
          ))}

          {}
          <p style={{
            marginTop: 48, maxWidth: 520,
            fontSize: 'clamp(15px, 1.6vw, 19px)', fontWeight: 500,
            color: 'rgba(255,255,255,0.60)', lineHeight: 1.75,
            animation: 'ab-fadeUp 0.7s ease 600ms both',
          }}>
            VibePick reads how you feel and surfaces the films that will actually 
            resonate, not just what's trending.
          </p>

          {}
          <div style={{
            marginTop: 72, display: 'flex', alignItems: 'center', gap: 12,
            animation: 'ab-fadeUp 0.7s ease 900ms both',
          }}>
            <div style={{
              width: 1, height: 52, background: 'linear-gradient(to bottom, rgba(255,255,255,0.0), rgba(255,255,255,0.35))',
            }}/>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)',
              letterSpacing: '2px', textTransform: 'uppercase' }}>scroll</span>
          </div>
        </section>

        {}
        <section style={{
          padding: '0 clamp(24px, 8vw, 120px) 40px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          <QARow
            q="🎥 What is VibePick?"
            a="VibePick is a mood-aware film recommendation platform. Whether you are feeling happy, stressed or tired, VibePick curates a personalised feed of movies that genuinely match that emotional state. It connects your subscriptions, your watch history, and your preferences to suggest the perfect content for you."
            delay={0}
          />
          <QARow
            q="🎯 What are VibePick's goals?"
            a={<>
              <strong style={{ color:'#c084fc' }}>Make discovery effortless.</strong> No more endless scrolling across multiple platforms. VibePick consolidates everything into one mood-driven feed.<br/><br/>
              <strong style={{ color:'#c084fc' }}>Surface films that matter.</strong> The scoring engine weighs mood, genre preferences, viewing history, and subscription availability.<br/><br/>
              <strong style={{ color:'#c084fc' }}>Provide personal insights.</strong> It tracks mood before and after watching, so the system learns what actually makes you feel better.
            </>}
            delay={100}
          />
          <QARow
            q="✨ Why choose VibePick?"
            a={<>
              Most platforms optimise for watch-time. VibePick optimises for <strong style={{ color:'#c084fc' }}>how you feel afterwards</strong>.<br/><br/>
              It tracks which genres lift your mood versus which ones don't, keeping a calendar of your emotional journey, so you can see patterns you never noticed. Data sovereignty is prioritized, therefore your emotional logs remain solely under your control.<br/><br/>
              VibePick isn't just a recommendation engine. It's a mood-aware companion for the films you actually want to watch.
            </>}
            delay={100}
          />
        </section>

        {}
        <section style={{
          padding: 'clamp(80px, 10vw, 120px) clamp(24px, 8vw, 120px)',
        }}>
          {}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 48,
          }}>
            {[
              { value: '98', label: 'of users enjoy the app', isNA: true },
              { value: '73', label: 'find recommendations helpful', isNA: true },
              { value: '86', label: 'reported improved mood', isNA: true },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 120}>
                <div style={{
                  padding: '40px 32px',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20,
                }}>
                  <StatCounter {...s} />
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {}
        <section style={{
          padding: 'clamp(80px, 10vw, 130px) clamp(24px, 8vw, 120px) clamp(100px, 14vw, 180px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 40,
        }}>
          <Reveal>
            <div style={{
              fontSize: 'clamp(48px, 9vw, 116px)', fontWeight: 900, fontFamily: FONT,
              color: 'white', letterSpacing: '-3px', lineHeight: 0.95,
            }}>
              Intrigued?
            </div>
          </Reveal>

          <Reveal delay={120}>
            <button
              onClick={() => navigate('/login')}
              className="ab-cta"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 14,
                padding: '20px 44px',
                background: 'linear-gradient(135deg, #7C3AED, #9333ea)',
                border: 'none', borderRadius: 60, cursor: 'pointer',
                fontSize: 17, fontWeight: 800, fontFamily: FONT,
                color: 'white', letterSpacing: '0.2px',
                boxShadow: '0 10px 36px rgba(124,58,237,0.45)',
                transition: 'transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s ease',
                animation: 'ab-pulse 3s ease-in-out infinite',
              }}
            >
              Explore more
              <span className="ab-arrow" style={{ fontSize: 20, lineHeight: 1 }}>→</span>
            </button>
          </Reveal>
          <Reveal delay={240}>
            <p style={{
              fontSize: 13, fontWeight: 500, fontFamily: FONT,
              color: 'rgba(250, 242, 242, 0.76)', marginTop: 16,
            }}>
                ⚠️ Disclaimer:
                VibePick is meant for academic research. 
                It is NOT a mental health tool and does not provide psychological or 
                medical advice. If you're experiencing mental health concerns, please 
                consult a qualified healthcare professional.
            </p>
          </Reveal>
        </section>
      </div>{}
    </div>
  );
}
