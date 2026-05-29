export function isMenuItemAvailable(item) {
  if (!item) return false;
  if (typeof item.is_available === 'boolean') return item.is_available;
  if (typeof item.available === 'boolean') return item.available;
  if (typeof item.in_stock === 'boolean') return item.in_stock;
  if (typeof item.status === 'string') return item.status.toLowerCase() !== 'out of stock';
  return true;
}

export function mergeMenuItemAvailability(existing, updated) {
  if (!updated) return existing;
  return {
    ...existing,
    ...updated,
    is_available: updated.is_available ?? existing?.is_available,
    sold_out_at: updated.sold_out_at ?? existing?.sold_out_at,
    sold_out_reason: updated.sold_out_reason ?? existing?.sold_out_reason,
    auto_reset_enabled: updated.auto_reset_enabled ?? existing?.auto_reset_enabled,
  };
}
