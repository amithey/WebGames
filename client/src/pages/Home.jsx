import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Tilt from 'react-parallax-tilt';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Play, 
  Heart, 
  Eye, 
  Star, 
  TrendingUp, 
  Sparkles,
  Trophy,
  Gamepad2,
  Cpu,
  Zap,
  Clock,
  LayoutGrid,
  ListFilter,
  X,
  Upload as UploadIcon
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const AI_TOOLS = [
  'Claude', 'ChatGPT', 'Gemini', 'Copilot', 'v0', 'Bolt', 'Cursor', 'Replit', 'Other'
];

const CATEGORIES = [
  { id: 'action', label: 'Action', icon: Zap },
  { id: 'puzzle', label: 'Puzzle', icon: LayoutGrid },
  { id: 'arcade', label: 'Arcade', icon: Gamepad2 },
  { id: 'rpg', label: 'RPG', icon: Trophy },
  { id: 'simulation', label: 'Simulation', icon: Cpu },
];

const AI_TOOL_COLORS = {
  'Claude': 'from-orange-400 to-red-500',
  'ChatGPT': 'from-emerald-400 to-teal-600',
  'Gemini': 'from-blue-400 to-indigo-600',
  'Copilot': 'from-sky-400 to-blue-500',
  'v0': 'from-slate-700 to-slate-900',
  'Bolt': 'from-yellow-400 to-orange-500',
  'Cursor': 'from-cyan-400 to-blue-500',
  'Replit': 'from-orange-500 to-red-600',
  'Other': 'from-slate-400 to-slate-600',
};

// ─── Components ──────────────────────────────────────────────────────────────

