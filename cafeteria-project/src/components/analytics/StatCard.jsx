import { formatPrice } from '../../utils/currency';

const ACCENT = {
  cyan: {
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    glow: 'group-hover:shadow-cyan-500/5',
  },
  blue: {
    border: 'border-sky-500/20',
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-400',
    glow: 'group-hover:shadow-sky-500/5',
  },
  purple: {
    border: 'border-violet-500/20',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    glow: 'group-hover:shadow-violet-500/5',
  },
  amber: {
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    glow: 'group-hover:shadow-amber-500/5',
  },
  primary: {
    border: 'border-primary/25',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    glow: 'group-hover:shadow-primary/10',
  },
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
  const accent = ACCENT[color] || ACCENT.cyan;

  if (loading) {
    return (
      <div className="min-h-[148px] rounded-2xl border border-outline-variant/10 bg-surface-container-high p-5 sm:p-6 animate-pulse">
        <div className="h-3 w-28 bg-surface-container-highest rounded mb-5" />
        <div className="h-9 w-36 bg-surface-container-highest rounded mb-4" />
        <div className="h-3 w-24 bg-surface-container-highest rounded" />
      </div>
    );
  }

  const displayValue = isCurrency ? formatPrice(value) : value;
  const trendUp = typeof trendValue === 'number' && trendValue > 0;
  const trendDown = typeof trendValue === 'number' && trendValue < 0;

  return (
    <div
      className={`group relative flex min-h-[148px] flex-col rounded-2xl border bg-surface-container-high p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${accent.border} ${accent.glow}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant leading-snug pr-2">
          {title}
        </p>
        {icon && (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.iconBg}`}
          >
            <span className={`material-symbols-outlined text-xl ${accent.iconColor}`}>{icon}</span>
          </span>
        )}
      </div>

      <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-on-surface sm:text-[1.75rem] font-['Manrope']">
        {displayValue}
      </h3>

      {trend && (
        <p
          className={`mt-2 text-xs font-semibold flex items-center gap-1 ${
            trendUp ? 'text-emerald-400' : trendDown ? 'text-error' : 'text-on-surface-variant'
          }`}
        >
          {trendUp && <span aria-hidden>↑</span>}
          {trendDown && <span aria-hidden>↓</span>}
          {!trendUp && !trendDown && <span aria-hidden>—</span>}
          {trend}
        </p>
      )}

      {subtitle && !trend && (
        <p className="mt-2 text-xs font-medium text-on-surface-variant">{subtitle}</p>
      )}
      {subtitle && trend && (
        <p className="mt-0.5 text-xs text-on-surface-variant/80">{subtitle}</p>
      )}

      {sparkline && (
        <div className="mt-auto pt-4 h-10 w-full overflow-hidden rounded-lg opacity-90">
          {sparkline}
        </div>
      )}
    </div>
  );
}
