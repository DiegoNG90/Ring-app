/**
 * Borra trainings (y sus rounds) sin user_id — p. ej. seed con email incorrecto.
 * Railway: railway ssh -- node scripts/cleanup-orphan-trainings.mjs
 */
import { openDbWithSchema } from './db-utils.mjs';

const db = openDbWithSchema();
const before = db.prepare('SELECT COUNT(*) AS n FROM trainings WHERE user_id IS NULL').get().n;

if (before === 0) {
  console.log('No hay trainings huérfanos.');
  process.exit(0);
}

db.exec(`
  DELETE FROM training_rounds
  WHERE training_id IN (SELECT id FROM trainings WHERE user_id IS NULL);
  DELETE FROM trainings WHERE user_id IS NULL;
`);

console.log(`Eliminados ${before} training(s) huérfano(s).`);
