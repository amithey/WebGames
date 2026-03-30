import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabase';
import axios from 'axios';
import { User, Gamepad2, Heart, Eye, LogOut, Shield, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);

      try {
        // We assume the API has a way to filter by user or we fetch all and filter
        // For now, we'll try to fetch games that match the user's ID or email
        const res = await axios.get('/api/games');
        // If the backend doesn't support user_id yet, this might be empty or wrong
        // but it's the structure we want.
        setGames(res.data.filter(g => g.user_id === user.id || g.author === user.email.split('@')[0]));
      } catch (err) {
        console.error('Error fetching user games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-800 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Profile Header */}
      <div className="p-10 rounded-[3rem] bg-slate-900 border border-white/5 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-sky-500/20">
            <User className="w-12 h-12" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tight mb-2">{user.email.split('@')[0]}</h1>
            <p className="text-slate-400 font-medium mb-4">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="px-4 py-2 rounded-xl bg-slate-800 border border-white/5 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-bold text-slate-300">{games.length} Games</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-800 border border-white/5 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-bold text-slate-300">
                  {games.reduce((acc, g) => acc + (g.likes || 0), 0)} Likes
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="btn-secondary h-14 px-8 flex items-center gap-3 !bg-rose-500/10 !text-rose-500 !border-rose-500/20 hover:!bg-rose-500 hover:!text-white transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-bold">Logout</span>
        </button>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-sky-400" /> Your Creations
        </h2>

        {games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {games.map(game => (
              <Link key={game.id} to={`/games/${game.id}`} className="group">
                <div className="card h-full flex flex-col">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 mb-4">
                    <img 
                      src={game.thumbnailUrl || game.thumbnail} 
                      alt={game.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5">
                      <Eye className="w-3 h-3 text-sky-400" />
                      {game.playCount.toLocaleString()}
                    </div>
                  </div>
                  <h3 className="font-black text-lg mb-2 group-hover:text-sky-400 transition-colors">{game.title}</h3>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <span className="text-xs font-bold text-slate-500">{new Date(game.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1 text-xs text-rose-500 font-bold">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      {game.likes}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-slate-900/50">
            <Gamepad2 className="w-16 h-16 text-slate-700 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-400 mb-4">You haven't uploaded any games yet!</h3>
            <Link to="/upload" className="btn-primary inline-flex px-10">Start Creating <ChevronRight className="w-5 h-5" /></Link>
          </div>
        )}
      </div>
    </div>
  );
}