import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../../data/data.json');

const emptyUserState = () => ({ profile: null, meals: [] });
const emptyFile = () => ({ users: {} });

async function ensureFile() {
  const dir = path.dirname(DATA_PATH);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, JSON.stringify(emptyFile(), null, 2), 'utf8');
  }
}

async function readFile() {
  await ensureFile();
  try {
    const parsed = JSON.parse(await fs.readFile(DATA_PATH, 'utf8'));
    // Tolerate an old single-user file shape by starting a fresh users map.
    if (!parsed.users || typeof parsed.users !== 'object') parsed.users = {};
    return parsed;
  } catch {
    return emptyFile();
  }
}

export async function readState(userId) {
  const file = await readFile();
  const user = file.users[userId];
  if (!user) return emptyUserState();
  return { profile: user.profile ?? null, meals: user.meals ?? [] };
}

export async function writeState(userId, state) {
  // Re-read the whole file fresh and only replace this user's slice, so a write
  // for one user does not clobber another user's concurrently-saved data.
  const file = await readFile();
  file.users[userId] = { profile: state.profile ?? null, meals: state.meals ?? [] };
  await fs.writeFile(DATA_PATH, JSON.stringify(file, null, 2), 'utf8');
}
