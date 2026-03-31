import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FileText, ChevronLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Helmet><title>Terms of Service | WebGames</title></Helmet>
      <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold mb-10">
        <ChevronLeft className="w-5 h-5" /> Back to Home
      </Link>
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tight">Terms of Service</h1>
      </div>
      <div className="prose prose-invert max-w-none space-y-8 text-slate-400 leading-relaxed">
        <p className="text-slate-300 text-lg">Last updated: March 31, 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">1. Acceptance of Terms</h2>
          <p>By accessing or using WebGames, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">2. Use of the Platform</h2>
          <p>WebGames is a platform for sharing AI-crafted browser games. You may browse, play, rate, and comment on games as a guest. To upload games or create a profile, you must register an account.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must be at least 13 years old to use WebGames.</li>
            <li>You are responsible for all activity on your account.</li>
            <li>You must not use WebGames for any illegal or unauthorized purpose.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">3. User Content</h2>
          <p>When you upload a game, you represent that you own or have the right to share that content. By uploading, you grant WebGames a non-exclusive, worldwide license to display and distribute your content on the platform.</p>
          <p>You retain ownership of your uploaded games. You may delete them at any time from your profile.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">4. Prohibited Content</h2>
          <p>The following content is strictly prohibited:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Malicious code, malware, or exploits</li>
            <li>Content that is illegal, harmful, or deceptive</li>
            <li>Content that violates the privacy of others</li>
            <li>Spam or automated abuse of the platform</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">5. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms. We may also remove content that violates our policies without prior notice.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">6. Disclaimer</h2>
          <p>WebGames is provided "as is" without warranties of any kind. We are not responsible for the content of games uploaded by users. Play games at your own discretion.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">7. Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of the platform after changes constitutes your acceptance of the new terms.</p>
        </section>

        <div className="pt-8 border-t border-white/5 flex gap-4">
          <Link to="/privacy" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">Privacy Policy</Link>
          <Link to="/content-policy" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">Content Policy</Link>
          <Link to="/contact" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
