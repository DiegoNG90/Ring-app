/**
 * Seed completo para producción: usuarios + trainings.
 * Railway: railway ssh -- node scripts/seed-all.mjs
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDbPathResolution } from './db-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const { effective, reason } = getDbPathResolution();
console.log('Seed en:', effective);
console.log('(', reason, ')\n');

function run(scriptName, args = []) {
  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, scriptName), ...args],
    { cwd: root, stdio: 'inherit', env: process.env },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('seed-users.mjs');
console.log('');
run('run-sql-file.mjs', ['src/mocks/DB_SEED_trainings.sqlite.sql']);
console.log('');
run('run-sql-file.mjs', [
  'src/mocks/DB_SEED_hiit_continuous_trainings.sqlite.sql',
]);
console.log('\nSeed completo. Verificá con: node scripts/db-status.mjs');
