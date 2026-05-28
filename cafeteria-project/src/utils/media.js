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
