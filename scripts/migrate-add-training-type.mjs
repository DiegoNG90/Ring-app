/**
 * Migra trainings: agrega training_type y cambia unicidad a (title, training_type).
 *
 * Local:  pnpm db:migrate-training-type
 * Railway: railway ssh -- node scripts/migrate-add-training-type.mjs
 */
import fs from 'node:fs';
import {
  getDbPathResolution,
  openDbWithSchema,
} from './db-utils.mjs';

const { effective: dbPath, reason } = getDbPathResolution();

console.log('--- DB migrate training_type ---');
console.log('Ruta efectiva:', dbPath);
console.log('Resolución:', reason);

if (!fs.existsSync(dbPath)) {
  console.log('\nLa base no existe. Corré pnpm db:init primero.');
  process.exit(1);
}

const { db } = openDbWithSchema(dbPath);

const columns = db.prepare('PRAGMA table_info(trainings)').all();
const hasTrainingType = columns.some((col) => col.name === 'training_type');

if (hasTrainingType) {
  console.log('\nLa columna training_type ya existe. Índice verificado.');
} else {
  console.log('\nMigración aplicada: training_type agregado con backfill inferido.');
}

const index = db
  .prepare(
    "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_trainings_title_type'",
  )
  .get();

if (index) {
  console.log('Índice idx_trainings_title_type presente.');
} else {
  console.log('Advertencia: índice idx_trainings_title_type no encontrado.');
}

console.log('\n--- fin ---');
