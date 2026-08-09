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

if (!process.env.NODE_ENV) {
  console.log(
    '\n⚠ NODE_ENV no está definido. En Railway agregá NODE_ENV=production (cookies de sesión seguras).',
  );
}

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

const { db, migrated } = openDbWithSchema(dbPath);

if (migrated) {
  console.log(
    '\n⚠ Esquema legado detectado y migrado (trainings/training_rounds recreados). Corré pnpm db:seed-all para repoblar.',
  );
}

const users = db.prepare('SELECT id, email FROM users ORDER BY id').all();
console.log('\nUsuarios:', users.length);
for (const u of users) {
  console.log(`  - id=${u.id} email=${u.email}`);
}

const catalogCount = db.prepare('SELECT COUNT(*) AS n FROM trainings').get().n;
const assignmentCount = db
  .prepare('SELECT COUNT(*) AS n FROM users_trainings')
  .get().n;
const orphanCatalog = db
  .prepare(
    `SELECT COUNT(*) AS n FROM trainings t
     WHERE NOT EXISTS (
       SELECT 1 FROM users_trainings ut WHERE ut.training_id = t.id
     )`,
  )
  .get().n;
const brokenAssignments = db
  .prepare(
    `SELECT COUNT(*) AS n FROM users_trainings ut
     WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = ut.user_id)
        OR NOT EXISTS (SELECT 1 FROM trainings t WHERE t.id = ut.training_id)`,
  )
  .get().n;

console.log('\nCatálogo (trainings):', catalogCount);
console.log('Asignaciones (users_trainings):', assignmentCount);
console.log(`  - trainings sin usuarios asignados: ${orphanCatalog}`);
console.log(`  - asignaciones rotas (FK inválida): ${brokenAssignments}`);

const trainings = db
  .prepare(
    `SELECT t.id, t.title,
            (SELECT COUNT(*) FROM users_trainings ut WHERE ut.training_id = t.id) AS assigned_users
     FROM trainings t
     ORDER BY t.id`,
  )
  .all();

for (const t of trainings) {
  console.log(
    `  - id=${t.id} title="${t.title}" usuarios_asignados=${t.assigned_users}`,
  );
}

const assignments = db
  .prepare(
    `SELECT ut.id, ut.user_id, u.email, ut.training_id, t.title
     FROM users_trainings ut
     INNER JOIN users u ON u.id = ut.user_id
     INNER JOIN trainings t ON t.id = ut.training_id
     ORDER BY ut.user_id, ut.training_id`,
  )
  .all();

console.log('\nAsignaciones por usuario:');
for (const a of assignments) {
  console.log(
    `  - ut.id=${a.id} user=${a.email} (id=${a.user_id}) → "${a.title}" (training_id=${a.training_id})`,
  );
}

const appDb = '/app/training.db';
if (appDb !== dbPath && fs.existsSync(appDb)) {
  console.log('\nNota: también existe /app/training.db (DB vieja/ephemeral). Podés ignorarla.');
}

console.log('\n--- fin ---');
