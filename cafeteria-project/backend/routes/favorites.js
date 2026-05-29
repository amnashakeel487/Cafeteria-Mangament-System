const express = require('express');
const supabase = require('../database');

const router = express.Router();

function studentId(req) {
  return String(req.user.id);
}

function itemAvailable(row) {
  if (typeof row?.is_available === 'boolean') return row.is_available;
  if (typeof row?.available === 'boolean') return row.available;
  if (typeof row?.in_stock === 'boolean') return row.in_stock;
  if (typeof row?.status === 'string') return row.status.toLowerCase() !== 'out of stock';
  return true;
}

function mapMenuItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    image_url: row.image_url,
    is_available: itemAvailable(row),
    avg_rating: row.avg_rating ?? 0,
    rating_count: row.rating_count ?? 0,
    cafeteria_id: row.cafeteria_id,
  };
}

async function enrichFavorites(rows) {
  if (!rows?.length) return [];

  const itemIds = [...new Set(rows.map((r) => r.menu_item_id))];
  const cafeIds = [...new Set(rows.map((r) => r.cafeteria_id))];

  const [{ data: items }, { data: cafes }] = await Promise.all([
    supabase.from('menu_items').select('*').in('id', itemIds),
    supabase.from('cafeterias').select('id, name, location, profile_picture').in('id', cafeIds),
  ]);

  const itemMap = {};
  (items || []).forEach((i) => {
    itemMap[String(i.id)] = i;
  });
  const cafeMap = {};
  (cafes || []).forEach((c) => {
    cafeMap[String(c.id)] = c;
  });

  return rows.map((fav) => {
    const raw = itemMap[String(fav.menu_item_id)];
    const cafe = cafeMap[String(fav.cafeteria_id)];
    const menuItem = mapMenuItem(raw);
    return {
      id: fav.id,
      student_id: fav.student_id,
      menu_item_id: fav.menu_item_id,
      cafeteria_id: fav.cafeteria_id,
      created_at: fav.created_at,
      menuItem,
      cafeteria: cafe
        ? {
            id: cafe.id,
            name: cafe.name,
            location: cafe.location,
            profile_picture: cafe.profile_picture,
          }
        : { id: fav.cafeteria_id, name: 'Cafeteria' },
    };
  });
}

// GET /ids — lightweight list for heart state
router.get('/ids', async (req, res) => {
  try {
    const sid = studentId(req);
    const { data, error } = await supabase
      .from('favorites')
      .select('menu_item_id')
      .eq('student_id', sid);

    if (error) return res.status(500).json({ message: 'Failed to load favorites' });

    res.json({
      favoriteIds: (data || []).map((r) => String(r.menu_item_id)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /quick-reorder — validate items for cart (must be before /:menuItemId)
router.post('/quick-reorder', async (req, res) => {
  try {
    const { menuItemIds, cafeteriaId } = req.body;
    const sid = studentId(req);

    if (!cafeteriaId || !Array.isArray(menuItemIds) || !menuItemIds.length) {
      return res.status(400).json({ message: 'menuItemIds and cafeteriaId are required' });
    }

    const ids = [...new Set(menuItemIds.map(String))];

    const { data: items, error } = await supabase
      .from('menu_items')
      .select('*')
      .in('id', ids)
      .eq('cafeteria_id', cafeteriaId);

    if (error) return res.status(500).json({ message: 'Database error' });

    if (!items || items.length !== ids.length) {
      return res.status(400).json({
        message: 'Some items were not found or do not belong to this cafeteria',
      });
    }

    const unavailable = items.filter((i) => !itemAvailable(i));
    if (unavailable.length) {
      return res.status(400).json({
        message: `Unavailable: ${unavailable.map((i) => i.name).join(', ')}`,
        unavailable: unavailable.map((i) => i.id),
      });
    }

    const { data: cafe } = await supabase
      .from('cafeterias')
      .select('id, name')
      .eq('id', cafeteriaId)
      .maybeSingle();

    const { data: favRows } = await supabase
      .from('favorites')
      .select('menu_item_id')
      .eq('student_id', sid)
      .in('menu_item_id', ids);

    const favSet = new Set((favRows || []).map((r) => String(r.menu_item_id)));
    const missingFav = ids.filter((id) => !favSet.has(id));
    if (missingFav.length) {
      return res.status(400).json({ message: 'Some items are not in your favorites' });
    }

    res.json({
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        image_url: i.image_url,
        category: i.category,
        description: i.description,
        quantity: 1,
      })),
      cafeteriaId: String(cafeteriaId),
      cafeteriaName: cafe?.name || 'Cafeteria',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET / — full list
router.get('/', async (req, res) => {
  try {
    const sid = studentId(req);
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('student_id', sid)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ message: 'Failed to load favorites' });

    const enriched = await enrichFavorites(data || []);
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST / — add favorite
router.post('/', async (req, res) => {
  try {
    const { menuItemId, cafeteriaId } = req.body;
    const sid = studentId(req);

    if (!menuItemId || !cafeteriaId) {
      return res.status(400).json({ message: 'menuItemId and cafeteriaId are required' });
    }

    const { data: menuItem, error: itemErr } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', menuItemId)
      .maybeSingle();

    if (itemErr) return res.status(500).json({ message: 'Database error' });
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });
    if (String(menuItem.cafeteria_id) !== String(cafeteriaId)) {
      return res.status(400).json({ message: 'Item does not belong to this cafeteria' });
    }

    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('student_id', sid)
      .eq('menu_item_id', menuItemId)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ message: 'This item is already in your favorites' });
    }

    const { data: inserted, error } = await supabase
      .from('favorites')
      .insert({
        student_id: sid,
        menu_item_id: menuItemId,
        cafeteria_id: String(cafeteriaId),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ message: 'This item is already in your favorites' });
      }
      return res.status(500).json({ message: 'Failed to save favorite' });
    }

    const [enriched] = await enrichFavorites([inserted]);
    res.status(201).json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /:menuItemId
router.delete('/:menuItemId', async (req, res) => {
  try {
    const sid = studentId(req);
    const menuItemId = req.params.menuItemId;

    const { data, error } = await supabase
      .from('favorites')
      .delete()
      .eq('student_id', sid)
      .eq('menu_item_id', menuItemId)
      .select('id');

    if (error) return res.status(500).json({ message: 'Failed to remove favorite' });
    if (!data?.length) return res.status(404).json({ message: 'Favorite not found' });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
