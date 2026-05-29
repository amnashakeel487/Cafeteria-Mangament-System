import { motion } from 'framer-motion';
import { formatPrice } from '../../utils/currency';

export default function SpecialsMarquee({ specials = [], variant = 'default' }) {
  const items = specials.filter(
    (s) => s.special_type === 'announcement' || s.special_type === 'special'
  );
  if (!items.length) return null;

  if (variant === 'landing') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative mb-8 overflow-hidden border-y border-primary/15 bg-gradient-to-r from-primary/10 via-transparent to-tertiary/10"
      >
        <div className="flex h-11 items-center">
          <div className="z-10 flex shrink-0 items-center gap-2 border-r border-primary/20 bg-surface/80 px-4 py-2 backdrop-blur-sm">
            <span className="text-xs font-bold text-primary">📢 Today&apos;s Announcements:</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="landing-marquee-track flex h-full items-center whitespace-nowrap px-4 text-[13px] font-semibold text-on-surface">
              {[...items, ...items].map((s, i) => {
                const price =
                  s.special_price != null
                    ? ` — ${formatPrice(s.special_price)}`
                    : s.discount_percentage
                      ? ` — ${s.discount_percentage}% OFF`
                      : '';
                return (
                  <span key={`${s.id}-${i}`} className="inline-flex items-center">
                    {i > 0 && <span className="landing-marquee-dot mx-4 text-primary">•</span>}
                    🍽️ {s.cafeteria_name || 'Cafeteria'} — {s.title}
                    {price}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const plainLine = items
    .map((s) => {
      const price =
        s.special_price != null
          ? ` — ${formatPrice(s.special_price)}`
          : s.discount_percentage
            ? ` — ${s.discount_percentage}% OFF`
            : '';
      return `${s.cafeteria_name || 'Cafeteria'}: ${s.title}${price}`;
    })
    .join('   •   ');

  const plainDoubled = `${plainLine}   •   ${plainLine}`;

  return (
    <div className="w-full h-10 overflow-hidden bg-primary/10 border-y border-primary/20 relative">
      <div className="specials-marquee-track whitespace-nowrap flex items-center h-full text-sm font-medium text-[#E3E0F8]">
        <span className="px-4">{plainDoubled}</span>
      </div>
      <style>{`
        .specials-marquee-track {
          animation: specials-marquee 40s linear infinite;
          width: max-content;
        }
        .specials-marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes specials-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
