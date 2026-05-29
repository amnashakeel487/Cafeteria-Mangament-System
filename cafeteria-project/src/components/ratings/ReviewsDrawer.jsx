import { useState, useEffect } from 'react';
import StarDisplay from './StarDisplay';
import RatingDistribution from './RatingDistribution';
import ReviewCard from './ReviewCard';
import { fetchMenuItemRatings, fetchCafeteriaRatings } from '../../utils/ratingsApi';

export default function ReviewsDrawer({
  open,
  onClose,
  type = 'menu-item',
  targetId,
  title,
}) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !targetId) return;
    setLoading(true);
    const fetcher =
      type === 'cafeteria'
        ? () => fetchCafeteriaRatings(targetId, page)
        : () => fetchMenuItemRatings(targetId, page);

    fetcher()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [open, targetId, type, page]);

  if (!open) return null;

  const total = data?.total || 0;
  const totalPages = Math.ceil(total / (data?.limit || 10)) || 1;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-[#0c0c1d]/70"
        onClick={onClose}
        aria-label="Close reviews"
      />
      <aside className="relative w-full max-w-md h-full bg-[#1E1E2F] border-l border-[#594139]/20 shadow-2xl flex flex-col">
        <div className="p-5 border-b border-[#594139]/20 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#E3E0F8] font-['Manrope']">{title || 'Reviews'}</h2>
            {data && (
              <StarDisplay
                rating={data.avg_rating}
                count={data.rating_count}
                showCount
                size="sm"
              />
            )}
          </div>
          <button type="button" onClick={onClose} className="p-2 text-[#e1bfb5] hover:bg-[#38374a] rounded-lg">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <span className="material-symbols-outlined animate-spin text-3xl text-[#FFB59D]">refresh</span>
            </div>
          ) : (
            <>
              {data?.distribution && (
                <RatingDistribution
                  distribution={data.distribution}
                  total={data.rating_count}
                />
              )}
              <div className="space-y-4">
                {(data?.reviews || []).map((r) => (
                  <ReviewCard key={r.id} review={r} showReply={type === 'cafeteria'} />
                ))}
                {!data?.reviews?.length && (
                  <p className="text-sm text-[#9ca3af] text-center py-8">No reviews yet.</p>
                )}
              </div>
            </>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-[#594139]/20 flex justify-between">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-sm text-[#FFB59D] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-[#9ca3af]">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm text-[#FFB59D] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
