import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

function StatCard({ value, label, color = 'text-white' }) {
  return (
    <div className="bg-[#13132a] border border-[#1e1e3f] rounded-xl p-5 text-center">
      <p className={`text-3xl font-extrabold ${color}`}>{value.toLocaleString()}</p>
      <p className="text-slate-500 text-sm mt-1">{label}</p>
    </div>
  );
}

function MiniGameCard({ game }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const gradient = getGradient(game.id);

  return (
    <article
      className="card cursor-pointer group"
      onClick={() => navigate(`/games/${game.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/games/${game.id}`)}
    >
      <div className="relative w-full aspect-video overflow-hidden bg-[#07070f]">
        {game.thumbnail && !imgError ? (
          <img
            src={game.thumbnail.startsWith('http') ? game.thumbnail : `/${game.thumbnail}`}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <svg className="w-10 h-10 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-purple-600/90 rounded-full p-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          {game.playCount.toLocaleString()}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold text-sm mb-2 truncate group-hover:text-purple-300 transition-colors">
          {game.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-pink-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {(game.likes ?? 0).toLocaleString()}
          </span>
          {game.tags?.length > 0 && (
            <div className="flex gap-1">
              {game.tags.slice(0, 2).map(t => (
                <span key={t} className="tag-badge">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Creator() {
  const { name } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`/api/creators/${encodeURIComponent(name)}`)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => {
        setError(err.response?.status === 404 ? 'Creator not found.' : 'Failed to load profile.');
        setLoading(false);
      });
  }, [name]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-pulse space-y-6">
        <div className="h-6 bg-[#1e1e3f] rounded w-48" />
        <div className="h-10 bg-[#1e1e3f] rounded w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map(i => <div key={i} className="h-24 bg-[#1e1e3f] rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0,1,2].map(i => <div key={i} className="h-52 bg-[#1e1e3f] rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div className="text-center py-20">
          <p className="text-red-400 text-xl font-semibold mb-6">{error}</p>
          <Link to="/" className="btn-primary">Browse Games</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 page-transition">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to games
      </Link>

      {/* Profile header */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/30">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">{name}</h1>
          <p className="text-slate-400 text-sm mt-1">Game creator on WebGames</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard value={data.totalGames} label="Games" color="text-purple-400" />
        <StatCard value={data.totalLikes} label="Total Likes" color="text-pink-400" />
        <StatCard value={data.totalPlays} label="Total Plays" color="text-cyan-400" />
      </div>

      {/* Games grid */}
      <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Games by {name}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.games.map(game => (
          <MiniGameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
