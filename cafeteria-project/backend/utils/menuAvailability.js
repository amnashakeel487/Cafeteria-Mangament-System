function itemIsAvailable(row) {
  if (!row) return false;
  if (typeof row.is_available === 'boolean') return row.is_available;
  if (typeof row.available === 'boolean') return row.available;
  if (typeof row.in_stock === 'boolean') return row.in_stock;
  if (typeof row.status === 'string') return row.status.toLowerCase() !== 'out of stock';
  return true;
}

function normalizeMenuItem(row) {
  if (!row) return null;
  return {
    ...row,
    is_available: itemIsAvailable(row),
    auto_reset_enabled: row.auto_reset_enabled !== false,
  };
}

module.exports = { itemIsAvailable, normalizeMenuItem };
