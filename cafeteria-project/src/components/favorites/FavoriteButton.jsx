import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';

const SIZES = { sm: 18, md: 22, lg: 26 };

export default function FavoriteButton({
  menuItem,
  cafeteriaId,
  size = 'md',
  className = '',
  requireAuth = true,
  onGuestClick,
}) {
  const navigate = useNavigate();
  const { isFavorited, toggleFavorite, showToast } = useFavorites();
  const [busy, setBusy] = useState(false);
  const px = SIZES[size] || SIZES.md;
  const favorited = isFavorited(menuItem?.id);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('studentToken');
    if (requireAuth && !token) {
      if (onGuestClick) {
        onGuestClick();
        return;
      }
      showToast('Please log in to save favorites', 'error');
      setTimeout(() => navigate('/student/login'), 800);
      return;
    }

    if (!menuItem?.id || !cafeteriaId) return;

    setBusy(true);
    try {
      await toggleFavorite(menuItem, cafeteriaId);
    } catch {
      /* toast shown in context */
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`group/heart relative flex items-center justify-center rounded-full bg-[#0c0c1d]/70 backdrop-blur-sm border border-[#594139]/30 transition-transform hover:scale-110 disabled:opacity-60 ${className}`}
      style={{ width: px + 14, height: px + 14 }}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {busy ? (
        <span
          className="material-symbols-outlined animate-spin text-[#e1bfb5]"
          style={{ fontSize: px }}
        >
          progress_activity
        </span>
      ) : (
        <span
          className={`material-symbols-outlined transition-colors duration-200 ${
            favorited
              ? 'text-rose-400 heart-pop'
              : 'text-[#9ca3af] group-hover/heart:text-rose-300'
          }`}
          style={{
            fontSize: px,
            fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          favorite
        </span>
      )}
      <style>{`
        @keyframes heartPop {
          0% { transform: scale(1); }
          40% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        .heart-pop { animation: heartPop 0.35s ease-out; }
      `}</style>
    </button>
  );
}
