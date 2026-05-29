const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Current instant as PKT calendar parts (via UTC shift). */
function pktParts(date = new Date()) {
  const pkt = new Date(date.getTime() + PKT_OFFSET_MS);
  return {
    year: pkt.getUTCFullYear(),
    month: pkt.getUTCMonth(),
    date: pkt.getUTCDate(),
    day: pkt.getUTCDay(),
    hour: pkt.getUTCHours(),
  };
}

/** UTC instant for PKT midnight on given calendar date. */
function pktMidnightUtc(year, monthIndex, day) {
  return new Date(Date.UTC(year, monthIndex, day, 0, 0, 0, 0) - PKT_OFFSET_MS);
}

function pktEndOfDayUtc(year, monthIndex, day) {
  return new Date(pktMidnightUtc(year, monthIndex, day + 1).getTime() - 1);
}

function toIso(d) {
  return d.toISOString();
}

function formatDateLabel(d) {
  const p = pktParts(d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[p.month]} ${p.date}, ${p.year}`;
}

function resolvePeriod(period, startDate, endDate) {
  const now = new Date();
  const p = pktParts(now);
  let start;
  let end = now;
  let label = period;

  switch (period) {
    case 'today': {
      start = pktMidnightUtc(p.year, p.month, p.date);
      label = 'Today';
      break;
    }
    case 'week': {
      const mondayOffset = p.day === 0 ? 6 : p.day - 1;
      const mondayDate = p.date - mondayOffset;
      start = pktMidnightUtc(p.year, p.month, mondayDate);
      label = 'This Week';
      break;
    }
    case 'month': {
      start = pktMidnightUtc(p.year, p.month, 1);
      label = 'This Month';
      break;
    }
    case 'custom': {
      if (!startDate || !endDate) {
        throw new Error('startDate and endDate required for custom period');
      }
      const [sy, sm, sd] = startDate.split('-').map(Number);
      const [ey, em, ed] = endDate.split('-').map(Number);
      start = pktMidnightUtc(sy, sm - 1, sd);
      end = pktEndOfDayUtc(ey, em - 1, ed);
      label = `${startDate} – ${endDate}`;
      break;
    }
    default:
      start = pktMidnightUtc(p.year, p.month, p.date - 6);
      label = 'Last 7 Days';
  }

  return {
    start,
    end,
    startIso: toIso(start),
    endIso: toIso(end),
    label,
  };
}

function previousPeriodRange({ start, end }) {
  const duration = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);
  return {
    start: prevStart,
    end: prevEnd,
    startIso: toIso(prevStart),
    endIso: toIso(prevEnd),
  };
}

function growthPct(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function hourLabel(h) {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pktHourFromIso(iso) {
  return pktParts(new Date(iso)).hour;
}

function pktDayFromIso(iso) {
  return pktParts(new Date(iso)).day;
}

function weekBoundsPkt() {
  const now = new Date();
  const p = pktParts(now);
  const mondayOffset = p.day === 0 ? 6 : p.day - 1;
  const thisWeekStart = pktMidnightUtc(p.year, p.month, p.date - mondayOffset);
  const lastWeekEnd = new Date(thisWeekStart.getTime() - 1);
  const lastMondayParts = pktParts(lastWeekEnd);
  const lastMondayOffset = lastMondayParts.day === 0 ? 6 : lastMondayParts.day - 1;
  const lastWeekStart = pktMidnightUtc(
    lastMondayParts.year,
    lastMondayParts.month,
    lastMondayParts.date - lastMondayOffset
  );

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(thisWeekStart.getTime() + i * DAY_MS);
    const dp = pktParts(d);
    days.push({
      day: DAY_NAMES[dp.day],
      date: `${dp.year}-${String(dp.month + 1).padStart(2, '0')}-${String(dp.date).padStart(2, '0')}`,
    });
  }

  return {
    thisWeekStart,
    thisWeekEnd: now,
    lastWeekStart,
    lastWeekEnd,
    dayMeta: days,
  };
}

module.exports = {
  weekBoundsPkt,
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
  PKT_OFFSET_MS,
  DAY_MS,
};
