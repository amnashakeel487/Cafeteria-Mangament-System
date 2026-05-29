import { formatPrice } from '../../utils/currency';

export default function SpecialsMarquee({ specials = [] }) {
  const items = specials.filter(
    (s) => s.special_type === 'announcement' || s.special_type === 'special'
  );
  if (!items.length) return null;

  const line = items
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

  const doubled = `${line}   •   ${line}`;

  return (
    <div className="w-full h-10 overflow-hidden bg-primary/10 border-y border-primary/20 relative">
      <div className="specials-marquee-track whitespace-nowrap flex items-center h-full text-sm font-medium text-[#E3E0F8]">
        <span className="px-4">{doubled}</span>
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
