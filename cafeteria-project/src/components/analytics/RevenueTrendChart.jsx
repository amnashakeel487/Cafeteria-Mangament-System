import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatPrice } from '../../utils/currency';

const PERIODS = [
  { id: '30days', label: '30D' },
  { id: '90days', label: '90D' },
  { id: '6months', label: '6M' },
  { id: 'year', label: '1Y' },
];

export default function RevenueTrendChart({ data, loading, period, onPeriodChange }) {
  const trend = data?.trend || [];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPeriodChange?.(p.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold ${
              period === p.id ? 'bg-[#06d6c7]/20 text-[#06d6c7]' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 bg-surface-container-highest rounded-xl animate-pulse" />
      ) : !trend.length ? (
        <p className="text-sm text-on-surface-variant text-center py-12">No revenue trend data.</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06d6c7" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#06d6c7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: '#e1bfb5', fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#e1bfb5', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1E1E2F', borderRadius: 8 }}
                formatter={(v, name) =>
                  name === 'revenue' ? [formatPrice(v), 'Revenue'] : [v, 'Orders']
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#06d6c7"
                fill="url(#revGrad)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
