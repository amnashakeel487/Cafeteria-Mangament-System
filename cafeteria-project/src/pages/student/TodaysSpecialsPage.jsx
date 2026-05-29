import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageSEO from '../../seo/PageSEO';
import { fetchStudentTodaySpecials } from '../../utils/specialsApi';
import { useDailySpecialsRealtime } from '../../hooks/useDailySpecialsRealtime';
import SpecialCard from '../../components/specials/SpecialCard';
import SpecialsMarquee from '../../components/specials/SpecialsMarquee';

const TABS = [
  { id: '', label: 'All' },
  { id: 'discount', label: 'Discounts' },
  { id: 'special', label: 'Specials' },
  { id: 'new_item', label: 'New Items' },
  { id: 'announcement', label: 'Announcements' },
];

export default function TodaysSpecialsPage() {
  const [specials, setSpecials] = useState([]);
  const [tab, setTab] = useState('');
  const [cafeteriaFilter, setCafeteriaFilter] = useState('');
  const [grouped, setGrouped] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [dismissedAnn, setDismissedAnn] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStudentTodaySpecials({
        type: tab || undefined,
        cafeteriaId: cafeteriaFilter || undefined,
      });
      setSpecials(data || []);
    } catch {
      setSpecials([]);
    } finally {
      setLoading(false);
    }
  }, [tab, cafeteriaFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useDailySpecialsRealtime({
    onChange: (payload) => {
      const row = payload.new || payload.old;
      if (row?.is_active === false) {
        setSpecials((prev) => prev.filter((s) => s.id !== row.id));
        setToast(`"${row.title}" is no longer available`);
      } else {
        load();
        setToast(`🍽️ New special from ${payload.new?.cafeteria_id ? 'a cafeteria' : 'campus'}!`);
      }
      setTimeout(() => setToast(''), 4000);
    },
  });

  const announcements = specials.filter((s) => s.special_type === 'announcement');
  const filtered = specials.filter((s) => s.special_type !== 'announcement' || tab === 'announcement');

  const byCafe = useMemo(() => {
    const map = {};
    filtered.forEach((s) => {
      const key = s.cafeteria_id;
      if (!map[key]) map[key] = { name: s.cafeteria_name, items: [] };
      map[key].items.push(s);
    });
    return Object.entries(map);
  }, [filtered]);

  const pktDate = useMemo(() => {
    const d = new Date(Date.now() + 5 * 60 * 60 * 1000);
    return d.toLocaleDateString('en-PK', { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  return (
    <>
      <PageSEO title="Today's Specials" description="Campus cafeteria specials and announcements" />
      {toast && (
        <div className="fixed top-20 right-4 z-[80] px-4 py-3 rounded-xl bg-[#28283a] border border-[#594139]/30 shadow-xl text-sm font-bold">
          {toast}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-black font-['Manrope'] text-[#E3E0F8]">Today&apos;s Specials</h1>
        <p className="text-[#e1bfb5] text-sm mt-1">
          Fresh deals and announcements from your campus cafeterias
        </p>
        <p className="text-xs text-[#FFB59D] mt-1">{pktDate}</p>

        {!dismissedAnn && announcements.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 relative">
            <button
              type="button"
              className="absolute top-2 right-2 text-[#e1bfb5]"
              onClick={() => setDismissedAnn(true)}
            >
              ×
            </button>
            <p className="font-bold text-sky-300 mb-2">📢 Announcements</p>
            <ul className="space-y-2">
              {announcements.map((a) => (
                <li key={a.id} className="text-sm text-[#E3E0F8]">
                  <strong>{a.cafeteria_name}:</strong> {a.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        <SpecialsMarquee specials={announcements} />

        <div className="flex flex-wrap gap-2 mt-6 mb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                tab === t.id ? 'bg-[#FF6B35] text-[#5d1900]' : 'bg-[#28283a] text-[#e1bfb5]'
              }`}
            >
              {t.label}
            </button>
          ))}
          <select
            value={cafeteriaFilter}
            onChange={(e) => setCafeteriaFilter(e.target.value)}
            className="ml-auto bg-[#28283a] border border-[#594139]/30 rounded-lg px-3 py-1.5 text-xs"
          >
            <option value="">All cafeterias</option>
            {byCafe.map(([id, g]) => (
              <option key={id} value={id}>
                {g.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setGrouped((g) => !g)}
            className="text-xs font-bold text-[#FFB59D]"
          >
            {grouped ? 'Flat list' : 'Group by cafeteria'}
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#e1bfb5]">Loading...</div>
        ) : grouped ? (
          <div className="space-y-10">
            {byCafe.map(([id, group]) => (
              <section key={id}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">
                    {group.name}
                    <span className="text-sm text-[#e1bfb5] ml-2">({group.items.length} specials)</span>
                  </h2>
                  <Link to={`/student/menu/${id}`} className="text-sm text-[#FFB59D] font-bold">
                    View Full Menu →
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {group.items.map((s) => (
                    <div key={s.id} className="min-w-[280px] max-w-[320px] shrink-0">
                      <SpecialCard
                        special={s}
                        onAddToCart={() => setToast('Added to cart!')}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s) => (
              <SpecialCard key={s.id} special={s} onAddToCart={() => setToast('Added to cart!')} />
            ))}
          </div>
        )}

        {!loading && !filtered.length && (
          <p className="text-center text-[#e1bfb5] py-16">No specials match this filter today.</p>
        )}
      </div>
    </>
  );
}
