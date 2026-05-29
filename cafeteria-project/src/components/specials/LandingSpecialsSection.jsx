import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchLandingPreview, fetchTodaySpecials } from '../../utils/specialsApi';
import { useDailySpecialsRealtime } from '../../hooks/useDailySpecialsRealtime';
import SpecialCard from './SpecialCard';
import SpecialsMarquee from './SpecialsMarquee';

export default function LandingSpecialsSection() {
  const [specials, setSpecials] = useState([]);
  const [totalTodayCount, setTotalTodayCount] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [fallbackSpecials, setFallbackSpecials] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchLandingPreview();
      setSpecials(data.specials || []);
      setTotalTodayCount(data.totalTodayCount ?? 0);
      const todayRows = await fetchTodaySpecials({ limit: 30 });
      const rows = todayRows || [];
      setAnnouncements(rows.filter((s) => s.special_type === 'announcement'));
      setFallbackSpecials(
        rows
          .filter((s) => s.special_type !== 'announcement')
          .slice(0, 6)
      );
    } catch {
      setSpecials([]);
      setTotalTodayCount(0);
      setAnnouncements([]);
      setFallbackSpecials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useDailySpecialsRealtime({
    onChange: () => load(),
  });

  if (!loading && totalTodayCount === 0 && specials.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto h-40 bg-surface-container-high/50 rounded-xl animate-pulse" />
      </section>
    );
  }

  const displaySpecials = specials.length ? specials : fallbackSpecials;

  return (
    <section
      id="todays-specials"
      className="relative py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-surface-container-low/30 via-surface-container-low/20 to-transparent overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-tertiary/10 blur-[110px]" />
      </div>
      <SpecialsMarquee specials={announcements} />
      <div className="relative max-w-6xl mx-auto mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl sm:text-3xl font-black text-on-surface font-['Manrope']">
                Today&apos;s Specials 🍽️
              </h2>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-sm text-on-surface-variant">Fresh deals from campus cafeterias</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/15 text-primary">
              {totalTodayCount} specials today
            </span>
            <Link
              to="/specials"
              className="text-sm font-bold text-[#FFB59D] border border-[#FFB59D]/40 px-4 py-2 rounded-lg hover:bg-[#FFB59D]/10"
            >
              View All →
            </Link>
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className={`grid gap-5 ${
            displaySpecials.length < 3
              ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {displaySpecials.map((s, index) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
            >
              <Link to="/specials" className="block group">
                <div className="rounded-xl ring-1 ring-transparent group-hover:ring-primary/30 transition-all duration-300">
                  <SpecialCard special={s} showCafeteriaName compact publicView />
                </div>
              </Link>
            </motion.div>
          ))}
          {!displaySpecials.length && (
            <div className="col-span-full text-center text-sm text-on-surface-variant py-10">
              Specials are live today. Tap View All to explore every update.
            </div>
          )}
        </motion.div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-on-surface-variant">
            Showing {displaySpecials.length} of {totalTodayCount} specials today
          </p>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/specials"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-bold bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] shadow-lg shadow-primary/25"
            >
              View All Today&apos;s Specials
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
