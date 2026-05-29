import { useState, useEffect } from 'react';
import axios from 'axios';
import { useFavorites } from '../../context/FavoritesContext';

const BASE = '';

export default function SaveOrderItemsButton({ order }) {
  const [open, setOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isFavorited, toggleFavorite, showToast } = useFavorites();

  useEffect(() => {
    if (!open || !order?.cafeteria_id) return;
    setLoading(true);
    const token = localStorage.getItem('studentToken');
    axios
      .get(`${BASE}/api/student/menu/${order.cafeteria_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMenuItems(res.data.items || []))
      .catch(() => setMenuItems([]))
      .finally(() => setLoading(false));
  }, [open, order?.cafeteria_id]);

  const orderLines = order?.items || [];

  const resolveMenuItem = (line) => {
    const key = (line.item_name || '').trim().toLowerCase();
    return menuItems.find((m) => (m.name || '').trim().toLowerCase() === key);
  };

  const handleSaveAll = async () => {
    let saved = 0;
    for (const line of orderLines) {
      const match = resolveMenuItem(line);
      if (!match || isFavorited(match.id)) continue;
      try {
        await toggleFavorite(match, order.cafeteria_id);
        saved += 1;
      } catch {
        /* continue */
      }
    }
    if (saved) showToast(`${saved} item${saved === 1 ? '' : 's'} saved to favorites`);
    else showToast('No new items to save', 'error');
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex-1 md:flex-none px-4 py-2.5 border border-rose-500/30 text-rose-300 text-sm font-bold rounded-lg hover:bg-rose-500/10 flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">favorite</span>
        Save Items
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-label="Close"
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 max-w-[90vw] bg-[#1E1E2F] border border-[#594139]/30 rounded-xl shadow-2xl p-4">
            <p className="text-xs font-bold text-[#FFB59D] uppercase mb-3">Save from this order</p>
            {loading ? (
              <p className="text-sm text-[#9ca3af]">Loading menu...</p>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto mb-3">
                {orderLines.map((line, idx) => {
                  const match = resolveMenuItem(line);
                  const fav = match && isFavorited(match.id);
                  return (
                    <li
                      key={idx}
                      className="flex items-center justify-between gap-2 text-sm text-[#E3E0F8]"
                    >
                      <span className="truncate flex-1">{line.item_name}</span>
                      {match ? (
                        <button
                          type="button"
                          onClick={() =>
                            fav
                              ? null
                              : toggleFavorite(match, order.cafeteria_id)
                          }
                          className="shrink-0 p-1"
                          disabled={fav}
                        >
                          <span
                            className="material-symbols-outlined text-lg text-rose-400"
                            style={{ fontVariationSettings: fav ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            favorite
                          </span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#9ca3af]">N/A</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <button
              type="button"
              onClick={handleSaveAll}
              className="w-full py-2 rounded-lg bg-[#FF6B35]/20 text-[#FFB59D] text-xs font-bold"
            >
              Save All Items
            </button>
          </div>
        </>
      )}
    </div>
  );
}
