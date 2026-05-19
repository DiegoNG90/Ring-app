/**
 * Crea training.db y aplica el schema SQLite.
 * Uso: node scripts/init-db.mjs
 */
import { getDbPath, openDbWithSchema } from './db-utils.mjs';

openDbWithSchema();
console.log(`Schema listo en ${getDbPath()}`);
