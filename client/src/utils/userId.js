const STORAGE_KEY = 'cta_user_id';

// Stable anonymous per-visitor id. Created once, persisted in localStorage, and
// sent as the x-user-id header on every API call so each visitor gets their own
// server-side data instead of sharing one global profile + meal log.
export function getUserId() {
  if (typeof localStorage === 'undefined') return 'anonymous';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id =
      (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
      `u-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
