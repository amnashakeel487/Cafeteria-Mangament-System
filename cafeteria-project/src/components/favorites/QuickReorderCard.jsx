import { useState } from 'react';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { formatPrice } from '../../utils/currency';

const BASE = '';

export default function QuickReorderCard({ cafeteriaName, cafeteriaId, favorites, onReorder }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToCart, clearCart, cafeteriaId: cartCafeId } = useCart();
  const { showToast } = useFavorites();

  const items = favorites.filter((f) => f.menuItem);
  const available = items.filter((f) => f.menuItem?.is_available);
  const unavailableCount = items.length - available.length;

  const handleAddAll = async () => {
    if (!available.length) {
      showToast('None of these items are currently available', 'error');
      return;
    }

    const ids = available.map((f) => f.menu_item_id);
    setLoading(true);
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.post(
        `${BASE}/api/student/favorites/quick-reorder`,
        { menuItemIds: ids, cafeteriaId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { items: cartItems, cafeteriaId: cid } = res.data;

      if (cartCafeId && String(cartCafeId) !== String(cid)) {
        if (!window.confirm('This will replace your current cart. Continue?')) {
          setLoading(false);
          return;
        }
        clearCart();
      }

      cartItems.forEach((item) => {
        addToCart(
          {
            id: item.id,
            name: item.name,
            price: item.price,
            image_url: item.image_url,
            category: item.category,
            description: item.description,
          },
          String(cid)
        );
      });

      const skipped = unavailableCount;
      if (skipped > 0) {
        showToast(
          `${cartItems.length} item${cartItems.length === 1 ? '' : 's'} added to cart (${skipped} unavailable skipped)`
        );
      } else {
        showToast(`${cartItems.length} items added to cart`);
      }
      onReorder?.();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add items to cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1E1E2F] rounded-xl border border-[#594139]/20 p-5 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#E3E0F8] font-['Manrope']">{cafeteriaName}</h3>
          <span className="text-xs text-[#e1bfb5]">{items.length} items saved</span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-xs font-bold text-[#59d5fb] hover:underline"
        >
          {expanded ? 'Hide items' : 'View items'}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar mb-4">
        {items.map((f) => (
          <div
            key={f.id}
            className={`shrink-0 px-3 py-2 rounded-lg border text-xs ${
              f.menuItem?.is_available
                ? 'bg-[#28283a] border-[#594139]/20 text-[#E3E0F8]'
                : 'bg-[#28283a]/50 border-red-500/20 text-[#9ca3af] line-through'
            }`}
          >
            <span className="font-semibold">{f.menuItem?.name}</span>
            <span className="text-[#FFB59D] ml-2">{formatPrice(f.menuItem?.price)}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={loading || !available.length}
        onClick={handleAddAll}
        className="w-full py-3 rounded-lg bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
        ) : (
          <>
            <span className="material-symbols-outlined text-lg">shopping_cart</span>
            Add All to Cart
          </>
        )}
      </button>
    </div>
  );
}
