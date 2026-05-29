import { Component } from 'react';

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

  handleReset = () => {
    try {
      localStorage.removeItem('studentCart');
      localStorage.removeItem('studentCartCafeteria');
    } catch {
      /* ignore */
    }
    window.location.href = '/';
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-[#121222] text-[#E3E0F8] flex items-center justify-center p-6 font-['Inter']">
        <div className="max-w-md w-full bg-[#28283a] rounded-xl border border-[#594139]/30 p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-[#FF6B35] mb-3">error</span>
          <h1 className="text-lg font-bold font-['Manrope'] mb-2">Something went wrong</h1>
          <p className="text-sm text-[#e1bfb5] mb-4">
            The app could not load. This is often caused by outdated saved cart data in your browser.
          </p>
          <p className="text-xs text-[#ffb4ab]/80 mb-6 break-words font-mono">{error?.message}</p>
          <button
            type="button"
            onClick={this.handleReset}
            className="w-full py-3 rounded-lg bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] font-bold"
          >
            Clear saved data &amp; reload
          </button>
        </div>
      </div>
    );
  }
}
