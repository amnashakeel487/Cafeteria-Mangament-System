import { Component } from 'react';
import { CHUNK_RELOAD_KEY, clearChunkReloadFlag, isChunkLoadError } from '../utils/chunkLoadRecovery';

export default class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App render error:', error, info);
  }

  handleReload = () => {
    clearChunkReloadFlag();
    const url = new URL(window.location.href);
    url.searchParams.set('_refresh', String(Date.now()));
    window.location.replace(url.pathname + url.search + url.hash);
  };

  handleReset = () => {
    try {
      localStorage.removeItem('studentCart');
      localStorage.removeItem('studentCartCafeteria');
      localStorage.removeItem('cafeteriaToken');
      localStorage.removeItem('cafeteriaData');
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    } catch {
      /* ignore */
    }
    this.handleReload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const staleDeploy = isChunkLoadError(error);

    return (
      <div className="min-h-screen bg-[#121222] text-[#E3E0F8] flex items-center justify-center p-6 font-['Inter']">
        <div className="max-w-md w-full bg-[#28283a] rounded-xl border border-[#594139]/30 p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-[#FF6B35] mb-3">error</span>
          <h1 className="text-lg font-bold font-['Manrope'] mb-2">Something went wrong</h1>
          <p className="text-sm text-[#e1bfb5] mb-4">
            {staleDeploy
              ? 'A new version of the app was deployed. Reload the page to load the latest files.'
              : 'The app could not load. Try reloading, or clear saved data for this site if the problem continues.'}
          </p>
          <p className="text-xs text-[#ffb4ab]/80 mb-6 break-words font-mono">{error?.message}</p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 rounded-lg bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] font-bold"
            >
              Reload page
            </button>
            {!staleDeploy && (
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 rounded-lg border border-[#594139]/30 text-[#FFB59D] font-bold text-sm"
              >
                Clear saved data &amp; reload
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
