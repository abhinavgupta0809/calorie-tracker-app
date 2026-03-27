import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../../data/data.json');

const emptyState = () => ({
  profile: null,
  meals: [],
});

async function ensureFile() {
  const dir = path.dirname(DATA_PATH);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, JSON.stringify(emptyState(), null, 2), 'utf8');
  }
}

export async function readState() {
  await ensureFile();
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.meals) parsed.meals = [];
    return parsed;
  } catch {
    return emptyState();
  }
}

export async function writeState(state) {
  await ensureFile();
  await fs.writeFile(DATA_PATH, JSON.stringify(state, null, 2), 'utf8');
}
