import { motion } from 'framer-motion';
import { formatPrice } from '../../utils/currency';
import { formatSpecialTimeWindow } from '../../utils/specialsApi';
import { AvailabilityBadgeFromItem } from '../availability/AvailabilityBadge';
import {
  cafeteriaInitials,
  getLandingTheme,
  hasMeaningfulDescription,
  LANDING_TYPE_LABELS,
} from './landingSpecialTheme';

const CARD_BASE =
  'group relative w-full overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-high shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10';

function PriceBlock({ special, isDiscount, original, specialPrice, savings, size = 'md' }) {
  const priceCls = size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-xl';
  const hasPrice =
    special.special_type !== 'announcement' &&
    (special.special_price != null || special.menu_item?.price != null);

  if (!hasPrice) return null;

  if (isDiscount && original != null && specialPrice != null) {
    return (
      <div className={`mt-4 flex flex-wrap items-end gap-2 ${size === 'lg' ? 'mt-0' : ''}`}>
        <span className="text-sm text-on-surface-variant line-through">{formatPrice(original)}</span>
        <span className={`font-black text-primary ${priceCls}`}>{formatPrice(specialPrice)}</span>
        {savings != null && savings > 0 && (
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            Save {formatPrice(savings)}!
          </span>
        )}
      </div>
    );
  }

  return (
    <p className={`mt-4 font-black text-primary ${priceCls} ${size === 'lg' ? 'mt-0' : ''}`}>
      {formatPrice(specialPrice ?? original)}
    </p>
  );
}

function TypeBadge({ theme, type }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}
    >
      {LANDING_TYPE_LABELS[type] || type}
    </span>
  );
}

function VisualIcon({ imageSrc, emoji, size = 'md' }) {
  const cls = size === 'lg' ? 'h-16 w-16 text-6xl' : 'h-14 w-14 text-5xl';
  if (imageSrc) {
    return (
      <div
        className={`landing-float shrink-0 overflow-hidden rounded-full border-2 border-outline-variant/15 shadow-lg transition-transform duration-300 group-hover:scale-110 ${size === 'lg' ? 'h-16 w-16' : 'h-14 w-14'}`}
      >
        <img src={imageSrc} alt="" className="h-full w-full object-cover" loading="lazy" />
      </div>
    );
  }
  return (
    <span
      className={`landing-float shrink-0 drop-shadow-md transition-transform duration-300 group-hover:scale-110 ${cls}`}
      role="img"
      aria-hidden
    >
      {emoji}
    </span>
  );
}

/**
 * Landing-page special card — matches FeatureCard / PortalCard surface styles.
 * layout="hero" → full-width horizontal banner (single special).
 */
