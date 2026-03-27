import "dotenv/config";
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import profileRouter from './routes/profile.js';
import mealsRouter from './routes/meals.js';
import progressRouter from './routes/progress.js';

const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server/.env'),
  path.resolve(process.cwd(), 'server/server/.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DIST_PATH = path.resolve(__dirname, '../../client/dist');

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/profile', profileRouter);
app.use('/api/meals', mealsRouter);
app.use('/api/progress', progressRouter);

if (fs.existsSync(CLIENT_DIST_PATH)) {
  app.use(express.static(CLIENT_DIST_PATH));

  // SPA fallback for React Router refreshes on non-API routes.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(CLIENT_DIST_PATH, 'index.html'));
  });
} else {
  console.warn('client/dist not found. Run `npm run build` before production start.');
}

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    details: err.details,
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
