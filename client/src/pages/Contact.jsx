import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Mail, ChevronLeft, Send, CheckCircle, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real deployment this would send to an API endpoint or email service.
    // For now we just show a success state.
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Helmet><title>Contact Us | WebGames</title></Helmet>
      <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold mb-10">
        <ChevronLeft className="w-5 h-5" /> Back to Home
      </Link>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-orange-500 rounded-xl flex items-center justify-center">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight">Contact Us</h1>
          <p className="text-slate-400 mt-1">We'd love to hear from you.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 rounded-[2rem] bg-slate-900 border border-white/5 text-center"
          >
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-black mb-3">Message Sent!</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Thanks for reaching out. We'll get back to you as soon as possible.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                className="btn-secondary"
              >
                Send Another
              </button>
              <Link to="/" className="btn-primary">Back to Games</Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 rounded-[2rem] bg-slate-900 border border-white/5"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="John Doe"
                      className="input-field pl-12 h-12"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="input-field pl-12 h-12"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="What's this about?"
                  className="input-field h-12"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Message</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Tell us what's on your mind..."
                    className="input-field pl-12 min-h-[140px] resize-none py-4"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full h-12">
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
