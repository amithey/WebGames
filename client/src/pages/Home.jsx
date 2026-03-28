import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

// Deterministic color palette for placeholder thumbnails
const PLACEHOLDER_COLORS = [
  ['from-purple-600 to-pink-600', '#7c3aed'],
  ['from-cyan-600 to-blue-600', '#0891b2'],
  ['from-green-600 to-teal-600', '#059669'],
  ['from-orange-600 to-red-600', '#ea580c'],
  ['from-pink-600 to-rose-600', '#db2777'],
  ['from-indigo-600 to-purple-600', '#4f46e5'],
  ['from-yellow-600 to-orange-600', '#d97706'],
  ['from-teal-600 to-cyan-600', '#0d9488'],
];

function getPlaceholderColor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PLACEHOLDER_COLORS[Math.abs(hash) % PLACEHOLDER_COLORS.length];
}

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

function StarIcon({ filled, half }) {
  return (
    <svg className={`w-3.5 h-3.5 ${filled ? 'text-yellow-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function GameCard({ game, onTagClick }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [gradient] = useState(() => getPlaceholderColor(game.id));
  const [likes, setLikes] = useState(game.likes ?? 0);
  const [liked, setLiked] = useState(() => {
    try { return localStorage.getItem(`liked_${game.id}`) === '1'; } catch { return false; }
  });
  const [liking, setLiking] = useState(false);

  const formattedDate = new Date(game.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  // Support both legacy relative paths (dev) and full Supabase URLs (production)
  const thumbSrc = game.thumbnail
    ? (game.thumbnail.startsWith('http') ? game.thumbnail : `/${game.thumbnail}`)
    : null;
  const hasThumbnail = thumbSrc && !imgError;

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
      {/* Featured Badge */}
      {game.featured && (
        <div className="absolute -top-2 -left-2 z-10 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg flex items-center gap-1 animate-bounce">
          <span>⭐</span> FEATURED
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden bg-[#07070f]">
        {hasThumbnail ? (
          <img
            src={thumbSrc}
            alt={`${game.title} thumbnail`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient[0]} flex items-center justify-center`}>
            <svg className="w-12 h-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-purple-600/90 rounded-full p-3 shadow-lg shadow-purple-500/50">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Play count badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          {game.playCount.toLocaleString()}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="text-white font-semibold text-base truncate group-hover:text-purple-300 transition-colors">
            {game.title}
          </h3>
          {game.ratingCount > 0 && (
            <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-slate-300 shrink-0">
              <StarIcon filled />
              <span>{game.avgRating}</span>
            </div>
          )}
        </div>

        {game.description && (
          <p className="text-slate-400 text-sm mb-3 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        )}

        {/* Tags */}
        {game.tags && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {game.tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                className="tag-badge hover:bg-purple-500/30 hover:text-purple-200 transition-colors"
                onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
              >
                {tag}
              </button>
            ))}
            {game.tags.length > 3 && (
              <span className="tag-badge">+{game.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-[#1e1e3f]">
          <span className="truncate max-w-[50%]">
            {game.author ? (
              <Link
                to={`/creator/${encodeURIComponent(game.author)}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 hover:text-purple-400 transition-colors"
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
            {/* Like button */}
            <button
              onClick={handleLike}
              disabled={liked || liking}
              className={`flex items-center gap-1 transition-colors ${
                liked ? 'text-pink-400 cursor-default' : 'hover:text-pink-400'
              }`}
              title={liked ? 'Liked!' : 'Like this game'}
            >
              <HeartIcon filled={liked} />
              <span>{likes.toLocaleString()}</span>
            </button>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="w-full aspect-video bg-[#1e1e3f]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#1e1e3f] rounded w-3/4" />
        <div className="h-3 bg-[#1e1e3f] rounded w-full" />
        <div className="h-3 bg-[#1e1e3f] rounded w-5/6" />
        <div className="flex gap-2">
          <div className="h-5 bg-[#1e1e3f] rounded-full w-16" />
          <div className="h-5 bg-[#1e1e3f] rounded-full w-12" />
        </div>
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Newest' },
  { value: 'liked',  label: 'Most Liked'  },
  { value: 'played', label: 'Most Played' },
  { value: 'rated',  label: 'Best Rated' },
  { value: 'alpha',  label: 'A-Z' },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Read params from URL
  const query = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'recent';
  const selectedTags = useMemo(() => searchParams.getAll('tag'), [searchParams]);
  const minLikes = searchParams.get('minLikes') || '';
  const minPlays = searchParams.get('minPlays') || '';

  const fetchGames = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (sort) params.set('sort', sort);
    selectedTags.forEach(t => params.append('tag', t));
    if (minLikes) params.set('minLikes', minLikes);
    if (minPlays) params.set('minPlays', minPlays);

    axios
      .get(`/api/games?${params.toString()}`)
      .then((res) => { setGames(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch((err) => {
        console.error(err);
        setError('Failed to load games.');
        setLoading(false);
      });
  }, [query, sort, selectedTags, minLikes, minPlays]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // All unique tags across every game (could be a separate API but we'll extract from visible games for now)
  const allTags = useMemo(() => {
    const set = new Set();
    games.forEach(g => (g.tags || []).forEach(t => set.add(t)));
    return [...set].sort();
  }, [games]);

  const toggleTag = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSearchParams(prev => {
      prev.delete('tag');
      newTags.forEach(t => prev.append('tag', t));
      return prev;
    });
  };

  const updateParam = (key, value) => {
    setSearchParams(prev => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      return prev;
    });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = query || selectedTags.length > 0 || minLikes || minPlays;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-transition">
      {/* Hero */}
      <section className="text-center mb-16 relative py-10">
        <div className="absolute inset-0 hero-glow -z-10" />
        
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-6 animate-pulse">
          <span className="w-2 h-2 bg-purple-400 rounded-full" />
          {games.length} game{games.length !== 1 ? 's' : ''} live now
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tighter">
          <span className="animated-gradient-text glow-text">
            Upload. Play. Share.
          </span>
          <br />
          <span className="text-white">Browser Games</span>
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          The ultimate community-driven gaming platform. Discover, play, and share free browser games — no registration required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/upload" className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4 w-full sm:w-auto">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Your Game
          </Link>
          <button 
            onClick={() => document.getElementById('search-input')?.focus()}
            className="btn-secondary inline-flex items-center gap-2 text-base px-10 py-4 w-full sm:w-auto"
          >
            Explore Games
          </button>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="search-input"
              type="text"
              placeholder="Search games..."
              value={query}
              onChange={(e) => updateParam('q', e.target.value)}
              className="input-field pl-12 h-12"
            />
            {query && (
              <button
                onClick={() => updateParam('q', '')}
                className="absolute inset-y-0 right-12 pr-4 flex items-center text-slate-500 hover:text-slate-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${showAdvanced ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
              title="Advanced Filters"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 bg-[#13132a] border border-[#1e1e3f] rounded-xl p-1 shrink-0 overflow-x-auto no-scrollbar">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => updateParam('sort', opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  sort === opt.value
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Panel */}
        {showAdvanced && (
          <div className="bg-[#13132a] border border-[#1e1e3f] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Tags */}
            <div className="md:col-span-3">
              <label className="block text-slate-300 text-sm font-medium mb-3">Filter by Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-600 border-purple-500 text-white shadow shadow-purple-500/30'
                        : 'bg-transparent border-[#1e1e3f] text-slate-400 hover:border-purple-500/50 hover:text-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {allTags.length === 0 && <span className="text-slate-500 text-xs italic">No tags found</span>}
              </div>
            </div>

            {/* Min Likes */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Min. Likes</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={minLikes}
                onChange={(e) => updateParam('minLikes', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Min Plays */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Min. Plays</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={minPlays}
                onChange={(e) => updateParam('minPlays', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Clear All */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full py-2.5 rounded-xl border border-[#1e1e3f] text-slate-400 text-sm font-medium hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Games Grid */}
      {error ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-400 text-lg font-medium">{error}</p>
          <button onClick={() => fetchGames()} className="mt-4 btn-secondary">
            Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#13132a] border border-[#1e1e3f] rounded-full mb-6">
            <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {hasFilters ? (
            <>
              <p className="text-slate-400 text-lg mb-2">No games match your filters</p>
              <button
                onClick={clearFilters}
                className="btn-secondary mt-2"
              >
                Clear all filters
              </button>
            </>
          ) : (
            <>
              <p className="text-slate-400 text-lg mb-2">No games yet!</p>
              <p className="text-slate-500 mb-6">Be the first to upload a game.</p>
              <Link to="/upload" className="btn-primary">Upload a Game</Link>
            </>
          )}
        </div>
      ) : (
        <>
          {hasFilters && (
            <p className="text-slate-500 text-sm mb-4">
              Showing {games.length} result{games.length !== 1 ? 's' : ''}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} onTagClick={toggleTag} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
