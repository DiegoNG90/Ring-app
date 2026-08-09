import fs from 'node:fs';
import path from 'node:path';
import sql, { type Database } from 'better-sqlite3';

function resolveDbPath(): string {
  const fromEnv = process.env.DB_PATH;
  const volumeMounted = fs.existsSync('/data');

  if (fromEnv?.startsWith('/')) {
    if (fs.existsSync(path.dirname(fromEnv))) {
      return fromEnv;
    }
  }

  if (volumeMounted) {
    return '/data/training.db';
  }

  if (fromEnv && !fromEnv.startsWith('/')) {
    return fromEnv;
  }

  return 'training.db';
}

function isLegacyTrainingsSchema(db: Database): boolean {
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='trainings'",
    )
    .get();

  if (!tableExists) {
    return false;
  }

  const columns = db
    .prepare('PRAGMA table_info(trainings)')
    .all() as { name: string }[];

  return columns.some((col) => col.name === 'user_id');
}

function migrateLegacySchema(db: Database): void {
  db.exec(`
    DROP TABLE IF EXISTS training_rounds;
    DROP TABLE IF EXISTS trainings;
  `);
}

function ensureIntervalSecondsColumn(db: Database): void {
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='training_rounds'",
    )
    .get();

  if (!tableExists) {
    return;
  }

  const columns = db
    .prepare('PRAGMA table_info(training_rounds)')
    .all() as { name: string }[];

  if (!columns.some((col) => col.name === 'interval_seconds')) {
    db.exec(
      'ALTER TABLE training_rounds ADD COLUMN interval_seconds INTEGER DEFAULT 0',
    );
  }
}

function applySchema(db: Database): void {
  if (isLegacyTrainingsSchema(db)) {
    migrateLegacySchema(db);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS trainings (
      id INTEGER PRIMARY KEY,
      title TEXT UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users_trainings (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      training_id INTEGER NOT NULL,
      times_completed INTEGER DEFAULT 0,
      last_completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (training_id) REFERENCES trainings(id),
      UNIQUE (user_id, training_id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS training_rounds (
      id INTEGER PRIMARY KEY,
      training_id INTEGER,
      round_number INTEGER,
      duration_seconds INTEGER,
      rest_seconds INTEGER,
      repetitions INTEGER DEFAULT 1,
      interval_seconds INTEGER DEFAULT 0,
      FOREIGN KEY (training_id) REFERENCES trainings(id)
    );
  `);

  ensureIntervalSecondsColumn(db);
}

const dbPath = resolveDbPath();
const db = sql(dbPath);

applySchema(db);

export default db;
