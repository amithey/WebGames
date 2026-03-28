import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function FileDropZone({ accept, label, hint, icon, onChange, file, required }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onChange(dropped);
  }

  function handleDrag(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
        ${dragging
          ? 'border-purple-400 bg-purple-500/10'
          : file
          ? 'border-green-500/50 bg-green-500/5'
          : 'border-[#1e1e3f] hover:border-purple-500/50 hover:bg-purple-500/5'
        }`}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDrag}
      onDragLeave={handleDragLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files[0] || null)}
        required={required}
      />

      {file ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-400 font-medium text-sm">{file.name}</p>
          <p className="text-slate-500 text-xs">{(file.size / 1024).toFixed(1)} KB &mdash; click to change</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-[#1e1e3f] rounded-full flex items-center justify-center">
            {icon}
          </div>
          <div>
            <p className="text-slate-300 font-medium">{label}</p>
            <p className="text-slate-500 text-sm mt-1">{hint}</p>
          </div>
          <p className="text-purple-400 text-sm font-medium">Click or drag &amp; drop</p>
        </div>
      )}
    </div>
  );
}

export default function Upload() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    author: '',
    tags: '',
  });
  const [gameFile, setGameFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function handleThumbnailChange(file) {
    setThumbnail(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(null);
    }
  }

  function validate() {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!gameFile) newErrors.gameFile = 'A game file (.html or .zip) is required';
    else {
      const ext = gameFile.name.split('.').pop().toLowerCase();
      if (ext !== 'html' && ext !== 'zip') {
        newErrors.gameFile = 'Only .html and .zip files are allowed';
      }
    }
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('title', form.title.trim());
    data.append('description', form.description.trim());
    data.append('author', form.author.trim());
    data.append('tags', form.tags.trim());
    data.append('gameFile', gameFile);
    if (thumbnail) data.append('thumbnail', thumbnail);

    try {
      const res = await axios.post('/api/games', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/games/${res.data.id}`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed. Please try again.';
      setServerError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 page-transition">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to games
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Upload a Game</h1>
        <p className="text-slate-400">
          Share your HTML or ZIP game with the WebGames community. No account needed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Server error */}
        {serverError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-400 text-sm">{serverError}</p>
          </div>
        )}

        {/* Game Info */}
        <div className="bg-[#13132a] border border-[#1e1e3f] rounded-xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Game Info
          </h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Snake Game, Tetris Clone..."
              className={`input-field ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              maxLength={100}
            />
            {errors.title && (
              <p className="mt-1.5 text-red-400 text-xs flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your game, controls, objective..."
              rows={3}
              className="input-field resize-none"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-slate-600 text-right">{form.description.length}/500</p>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Author Name
            </label>
            <input
              type="text"
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder="Your name or handle (optional)"
              className="input-field"
              maxLength={80}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="puzzle, action, arcade, multiplayer..."
              className="input-field"
            />
            <p className="mt-1.5 text-xs text-slate-500">Separate tags with commas</p>

            {/* Suggested tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-xs text-slate-500 self-center">Suggested:</span>
              {['Action', 'Puzzle', 'Platformer', 'Arcade', 'RPG', 'Strategy', 'Casual', 'Horror', 'Other'].map((tag) => {
                const current = form.tags.split(',').map(t => t.trim()).filter(Boolean);
                const active = current.map(t => t.toLowerCase()).includes(tag.toLowerCase());
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (active) {
                        const updated = current.filter(t => t.toLowerCase() !== tag.toLowerCase());
                        setForm(p => ({ ...p, tags: updated.join(', ') }));
                      } else {
                        const updated = [...current, tag];
                        setForm(p => ({ ...p, tags: updated.join(', ') }));
                      }
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      active
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-transparent border-[#1e1e3f] text-slate-400 hover:border-purple-500/50 hover:text-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {form.tags && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {form.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                  <span key={tag} className="tag-badge">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-[#13132a] border border-[#1e1e3f] rounded-xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Files
          </h2>

          {/* Game File */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Game File <span className="text-red-400">*</span>
            </label>
            <FileDropZone
              accept=".html,.zip"
              label="Drop your game file here"
              hint=".html or .zip (max 100MB) — ZIP must contain index.html"
              icon={
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              file={gameFile}
              onChange={(f) => {
                setGameFile(f);
                if (errors.gameFile) setErrors((p) => ({ ...p, gameFile: '' }));
              }}
              required
            />
            {errors.gameFile && (
              <p className="mt-1.5 text-red-400 text-xs flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.gameFile}
              </p>
            )}
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Thumbnail <span className="text-slate-500 font-normal">(optional)</span>
            </label>

            {thumbnailPreview ? (
              <div className="relative">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full max-h-48 object-cover rounded-xl border border-[#1e1e3f]"
                />
                <button
                  type="button"
                  onClick={() => { setThumbnail(null); setThumbnailPreview(null); }}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="mt-2 text-xs text-slate-500 text-center">{thumbnail?.name} &mdash; click X to remove</p>
              </div>
            ) : (
              <FileDropZone
                accept="image/*"
                label="Drop a thumbnail image"
                hint="PNG, JPG, GIF, WebP — shown on game cards"
                icon={
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                file={null}
                onChange={handleThumbnailChange}
              />
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-4 text-base font-semibold flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-purple-600"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Publish Game
            </>
          )}
        </button>
      </form>
    </div>
  );
}
