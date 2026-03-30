import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Heart, Play, Clock, Trophy, ChevronLeft, Star, Eye } from 'lucide-react';

const TABS = [
  { key: 'liked',  label: 'Most Liked',  icon: Heart, scoreKey: 'likes',     scoreSuffix: 'likes' },
  { key: 'played', label: 'Most Played', icon: Eye,   scoreKey: 'playCount', scoreSuffix: 'plays' },
  { key: 'rated',  label: 'Top Rated',   icon: Star,  scoreKey: 'avgRating', scoreSuffix: 'avg' },
  { key: 'recent', label: 'Newest',      icon: Clock, scoreKey: null,        scoreSuffix: null    },
];

function LeaderboardRow({ game, rank, scoreKey, scoreSuffix }) {
  const navigate = useNavigate();

  const date = new Date(game.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="flex items-center gap-4 p-5 bg-slate-900 border border-white/5 rounded-2xl cursor-pointer hover:border-sky-500/30 hover:bg-slate-800/50 transition-all group"
      onClick={() => navigate(`/games/${game.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/games/${game.id}`)}
    >
      {/* Rank */}
      <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-black text-sm border ${
        rank === 1 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
        rank === 2 ? 'text-slate-300 bg-slate-300/10 border-slate-300/20' :
        rank === 3 ? 'text-orange-400 bg-orange-400/10 border-orange-400/30' :
        'text-slate-500 bg-slate-900 border-white/5'
      }`}>
        {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : `#${rank}`}
      </div>

      {/* Thumbnail */}
      <div className="w-20 h-14 shrink-0 rounded-xl overflow-hidden bg-slate-950">
        {(game.thumbnailUrl || game.thumbnail) ? (
          <img
            src={game.thumbnailUrl || game.thumbnail}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sky-500/20 to-indigo-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-slate-600" />
          </div>
        )}
      </div>

      {/* Title + author */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold truncate group-hover:text-sky-400 transition-colors">
          {game.title}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {game.author ? (
            <Link
              to={`/creator/${encodeURIComponent(game.author)}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-bold text-slate-500 hover:text-sky-400 transition-colors"
            >
              {game.author}
            </Link>
          ) : (
            <span className="text-xs font-bold text-slate-600">Anonymous</span>
          )}
          {game.aiTool && (
            <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              {game.aiTool}
            </span>
          )}
        </div>
      </div>

      {/* Score */}
      <div className="shrink-0 text-right">
        {scoreKey ? (
          <>
            <p className="text-white font-black text-xl">{
              typeof game[scoreKey] === 'number'
                ? (Number.isInteger(game[scoreKey]) ? game[scoreKey].toLocaleString() : game[scoreKey].toFixed(1))
                : '0'
            }</p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{scoreSuffix}</p>
          </>
        ) : (
          <p className="text-slate-400 text-sm font-bold">{date}</p>
        )}
      </div>
    </motion.div>
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
    if (activeTab === 'rated')  copy.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    return copy.slice(0, 10);
  }, [games, activeTab]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-sm font-bold mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to games
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-yellow-400/10 rounded-2xl">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Leaderboard</h1>
            <p className="text-slate-400 font-medium">Top 10 games on WebGames</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-white/5 rounded-2xl p-1.5 mb-8">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === t.key
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {error ? (
        <div className="text-center py-20">
          <p className="text-rose-400 font-bold mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary">Retry</button>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[76px] skeleton rounded-2xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-bold text-lg mb-6">No games yet!</p>
          <Link to="/upload" className="btn-primary">Upload the first game</Link>
        </div>
      ) : (
        <div className="space-y-4">
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
