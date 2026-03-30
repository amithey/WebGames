import React, { useState, useEffect, useContext, createContext } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './supabase';
import {
  Bell,
  User,
  Menu,
  X,
  Moon,
  Sun,
  Upload as UploadIcon,
  Globe,
  ExternalLink,
  MessageSquare,
  Gamepad2,
  Info,
  Trophy,
  LayoutDashboard,
  LogIn,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Github,
  LogOut
} from 'lucide-react';
import Home from './pages/Home.jsx';
import Upload from './pages/Upload.jsx';
import Game from './pages/Game.jsx';
import Creator from './pages/Creator.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Admin from './pages/Admin.jsx';
import About from './pages/About.jsx';
import Stats from './pages/Stats.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';

// ─── Theme Context ─────────────────────────────────────────────────────────────
const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('wg_theme') || 'dark'; } catch { return 'dark'; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('wg_theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
        onClose();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }} 
        className="relative w-full max-w-md p-8 rounded-[2.5rem] bg-slate-900 border border-white/10 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/20 text-white">
            <Gamepad2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2">
            {isSignUp ? 'Join the community' : 'Welcome back'}
          </h2>
          <p className="text-slate-400 font-medium text-sm">
            {isSignUp ? 'Start sharing your AI games today' : 'Log in to manage your creations'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-12 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-12 h-12"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full h-12 text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-400 text-xs font-medium mb-3">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sky-400 text-sm font-black hover:text-sky-300 transition-colors"
          >
            {isSignUp ? 'Log in instead' : 'Create an account'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ onOpenAuth }) {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser]             = useState(null);
  const [isAdmin, setIsAdmin]       = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, toggleTheme }      = useTheme();
  const location                    = useLocation();

  useEffect(() => { setMobileOpen(false); setShowNotifications(false); }, [location.pathname]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      setUser(u);
      
      if (u) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', u.id)
          .single();
        setIsAdmin(profile?.is_admin || false);
      } else {
        setIsAdmin(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', u.id)
          .single();
        setIsAdmin(profile?.is_admin || false);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Browse', icon: Gamepad2, onClick: () => {
      if (location.pathname === '/') {
        document.getElementById('browse-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    }},
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/about', label: 'About', icon: Info },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-10 h-10 bg-gradient-to-br from-rose-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20"
          >
            <Gamepad2 className="w-6 h-6 text-white" />
          </motion.div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter animated-gradient-text leading-none">WebGames</span>
            <span className="text-[10px] font-bold text-slate-500/50 mt-1 uppercase tracking-widest">v2.1</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map(({ to, label, icon: Icon, onClick }) => (
            <NavLink 
              key={to} 
              to={to} 
              end={to === '/'}
              onClick={onClick}
              className={({ isActive }) => `
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                ${isActive ? 'bg-sky-500/10 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink 
              to="/admin"
              className={({ isActive }) => `
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5'}
              `}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Panel
            </NavLink>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 mr-2 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-ghost relative hover:scale-110 hover:bg-white/10 transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full border-2 border-slate-900" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-4 w-80 p-4 rounded-[2rem] bg-slate-900 border border-white/10 shadow-2xl z-[100]"
                >
                  <h3 className="font-black text-lg mb-4 px-2">Notifications</h3>
                  <div className="space-y-2">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-sm font-bold text-white mb-1">Welcome to WebGames! 👋</p>
                      <p className="text-xs text-slate-400">Discover and share amazing AI-crafted games.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {user ? (
              <Link 
                to="/profile"
                className="btn-ghost hover:scale-110 hover:bg-white/10 transition-all text-sky-400"
              >
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="btn-ghost hover:scale-110 hover:bg-white/10 transition-all"
              >
                <User className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="btn-ghost hover:scale-110 hover:bg-white/10 transition-all"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <Link to="/upload" className="btn-primary py-2 px-5 text-sm hidden sm:flex hover:scale-105 active:scale-95 transition-all">
            <UploadIcon className="w-4 h-4" />
            <span>Upload</span>
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden btn-ghost hover:bg-white/10 transition-all"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 p-4 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink 
                  key={to} 
                  to={to}
                  className="flex items-center gap-3 p-3 rounded-xl text-slate-300 hover:bg-white/5"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-bold">{label}</span>
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink 
                  to="/admin"
                  className="flex items-center gap-3 p-3 rounded-xl text-emerald-400 hover:bg-emerald-500/5"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-bold">Admin Panel</span>
                </NavLink>
              )}
              <hr className="my-2 border-white/5" />
              <Link to="/upload" className="btn-primary w-full py-3">
                <UploadIcon className="w-5 h-5" />
                <span>Upload a Game</span>
              </Link>
              {!user && (
                <button 
                  onClick={onOpenAuth}
                  className="flex items-center gap-3 p-3 rounded-xl text-sky-400 hover:bg-sky-500/5"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="font-bold">Sign In</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="mt-32 border-t border-white/5 bg-slate-950/50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter animated-gradient-text">WebGames</span>
            </Link>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
              The premier destination for AI-crafted browser games. Built for creators, enjoyed by everyone.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/amithey/WebGames" target="_blank" rel="noopener noreferrer" className="btn-ghost p-2.5 bg-white/5 hover:text-sky-400 hover:scale-110 transition-all"><Globe className="w-5 h-5" /></a>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Twitter coming soon!'); }} className="btn-ghost p-2.5 bg-white/5 hover:text-sky-400 hover:scale-110 transition-all"><ExternalLink className="w-5 h-5" /></a>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Discord coming soon!'); }} className="btn-ghost p-2.5 bg-white/5 hover:text-sky-400 hover:scale-110 transition-all"><MessageSquare className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-slate-400 hover:text-sky-400 transition-colors">Browse Games</Link></li>
              <li><Link to="/leaderboard" className="text-slate-400 hover:text-sky-400 transition-colors">Leaderboard</Link></li>
              <li><Link to="/stats" className="text-slate-400 hover:text-sky-400 transition-colors">Platform Stats</Link></li>
              <li><Link to="/about" className="text-slate-400 hover:text-sky-400 transition-colors">Our Story</Link></li>
              <li><Link to="/admin" className="text-slate-400 hover:text-sky-400 transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li onClick={() => alert('Terms of Service coming soon!')} className="text-slate-400 hover:text-sky-400 transition-colors cursor-pointer hover:translate-x-1 transition-all">Terms of Service</li>
              <li onClick={() => alert('Privacy Policy coming soon!')} className="text-slate-400 hover:text-sky-400 transition-colors cursor-pointer hover:translate-x-1 transition-all">Privacy Policy</li>
              <li onClick={() => alert('Content Policy coming soon!')} className="text-slate-400 hover:text-sky-400 transition-colors cursor-pointer hover:translate-x-1 transition-all">Content Policy</li>
              <li onClick={() => alert('Contact Us coming soon!')} className="text-slate-400 hover:text-sky-400 transition-colors cursor-pointer hover:translate-x-1 transition-all">Contact Us</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} WebGames. Built with AI for AI creators.
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>Powered by</span>
            <span className="font-bold text-slate-300">Supabase</span>
            <span>&</span>
            <span className="font-bold text-slate-300">Vercel</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function AppInner() {
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen gradient-mesh selection:bg-sky-500/30">
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '1rem',
          fontWeight: 'bold',
        }
      }} />
      <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />
      
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        )}
      </AnimatePresence>

      <main className="pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Routes location={location}>
              <Route path="/"            element={<Home />}        />
              <Route path="/upload"      element={<Upload />}      />
              <Route path="/games/:id"   element={<Game />}        />
              <Route path="/creator/:name" element={<Creator />}   />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin"       element={<Admin />}       />
              <Route path="/about"       element={<About />}       />
              <Route path="/stats"       element={<Stats />}       />
              <Route path="/login"       element={<Login />}       />
              <Route path="/profile"     element={<Profile />}     />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  );
}
