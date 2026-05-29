import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import StarDisplay from '../ratings/StarDisplay';
import { fetchTopCafeterias } from '../../utils/ratingsApi';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const rankColors = ['from-amber-400 to-yellow-600', 'from-slate-300 to-slate-500', 'from-amber-700 to-amber-900'];

export default function TopRatedCafeterias({ onSelectCafeteria }) {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopCafeterias()
      .then(setCafes)
      .catch(() => setCafes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="top-rated" className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-14"
        >
          <span className="text-xs font-black uppercase tracking-[0.2em] text-tertiary mb-3 block">
            Student favorites
          </span>
          <h2 className="text-3xl sm:text-4xl font-black editorial-text text-on-surface" style={{ fontFamily: 'Manrope' }}>
            Top Rated <span className="text-primary">Cafeterias</span>
          </h2>
          <p className="text-on-surface-variant text-sm mt-3 max-w-md mx-auto">
            Loved by students, rated by experience
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-tertiary mx-auto mt-4 rounded-full" />
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-surface-container-high animate-pulse border border-outline-variant/10"
              />
            ))}
          </div>
        ) : cafes.length === 0 ? (
          <p className="text-center text-on-surface-variant text-sm py-12">
            Reviews are coming soon! Be the first to rate.
          </p>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {cafes.map((cafe, i) => (
              <motion.article
                key={cafe.id}
                variants={fadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative bg-surface-container-high rounded-2xl p-6 border border-outline-variant/15 shadow-lg hover:shadow-primary/10 transition-shadow"
              >
                {i < 3 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className={`absolute -top-2 -left-2 w-9 h-9 rounded-full bg-gradient-to-br ${rankColors[i]} text-on-primary text-xs font-black flex items-center justify-center shadow-lg`}
                  >
                    #{i + 1}
                  </motion.span>
                )}
                <h3 className="text-lg font-bold text-on-surface mb-1">{cafe.name}</h3>
                <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">
                  {cafe.location || cafe.description}
                </p>
                <StarDisplay rating={cafe.avg_rating} count={cafe.rating_count} showCount size="md" />
                {cafe.top_review_snippet && (
                  <blockquote className="mt-4 text-sm text-on-surface-variant italic line-clamp-2">
                    &ldquo;{cafe.top_review_snippet}
                    {cafe.top_review_snippet.length >= 80 ? '…' : ''}&rdquo;
                    {cafe.reviewer_first_name && (
                      <span className="block not-italic text-xs mt-1 text-primary">
                        — {cafe.reviewer_first_name}
                      </span>
                    )}
                  </blockquote>
                )}
                <button
                  type="button"
                  onClick={() => onSelectCafeteria?.(cafe.id)}
                  className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-bold hover:scale-[1.02] transition-transform"
                >
                  View Menu
                </button>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
