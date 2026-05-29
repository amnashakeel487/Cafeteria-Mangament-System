const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];

/** True when URL points to video (not suitable for img tags). */
export function isVideoMediaUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('blob-video:')) return true;
  const path = url.toLowerCase().split('?')[0];
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext) || path.includes(ext));
}

/** Menu/card thumbnails: only render images for non-video URLs. */
export function isDisplayableImageUrl(url) {
  return Boolean(url) && !isVideoMediaUrl(url);
}

const SUPABASE_OBJECT_PUBLIC = '/storage/v1/object/public/';

/** Resize Supabase storage images via the render API (falls back to original URL). */
export function getOptimizedImageUrl(url, { width = 80, height = 80, quality = 75 } = {}) {
  if (!url || typeof url !== 'string') return url;

  const markerIdx = url.indexOf(SUPABASE_OBJECT_PUBLIC);
  if (markerIdx === -1) return url;

  const origin = url.slice(0, markerIdx);
  const objectPath = url.slice(markerIdx + SUPABASE_OBJECT_PUBLIC.length).split('?')[0];
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    resize: 'cover',
    quality: String(quality),
  });

  return `${origin}/storage/v1/render/image/public/${objectPath}?${params}`;
}
