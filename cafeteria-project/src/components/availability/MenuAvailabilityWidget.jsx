import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatMidnightCountdown, useMidnightCountdown } from '../../utils/midnightCountdown';

export default function MenuAvailabilityWidget({ axiosConfig }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const countdown = useMidnightCountdown();

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/cafeteria/availability/status', axiosConfig);
      setStatus(res.data);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const restoreItem = async (id) => {
    setRestoringId(id);
    try {
      await axios.patch(
        `/api/cafeteria/availability/${id}`,
        { isAvailable: true },
        axiosConfig
      );
      await fetchStatus();
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface-container-high rounded-2xl border border-outline-variant/10 p-6 animate-pulse h-48" />
    );
  }

  if (!status) return null;

  const pct =
    status.totalItems > 0
      ? Math.round((status.availableCount / status.totalItems) * 100)
      : 100;

  return (
    <div className="bg-surface-container-high rounded-2xl border border-outline-variant/10 p-6 shadow-lg">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'Manrope' }}>
            Menu Availability
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Auto-reset in {formatMidnightCountdown(countdown)} (PKT)
          </p>
        </div>
        <Link
          to="/cafeteria/menu"
          className="text-xs font-bold text-primary hover:underline whitespace-nowrap"
        >
          Manage →
        </Link>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="text-[#6ee7b7]">{status.availableCount} available</span>
          <span className="text-on-surface-variant">{status.totalItems} total</span>
        </div>
        <div className="h-2 rounded-full bg-surface-container-lowest overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#28A745] to-tertiary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {status.soldOutCount > 0 ? (
        <>
          <p className="text-sm font-bold text-error mb-3">
            {status.soldOutCount} item{status.soldOutCount !== 1 ? 's' : ''} sold out
          </p>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {status.soldOut.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 text-sm text-on-surface-variant"
              >
                <span className="truncate">{item.name}</span>
                <button
                  type="button"
                  disabled={restoringId === item.id}
                  onClick={() => restoreItem(item.id)}
                  className="shrink-0 text-xs font-bold text-tertiary hover:underline disabled:opacity-50"
                >
                  {restoringId === item.id ? '…' : 'Restore'}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-sm text-on-surface-variant">All menu items are available.</p>
      )}
    </div>
  );
}
