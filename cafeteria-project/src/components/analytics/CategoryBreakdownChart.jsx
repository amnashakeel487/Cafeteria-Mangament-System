import { useState } from 'react';
import { formatPrice } from '../../utils/currency';

const COLORS = ['#06d6c7', '#FF6B35', '#59d5fb', '#a78bfa', '#fbbf24', '#f472b6'];

function DonutChart({ categories, totalRevenue }) {
  const total = categories.reduce((s, c) => s + (c.totalRevenue || 0), 0) || 1;
  let offset = 0;
  const segments = categories.map((c, i) => {
    const pct = ((c.totalRevenue || 0) / total) * 100;
    const seg = { color: COLORS[i % COLORS.length], pct, offset };
    offset += pct;
    return seg;
  });

  const gradient = segments
    .map((s) => `${s.color} ${s.offset}% ${s.offset + s.pct}%`)
    .join(', ');

  return (
    <div className="relative w-44 h-44 mx-auto">
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `conic-gradient(${gradient})`,
        }}
      />
      <div className="absolute inset-[18%] rounded-full bg-surface-container-high flex items-center justify-center">
        <div className="text-center">
          <p className="text-[10px] text-on-surface-variant uppercase">Total</p>
          <p className="text-sm font-bold text-on-surface">{formatPrice(totalRevenue)}</p>
        </div>
      </div>
    </div>
  );
}

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

  const maxRev = Math.max(...categories.map((c) => c.totalRevenue || 0), 1);

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

      <div className="min-h-[14rem] flex items-center justify-center">
        {view === 'donut' ? (
          <DonutChart categories={categories} totalRevenue={totalRevenue} />
        ) : (
          <ul className="w-full space-y-3">
            {categories.map((c, i) => (
              <li key={c.categoryName}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-on-surface">{c.categoryName}</span>
                  <span className="text-on-surface-variant">{formatPrice(c.totalRevenue)}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${((c.totalRevenue || 0) / maxRev) * 100}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
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
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
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
