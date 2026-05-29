import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
    thisOrders: data.thisWeek.days[i]?.orders || 0,
    lastOrders: data.lastWeek.days[i]?.orders || 0,
  }));

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

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="day" tick={{ fill: '#e1bfb5', fontSize: 11 }} />
            <YAxis tick={{ fill: '#e1bfb5', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#1E1E2F', borderRadius: 8 }}
              formatter={(v, name) => [formatPrice(v), name === 'thisWeek' ? 'This Week' : 'Last Week']}
            />
            <Legend />
            <Bar dataKey="thisWeek" name="This Week" fill="#06d6c7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lastWeek" name="Last Week" fill="rgba(89,65,57,0.5)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
