import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPrice } from '../../utils/currency';
import { formatSpecialTimeWindow } from '../../utils/specialsApi';
import { getTimeAgo } from '../../utils/notificationHelpers';
import SpecialTypeBadge from './SpecialTypeBadge';
import { AvailabilityBadgeFromItem } from '../availability/AvailabilityBadge';
import { useCart } from '../../context/CartContext';
import LandingSpecialCard from './LandingSpecialCard';

const ACCENT_BORDER = {
  special: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
  announcement: 'hover:border-sky-500/50 hover:shadow-sky-500/10',
  discount: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
  new_item: 'hover:border-violet-500/50 hover:shadow-violet-500/10',
  limited_time: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
};

export default function SpecialCard({
  special,
  showCafeteriaName = false,
  compact = false,
  animate = true,
  publicView = false,
  variant = 'default',
  index = 0,
  onAddToCart,
}) {
  if (variant === 'landing') {
    return (
      <LandingSpecialCard special={special} index={index} showCafeteriaName={showCafeteriaName} />
    );
  }

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [expanded, setExpanded] = useState(false);

  const timeLabel = formatSpecialTimeWindow(special.start_time, special.end_time);
  const item = special.menu_item;
  const canAdd =
    item &&
    item.is_available !== false &&
    special.cafeteria_id;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!item) return;
    const cartItem = {
      id: item.id,
      name: item.name,
      price: special.special_price ?? item.price,
      category: item.category,
      image_url: item.image_url || special.image_url,
      is_available: true,
    };
    const result = addToCart(cartItem, special.cafeteria_id);
    if (result?.ok) onAddToCart?.(cartItem);
  };

  const Wrapper = animate ? motion.article : 'article';
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        whileHover: { y: -4 },
        transition: { duration: 0.2 },
      }
    : {};

  if (compact) {
    return (
      <Wrapper
        {...motionProps}
        className={`bg-[#28283a] rounded-xl border border-[#594139]/20 p-4 cursor-pointer transition-shadow duration-200 ${
          ACCENT_BORDER[special.special_type] || ''
        }`}
        onClick={
          publicView
            ? undefined
            : () => navigate(`/student/menu/${special.cafeteria_id}`)
        }
      >
        <div className="flex justify-between gap-2 mb-2">
          <SpecialTypeBadge type={special.special_type} size="sm" />
          {special.is_featured && (
            <span className="text-[10px] font-bold text-amber-300">✨ Featured</span>
          )}
        </div>
        <h3 className="font-bold text-[#E3E0F8] text-sm line-clamp-2 mb-1">{special.title}</h3>
        {showCafeteriaName && (
          <p className="text-xs text-[#e1bfb5] mb-1">{special.cafeteria_name}</p>
        )}
        {special.special_price != null && (
          <p className="text-sm font-bold text-[#FFB59D]">{formatPrice(special.special_price)}</p>
        )}
      </Wrapper>
    );
  }

  return (
    <Wrapper
      {...motionProps}
      className={`bg-[#28283a] rounded-xl border border-[#594139]/20 overflow-hidden transition-shadow duration-200 ${
        ACCENT_BORDER[special.special_type] || ''
      }`}
    >
      {special.image_url && (
        <div className="h-36 overflow-hidden bg-[#333345]">
          <img src={special.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <SpecialTypeBadge type={special.special_type} />
          <div className="flex flex-col items-end gap-1">
            {special.is_featured && (
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
                ✨ Featured
              </span>
            )}
            {timeLabel && (
              <span className="text-[10px] text-[#e1bfb5] bg-[#0c0c1d]/60 px-2 py-0.5 rounded-full">
                {timeLabel}
              </span>
            )}
          </div>
        </div>

        <h3 className="font-['Manrope'] font-bold text-lg text-[#E3E0F8] mb-1">{special.title}</h3>
        {special.description && (
          <>
            <p className={`text-sm text-[#e1bfb5] ${expanded ? '' : 'line-clamp-2'}`}>
              {special.description}
            </p>
            {special.description.length > 80 && (
              <button
                type="button"
                className="text-xs text-[#FFB59D] mt-1"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </>
        )}

        {item && (
          <div className="mt-3 p-3 rounded-lg bg-[#0c0c1d]/50 border border-[#594139]/15">
            <p className="text-sm font-medium text-[#E3E0F8]">{item.name}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {special.original_price != null && special.special_price != null && (
                <span className="text-sm text-[#e1bfb5]">
                  <span className="line-through mr-2">{formatPrice(special.original_price)}</span>
                  <span className="font-bold text-[#FFB59D]">{formatPrice(special.special_price)}</span>
                  {special.discount_percentage != null && (
                    <span className="ml-2 text-emerald-400 text-xs">
                      ({special.discount_percentage}% OFF)
                    </span>
                  )}
                </span>
              )}
              {special.special_price != null && special.original_price == null && (
                <span className="font-bold text-[#FFB59D]">{formatPrice(special.special_price)}</span>
              )}
              <AvailabilityBadgeFromItem item={item} />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#e1bfb5]">
          {showCafeteriaName && <span>{special.cafeteria_name}</span>}
          <span>{getTimeAgo(special.created_at)}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {canAdd && !publicView && (
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 min-w-[120px] py-2.5 rounded-lg bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] font-bold text-sm"
            >
              Add to Cart
            </button>
          )}
          <Link
            to={publicView ? '/student/login' : `/student/menu/${special.cafeteria_id}`}
            className="flex-1 min-w-[120px] py-2.5 rounded-lg border border-[#594139]/30 text-center text-[#FFB59D] font-bold text-sm hover:bg-[#38374a]/40"
          >
            {publicView ? 'Order Now' : 'View Menu'}
          </Link>
        </div>
      </div>
    </Wrapper>
  );
}
