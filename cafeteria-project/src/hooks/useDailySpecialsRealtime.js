import { useEffect } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Subscribe to daily_specials changes (insert/update).
 */
export function useDailySpecialsRealtime({
  enabled = true,
  cafeteriaId = null,
  onChange,
}) {
  useEffect(() => {
    if (!enabled || !onChange) return undefined;

    const channelName = cafeteriaId
      ? `daily-specials-${cafeteriaId}`
      : 'daily-specials-all';

    let channel = supabase.channel(channelName);

    const handler = (payload) => {
      const row = payload.new || payload.old;
      if (cafeteriaId && row && String(row.cafeteria_id) !== String(cafeteriaId)) {
        return;
      }
      onChange(payload);
    };

    channel = channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'daily_specials' },
        handler
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'daily_specials' },
        handler
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, cafeteriaId, onChange]);
}
