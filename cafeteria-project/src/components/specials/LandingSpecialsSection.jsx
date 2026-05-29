import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchLandingPreview, fetchTodaySpecials } from '../../utils/specialsApi';
import { useDailySpecialsRealtime } from '../../hooks/useDailySpecialsRealtime';
import SpecialCard from './SpecialCard';
import SpecialsMarquee from './SpecialsMarquee';

function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
      <span className="relative flex h-2.5 w-2.5">
        <span className="landing-live-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </span>
      Live
    </span>
  );
}

function CardSkeleton({ full = false }) {
  return (
    <div
      className={`animate-pulse rounded-xl border border-outline-variant/10 bg-surface-container-high ${
        full ? 'h-48 w-full' : 'mx-auto h-[220px] w-full'
      }`}
    />
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="mx-auto max-w-lg rounded-xl border border-dashed border-outline-variant/25 bg-surface-container-high/30 px-8 py-12 text-center"
    >
      <span className="landing-float mb-4 block text-6xl" role="img" aria-hidden>
        🍽️
      </span>
      <h3 className="font-['Manrope'] text-xl font-bold text-on-surface">No specials yet today</h3>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
        Check back soon — cafeterias update their specials throughout the morning
      </p>
    </motion.div>
  );
}

function SpecialCardLink({ special, index, layout = 'grid' }) {
  return (
    <Link to="/specials" className="block h-full w-full">
      <SpecialCard
        special={special}
        variant="landing"
        layout={layout}
        index={index}
        showCafeteriaName
      />
    </Link>
  );
}

/** Count-based layout — avoids a lonely centered single card. */
function SpecialsGrid({ specials }) {
  const count = specials.length;

  if (count === 1) {
    return (
      <div className="w-full">
        <SpecialCardLink special={specials[0]} index={0} layout="hero" />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {specials.map((s, i) => (
          <SpecialCardLink key={s.id} special={s} index={i} />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {specials.map((s, i) => (
          <SpecialCardLink key={s.id} special={s} index={i} />
        ))}
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {specials.map((s, i) => (
          <SpecialCardLink key={s.id} special={s} index={i} />
        ))}
      </div>
    );
  }

  if (count === 5) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {specials.slice(0, 3).map((s, i) => (
            <SpecialCardLink key={s.id} special={s} index={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mx-auto lg:max-w-[66%]">
          {specials.slice(3, 5).map((s, i) => (
            <SpecialCardLink key={s.id} special={s} index={i + 3} />
          ))}
        </div>
      </div>
    );
  }

  /* 6 specials — 3×2 grid */
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {specials.map((s, i) => (
        <SpecialCardLink key={s.id} special={s} index={i} />
      ))}
    </div>
  );
}

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
        rows.filter((s) => s.special_type !== 'announcement').slice(0, 6)
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

  const displaySpecials = (specials.length ? specials : fallbackSpecials).slice(0, 6);
  const hasMoreThanSix =
    totalTodayCount > 6 ||
    (specials.length ? specials.length : fallbackSpecials.length) > 6;
  const showEmpty = !loading && totalTodayCount === 0 && displaySpecials.length === 0;

  return (
    <section
      id="todays-specials"
      className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 landing-dot-grid opacity-30" aria-hidden />
      <div className="landing-orb-pulse absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />
      <div className="landing-orb-pulse absolute -right-24 bottom-0 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[80px] [animation-delay:2s]" />

      <div className="relative mx-auto w-full max-w-7xl">
        <SpecialsMarquee specials={announcements} variant="landing" />

        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-on-surface-variant">
              <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
              Updated Daily
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h2
                className="text-3xl font-black text-on-surface sm:text-4xl lg:text-5xl"
                style={{ fontFamily: 'Manrope' }}
              >
                Today&apos;s Specials
              </h2>
              <LiveIndicator />
            </div>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 h-1 max-w-xs rounded-full bg-gradient-to-r from-primary via-primary-container to-transparent"
            />
            <p className="mt-3 text-sm text-on-surface-variant sm:text-base">
              Fresh deals from campus cafeterias
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap items-center gap-3"
          >
            {totalTodayCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-primary">
                🔥 {totalTodayCount} specials today
              </span>
            )}
            <Link
              to="/specials"
              className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/15 px-5 py-2.5 text-sm font-bold text-on-surface-variant transition-all hover:border-tertiary/40 hover:text-tertiary"
            >
              View All
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </motion.div>
        </div>

        {/* Cards */}
        {loading ? (
          displaySpecials.length === 1 ? (
            <CardSkeleton full />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )
        ) : showEmpty ? (
          <EmptyState />
        ) : (
          <div className="relative">
            <SpecialsGrid specials={displaySpecials} />

            {hasMoreThanSix && (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface via-surface/90 to-transparent"
                aria-hidden
              />
            )}
          </div>
        )}

        {/* Footer stats */}
        {!loading && !showEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`mt-10 text-center sm:text-left ${hasMoreThanSix ? 'relative z-10 -mt-8' : ''}`}
          >
            <p className="text-sm text-on-surface-variant">
              Showing {displaySpecials.length} of {totalTodayCount} specials today
            </p>
            <p className="mt-1 flex items-center justify-center gap-2 text-xs text-on-surface-variant/80 sm:justify-start">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Updates in real-time
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
