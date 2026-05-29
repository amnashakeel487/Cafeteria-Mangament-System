/** Simple in-memory rate limit: 5 requests per minute per IP */
const buckets = new Map();
const WINDOW_MS = 60 * 1000;
const MAX = 5;

function checkApprovalStatusLimit(ip) {
  const key = ip || 'unknown';
  const now = Date.now();
  let entry = buckets.get(key);
  if (!entry || now - entry.start > WINDOW_MS) {
    entry = { start: now, count: 0 };
    buckets.set(key, entry);
  }
  entry.count += 1;
  if (entry.count > MAX) {
    return false;
  }
  return true;
}

module.exports = { checkApprovalStatusLimit };
