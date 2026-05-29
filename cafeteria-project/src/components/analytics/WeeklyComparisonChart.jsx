import { formatPrice } from '../../utils/currency';

export default function WeeklyComparisonChart({ data, loading }) {
  if (loading) {
    return <div className="h-72 bg-surface-container-highest rounded-xl animate-pulse" />;
  }

  if (!data?.thisWeek?.days?.length) {
    return <p className="text-sm text-on-surface-variant text-center py-8">Not enough data for weekly comparison.</p>;
  }

  const chartData = data.thisWeek.days.map((d, i) => ({
    day: d.day,
    thisWeek: data.thisWeek.days[i]?.revenue || 0,
    lastWeek: data.lastWeek.days[i]?.revenue || 0,
  }));

  const maxRev = Math.max(...chartData.flatMap((d) => [d.thisWeek, d.lastWeek]), 1);
  const comp = data.comparison || {};
  const revGrowth = comp.revenueGrowth ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <div>
          <p className="text-on-surface-variant text-xs uppercase tracking-widest">This week</p>
          <p className="font-bold text-on-surface">{formatPrice(data.thisWeek.total_revenue)}</p>
        </div>
        <div>
          <p className="text-on-surface-variant text-xs uppercase tracking-widest">Last week</p>
          <p className="font-bold text-on-surface">{formatPrice(data.lastWeek.total_revenue)}</p>
        </div>
        <span
          className={`self-center px-3 py-1 rounded-full text-xs font-bold ${
            revGrowth >= 0 ? 'bg-[#28A745]/15 text-[#6ee7b7]' : 'bg-error/15 text-error'
          }`}
        >
          {revGrowth >= 0 ? '+' : ''}
          {revGrowth}% revenue
        </span>
      </div>

      <div className="flex items-end justify-between gap-2 h-72 pt-4">
        {chartData.map((row) => (
          <div key={row.day} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div className="w-full flex items-end justify-center gap-1 h-52">
              <div
                className="w-[42%] rounded-t bg-[#06d6c7] transition-all"
                style={{ height: `${Math.max(4, (row.thisWeek / maxRev) * 100)}%` }}
                title={`This week: ${formatPrice(row.thisWeek)}`}
              />
              <div
                className="w-[42%] rounded-t bg-[#594139]/60 transition-all"
                style={{ height: `${Math.max(4, (row.lastWeek / maxRev) * 100)}%` }}
                title={`Last week: ${formatPrice(row.lastWeek)}`}
              />
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant">{row.day}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 text-xs text-on-surface-variant">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#06d6c7]" /> This week
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#594139]/60" /> Last week
        </span>
      </div>
    </div>
  );
}
