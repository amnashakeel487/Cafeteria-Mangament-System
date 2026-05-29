import { useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatPrice } from '../../utils/currency';

const COLORS = ['#06d6c7', '#FF6B35', '#59d5fb', '#a78bfa', '#fbbf24', '#f472b6'];

export default function CategoryBreakdownChart({ data, loading }) {
  const [view, setView] = useState('donut');
  const categories = data?.categories || [];
  const totalRevenue = data?.totalRevenue || 0;

  if (loading) {
    return <div className="h-64 bg-surface-container-highest rounded-xl animate-pulse" />;
  }

  if (!categories.length) {
    return <p className="text-sm text-on-surface-variant text-center py-8">No category data.</p>;
  }

  const pieData = categories.map((c, i) => ({
    name: c.categoryName,
    value: c.totalRevenue,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['donut', 'bars'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${
              view === v ? 'bg-tertiary/20 text-tertiary' : 'text-on-surface-variant'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="h-56 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'donut' ? (
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1E1E2F', borderRadius: 8 }}
                formatter={(v) => formatPrice(v)}
              />
            </PieChart>
          ) : (
            <BarChart data={categories} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="categoryName" width={80} tick={{ fill: '#e1bfb5', fontSize: 10 }} />
              <Tooltip formatter={(v) => formatPrice(v)} />
              <Bar dataKey="totalRevenue" radius={[0, 4, 4, 0]}>
                {categories.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
        {view === 'donut' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-[10px] text-on-surface-variant uppercase">Total</p>
              <p className="text-sm font-bold text-on-surface">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-on-surface-variant/70 text-left border-b border-outline-variant/10">
              <th className="py-2">Category</th>
              <th className="py-2">Items</th>
              <th className="py-2">Revenue</th>
              <th className="py-2">%</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={c.categoryName} className="border-b border-outline-variant/5">
                <td className="py-2 font-medium text-on-surface">
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: COLORS[i % COLORS.length] }} />
                  {c.categoryName}
                </td>
                <td className="py-2 text-on-surface-variant">{c.totalItemsSold}</td>
                <td className="py-2 text-on-surface">{formatPrice(c.totalRevenue)}</td>
                <td className="py-2 text-on-surface-variant">{c.percentageOfRevenue}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
