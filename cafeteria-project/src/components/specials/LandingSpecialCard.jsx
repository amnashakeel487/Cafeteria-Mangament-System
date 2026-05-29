import { motion } from 'framer-motion';
import { formatPrice } from '../../utils/currency';
import { formatSpecialTimeWindow } from '../../utils/specialsApi';
import {
  cafeteriaInitials,
  getLandingTheme,
  LANDING_TYPE_LABELS,
} from './landingSpecialTheme';

/**
 * Premium landing-page special card (used via SpecialCard variant="landing").
 */
export default function LandingSpecialCard({ special, index = 0, showCafeteriaName = true }) {
  const theme = getLandingTheme(special.special_type);
  const timeLabel = formatSpecialTimeWindow(special.start_time, special.end_time);
  const item = special.menu_item;
  const imageSrc = special.image_url || item?.image_url;
  const isDiscount = special.special_type === 'discount';
  const hasPrice =
    special.special_type !== 'announcement' &&
    (special.special_price != null || item?.price != null);
  const original = special.original_price ?? item?.price;
  const specialPrice = special.special_price ?? item?.price;
  const savings =
    original != null && specialPrice != null && Number(original) > Number(specialPrice)
      ? Number(original) - Number(specialPrice)
      : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 200,
        delay: index * 0.1,
      }}
      whileHover={{ y: -8 }}
      className={`group relative flex min-h-[220px] w-full max-w-[320px] mx-auto flex-col overflow-hidden rounded-2xl border bg-gradient-to-br backdrop-blur-sm transition-all duration-300 ease-out ${theme.gradient} ${theme.border} ${theme.borderHover} shadow-lg ${theme.shadow} hover:shadow-2xl`}
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
    >
      {/* Top accent bar */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${theme.bar}`} />

      {/* Discount ribbon */}
      {isDiscount && special.discount_percentage != null && (
        <div
          className="absolute right-3 top-5 z-10 flex h-12 w-12 -rotate-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-[10px] font-black leading-tight text-white shadow-lg shadow-emerald-900/40"
          aria-hidden
        >
          {special.discount_percentage}%
          <br />
          OFF
        </div>
      )}

      <div className="relative flex flex-1 flex-col p-5 pt-4">
        {/* Badges row */}
        <div className="mb-4 flex items-start justify-between gap-2 pr-10">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${theme.badge}`}
          >
            {LANDING_TYPE_LABELS[special.special_type] || special.special_type}
          </span>
          {special.is_featured && (
            <span className="landing-shimmer-badge rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-amber-300/30 to-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
              ✨ Featured
            </span>
          )}
        </div>

        {/* Visual / emoji */}
        <div className="mb-3 flex items-center gap-4">
          {imageSrc ? (
            <div className="landing-float h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/10 shadow-lg shadow-black/30 transition-transform duration-300 group-hover:scale-110">
              <img src={imageSrc} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
          ) : (
            <span
              className="landing-float text-5xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
              role="img"
              aria-hidden
            >
              {theme.emoji}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-['Manrope'] text-lg font-extrabold leading-snug text-white drop-shadow-sm">
              {special.title}
            </h3>
            {showCafeteriaName && special.cafeteria_name && (
              <p className="mt-1 flex items-center gap-1 truncate text-[13px] text-white/55">
                <span className="material-symbols-outlined text-[14px]">storefront</span>
                {special.cafeteria_name}
              </p>
            )}
          </div>
        </div>

        {special.description && (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-white/50">
            {special.description}
          </p>
        )}

        {/* Price block */}
        {hasPrice && (
          <div className="mt-auto">
            {isDiscount && original != null && specialPrice != null ? (
              <div className="flex flex-wrap items-end gap-2">
                <span className="text-sm text-white/40 line-through">{formatPrice(original)}</span>
                <span className={`text-xl font-black ${theme.price}`}>
                  {formatPrice(specialPrice)}
                </span>
                {savings != null && savings > 0 && (
                  <span className="rounded-full bg-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                    Save {formatPrice(savings)}!
                  </span>
                )}
              </div>
            ) : (
              <p className={`text-lg font-black ${theme.price}`}>
                {formatPrice(specialPrice ?? original)}
              </p>
            )}
          </div>
        )}

        {timeLabel && (
          <p className="mt-2 flex items-center gap-1 text-xs text-white/45">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            {timeLabel.replace('Available: ', '')}
          </p>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="flex items-center gap-1 text-xs font-bold text-[#FFB59D] transition-transform duration-300 group-hover:translate-x-1">
            View Menu
            <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
              arrow_forward
            </span>
          </span>
          {special.cafeteria_name && (
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white/90 ${theme.glow}`}
              title={special.cafeteria_name}
            >
              {cafeteriaInitials(special.cafeteria_name)}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
