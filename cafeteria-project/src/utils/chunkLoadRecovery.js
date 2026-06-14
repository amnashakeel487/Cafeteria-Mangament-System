/** Session key — one automatic reload per stale-chunk incident (avoids infinite loops). */
export const CHUNK_RELOAD_KEY = 'COMSATS_chunk_reload_v1';

export function isChunkLoadError(error) {
  const msg = error?.message || String(error || '');
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Loading chunk') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module')
  );
}

/**
 * After a new Vercel deploy, cached index.html may reference deleted JS chunks.
 * Reload once so the browser picks up the new index + asset hashes.
 */
export function tryRecoverFromChunkError() {
  if (typeof window === 'undefined') return false;
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return false;
  sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
  window.location.reload();
  return true;
}

export function clearChunkReloadFlag() {
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    /* ignore */
  }
}

export function setupChunkLoadRecovery() {
  if (typeof window === 'undefined') return;

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    tryRecoverFromChunkError();
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason)) {
      event.preventDefault();
      tryRecoverFromChunkError();
    }
  });

  window.addEventListener('load', () => {
    clearChunkReloadFlag();
  });
}
