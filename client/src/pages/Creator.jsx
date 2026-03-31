import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  User, 
  Gamepad2, 
  Heart, 
  Eye, 
  ChevronLeft, 
  Sparkles,
  Trophy,
  Calendar,
  Share2,
  Play
} from 'lucide-react';

function StatCard({ value, label, icon: Icon, color }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-[2rem] bg-slate-900 border border-white/5 flex flex-col items-center text-center group"
    >
      <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <h3 className="text-3xl font-black text-white mb-1">{value.toLocaleString()}</h3>
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}

function GameCard({ game }) {
  const navigate = useNavigate();
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      onClick={() => navigate(`/games/${game.id}`)}
      className="group cursor-pointer p-4 rounded-[2rem] bg-slate-900 border border-white/5 hover:border-sky-500/30 transition-all"
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-slate-950">
        <img src={game.thumbnailUrl || game.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xl">
            <Play className="w-6 h-6 fill-current" />
          </div>
        </div>
      </div>
      <h4 className="font-black text-slate-200 group-hover:text-sky-400 transition-colors px-2 mb-2 line-clamp-1">{game.title}</h4>
      <div className="flex items-center justify-between px-2 text-slate-500 font-bold text-xs">
        <div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-sky-400" /> {game.playCount.toLocaleString()}</div>
        <div className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> {game.likes}</div>
      </div>
    </motion.div>
  );
}

export default function Creator() {
  const { name } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCreator() {
      try {
        const res = await axios.get(`/api/creators/${encodeURIComponent(name)}`);
        setData(res.data);
        setLoading(false);
      } catch (err) {
        setError('Creator profile not found.');
        setLoading(false);
      }
    }
    fetchCreator();
  }, [name]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${name}'s Profile | WebGames`,
        text: `Check out ${name}'s AI games on WebGames!`,
        url: window.location.href,
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Profile link copied!');
      }
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center font-black text-sky-400">
      <Sparkles className="w-12 h-12 animate-pulse mx-auto mb-4" />
      Loading Creator Profile...
    </div>
  );

  if (error) return (
    <div className="py-40 text-center">
      <h2 className="text-3xl font-black mb-4">{error}</h2>
      <Link to="/" className="btn-primary">Explore Games</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold mb-12">
        <ChevronLeft className="w-5 h-5" /> Back to Discover
      </Link>

      {/* Profile Header */}
      <div className="relative p-12 sm:p-20 rounded-[3rem] bg-slate-900 border border-white/5 overflow-hidden mb-12">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-2xl shadow-sky-500/20">
            <User className="w-16 h-16 text-white" />
          </div>
          
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-500/10 text-sky-400 text-[10px] font-black uppercase tracking-widest mb-4">
              Verified Creator
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">{name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-slate-400 font-bold">
              <div className="flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-sky-400" /> {data.totalGames} Games Published</div>
              <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-400" /> {data.games.length > 0 ? `First game ${new Date(data.games[data.games.length - 1]?.createdAt).getFullYear()}` : 'New Creator'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              className="h-14 w-14 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110"
            >
              <Share2 className="w-6 h-6" />
            </button>
            <button
              onClick={() => toast('Follow feature coming soon! Stay tuned.', { icon: '🔔' })}
              className="h-14 px-8 rounded-2xl bg-sky-500 text-white font-black shadow-lg shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              Follow Creator
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        <StatCard value={data.totalGames} label="Total Games" icon={Gamepad2} color="text-sky-400" />
        <StatCard value={data.totalLikes} label="Total Likes" icon={Heart} color="text-rose-500" />
        <StatCard value={data.totalPlays} label="Total Plays" icon={Eye} color="text-emerald-400" />
      </div>

      {/* Games Section */}
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-indigo-500/10 rounded-xl">
            <Trophy className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-black tracking-tight">Portfolio</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.games.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </div>
  );
}