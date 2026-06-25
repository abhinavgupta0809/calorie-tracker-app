import { getUserId } from '../utils/userId.js';

const BASE = '';

async function handle(res) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText || 'Request failed';
    const err = new Error(msg);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
}

// Single place that attaches the per-visitor id to every request.
function request(path, { method = 'GET', body } = {}) {
  const headers = { 'x-user-id': getUserId() };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function getProfile() {
  const res = await request('/api/profile');
  if (res.status === 404) return null;
  return handle(res);
}

export async function setupProfile(body) {
  return handle(await request('/api/profile/setup', { method: 'POST', body }));
}

export async function patchProfile(body) {
  return handle(await request('/api/profile', { method: 'PATCH', body }));
}

export async function estimateMeal(description) {
  return handle(await request('/api/meals/estimate', { method: 'POST', body: { description } }));
}

export async function saveMeal(body) {
  return handle(await request('/api/meals', { method: 'POST', body }));
}

export async function getMeals(date) {
  const q = date ? `?date=${encodeURIComponent(date)}` : '';
  return handle(await request(`/api/meals${q}`));
}

export async function deleteMeal(id) {
  return handle(await request(`/api/meals/${encodeURIComponent(id)}`, { method: 'DELETE' }));
}

export async function getProgressDaily(date) {
  return handle(await request(`/api/progress/daily?date=${encodeURIComponent(date)}`));
}

export async function getProgressWeekly() {
  return handle(await request('/api/progress/weekly'));
}

export async function getProgressMonthly() {
  return handle(await request('/api/progress/monthly'));
}
