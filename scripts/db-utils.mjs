import fs from 'node:fs';
import path from 'node:path';
import sql from 'better-sqlite3';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const schemaPath = path.join(projectRoot, 'src', 'mocks', 'DB_SCHEMA.sqlite.sql');
const VOLUME_DB_PATH = '/data/training.db';

export function getDbPath() {
  const fromEnv = process.env.DB_PATH;
  const volumeMounted = fs.existsSync('/data');

  // Ruta absoluta solo si el directorio existe (en build /data aún no está montado)
  if (fromEnv?.startsWith('/')) {
    const parentDir = path.dirname(fromEnv);
    if (fs.existsSync(parentDir)) {
      return fromEnv;
    }
  }

  // Volumen Railway en /data: ignorar DB_PATH relativo (p. ej. "training.db")
  if (volumeMounted) {
    return VOLUME_DB_PATH;
  }

  if (fromEnv && !fromEnv.startsWith('/')) {
    return path.join(projectRoot, fromEnv);
  }

  return path.join(projectRoot, 'training.db');
}

/** Explica por qué la ruta efectiva puede diferir de process.env.DB_PATH */
export function getDbPathResolution() {
  const fromEnv = process.env.DB_PATH;
  const effective = getDbPath();
  const volumeMounted = fs.existsSync('/data');

  if (fromEnv?.startsWith('/') && fs.existsSync(path.dirname(fromEnv))) {
    return { effective, reason: 'DB_PATH absoluto en env' };
  }
  if (fromEnv?.startsWith('/')) {
    return {
      effective,
      reason: `DB_PATH="${fromEnv}" pero el directorio no existe aún (build); usando fallback`,
    };
  }
  if (volumeMounted && effective === VOLUME_DB_PATH) {
    return {
      effective,
      reason: fromEnv
        ? `Volumen /data montado: se ignora DB_PATH relativo "${fromEnv}"`
        : 'Volumen /data montado: default /data/training.db',
    };
  }
  if (fromEnv) {
    return { effective, reason: 'DB_PATH relativo en raíz del proyecto' };
  }
  return { effective, reason: 'Sin DB_PATH: training.db en raíz del proyecto' };
}

export function isLegacyTrainingsSchema(db) {
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='trainings'",
    )
    .get();

  if (!tableExists) {
    return false;
  }

  const columns = db.prepare('PRAGMA table_info(trainings)').all();
  return columns.some((col) => col.name === 'user_id');
}

export function migrateLegacySchema(db) {
  if (!isLegacyTrainingsSchema(db)) {
    return false;
  }

  db.exec(`
    DROP TABLE IF EXISTS training_rounds;
    DROP TABLE IF EXISTS trainings;
  `);

  return true;
}

function ensureIntervalSecondsColumn(db) {
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='training_rounds'",
    )
    .get();

  if (!tableExists) {
    return;
  }

  const columns = db.prepare('PRAGMA table_info(training_rounds)').all();
  if (!columns.some((col) => col.name === 'interval_seconds')) {
    db.exec(
      'ALTER TABLE training_rounds ADD COLUMN interval_seconds INTEGER DEFAULT 0',
    );
  }
}

/** Abre training.db y aplica CREATE TABLE IF NOT EXISTS. */
export function openDbWithSchema(dbPath = getDbPath()) {
  const db = sql(dbPath);
  const migrated = migrateLegacySchema(db);
  db.exec(fs.readFileSync(schemaPath, 'utf8'));
  ensureIntervalSecondsColumn(db);
  return { db, migrated };
}
