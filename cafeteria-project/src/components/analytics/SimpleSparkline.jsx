/** Lightweight sparkline — no recharts (avoids React 19 chart runtime errors on dashboard). */
export default function SimpleSparkline({ data = [], color = '#06d6c7' }) {
  if (!data?.length) return null;

  const values = data.map((d) => Number(d.revenue) || 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const width = 120;
  const height = 40;

  const coords = values.map((v, i) => {
    const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePoints = coords.join(' ');
  const areaPoints = `0,${height} ${linePoints} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-10"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polygon points={areaPoints} fill={color} fillOpacity="0.15" />
      <polyline points={linePoints} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
