import { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { mergeMenuItemAvailability } from '../utils/isMenuItemAvailable';

/**
 * Subscribe to menu_items availability updates for one cafeteria.
 */
export function useMenuAvailabilityRealtime({
  cafeteriaId,
  enabled = true,
  onItemUpdate,
  onSoldOut,
  onAvailableAgain,
}) {
  useEffect(() => {
    if (!enabled || !cafeteriaId || !onItemUpdate) return undefined;

    const filterId = String(cafeteriaId);
    const channel = supabase
      .channel(`menu-availability-${filterId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'menu_items',
          filter: `cafeteria_id=eq.${filterId}`,
        },
        (payload) => {
          const prev = payload.old || {};
          const next = payload.new || {};
          onItemUpdate(mergeMenuItemAvailability(prev, next));

          if (prev.is_available !== false && next.is_available === false) {
            onSoldOut?.(next);
          }
          if (prev.is_available === false && next.is_available === true) {
            onAvailableAgain?.(next);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cafeteriaId, enabled, onItemUpdate, onSoldOut, onAvailableAgain]);
}
