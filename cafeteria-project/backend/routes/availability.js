const express = require('express');
const supabase = require('../database');
const { normalizeMenuItem } = require('../utils/menuAvailability');

const router = express.Router();

function cafeteriaId(req) {
  return String(req.cafeteria.id);
}

async function assertItemOwnership(menuItemId, cafeId) {
  const { data: item, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', menuItemId)
    .eq('cafeteria_id', cafeId)
    .maybeSingle();

  if (error) return { error: 'Database error', status: 500 };
  if (!item) return { error: 'Menu item not found', status: 404 };
  return { item };
}

async function insertLog({ menuItemId, cafeId, changedBy, previousStatus, newStatus, reason, resetType }) {
  const { error } = await supabase.from('availability_logs').insert({
    menu_item_id: menuItemId,
    cafeteria_id: cafeId,
    changed_by: changedBy,
    previous_status: previousStatus,
    new_status: newStatus,
    reason: reason || null,
    reset_type: resetType || 'manual',
  });
  if (error) console.warn('availability_logs insert:', error.message);
}

// GET status summary
router.get('/status', async (req, res) => {
  try {
    const cafeId = req.cafeteria.id;
    const { data: rows, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('cafeteria_id', cafeId)
      .order('name', { ascending: true });

    if (error) return res.status(500).json({ message: 'Database error' });

    const items = (rows || []).map(normalizeMenuItem);
    const available = items.filter((i) => i.is_available);
    const soldOut = items.filter((i) => !i.is_available);

    res.json({
      available,
      soldOut,
      totalItems: items.length,
      availableCount: available.length,
      soldOutCount: soldOut.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET paginated logs
router.get('/logs', async (req, res) => {
  try {
    const cafeId = req.cafeteria.id;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: logs, error, count } = await supabase
      .from('availability_logs')
      .select('*', { count: 'exact' })
      .eq('cafeteria_id', cafeId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return res.status(500).json({ message: 'Database error' });

    const itemIds = [...new Set((logs || []).map((l) => l.menu_item_id))];
    let nameMap = {};
    if (itemIds.length) {
      const { data: items } = await supabase
        .from('menu_items')
        .select('id, name')
        .in('id', itemIds);
      nameMap = Object.fromEntries((items || []).map((i) => [i.id, i.name]));
    }

    res.json({
      logs: (logs || []).map((l) => ({
        ...l,
        item_name: nameMap[l.menu_item_id] || 'Unknown item',
      })),
      page,
      limit,
      total: count ?? 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH bulk
router.patch('/bulk', async (req, res) => {
  try {
    const { menuItemIds, isAvailable, reason, autoResetEnabled } = req.body;
    if (!Array.isArray(menuItemIds) || menuItemIds.length === 0) {
      return res.status(400).json({ message: 'menuItemIds array is required' });
    }
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'isAvailable must be a boolean' });
    }

    const cafeId = req.cafeteria.id;
    const ids = menuItemIds.map((id) => Number(id)).filter(Boolean);

    const { data: owned, error: fetchErr } = await supabase
      .from('menu_items')
      .select('id, is_available')
      .eq('cafeteria_id', cafeId)
      .in('id', ids);

    if (fetchErr) return res.status(500).json({ message: 'Database error' });
    if (!owned || owned.length !== ids.length) {
      return res.status(403).json({ message: 'One or more items do not belong to this cafeteria' });
    }

    const now = new Date().toISOString();
    const updatePayload = {
      is_available: isAvailable,
      sold_out_at: isAvailable ? null : now,
      sold_out_reason: isAvailable ? null : reason || 'sold_out',
    };
    if (typeof autoResetEnabled === 'boolean') {
      updatePayload.auto_reset_enabled = autoResetEnabled;
    }

    const { data: updated, error: updateErr } = await supabase
      .from('menu_items')
      .update(updatePayload)
      .eq('cafeteria_id', cafeId)
      .in('id', ids)
      .select('*');

    if (updateErr) return res.status(500).json({ message: 'Database error' });

    const logs = owned.map((row) => ({
      menu_item_id: row.id,
      cafeteria_id: cafeId,
      changed_by: cafeteriaId(req),
      previous_status: row.is_available !== false,
      new_status: isAvailable,
      reason: reason || 'manual toggle',
      reset_type: 'manual',
    }));
    await supabase.from('availability_logs').insert(logs);

    res.json({
      count: updated?.length || 0,
      items: (updated || []).map(normalizeMenuItem),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST reset all sold out
router.post('/reset-all', async (req, res) => {
  try {
    const cafeId = req.cafeteria.id;

    const { data: soldOut, error: fetchErr } = await supabase
      .from('menu_items')
      .select('id, is_available')
      .eq('cafeteria_id', cafeId)
      .eq('is_available', false);

    if (fetchErr) return res.status(500).json({ message: 'Database error' });
    if (!soldOut?.length) {
      return res.json({ count: 0, message: 'No sold out items to reset' });
    }

    const { error: updateErr } = await supabase
      .from('menu_items')
      .update({
        is_available: true,
        sold_out_at: null,
        sold_out_reason: null,
      })
      .eq('cafeteria_id', cafeId)
      .eq('is_available', false);

    if (updateErr) return res.status(500).json({ message: 'Database error' });

    const logs = soldOut.map((row) => ({
      menu_item_id: row.id,
      cafeteria_id: cafeId,
      changed_by: cafeteriaId(req),
      previous_status: false,
      new_status: true,
      reason: 'Manual reset all',
      reset_type: 'manual',
    }));
    await supabase.from('availability_logs').insert(logs);

    res.json({ count: soldOut.length, message: `${soldOut.length} items restored` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH single item — must be last among PATCH routes with params
router.patch('/:menuItemId', async (req, res) => {
  try {
    const menuItemId = req.params.menuItemId;
    const { isAvailable, reason, autoResetEnabled } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'isAvailable must be a boolean' });
    }

    const cafeId = req.cafeteria.id;
    const check = await assertItemOwnership(menuItemId, cafeId);
    if (check.error) return res.status(check.status).json({ message: check.error });

    const previousStatus = check.item.is_available !== false;
    const now = new Date().toISOString();
    const updatePayload = {
      is_available: isAvailable,
      sold_out_at: isAvailable ? null : now,
      sold_out_reason: isAvailable ? null : reason || 'sold_out',
    };
    if (typeof autoResetEnabled === 'boolean') {
      updatePayload.auto_reset_enabled = autoResetEnabled;
    }

    const { data: updated, error } = await supabase
      .from('menu_items')
      .update(updatePayload)
      .eq('id', menuItemId)
      .eq('cafeteria_id', cafeId)
      .select('*')
      .single();

    if (error) return res.status(500).json({ message: 'Database error' });

    await insertLog({
      menuItemId,
      cafeId,
      changedBy: cafeteriaId(req),
      previousStatus,
      newStatus: isAvailable,
      reason: reason || 'manual toggle',
      resetType: 'manual',
    });

    res.json(normalizeMenuItem(updated));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
