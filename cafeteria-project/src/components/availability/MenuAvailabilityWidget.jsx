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
    <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-high p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'Manrope' }}>
              Menu Availability
            </h3>
            <p className="mt-1 text-xs text-on-surface-variant">
              Auto-reset in {formatMidnightCountdown(countdown)} (PKT)
            </p>
          </div>
          <Link
            to="/cafeteria/menu"
            className="self-start whitespace-nowrap text-sm font-bold text-primary hover:underline"
          >
            Manage menu →
          </Link>
        </div>

        <div className="w-full shrink-0 lg:max-w-sm">
          <div className="mb-2 flex justify-between text-xs font-bold">
            <span className="text-emerald-400">{status.availableCount} available</span>
            <span className="text-on-surface-variant">{status.totalItems} total</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-container-lowest">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#28A745] to-tertiary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-outline-variant/10 pt-5">
        {status.soldOutCount > 0 ? (
          <>
            <p className="mb-3 text-sm font-bold text-error">
              {status.soldOutCount} item{status.soldOutCount !== 1 ? 's' : ''} sold out
            </p>
            <ul className="max-h-40 space-y-2 overflow-y-auto">
              {status.soldOut.slice(0, 5).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-sm text-on-surface-variant"
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
    </div>
  );
}
