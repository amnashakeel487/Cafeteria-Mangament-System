import { Area, AreaChart, ResponsiveContainer } from 'recharts';

export default function MiniSparkline({ data = [], color = '#06d6c7' }) {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data}>
        <Area type="monotone" dataKey="revenue" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
