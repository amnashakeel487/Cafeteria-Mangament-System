import { useState, useCallback } from 'react';

const SIZES = { sm: 16, md: 24, lg: 32 };

export default function StarRating({
  value = 0,
  onChange,
  size = 'md',
  disabled = false,
  label,
}) {
  const [hover, setHover] = useState(0);
  const px = SIZES[size] || SIZES.md;
  const display = hover || value;

  const setStars = useCallback(
    (n) => {
      if (disabled || !onChange) return;
      onChange(n);
    },
    [disabled, onChange]
  );

  const onKeyDown = (e) => {
    if (disabled || !onChange) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(5, (value || 0) + 1));
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(1, (value || 1) - 1));
    }
  };

  return (
    <div className="inline-flex flex-col gap-1">
      {label && (
        <span className="text-xs font-medium text-[#e1bfb5]">{label}</span>
      )}
      <div
        className="inline-flex items-center gap-1"
        role="slider"
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={value || 0}
        aria-label={label || 'Rating'}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={onKeyDown}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= display;
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              className={`p-0.5 transition-colors duration-200 ${
                disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-110'
              }`}
              onMouseEnter={() => !disabled && setHover(star)}
              onMouseLeave={() => !disabled && setHover(0)}
              onClick={() => setStars(star)}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              <span
                className="material-symbols-outlined transition-colors duration-200"
                style={{
                  fontSize: px,
                  fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
                  color: filled ? '#fbbf24' : '#6b7280',
                }}
              >
                star
              </span>
            </button>
          );
        })}
        {value > 0 && (
          <span className="text-sm font-semibold text-amber-400 ml-1 tabular-nums">
            {value}.0
          </span>
        )}
      </div>
    </div>
  );
}
