const express = require('express');
const supabase = require('../database');
const studentAuth = require('../middleware/studentAuth');
const cafeteriaAuth = require('../middleware/cafeteriaAuth');
const auth = require('../middleware/auth');
const {
  studentDisplayName,
  buildDistribution,
  recalcMenuItemRating,
  recalcCafeteriaRating,
  assertOrderCompletedForStudent,
  menuItemOnOrder,
} = require('../utils/ratingHelpers');

const router = express.Router();

function parseRating(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 5) return null;
  return n;
}

function parsePageLimit(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const from = (page - 1) * limit;
  return { page, limit, from, to: from + limit - 1 };
}

async function fetchStudentNames(studentIds) {
  const ids = [...new Set(studentIds.map(String))].filter(Boolean);
  if (!ids.length) return {};
  const { data } = await supabase
    .from('users')
    .select('id, name')
    .in('id', ids.map((id) => (Number.isNaN(Number(id)) ? id : Number(id))));
  const map = {};
  (data || []).forEach((u) => {
    map[String(u.id)] = studentDisplayName(u.name);
  });
  return map;
}

// POST /api/ratings/menu-item
router.post('/menu-item', studentAuth, async (req, res) => {
  try {
    const { menuItemId, orderId, cafeteriaId, rating, reviewText } = req.body;
    const studentId = String(req.user.id);
    const stars = parseRating(rating);
    if (!menuItemId || !orderId || !cafeteriaId || stars === null) {
      return res.status(400).json({ message: 'Invalid rating data' });
    }

    const check = await assertOrderCompletedForStudent(orderId, studentId);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const onOrder = await menuItemOnOrder(orderId, cafeteriaId, menuItemId);
    if (!onOrder.ok) return res.status(400).json({ message: onOrder.message });

    const { data: existing } = await supabase
      .from('menu_item_ratings')
      .select('id')
      .eq('menu_item_id', menuItemId)
      .eq('student_id', studentId)
      .eq('order_id', orderId)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ message: 'You already rated this item for this order' });
    }

    const { data: row, error } = await supabase
      .from('menu_item_ratings')
      .insert({
        menu_item_id: menuItemId,
        student_id: studentId,
        order_id: orderId,
        cafeteria_id: String(cafeteriaId),
        rating: stars,
        review_text: reviewText?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('menu_item_ratings insert:', error);
      return res.status(500).json({ message: 'Failed to save rating' });
    }

    const stats = await recalcMenuItemRating(menuItemId);
    res.status(201).json({ ...row, ...stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/ratings/cafeteria
router.post('/cafeteria', studentAuth, async (req, res) => {
  try {
    const { cafeteriaId, orderId, rating, reviewText } = req.body;
    const studentId = String(req.user.id);
    const stars = parseRating(rating);
    const text = (reviewText || '').trim();

    if (!cafeteriaId || !orderId || stars === null) {
      return res.status(400).json({ message: 'Invalid review data' });
    }
    if (text.length < 10) {
      return res.status(400).json({ message: 'Review must be at least 10 characters' });
    }

    const check = await assertOrderCompletedForStudent(orderId, studentId);
    if (!check.ok) return res.status(check.status).json({ message: check.message });
    if (String(check.order.cafeteria_id) !== String(cafeteriaId)) {
      return res.status(400).json({ message: 'Cafeteria does not match order' });
    }

    const { data: existing } = await supabase
      .from('cafeteria_reviews')
      .select('id')
      .eq('cafeteria_id', String(cafeteriaId))
      .eq('student_id', studentId)
      .eq('order_id', orderId)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ message: 'You already reviewed this cafeteria for this order' });
    }

    const { data: row, error } = await supabase
      .from('cafeteria_reviews')
      .insert({
        cafeteria_id: String(cafeteriaId),
        student_id: studentId,
        order_id: orderId,
        rating: stars,
        review_text: text,
      })
      .select()
      .single();

    if (error) {
      console.error('cafeteria_reviews insert:', error);
      return res.status(500).json({ message: 'Failed to save review' });
    }

    const stats = await recalcCafeteriaRating(cafeteriaId);
    res.status(201).json({ ...row, ...stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ratings/menu-item/:menuItemId
router.get('/menu-item/:menuItemId', async (req, res) => {
  try {
    const menuItemId = req.params.menuItemId;
    const { page, limit, from, to } = parsePageLimit(req.query);

    const { data: item } = await supabase
      .from('menu_items')
      .select('avg_rating, rating_count')
      .eq('id', menuItemId)
      .maybeSingle();

    const { data: allVisible } = await supabase
      .from('menu_item_ratings')
      .select('rating')
      .eq('menu_item_id', menuItemId)
      .eq('is_visible', true);

    const distribution = buildDistribution(allVisible);

    const { data: rows, count, error } = await supabase
      .from('menu_item_ratings')
      .select('id, rating, review_text, student_id, created_at', { count: 'exact' })
      .eq('menu_item_id', menuItemId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return res.status(500).json({ message: 'Failed to load ratings' });

    const nameMap = await fetchStudentNames((rows || []).map((r) => r.student_id));
    const reviews = (rows || []).map((r) => ({
      id: r.id,
      rating: r.rating,
      review_text: r.review_text,
      student_display_name: nameMap[String(r.student_id)] || 'Student',
      created_at: r.created_at,
    }));

    res.json({
      avg_rating: Number(item?.avg_rating) || 0,
      rating_count: item?.rating_count || 0,
      distribution,
      reviews,
      page,
      limit,
      total: count || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ratings/cafeteria/:cafeteriaId
router.get('/cafeteria/:cafeteriaId', async (req, res) => {
  try {
    const cafeteriaId = String(req.params.cafeteriaId);
    const { page, limit, from, to } = parsePageLimit(req.query);

    const { data: cafe } = await supabase
      .from('cafeterias')
      .select('avg_rating, rating_count')
      .eq('id', cafeteriaId)
      .maybeSingle();

    const { data: allVisible } = await supabase
      .from('cafeteria_reviews')
      .select('rating')
      .eq('cafeteria_id', cafeteriaId)
      .eq('is_visible', true);

    const distribution = buildDistribution(allVisible);

    const { data: rows, count, error } = await supabase
      .from('cafeteria_reviews')
      .select(
        'id, rating, review_text, student_id, created_at, cafeteria_reply, cafeteria_replied_at',
        { count: 'exact' }
      )
      .eq('cafeteria_id', cafeteriaId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return res.status(500).json({ message: 'Failed to load reviews' });

    const nameMap = await fetchStudentNames((rows || []).map((r) => r.student_id));
    const reviews = (rows || []).map((r) => ({
      id: r.id,
      rating: r.rating,
      review_text: r.review_text,
      student_display_name: nameMap[String(r.student_id)] || 'Student',
      created_at: r.created_at,
      cafeteria_reply: r.cafeteria_reply,
      cafeteria_replied_at: r.cafeteria_replied_at,
    }));

    res.json({
      avg_rating: Number(cafe?.avg_rating) || 0,
      rating_count: cafe?.rating_count || 0,
      distribution,
      reviews,
      page,
      limit,
      total: count || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ratings/check-order/:orderId
router.get('/check-order/:orderId', studentAuth, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const studentId = String(req.user.id);

    const check = await assertOrderCompletedForStudent(orderId, studentId);
    if (!check.ok && check.status === 404) {
      return res.status(404).json({ message: check.message });
    }
    if (!check.ok) {
      return res.json({
        ratedItemIds: [],
        cafeteriaReviewed: false,
        canReview: false,
      });
    }

    const { data: itemRatings } = await supabase
      .from('menu_item_ratings')
      .select('menu_item_id, rating, review_text')
      .eq('order_id', orderId)
      .eq('student_id', studentId);

    const { data: cafeReview } = await supabase
      .from('cafeteria_reviews')
      .select('id, rating, review_text')
      .eq('order_id', orderId)
      .eq('student_id', studentId)
      .maybeSingle();

    const ratedItemIds = (itemRatings || []).map((r) => r.menu_item_id);

    const { data: lines } = await supabase
      .from('order_items')
      .select('item_name')
      .eq('order_id', orderId);

    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name')
      .eq('cafeteria_id', check.order.cafeteria_id);

    const lineNames = new Set(
      (lines || []).map((l) => (l.item_name || '').trim().toLowerCase())
    );
    const rateableIds = (menuItems || [])
      .filter((m) => lineNames.has((m.name || '').trim().toLowerCase()))
      .map((m) => m.id);

    const allItemsRated =
      rateableIds.length === 0 ||
      rateableIds.every((id) => ratedItemIds.includes(id));
    const fullyReviewed = !!cafeReview && allItemsRated;
    const partiallyReviewed =
      !fullyReviewed && (ratedItemIds.length > 0 || !!cafeReview);

    res.json({
      ratedItemIds,
      rateableItemIds: rateableIds,
      itemRatings: itemRatings || [],
      cafeteriaReview: cafeReview || null,
      cafeteriaReviewed: !!cafeReview,
      fullyReviewed,
      partiallyReviewed,
      canReview: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/ratings/cafeteria-reply/:reviewId
router.post('/cafeteria-reply/:reviewId', cafeteriaAuth, async (req, res) => {
  try {
    const { replyText } = req.body;
    const text = (replyText || '').trim();
    if (!text) return res.status(400).json({ message: 'Reply cannot be empty' });

    const { data: review } = await supabase
      .from('cafeteria_reviews')
      .select('*')
      .eq('id', req.params.reviewId)
      .maybeSingle();

    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (String(review.cafeteria_id) !== String(req.cafeteria.id)) {
      return res.status(403).json({ message: 'Not your review' });
    }

    const { data: updated, error } = await supabase
      .from('cafeteria_reviews')
      .update({
        cafeteria_reply: text,
        cafeteria_replied_at: new Date().toISOString(),
      })
      .eq('id', req.params.reviewId)
      .select()
      .single();

    if (error) return res.status(500).json({ message: 'Failed to save reply' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ratings/my-menu-items
router.get('/my-menu-items', cafeteriaAuth, async (req, res) => {
  try {
    const cafeteriaId = String(req.cafeteria.id);

    const { data: items, error: itemsErr } = await supabase
      .from('menu_items')
      .select('id, name, price, image_url, avg_rating, rating_count')
      .eq('cafeteria_id', cafeteriaId)
      .order('avg_rating', { ascending: false });

    if (itemsErr) return res.status(500).json({ message: 'Failed to load menu items' });

    const enriched = await Promise.all(
      (items || []).map(async (item) => {
        const { data: reviews } = await supabase
          .from('menu_item_ratings')
          .select('id, rating, review_text, student_id, created_at')
          .eq('menu_item_id', item.id)
          .eq('is_visible', true)
          .order('created_at', { ascending: false })
          .limit(3);

        const nameMap = await fetchStudentNames((reviews || []).map((r) => r.student_id));
        return {
          ...item,
          recent_reviews: (reviews || []).map((r) => ({
            ...r,
            student_display_name: nameMap[String(r.student_id)] || 'Student',
          })),
        };
      })
    );

    const { data: cafeReviewsRaw } = await supabase
      .from('cafeteria_reviews')
      .select('*')
      .eq('cafeteria_id', cafeteriaId)
      .order('created_at', { ascending: false });

    const cafeNameMap = await fetchStudentNames(
      (cafeReviewsRaw || []).map((r) => r.student_id)
    );
    const cafeReviews = (cafeReviewsRaw || []).map((r) => ({
      ...r,
      student_display_name: cafeNameMap[String(r.student_id)] || 'Student',
    }));

    const { data: cafe } = await supabase
      .from('cafeterias')
      .select('avg_rating, rating_count, name')
      .eq('id', cafeteriaId)
      .maybeSingle();

    const ratedItems = enriched.filter((i) => (i.rating_count || 0) > 0);
    const bestItem = ratedItems.length
      ? ratedItems.reduce((a, b) =>
          Number(b.avg_rating) > Number(a.avg_rating) ? b : a
        )
      : null;

    res.json({
      cafeteria: cafe,
      menuItems: enriched,
      cafeteriaReviews: cafeReviews || [],
      summary: {
        avg_rating: cafe?.avg_rating || 0,
        totalReviews: cafe?.rating_count || 0,
        itemsRated: ratedItems.length,
        bestItem: bestItem ? { id: bestItem.id, name: bestItem.name, avg_rating: bestItem.avg_rating } : null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/ratings/hide/:type/:id
router.patch('/hide/:type/:id', auth, async (req, res) => {
  try {
    const { type, id } = req.params;
    if (type === 'menu-item') {
      const { data: row } = await supabase
        .from('menu_item_ratings')
        .update({ is_visible: false })
        .eq('id', id)
        .select()
        .single();
      if (!row) return res.status(404).json({ message: 'Rating not found' });
      await recalcMenuItemRating(row.menu_item_id);
      return res.json(row);
    }
    if (type === 'cafeteria') {
      const { data: row } = await supabase
        .from('cafeteria_reviews')
        .update({ is_visible: false })
        .eq('id', id)
        .select()
        .single();
      if (!row) return res.status(404).json({ message: 'Review not found' });
      await recalcCafeteriaRating(row.cafeteria_id);
      return res.json(row);
    }
    return res.status(400).json({ message: 'Invalid type' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ratings/top-cafeterias
router.get('/top-cafeterias', async (req, res) => {
  try {
    const { data: cafes, error } = await supabase
      .from('cafeterias')
      .select('id, name, location, profile_picture, avg_rating, rating_count')
      .gte('avg_rating', 3.5)
      .gte('rating_count', 3)
      .order('avg_rating', { ascending: false })
      .order('rating_count', { ascending: false })
      .limit(6);

    if (error) return res.status(500).json({ message: 'Failed to load cafeterias' });

    const withSnippets = await Promise.all(
      (cafes || []).map(async (c) => {
        const { data: latest } = await supabase
          .from('cafeteria_reviews')
          .select('review_text, student_id')
          .eq('cafeteria_id', String(c.id))
          .eq('is_visible', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        let reviewer_first_name = null;
        let top_review_snippet = null;
        if (latest) {
          top_review_snippet = (latest.review_text || '').slice(0, 80);
          const { data: user } = await supabase
            .from('users')
            .select('name')
            .eq('id', latest.student_id)
            .maybeSingle();
          if (user?.name) {
            reviewer_first_name = user.name.trim().split(/\s+/)[0];
          }
        }

        return {
          id: c.id,
          name: c.name,
          location: c.location,
          description: c.location,
          profile_image: c.profile_picture,
          avg_rating: c.avg_rating,
          rating_count: c.rating_count,
          top_review_snippet,
          reviewer_first_name,
        };
      })
    );

    res.json(withSnippets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ratings/admin/moderation — list for admin portal
router.get('/admin/moderation', auth, async (req, res) => {
  try {
    const filter = req.query.filter || 'all';

    let menuQuery = supabase
      .from('menu_item_ratings')
      .select('id, rating, review_text, created_at, is_visible, student_id, cafeteria_id, menu_item_id')
      .order('created_at', { ascending: false })
      .limit(100);

    let cafeQuery = supabase
      .from('cafeteria_reviews')
      .select('id, rating, review_text, created_at, is_visible, student_id, cafeteria_id')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filter === 'hidden') {
      menuQuery = menuQuery.eq('is_visible', false);
      cafeQuery = cafeQuery.eq('is_visible', false);
    } else if (filter === 'visible') {
      menuQuery = menuQuery.eq('is_visible', true);
      cafeQuery = cafeQuery.eq('is_visible', true);
    }

    const [{ data: menuRatings }, { data: cafeReviews }] = await Promise.all([
      menuQuery,
      cafeQuery,
    ]);

    const studentIds = [
      ...(menuRatings || []).map((r) => r.student_id),
      ...(cafeReviews || []).map((r) => r.student_id),
    ];
    const nameMap = await fetchStudentNames(studentIds);

    const cafeteriaIds = [
      ...new Set([
        ...(menuRatings || []).map((r) => r.cafeteria_id),
        ...(cafeReviews || []).map((r) => r.cafeteria_id),
      ]),
    ];
    const { data: cafes } = await supabase
      .from('cafeterias')
      .select('id, name')
      .in('id', cafeteriaIds.length ? cafeteriaIds : [0]);

    const cafeNameMap = {};
    (cafes || []).forEach((c) => {
      cafeNameMap[String(c.id)] = c.name;
    });

    res.json({
      menuItemRatings: (menuRatings || []).map((r) => ({
        ...r,
        type: 'menu-item',
        student_name: nameMap[String(r.student_id)] || 'Student',
        cafeteria_name: cafeNameMap[String(r.cafeteria_id)] || r.cafeteria_id,
      })),
      cafeteriaReviews: (cafeReviews || []).map((r) => ({
        ...r,
        type: 'cafeteria',
        student_name: nameMap[String(r.student_id)] || 'Student',
        cafeteria_name: cafeNameMap[String(r.cafeteria_id)] || r.cafeteria_id,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