export default function LandingSpecialCard({
  special,
  index = 0,
  showCafeteriaName = true,
  layout = 'grid',
}) {
  const theme = getLandingTheme(special.special_type);
  const timeLabel = formatSpecialTimeWindow(special.start_time, special.end_time);
  const item = special.menu_item;
  const imageSrc = special.image_url || item?.image_url;
  const isDiscount = special.special_type === 'discount';
  const original = special.original_price ?? item?.price;
  const specialPrice = special.special_price ?? item?.price;
  const savings =
    original != null && specialPrice != null && Number(original) > Number(specialPrice)
      ? Number(original) - Number(specialPrice)
      : null;
  const showDesc = hasMeaningfulDescription(special);
  const isHero = layout === 'hero';

  const motionProps = {
    initial: { opacity: 0, y: 40, scale: 0.95 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, margin: '-40px' },
    transition: { type: 'spring', damping: 20, stiffness: 200, delay: index * 0.1 },
    whileHover: isHero ? undefined : { y: -8 },
  };

  if (isHero) {
    return (
      <motion.article
        {...motionProps}
        className={`${CARD_BASE} ${theme.borderTint} ${theme.borderHover}`}
      >
        <div className={`h-[3px] w-full bg-gradient-to-r ${theme.bar}`} />
        <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: theme.tint }} />

        {isDiscount && special.discount_percentage != null && (
          <div className="absolute right-4 top-6 z-10 flex h-11 w-11 -rotate-6 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/15 text-[10px] font-black leading-tight text-emerald-300">
            {special.discount_percentage}%
            <br />
            OFF
          </div>
        )}

        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:gap-10">
          {/* Left ~60% */}
          <div className="min-w-0 flex-1 lg:w-[60%]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <TypeBadge theme={theme} type={special.special_type} />
              {special.is_featured && (
                <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  ✨ Featured
                </span>
              )}
            </div>

            <div className="flex items-start gap-4 sm:gap-5">
              <VisualIcon imageSrc={imageSrc} emoji={theme.emoji} size="lg" />
              <div className="min-w-0 flex-1">
                <h3
                  className="font-['Manrope'] text-2xl font-extrabold leading-tight text-on-surface sm:text-3xl"
                >
                  {special.title}
                </h3>
                {showCafeteriaName && special.cafeteria_name && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-base text-primary">storefront</span>
                    {special.cafeteria_name}
                  </p>
                )}
                {showDesc && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                    {special.description}
                  </p>
                )}
                {timeLabel && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {timeLabel.replace('Available: ', '')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right ~40% */}
          <div className="flex shrink-0 flex-col items-start gap-4 border-t border-outline-variant/10 pt-5 lg:w-[40%] lg:items-end lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
            <PriceBlock
              special={special}
              isDiscount={isDiscount}
              original={original}
              specialPrice={specialPrice}
              savings={savings}
              size="lg"
            />
            {item && <AvailabilityBadgeFromItem item={item} />}
            <span className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-tertiary to-tertiary-container px-5 py-2.5 text-sm font-bold text-on-tertiary shadow-md shadow-tertiary/20 transition-transform duration-300 group-hover:translate-x-0.5">
              View Menu
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </span>
            {special.cafeteria_name && (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-xs font-black text-primary lg:mt-2"
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

  /* Standard grid card */
  return (
    <motion.article
      {...motionProps}
      className={`${CARD_BASE} flex min-h-[220px] flex-col ${theme.borderTint} ${theme.borderHover}`}
    >
      <div className={`h-[3px] w-full bg-gradient-to-r ${theme.bar}`} />
      <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: theme.tint }} />

      {isDiscount && special.discount_percentage != null && (
        <div className="absolute right-3 top-5 z-10 flex h-11 w-11 -rotate-6 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/15 text-[10px] font-black leading-tight text-emerald-300">
          {special.discount_percentage}%
          <br />
          OFF
        </div>
      )}

      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-2 pr-10">
          <TypeBadge theme={theme} type={special.special_type} />
          {special.is_featured && (
            <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              ✨ Featured
            </span>
          )}
        </div>

        <div className="mb-4 flex items-center gap-4">
          <VisualIcon imageSrc={imageSrc} emoji={theme.emoji} />
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-['Manrope'] text-lg font-extrabold leading-snug text-on-surface">
              {special.title}
            </h3>
            {showCafeteriaName && special.cafeteria_name && (
              <p className="mt-1.5 flex items-center gap-1 truncate text-[13px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px] text-primary">storefront</span>
                {special.cafeteria_name}
              </p>
            )}
          </div>
        </div>

        {showDesc && (
          <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-on-surface-variant">
            {special.description}
          </p>
        )}

        <PriceBlock
          special={special}
          isDiscount={isDiscount}
          original={original}
          specialPrice={specialPrice}
          savings={savings}
        />

        {timeLabel && (
          <p className="mt-2 flex items-center gap-1 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            {timeLabel.replace('Available: ', '')}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-outline-variant/10 pt-4">
          <span className="flex items-center gap-1 text-xs font-bold text-primary transition-transform duration-300 group-hover:translate-x-1">
            View Menu
            <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
              arrow_forward
            </span>
          </span>
          {special.cafeteria_name && (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-xs font-black text-primary"
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
