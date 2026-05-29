import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { formatPrice } from '../utils/currency';
import { isDisplayableImageUrl } from '../utils/media';
import StarDisplay from './ratings/StarDisplay';
import FavoriteButton from './favorites/FavoriteButton';
import { useFavorites } from '../context/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import { AvailabilityBadgeFromItem } from './availability/AvailabilityBadge';
import SoldOutOverlay from './availability/SoldOutOverlay';
import { useMenuAvailabilityRealtime } from '../hooks/useMenuAvailabilityRealtime';
import { isMenuItemAvailable, mergeMenuItemAvailability } from '../utils/isMenuItemAvailable';

const FOOD_ICONS = ['lunch_dining', 'ramen_dining', 'local_pizza', 'bakery_dining', 'emoji_food_beverage', 'icecream'];

const headerFade = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardFade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function getCafeteriaIcon(name = '') {
  if (!name) return FOOD_ICONS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return FOOD_ICONS[Math.abs(hash) % FOOD_ICONS.length];
}

function MenuItemThumb({ imageUrl }) {
  const [loadFailed, setLoadFailed] = useState(false);
  const showImage = isDisplayableImageUrl(imageUrl) && !loadFailed;

  if (!showImage) {
    return (
      <div className="w-10 h-10 rounded-lg bg-surface-container-highest border border-outline-variant/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-on-surface-variant text-lg" aria-hidden>
          restaurant
        </span>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-lg overflow-hidden border border-outline-variant/10 shrink-0 bg-surface-container-highest">
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
        onError={() => setLoadFailed(true)}
      />
    </div>
  );
}

export default function BrowseMenuSection({ preselectCafeteriaId = null }) {
  const navigate = useNavigate();
  const { showToast } = useFavorites();
  const [cafeterias, setCafeterias] = useState([]);
  const [selectedCafeteria, setSelectedCafeteria] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingCafeterias, setLoadingCafeterias] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [soldOutByCafe, setSoldOutByCafe] = useState({});
  const [availToast, setAvailToast] = useState(null);

  // Fetch cafeteria list publicly (no auth).
  useEffect(() => {
    const fetchCafeterias = async () => {
      setLoadingCafeterias(true);
      setError('');
      const { data, error: fetchError } = await supabase.from('cafeterias').select('*');

      if (fetchError) {
        setError('Unable to load cafeterias right now. Please try again shortly.');
        setCafeterias([]);
        setSelectedCafeteria(null);
      } else {
        const list = data || [];
        setCafeterias(list);
        setSelectedCafeteria(list[0] || null);

        const { data: soldRows } = await supabase
          .from('menu_items')
          .select('cafeteria_id')
          .eq('is_available', false);
        const counts = {};
        (soldRows || []).forEach((row) => {
          const key = row.cafeteria_id;
          counts[key] = (counts[key] || 0) + 1;
        });
        setSoldOutByCafe(counts);
      }
      setLoadingCafeterias(false);
    };

    fetchCafeterias();
  }, []);

  useEffect(() => {
    if (!preselectCafeteriaId || !cafeterias.length) return;
    const match = cafeterias.find((c) => String(c.id) === String(preselectCafeteriaId));
    if (match) setSelectedCafeteria(match);
  }, [preselectCafeteriaId, cafeterias]);

  // Fetch menu for selected cafeteria.
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!selectedCafeteria?.id) {
        setMenuItems([]);
        return;
      }

      setLoadingMenu(true);
      setError('');
      setSelectedCategory('All');
      setSearchQuery('');

      const { data, error: fetchError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafeteria_id', selectedCafeteria.id);

      if (fetchError) {
        setError('Unable to load menu items for this cafeteria.');
        setMenuItems([]);
      } else {
        setMenuItems(data || []);
      }
      setLoadingMenu(false);
    };

    fetchMenuItems();
  }, [selectedCafeteria]);

  const handleRealtimeUpdate = useCallback((updated) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === updated.id ? mergeMenuItemAvailability(item, updated) : item
      )
    );
  }, []);

  useMenuAvailabilityRealtime({
    cafeteriaId: selectedCafeteria?.id,
    enabled: Boolean(selectedCafeteria?.id),
    onItemUpdate: handleRealtimeUpdate,
    onSoldOut: (row) => setAvailToast({ message: `"${row.name}" just sold out`, icon: '🔴' }),
    onAvailableAgain: (row) =>
      setAvailToast({ message: `"${row.name}" is available again!`, icon: '✅' }),
  });

  useEffect(() => {
    if (!availToast) return undefined;
    const t = setTimeout(() => setAvailToast(null), 4000);
    return () => clearTimeout(t);
  }, [availToast]);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set(menuItems.map((item) => item.category).filter((cat) => typeof cat === 'string' && cat.trim()))
    );
    return ['All', ...categories];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        const nameMatch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
        const availMatch = !availableOnly || isMenuItemAvailable(item);
        return nameMatch && categoryMatch && availMatch;
      })
      .sort((a, b) => {
        const aOk = isMenuItemAvailable(a) ? 0 : 1;
        const bOk = isMenuItemAvailable(b) ? 0 : 1;
        return aOk - bOk;
      });
  }, [menuItems, searchQuery, selectedCategory, availableOnly]);

  return (
    <section id="browse-menu" className="py-20 sm:py-28 px-4 sm:px-6 bg-surface-container-low/30">
      {availToast && (
        <div className="fixed top-20 right-4 z-[80] max-w-sm px-4 py-3 rounded-xl bg-surface-container-high/95 border border-outline-variant/20 shadow-2xl flex items-center gap-2">
          <span>{availToast.icon}</span>
          <p className="text-sm font-bold text-on-surface">{availToast.message}</p>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          variants={headerFade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-black uppercase tracking-[0.2em] text-tertiary mb-3 block">Public Preview</span>
          <h2 className="text-3xl sm:text-4xl font-black editorial-text text-on-surface" style={{ fontFamily: 'Manrope' }}>
            Explore Our <span className="text-primary">Menu</span>
          </h2>
          <p className="text-on-surface-variant text-sm mt-3">No account needed - browse what&apos;s cooking today.</p>
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: 140, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="h-1 rounded-full bg-gradient-to-r from-tertiary to-primary mx-auto mt-5"
          />
        </motion.div>

        {/* Cafeteria selector */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={cardStagger}
          className="flex gap-4 overflow-x-auto pb-2 mb-8 hide-scrollbar"
        >
          {loadingCafeterias &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`cafeteria-skeleton-${i}`}
                className="min-w-[250px] h-[120px] rounded-xl bg-surface-container-high border border-outline-variant/10 animate-pulse"
              />
            ))}

          {!loadingCafeterias &&
            cafeterias.map((cafeteria) => {
              const selected = selectedCafeteria?.id === cafeteria.id;
              return (
                <motion.button
                  key={cafeteria.id}
                  type="button"
                  variants={cardFade}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedCafeteria(cafeteria)}
                  className={`min-w-[250px] text-left p-5 rounded-xl border transition-all duration-300 ${
                    selected
                      ? 'bg-surface-container-high border-primary/40 shadow-lg shadow-primary/20'
                      : 'bg-surface-container-high border-outline-variant/10 hover:border-tertiary/35'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="font-extrabold text-on-surface editorial-text line-clamp-1" style={{ fontFamily: 'Manrope' }}>
                      {cafeteria.name}
                    </h3>
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {getCafeteriaIcon(cafeteria.name)}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant line-clamp-2">{cafeteria.location || cafeteria.contact || 'Campus cafeteria'}</p>
                  {soldOutByCafe[cafeteria.id] > 0 && (
                    <p className="text-[11px] font-bold text-amber-400/90 mt-1">
                      {soldOutByCafe[cafeteria.id]} item{soldOutByCafe[cafeteria.id] !== 1 ? 's' : ''} sold out today
                    </p>
                  )}
                  <div className="mt-2">
                    {(cafeteria.rating_count || 0) > 0 ? (
                      <StarDisplay
                        rating={cafeteria.avg_rating}
                        count={cafeteria.rating_count}
                        showCount
                        size="xs"
                      />
                    ) : (
                      <span className="text-[11px] text-on-surface-variant/70">No ratings yet</span>
                    )}
                  </div>
                  {selected && (
                    <span className="inline-block mt-3 text-[11px] font-black tracking-wide uppercase text-primary">Selected</span>
                  )}
                </motion.button>
              );
            })}
        </motion.div>

        {/* Search + category filters */}
        {!loadingCafeterias && selectedCafeteria && (
          <div className="mb-7 space-y-4">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by menu item name..."
                className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl pl-12 pr-4 py-3 text-on-surface focus:border-primary/40 focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50 outline-none transition-all"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded accent-primary"
              />
              Available only
            </label>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-2 overflow-x-auto hide-scrollbar"
            >
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-black tracking-wide uppercase border transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-surface-bright text-on-surface border-primary/35'
                      : 'bg-surface-container-high text-on-surface-variant border-outline-variant/10 hover:text-on-surface'
                  }`}
                >
                  {category}
                </button>
              ))}
            </motion.div>
          </div>
        )}

        {/* Menu grid */}
        {error && <p className="text-sm text-error mb-4">{error}</p>}

        {loadingMenu ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`menu-skeleton-${i}`}
                className="rounded-xl border border-outline-variant/10 bg-surface-container-high p-5 space-y-3 animate-pulse"
              >
                <div className="h-4 rounded bg-surface-container-highest" />
                <div className="h-3 w-1/3 rounded bg-surface-container-highest" />
                <div className="h-3 rounded bg-surface-container-highest" />
                <div className="h-3 w-4/5 rounded bg-surface-container-highest" />
                <div className="h-8 rounded-lg bg-surface-container-highest mt-3" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCafeteria?.id || 'none'}-${selectedCategory}-${searchQuery}`}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {filteredItems.map((item, index) => {
                const available = isMenuItemAvailable(item);
                return (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    whileHover={{ y: available ? -4 : 0 }}
                    className={`group relative rounded-xl border border-outline-variant/10 bg-surface-container-high p-5 shadow-lg hover:shadow-primary/10 transition-shadow duration-300 overflow-hidden ${!available ? 'grayscale-[0.4]' : ''}`}
                  >
                    <SoldOutOverlay isVisible={!available} itemName={item.name} className="rounded-xl" />
                    {selectedCafeteria && (
                      <div className="absolute top-3 right-3 z-10">
                        <FavoriteButton
                          menuItem={item}
                          cafeteriaId={selectedCafeteria.id}
                          size="sm"
                          onGuestClick={() => {
                            showToast('Sign in to save favorites →', 'error');
                            setTimeout(() => navigate('/student/login'), 600);
                          }}
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3 pr-10">
                      <div className="min-w-0">
                        <h3 className="text-lg font-extrabold text-on-surface editorial-text line-clamp-1" style={{ fontFamily: 'Manrope' }}>
                          {item.name}
                        </h3>
                        {(item.rating_count || 0) > 0 ? (
                          <StarDisplay rating={item.avg_rating} count={item.rating_count} size="xs" />
                        ) : (
                          <span className="text-[11px] text-on-surface-variant/70">No ratings yet</span>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-primary/80" style={{ fontVariationSettings: "'FILL' 1" }}>
                        fastfood
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wide bg-tertiary/20 text-tertiary border border-tertiary/30">
                        {item.category || 'General'}
                      </span>
                      <AvailabilityBadgeFromItem item={item} size="sm" />
                    </div>

                    <p className="text-sm text-on-surface-variant mt-3 line-clamp-2 min-h-[2.5rem]">
                      {item.description || 'Freshly prepared for campus dining.'}
                    </p>

                    <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                      <span className="text-xl font-extrabold text-primary">{formatPrice(item.price)}</span>
                      <MenuItemThumb imageUrl={item.image_url} />
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {!loadingMenu && !error && filteredItems.length === 0 && (
          <div className="text-center py-12 rounded-xl border border-outline-variant/10 bg-surface-container-high mt-4">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">ramen_dining</span>
            <p className="text-on-surface mt-3 font-bold">No menu items found</p>
            <p className="text-on-surface-variant text-sm mt-1">Try another category or search term.</p>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mt-12 rounded-2xl border border-outline-variant/10 bg-surface-container-high p-7 sm:p-8 text-center"
        >
          <p className="text-on-surface-variant mb-4">Want to order? Sign in to place your order.</p>
          <Link
            to="/student/login"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-bold bg-gradient-to-br from-tertiary to-tertiary-container text-on-tertiary hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-tertiary/25"
          >
            Order Now
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
