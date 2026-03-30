import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Gamepad2, 
  Cpu, 
  Play, 
  Heart,
  Calendar,
  Zap,
  LayoutGrid
} from 'lucide-react';

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get('/api/games');
        const games = res.data;
        
        const totalPlays = games.reduce((sum, g) => sum + (g.playCount || 0), 0);
        const totalLikes = games.reduce((sum, g) => sum + (g.likes || 0), 0);
        
        const aiToolCounts = {};
        games.forEach(g => {
          if (g.aiTool) {
            aiToolCounts[g.aiTool] = (aiToolCounts[g.aiTool] || 0) + 1;
          }
        });

        const categoryCounts = {};
        games.forEach(g => {
          if (g.category) {
            categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
          }
        });

        const trending = [...games].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 5);

        setStats({
          totalGames: games.length,
          totalPlays,
          totalLikes,
          aiToolCounts,
          categoryCounts,
          trending
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="p-20 text-center font-bold text-sky-400">Loading platform analytics...</div>;
  if (!stats) return <div className="p-20 text-center">Failed to load stats.</div>;

  const topTool = Object.entries(stats.aiToolCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-sky-500/10 rounded-2xl">
          <BarChart3 className="w-8 h-8 text-sky-400" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight">Platform Statistics</h1>
          <p className="text-slate-400 font-medium">Real-time analytics of the AI gaming ecosystem.</p>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Games', value: stats.totalGames, icon: Gamepad2, color: 'text-sky-400', bg: 'bg-sky-500/10' },
          { label: 'Total Plays', value: stats.totalPlays.toLocaleString(), icon: Play, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Community Likes', value: stats.totalLikes.toLocaleString(), icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Most Popular AI', value: topTool?.[0] || 'N/A', icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        ].map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-3xl bg-slate-900 border border-white/5 relative overflow-hidden group"
          >
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
              <s.icon className="w-6 h-6" />
            </div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-3xl font-black text-white">{s.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* AI Tool Distribution */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-white/5">
          <h3 className="text-xl font-black mb-8 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" /> AI Tool Usage
          </h3>
          <div className="space-y-6">
            {Object.entries(stats.aiToolCounts).sort((a, b) => b[1] - a[1]).map(([tool, count]) => (
              <div key={tool} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-300">{tool}</span>
                  <span className="text-sky-400">{count} games</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / stats.totalGames) * 100}%` }}
                    className="h-full bg-sky-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Games Table */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-white/5">
          <h3 className="text-xl font-black mb-8 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-500" /> Top Performing Games
          </h3>
          <div className="space-y-4">
            {stats.trending.map((game, i) => (
              <div key={game.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-slate-500">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-200 truncate">{game.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">{game.author || 'Anonymous'}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-sky-400 text-sm">{game.playCount.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Plays</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-white/5">
        <h3 className="text-xl font-black mb-8 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-emerald-400" /> Genre Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {Object.entries(stats.categoryCounts).map(([cat, count]) => (
            <div key={cat} className="text-center p-6 rounded-3xl bg-slate-950 border border-white/5">
              <div className="text-3xl font-black text-white mb-2">{count}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{cat}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