function AIBadge({ tool }) {
  const gradient = AI_TOOL_COLORS[tool] || AI_TOOL_COLORS['Other'];
  return (
    <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter text-white bg-gradient-to-r ${gradient} shadow-sm`}>
      {tool}
    </div>
  );
}

function GameCard({ game }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      perspective={1000}
      scale={1.02}
      transitionSpeed={1500}
      gyroscope={true}
      className="h-full"
    >
      <motion.article
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card h-full flex flex-col group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => navigate(`/games/${game.id}`)}
      >
        <div className="relative aspect-video overflow-hidden bg-slate-950">
          <img 
            src={game.thumbnailUrl || game.thumbnail || `https://source.unsplash.com/random/400x225?game,${game.id}`} 
            alt={game.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
          <div className={`absolute inset-0 bg-slate-900/60 transition-opacity duration-300 flex items-center justify-center ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <motion.div
              initial={false}
              animate={{ scale: isHovered ? 1 : 0.8 }}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl"
            >
              <Play className="w-6 h-6 fill-current" />
            </motion.div>
          </div>
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {game.aiTool && <AIBadge tool={game.aiTool} />}
            {game.featured && (
              <div className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-yellow-400 text-black flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-current" />
                Featured
              </div>
            )}
          </div>
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-sky-400" />
            {game.playCount.toLocaleString()}
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-bold text-lg leading-tight group-hover:text-sky-400 transition-colors line-clamp-1">
              {game.title}
            </h3>
            {game.avgRating > 0 && (
              <div className="flex items-center gap-1 text-yellow-400 font-bold text-xs">
                <Star className="w-3 h-3 fill-current" />
                {game.avgRating}
              </div>
            )}
          </div>
          <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-1">
            {game.description || 'No description provided.'}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                {game.author?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-xs font-medium text-slate-400">{game.author || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-rose-500 font-bold">
              <Heart className="w-3.5 h-3.5 fill-current" />
              {game.likes}
            </div>
          </div>
        </div>
      </motion.article>
    </Tilt>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const query = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'recent';
  const selAiTool = searchParams.get('aiTool') || '';
  const selCategory = searchParams.get('category') || '';

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      // Map frontend 'q' param to backend 'search' param
      if (params.has('q')) {
        params.set('search', params.get('q'));
        params.delete('q');
      }
      // Remove collection param (frontend-only filter)
      params.delete('collection');
      const [gamesRes, collRes] = await Promise.all([
        axios.get(`/api/games?${params.toString()}`),
        axios.get('/api/collections')
      ]);
      setGames(gamesRes.data);
      setCollections(collRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  const featuredGame = useMemo(() => games.find(g => g.featured) || games[0], [games]);
  const trendingGames = useMemo(() => [...games].sort((a, b) => b.playCount - a.playCount).slice(0, 4), [games]);

  const updateParam = (key, val) => {
    setSearchParams(prev => {
      if (val) prev.set(key, val);
      else prev.delete(key);
      return prev;
    });
  };

  return (
    <div className="pb-20">
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-10 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-black uppercase tracking-widest mb-8">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Where AI Built Games Come to Life
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            The Future of <br />
            <span className="animated-gradient-text">Gaming is AI.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium">
            Discover thousands of unique browser games created using advanced AI tools.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/upload" className="btn-primary px-10 py-4 text-lg w-full sm:w-auto">
              <UploadIcon className="w-6 h-6" /> Upload Your Game
            </Link>
            <button 
              onClick={() => {
                const el = document.getElementById('browse-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="btn-secondary px-10 py-4 text-lg w-full sm:w-auto"
            >
              Explore Games
            </button>
          </motion.div>
        </div>
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── Spotlight Section ────────────────────────────────────────────── */}
        {!loading && featuredGame && (
          <section className="mb-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-yellow-400/10 rounded-xl"><Trophy className="w-6 h-6 text-yellow-400" /></div>
              <h2 className="text-3xl font-black tracking-tight">Game of the Week</h2>
            </div>
            <Link to={`/games/${featuredGame.id}`} className="group">
              <div className="relative aspect-[21/9] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={featuredGame.thumbnailUrl || featuredGame.thumbnail} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-10">
                  <div className="flex items-center gap-3 mb-4">
                    {featuredGame.aiTool && <AIBadge tool={featuredGame.aiTool} />}
                    <div className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md text-xs font-bold text-white flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 fill-current text-yellow-400" /> Staff Pick
                    </div>
                  </div>
                  <h3 className="text-4xl sm:text-5xl font-black text-white mb-4 group-hover:text-sky-400 transition-colors">{featuredGame.title}</h3>
                  <div className="flex items-center gap-6">
                    <div className="btn-primary py-3 px-8"><Play className="w-5 h-5 fill-current" /> Play Now</div>
                    <div className="flex items-center gap-4 text-white font-bold">
                      <div className="flex items-center gap-2"><Eye className="w-5 h-5 text-sky-400" /> {featuredGame.playCount.toLocaleString()}</div>
                      <div className="flex items-center gap-2"><Heart className="w-5 h-5 text-rose-500 fill-current" /> {featuredGame.likes.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ─── Trending Row ────────────────────────────────────────────────── */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-xl"><TrendingUp className="w-6 h-6 text-rose-500" /></div>
              <h2 className="text-3xl font-black tracking-tight">Trending Now</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingGames.map(game => <GameCard key={game.id} game={game} />)}
          </div>
        </section>

        {/* ─── Collections Section ─────────────────────────────────────────── */}
        {collections.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-500/10 rounded-xl"><Sparkles className="w-6 h-6 text-indigo-400" /></div>
              <h2 className="text-3xl font-black tracking-tight">Curated Collections</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {collections.map(col => (
                <div
                  key={col.id}
                  onClick={() => {
                    updateParam('collection', col.id.toString());
                    document.getElementById('browse-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-8 rounded-[2rem] bg-slate-900 border border-white/5 group cursor-pointer hover:border-sky-500/30 hover:scale-105 hover:bg-slate-800/50 transition-all"
                >
                  <h3 className="text-2xl font-black text-white mb-2 group-hover:text-sky-400 transition-colors">{col.name}</h3>
                  <p className="text-slate-400 text-sm font-medium mb-6 line-clamp-2">{col.description}</p>
                  <div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                    Explore Collection <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Browse Section ──────────────────────────────────────────────── */}
        <section id="browse-section" className="scroll-mt-24">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-2">All Games</h2>
              <p className="text-slate-400 font-medium">Discover the community's best creations</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search games..."
                  value={query}
                  onChange={(e) => updateParam('q', e.target.value)}
                  className="input-field pl-12 h-14 bg-slate-900 border-white/5"
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={`h-14 px-6 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${showFilters ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-slate-900 text-slate-400 border border-white/5 hover:border-white/10'}`}>
                <Filter className="w-5 h-5" /> Filters
              </button>
              <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="h-14 px-6 rounded-xl bg-slate-900 border border-white/5 text-slate-400 font-bold outline-none hover:border-white/10 hover:scale-105 transition-all cursor-pointer">
                <option value="recent">Newest</option>
                <option value="played">Most Played</option>
                <option value="liked">Most Liked</option>
                <option value="rated">Best Rated</option>
                <option value="alpha">A-Z</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-12">
                <div className="p-8 rounded-3xl bg-slate-900 border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-300 uppercase tracking-widest"><Cpu className="w-4 h-4 text-sky-400" /> AI Tool</div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => updateParam('aiTool', '')} className={`px-4 py-2 rounded-lg text-sm font-bold ${!selAiTool ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-400'}`}>All</button>
                      {AI_TOOLS.map(tool => (
                        <button key={tool} onClick={() => updateParam('aiTool', tool)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-110 active:scale-90 ${selAiTool === tool ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>{tool}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-300 uppercase tracking-widest"><ListFilter className="w-4 h-4 text-emerald-400" /> Category</div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => updateParam('category', '')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-110 active:scale-90 ${!selCategory ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>All</button>
                      {CATEGORIES.map(cat => (
                        <button key={cat.id} onClick={() => updateParam('category', cat.id)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-110 active:scale-90 ${selCategory === cat.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>{cat.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => <div key={i} className="card aspect-[4/5] skeleton" />)}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {games.map(game => <GameCard key={game.id} game={game} />)}
            </motion.div>
          )}
        </section>

        <section className="mt-40 p-12 sm:p-20 rounded-[3rem] relative overflow-hidden bg-slate-900 border border-white/5">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-8">Join the future of <br /><span className="text-sky-400">game creation.</span></h2>
            <p className="text-lg text-slate-400 mb-10">WebGames is the place to showcase your AI-crafted work.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/upload" className="btn-primary px-8 py-4 hover:scale-105 active:scale-95 transition-all">Get Started for Free</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
