import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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

  const chartData = data.map((item) => ({
    ...item,
    shortName: (item.name || '').length > 20 ? `${item.name.slice(0, 18)}…` : item.name,
  }));

  return (
    <div className="space-y-6">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="shortName" width={100} tick={{ fill: '#e1bfb5', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: '#1E1E2F',
                border: '1px solid rgba(89,65,57,0.3)',
                borderRadius: 8,
              }}
              formatter={(value, _name, props) => [
                `${value} sold · ${formatPrice(props.payload.totalRevenue)} (${props.payload.percentageOfTotal}%)`,
                props.payload.name,
              ]}
            />
            <Bar dataKey="totalQuantity" fill="#06d6c7" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2">
        {data.slice(0, 3).map((item, i) => (
          <li
            key={item.menuItemId || item.name}
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
