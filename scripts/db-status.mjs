/**
 * Muestra qué base usa la app/scripts y qué hay cargado (usuarios, trainings).
 * Railway: railway ssh -- node scripts/db-status.mjs
 */
import fs from 'node:fs';
import { getDbPathResolution, openDbWithSchema } from './db-utils.mjs';

const { effective: dbPath, reason } = getDbPathResolution();
const exists = fs.existsSync(dbPath);
const volumeMounted = fs.existsSync('/data');

console.log('--- DB status ---');
console.log('NODE_ENV:', process.env.NODE_ENV ?? '(no definido)');
console.log('DB_PATH (env):', process.env.DB_PATH ?? '(no definido)');
console.log('Volumen /data montado:', volumeMounted);
console.log('Ruta efectiva:', dbPath);
console.log('Resolución:', reason);
console.log('Archivo existe:', exists);

if (process.env.DB_PATH && !process.env.DB_PATH.startsWith('/') && volumeMounted) {
  console.log(
    '\n⚠ En Railway, cambiá la variable DB_PATH a /data/training.db (ahora está relativa).',
  );
  console.log('   La app y los scripts ya usan /data/training.db por el volumen montado.');
}

if (!exists) {
  console.log('\nLa base aún no existe; se creará al primer seed o request.');
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

const appDb = '/app/training.db';
if (appDb !== dbPath && fs.existsSync(appDb)) {
  console.log('\nNota: también existe /app/training.db (DB vieja/ephemeral). Podés ignorarla.');
}

console.log('\n--- fin ---');
