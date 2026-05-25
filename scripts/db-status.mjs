/**
 * Muestra qué base usa la app/scripts y qué hay cargado (usuarios, trainings).
 * Railway: railway ssh -- node scripts/db-status.mjs
 */
import fs from 'node:fs';
import { getDbPath, openDbWithSchema } from './db-utils.mjs';

const dbPath = getDbPath();
const exists = fs.existsSync(dbPath);

console.log('--- DB status ---');
console.log('DB_PATH (env):', process.env.DB_PATH ?? '(no definido → training.db en raíz)');
console.log('Ruta efectiva:', dbPath);
console.log('Archivo existe:', exists);

if (!exists) {
  console.log('La base aún no existe; la app la creará al primer request.');
  process.exit(0);
}

const db = openDbWithSchema(dbPath);

const users = db.prepare('SELECT id, email FROM users ORDER BY id').all();
console.log('\nUsuarios:', users.length);
for (const u of users) {
  console.log(`  - id=${u.id} email=${u.email}`);
}

const orphanTrainings = db
  .prepare('SELECT COUNT(*) AS n FROM trainings WHERE user_id IS NULL')
  .get().n;
const trainings = db
  .prepare(
    `SELECT t.id, t.title, t.user_id, u.email AS owner_email
     FROM trainings t
     LEFT JOIN users u ON u.id = t.user_id
     ORDER BY t.id`,
  )
  .all();

console.log('\nTrainings:', trainings.length, `(huérfanos sin user_id: ${orphanTrainings})`);
for (const t of trainings) {
  console.log(
    `  - id=${t.id} title="${t.title}" user_id=${t.user_id ?? 'NULL'} owner=${t.owner_email ?? '—'}`,
  );
}

console.log('\n--- fin ---');
