import { useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatPrice } from '../../utils/currency';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Heatmap({ byDayAndHour, peakHour }) {
  const max = Math.max(1, ...byDayAndHour.map((c) => c.orderCount));

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `48px repeat(7, minmax(28px, 1fr))` }}>
        <div />
        {DAYS.map((d) => (
          <div key={d} className="text-[10px] text-center text-on-surface-variant font-bold">
            {d}
          </div>
        ))}
        {Array.from({ length: 24 }, (_, hour) => [
          <div key={`label-${hour}`} className="text-[9px] text-on-surface-variant pr-1 text-right self-center">
            {hour % 6 === 0 ? (hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`) : ''}
          </div>,
          ...DAYS.map((day) => {
            const cell = byDayAndHour.find((c) => c.day === day && c.hour === hour);
            const count = cell?.orderCount || 0;
            const intensity = count / max;
            const isPeak = peakHour?.hour === hour;
            return (
              <div
                key={`${day}-${hour}`}
                title={`${day} ${hour}:00 — ${count} orders`}
                className={`h-5 rounded-sm border ${isPeak && count > 0 ? 'border-[#06d6c7]' : 'border-transparent'}`}
                style={{
                  backgroundColor: `rgba(6, 214, 199, ${0.08 + intensity * 0.85})`,
                }}
              />
            );
          }),
        ])}
      </div>
      <p className="text-[10px] text-on-surface-variant mt-2">Darker = more orders</p>
    </div>
  );
}

export default function PeakHoursChart({ data, loading }) {
  const [tab, setTab] = useState('hourly');

  if (loading) {
    return <div className="h-64 bg-surface-container-highest rounded-xl animate-pulse" />;
  }

  if (!data?.hourly?.length) {
    return <p className="text-sm text-on-surface-variant text-center py-8">No peak hour data yet.</p>;
  }

  const peak = data.peakHour?.hour ?? 0;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {[
          { id: 'hourly', label: 'By Hour' },
          { id: 'heatmap', label: 'Heatmap' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold ${
              tab === t.id ? 'bg-primary/20 text-primary' : 'text-on-surface-variant'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'hourly' ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.hourly}>
              <XAxis dataKey="label" tick={{ fill: '#e1bfb5', fontSize: 9 }} interval={2} />
              <YAxis tick={{ fill: '#e1bfb5', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1E1E2F', borderRadius: 8 }}
                formatter={(v, _n, p) => [`${v} orders · ${formatPrice(p.payload.revenue)}`, p.payload.label]}
              />
              <ReferenceLine x={data.hourly[peak]?.label} stroke="#06d6c7" strokeDasharray="4 4" />
              <Bar dataKey="orderCount" radius={[4, 4, 0, 0]}>
                {data.hourly.map((entry, index) => (
                  <Cell key={entry.label} fill={index === peak ? '#06d6c7' : 'rgba(6,214,199,0.35)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <Heatmap byDayAndHour={data.byDayAndHour || []} peakHour={data.peakHour} />
      )}
    </div>
  );
}
