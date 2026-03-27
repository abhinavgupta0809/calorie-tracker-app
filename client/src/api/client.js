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

export async function getProfile() {
  const res = await fetch(`${BASE}/api/profile`);
  if (res.status === 404) return null;
  return handle(res);
}

export async function setupProfile(body) {
  const res = await fetch(`${BASE}/api/profile/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function patchProfile(body) {
  const res = await fetch(`${BASE}/api/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function estimateMeal(description) {
  const res = await fetch(`${BASE}/api/meals/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });
  return handle(res);
}

export async function saveMeal(body) {
  const res = await fetch(`${BASE}/api/meals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function getMeals(date) {
  const q = date ? `?date=${encodeURIComponent(date)}` : '';
  const res = await fetch(`${BASE}/api/meals${q}`);
  return handle(res);
}

export async function deleteMeal(id) {
  const res = await fetch(`${BASE}/api/meals/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return handle(res);
}

export async function getProgressDaily(date) {
  const res = await fetch(`${BASE}/api/progress/daily?date=${encodeURIComponent(date)}`);
  return handle(res);
}

export async function getProgressWeekly() {
  const res = await fetch(`${BASE}/api/progress/weekly`);
  return handle(res);
}

export async function getProgressMonthly() {
  const res = await fetch(`${BASE}/api/progress/monthly`);
  return handle(res);
}
