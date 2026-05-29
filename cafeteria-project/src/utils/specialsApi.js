import axios from 'axios';

const BASE = '';

export async function fetchLandingPreview() {
  const res = await axios.get(`${BASE}/api/specials/landing-preview`);
  return res.data;
}

export async function fetchAllToday(params = {}) {
  const res = await axios.get(`${BASE}/api/specials/all-today`, { params });
  return res.data;
}

export async function fetchTodaySpecials(params = {}) {
  const res = await axios.get(`${BASE}/api/specials/today`, { params });
  return res.data;
}

export async function fetchStudentTodaySpecials(params = {}) {
  const token = localStorage.getItem('studentToken');
  const res = await axios.get(`${BASE}/api/specials/student/today`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function fetchCafeteriaSpecials(date, status = 'active') {
  const token = localStorage.getItem('cafeteriaToken');
  const res = await axios.get(`${BASE}/api/specials/cafeteria/mine`, {
    params: { date, status },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function createCafeteriaSpecial(body) {
  const token = localStorage.getItem('cafeteriaToken');
  const res = await axios.post(`${BASE}/api/specials/cafeteria`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateCafeteriaSpecial(id, body) {
  const token = localStorage.getItem('cafeteriaToken');
  const res = await axios.patch(`${BASE}/api/specials/cafeteria/${id}`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function toggleCafeteriaSpecial(id) {
  const token = localStorage.getItem('cafeteriaToken');
  const res = await axios.patch(`${BASE}/api/specials/cafeteria/${id}/toggle`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function deleteCafeteriaSpecial(id) {
  const token = localStorage.getItem('cafeteriaToken');
  const res = await axios.delete(`${BASE}/api/specials/cafeteria/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function reorderCafeteriaSpecials(orders) {
  const token = localStorage.getItem('cafeteriaToken');
  const res = await axios.patch(
    `${BASE}/api/specials/cafeteria/reorder`,
    { orders },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export function formatSpecialTimeWindow(start, end) {
  if (!start || !end) return null;
  if (start === '00:00:00' || start === '00:00') {
    if (end === '23:59:00' || end === '23:59') return null;
  }
  const fmt = (t) => {
    const [h, m] = String(t).slice(0, 5).split(':').map(Number);
    const h12 = h % 12 || 12;
    const ap = h < 12 ? 'AM' : 'PM';
    return `${h12}${m ? `:${String(m).padStart(2, '0')}` : ''}${ap}`;
  };
  return `Available: ${fmt(start)} – ${fmt(end)}`;
}
