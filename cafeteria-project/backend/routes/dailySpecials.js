const express = require('express');
const supabase = require('../database');
const { createNotification } = require('../utils/notificationService');
const { getTodayPktDateString, addDaysToPktDateString, isValidDateString } = require('../utils/specialsDate');

const VALID_TYPES = ['special', 'announcement', 'discount', 'new_item', 'limited_time'];
const MAX_PER_DAY = 20;

const router = express.Router();

function ensureServiceRole(res) {
  if (supabase?._isServiceRole) return true;
  res.status(500).json({
    message:
      'Server is missing SUPABASE_SERVICE_ROLE_KEY (service role). Add it to your backend environment variables to allow daily specials writes.',
  });
  return false;
}

function calcDiscountPct(original, special) {
  const o = parseFloat(original);
  const s = parseFloat(special);
  if (!o || o <= 0 || s == null || Number.isNaN(s)) return null;
  return Math.round(((o - s) / o) * 100);
}

function mapRow(row, cafeMap, itemMap) {
  if (!row) return null;
  const cafe = cafeMap?.[String(row.cafeteria_id)];
  const item = row.menu_item_id != null ? itemMap?.[String(row.menu_item_id)] : null;
  return {
    ...row,
    cafeteria_name: cafe?.name || null,
    cafeteria_image: cafe?.profile_picture || null,
    menu_item: item
      ? {
          id: item.id,
          name: item.name,
          price: item.price,
          is_available: item.is_available,
          category: item.category,
          image_url: item.image_url,
        }
      : null,
  };
}

async function loadCafeterias(ids) {
  const unique = [...new Set(ids.map(String).filter(Boolean))];
  if (!unique.length) return {};
  const { data } = await supabase.from('cafeterias').select('id, name, profile_picture').in('id', unique);
  const map = {};
  (data || []).forEach((c) => {
    map[String(c.id)] = c;
  });
  return map;
}

async function loadMenuItems(ids) {
  const unique = [...new Set(ids.filter((id) => id != null).map(String))];
  if (!unique.length) return {};
  const { data } = await supabase
    .from('menu_items')
    .select('id, name, price, is_available, category, image_url, cafeteria_id')
    .in('id', unique);
  const map = {};
  (data || []).forEach((m) => {
    map[String(m.id)] = m;
  });
  return map;
}

async function enrichSpecials(rows) {
  if (!rows?.length) return [];
  const cafeMap = await loadCafeterias(rows.map((r) => r.cafeteria_id));
  const itemMap = await loadMenuItems(rows.map((r) => r.menu_item_id));
  return rows.map((r) => mapRow(r, cafeMap, itemMap));
}

async function incrementViewCounts(ids) {
  if (!ids?.length) return;
  await Promise.all(
    ids.map(async (id) => {
      const { data } = await supabase.from('daily_specials').select('view_count').eq('id', id).maybeSingle();
      if (data) {
        await supabase
          .from('daily_specials')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id);
      }
    })
  );
}

function buildTodayQuery({ cafeteriaId, featured, dateStr }) {
  let q = supabase
    .from('daily_specials')
    .select('*')
    .eq('valid_date', dateStr)
    .eq('is_active', true);
  if (cafeteriaId) q = q.eq('cafeteria_id', String(cafeteriaId));
  if (featured === true || featured === 'true') q = q.eq('is_featured', true);
  return q;
}

async function notifyStudentsOfSpecial(cafeteriaId, cafeteriaName, title) {
  try {
    const { data: orders } = await supabase
      .from('orders')
      .select('user_id')
      .eq('cafeteria_id', cafeteriaId);
    const studentIds = [...new Set((orders || []).map((o) => o.user_id).filter(Boolean))];
    if (!studentIds.length) {
      const { data: users } = await supabase.from('users').select('id').eq('status', 'approved');
      studentIds.push(...(users || []).map((u) => u.id));
    }
    const cafe = cafeteriaName || 'a cafeteria';
    const msg = `🍽️ New special at ${cafe}: ${title}`;
    await Promise.all(
      studentIds.slice(0, 500).map((sid) =>
        createNotification({
          recipientType: 'student',
          recipientId: sid,
          type: 'order_status',
          title: 'New Special Today',
          message: msg,
          data: { cafeteriaId: String(cafeteriaId), kind: 'daily_special' },
        })
      )
    );
  } catch (err) {
    console.error('Special notification broadcast failed:', err?.message);
  }
}

