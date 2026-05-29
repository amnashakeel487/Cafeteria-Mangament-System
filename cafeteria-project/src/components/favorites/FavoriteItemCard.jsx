import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { formatPrice } from '../../utils/currency';
import StarDisplay from '../ratings/StarDisplay';

export default function FavoriteItemCard({ favorite, onRemove }) {
  const item = favorite.menuItem;
  const cafe = favorite.cafeteria;
  const { addToCart, cafeteriaId: cartCafeId } = useCart();
  const { showToast } = useFavorites();

  if (!item) return null;

  const unavailable = !item.is_available;
  const wrongCafe =
    cartCafeId && String(cartCafeId) !== String(favorite.cafeteria_id);

  const handleAddToCart = () => {
    if (unavailable) return;
    addToCart(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        category: item.category,
        description: item.description,
      },
      String(favorite.cafeteria_id)
    );
    showToast(`${item.name} added to cart`);
  };

  const handleRemove = () => {
    if (!window.confirm(`Remove "${item.name}" from favorites?`)) return;
    onRemove?.(item.id);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-[#28283a] rounded-xl border border-[#594139]/15 p-4 flex flex-col sm:flex-row gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="w-full sm:w-24 h-24 rounded-lg bg-[#333345] flex items-center justify-center shrink-0 overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">🍽️</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-[#E3E0F8] font-['Manrope'] truncate">{item.name}</h3>
            <p className="text-xs text-[#e1bfb5]">{cafe?.name}</p>
          </div>
          <button type="button" onClick={handleRemove} className="shrink-0 p-1" aria-label="Remove">
            <span
              className="material-symbols-outlined text-rose-400"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#59d5fb]/10 text-[#59d5fb] border border-[#59d5fb]/20">
            {item.category || 'Item'}
          </span>
          {unavailable ? (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
              Unavailable
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
              Available
            </span>
          )}
        </div>

        {(item.rating_count || 0) > 0 && (
          <div className="mt-2">
            <StarDisplay rating={item.avg_rating} count={item.rating_count} size="xs" />
          </div>
        )}

        <p className="text-lg font-bold text-[#FFB59D] mt-2">{formatPrice(item.price)}</p>
      </div>

      <div className="flex sm:flex-col justify-end gap-2 shrink-0">
        <button
          type="button"
          disabled={unavailable}
          title={
            unavailable
              ? 'Currently unavailable'
              : wrongCafe
                ? 'Will replace cart items from another cafeteria'
                : 'Add to cart'
          }
          onClick={handleAddToCart}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Add to Cart
        </button>
      </div>
    </motion.article>
  );
}
