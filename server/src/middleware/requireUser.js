// Every data route requires the anonymous per-visitor id the client sends as
// the x-user-id header. We attach it as req.userId so the store can key each
// visitor's profile + meals separately. No header => 400 (the client always
// sends one; a missing header means a misconfigured or direct call).
export function requireUser(req, res, next) {
  const userId = req.header('x-user-id');
  if (!userId || !userId.trim()) {
    return res.status(400).json({ error: 'Missing x-user-id header' });
  }
  req.userId = userId.trim();
  next();
}
