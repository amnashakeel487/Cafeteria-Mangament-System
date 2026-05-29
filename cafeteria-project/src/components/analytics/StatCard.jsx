import { formatPrice } from '../../utils/currency';

const BORDER = {
  cyan: 'border-l-[#06d6c7]',
  blue: 'border-l-[#59d5fb]',
  purple: 'border-l-[#a78bfa]',
  amber: 'border-l-[#fbbf24]',
  primary: 'border-l-primary',
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'cyan',
  loading,
  isCurrency,
  sparkline,
}) {
  if (loading) {
    return (
      <div className="bg-surface-container-high rounded-xl p-6 border-l-4 border-l-outline-variant/20 animate-pulse">
        <div className="h-3 w-24 bg-surface-container-highest rounded mb-4" />
        <div className="h-8 w-32 bg-surface-container-highest rounded mb-3" />
        <div className="h-3 w-20 bg-surface-container-highest rounded" />
      </div>
    );
  }

  const displayValue = isCurrency ? formatPrice(value) : value;
  const trendUp = typeof trendValue === 'number' && trendValue > 0;
  const trendDown = typeof trendValue === 'number' && trendValue < 0;

  return (
    <div
      className={`bg-surface-container-high rounded-xl p-6 border-l-4 ${BORDER[color] || BORDER.cyan} hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 relative overflow-hidden`}
    >
      {icon && (
        <span className="material-symbols-outlined absolute top-4 right-4 text-on-surface-variant/30 text-3xl">
          {icon}
        </span>
      )}
      <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl md:text-3xl font-extrabold text-on-surface font-['Manrope']">{displayValue}</h3>
      {trend && (
        <p
          className={`text-xs font-bold mt-2 flex items-center gap-1 ${
            trendUp ? 'text-[#6ee7b7]' : trendDown ? 'text-error' : 'text-on-surface-variant'
          }`}
        >
          {trendUp && <span>↑</span>}
          {trendDown && <span>↓</span>}
          {!trendUp && !trendDown && <span>—</span>}
          {trend}
        </p>
      )}
      {subtitle && <p className="text-xs text-on-surface-variant mt-1">{subtitle}</p>}
      {sparkline && <div className="mt-3 h-10">{sparkline}</div>}
    </div>
  );
}
