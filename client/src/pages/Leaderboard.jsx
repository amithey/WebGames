import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TABS = [
  { key: 'liked',  label: 'Most Liked',  icon: '♥', scoreKey: 'likes',     scoreSuffix: 'likes' },
  { key: 'played', label: 'Most Played', icon: '▶', scoreKey: 'playCount', scoreSuffix: 'plays' },
  { key: 'recent', label: 'Newest',      icon: '✦', scoreKey: null,        scoreSuffix: null    },
];

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
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return PLACEHOLDER_COLORS[Math.abs(hash) % PLACEHOLDER_COLORS.length];
}

const RANK_STYLES = [
  'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  'text-slate-300 bg-slate-300/10 border-slate-300/30',
  'text-orange-400 bg-orange-400/10 border-orange-400/30',
];

function LeaderboardRow({ game, rank, scoreKey, scoreSuffix }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const gradient = getGradient(game.id);
  const rankStyle = rank <= 3 ? RANK_STYLES[rank - 1] : 'text-slate-500 bg-transparent border-[#1e1e3f]';

  const date = new Date(game.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div
      className="flex items-center gap-4 p-4 bg-[#13132a] border border-[#1e1e3f] rounded-xl cursor-pointer hover:border-purple-500/50 hover:bg-[#16163a] transition-all group"
      onClick={() => navigate(`/games/${game.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/games/${game.id}`)}
    >
      {/* Rank */}
      <div className={`w-10 h-10 shrink-0 rounded-lg border flex items-center justify-center font-bold text-sm ${rankStyle}`}>
        {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : `#${rank}`}
      </div>

      {/* Thumbnail */}
      <div className="w-16 h-12 shrink-0 rounded-lg overflow-hidden bg-[#07070f]">
        {game.thumbnail && !imgError ? (
          <img
            src={`/${game.thumbnail}`}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
        )}
      </div>

      {/* Title + author + tags */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate group-hover:text-purple-300 transition-colors">
          {game.title}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {game.author ? (
            <Link
              to={`/creator/${encodeURIComponent(game.author)}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-slate-500 hover:text-purple-400 transition-colors"
            >
              {game.author}
            </Link>
          ) : (
            <span className="text-xs text-slate-600 italic">Anonymous</span>
          )}
          {game.tags?.slice(0, 2).map(t => (
            <span key={t} className="tag-badge hidden sm:inline-block">{t}</span>
          ))}
        </div>
      </div>

      {/* Score */}
      <div className="shrink-0 text-right">
        {scoreKey ? (
          <>
            <p className="text-white font-bold text-lg">{(game[scoreKey] ?? 0).toLocaleString()}</p>
            <p className="text-slate-500 text-xs">{scoreSuffix}</p>
          </>
        ) : (
          <p className="text-slate-400 text-xs">{date}</p>
        )}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('liked');

  useEffect(() => {
    axios.get('/api/games?sort=recent')
      .then(res => { setGames(res.data); setLoading(false); })
      .catch(() => { setError('Failed to load leaderboard.'); setLoading(false); });
  }, []);

  const tab = TABS.find(t => t.key === activeTab);

  const sorted = useMemo(() => {
    const copy = [...games];
    if (activeTab === 'liked')  copy.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    if (activeTab === 'played') copy.sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0));
    // 'recent' is already newest-first from the API
    return copy.slice(0, 10);
  }, [games, activeTab]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 page-transition">
      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to games
        </Link>

        <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
          <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Leaderboard
        </h1>
        <p className="text-slate-400 mt-2">Top 10 games on WebGames</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#13132a] border border-[#1e1e3f] rounded-xl p-1 mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.key
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {error ? (
        <div className="text-center py-16">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary">Retry</button>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-[#13132a] border border-[#1e1e3f] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg mb-4">No games yet!</p>
          <Link to="/upload" className="btn-primary">Upload the first game</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((game, i) => (
            <LeaderboardRow
              key={game.id}
              game={game}
              rank={i + 1}
              scoreKey={tab.scoreKey}
              scoreSuffix={tab.scoreSuffix}
            />
          ))}
        </div>
      )}
    </div>
  );
}
