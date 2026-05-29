import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageSEO from '../seo/PageSEO';
import { fetchAllToday, fetchTodaySpecials } from '../utils/specialsApi';
import SpecialCard from '../components/specials/SpecialCard';
import SpecialsMarquee from '../components/specials/SpecialsMarquee';

const TYPE_FILTERS = [
  { id: '', label: 'All' },
  { id: 'special', label: '⭐ Specials' },
  { id: 'discount', label: '🏷️ Discounts' },
  { id: 'announcement', label: '📢 Announcements' },
  { id: 'new_item', label: '🆕 New Items' },
  { id: 'limited_time', label: '⏰ Limited Time' },
];

export default function SpecialsPage() {
  const [specials, setSpecials] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [type, setType] = useState('');
  const [cafeteriaId, setCafeteriaId] = useState('');
  const [sort, setSort] = useState('featured');
  const [cafeterias, setCafeterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const data = await fetchAllToday({
        page: pageNum,
        limit: 12,
        type: type || undefined,
        cafeteriaId: cafeteriaId || undefined,
        sort,
      });
      setSpecials((prev) => (append ? [...prev, ...data.specials] : data.specials));
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch {
      if (!append) setSpecials([]);
    } finally {
      setLoading(false);
    }
  }, [type, cafeteriaId, sort]);

  useEffect(() => {
    load(1, false);
  }, [load, refreshKey]);

  useEffect(() => {
    fetchTodaySpecials({ limit: 100 })
      .then((rows) => {
        const map = new Map();
        rows.forEach((s) => {
          if (s.cafeteria_id) map.set(String(s.cafeteria_id), s.cafeteria_name);
        });
        setCafeterias([...map.entries()].map(([id, name]) => ({ id, name })));
      })
      .catch(() => setCafeterias([]));
  }, []);

  const cafeteriaCount = new Set(specials.map((s) => s.cafeteria_id)).size;

  return (
    <>
      <PageSEO
        title="All Specials Today"
        description="Browse today's cafeteria specials, discounts, and announcements across campus."
        path="/specials"
      />
      <div className="min-h-screen bg-[#121222] text-[#E3E0F8] font-['Inter']">
        <SpecialsMarquee specials={specials.filter((s) => s.special_type === 'announcement')} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link to="/" className="text-sm text-[#FFB59D] hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-black font-['Manrope']">All Specials Today</h1>
              <p className="text-[#e1bfb5] text-sm mt-1">
                {total} specials across {cafeteriaCount || '—'} cafeterias
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              className="text-sm font-bold text-[#FFB59D] border border-[#594139]/30 px-4 py-2 rounded-lg"
            >
              Refresh
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setType(f.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    type === f.id ? 'bg-[#FF6B35] text-[#5d1900]' : 'bg-[#28283a] text-[#e1bfb5]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 lg:ml-auto">
              <select
                value={cafeteriaId}
                onChange={(e) => setCafeteriaId(e.target.value)}
                className="bg-[#28283a] border border-[#594139]/30 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All cafeterias</option>
                {cafeterias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-[#28283a] border border-[#594139]/30 rounded-lg px-3 py-2 text-sm"
              >
                <option value="featured">Featured First</option>
                <option value="newest">Newest</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>

          {loading && !specials.length ? (
            <div className="py-20 text-center text-[#e1bfb5]">Loading specials...</div>
          ) : !specials.length ? (
            <div className="py-20 text-center text-[#e1bfb5]">
              No {type ? TYPE_FILTERS.find((f) => f.id === type)?.label : ''} specials today.
            </div>
          ) : (
            <>
              <p className="text-xs text-[#e1bfb5] mb-4">
                Showing {specials.length} of {total} specials
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {specials.map((s) => (
                  <SpecialCard key={s.id} special={s} showCafeteriaName publicView />
                ))}
              </div>
              {page < totalPages && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => load(page + 1, true)}
                    className="px-8 py-3 rounded-lg font-bold bg-[#28283a] border border-[#594139]/30 hover:border-[#FFB59D]/40"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}

          <section className="mt-16 p-8 rounded-2xl bg-[#28283a] border border-[#594139]/20 text-center">
            <h2 className="text-xl font-bold mb-2">Want to order these specials?</h2>
            <p className="text-sm text-[#e1bfb5] mb-6">Sign in as a student to add items to your cart.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/student/login"
                className="px-6 py-3 rounded-lg font-bold bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900]"
              >
                Student Login
              </Link>
              <Link
                to="/student/register"
                className="px-6 py-3 rounded-lg font-bold border border-[#594139]/30 text-[#FFB59D]"
              >
                Register
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
