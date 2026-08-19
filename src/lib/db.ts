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

function ensureTrainingTypeColumn(db: Database): void {
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='trainings'",
    )
    .get();

  if (!tableExists) {
    return;
  }

  const columns = db
    .prepare('PRAGMA table_info(trainings)')
    .all() as { name: string }[];

  if (columns.some((col) => col.name === 'training_type')) {
    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_trainings_title_type
      ON trainings (title, training_type);
    `);
    return;
  }

  db.exec('PRAGMA foreign_keys = OFF');

  const migrate = db.transaction(() => {
    db.exec(`
      CREATE TABLE trainings_new (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        training_type TEXT NOT NULL DEFAULT 'HIIT',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.exec(`
      INSERT INTO trainings_new (id, title, training_type, description, created_at, updated_at)
      SELECT
        t.id,
        t.title,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM training_rounds tr
            WHERE tr.training_id = t.id AND tr.interval_seconds > 0
          ) THEN 'HIIT_EXTENDED'
          WHEN EXISTS (
            SELECT 1 FROM training_rounds tr
            WHERE tr.training_id = t.id AND tr.repetitions > 1
          ) THEN 'HIIT'
          WHEN EXISTS (
            SELECT 1 FROM training_rounds tr
            WHERE tr.training_id = t.id AND tr.duration_seconds = 120
          ) THEN 'SPARRING_2'
          WHEN EXISTS (
            SELECT 1 FROM training_rounds tr
            WHERE tr.training_id = t.id AND tr.duration_seconds = 180
          ) THEN 'SPARRING_3'
          ELSE 'HIIT'
        END,
        t.description,
        t.created_at,
        t.updated_at
      FROM trainings t;
    `);

    db.exec('DROP TABLE trainings');
    db.exec('ALTER TABLE trainings_new RENAME TO trainings');
    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_trainings_title_type
      ON trainings (title, training_type);
    `);
  });

  migrate();
  db.exec('PRAGMA foreign_keys = ON');
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

function ensureIsUserCreatedColumn(db: Database): void {
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users_trainings'",
    )
    .get();

  if (!tableExists) {
    return;
  }

  const columns = db
    .prepare('PRAGMA table_info(users_trainings)')
    .all() as { name: string }[];

  if (!columns.some((col) => col.name === 'is_user_created')) {
    db.exec(
      'ALTER TABLE users_trainings ADD COLUMN is_user_created INTEGER NOT NULL DEFAULT 0',
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
      title TEXT NOT NULL,
      training_type TEXT NOT NULL DEFAULT 'HIIT',
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
      is_user_created INTEGER NOT NULL DEFAULT 0,
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
  ensureTrainingTypeColumn(db);
  ensureIsUserCreatedColumn(db);
}

const dbPath = resolveDbPath();
const db = sql(dbPath);

applySchema(db);

export default db;
