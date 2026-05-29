import { formatPrice } from '../../utils/currency';

const PERIODS = [
  { id: '30days', label: '30D' },
  { id: '90days', label: '90D' },
  { id: '6months', label: '6M' },
  { id: 'year', label: '1Y' },
];

function TrendAreaChart({ trend }) {
  const values = trend.map((d) => Number(d.revenue) || 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const width = 400;
  const height = 200;
  const pad = 4;

  const points = values.map((v, i) => {
    const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * width;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return { x, y, v, label: trend[i].label };
  });

  const linePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPoints = `0,${height} ${linePoints} ${width},${height}`;

  const labelIndices = [0, Math.floor(points.length / 2), points.length - 1].filter(
    (i, idx, arr) => arr.indexOf(i) === idx
  );

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64" preserveAspectRatio="none">
        <polygon points={areaPoints} fill="#06d6c7" fillOpacity="0.2" />
        <polyline
          points={linePoints}
          fill="none"
          stroke="#06d6c7"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#06d6c7" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-on-surface-variant mt-1 px-1">
        {labelIndices.map((i) => (
          <span key={i}>{points[i]?.label || ''}</span>
        ))}
      </div>
      <p className="text-xs text-on-surface-variant text-center mt-2">
        Peak: {formatPrice(max)} · Low: {formatPrice(min)}
      </p>
    </div>
  );
}

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
        <TrendAreaChart trend={trend} />
      )}
    </div>
  );
}
