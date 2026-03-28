import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    title: 'Upload in Seconds',
    desc: 'Drop your .html or .zip game file and it\'s instantly live. No lengthy approval process.',
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Play Anything',
    desc: 'From simple puzzles to full arcade games, everything runs in your browser, no downloads.',
    color: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6,182,212,0.3)',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: 'Rate & Review',
    desc: 'Give games 1-5 stars and help the community discover the best titles.',
    color: 'from-yellow-500 to-orange-500',
    glow: 'rgba(234,179,8,0.3)',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Creator Profiles',
    desc: 'Every developer gets their own profile page showing their games and stats.',
    color: 'from-pink-500 to-rose-600',
    glow: 'rgba(236,72,153,0.3)',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Leaderboards',
    desc: 'Compete for the top spot. Rankings by likes, plays, and ratings updated in real time.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.3)',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    title: 'Easy Sharing',
    desc: 'Share any game to Twitter, WhatsApp, Facebook or copy a direct link in one click.',
    color: 'from-indigo-500 to-violet-600',
    glow: 'rgba(99,102,241,0.3)',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Build Your Game',
    desc: 'Create any browser game using HTML, CSS, JavaScript, or export from your favourite game engine as a web build.',
  },
  {
    step: '02',
    title: 'Upload It',
    desc: 'Drop your .html or .zip file on the upload page. Add a title, description, tags, and a thumbnail screenshot.',
  },
  {
    step: '03',
    title: 'Share with the World',
    desc: 'Your game gets a permanent URL instantly. Share it on social media and watch the play count grow.',
  },
];

export default function About() {
  const [heroRef,    heroVis]    = useReveal(0.05);
  const [featRef,    featVis]    = useReveal();
  const [stepsRef,   stepsVis]   = useReveal();
  const [techRef,    techVis]    = useReveal();
  const [ctaRef,     ctaVis]     = useReveal();

  return (
    <div className="page-transition">
      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className={`relative overflow-hidden text-center py-24 px-4 reveal ${heroVis ? 'visible' : ''}`}
      >
        <div className="orb orb-1" style={{ opacity: 0.7 }} />
        <div className="orb orb-2" style={{ opacity: 0.7 }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-violet-400 mb-8"
            style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.22)' }}
          >
            🎮 About WebGames
          </div>

          <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight tracking-tighter">
            <span className="animated-gradient-text glow-text">Games for everyone,</span>
            <br />
            <span style={{ color: 'var(--text-1)' }}>by everyone.</span>
          </h1>

          <p className="text-xl leading-relaxed mb-10" style={{ color: 'var(--text-2)' }}>
            WebGames is an open, community driven platform where anyone can upload and share browser games, and anyone can play them, for free, with no sign up required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary text-base px-8 py-3.5">
              Browse Games
            </Link>
            <Link to="/upload" className="btn-secondary text-base px-8 py-3.5">
              Upload Your Game
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Features Grid ───────────────────────────────────────────────── */}
        <section ref={featRef} className={`mb-24 reveal ${featVis ? 'visible' : ''}`}>
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-1)' }}>
              Everything you need
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-2)' }}>
              Built for game developers and players alike.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 reveal reveal-d${Math.min(i + 1, 4)} ${featVis ? 'visible' : ''}`}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4 shadow-lg`}
                  style={{ boxShadow: `0 4px 20px ${f.glow}` }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-1)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How It Works ────────────────────────────────────────────────── */}
        <section ref={stepsRef} className={`mb-24 reveal ${stepsVis ? 'visible' : ''}`}>
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-1)' }}>
              How it works
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-2)' }}>
              From code to community in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div
                key={s.step}
                className={`relative p-8 rounded-2xl text-center reveal reveal-d${i + 1} ${stepsVis ? 'visible' : ''}`}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="text-6xl font-black mb-4 animated-gradient-text">{s.step}</div>
                <h3 className="font-bold text-xl mb-3" style={{ color: 'var(--text-1)' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{s.desc}</p>

                {i < STEPS.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── Tech Stack ──────────────────────────────────────────────────── */}
        <section ref={techRef} className={`mb-24 py-16 rounded-3xl px-8 reveal ${techVis ? 'visible' : ''}`} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-1)' }}>Built with modern tech</h2>
            <p className="mb-10" style={{ color: 'var(--text-2)' }}>
              WebGames is powered by a performant, open stack designed for scale and reliability.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'React 18',    icon: '⚛️',  sub: 'Frontend'       },
                { name: 'Node.js',     icon: '🟢',  sub: 'Backend API'    },
                { name: 'Supabase',    icon: '🐘',  sub: 'Database'       },
                { name: 'Vercel',      icon: '▲',   sub: 'Deployment'     },
              ].map(t => (
                <div key={t.name} className="p-4 rounded-xl text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
                  <div className="text-3xl mb-2">{t.icon}</div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{t.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{t.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─────────────────────────────────────────────────────────── */}
        <section
          ref={ctaRef}
          className={`mb-8 text-center py-20 px-8 rounded-3xl relative overflow-hidden reveal ${ctaVis ? 'visible' : ''}`}
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.10) 100%)', border: '1px solid rgba(139,92,246,0.20)' }}
        >
          <div className="absolute inset-0 hero-glow opacity-50" />
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-1)' }}>
              Ready to play?
            </h2>
            <p className="text-xl mb-8 max-w-md mx-auto" style={{ color: 'var(--text-2)' }}>
              Jump in and discover hundreds of free browser games made by the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="btn-primary text-base px-8 py-3.5">
                Browse All Games
              </Link>
              <Link to="/upload" className="btn-secondary text-base px-8 py-3.5">
                Share Your Game
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