// ── PUBLIC ──

router.get('/today', async (req, res) => {
  try {
    const dateStr = getTodayPktDateString();
    const { cafeteriaId, limit, featured } = req.query;
    let q = buildTodayQuery({ cafeteriaId, featured, dateStr });
    q = q
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (limit) q = q.limit(Math.min(parseInt(limit, 10) || 50, 100));

    const { data, error } = await q;
    if (error) return res.status(500).json({ message: error.message });

    const enriched = await enrichSpecials(data || []);
    if (enriched.length) await incrementViewCounts(enriched.map((s) => s.id));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.get('/landing-preview', async (req, res) => {
  try {
    const dateStr = getTodayPktDateString();
    const { count } = await supabase
      .from('daily_specials')
      .select('*', { count: 'exact', head: true })
      .eq('valid_date', dateStr)
      .eq('is_active', true);

    const { data, error } = await buildTodayQuery({ featured: true, dateStr })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) return res.status(500).json({ message: error.message });

    const enriched = await enrichSpecials(data || []);
    if (enriched.length) await incrementViewCounts(enriched.map((s) => s.id));

    res.json({
      specials: enriched,
      totalTodayCount: count ?? enriched.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.get('/all-today', async (req, res) => {
  try {
    const dateStr = getTodayPktDateString();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);
    const { cafeteriaId, type, sort } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let q = supabase
      .from('daily_specials')
      .select('*', { count: 'exact' })
      .eq('valid_date', dateStr)
      .eq('is_active', true);

    if (cafeteriaId) q = q.eq('cafeteria_id', String(cafeteriaId));
    if (type && VALID_TYPES.includes(type)) q = q.eq('special_type', type);

    if (sort === 'newest') q = q.order('created_at', { ascending: false });
    else if (sort === 'discount') q = q.order('discount_percentage', { ascending: false, nullsFirst: false });
    else q = q.order('is_featured', { ascending: false }).order('display_order', { ascending: true });

    q = q.range(from, to);
    const { data, error, count } = await q;
    if (error) return res.status(500).json({ message: error.message });

    const enriched = await enrichSpecials(data || []);
    if (enriched.length) await incrementViewCounts(enriched.map((s) => s.id));

    const total = count ?? 0;
    res.json({
      specials: enriched,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// ── CAFETERIA (mounted with cafeteriaAuth in server.js) ──
function createCafeteriaRouter(cafeteriaAuth) {
  const cr = express.Router();
  cr.use(cafeteriaAuth);

  cr.post('/', async (req, res) => {
    if (!ensureServiceRole(res)) return;
    try {
      const cafeteriaId = String(req.cafeteria.id);
      const {
        title,
        description,
        specialType,
        menuItemId,
        originalPrice,
        specialPrice,
        discountPercentage,
        validDate,
        startTime,
        endTime,
        isFeatured,
        displayOrder,
        imageUrl,
      } = req.body;

      if (!title || String(title).trim().length < 3) {
        return res.status(400).json({ message: 'Title must be at least 3 characters.' });
      }
      if (String(title).length > 100) {
        return res.status(400).json({ message: 'Title must be 100 characters or less.' });
      }
      const type = specialType || 'special';
      if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({ message: 'Invalid special type.' });
      }

      const today = getTodayPktDateString();
      const vDate = validDate || today;
      if (!isValidDateString(vDate)) {
        return res.status(400).json({ message: 'Invalid valid date.' });
      }
      if (vDate < today) {
        return res.status(400).json({ message: 'Valid date must be today or in the future.' });
      }

      const { count } = await supabase
        .from('daily_specials')
        .select('*', { count: 'exact', head: true })
        .eq('cafeteria_id', cafeteriaId)
        .eq('valid_date', vDate)
        .eq('is_active', true);

      if ((count || 0) >= MAX_PER_DAY) {
        return res.status(400).json({ message: `Maximum ${MAX_PER_DAY} active specials per day.` });
      }

      let orig = originalPrice != null ? parseFloat(originalPrice) : null;
      let spec = specialPrice != null ? parseFloat(specialPrice) : null;
      let disc = discountPercentage != null ? parseInt(discountPercentage, 10) : null;

      if (type === 'discount' && !disc && (orig == null || spec == null)) {
        return res.status(400).json({
          message: 'Discount specials need discount % or original and special price.',
        });
      }
      if (orig != null && spec != null) {
        disc = calcDiscountPct(orig, spec);
      }

      if (menuItemId) {
        const { data: item } = await supabase
          .from('menu_items')
          .select('id, price')
          .eq('id', menuItemId)
          .eq('cafeteria_id', cafeteriaId)
          .maybeSingle();
        if (!item) return res.status(400).json({ message: 'Menu item not found.' });
        if (orig == null) orig = parseFloat(item.price);
      }

      const row = {
        cafeteria_id: cafeteriaId,
        title: String(title).trim(),
        description: description ? String(description).slice(0, 300) : null,
        special_type: type,
        menu_item_id: menuItemId || null,
        original_price: orig,
        special_price: spec,
        discount_percentage: disc,
        valid_date: vDate,
        start_time: startTime || '00:00',
        end_time: endTime || '23:59',
        is_featured: Boolean(isFeatured),
        is_active: true,
        display_order: parseInt(displayOrder, 10) || 0,
        image_url: imageUrl || null,
        created_by: cafeteriaId,
      };

      const { data, error } = await supabase.from('daily_specials').insert(row).select('*').single();
      if (error) return res.status(500).json({ message: error.message });

      const { data: cafe } = await supabase
        .from('cafeterias')
        .select('name')
        .eq('id', cafeteriaId)
        .maybeSingle();
      notifyStudentsOfSpecial(cafeteriaId, cafe?.name, row.title);

      const [enriched] = await enrichSpecials([data]);
      res.status(201).json(enriched);
    } catch (err) {
      res.status(500).json({ message: err.message || 'Server error' });
    }
  });

  cr.get('/mine', async (req, res) => {
    try {
      const cafeteriaId = String(req.cafeteria.id);
      const dateStr = req.query.date || getTodayPktDateString();
      const status = req.query.status || 'active';

      let q = supabase
        .from('daily_specials')
        .select('*')
        .eq('cafeteria_id', cafeteriaId)
        .eq('valid_date', dateStr)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (status === 'active') q = q.eq('is_active', true);

      const { data, error } = await q;
      if (error) return res.status(500).json({ message: error.message });
      res.json(await enrichSpecials(data || []));
    } catch (err) {
      res.status(500).json({ message: err.message || 'Server error' });
    }
  });

  cr.patch('/reorder', async (req, res) => {
    if (!ensureServiceRole(res)) return;
    try {
      const cafeteriaId = String(req.cafeteria.id);
      const { orders } = req.body;
      if (!Array.isArray(orders)) {
        return res.status(400).json({ message: 'orders array required' });
      }
      await Promise.all(
        orders.map(({ id, display_order }) =>
          supabase
            .from('daily_specials')
            .update({ display_order, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('cafeteria_id', cafeteriaId)
        )
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Server error' });
    }
  });

  cr.patch('/:specialId', async (req, res) => {
    if (!ensureServiceRole(res)) return;
    try {
      const cafeteriaId = String(req.cafeteria.id);
      const { specialId } = req.params;
      const { data: existing } = await supabase
        .from('daily_specials')
        .select('*')
        .eq('id', specialId)
        .eq('cafeteria_id', cafeteriaId)
        .maybeSingle();
      if (!existing) return res.status(404).json({ message: 'Special not found.' });

      const patch = { updated_at: new Date().toISOString() };
      const fields = [
        'title',
        'description',
        'special_type',
        'menu_item_id',
        'original_price',
        'special_price',
        'discount_percentage',
        'valid_date',
        'start_time',
        'end_time',
        'is_featured',
        'is_active',
        'display_order',
        'image_url',
      ];
      const bodyMap = {
        title: 'title',
        description: 'description',
        specialType: 'special_type',
        menuItemId: 'menu_item_id',
        originalPrice: 'original_price',
        specialPrice: 'special_price',
        discountPercentage: 'discount_percentage',
        validDate: 'valid_date',
        startTime: 'start_time',
        endTime: 'end_time',
        isFeatured: 'is_featured',
        isActive: 'is_active',
        displayOrder: 'display_order',
        imageUrl: 'image_url',
      };
      Object.entries(bodyMap).forEach(([bodyKey, col]) => {
        if (req.body[bodyKey] !== undefined) patch[col] = req.body[bodyKey];
      });
      if (patch.title && String(patch.title).trim().length < 3) {
        return res.status(400).json({ message: 'Title too short.' });
      }
      if (patch.special_type && !VALID_TYPES.includes(patch.special_type)) {
        return res.status(400).json({ message: 'Invalid type.' });
      }
      if (patch.original_price != null && patch.special_price != null) {
        patch.discount_percentage = calcDiscountPct(patch.original_price, patch.special_price);
      }

      const { data, error } = await supabase
        .from('daily_specials')
        .update(patch)
        .eq('id', specialId)
        .eq('cafeteria_id', cafeteriaId)
        .select('*')
        .single();
      if (error) return res.status(500).json({ message: error.message });
      const [enriched] = await enrichSpecials([data]);
      res.json(enriched);
    } catch (err) {
      res.status(500).json({ message: err.message || 'Server error' });
    }
  });

  cr.patch('/:specialId/toggle', async (req, res) => {
    if (!ensureServiceRole(res)) return;
    try {
      const cafeteriaId = String(req.cafeteria.id);
      const { data: existing } = await supabase
        .from('daily_specials')
        .select('is_active')
        .eq('id', req.params.specialId)
        .eq('cafeteria_id', cafeteriaId)
        .maybeSingle();
      if (!existing) return res.status(404).json({ message: 'Not found.' });

      const { data, error } = await supabase
        .from('daily_specials')
        .update({ is_active: !existing.is_active, updated_at: new Date().toISOString() })
        .eq('id', req.params.specialId)
        .select('*')
        .single();
      if (error) return res.status(500).json({ message: error.message });
      const [enriched] = await enrichSpecials([data]);
      res.json(enriched);
    } catch (err) {
      res.status(500).json({ message: err.message || 'Server error' });
    }
  });

  cr.delete('/:specialId', async (req, res) => {
    if (!ensureServiceRole(res)) return;
    try {
      const cafeteriaId = String(req.cafeteria.id);
      const { error } = await supabase
        .from('daily_specials')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', req.params.specialId)
        .eq('cafeteria_id', cafeteriaId);
      if (error) return res.status(500).json({ message: error.message });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Server error' });
    }
  });

  return cr;
}

function createStudentRouter(studentAuth) {
  const sr = express.Router();
  sr.use(studentAuth);

  sr.get('/today', async (req, res) => {
    try {
      const dateStr = getTodayPktDateString();
      const studentId = String(req.user.id);
      const { cafeteriaId, type } = req.query;

      let q = buildTodayQuery({ cafeteriaId, dateStr });
      if (type && VALID_TYPES.includes(type)) q = q.eq('special_type', type);
      q = q
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      const { data, error } = await q;
      if (error) return res.status(500).json({ message: error.message });

      const { data: myOrders } = await supabase
        .from('orders')
        .select('cafeteria_id')
        .eq('user_id', studentId);
      const frequent = new Set((myOrders || []).map((o) => String(o.cafeteria_id)));

      const enriched = await enrichSpecials(data || []);
      const withFlags = enriched.map((s) => ({
        ...s,
        is_frequent_cafeteria: frequent.has(String(s.cafeteria_id)),
      }));
      if (withFlags.length) await incrementViewCounts(withFlags.map((s) => s.id));
      res.json(withFlags);
    } catch (err) {
      res.status(500).json({ message: err.message || 'Server error' });
    }
  });

  return sr;
}

function createAdminRouter(auth) {
  const ar = express.Router();
  ar.use(auth);

  ar.get('/all', async (req, res) => {
    try {
      const dateStr = req.query.date || getTodayPktDateString();
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let q = supabase
        .from('daily_specials')
        .select('*', { count: 'exact' })
        .eq('valid_date', dateStr)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (req.query.cafeteriaId) q = q.eq('cafeteria_id', String(req.query.cafeteriaId));

      const { data, error, count } = await q;
      if (error) return res.status(500).json({ message: error.message });
      res.json({
        specials: await enrichSpecials(data || []),
        total: count ?? 0,
        page,
      });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Server error' });
    }
  });

  ar.patch('/:specialId/hide', async (req, res) => {
    if (!ensureServiceRole(res)) return;
    try {
      const { error } = await supabase
        .from('daily_specials')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', req.params.specialId);
      if (error) return res.status(500).json({ message: error.message });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message || 'Server error' });
    }
  });

  return ar;
}

module.exports = {
  router,
  createCafeteriaRouter,
  createStudentRouter,
  createAdminRouter,
  enrichSpecials,
  getTodayPktDateString,
};
