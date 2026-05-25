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

  if (fromEnv?.startsWith('/')) {
    return fromEnv;
  }

  // Volumen Railway en /data: ignorar DB_PATH relativo (p. ej. "training.db")
  if (volumeMounted) {
    return VOLUME_DB_PATH;
  }

  if (fromEnv) {
    return path.isAbsolute(fromEnv)
      ? fromEnv
      : path.join(projectRoot, fromEnv);
  }

  return path.join(projectRoot, 'training.db');
}

/** Explica por qué la ruta efectiva puede diferir de process.env.DB_PATH */
export function getDbPathResolution() {
  const fromEnv = process.env.DB_PATH;
  const effective = getDbPath();
  const volumeMounted = fs.existsSync('/data');

  if (fromEnv?.startsWith('/')) {
    return { effective, reason: 'DB_PATH absoluto en env' };
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

/** Abre training.db y aplica CREATE TABLE IF NOT EXISTS. */
export function openDbWithSchema(dbPath = getDbPath()) {
  const db = sql(dbPath);
  db.exec(fs.readFileSync(schemaPath, 'utf8'));
  return db;
}
