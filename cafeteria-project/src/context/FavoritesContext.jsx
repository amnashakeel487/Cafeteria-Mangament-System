import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const FavoritesContext = createContext(null);

const BASE = '';

function getHeaders() {
  const token = localStorage.getItem('studentToken');
  return { Authorization: `Bearer ${token}` };
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchFavoriteIds = useCallback(async () => {
    const token = localStorage.getItem('studentToken');
    if (!token) return;
    try {
      const res = await axios.get(`${BASE}/api/student/favorites/ids`, {
        headers: getHeaders(),
      });
      setFavoriteIds(new Set((res.data.favoriteIds || []).map(String)));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load favorites');
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    const token = localStorage.getItem('studentToken');
    if (!token) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE}/api/student/favorites`, {
        headers: getHeaders(),
      });
      const list = res.data || [];
      setFavorites(list);
      setFavoriteIds(new Set(list.map((f) => String(f.menu_item_id))));
      return list;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load favorites');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavoriteIds();
  }, [fetchFavoriteIds]);

  const isFavorited = useCallback(
    (menuItemId) => favoriteIds.has(String(menuItemId)),
    [favoriteIds]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    setFavoriteIds(new Set());
    setError(null);
  }, []);

  const toggleFavorite = useCallback(
    async (menuItem, cafeteriaId) => {
      const id = String(menuItem.id);
      const wasFavorited = favoriteIds.has(id);
      const next = new Set(favoriteIds);
      if (wasFavorited) next.delete(id);
      else next.add(id);
      setFavoriteIds(next);

      try {
        if (wasFavorited) {
          await axios.delete(`${BASE}/api/student/favorites/${id}`, {
            headers: getHeaders(),
          });
          setFavorites((prev) => prev.filter((f) => String(f.menu_item_id) !== id));
          showToast('Removed from favorites');
        } else {
          const res = await axios.post(
            `${BASE}/api/student/favorites`,
            { menuItemId: menuItem.id, cafeteriaId: String(cafeteriaId) },
            { headers: getHeaders() }
          );
          setFavorites((prev) => [res.data, ...prev.filter((f) => String(f.menu_item_id) !== id)]);
          showToast('Added to favorites ❤️');
        }
        return !wasFavorited;
      } catch (err) {
        const revert = new Set(favoriteIds);
        setFavoriteIds(revert);
        showToast(err.response?.data?.message || 'Could not update favorites', 'error');
        throw err;
      }
    },
    [favoriteIds, showToast]
  );

  const removeFavorite = useCallback(
    async (menuItemId) => {
      const id = String(menuItemId);
      const next = new Set(favoriteIds);
      next.delete(id);
      setFavoriteIds(next);
      try {
        await axios.delete(`${BASE}/api/student/favorites/${id}`, {
          headers: getHeaders(),
        });
        setFavorites((prev) => prev.filter((f) => String(f.menu_item_id) !== id));
        showToast('Removed from favorites');
      } catch (err) {
        setFavoriteIds(favoriteIds);
        showToast(err.response?.data?.message || 'Failed to remove', 'error');
        throw err;
      }
    },
    [favoriteIds, showToast]
  );

  const value = useMemo(
    () => ({
      favorites,
      favoriteIds,
      favoriteCount: favoriteIds.size,
      loading,
      error,
      toast,
      isFavorited,
      toggleFavorite,
      removeFavorite,
      fetchFavorites,
      fetchFavoriteIds,
      clearFavorites,
      showToast,
    }),
    [
      favorites,
      favoriteIds,
      loading,
      error,
      toast,
      isFavorited,
      toggleFavorite,
      removeFavorite,
      fetchFavorites,
      fetchFavoriteIds,
      clearFavorites,
      showToast,
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-2xl text-sm font-bold border-l-4 ${
            toast.type === 'error'
              ? 'bg-[#93000a]/95 text-[#ffb4ab] border-[#ffb4ab]'
              : 'bg-[#28A745] text-white border-[#28A745]'
          }`}
        >
          {toast.message}
        </div>
      )}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}
