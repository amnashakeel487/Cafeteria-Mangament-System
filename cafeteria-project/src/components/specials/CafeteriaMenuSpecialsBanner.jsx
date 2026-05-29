import { useCallback, useEffect, useState } from 'react';
import { fetchTodaySpecials } from '../../utils/specialsApi';
import { useDailySpecialsRealtime } from '../../hooks/useDailySpecialsRealtime';
import SpecialCard from './SpecialCard';

export default function CafeteriaMenuSpecialsBanner({ cafeteriaId, cafeteriaName }) {
  const [specials, setSpecials] = useState([]);

  const load = useCallback(async () => {
    if (!cafeteriaId) return;
    try {
      const rows = await fetchTodaySpecials({ cafeteriaId, limit: 20 });
      setSpecials(rows || []);
    } catch {
      setSpecials([]);
    }
  }, [cafeteriaId]);

  useEffect(() => {
    load();
  }, [load]);

  useDailySpecialsRealtime({
    cafeteriaId,
    onChange: () => load(),
  });

  if (!specials.length) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-black text-[#E3E0F8] mb-3 font-['Manrope']">
        🌟 Today&apos;s Specials at {cafeteriaName || 'this cafeteria'}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {specials.map((s) => (
          <div key={s.id} className="min-w-[260px] max-w-[300px] shrink-0">
            <SpecialCard special={s} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
