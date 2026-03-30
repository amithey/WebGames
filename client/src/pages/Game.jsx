import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Heart, 
  Eye, 
  Star, 
  Share2, 
  MessageSquare, 
  Flag, 
  Maximize2, 
  Minimize2, 
  ChevronLeft,
  Play,
  Clock,
  User,
  MoreVertical,
  CornerDownRight,
  Smile,
  Send,
  Keyboard,
  Info,
  ShieldAlert,
  Zap,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── Components ──────────────────────────────────────────────────────────────

function RatingSystem({ gameId, initialAvg, initialCount }) {
  const [avg, setAvg] = useState(initialAvg || 0);
  const [count, setCount] = useState(initialCount || 0);
  const [userRating, setUserRating] = useState(() => {
    try { return parseInt(localStorage.getItem(`rated_${gameId}`)) || 0; } catch { return 0; }
  });
  const [hoverRating, setHoverRating] = useState(0);

  async function handleRate(val) {
    if (userRating) return;
    try {
      const res = await axios.post(`/api/games/${gameId}/rate`, { rating: val });
      setAvg(res.data.average);
      setCount(res.data.count);
      setUserRating(val);
      localStorage.setItem(`rated_${gameId}`, val.toString());
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#4ade80']
      });
    } catch (_) {}
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 cursor-pointer transition-all ${
                (hoverRating || userRating || Math.round(avg)) >= star 
                  ? 'text-yellow-400 fill-current scale-110' 
                  : 'text-slate-600'
              }`}
              onClick={() => handleRate(star)}
              onMouseEnter={() => !userRating && setHoverRating(star)}
              onMouseLeave={() => !userRating && setHoverRating(0)}
            />
          ))}
        </div>
        <span className="text-xl font-black text-white">{avg > 0 ? avg : '0.0'}</span>
        <span className="text-slate-500 font-bold">({count} reviews)</span>
      </div>
    </div>
  );
}

function Comment({ comment, onReply, onReact, isReply = false }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const reactions = Object.entries(comment.reactions || {});

  return (
    <div className={`group ${isReply ? 'ml-12 mt-4' : 'mb-8'}`}>
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center font-bold text-slate-400 shrink-0 border border-white/5`}>
          {comment.author_name?.[0]?.toUpperCase() || 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-slate-200">{comment.author_name}</span>
            <span className="text-xs text-slate-500 font-medium">{new Date(comment.created_at).toLocaleDateString()}</span>
          </div>
          <p className="text-slate-400 leading-relaxed mb-3">{comment.content}</p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs font-bold text-slate-500 hover:text-sky-400 flex items-center gap-1 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Reply
            </button>
            <div className="flex items-center gap-2">
              {['👍', '❤️', '🔥', '😂'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onReact(comment.id, emoji)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm transition-all hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {reactions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {reactions.map(([emoji, count]) => (
                <div key={emoji} className="px-2 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-xs flex items-center gap-1.5">
                  <span>{emoji}</span>
                  <span className="font-bold text-sky-400">{count}</span>
                </div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {showReplyForm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4">
                <div className="flex gap-3">
                  <input 
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 input-field h-10 py-0"
                  />
                  <button 
                    onClick={() => { onReply(comment.id, replyContent); setReplyContent(''); setShowReplyForm(false); }}
                    className="btn-primary p-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Main Game Page ──────────────────────────────────────────────────────────

export default function Game() {
  const { id } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  const [game, setGame] = useState(null);
  const [gameHtml, setGameHtml] = useState(null);
  const [relatedGames, setRelatedGames] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [commentForm, setCommentForm] = useState({ author_name: '', content: '' });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const fetchGame = useCallback(async () => {
    try {
      const res = await axios.get(`/api/games/${id}`);
      setGame(res.data);
      setLikes(res.data.likes);
      setLiked(localStorage.getItem(`liked_${id}`) === '1');

      // Fetch the actual game HTML content for srcDoc rendering
      if (res.data.fileUrl) {
        try {
          const htmlRes = await fetch(res.data.fileUrl);
          const html = await htmlRes.text();
          setGameHtml(html);
        } catch (e) {
          console.error('Failed to fetch game HTML:', e);
        }
      }

      // Fetch related games
      if (res.data.category) {
        const related = await axios.get(`/api/games?category=${res.data.category}`);
        setRelatedGames(related.data.filter(g => g.id !== id).slice(0, 4));
      }

      // Fetch comments
      const commRes = await axios.get(`/api/games/${id}/comments`);
      setComments(commRes.data);

      setLoading(false);
      axios.patch(`/api/games/${id}/increment`);
    } catch (err) {
      setError('Game not found or server error.');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchGame(); }, [fetchGame]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key.toLowerCase() === 'f') handleFullscreen();
      if (e.key === 'Escape' && fullscreen) handleFullscreen();
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [fullscreen]);

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!fullscreen) {
      containerRef.current.requestFullscreen?.() || containerRef.current.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
    }
  };

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: game?.title || 'Check out this game!',
      text: game?.description || 'Play this awesome game on WebGames.',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Game link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleLike = async () => {
    try {
      const res = await axios.post(`/api/games/${id}/${liked ? 'unlike' : 'like'}`);
      setLikes(res.data.likes);
      setLiked(!liked);
      if (!liked) {
        localStorage.setItem(`liked_${id}`, '1');
        confetti({ particleCount: 50, colors: ['#f43f5e'] });
      } else {
        localStorage.removeItem(`liked_${id}`);
      }
    } catch (_) {}
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentForm.content.trim()) return;
    try {
      const res = await axios.post(`/api/games/${id}/comments`, commentForm);
      setComments(prev => [res.data, ...prev]);
      setCommentForm(p => ({ ...p, content: '' }));
    } catch (_) {}
  };

  const handleReply = async (parentId, content) => {
    try {
      const res = await axios.post(`/api/games/${id}/comments`, {
        author_name: commentForm.author_name || 'Anonymous',
        content,
        parentId
      });
      setComments(prev => [res.data, ...prev]);
    } catch (_) {}
  };

  const handleReact = async (commentId, emoji) => {
    try {
      const res = await axios.post(`/api/games/comments/${commentId}/react`, { emoji });
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, reactions: res.data.reactions } : c));
    } catch (_) {}
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    try {
      await axios.post(`/api/games/${id}/report`, { reason: reportReason });
      setShowReportModal(false);
      setReportReason('');
      alert('Report submitted. Thank you for keeping our community safe.');
    } catch (_) {}
  };

  const structuredComments = useMemo(() => {
    const map = {};
    const roots = [];
    comments.forEach(c => {
      c.replies = [];
      map[c.id] = c;
    });
    comments.forEach(c => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].replies.push(c);
      } else {
        roots.push(c);
      }
    });
    return roots;
  }, [comments]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="aspect-video w-full rounded-3xl skeleton mb-8" />
      <div className="h-12 w-1/3 skeleton mb-4" />
      <div className="h-20 w-full skeleton" />
    </div>
  );

  if (error) return (
    <div className="py-40 text-center">
      <h2 className="text-3xl font-black mb-4">{error}</h2>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Helmet>
        <title>{game.title} | WebGames</title>
        <meta name="description" content={game.description} />
        <meta property="og:title" content={game.title} />
        <meta property="og:description" content={game.description} />
        <meta property="og:image" content={game.thumbnailUrl || game.thumbnail} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Back & Breadcrumbs */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold">
          <ChevronLeft className="w-5 h-5" /> Back to Games
        </Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowReportModal(true)}
            className="text-slate-500 hover:text-rose-500 transition-colors font-bold text-sm flex items-center gap-1"
          >
            <Flag className="w-4 h-4" /> Report
          </button>
        </div>
      </div>

      {/* Game Player Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        <div className="lg:col-span-3">
          <div 
            ref={containerRef}
            className={`relative rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-white/5 ${fullscreen ? 'fixed inset-0 z-[100] rounded-none' : ''}`}
          >
            {gameHtml ? (
              <iframe
                ref={iframeRef}
                srcDoc={gameHtml}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-pointer-lock"
                className="w-full aspect-video border-none"
                title={game.title}
                allowFullScreen
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-slate-800 border-t-sky-500 rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm">Loading game...</p>
                </div>
              </div>
            )}
          </div>

          {/* Game Info Bar */}
          <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black tracking-tight">{game.title}</h1>
                <div className="px-2 py-1 rounded-md bg-sky-500/10 text-sky-400 text-[10px] font-black uppercase tracking-widest border border-sky-500/20">
                  {game.category || 'Arcade'}
                </div>
              </div>
              <div className="flex items-center gap-6 text-slate-500 font-bold text-sm">
                <div className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-sky-400" /> {game.playCount.toLocaleString()}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-400" /> {new Date(game.createdAt).toLocaleDateString()}</div>
                {game.author && (
                  <Link to={`/creator/${game.author}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <User className="w-4 h-4 text-indigo-400" /> by {game.author}
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleLike}
                className={`h-14 px-8 rounded-2xl font-black flex items-center gap-2 transition-all ${liked ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-900 text-slate-400 border border-white/5 hover:border-white/10'}`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                {likes} {liked ? 'Liked' : 'Like'}
              </button>
              <button 
                onClick={handleShare}
                className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 hover:scale-110 transition-all"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="mt-8 p-8 rounded-3xl bg-slate-900 border border-white/5">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-sky-400" /> About Game
            </h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              {game.description || 'No description provided.'}
            </p>
            {game.aiTool && (
              <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-white/5 inline-flex items-center gap-3">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-slate-400">Built with:</span>
                <span className="text-sm font-black text-white px-2 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20">{game.aiTool}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Rating */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-white/5">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" /> Rating
            </h3>
            <RatingSystem gameId={id} initialAvg={game.avgRating} initialCount={game.ratingCount} />
          </div>

          {/* Shortcuts */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-white/5">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-sky-400" /> Shortcuts
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-bold">Fullscreen</span>
                <kbd className="px-2 py-1 rounded-md bg-slate-800 border border-white/10 text-white font-black text-[10px]">F</kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-bold">Exit FS</span>
                <kbd className="px-2 py-1 rounded-md bg-slate-800 border border-white/10 text-white font-black text-[10px]">ESC</kbd>
              </div>
            </div>
          </div>

          {/* Related Games */}
          {relatedGames.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" /> Similar Games
              </h3>
              <div className="space-y-4">
                {relatedGames.map(g => (
                  <Link key={g.id} to={`/games/${g.id}`} className="flex items-center gap-4 group">
                    <div className="w-24 aspect-video rounded-xl overflow-hidden bg-slate-800 shrink-0">
                      <img src={g.thumbnailUrl || g.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-200 group-hover:text-sky-400 transition-colors truncate">{g.title}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{g.playCount.toLocaleString()} plays</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Overhaul */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="p-8 sm:p-12 rounded-[2.5rem] bg-slate-900 border border-white/5">
            <h2 className="text-3xl font-black mb-10 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-sky-400" /> 
              Community Thoughts
              <span className="text-slate-500 ml-2">({comments.length})</span>
            </h2>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="mb-12 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    placeholder="Your Name"
                    value={commentForm.author_name}
                    onChange={(e) => setCommentForm(p => ({ ...p, author_name: e.target.value }))}
                    className="input-field pl-12 h-12"
                  />
                </div>
              </div>
              <div className="relative">
                <textarea 
                  placeholder="Share your thoughts on this AI creation..."
                  value={commentForm.content}
                  onChange={(e) => setCommentForm(p => ({ ...p, content: e.target.value }))}
                  className="input-field min-h-[120px] resize-none py-4"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary px-10">
                  Post Comment <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Comment Threads */}
            <div className="space-y-4">
              {structuredComments.length > 0 ? (
                structuredComments.map(c => (
                  <div key={c.id}>
                    <Comment comment={c} onReply={handleReply} onReact={handleReact} />
                    {c.replies.map(r => (
                      <Comment key={r.id} comment={r} onReply={handleReply} onReact={handleReact} isReply />
                    ))}
                  </div>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-slate-500 font-bold">No comments yet. Start the conversation!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReportModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md p-8 rounded-[2rem] bg-slate-900 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-500" /> Report Content
              </h2>
              <p className="text-slate-400 mb-6 font-medium">Please let us know why you are reporting this game.</p>
              <textarea 
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe the issue..."
                className="input-field min-h-[120px] mb-6"
              />
              <div className="flex gap-4">
                <button onClick={() => setShowReportModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleReport} className="btn-primary flex-1 !bg-rose-500">Submit Report</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
