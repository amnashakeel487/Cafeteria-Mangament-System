import { formatPrice } from '../../utils/currency';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function BestSellingChart({ data = [], loading }) {
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 bg-surface-container-highest rounded" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return <p className="text-sm text-on-surface-variant py-8 text-center">No sales data for this period.</p>;
  }

  const maxQty = Math.max(...data.map((item) => item.totalQuantity || 0), 1);

  return (
    <div className="space-y-6">
      <ul className="space-y-4">
        {data.map((item) => {
          const pct = ((item.totalQuantity || 0) / maxQty) * 100;
          return (
            <li key={item.menuItemId || item.name}>
              <div className="flex justify-between gap-2 text-sm mb-1.5">
                <span className="font-bold text-on-surface truncate" title={item.name}>
                  {item.name}
                </span>
                <span className="text-on-surface-variant shrink-0">
                  {item.totalQuantity} · {formatPrice(item.totalRevenue)}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-surface-container-lowest overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#06d6c7] to-[#59d5fb] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant mt-0.5">{item.percentageOfTotal}% of sales</p>
            </li>
          );
        })}
      </ul>
      <ul className="space-y-2">
        {data.slice(0, 3).map((item, i) => (
          <li
            key={`medal-${item.menuItemId || item.name}`}
            className="flex items-center justify-between text-sm bg-surface-container-lowest/50 rounded-lg px-3 py-2"
          >
            <span className="font-bold text-on-surface">
              {MEDALS[i]} {item.name}
            </span>
            <span className="text-on-surface-variant">
              {item.totalQuantity} · {formatPrice(item.totalRevenue)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
