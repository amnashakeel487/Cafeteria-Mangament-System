import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import StarRating from './StarRating';
import {
  checkOrderRatings,
  submitMenuItemRating,
  submitCafeteriaReview,
} from '../../utils/ratingsApi';

const BASE = '';

export default function RateOrderModal({ isOpen, onClose, order, onSubmitSuccess }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [check, setCheck] = useState(null);
  const [itemState, setItemState] = useState({});
  const [cafeRating, setCafeRating] = useState(0);
  const [cafeText, setCafeText] = useState('');

  const orderLines = useMemo(() => {
    if (!order?.items) return [];
    const seen = new Map();
    order.items.forEach((line) => {
      const key = (line.item_name || '').trim().toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, { ...line, key });
      }
    });
    return [...seen.values()];
  }, [order]);

  useEffect(() => {
    if (!isOpen || !order) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('studentToken');
        const [checkRes, menuRes] = await Promise.all([
          checkOrderRatings(order.id),
          axios.get(`${BASE}/api/student/menu/${order.cafeteria_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (cancelled) return;

        const items = menuRes.data?.items || [];
        setMenuItems(items);
        setCheck(checkRes);

        const ratedMap = {};
        (checkRes.itemRatings || []).forEach((r) => {
          ratedMap[r.menu_item_id] = { rating: r.rating, review_text: r.review_text || '' };
        });

        const initial = {};
        orderLines.forEach((line) => {
          const match = items.find(
            (m) => (m.name || '').trim().toLowerCase() === (line.item_name || '').trim().toLowerCase()
          );
          if (!match) return;
          const existing = ratedMap[match.id];
          initial[match.id] = {
            menuItemId: match.id,
            name: match.name,
            quantity: line.quantity,
            image_url: match.image_url,
            rating: existing?.rating || 0,
            reviewText: existing?.review_text || '',
            alreadyRated: !!existing,
          };
        });
        setItemState(initial);

        if (checkRes.cafeteriaReview) {
          setCafeRating(checkRes.cafeteriaReview.rating);
          setCafeText(checkRes.cafeteriaReview.review_text || '');
        } else {
          setCafeRating(0);
          setCafeText('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load rating form');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, order, orderLines]);

  if (!isOpen || !order) return null;

  const cafeteriaReviewed = check?.cafeteriaReviewed;
  const rateableItems = Object.values(itemState);
  const hasNewItemRating = rateableItems.some(
    (i) => !i.alreadyRated && i.rating >= 1
  );
  const hasNewCafeReview =
    !cafeteriaReviewed && cafeRating >= 1 && cafeText.trim().length >= 10;
  const canSubmit = hasNewItemRating || hasNewCafeReview;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const tasks = [];

    rateableItems.forEach((item) => {
      if (!item.alreadyRated && item.rating >= 1) {
        tasks.push(
          submitMenuItemRating({
            menuItemId: item.menuItemId,
            orderId: order.id,
            cafeteriaId: String(order.cafeteria_id),
            rating: item.rating,
            reviewText: item.reviewText?.trim() || undefined,
          })
        );
      }
    });

    if (!cafeteriaReviewed && cafeRating >= 1 && cafeText.trim().length >= 10) {
      tasks.push(
        submitCafeteriaReview({
          cafeteriaId: String(order.cafeteria_id),
          orderId: order.id,
          rating: cafeRating,
          reviewText: cafeText.trim(),
        })
      );
    }

    if (!tasks.length) {
      setError('Add at least one new rating or review');
      setSubmitting(false);
      return;
    }

    try {
      const results = await Promise.allSettled(tasks);
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length === results.length) {
        const msg =
          failed[0].reason?.response?.data?.message || 'Failed to submit reviews';
        setError(msg);
        return;
      }
      if (failed.length) {
        setError('Some ratings could not be saved. Please try again.');
      }
      onSubmitSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit reviews');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0c0c1d]/80 backdrop-blur-sm">
      <div className="bg-[#1E1E2F] w-full sm:max-w-lg max-h-[92vh] sm:rounded-3xl rounded-t-3xl border border-[#594139]/20 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[#594139]/20 shrink-0">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#E3E0F8] font-['Manrope']">Rate Your Order</h2>
              <p className="text-sm text-[#e1bfb5] mt-1">
                Order #{order.id} from {order.cafeteria_name || 'Cafeteria'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#e1bfb5] hover:bg-[#38374a]"
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="material-symbols-outlined animate-spin text-3xl text-[#FFB59D]">
                refresh
              </span>
            </div>
          ) : (
            <>
              {error && (
                <p className="text-sm text-[#ffb4ab] bg-[#93000a]/20 p-3 rounded-lg border border-[#93000a]/40">
                  {error}
                </p>
              )}

              <section>
                <h3 className="text-sm font-bold text-[#FFB59D] uppercase tracking-wider mb-4">
                  How were the items?
                </h3>
                {rateableItems.length === 0 ? (
                  <p className="text-sm text-[#9ca3af]">
                    No menu items matched this order for rating.
                  </p>
                ) : (
                  <ul className="space-y-5">
                    {rateableItems.map((item) => (
                      <li
                        key={item.menuItemId}
                        className="rounded-xl border border-[#594139]/20 p-4 bg-[#121222]/50"
                      >
                        <div className="flex gap-3 mb-3">
                          <div className="w-12 h-12 rounded-lg bg-[#38374a] flex items-center justify-center text-2xl shrink-0">
                            🍽️
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#E3E0F8] truncate">{item.name}</p>
                            <p className="text-xs text-[#9ca3af]">Qty: {item.quantity}</p>
                          </div>
                          {item.alreadyRated && (
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 h-fit">
                              Already rated
                            </span>
                          )}
                        </div>
                        <StarRating
                          value={item.rating}
                          onChange={(v) =>
                            setItemState((prev) => ({
                              ...prev,
                              [item.menuItemId]: { ...prev[item.menuItemId], rating: v },
                            }))
                          }
                          disabled={item.alreadyRated}
                          size="md"
                        />
                        {!item.alreadyRated && (
                          <textarea
                            value={item.reviewText}
                            onChange={(e) =>
                              setItemState((prev) => ({
                                ...prev,
                                [item.menuItemId]: {
                                  ...prev[item.menuItemId],
                                  reviewText: e.target.value,
                                },
                              }))
                            }
                            rows={2}
                            placeholder="Share your thoughts about this item..."
                            className="mt-3 w-full rounded-lg bg-[#121222] border border-[#594139]/30 text-sm text-[#E3E0F8] p-3 resize-none focus:outline-none focus:border-[#FF6B35]/50"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h3 className="text-sm font-bold text-[#FFB59D] uppercase tracking-wider mb-4">
                  How was your overall experience?
                </h3>
                {cafeteriaReviewed ? (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    Already reviewed
                  </div>
                ) : (
                  <>
                    <StarRating
                      value={cafeRating}
                      onChange={setCafeRating}
                      size="lg"
                      label="Overall rating"
                    />
                    <textarea
                      value={cafeText}
                      onChange={(e) => setCafeText(e.target.value)}
                      rows={4}
                      maxLength={500}
                      placeholder="Tell others about the service, wait time, and overall experience..."
                      className="mt-4 w-full rounded-lg bg-[#121222] border border-[#594139]/30 text-sm text-[#E3E0F8] p-3 resize-none focus:outline-none focus:border-[#FF6B35]/50"
                    />
                    <p className="text-xs text-[#9ca3af] mt-1">
                      {cafeText.length}/500 (min 10 characters)
                    </p>
                  </>
                )}
              </section>
            </>
          )}
        </div>

        <div className="p-6 border-t border-[#594139]/20 flex flex-col gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-[#594139]/40 text-[#e1bfb5] text-sm font-bold hover:bg-[#38374a]/50"
          >
            Skip for now
          </button>
          <button
            type="button"
            disabled={!canSubmit || submitting || loading}
            onClick={handleSubmit}
            className="w-full py-3 rounded-lg bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                Submitting...
              </>
            ) : (
              'Submit Reviews'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
