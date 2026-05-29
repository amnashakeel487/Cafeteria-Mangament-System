const express = require('express');
const supabase = require('../database');
const {
  resolvePeriod,
  previousPeriodRange,
  growthPct,
  hourLabel,
  DAY_NAMES,
  pktHourFromIso,
  pktDayFromIso,
  pktParts,
  pktMidnightUtc,
  formatDateLabel,
  weekBoundsPkt,
} = require('../utils/analyticsDateRanges');

const router = express.Router();

function isRevenueOrder(order) {
  return order.status !== 'cancelled';
}

async function fetchOrdersInRange(cafeteriaId, startIso, endIso) {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      id, total_amount, status, created_at, payment_method,
      order_items (id, item_name, quantity, price),
      users (name)
    `
    )
    .eq('cafeteria_id', cafeteriaId)
    .gte('created_at', startIso)
    .lte('created_at', endIso)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function fetchMenuItems(cafeteriaId) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, category, price, avg_rating, rating_count')
    .eq('cafeteria_id', cafeteriaId);

  if (error) throw error;
  return data || [];
}

function matchMenuItem(menuByName, itemName) {
  const key = (itemName || '').trim().toLowerCase();
  return menuByName.get(key) || null;
}

function buildMenuNameMap(items) {
  const map = new Map();
  items.forEach((m) => map.set((m.name || '').trim().toLowerCase(), m));
  return map;
}

function aggregateOrderMetrics(orders) {
  const revenueOrders = orders.filter(isRevenueOrder);
  let totalRevenue = 0;
  let totalItemsSold = 0;
  let completedOrders = 0;
  let cancelledOrders = 0;
  let pendingOrders = 0;

  revenueOrders.forEach((o) => {
    totalRevenue += Number(o.total_amount) || 0;
    if (o.status === 'completed') completedOrders += 1;
    if (o.status === 'pending') pendingOrders += 1;
    (o.order_items || []).forEach((li) => {
      totalItemsSold += Number(li.quantity) || 0;
    });
  });

  orders.forEach((o) => {
    if (o.status === 'cancelled') cancelledOrders += 1;
  });

  return {
    totalRevenue,
    totalOrders: orders.length,
    revenueOrderCount: revenueOrders.length,
    averageOrderValue: revenueOrders.length ? totalRevenue / revenueOrders.length : 0,
    totalItemsSold,
    completedOrders,
    cancelledOrders,
    pendingOrders,
    revenueOrders,
  };
}

function aggregateItemSales(orders, menuItems) {
  const menuByName = buildMenuNameMap(menuItems);
  const map = new Map();

  orders.filter(isRevenueOrder).forEach((order) => {
    const orderIds = new Set();
    (order.order_items || []).forEach((li) => {
      const qty = Number(li.quantity) || 0;
      const price = Number(li.price) || 0;
      const menu = matchMenuItem(menuByName, li.item_name);
      const key = menu?.id ? `id:${menu.id}` : `name:${(li.item_name || '').toLowerCase()}`;
      const existing = map.get(key) || {
        menuItemId: menu?.id || null,
        name: li.item_name,
        category: menu?.category || 'Uncategorized',
        totalQuantity: 0,
        totalRevenue: 0,
        orderCount: 0,
        avgRating: menu?.avg_rating ?? null,
        orderIds: new Set(),
      };
      existing.totalQuantity += qty;
      existing.totalRevenue += qty * price;
      existing.orderIds.add(order.id);
      map.set(key, existing);
    });
  });

  const items = [...map.values()].map((row) => ({
    menuItemId: row.menuItemId,
    name: row.name,
    category: row.category,
    totalQuantity: row.totalQuantity,
    totalRevenue: Math.round(row.totalRevenue * 100) / 100,
    orderCount: row.orderIds.size,
    avgRating: row.avgRating,
  }));

  const totalItemsSold = items.reduce((s, i) => s + i.totalQuantity, 0);
  items.sort((a, b) => b.totalQuantity - a.totalQuantity);
  items.forEach((item, idx) => {
    item.rank = idx + 1;
    item.percentageOfTotal =
      totalItemsSold > 0
        ? Math.round((item.totalQuantity / totalItemsSold) * 1000) / 10
        : 0;
  });

  return { items, totalItemsSold };
}

function parseRange(req) {
  const period = req.query.period || 'week';
  return resolvePeriod(period, req.query.startDate, req.query.endDate);
}

// GET /overview
router.get('/overview', async (req, res) => {
  try {
    const cafeteriaId = req.cafeteria.id;
    const range = parseRange(req);
    const prev = previousPeriodRange(range);

    const [currentOrders, previousOrders, menuItems] = await Promise.all([
      fetchOrdersInRange(cafeteriaId, range.startIso, range.endIso),
      fetchOrdersInRange(cafeteriaId, prev.startIso, prev.endIso),
      fetchMenuItems(cafeteriaId),
    ]);

    const cur = aggregateOrderMetrics(currentOrders);
    const prevM = aggregateOrderMetrics(previousOrders);
    const { items } = aggregateItemSales(currentOrders, menuItems);

    const hourCounts = new Array(24).fill(0);
    cur.revenueOrders.forEach((o) => {
      hourCounts[pktHourFromIso(o.created_at)] += 1;
    });
    let peakHour = 0;
    hourCounts.forEach((c, h) => {
      if (c > hourCounts[peakHour]) peakHour = h;
    });

    const top = items[0] || null;

    res.json({
      totalRevenue: Math.round(cur.totalRevenue * 100) / 100,
      totalOrders: cur.totalOrders,
      averageOrderValue: Math.round(cur.averageOrderValue * 100) / 100,
      totalItemsSold: cur.totalItemsSold,
      completedOrders: cur.completedOrders,
      cancelledOrders: cur.cancelledOrders,
      pendingOrders: cur.pendingOrders,
      revenueGrowth: growthPct(cur.totalRevenue, prevM.totalRevenue),
      orderGrowth: growthPct(cur.revenueOrderCount, prevM.revenueOrderCount),
      topSellingItem: top
        ? { name: top.name, count: top.totalQuantity, revenue: top.totalRevenue }
        : null,
      busiestHour: { hour: hourLabel(peakHour), orderCount: hourCounts[peakHour] },
      period: {
        start: range.startIso,
        end: range.endIso,
        label: range.label,
      },
    });
  } catch (err) {
    console.error('analytics overview:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// GET /best-selling
router.get('/best-selling', async (req, res) => {
  try {
    const cafeteriaId = req.cafeteria.id;
    const range = parseRange(req);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    const [orders, menuItems] = await Promise.all([
      fetchOrdersInRange(cafeteriaId, range.startIso, range.endIso),
      fetchMenuItems(cafeteriaId),
    ]);

    const { items, totalItemsSold } = aggregateItemSales(orders, menuItems);

    res.json({
      items: items.slice(0, limit),
      totalItemsSold,
      period: { start: range.startIso, end: range.endIso },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /peak-hours
router.get('/peak-hours', async (req, res) => {
  try {
    const cafeteriaId = req.cafeteria.id;
    const range = parseRange(req);
    const orders = await fetchOrdersInRange(cafeteriaId, range.startIso, range.endIso);
    const completed = orders.filter((o) => o.status === 'completed');

    const hourly = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      label: hourLabel(hour),
      orderCount: 0,
      revenue: 0,
    }));

    const dayHour = {};
    const dayTotals = Array(7).fill(0);

    completed.forEach((o) => {
      const h = pktHourFromIso(o.created_at);
      const d = pktDayFromIso(o.created_at);
      hourly[h].orderCount += 1;
      hourly[h].revenue += Number(o.total_amount) || 0;
      dayTotals[d] += 1;
      const key = `${d}-${h}`;
      dayHour[key] = (dayHour[key] || 0) + 1;
    });

    hourly.forEach((row) => {
      row.revenue = Math.round(row.revenue * 100) / 100;
      row.avgOrderValue = row.orderCount ? row.revenue / row.orderCount : 0;
    });

    const byDayAndHour = [];
    for (let d = 0; d < 7; d += 1) {
      for (let h = 0; h < 24; h += 1) {
        byDayAndHour.push({
          day: DAY_NAMES[d],
          hour: h,
          orderCount: dayHour[`${d}-${h}`] || 0,
        });
      }
    }

    let peakHour = 0;
    let quietestHour = 0;
    let peakDay = 0;
    hourly.forEach((row, h) => {
      if (row.orderCount > hourly[peakHour].orderCount) peakHour = h;
      if (row.orderCount < hourly[quietestHour].orderCount) quietestHour = h;
    });
    dayTotals.forEach((c, d) => {
      if (c > dayTotals[peakDay]) peakDay = d;
    });

    res.json({
      hourly,
      byDayAndHour,
      peakHour: {
        hour: peakHour,
        label: hourLabel(peakHour),
        orderCount: hourly[peakHour].orderCount,
      },
      quietestHour: {
        hour: quietestHour,
        label: hourLabel(quietestHour),
        orderCount: hourly[quietestHour].orderCount,
      },
      peakDay: { day: DAY_NAMES[peakDay], orderCount: dayTotals[peakDay] },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /by-category
router.get('/by-category', async (req, res) => {
  try {
    const cafeteriaId = req.cafeteria.id;
    const range = parseRange(req);
    const [orders, menuItems] = await Promise.all([
      fetchOrdersInRange(cafeteriaId, range.startIso, range.endIso),
      fetchMenuItems(cafeteriaId),
    ]);

    const { items } = aggregateItemSales(orders, menuItems);
    const catMap = new Map();

    items.forEach((item) => {
      const cat = item.category || 'Uncategorized';
      const row = catMap.get(cat) || {
        categoryId: cat,
        categoryName: cat,
        totalRevenue: 0,
        totalItemsSold: 0,
        orderCount: 0,
        bestItem: { name: item.name, quantity: 0 },
      };
      row.totalRevenue += item.totalRevenue;
      row.totalItemsSold += item.totalQuantity;
      row.orderCount += item.orderCount;
      if (item.totalQuantity > row.bestItem.quantity) {
        row.bestItem = { name: item.name, quantity: item.totalQuantity };
      }
      catMap.set(cat, row);
    });

    const totalRevenue = [...catMap.values()].reduce((s, c) => s + c.totalRevenue, 0);
    const categories = [...catMap.values()]
      .map((c) => ({
        ...c,
        totalRevenue: Math.round(c.totalRevenue * 100) / 100,
        percentageOfRevenue:
          totalRevenue > 0
            ? Math.round((c.totalRevenue / totalRevenue) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json({
      categories,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      topCategory: categories[0]
        ? { name: categories[0].categoryName, revenue: categories[0].totalRevenue }
        : null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /weekly-comparison
router.get('/weekly-comparison', async (req, res) => {
  try {
    const cafeteriaId = req.cafeteria.id;
    const wb = weekBoundsPkt();

    const [thisWeekOrders, lastWeekOrders] = await Promise.all([
      fetchOrdersInRange(cafeteriaId, wb.thisWeekStart.toISOString(), wb.thisWeekEnd.toISOString()),
      fetchOrdersInRange(cafeteriaId, wb.lastWeekStart.toISOString(), wb.lastWeekEnd.toISOString()),
    ]);

    function buildWeek(orders, dayMeta) {
      const days = dayMeta.map((meta) => ({
        ...meta,
        revenue: 0,
        orders: 0,
      }));

      orders.filter(isRevenueOrder).forEach((o) => {
        const p = pktParts(new Date(o.created_at));
        const key = `${p.year}-${String(p.month + 1).padStart(2, '0')}-${String(p.date).padStart(2, '0')}`;
        const day = days.find((d) => d.date === key);
        if (day) {
          day.revenue += Number(o.total_amount) || 0;
          day.orders += 1;
        }
      });

      days.forEach((d) => {
        d.revenue = Math.round(d.revenue * 100) / 100;
      });

      return {
        total_revenue: days.reduce((s, d) => s + d.revenue, 0),
        total_orders: days.reduce((s, d) => s + d.orders, 0),
        days,
      };
    }

    const thisWeek = buildWeek(thisWeekOrders, wb.dayMeta);
    const lastWeek = buildWeek(lastWeekOrders, wb.dayMeta);

    const revenueChange = thisWeek.total_revenue - lastWeek.total_revenue;
    const ordersChange = thisWeek.total_orders - lastWeek.total_orders;

    const bestThis = [...thisWeek.days].sort((a, b) => b.revenue - a.revenue)[0];
    const bestLast = [...lastWeek.days].sort((a, b) => b.revenue - a.revenue)[0];

    res.json({
      thisWeek,
      lastWeek,
      comparison: {
        revenueChange: Math.round(revenueChange * 100) / 100,
        revenueGrowth: growthPct(thisWeek.total_revenue, lastWeek.total_revenue),
        ordersChange,
        ordersGrowth: growthPct(thisWeek.total_orders, lastWeek.total_orders),
        bestDayThisWeek: bestThis ? { day: bestThis.day, revenue: bestThis.revenue } : null,
        bestDayLastWeek: bestLast ? { day: bestLast.day, revenue: bestLast.revenue } : null,
      },
    });
  } catch (err) {
    console.error('weekly-comparison:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /revenue-trend
router.get('/revenue-trend', async (req, res) => {
  try {
    const cafeteriaId = req.cafeteria.id;
    const period = req.query.period || '30days';
    const now = new Date();
    const p = pktParts(now);

    let start;
    let bucket = 'day';

    if (period === '90days') {
      start = new Date(pktMidnightUtc(p.year, p.month, p.date - 89));
      bucket = 'day';
    } else if (period === '6months') {
      start = pktMidnightUtc(p.year, p.month - 5, 1);
      bucket = 'week';
    } else if (period === 'year') {
      start = pktMidnightUtc(p.year - 1, p.month, p.date);
      bucket = 'month';
    } else {
      start = new Date(pktMidnightUtc(p.year, p.month, p.date - 29));
      bucket = 'day';
    }

    const orders = await fetchOrdersInRange(
      cafeteriaId,
      start.toISOString(),
      now.toISOString()
    );

    const buckets = new Map();

    orders.filter(isRevenueOrder).forEach((o) => {
      const d = new Date(o.created_at);
      const dp = pktParts(d);
      let key;
      let label;
      if (bucket === 'month') {
        key = `${dp.year}-${dp.month}`;
        label = formatDateLabel(pktMidnightUtc(dp.year, dp.month, 1)).slice(0, 8);
      } else if (bucket === 'week') {
        const mondayOffset = dp.day === 0 ? 6 : dp.day - 1;
        const mon = pktMidnightUtc(dp.year, dp.month, dp.date - mondayOffset);
        key = mon.toISOString().slice(0, 10);
        label = `Week of ${key}`;
      } else {
        key = `${dp.year}-${String(dp.month + 1).padStart(2, '0')}-${String(dp.date).padStart(2, '0')}`;
        label = key;
      }
      const row = buckets.get(key) || { date: key, label, revenue: 0, orders: 0 };
      row.revenue += Number(o.total_amount) || 0;
      row.orders += 1;
      buckets.set(key, row);
    });

    const trend = [...buckets.values()]
      .map((r) => ({ ...r, revenue: Math.round(r.revenue * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalRevenue = trend.reduce((s, t) => s + t.revenue, 0);

    res.json({
      trend,
      period,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgPerPeriod: trend.length ? Math.round((totalRevenue / trend.length) * 100) / 100 : 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /export
router.get('/export', async (req, res) => {
  try {
    const cafeteriaId = req.cafeteria.id;
    const type = req.query.type || 'orders';
    const range = resolvePeriod(
      req.query.period || 'custom',
      req.query.startDate,
      req.query.endDate
    );

    const [orders, menuItems] = await Promise.all([
      fetchOrdersInRange(cafeteriaId, range.startIso, range.endIso),
      fetchMenuItems(cafeteriaId),
    ]);

    if (type === 'items') {
      const { items } = aggregateItemSales(orders, menuItems);
      return res.json({ type, items, period: range });
    }

    if (type === 'summary') {
      const metrics = aggregateOrderMetrics(orders);
      const { items } = aggregateItemSales(orders, menuItems);
      return res.json({
        type,
        period: range,
        summary: {
          totalRevenue: metrics.totalRevenue,
          totalOrders: metrics.totalOrders,
          averageOrderValue: metrics.averageOrderValue,
          totalItemsSold: metrics.totalItemsSold,
          completedOrders: metrics.completedOrders,
          cancelledOrders: metrics.cancelledOrders,
        },
        topItems: items.slice(0, 10),
      });
    }

    const orderRows = orders.map((o) => ({
      id: o.id,
      created_at: o.created_at,
      student_name: o.users?.name || '-',
      item_count: (o.order_items || []).reduce((s, li) => s + (Number(li.quantity) || 0), 0),
      total_amount: o.total_amount,
      payment_method: o.payment_method,
      status: o.status,
      items: o.order_items,
    }));

    res.json({ type: 'orders', orders: orderRows, period: range });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
