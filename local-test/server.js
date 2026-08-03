/**
 * ViewCoin App — Servidor Local para Testes
 * Usa SQLite via WebAssembly (sem compilação nativa).
 * Requer Node.js 18+ instalado.
 */

import express from 'express';
import { createHash, randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import DatabaseConstructor from 'node-sqlite3-wasm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Database setup ───────────────────────────────────────────────────────────
const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) mkdirSync(dataDir);

const db = new DatabaseConstructor(join(dataDir, 'viewcoin.db'));

db.exec(`
  PRAGMA journal_mode=WAL;
  PRAGMA foreign_keys=ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    viewcoins INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS schedule_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week INTEGER NOT NULL,
    hour_start INTEGER NOT NULL,
    hour_end INTEGER NOT NULL,
    member_name TEXT NOT NULL,
    channel_link TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS viewcoin_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL DEFAULT 1,
    minutes_watched INTEGER NOT NULL,
    channel_name TEXT NOT NULL,
    earned_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Seed admin user if not exists
const adminHash = createHash('sha256').update('admin123viewcoin-salt-2024').digest('hex');
db.prepare(`
  INSERT OR IGNORE INTO users (username, email, password_hash, is_admin, viewcoins)
  VALUES ('admin', 'admin@viewcoin.tv', ?, 1, 0)
`).run([adminHash]);

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const tokens = new Map(); // token → userId

function hashPassword(password) {
  return createHash('sha256').update(password + 'viewcoin-salt-2024').digest('hex');
}
function generateToken() {
  return randomBytes(32).toString('hex');
}
function getUserIdFromToken(token) {
  return tokens.get(token) ?? null;
}
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  const userId = getUserIdFromToken(header.slice(7));
  if (!userId) return res.status(401).json({ error: 'Token inválido ou expirado' });
  req.userId = userId;
  next();
}
function requireAdmin(req, res, next) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get([req.userId]);
  if (!user?.is_admin) return res.status(403).json({ error: 'Acesso restrito a admins' });
  req.user = user;
  next();
}

function serializeUser(u) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    isAdmin: !!u.is_admin,
    viewcoins: u.viewcoins,
    createdAt: u.created_at,
  };
}
function serializeSlot(s) {
  return {
    id: s.id,
    dayOfWeek: s.day_of_week,
    hourStart: s.hour_start,
    hourEnd: s.hour_end,
    memberName: s.member_name,
    channelLink: s.channel_link,
    createdAt: s.created_at,
  };
}

// ─── Express app ──────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

// Serve built frontend
app.use(express.static(join(__dirname, 'dist')));

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/healthz', (_req, res) => res.json({ status: 'ok' }));

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (!username || !email || !password || !confirmPassword)
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  if (password !== confirmPassword)
    return res.status(400).json({ error: 'As senhas não coincidem' });
  if (password.length < 6)
    return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
  if (username.length < 3)
    return res.status(400).json({ error: 'O nome de usuário deve ter no mínimo 3 caracteres' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get([email, username]);
  if (existing) return res.status(400).json({ error: 'E-mail ou nome de usuário já cadastrado' });

  db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run([username, email, hashPassword(password)]);
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get([email]);
  const token = generateToken();
  tokens.set(token, user.id);
  res.status(201).json({ user: serializeUser(user), token });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get([email]);
  if (!user || user.password_hash !== hashPassword(password))
    return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  const token = generateToken();
  tokens.set(token, user.id);
  res.json({ user: serializeUser(user), token });
});

app.post('/api/auth/logout', (req, res) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) tokens.delete(header.slice(7));
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get([req.userId]);
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
  res.json(serializeUser(user));
});

// ─── Users ────────────────────────────────────────────────────────────────────
app.get('/api/users', (_req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY viewcoins DESC').all([]);
  res.json(users.map(u => ({ id: u.id, username: u.username, viewcoins: u.viewcoins })));
});

app.get('/api/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get([Number(req.params.id)]);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  const txs = db.prepare('SELECT * FROM viewcoin_transactions WHERE user_id = ? ORDER BY earned_at DESC LIMIT 20').all([user.id]);
  const row = db.prepare('SELECT COALESCE(SUM(minutes_watched),0) as t FROM viewcoin_transactions WHERE user_id = ?').get([user.id]);
  res.json({
    id: user.id, username: user.username, viewcoins: user.viewcoins,
    totalMinutesWatched: row.t, createdAt: user.created_at,
    recentTransactions: txs.map(t => ({
      id: t.id, userId: t.user_id, amount: t.amount,
      minutesWatched: t.minutes_watched, channelName: t.channel_name, earnedAt: t.earned_at,
    }))
  });
});

app.patch('/api/users/:id', requireAuth, (req, res) => {
  const { username, email, password } = req.body;
  const id = Number(req.params.id);
  if (username) db.prepare('UPDATE users SET username = ? WHERE id = ?').run([username, id]);
  if (email) db.prepare('UPDATE users SET email = ? WHERE id = ?').run([email, id]);
  if (password) db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run([hashPassword(password), id]);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get([id]);
  res.json(serializeUser(user));
});

// ─── Schedule ─────────────────────────────────────────────────────────────────
app.get('/api/schedule', (_req, res) => {
  const slots = db.prepare('SELECT * FROM schedule_slots ORDER BY day_of_week, hour_start').all([]);
  res.json(slots.map(serializeSlot));
});

app.get('/api/schedule/current', (_req, res) => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const slot = db.prepare(
    'SELECT * FROM schedule_slots WHERE day_of_week = ? AND hour_start <= ? AND hour_end > ? LIMIT 1'
  ).get([day, hour, hour]);
  res.json(slot ? { hasSlot: true, slot: serializeSlot(slot) } : { hasSlot: false });
});

app.post('/api/schedule/slot', requireAuth, requireAdmin, (req, res) => {
  const { dayOfWeek, hourStart, hourEnd, memberName, channelLink } = req.body;
  db.prepare(
    'INSERT INTO schedule_slots (day_of_week, hour_start, hour_end, member_name, channel_link) VALUES (?,?,?,?,?)'
  ).run([dayOfWeek, hourStart, hourEnd, memberName, channelLink]);
  const slot = db.prepare('SELECT * FROM schedule_slots WHERE rowid = last_insert_rowid()').get([]);
  res.status(201).json(serializeSlot(slot));
});

app.put('/api/schedule/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { dayOfWeek, hourStart, hourEnd, memberName, channelLink } = req.body;
  const existing = db.prepare('SELECT * FROM schedule_slots WHERE id = ?').get([id]);
  if (existing) {
    db.prepare('UPDATE schedule_slots SET day_of_week=?,hour_start=?,hour_end=?,member_name=?,channel_link=? WHERE id=?')
      .run([dayOfWeek, hourStart, hourEnd, memberName, channelLink, id]);
  } else {
    db.prepare('INSERT INTO schedule_slots (id,day_of_week,hour_start,hour_end,member_name,channel_link) VALUES (?,?,?,?,?,?)')
      .run([id, dayOfWeek, hourStart, hourEnd, memberName, channelLink]);
  }
  const slot = db.prepare('SELECT * FROM schedule_slots WHERE id = ?').get([id]);
  res.json(serializeSlot(slot));
});

app.delete('/api/schedule/:id', requireAuth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM schedule_slots WHERE id = ?').run([Number(req.params.id)]);
  res.json({ success: true, message: 'Slot removido' });
});

// ─── Viewcoins ────────────────────────────────────────────────────────────────
app.post('/api/viewcoins/earn', requireAuth, (req, res) => {
  const { minutesWatched, channelName } = req.body;
  const earned = Math.floor(minutesWatched / 5);
  if (earned <= 0) return res.status(400).json({ error: 'Tempo insuficiente' });

  db.prepare('UPDATE users SET viewcoins = viewcoins + ? WHERE id = ?').run([earned, req.userId]);
  db.prepare(
    'INSERT INTO viewcoin_transactions (user_id, amount, minutes_watched, channel_name) VALUES (?,?,?,?)'
  ).run([req.userId, earned, minutesWatched, channelName]);
  const tx = db.prepare('SELECT * FROM viewcoin_transactions WHERE rowid = last_insert_rowid()').get([]);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get([req.userId]);
  res.json({
    viewcoinsEarned: earned, newBalance: user.viewcoins,
    transaction: {
      id: tx.id, userId: tx.user_id, amount: tx.amount,
      minutesWatched: tx.minutes_watched, channelName: tx.channel_name, earnedAt: tx.earned_at,
    }
  });
});

app.get('/api/viewcoins/history/:userId', requireAuth, (req, res) => {
  const txs = db.prepare(
    'SELECT * FROM viewcoin_transactions WHERE user_id = ? ORDER BY earned_at DESC'
  ).all([Number(req.params.userId)]);
  res.json(txs.map(t => ({
    id: t.id, userId: t.user_id, amount: t.amount,
    minutesWatched: t.minutes_watched, channelName: t.channel_name, earnedAt: t.earned_at,
  })));
});

app.get('/api/ranking', (_req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY viewcoins DESC').all([]);
  const ranking = users.map((u, i) => {
    const row = db.prepare(
      'SELECT COALESCE(SUM(minutes_watched),0) as t FROM viewcoin_transactions WHERE user_id = ?'
    ).get([u.id]);
    return {
      position: i + 1, userId: u.id, username: u.username,
      viewcoins: u.viewcoins, totalMinutesWatched: row.t,
    };
  });
  res.json(ranking);
});

// ─── SPA fallback ─────────────────────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🪙  ViewCoin App rodando em: http://localhost:${PORT}`);
  console.log(`   Admin: admin@viewcoin.tv / admin123\n`);
  console.log('   Pressione Ctrl+C para parar.\n');
});
