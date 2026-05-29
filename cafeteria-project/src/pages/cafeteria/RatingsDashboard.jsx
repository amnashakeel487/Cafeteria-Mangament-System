import { useState, useEffect } from 'react';
import axios from 'axios';
import PageSEO from '../../seo/PageSEO';
import { PAGE_SEO } from '../../seo/siteConfig';
import StarDisplay, { ratingColorClass } from '../../components/ratings/StarDisplay';
import ReviewCard from '../../components/ratings/ReviewCard';
import ReviewsDrawer from '../../components/ratings/ReviewsDrawer';
import { getCafeteriaHeaders } from '../../utils/ratingsApi';

const BASE = '';

export default function RatingsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('items');
  const [sort, setSort] = useState('highest');
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: '' }), 4000);
  };

  const load = async () => {
    try {
      const res = await axios.get(`${BASE}/api/ratings/my-menu-items`, {
        headers: getCafeteriaHeaders(),
      });
      setData(res.data);
    } catch {
      showToast('Failed to load ratings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReply = async (reviewId, replyText) => {
    try {
      await axios.post(
        `${BASE}/api/ratings/cafeteria-reply/${reviewId}`,
        { replyText },
        { headers: getCafeteriaHeaders() }
      );
      showToast('Reply posted');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post reply', 'error');
      throw err;
    }
  };

  const summary = data?.summary || {};
  const menuItems = data?.menuItems || [];
  let sortedItems = [...menuItems];
  if (sort === 'highest') sortedItems.sort((a, b) => Number(b.avg_rating) - Number(a.avg_rating));
  if (sort === 'lowest') sortedItems.sort((a, b) => Number(a.avg_rating) - Number(b.avg_rating));
  if (sort === 'most') sortedItems.sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0));

  const cafeReviews = (data?.cafeteriaReviews || []).filter((r) => {
    if (filter === 'replied') return !!r.cafeteria_reply;
    if (filter === 'needs') return !r.cafeteria_reply;
    return true;
  });

  const topLoved = [...menuItems]
    .filter((i) => (i.rating_count || 0) > 0)
    .sort((a, b) => Number(b.avg_rating) - Number(a.avg_rating))
    .slice(0, 3);
  const needsAttention = menuItems.filter(
    (i) => (i.rating_count || 0) > 0 && Number(i.avg_rating) < 3
  );

  const wordCloud = () => {
    const words = {};
    const stop = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'was', 'it', 'to', 'for', 'of', 'in', 'on', 'at', 'with', 'this', 'that', 'very', 'so']);
    cafeReviews.forEach((r) => {
      (r.review_text || '')
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !stop.has(w))
        .forEach((w) => {
          words[w] = (words[w] || 0) + 1;
        });
    });
    return Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  };

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
      </div>
    );
  }

  return (
    <>
      <PageSEO title="Ratings & Reviews" description="Manage student ratings" />
      {toast.visible && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg text-sm font-bold shadow-lg ${
            toast.type === 'error' ? 'bg-[#93000a] text-[#ffb4ab]' : 'bg-[#28A745] text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      <section className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold text-on-surface font-['Manrope']">Ratings & Reviews</h1>
          <p className="text-on-surface-variant text-sm mt-1">See what students think about your menu and service.</p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Overall Rating', value: Number(summary.avg_rating || 0).toFixed(1), icon: 'star' },
            { label: 'Total Reviews', value: summary.totalReviews || 0, icon: 'rate_review' },
            { label: 'Items Rated', value: summary.itemsRated || 0, icon: 'restaurant' },
            {
              label: 'Best Item',
              value: summary.bestItem?.name || '—',
              icon: 'emoji_events',
              small: true,
            },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-surface-container-high rounded-2xl p-5 border border-outline-variant/10"
            >
              <span className="material-symbols-outlined text-primary mb-2">{c.icon}</span>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider">{c.label}</p>
              <p
                className={`font-black text-on-surface mt-1 ${c.small ? 'text-sm line-clamp-2' : 'text-2xl'}`}
              >
                {c.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap border-b border-outline-variant/15 pb-2">
          {[
            { id: 'items', label: 'Menu Item Ratings' },
            { id: 'cafeteria', label: 'Cafeteria Reviews' },
            { id: 'insights', label: 'Insights' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                tab === t.id
                  ? 'bg-primary/20 text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'items' && (
          <div className="space-y-4">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-surface-container-high border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface"
            >
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="most">Most Reviewed</option>
            </select>
            <ul className="space-y-2">
              {sortedItems.map((item) => (
                <li
                  key={item.id}
                  className="bg-surface-container-high rounded-xl border border-outline-variant/10 overflow-hidden"
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-container-highest/50"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <span className="font-semibold text-on-surface">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <StarDisplay
                        rating={item.avg_rating}
                        count={item.rating_count}
                        showCount
                        colorClass={ratingColorClass(item.avg_rating)}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrawer({ type: 'menu-item', id: item.id, title: item.name });
                        }}
                        className="text-xs text-primary font-bold"
                      >
                        View all
                      </button>
                    </div>
                  </button>
                  {expandedId === item.id && item.recent_reviews?.length > 0 && (
                    <div className="px-4 pb-4 space-y-3 border-t border-outline-variant/10 pt-3">
                      {item.recent_reviews.slice(0, 5).map((r) => (
                        <ReviewCard key={r.id} review={r} showReply={false} />
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'cafeteria' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {['all', 'replied', 'needs'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${
                    filter === f ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  {f === 'needs' ? 'Needs Reply' : f}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {cafeReviews.map((r) => (
                <div key={r.id} className="relative">
                  {!r.cafeteria_reply && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Needs Reply
                    </span>
                  )}
                  <ReviewCard review={r} onReply={handleReply} />
                </div>
              ))}
              {!cafeReviews.length && (
                <p className="text-on-surface-variant text-sm text-center py-8">No reviews yet.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'insights' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10">
              <h3 className="font-bold text-on-surface mb-4">Most loved items</h3>
              <ul className="space-y-3">
                {topLoved.map((i) => (
                  <li key={i.id} className="flex justify-between items-center">
                    <span className="text-sm text-on-surface">{i.name}</span>
                    <StarDisplay rating={i.avg_rating} size="sm" colorClass={ratingColorClass(i.avg_rating)} />
                  </li>
                ))}
                {!topLoved.length && <p className="text-sm text-on-surface-variant">No rated items yet.</p>}
              </ul>
            </div>
            <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10">
              <h3 className="font-bold text-on-surface mb-4">Needs attention (&lt; 3.0)</h3>
              <ul className="space-y-2">
                {needsAttention.map((i) => (
                  <li key={i.id} className="text-sm text-red-400 flex justify-between">
                    <span>{i.name}</span>
                    <span>{Number(i.avg_rating).toFixed(1)}★</span>
                  </li>
                ))}
                {!needsAttention.length && (
                  <p className="text-sm text-on-surface-variant">All items are doing well.</p>
                )}
              </ul>
            </div>
            <div className="md:col-span-2 bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10">
              <h3 className="font-bold text-on-surface mb-4">Common words in reviews</h3>
              <div className="flex flex-wrap gap-2">
                {wordCloud().map(([word, count]) => (
                  <span
                    key={word}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                    style={{ fontSize: `${12 + Math.min(count, 8)}px` }}
                  >
                    {word} ({count})
                  </span>
                ))}
                {!wordCloud().length && (
                  <p className="text-sm text-on-surface-variant">Not enough review text yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <ReviewsDrawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        type={drawer?.type}
        targetId={drawer?.id}
        title={drawer?.title}
      />
    </>
  );
}
