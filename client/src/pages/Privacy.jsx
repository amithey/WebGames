import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Lock, ChevronLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Helmet><title>Privacy Policy | WebGames</title></Helmet>
      <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold mb-10">
        <ChevronLeft className="w-5 h-5" /> Back to Home
      </Link>
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
      </div>
      <div className="space-y-8 text-slate-400 leading-relaxed">
        <p className="text-slate-300 text-lg">Last updated: March 31, 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">1. Information We Collect</h2>
          <p>When you create an account, we collect your email address, username, and password (stored as a secure hash). When you upload games, we store the game files, thumbnails, and associated metadata.</p>
          <p>We also collect usage data such as play counts and likes to improve the platform experience.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and improve the WebGames platform</li>
            <li>To display your profile and uploaded games to other users</li>
            <li>To send you notifications about your games (likes, comments)</li>
            <li>To enforce our Terms of Service and Content Policy</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">3. Data Storage</h2>
          <p>Your data is stored securely using Supabase (PostgreSQL database and file storage). Game files and thumbnails are stored in Supabase Storage. Authentication data is managed by Supabase Auth.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">4. Data Sharing</h2>
          <p>We do not sell your personal data to third parties. Your username and uploaded games are publicly visible on the platform. Your email address is never displayed publicly.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">5. Cookies & Local Storage</h2>
          <p>We use browser localStorage to remember your theme preference and game interactions (likes, ratings). We use httpOnly cookies for authentication sessions.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">6. Your Rights</h2>
          <p>You may delete your account and all associated data at any time. You can edit or delete your uploaded games from your profile page. To request full data deletion, contact us below.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">7. Contact</h2>
          <p>If you have any questions about this Privacy Policy, please <Link to="/contact" className="text-sky-400 hover:text-sky-300 font-bold">contact us</Link>.</p>
        </section>

        <div className="pt-8 border-t border-white/5 flex gap-4">
          <Link to="/terms" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">Terms of Service</Link>
          <Link to="/content-policy" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">Content Policy</Link>
          <Link to="/contact" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
