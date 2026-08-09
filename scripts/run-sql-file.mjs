/**
 * Ejecuta un archivo .sql contra training.db en la raíz del proyecto.
 * Uso: node scripts/run-sql-file.mjs src/mocks/DB_SEED_trainings.sqlite.sql
 */
import fs from 'node:fs';
import path from 'node:path';
import { getDbPath, openDbWithSchema } from './db-utils.mjs';

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error('Uso: node scripts/run-sql-file.mjs <ruta-al-archivo.sql>');
  process.exit(1);
}

const abs = path.isAbsolute(sqlFile) ? sqlFile : path.join(process.cwd(), sqlFile);
const dbPath = getDbPath();
if (!fs.existsSync(abs)) {
  console.error(`No existe ${abs}`);
  process.exit(1);
}

const content = fs.readFileSync(abs, 'utf8');
const { db } = openDbWithSchema(dbPath);
db.exec(content);
console.log('SQL ejecutado correctamente.');
