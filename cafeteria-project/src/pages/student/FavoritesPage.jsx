import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageSEO from '../../seo/PageSEO';
import { PAGE_SEO } from '../../seo/siteConfig';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import FavoriteItemCard from '../../components/favorites/FavoriteItemCard';
import QuickReorderCard from '../../components/favorites/QuickReorderCard';
import axios from 'axios';

const BASE = '';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, favoriteCount, loading, fetchFavorites, removeFavorite, showToast } =
    useFavorites();
  const { addToCart, clearCart, cafeteriaId: cartCafeId } = useCart();

  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [viewMode, setViewMode] = useState('grouped');
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const cafeteriaNames = useMemo(() => {
    const names = new Set();
    favorites.forEach((f) => {
      if (f.cafeteria?.name) names.add(f.cafeteria.name);
    });
    return [...names];
  }, [favorites]);

  const filtered = useMemo(() => {
    let list = [...favorites];
    if (filter === 'available') {
      list = list.filter((f) => f.menuItem?.is_available);
    } else if (filter !== 'all') {
      list = list.filter((f) => f.cafeteria?.name === filter);
    }

    switch (sort) {
      case 'name':
        list.sort((a, b) => (a.menuItem?.name || '').localeCompare(b.menuItem?.name || ''));
        break;
      case 'price-asc':
        list.sort((a, b) => (a.menuItem?.price || 0) - (b.menuItem?.price || 0));
        break;
      case 'price-desc':
        list.sort((a, b) => (b.menuItem?.price || 0) - (a.menuItem?.price || 0));
        break;
      case 'rating':
        list.sort((a, b) => (b.menuItem?.avg_rating || 0) - (a.menuItem?.avg_rating || 0));
        break;
      default:
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return list;
  }, [favorites, filter, sort]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((f) => {
      const key = String(f.cafeteria_id);
      if (!map[key]) {
        map[key] = { id: key, name: f.cafeteria?.name || 'Cafeteria', items: [] };
      }
      map[key].items.push(f);
    });
    return Object.values(map);
  }, [filtered]);

  const handleRemove = async (menuItemId) => {
    await removeFavorite(menuItemId);
  };

  const handleClearAll = async () => {
    if (!window.confirm('Remove all favorites? This cannot be undone.')) return;
    setClearing(true);
    const token = localStorage.getItem('studentToken');
    try {
      await Promise.all(
        favorites.map((f) =>
          axios.delete(`${BASE}/api/student/favorites/${f.menu_item_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      await fetchFavorites();
      showToast('All favorites cleared');
    } catch {
      showToast('Could not clear all favorites', 'error');
    } finally {
      setClearing(false);
    }
  };

  const handleAddAllAvailable = async () => {
    const available = favorites.filter((f) => f.menuItem?.is_available);
    if (!available.length) {
      showToast('No available items to add', 'error');
      return;
    }
    const byCafe = {};
    available.forEach((f) => {
      const k = String(f.cafeteria_id);
      if (!byCafe[k]) byCafe[k] = [];
      byCafe[k].push(f);
    });
    const cafeKeys = Object.keys(byCafe);
    if (cafeKeys.length > 1) {
      showToast('Add items per cafeteria — cart supports one cafeteria at a time', 'error');
      return;
    }
    const cafeId = cafeKeys[0];
    const ids = byCafe[cafeId].map((f) => f.menu_item_id);
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.post(
        `${BASE}/api/student/favorites/quick-reorder`,
        { menuItemIds: ids, cafeteriaId: cafeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (cartCafeId && String(cartCafeId) !== cafeId) {
        if (!window.confirm('This will replace your current cart. Continue?')) return;
        clearCart();
      }
      res.data.items.forEach((item) => addToCart(item, res.data.cafeteriaId));
      showToast(`${res.data.items.length} items added to cart`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to cart', 'error');
    }
  };

  return (
    <>
      <PageSEO title="My Favorites" description="Saved menu items" />
      <section className="max-w-6xl mx-auto font-['Inter'] pb-16">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#E3E0F8] font-['Manrope']">My Favorites</h1>
            <p className="text-[#e1bfb5] mt-1">Your saved items, ready to order</p>
            <p className="text-sm text-[#FFB59D] font-semibold mt-2">
              {favoriteCount} item{favoriteCount === 1 ? '' : 's'} saved
            </p>
          </div>
          {favoriteCount > 0 && (
            <button
              type="button"
              onClick={handleAddAllAvailable}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] text-sm font-bold"
            >
              Add All to Cart
            </button>
          )}
        </header>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 rounded-xl bg-[#28283a] animate-pulse border border-[#594139]/10"
              />
            ))}
          </div>
        )}

        {!loading && favoriteCount === 0 && (
          <div className="text-center py-20 px-4">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-rose-500/10 flex items-center justify-center animate-pulse">
              <span
                className="material-symbols-outlined text-5xl text-rose-400/60"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                favorite
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#E3E0F8] mb-2">No favorites yet</h2>
            <p className="text-[#e1bfb5] max-w-md mx-auto mb-8">
              Browse the menu and tap ❤️ to save items you love for quick access
            </p>
            <Link
              to="/student/cafeterias"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] font-bold"
            >
              Browse Menu
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        )}

        {!loading && favoriteCount > 0 && (
          <>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {['all', 'available', ...cafeteriaNames].map((pill) => {
                  const pillValue = pill === 'all' ? 'all' : pill === 'available' ? 'available' : pill;
                  const active = filter === pillValue;
                  return (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setFilter(pillValue)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${
                      active
                        ? 'bg-[#FF6B35]/20 text-[#FFB59D] border border-[#FF6B35]/30'
                        : 'bg-[#28283a] text-[#e1bfb5] border border-[#594139]/20'
                    }`}
                  >
                    {pill === 'all' ? 'All' : pill === 'available' ? 'Available Now' : pill}
                  </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-[#28283a] border border-[#594139]/20 rounded-lg px-3 py-2 text-sm text-[#E3E0F8]"
                >
                  <option value="recent">Recently Added</option>
                  <option value="name">Name A-Z</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <div className="flex rounded-lg border border-[#594139]/20 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setViewMode('grouped')}
                    className={`p-2 ${viewMode === 'grouped' ? 'bg-[#FF6B35]/20 text-[#FFB59D]' : 'text-[#9ca3af]'}`}
                    aria-label="Grouped view"
                  >
                    <span className="material-symbols-outlined text-lg">grid_view</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-[#FF6B35]/20 text-[#FFB59D]' : 'text-[#9ca3af]'}`}
                    aria-label="List view"
                  >
                    <span className="material-symbols-outlined text-lg">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'grouped' ? (
              grouped.map((group) => (
                <div key={group.id} className="mb-10">
                  <QuickReorderCard
                    cafeteriaName={group.name}
                    cafeteriaId={group.id}
                    favorites={group.items}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                      {group.items.map((f) => (
                        <FavoriteItemCard key={f.id} favorite={f} onRemove={handleRemove} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                <AnimatePresence mode="popLayout">
                  {filtered.map((f) => (
                    <FavoriteItemCard key={f.id} favorite={f} onRemove={handleRemove} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div className="mt-12 text-center">
              <button
                type="button"
                disabled={clearing}
                onClick={handleClearAll}
                className="text-sm font-bold text-red-400/80 hover:text-red-400 hover:underline disabled:opacity-50"
              >
                Clear All Favorites
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
