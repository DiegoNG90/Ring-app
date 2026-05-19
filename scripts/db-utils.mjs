import fs from 'node:fs';
import path from 'node:path';
import sql from 'better-sqlite3';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const schemaPath = path.join(projectRoot, 'src', 'mocks', 'DB_SCHEMA.sqlite.sql');

export function getDbPath() {
  return path.join(projectRoot, 'training.db');
}

/** Abre training.db y aplica CREATE TABLE IF NOT EXISTS. */
export function openDbWithSchema(dbPath = getDbPath()) {
  const db = sql(dbPath);
  db.exec(fs.readFileSync(schemaPath, 'utf8'));
  return db;
}
