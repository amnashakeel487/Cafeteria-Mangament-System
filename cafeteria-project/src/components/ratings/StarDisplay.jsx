const SIZES = { xs: 12, sm: 16, md: 20, lg: 24 };

function starState(index, rating) {
  const i = index + 1;
  if (rating >= i) return 'full';
  if (rating >= i - 0.5) return 'half';
  return 'empty';
}

export default function StarDisplay({
  rating = 0,
  count,
  size = 'sm',
  showCount = false,
  colorClass = 'text-amber-400',
}) {
  const px = SIZES[size] || SIZES.sm;
  const num = Number(rating) || 0;

  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      <div className="inline-flex items-center" aria-label={`${num.toFixed(1)} out of 5 stars`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const state = starState(i, num);
          const filled = state === 'full';
          const half = state === 'half';
          return (
            <span key={i} className="relative inline-flex" style={{ width: px, height: px }}>
              <span
                className="material-symbols-outlined absolute text-[#4b5563]"
                style={{ fontSize: px, fontVariationSettings: "'FILL' 0" }}
              >
                star
              </span>
              {(filled || half) && (
                <span
                  className={`material-symbols-outlined absolute ${colorClass} overflow-hidden`}
                  style={{
                    fontSize: px,
                    fontVariationSettings: "'FILL' 1",
                    width: half ? `${px / 2}px` : px,
                  }}
                >
                  star
                </span>
              )}
            </span>
          );
        })}
      </div>
      <span className={`text-xs font-medium ${colorClass}`}>
        {num > 0 ? num.toFixed(1) : ''}
        {showCount && count != null && (
          <span className="text-[#9ca3af] font-normal ml-1">
            ({count} review{count === 1 ? '' : 's'})
          </span>
        )}
      </span>
    </div>
  );
}

export function ratingColorClass(avg) {
  const n = Number(avg) || 0;
  if (n >= 4) return 'text-green-400';
  if (n >= 2.5) return 'text-amber-400';
  if (n > 0) return 'text-red-400';
  return 'text-[#6b7280]';
}
