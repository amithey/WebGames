import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────
function useReveal(threshold = 0.08) {
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

// ─── Recently Played ──────────────────────────────────────────────────────────
function getRecentlyPlayed() {
  try { return JSON.parse(localStorage.getItem('wg_recently_played') || '[]'); }
  catch { return []; }
}

// ─── Placeholder colors ───────────────────────────────────────────────────────
const PLACEHOLDER_COLORS = [
  'from-purple-600 to-pink-600',
  'from-cyan-600 to-blue-600',
  'from-green-600 to-teal-600',
  'from-orange-600 to-red-600',
  'from-pink-600 to-rose-600',
  'from-indigo-600 to-purple-600',
  'from-yellow-600 to-orange-600',
  'from-teal-600 to-cyan-600',
];
function getGradient(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return PLACEHOLDER_COLORS[Math.abs(h) % PLACEHOLDER_COLORS.length];
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function HeartIcon({ filled }) {
  return filled ? (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function StarIcon({ filled }) {
  return (
    <svg className={`w-3.5 h-3.5 ${filled ? 'text-yellow-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// ─── Game Card ────────────────────────────────────────────────────────────────
function GameCard({ game, onTagClick }) {
  const navigate  = useNavigate();
  const [imgErr, setImgErr] = useState(false);
  const [gradient]          = useState(() => getGradient(game.id));
  const [likes, setLikes]   = useState(game.likes ?? 0);
  const [liked, setLiked]   = useState(() => {
    try { return localStorage.getItem(`liked_${game.id}`) === '1'; } catch { return false; }
  });
  const [liking, setLiking] = useState(false);

  const formattedDate = new Date(game.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const thumbSrc = game.thumbnail
    ? (game.thumbnail.startsWith('http') ? game.thumbnail : `/${game.thumbnail}`)
    : null;
  const hasThumbnail = thumbSrc && !imgErr;

  async function handleLike(e) {
    e.stopPropagation();
    if (liked || liking) return;
    setLiking(true);
    try {
      const res = await axios.post(`/api/games/${game.id}/like`);
      setLikes(res.data.likes);
      setLiked(true);
      localStorage.setItem(`liked_${game.id}`, '1');
    } catch (_) {}
    setLiking(false);
  }

  return (
    <article
      className="card cursor-pointer group relative"
      onClick={() => navigate(`/games/${game.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/games/${game.id}`)}
      aria-label={`Play ${game.title}`}
    >
      {game.featured && (
        <div className="absolute -top-2 -left-2 z-10 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg flex items-center gap-1">
          ⭐ FEATURED
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        {hasThumbnail ? (
          <img
            src={thumbSrc}
            alt={`${game.title} thumbnail`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <svg className="w-12 h-12 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        {/* Hover play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 bg-violet-600/90 rounded-full p-4 shadow-xl shadow-violet-500/40">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Play count badge */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <svg className="w-3 h-3 text-violet-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          {game.playCount.toLocaleString()}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1.5 gap-2">
          <h3 className="font-semibold text-base truncate group-hover:text-violet-400 transition-colors" style={{ color: 'var(--text-1)' }}>
            {game.title}
          </h3>
          {game.ratingCount > 0 && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] shrink-0" style={{ background: 'var(--glass-bg)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
              <StarIcon filled />
              <span>{game.avgRating}</span>
            </div>
          )}
        </div>

        {game.description && (
          <p className="text-sm mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-2)' }}>
            {game.description}
          </p>
        )}

        {game.tags && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {game.tags.slice(0, 3).map(tag => (
              <button
                key={tag}
                className="tag-badge hover:bg-violet-500/20 transition-colors"
                onClick={e => { e.stopPropagation(); onTagClick(tag); }}
              >
                {tag}
              </button>
            ))}
            {game.tags.length > 3 && <span className="tag-badge">+{game.tags.length - 3}</span>}
          </div>
        )}

        <div className="flex items-center justify-between text-xs pt-2" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-3)' }}>
          <span className="truncate max-w-[50%]">
            {game.author ? (
              <Link
                to={`/creator/${encodeURIComponent(game.author)}`}
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 hover:text-violet-400 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {game.author}
              </Link>
            ) : (
              <span className="italic">Anonymous</span>
            )}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={liked || liking}
              className={`flex items-center gap-1 transition-colors ${liked ? 'text-pink-400 cursor-default' : 'hover:text-pink-400'}`}
            >
              <HeartIcon filled={liked} />
              {likes.toLocaleString()}
            </button>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="w-full aspect-video skeleton" style={{ borderRadius: 0 }} />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton w-3/4" />
        <div className="h-3 skeleton w-full" />
        <div className="h-3 skeleton w-5/6" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 skeleton rounded-full w-16" />
          <div className="h-5 skeleton rounded-full w-12" />
        </div>
      </div>
    </div>
  );
}

// ─── Recent Game Mini Card ────────────────────────────────────────────────────
function RecentCard({ game }) {
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);
  const [gradient] = useState(() => getGradient(game.id));
  const thumb = game.thumbnail?.startsWith('http') ? game.thumbnail : null;

  return (
    <button
      onClick={() => navigate(`/games/${game.id}`)}
      className="flex-shrink-0 w-36 text-left group"
    >
      <div className="w-full aspect-video rounded-xl overflow-hidden mb-2 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-violet-500/20" style={{ background: 'var(--bg-elevated)' }}>
        {thumb && !imgErr ? (
          <img src={thumb} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={() => setImgErr(true)} />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <svg className="w-5 h-5 text-white/30" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        )}
      </div>
      <p className="text-xs font-medium truncate leading-tight" style={{ color: 'var(--text-1)' }}>{game.title}</p>
      {game.author && <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--text-3)' }}>{game.author}</p>}
    </button>
  );
}

// ─── Sort Options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'recent', label: 'Newest'      },
  { value: 'liked',  label: 'Most Liked'  },
  { value: 'played', label: 'Most Played' },
  { value: 'rated',  label: 'Best Rated'  },
  { value: 'alpha',  label: 'A-Z'         },
];

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [games, setGames]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentlyPlayed]            = useState(getRecentlyPlayed);
  const searchRef                   = useRef(null);

  const query      = searchParams.get('q') || '';
  const sort       = searchParams.get('sort') || 'recent';
  const selTags    = useMemo(() => searchParams.getAll('tag'), [searchParams]);
  const minLikes   = searchParams.get('minLikes') || '';
  const minPlays   = searchParams.get('minPlays') || '';

  const fetchGames = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (query) p.set('search', query);
    if (sort)  p.set('sort', sort);
    selTags.forEach(t => p.append('tag', t));
    if (minLikes) p.set('minLikes', minLikes);
    if (minPlays) p.set('minPlays', minPlays);
    axios.get(`/api/games?${p}`)
      .then(res => { setGames(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => { setError('Failed to load games.'); setLoading(false); });
  }, [query, sort, selTags, minLikes, minPlays]);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  const allTags = useMemo(() => {
    const s = new Set();
    games.forEach(g => (g.tags || []).forEach(t => s.add(t)));
    return [...s].sort();
  }, [games]);

  const featuredGames = useMemo(() => games.filter(g => g.featured), [games]);

  const suggestions = useMemo(() => {
    if (!query || query.length < 2 || !showSuggestions) return [];
    const q = query.toLowerCase();
    return games.filter(g => g.title.toLowerCase().includes(q)).slice(0, 6);
  }, [query, games, showSuggestions]);

  const totalStats = useMemo(() => ({
    plays: games.reduce((s, g) => s + (g.playCount || 0), 0),
    likes: games.reduce((s, g) => s + (g.likes || 0), 0),
  }), [games]);

  const toggleTag = tag => {
    const next = selTags.includes(tag) ? selTags.filter(t => t !== tag) : [...selTags, tag];
    setSearchParams(prev => { prev.delete('tag'); next.forEach(t => prev.append('tag', t)); return prev; });
  };
  const updateParam = (key, val) => {
    setSearchParams(prev => { if (val) prev.set(key, val); else prev.delete(key); return prev; });
  };
  const clearFilters = () => setSearchParams({});
  const hasFilters = query || selTags.length > 0 || minLikes || minPlays;

  // Scroll reveal
  const [featuredRef, featuredVis] = useReveal();
  const [recentRef,   recentVis]   = useReveal();
  const [browseRef,   browseVis]   = useReveal();
  const [ctaRef,      ctaVis]      = useReveal();

  return (
    <div>
      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Content (above orbs) */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Live badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-violet-400 mb-8"
            style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.22)' }}
          >
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            {loading ? 'Loading...' : `${games.length} game${games.length !== 1 ? 's' : ''} live now`}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 leading-[0.92] tracking-tighter">
            <span className="animated-gradient-text glow-text">
              Upload. Play.<br />Share.
            </span>
            <br />
            <span style={{ color: 'var(--text-1)' }}>Browser Games.</span>
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium" style={{ color: 'var(--text-2)' }}>
            The ultimate community driven platform for browser games. Discover, play, and share for free. No account needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
            <Link to="/upload" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Your Game
            </Link>
            <button
              onClick={() => {
                searchRef.current?.focus();
                searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto"
            >
              Explore Games
            </button>
          </div>

          {/* Stats row */}
          {!loading && (
            <div className="flex items-center gap-8 sm:gap-12">
              {[
                { label: 'Games',       value: games.length.toLocaleString()       },
                { label: 'Total Plays', value: totalStats.plays.toLocaleString()   },
                { label: 'Total Likes', value: totalStats.likes.toLocaleString()   },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-black animated-gradient-text">{value}</div>
                  <div className="text-xs uppercase tracking-wider mt-0.5 font-medium" style={{ color: 'var(--text-3)' }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-page))' }} />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Featured ────────────────────────────────────────────────────── */}
        {!loading && featuredGames.length > 0 && (
          <section ref={featuredRef} className={`mb-16 reveal ${featuredVis ? 'visible' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="section-heading flex items-center gap-2">⭐ Featured Games</h2>
                <p className="section-sub">Handpicked by our team</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGames.slice(0, 3).map(g => (
                <GameCard key={g.id} game={g} onTagClick={toggleTag} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Recently Played ─────────────────────────────────────────────── */}
        {recentlyPlayed.length > 0 && (
          <section ref={recentRef} className={`mb-16 reveal ${recentVis ? 'visible' : ''}`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="section-heading flex items-center gap-2">🕹️ Continue Playing</h2>
                <p className="section-sub">Your recently played games</p>
              </div>
              <button
                onClick={() => {
                  try { localStorage.removeItem('wg_recently_played'); window.location.reload(); } catch {}
                }}
                className="text-xs transition-colors hover:text-red-400 flex items-center gap-1"
                style={{ color: 'var(--text-3)' }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {recentlyPlayed.map(g => <RecentCard key={g.id} game={g} />)}
            </div>
          </section>
        )}

        {/* ─── Browse All ──────────────────────────────────────────────────── */}
        <section ref={browseRef} className={`reveal ${browseVis ? 'visible' : ''}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-heading">All Games</h2>
              <p className="section-sub">Discover the community's best</p>
            </div>
          </div>

          {/* Search + Sort */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search with autocomplete */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-3)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search-input"
                  ref={searchRef}
                  type="text"
                  placeholder="Search games by title..."
                  value={query}
                  onChange={e => updateParam('q', e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="input-field pl-11 h-12"
                  autoComplete="off"
                />
                {query && (
                  <button
                    onClick={() => updateParam('q', '')}
                    className="absolute inset-y-0 right-12 flex items-center px-3 transition-colors"
                    style={{ color: 'var(--text-3)' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setShowAdvanced(v => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                  style={{ color: showAdvanced ? '#a78bfa' : 'var(--text-3)' }}
                  title="Advanced filters"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>

                {/* Autocomplete dropdown */}
                {suggestions.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-40 shadow-2xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}
                  >
                    {suggestions.map(g => (
                      <button
                        key={g.id}
                        onMouseDown={() => navigate(`/games/${g.id}`)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-violet-500/10"
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        <div
                          className="w-10 h-7 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ background: 'var(--bg-elevated)' }}
                        >
                          {g.thumbnail?.startsWith('http') ? (
                            <img src={g.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${getGradient(g.id)}`} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>{g.title}</div>
                          {g.author && <div className="text-xs truncate" style={{ color: 'var(--text-3)' }}>by {g.author}</div>}
                        </div>
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-3)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort */}
              <div
                className="flex items-center gap-1 rounded-xl p-1 shrink-0 overflow-x-auto no-scrollbar"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateParam('sort', opt.value)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200"
                    style={sort === opt.value
                      ? { background: '#7c3aed', color: '#fff' }
                      : { color: 'var(--text-2)' }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced panel */}
            {showAdvanced && (
              <div
                className="rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-1)' }}>Filter by Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                        style={selTags.includes(tag)
                          ? { background: '#7c3aed', borderColor: '#7c3aed', color: '#fff' }
                          : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-2)' }
                        }
                      >
                        {tag}
                      </button>
                    ))}
                    {allTags.length === 0 && <span className="text-xs italic" style={{ color: 'var(--text-3)' }}>No tags available</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-1)' }}>Min. Likes</label>
                  <input type="number" min="0" placeholder="0" value={minLikes} onChange={e => updateParam('minLikes', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-1)' }}>Min. Plays</label>
                  <input type="number" min="0" placeholder="0" value={minPlays} onChange={e => updateParam('minPlays', e.target.value)} className="input-field" />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-red-500/10 hover:text-red-400"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Grid */}
          {error ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-400 text-lg font-medium mb-4">{error}</p>
              <button onClick={fetchGames} className="btn-secondary">Try Again</button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-20">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-3)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {hasFilters ? (
                <>
                  <p className="text-lg mb-4" style={{ color: 'var(--text-2)' }}>No games match your filters</p>
                  <button onClick={clearFilters} className="btn-secondary">Clear all filters</button>
                </>
              ) : (
                <>
                  <p className="text-lg mb-2" style={{ color: 'var(--text-2)' }}>No games yet!</p>
                  <p className="mb-6" style={{ color: 'var(--text-3)' }}>Be the first to upload a game.</p>
                  <Link to="/upload" className="btn-primary">Upload a Game</Link>
                </>
              )}
            </div>
          ) : (
            <>
              {hasFilters && (
                <p className="text-sm mb-5" style={{ color: 'var(--text-3)' }}>
                  Showing {games.length} result{games.length !== 1 ? 's' : ''}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map(g => <GameCard key={g.id} game={g} onTagClick={toggleTag} />)}
              </div>
            </>
          )}
        </section>

        {/* ─── Bottom CTA ──────────────────────────────────────────────────── */}
        {!loading && games.length > 0 && (
          <section
            ref={ctaRef}
            className={`mt-24 mb-8 text-center py-16 rounded-3xl relative overflow-hidden reveal ${ctaVis ? 'visible' : ''}`}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="absolute inset-0 hero-glow opacity-60" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-1)' }}>
                Ready to share your game?
              </h2>
              <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: 'var(--text-2)' }}>
                Upload your HTML or ZIP game in seconds. No account required.
              </p>
              <Link to="/upload" className="btn-primary text-base px-8 py-3.5">
                + Upload Your Game
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
