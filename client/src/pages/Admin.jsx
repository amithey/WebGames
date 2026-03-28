import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function Admin() {
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAdminData = useCallback(async (pw) => {
    setLoading(true);
    setError('');
    const headers = { 'x-admin-password': pw };
    try {
      const [statsRes, gamesRes] = await Promise.all([
        axios.get('/api/admin/stats', { headers }),
        axios.get('/api/admin/games', { headers })
      ]);
      setStats(statsRes.data);
      setGames(gamesRes.data);
      setIsAuthorized(true);
      localStorage.setItem('admin_pw', pw);
    } catch (err) {
      console.error(err);
      setError(err.response?.status === 401 ? 'Invalid Admin Password' : 'Failed to fetch admin data');
      setIsAuthorized(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (password) {
      fetchAdminData(password);
    }
  }, [fetchAdminData, password]);

  const handleLogin = (e) => {
    e.preventDefault();
    fetchAdminData(password);
  };

  const toggleFeatured = async (id) => {
    try {
      const headers = { 'x-admin-password': password };
      const res = await axios.patch(`/api/admin/games/${id}/feature`, {}, { headers });
      setGames(prev => prev.map(g => g.id === id ? { ...g, featured: res.data.featured } : g));
    } catch (err) {
      alert('Failed to toggle featured status');
    }
  };

  const deleteGame = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      const headers = { 'x-admin-password': password };
      await axios.delete(`/api/admin/games/${id}`, { headers });
      setGames(prev => prev.filter(g => g.id !== id));
      // Refresh stats
      const statsRes = await axios.get('/api/admin/stats', { headers });
      setStats(statsRes.data);
    } catch (err) {
      alert('Failed to delete game');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-[#13132a] border border-[#1e1e3f] rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Dashboard</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Admin Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? 'Authenticating...' : 'Unlock Dashboard'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-transition">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage games and view platform statistics.</p>
        </div>
        <button 
          onClick={() => { localStorage.removeItem('admin_pw'); setIsAuthorized(false); setPassword(''); }}
          className="btn-secondary text-xs px-4 py-2"
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#13132a] border border-[#1e1e3f] p-6 rounded-2xl">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Games</p>
            <p className="text-3xl font-bold text-white">{stats.totalGames.toLocaleString()}</p>
          </div>
          <div className="bg-[#13132a] border border-[#1e1e3f] p-6 rounded-2xl">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Likes</p>
            <p className="text-3xl font-bold text-pink-500">{stats.totalLikes.toLocaleString()}</p>
          </div>
          <div className="bg-[#13132a] border border-[#1e1e3f] p-6 rounded-2xl">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Plays</p>
            <p className="text-3xl font-bold text-purple-500">{stats.totalPlays.toLocaleString()}</p>
          </div>
          <div className="bg-[#13132a] border border-[#1e1e3f] p-6 rounded-2xl">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Comments</p>
            <p className="text-3xl font-bold text-cyan-500">{stats.totalComments.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Games Table */}
      <div className="bg-[#13132a] border border-[#1e1e3f] rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-[#1e1e3f] flex justify-between items-center bg-[#1a1a35]">
          <h2 className="text-lg font-bold text-white">All Games ({games.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0d0d1a] text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Game</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Stats</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e3f]">
              {games.map(game => (
                <tr key={game.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-white">{game.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{game.id}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {game.author}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-[11px]">
                      <span className="text-pink-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                        {game.likes.toLocaleString()}
                      </span>
                      <span className="text-purple-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        {game.playCount.toLocaleString()}
                      </span>
                      <span className="text-cyan-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                        {game.commentCount.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-yellow-500 font-bold">{game.avgRating || '—'}</div>
                    <div className="text-[10px] text-slate-500">{game.ratingCount} ratings</div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleFeatured(game.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${game.featured ? 'bg-yellow-500' : 'bg-[#1e1e3f]'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${game.featured ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteGame(game.id, game.title)}
                      className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                      title="Delete Game"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {games.length === 0 && !loading && (
          <div className="p-20 text-center text-slate-500">No games found.</div>
        )}
      </div>
    </div>
  );
}
