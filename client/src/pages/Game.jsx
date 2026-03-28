import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function HeartIcon({ filled }) {
  return filled ? (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function StarIcon({ filled, hover, onClick, onMouseEnter, onMouseLeave, size = "w-5 h-5" }) {
  return (
    <svg
      className={`${size} cursor-pointer transition-all duration-150 ${
        filled || hover ? 'text-yellow-400 scale-110' : 'text-slate-600'
      }`}
      fill="currentColor"
      viewBox="0 0 20 20"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function RatingSystem({ gameId, initialAvg, initialCount }) {
  const [avg, setAvg] = useState(initialAvg || 0);
  const [count, setCount] = useState(initialCount || 0);
  const [userRating, setUserRating] = useState(() => {
    try { return parseInt(localStorage.getItem(`rated_${gameId}`)) || 0; } catch { return 0; }
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleRate(val) {
    if (userRating || submitting) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/games/${gameId}/rate`, { rating: val });
      setAvg(res.data.average);
      setCount(res.data.count);
      setUserRating(val);
      localStorage.setItem(`rated_${gameId}`, val.toString());
    } catch (_) {
      alert('Failed to submit rating');
    }
    setSubmitting(false);
  }

  return (
    <div className="flex flex-col items-center sm:items-start gap-2">
      <div className="flex items-center gap-1.5">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              filled={userRating ? star <= userRating : star <= Math.round(avg)}
              hover={!userRating && star <= hoverRating}
              onClick={() => handleRate(star)}
              onMouseEnter={() => !userRating && setHoverRating(star)}
              onMouseLeave={() => !userRating && setHoverRating(0)}
              size={userRating ? "w-4 h-4" : "w-5 h-5"}
            />
          ))}
        </div>
        <span className="text-white font-bold ml-1">{avg > 0 ? avg : 'No ratings'}</span>
        {count > 0 && <span className="text-slate-500 text-xs">({count})</span>}
      </div>
      {!userRating ? (
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Rate this game</p>
      ) : (
        <p className="text-[10px] text-green-500 uppercase tracking-wider font-semibold flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          Thanks for rating!
        </p>
      )}
    </div>
  );
}

// ─── Share Buttons ──────────────────────────────────────────────────────────

function ShareButtons({ title }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Playing "${title}" on WebGames!`)}&url=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Check out "${title}" on WebGames: ${url}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  const btnBase = 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:scale-105 active:scale-95';

  return (
    <div className="bg-[#13132a] border border-[#1e1e3f] rounded-xl p-5 mb-6">
      <h2 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share this game
      </h2>
      <div className="flex flex-wrap gap-2">
        {/* Twitter/X */}
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} bg-black/40 border-[#333] text-slate-300 hover:border-slate-400`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Twitter/X
        </a>

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} bg-green-600/20 border-green-600/40 text-green-400 hover:bg-green-600/30`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>

        {/* Facebook */}
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} bg-blue-600/20 border-blue-600/40 text-blue-400 hover:bg-blue-600/30`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className={`${btnBase} relative ${
            copied
              ? 'bg-purple-600/40 border-purple-500/60 text-purple-300'
              : 'bg-[#1e1e3f] border-[#2a2a4f] text-slate-300 hover:border-purple-500/50'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Comments Section ────────────────────────────────────────────────────────

function CommentsSection({ gameId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ author_name: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState('');

  useEffect(() => {
    axios.get(`/api/games/${gameId}/comments`)
      .then(res => { setComments(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [gameId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSubmitting(true);
    setPostError('');
    try {
      const res = await axios.post(`/api/games/${gameId}/comments`, {
        author_name: form.author_name.trim() || 'Anonymous',
        content: form.content.trim(),
      });
      setComments(prev => [res.data, ...prev]);
      setForm(prev => ({ ...prev, content: '' }));
    } catch (err) {
      setPostError(err.response?.data?.error || 'Failed to post comment.');
    }
    setSubmitting(false);
  }

  const formattedDate = (str) =>
    new Date(str).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="bg-[#13132a] border border-[#1e1e3f] rounded-xl p-6 mb-6">
      <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comments ({comments.length})
      </h2>

      {/* Post form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={form.author_name}
          onChange={e => setForm(p => ({ ...p, author_name: e.target.value }))}
          className="input-field"
          maxLength={80}
        />
        <textarea
          placeholder="Write a comment..."
          value={form.content}
          onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
          rows={3}
          className="input-field resize-none"
          maxLength={1000}
          required
        />
        {postError && (
          <p className="text-red-400 text-sm">{postError}</p>
        )}
        <button
          type="submit"
          disabled={submitting || !form.content.trim()}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Posting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Post Comment
            </>
          )}
        </button>
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[0,1,2].map(i => (
            <div key={i} className="animate-pulse space-y-2 py-3 border-t border-[#1e1e3f]">
              <div className="h-3 bg-[#1e1e3f] rounded w-32" />
              <div className="h-4 bg-[#1e1e3f] rounded w-full" />
              <div className="h-4 bg-[#1e1e3f] rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-[#1e1e3f]">
          {comments.map(comment => (
            <div key={comment.id} className="py-4 first:pt-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {comment.author_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-300 font-medium text-sm">{comment.author_name}</span>
                <span className="text-slate-600 text-xs">{formattedDate(comment.created_at)}</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-9">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Game Page ──────────────────────────────────────────────────────────

export default function Game() {
  const { id } = useParams();
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadGame() {
      try {
        const res = await axios.get(`/api/games/${id}`);
        if (!cancelled) {
          setGame(res.data);
          setLikes(res.data.likes ?? 0);
          setLiked(localStorage.getItem(`liked_${id}`) === '1');
          setLoading(false);
        }
        axios.patch(`/api/games/${id}/increment`).catch(() => {});
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.status === 404 ? 'Game not found.' : 'Failed to load game. Is the server running?');
          setLoading(false);
        }
      }
    }

    loadGame();
    return () => { cancelled = true; };
  }, [id]);

  async function handleLike() {
    if (liked || liking) return;
    setLiking(true);
    try {
      const res = await axios.post(`/api/games/${id}/like`);
      setLikes(res.data.likes);
      setLiked(true);
      localStorage.setItem(`liked_${id}`, '1');
    } catch (_) {}
    setLiking(false);
  }

  function handleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (!fullscreen) {
      (el.requestFullscreen?.() || el.webkitRequestFullscreen?.())
    } else {
      (document.exitFullscreen?.() || document.webkitExitFullscreen?.())
    }
  }

  useEffect(() => {
    function onFsChange() {
      setFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  const formattedDate = game
    ? new Date(game.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-pulse space-y-6">
        <div className="h-4 bg-[#1e1e3f] rounded w-32" />
        <div className="h-8 bg-[#1e1e3f] rounded w-64" />
        <div className="w-full aspect-video bg-[#13132a] rounded-xl" />
        <div className="space-y-2">
          <div className="h-4 bg-[#1e1e3f] rounded w-full" />
          <div className="h-4 bg-[#1e1e3f] rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all games
        </Link>
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-400 text-xl font-semibold mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => window.location.reload()} className="btn-secondary">Retry</button>
            <Link to="/" className="btn-primary">Back to Games</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 page-transition">
      {/* Back link */}
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to all games
      </Link>

      {/* Game header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
              {game.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mt-4">
              <RatingSystem gameId={id} initialAvg={game.avgRating} initialCount={game.ratingCount} />
              
              <div className="h-8 w-px bg-[#1e1e3f] hidden sm:block" />

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                {game.author && (
                  <Link
                    to={`/creator/${encodeURIComponent(game.author)}`}
                    className="flex items-center gap-1.5 hover:text-purple-400 transition-colors"
                  >
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-slate-300 hover:text-purple-300 transition-colors">{game.author}</span>
                  </Link>
                )}
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>{game.playCount.toLocaleString()} plays</span>
                </span>
                <button
                  onClick={handleLike}
                  disabled={liked || liking}
                  className={`flex items-center gap-1.5 transition-colors ${
                    liked ? 'text-pink-400 cursor-default' : 'text-slate-400 hover:text-pink-400'
                  }`}
                  title={liked ? 'Liked!' : 'Like this game'}
                >
                  <HeartIcon filled={liked} />
                  <span>{likes.toLocaleString()} {liked ? 'Liked' : 'Like'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {game.tags && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {game.tags.map(tag => (
              <span key={tag} className="tag-badge">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen button above iframe */}
      <div className="flex items-center justify-end mb-2">
        <button
          onClick={handleFullscreen}
          className="flex items-center gap-2 px-4 py-2 bg-[#13132a] border border-[#1e1e3f] text-slate-300 hover:text-white hover:border-purple-500/50 rounded-lg text-sm font-medium transition-all"
        >
          {fullscreen ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
              Exit Fullscreen
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              ⛶ Fullscreen
            </>
          )}
        </button>
      </div>

      {/* Game iframe container — this element goes fullscreen */}
      <div
        ref={containerRef}
        className="relative bg-[#07070f] border border-[#1e1e3f] rounded-xl overflow-hidden shadow-2xl shadow-black/50 mb-8"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#13132a] border-b border-[#1e1e3f]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs text-slate-500 font-medium truncate max-w-xs">{game.title}</span>
          {/* Exit fullscreen button inside container (visible when fullscreen) */}
          {fullscreen && (
            <button
              onClick={handleFullscreen}
              title="Exit Fullscreen"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 15v4.5M9 15H4.5M15 9h4.5M15 9V4.5M15 15h4.5M15 15v4.5" />
              </svg>
              Exit
            </button>
          )}
        </div>

        {/* Loading overlay */}
        {iframeLoading && (
          <div className="absolute inset-0 top-[41px] flex items-center justify-center bg-[#07070f] z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#1e1e3f] border-t-purple-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Loading game...</p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={`/api/games/${id}/play`}
          title={game.title}
          className="w-full"
          style={{
            minHeight: fullscreen ? '100vh' : '600px',
            height: fullscreen ? '100vh' : '65vh',
            display: 'block',
            border: 'none',
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-pointer-lock allow-popups"
          allowFullScreen
          onLoad={() => setIframeLoading(false)}
        />
      </div>

      {/* Description */}
      {game.description && (
        <div className="bg-[#13132a] border border-[#1e1e3f] rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About this game
          </h2>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line">{game.description}</p>
        </div>
      )}

      {/* Game stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#13132a] border border-[#1e1e3f] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{game.playCount.toLocaleString()}</p>
          <p className="text-slate-500 text-sm mt-1">Total Plays</p>
        </div>
        <div className="bg-[#13132a] border border-[#1e1e3f] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-pink-400">{likes.toLocaleString()}</p>
          <p className="text-slate-500 text-sm mt-1">Likes</p>
        </div>
        <div className="bg-[#13132a] border border-[#1e1e3f] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white uppercase">{game.fileType || 'html'}</p>
          <p className="text-slate-500 text-sm mt-1">File Type</p>
        </div>
        <div className="bg-[#13132a] border border-[#1e1e3f] rounded-xl p-4 text-center">
          {game.author ? (
            <Link
              to={`/creator/${encodeURIComponent(game.author)}`}
              className="text-lg font-bold text-purple-400 hover:text-purple-300 transition-colors truncate block"
            >
              {game.author}
            </Link>
          ) : (
            <p className="text-lg font-bold text-white truncate">Anonymous</p>
          )}
          <p className="text-slate-500 text-sm mt-1">Author</p>
        </div>
      </div>

      {/* Social sharing */}
      <ShareButtons title={game.title} />

      {/* Comments */}
      <CommentsSection gameId={id} />

      {/* Back CTA */}
      <div className="flex items-center justify-between">
        <Link to="/" className="btn-secondary inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all games
        </Link>
        <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Your Game
        </Link>
      </div>
    </div>
  );
}
