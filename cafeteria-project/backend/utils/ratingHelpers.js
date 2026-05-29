const supabase = require('../database');

function studentDisplayName(name) {
  if (!name || typeof name !== 'string') return 'Student';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
}

function buildDistribution(ratings) {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  (ratings || []).forEach((r) => {
    const star = Math.round(Number(r.rating));
    if (star >= 1 && star <= 5) dist[star] += 1;
  });
  return dist;
}

async function recalcMenuItemRating(menuItemId) {
  const { data, error } = await supabase
    .from('menu_item_ratings')
    .select('rating')
    .eq('menu_item_id', menuItemId)
    .eq('is_visible', true);

  if (error) throw error;

  const count = data?.length || 0;
  const avg =
    count === 0 ? 0 : data.reduce((sum, r) => sum + Number(r.rating), 0) / count;

  await supabase
    .from('menu_items')
    .update({
      avg_rating: Number(avg.toFixed(2)),
      rating_count: count,
    })
    .eq('id', menuItemId);

  return { avg_rating: Number(avg.toFixed(2)), rating_count: count };
}

async function recalcCafeteriaRating(cafeteriaId) {
  const cafeId = String(cafeteriaId);
  const { data, error } = await supabase
    .from('cafeteria_reviews')
    .select('rating')
    .eq('cafeteria_id', cafeId)
    .eq('is_visible', true);

  if (error) throw error;

  const count = data?.length || 0;
  const avg =
    count === 0 ? 0 : data.reduce((sum, r) => sum + Number(r.rating), 0) / count;

  await supabase
    .from('cafeterias')
    .update({
      avg_rating: Number(avg.toFixed(2)),
      rating_count: count,
    })
    .eq('id', cafeId);

  return { avg_rating: Number(avg.toFixed(2)), rating_count: count };
}

async function assertOrderCompletedForStudent(orderId, studentId) {
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, user_id, cafeteria_id, status')
    .eq('id', orderId)
    .maybeSingle();

  if (error) throw error;
  if (!order) return { ok: false, status: 404, message: 'Order not found' };
  if (String(order.user_id) !== String(studentId)) {
    return { ok: false, status: 403, message: 'Not your order' };
  }
  if (order.status !== 'completed') {
    return { ok: false, status: 400, message: 'Only completed orders can be rated' };
  }
  return { ok: true, order };
}

/** Match menu item to a line on the order by name (order_items store item_name only). */
async function menuItemOnOrder(orderId, cafeteriaId, menuItemId) {
  const { data: menuItem } = await supabase
    .from('menu_items')
    .select('id, name, cafeteria_id')
    .eq('id', menuItemId)
    .maybeSingle();

  if (!menuItem) return { ok: false, message: 'Menu item not found' };
  if (String(menuItem.cafeteria_id) !== String(cafeteriaId)) {
    return { ok: false, message: 'Menu item does not belong to this cafeteria' };
  }

  const { data: lines } = await supabase
    .from('order_items')
    .select('item_name')
    .eq('order_id', orderId);

  const normalized = (menuItem.name || '').trim().toLowerCase();
  const onOrder = (lines || []).some(
    (l) => (l.item_name || '').trim().toLowerCase() === normalized
  );

  if (!onOrder) {
    return { ok: false, message: 'This item was not part of the order' };
  }
  return { ok: true, menuItem };
}

module.exports = {
  studentDisplayName,
  buildDistribution,
  recalcMenuItemRating,
  recalcCafeteriaRating,
  assertOrderCompletedForStudent,
  menuItemOnOrder,
};
