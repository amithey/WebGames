import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Gamepad2, 
  Users, 
  MessageSquare, 
  Flag, 
  Settings, 
  LogOut, 
  Search, 
  TrendingUp,
  Star,
  Trash2,
  CheckCircle2,
  XCircle,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  Eye,
  Heart
} from 'lucide-react';

function getToken() { return sessionStorage.getItem('admin_token'); }
function authHeaders() { return { Authorization: `Bearer ${getToken()}` }; }

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(!!getToken());
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, gamesRes, reportsRes] = await Promise.all([
        axios.get('/api/admin/stats', { headers: authHeaders() }),
        axios.get('/api/admin/games', { headers: authHeaders() }),
        axios.get('/api/admin/reports', { headers: authHeaders() }).catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data);
      setGames(gamesRes.data);
      setReports(reportsRes.data);
      setIsAuthorized(true);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAuthorized) fetchAdminData(); }, [isAuthorized, fetchAdminData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/login', { password });
      sessionStorage.setItem('admin_token', res.data.token);
      setIsAuthorized(true);
    } catch (err) {
      setError('Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setIsAuthorized(false);
  };

  const toggleFeatured = async (id) => {
    try {
      const res = await axios.patch(`/api/admin/games/${id}/feature`, {}, { headers: authHeaders() });
      setGames(prev => prev.map(g => g.id === id ? { ...g, featured: res.data.featured } : g));
    } catch (_) {}
  };

  const deleteGame = async (id) => {
    if (!window.confirm('Delete this game forever?')) return;
    try {
      await axios.delete(`/api/admin/games/${id}`, { headers: authHeaders() });
      setGames(prev => prev.filter(g => g.id !== id));
    } catch (_) {}
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md p-10 rounded-[2.5rem] bg-slate-900 border border-white/5 shadow-2xl">
          <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="w-8 h-8 text-sky-400" />
          </div>
          <h1 className="text-3xl font-black text-center mb-2">Admin Terminal</h1>
          <p className="text-slate-500 text-center font-bold text-sm mb-8 uppercase tracking-widest">Restricted Access</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter Access Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field h-14 text-center tracking-[0.5em]"
              autoFocus
            />
            {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}
            <button className="btn-primary w-full h-14">Initialize Session</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
      {/* Sidebar Nav */}
      <aside className="lg:w-64 space-y-2">
        <div className="p-6 mb-8 rounded-3xl bg-slate-900 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-black text-white">A</div>
            <span className="font-black text-white">System Admin</span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connected via SSL</p>
        </div>

        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'games', label: 'Manage Games', icon: Gamepad2 },
          { id: 'reports', label: 'Reports', icon: Flag, badge: reports.length },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-sm transition-all ${activeTab === item.id ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              {item.label}
            </div>
            {item.badge > 0 && <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px]">{item.badge}</span>}
          </button>
        ))}

        <div className="pt-8 mt-8 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-2xl font-black text-sm text-rose-500 hover:bg-rose-500/5 transition-all">
            <LogOut className="w-5 h-5" /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-12">
                <header>
                  <h2 className="text-4xl font-black tracking-tight mb-2">Command Center</h2>
                  <p className="text-slate-400 font-medium">Real-time status of the WebGames platform.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Library', value: stats?.totalGames, icon: Gamepad2, color: 'text-sky-400' },
                    { label: 'Community Plays', value: stats?.totalPlays, icon: TrendingUp, color: 'text-emerald-400' },
                    { label: 'Total Feedback', value: stats?.totalComments, icon: MessageSquare, color: 'text-indigo-400' },
                    { label: 'System Reports', value: reports.length, icon: Flag, color: 'text-rose-500' },
                  ].map((s, i) => (
                    <div key={i} className="p-8 rounded-[2rem] bg-slate-900 border border-white/5">
                      <s.icon className={`w-6 h-6 ${s.color} mb-4`} />
                      <h3 className="text-3xl font-black text-white mb-1">{s.value?.toLocaleString() || '0'}</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black">Recent Activity</h3>
                    <button className="text-xs font-bold text-sky-400">View Audit Logs</button>
                  </div>
                  <div className="space-y-4">
                    {games.slice(0, 5).map(game => (
                      <div key={game.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 aspect-video rounded-lg bg-slate-800 overflow-hidden shrink-0">
                            <img src={game.thumbnailUrl || game.thumbnail} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-200 text-sm">{game.title}</h4>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">New Upload by {game.author || 'Anon'}</p>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-slate-500">
                          {new Date(game.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'games' && (
              <div className="space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-black tracking-tight mb-2">Game Library</h2>
                    <p className="text-slate-400 font-medium">Curate and moderate content.</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input placeholder="Filter games..." className="input-field pl-12 h-12 w-64 bg-slate-900 border-white/5" />
                  </div>
                </header>

                <div className="rounded-[2.5rem] bg-slate-900 border border-white/5 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950/50">
                      <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                        <th className="px-8 py-6">Identity</th>
                        <th className="px-8 py-6 text-center">Performance</th>
                        <th className="px-8 py-6 text-center">Featured</th>
                        <th className="px-8 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {games.map(game => (
                        <tr key={game.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-16 aspect-video rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/5">
                                <img src={game.thumbnailUrl || game.thumbnail} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-200 truncate">{game.title}</h4>
                                <p className="text-xs text-slate-500 font-medium">by {game.author || 'Anonymous'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-6">
                              <div className="text-center">
                                <p className="text-sm font-black text-white">{game.playCount}</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase">Plays</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-black text-rose-500">{game.likes}</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase">Likes</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center">
                              <button 
                                onClick={() => toggleFeatured(game.id)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${game.featured ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-slate-800 text-slate-500'}`}
                              >
                                <Star className={`w-5 h-5 ${game.featured ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button onClick={() => deleteGame(game.id)} className="p-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-8">
                <header>
                  <h2 className="text-4xl font-black tracking-tight mb-2">Reports Queue</h2>
                  <p className="text-slate-400 font-medium">Manage user reports and community safety.</p>
                </header>

                <div className="grid grid-cols-1 gap-6">
                  {reports.length > 0 ? (
                    reports.map(report => (
                      <div key={report.id} className="p-8 rounded-3xl bg-slate-900 border border-rose-500/20 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-start gap-6">
                          <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center shrink-0">
                            <Flag className="w-6 h-6 text-rose-500" />
                          </div>
                          <div>
                            <h4 className="font-black text-white text-lg mb-1">Inappropriate Content Report</h4>
                            <p className="text-slate-400 mb-4 font-medium italic">"{report.reason}"</p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-white/5 text-xs font-bold">
                                <Gamepad2 className="w-3.5 h-3.5 text-sky-400" /> Game ID: {report.game_id}
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(report.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="h-12 px-6 rounded-xl bg-slate-950 border border-white/5 text-slate-400 font-bold hover:text-white transition-all">Dismiss</button>
                          <button onClick={() => deleteGame(report.game_id)} className="h-12 px-6 rounded-xl bg-rose-500 text-white font-black shadow-lg shadow-rose-500/20">Delete Game</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-32 text-center rounded-[3rem] bg-slate-900 border-2 border-dashed border-white/5">
                      <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                      <h3 className="text-2xl font-black mb-2">Queue is Empty</h3>
                      <p className="text-slate-500 font-bold">No outstanding reports to process. Great job!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
