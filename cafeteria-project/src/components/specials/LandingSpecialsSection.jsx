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
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchLandingPreview();
      setSpecials(data.specials || []);
      setTotalTodayCount(data.totalTodayCount ?? 0);
      const ann = await fetchTodaySpecials({ limit: 30 });
      setAnnouncements((ann || []).filter((s) => s.special_type === 'announcement'));
    } catch {
      setSpecials([]);
      setTotalTodayCount(0);
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

  return (
    <section id="todays-specials" className="py-16 sm:py-20 px-4 sm:px-6 bg-surface-container-low/20">
      <SpecialsMarquee specials={announcements} />
      <div className="max-w-6xl mx-auto mt-8">
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
          viewport={{ once: true }}
          className={`grid gap-5 ${
            specials.length < 3
              ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {specials.map((s) => (
            <Link key={s.id} to="/specials" className="block">
              <SpecialCard special={s} showCafeteriaName compact publicView />
            </Link>
          ))}
        </motion.div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-on-surface-variant">
            Showing {specials.length} of {totalTodayCount} specials today
          </p>
          <Link
            to="/specials"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-bold bg-gradient-to-br from-[#FFB59D] to-[#FF6B35] text-[#5d1900] shadow-lg"
          >
            View All Today&apos;s Specials
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
