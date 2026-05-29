import { useState, useRef, useEffect } from 'react';

export default function ExportButton({ onExportCSV, onExportPDF, onExportOrders, onExportItems, loading, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const run = (fn) => {
    setOpen(false);
    fn?.();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-sm font-bold text-on-surface disabled:opacity-50"
      >
        {loading ? (
          <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
        ) : (
          <span className="material-symbols-outlined text-lg">download</span>
        )}
        Export
        <span className="material-symbols-outlined text-sm">{open ? 'expand_less' : 'expand_more'}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-surface-container-high border border-outline-variant/15 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
          {[
            { label: 'Export as CSV', icon: 'table_chart', fn: onExportCSV },
            { label: 'Export as PDF', icon: 'picture_as_pdf', fn: onExportPDF },
            { label: 'Export Orders List', icon: 'list_alt', fn: onExportOrders },
            { label: 'Export Items Report', icon: 'bar_chart', fn: onExportItems },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => run(opt.fn)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-highest text-left"
            >
              <span className="material-symbols-outlined text-lg text-primary">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
