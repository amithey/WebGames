import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, CheckCircle, XCircle } from 'lucide-react';

export default function ContentPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Helmet><title>Content Policy | WebGames</title></Helmet>
      <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold mb-10">
        <ChevronLeft className="w-5 h-5" /> Back to Home
      </Link>
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tight">Content Policy</h1>
      </div>
      <div className="space-y-8 text-slate-400 leading-relaxed">
        <p className="text-slate-300 text-lg">WebGames is a platform for sharing AI-crafted browser games. To keep the community safe and welcoming, we have clear guidelines about what content is and isn't allowed.</p>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" /> What's Allowed
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Browser games built with AI tools (Claude, GPT-4, Gemini, etc.)</li>
            <li>Games in HTML, JavaScript, CSS — single file or ZIP archive</li>
            <li>Games of any genre: arcade, puzzle, RPG, strategy, simulation</li>
            <li>Experimental or prototype-quality games</li>
            <li>Games with creative or mature themes (clearly tagged)</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-400" /> What's Not Allowed
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-white">Malicious code:</strong> Any game that attempts to steal data, run exploits, mine cryptocurrency, or harm users' devices</li>
            <li><strong className="text-white">Illegal content:</strong> Content that violates applicable laws</li>
            <li><strong className="text-white">Explicit adult content:</strong> Sexually explicit material</li>
            <li><strong className="text-white">Hate speech:</strong> Content that targets individuals or groups based on race, religion, gender, or sexual orientation</li>
            <li><strong className="text-white">Phishing or deception:</strong> Games designed to trick users into providing credentials or personal info</li>
            <li><strong className="text-white">Spam:</strong> Duplicate uploads, low-effort placeholder content, or automated submissions</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">Reporting Violations</h2>
          <p>If you see content that violates this policy, use the "Report" button on the game page. Our moderation team reviews all reports. Confirmed violations result in content removal and potential account suspension.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">Enforcement</h2>
          <p>We reserve the right to remove any content and suspend any account at our discretion if it violates this policy or the spirit of the WebGames community. If your content is removed in error, <Link to="/contact" className="text-sky-400 hover:text-sky-300 font-bold">contact us</Link>.</p>
        </section>

        <div className="pt-8 border-t border-white/5 flex gap-4">
          <Link to="/terms" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">Privacy Policy</Link>
          <Link to="/contact" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
