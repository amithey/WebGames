import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
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
  Heart,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [reports, setReports] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const authHeaders = useCallback(() => {
    return { Authorization: `Bearer ${session?.access_token}` };
  }, [session]);

  const fetchAdminData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [statsRes, gamesRes, reportsRes, commentsRes] = await Promise.all([
        axios.get('/api/admin/stats', { headers: authHeaders() }),
        axios.get('/api/admin/games', { headers: authHeaders() }),
        axios.get('/api/admin/reports', { headers: authHeaders() }).catch(() => ({ data: [] })),
        axios.get('/api/admin/comments', { headers: authHeaders() }).catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data);
      setGames(gamesRes.data);
      setReports(reportsRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      if (err.response?.status === 403) setError('You do not have permission to view this page.');
      else if (err.response?.status === 401) navigate('/');
    } finally {
      setLoading(false);
    }
  }, [session, authHeaders, navigate]);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.is_admin) {
          setIsAdmin(true);
          setLoading(false);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  useEffect(() => { if (isAdmin && session) fetchAdminData(); }, [isAdmin, session, fetchAdminData]);

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

  const deleteComment = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axios.delete(`/api/admin/comments/${id}`, { headers: authHeaders() });
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md p-10 rounded-[2.5rem] bg-slate-900 border border-white/5 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Lock className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-3xl font-black mb-4">Access Denied</h1>
          <p className="text-slate-400 font-medium mb-8">This terminal is restricted to platform administrators only.</p>
          <button onClick={() => navigate('/')} className="btn-primary w-full h-14">Return to Platform</button>
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
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{session?.user?.email}</p>
        </div>

        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'games', label: 'Manage Games', icon: Gamepad2 },
          { id: 'comments', label: 'Comments', icon: MessageSquare, badge: comments.length },
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
                    <button onClick={() => setActiveTab('games')} className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors">View All Games</button>
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

            {activeTab === 'comments' && (
              <div className="space-y-8">
                <header>
                  <h2 className="text-4xl font-black tracking-tight mb-2">All Comments</h2>
                  <p className="text-slate-400 font-medium">Review and remove user comments.</p>
                </header>

                {comments.length > 0 ? (
                  <div className="rounded-[2.5rem] bg-slate-900 border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950/50">
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                          <th className="px-8 py-6">Author</th>
                          <th className="px-8 py-6">Comment</th>
                          <th className="px-8 py-6">Game</th>
                          <th className="px-8 py-6 text-center">Type</th>
                          <th className="px-8 py-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {comments.map(comment => (
                          <tr key={comment.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-xs shrink-0">
                                  {comment.authorName?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <span className="font-bold text-slate-200 text-sm">{comment.authorName}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5 max-w-xs">
                              <p className="text-slate-400 text-sm line-clamp-2">{comment.content}</p>
                              <p className="text-[10px] text-slate-600 mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-sm font-bold text-sky-400 truncate block max-w-[140px]">{comment.gameTitle}</span>
                            </td>
                            <td className="px-8 py-5 text-center">
                              <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${comment.isReply ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {comment.isReply ? 'Reply' : 'Comment'}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button onClick={() => deleteComment(comment.id)} className="p-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-32 text-center rounded-[3rem] bg-slate-900 border-2 border-dashed border-white/5">
                    <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-6" />
                    <h3 className="text-2xl font-black mb-2">No Comments Yet</h3>
                    <p className="text-slate-500 font-bold">Comments will appear here once users start engaging.</p>
                  </div>
                )}
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

            {activeTab === 'analytics' && (
              <div className="space-y-12">
                <header>
                  <h2 className="text-4xl font-black tracking-tight mb-2">Analytics</h2>
                  <p className="text-slate-400 font-medium">Platform performance overview.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2rem] bg-slate-900 border border-white/5">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" /> Top Games by Plays
                    </h3>
                    <div className="space-y-4">
                      {[...games].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 5).map((game, i) => (
                        <div key={game.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/5">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-slate-500 w-6">#{i + 1}</span>
                            <span className="text-sm font-bold text-slate-200 truncate">{game.title}</span>
                          </div>
                          <span className="text-sm font-black text-emerald-400">{(game.playCount || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-slate-900 border border-white/5">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" /> Top Games by Likes
                    </h3>
                    <div className="space-y-4">
                      {[...games].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5).map((game, i) => (
                        <div key={game.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/5">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-slate-500 w-6">#{i + 1}</span>
                            <span className="text-sm font-bold text-slate-200 truncate">{game.title}</span>
                          </div>
                          <span className="text-sm font-black text-rose-500">{(game.likes || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-slate-900 border border-white/5">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" /> Platform Summary
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-black text-white">{stats?.totalGames || 0}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Games</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-black text-white">{stats?.totalPlays?.toLocaleString() || 0}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Plays</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-black text-white">{stats?.totalLikes?.toLocaleString() || 0}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Likes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-black text-white">{stats?.totalComments || 0}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Comments</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
