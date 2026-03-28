const { createClient } = require('@supabase/supabase-js');
const path = require('path');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('FATAL: SUPABASE_URL or SUPABASE_ANON_KEY is not set');
}

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'placeholder'
);

const BUCKET = 'games';

/** Map file extension → MIME type for correct Content-Type in Storage */
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.mjs':  'application/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.webp': 'image/webp',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.wav':  'audio/wav',
    '.mp3':  'audio/mpeg',
    '.ogg':  'audio/ogg',
    '.mp4':  'video/mp4',
    '.webm': 'video/webm',
    '.wasm': 'application/wasm',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
    '.otf':  'font/otf',
  };
  return map[ext] || 'application/octet-stream';
}

/**
 * Upload a buffer to Supabase Storage and return its public URL.
 * @param {string} storagePath  e.g. "files/<uuid>/index.html"
 * @param {Buffer} buffer
 * @param {string} [contentType]
 */
async function uploadFile(storagePath, buffer, contentType) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: contentType || getMimeType(storagePath),
      upsert: true,
    });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Delete all files under a "folder" prefix in the bucket.
 * Used when a bad upload needs cleanup.
 */
async function deleteFolder(prefix) {
  const { data } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 });
  if (data && data.length > 0) {
    const paths = data.map(f => `${prefix}/${f.name}`);
    await supabase.storage.from(BUCKET).remove(paths);
  }
}

module.exports = { uploadFile, deleteFolder, getMimeType };
