export default function NotificationSkeleton({ rows = 3 }) {
  return (
    <div className="p-2 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg bg-[#38374A]/30 h-16 border border-[#594139]/10"
        />
      ))}
    </div>
  );
}
