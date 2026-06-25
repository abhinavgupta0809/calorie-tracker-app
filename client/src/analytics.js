import posthog from 'posthog-js';

// PostHog is opt-in via env. With no VITE_POSTHOG_KEY set, every function here is
// a safe no-op — the app runs clean locally and in forks with zero analytics.
let enabled = false;

export function init() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) return;
  const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
  posthog.init(key, {
    api_host: apiHost,
    capture_pageview: true,
    autocapture: true,
    persistence: 'localStorage',
  });
  enabled = true;
}

export function identify(userId) {
  if (!enabled || !userId) return;
  posthog.identify(userId);
}

export function capture(event, props = {}) {
  if (!enabled) return;
  posthog.capture(event, props);
}

export default { init, identify, capture };
