import React, { useState, useEffect, useContext, createContext } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
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
  LayoutDashboard
} from 'lucide-react';
import Home from './pages/Home.jsx';
import Upload from './pages/Upload.jsx';
import Game from './pages/Game.jsx';
import Creator from './pages/Creator.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Admin from './pages/Admin.jsx';
import About from './pages/About.jsx';
import Stats from './pages/Stats.jsx';

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

// ─── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme }      = useTheme();
  const location                    = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Browse', icon: Gamepad2 },
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
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter animated-gradient-text leading-none">WebGames</span>
            <span className="text-[10px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded mt-0.5 self-start animate-pulse">LIVE VERSION 2.0</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink 
              key={to} 
              to={to} 
              end={to === '/'}
              className={({ isActive }) => `
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                ${isActive ? 'bg-sky-500/10 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <button 
              onClick={() => alert('Notifications coming soon!')}
              className="btn-ghost relative hover:scale-110 hover:bg-white/10 transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full border-2 border-slate-900" />
            </button>
            <button 
              onClick={() => alert('User profiles coming soon!')}
              className="btn-ghost hover:scale-110 hover:bg-white/10 transition-all"
            >
              <User className="w-5 h-5" />
            </button>
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
              <hr className="my-2 border-white/5" />
              <Link to="/upload" className="btn-primary w-full py-3">
                <UploadIcon className="w-5 h-5" />
                <span>Upload a Game</span>
              </Link>
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
  return (
    <div className="min-h-screen gradient-mesh selection:bg-sky-500/30">
      <Navbar />
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
