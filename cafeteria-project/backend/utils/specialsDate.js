const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

function pktParts(date = new Date()) {
  const pkt = new Date(date.getTime() + PKT_OFFSET_MS);
  return {
    year: pkt.getUTCFullYear(),
    month: pkt.getUTCMonth(),
    date: pkt.getUTCDate(),
  };
}

/** YYYY-MM-DD in Pakistan (PKT) */
function getTodayPktDateString(date = new Date()) {
  const p = pktParts(date);
  const m = String(p.month + 1).padStart(2, '0');
  const d = String(p.date).padStart(2, '0');
  return `${p.year}-${m}-${d}`;
}

function addDaysToPktDateString(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utc = Date.UTC(y, m - 1, d);
  return getTodayPktDateString(new Date(utc + days * 24 * 60 * 60 * 1000 - PKT_OFFSET_MS));
}

function isValidDateString(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

module.exports = { getTodayPktDateString, addDaysToPktDateString, isValidDateString, pktParts };
