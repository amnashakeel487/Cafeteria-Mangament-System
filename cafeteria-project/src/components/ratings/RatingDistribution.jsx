export default function RatingDistribution({ distribution = {}, total = 0 }) {
  const t = total || Object.values(distribution).reduce((s, n) => s + n, 0) || 1;

  return (
    <div className="space-y-2 w-full max-w-sm">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star] || 0;
        const pct = Math.round((count / t) * 100);
        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-6 text-[#e1bfb5] font-medium">{star}★</span>
            <div className="flex-1 h-2 rounded-full bg-[#38374a] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FFB59D] to-[#FF6B35] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-10 text-right text-[#9ca3af] tabular-nums">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}
