const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// --- Sanitize and Log ---
const rawUrl = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
const rawKey = (process.env.SUPABASE_ANON_KEY || '').trim();

// Validate URL format before passing to createClient
let supabaseUrl = rawUrl;
let supabaseKey = rawKey;
let initError = null;

if (!supabaseUrl || !supabaseKey) {
  initError = 'SUPABASE_URL or SUPABASE_ANON_KEY is not set or empty';
  console.error(`FATAL: ${initError}`);
  console.error(`  SUPABASE_URL length: ${rawUrl.length}`);
  console.error(`  SUPABASE_ANON_KEY length: ${rawKey.length}`);
} else {
  // Verify it's a valid URL
  try {
    new URL(supabaseUrl);
  } catch (e) {
    initError = `SUPABASE_URL is not a valid URL: "${supabaseUrl.substring(0, 30)}..."`;
    console.error(`FATAL: ${initError}`);
  }
  // Mask the URL for safety
  const maskedUrl = supabaseUrl.replace(/^(https?:\/\/)[^.]+/, '$1***');
  console.log(`[Supabase] Initializing with URL: ${maskedUrl} (length: ${supabaseUrl.length})`);
  console.log(`[Supabase] Key length: ${supabaseKey.length}, starts with: ${supabaseKey.substring(0, 10)}...`);
}

// Use placeholder values if real ones are missing — operations will fail gracefully
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
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
 */
async function uploadFile(storagePath, buffer, contentType) {
  if (initError) throw new Error(`Storage not configured: ${initError}`);

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
 */
async function deleteFolder(prefix) {
  if (initError) return;
  const { data } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 });
  if (data && data.length > 0) {
    const paths = data.map(f => `${prefix}/${f.name}`);
    await supabase.storage.from(BUCKET).remove(paths);
  }
}

/** Returns null if storage is healthy, or an error string */
function getStorageStatus() {
  return initError;
}

module.exports = { supabase, uploadFile, deleteFolder, getMimeType, getStorageStatus };
