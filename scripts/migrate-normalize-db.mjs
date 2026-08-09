/**
 * Migra el esquema legado (trainings.user_id) al esquema normalizado.
 * Preserva users y sessions; recrea trainings, users_trainings y training_rounds.
 *
 * Local:  pnpm db:migrate-normalize
 * Railway: railway ssh -- node scripts/migrate-normalize-db.mjs
 */
import fs from 'node:fs';
import {
  getDbPathResolution,
  openDbWithSchema,
} from './db-utils.mjs';

const { effective: dbPath, reason } = getDbPathResolution();

console.log('--- DB migrate normalize ---');
console.log('Ruta efectiva:', dbPath);
console.log('Resolución:', reason);

if (!fs.existsSync(dbPath)) {
  console.log('\nLa base no existe. Corré pnpm db:init primero.');
  process.exit(1);
}

const { db, migrated } = openDbWithSchema(dbPath);

if (migrated) {
  console.log(
    '\nEsquema legado detectado. Tablas trainings y training_rounds recreadas con el esquema normalizado.',
  );
  console.log('users y sessions se preservaron.');
  console.log('\nSiguiente paso: pnpm db:seed-all');
} else {
  console.log('\nEl esquema ya está normalizado. No se requiere migración.');
}

console.log('\n--- fin ---');
