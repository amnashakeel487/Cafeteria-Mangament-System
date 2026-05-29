import axios from 'axios';

const BASE = '';

export function getStudentHeaders() {
  const token = localStorage.getItem('studentToken');
  return { Authorization: `Bearer ${token}` };
}

export function getCafeteriaHeaders() {
  const token = localStorage.getItem('cafeteriaToken');
  return { Authorization: `Bearer ${token}` };
}

export function getAdminHeaders() {
  const token = localStorage.getItem('adminToken');
  return { Authorization: `Bearer ${token}` };
}

export async function checkOrderRatings(orderId) {
  const res = await axios.get(`${BASE}/api/ratings/check-order/${orderId}`, {
    headers: getStudentHeaders(),
  });
  return res.data;
}

export async function submitMenuItemRating(payload) {
  const res = await axios.post(`${BASE}/api/ratings/menu-item`, payload, {
    headers: getStudentHeaders(),
  });
  return res.data;
}

export async function submitCafeteriaReview(payload) {
  const res = await axios.post(`${BASE}/api/ratings/cafeteria`, payload, {
    headers: getStudentHeaders(),
  });
  return res.data;
}

export async function fetchMenuItemRatings(menuItemId, page = 1) {
  const res = await axios.get(`${BASE}/api/ratings/menu-item/${menuItemId}`, {
    params: { page, limit: 10 },
  });
  return res.data;
}

export async function fetchCafeteriaRatings(cafeteriaId, page = 1) {
  const res = await axios.get(`${BASE}/api/ratings/cafeteria/${cafeteriaId}`, {
    params: { page, limit: 10 },
  });
  return res.data;
}

export async function fetchTopCafeterias() {
  const res = await axios.get(`${BASE}/api/ratings/top-cafeterias`);
  return res.data;
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
