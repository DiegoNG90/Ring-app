/**
 * Seed de usuarios autorizados para el MVP.
 * Idempotente: INSERT OR IGNORE (no duplica ni sobrescribe).
 *
 * Las credenciales se leen de variables de entorno (nunca hardcodeadas):
 *   SEED_USER_1_EMAIL / SEED_USER_1_PASSWORD
 *   SEED_USER_2_EMAIL / SEED_USER_2_PASSWORD
 *   SEED_USER_3_EMAIL / SEED_USER_3_PASSWORD
 *
 * Local: definir en .env.local (ver .env.example)
 * Railway: Variables del servicio → railway run node scripts/seed-users.mjs
 *
 * Uso: pnpm db:seed-users
 */
import crypto from 'node:crypto';
import { openDbWithSchema } from './db-utils.mjs';
import { loadEnvFiles } from './load-env.mjs';

loadEnvFiles();

const MAX_SEED_USERS = 10;

function hashUserPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPassword = crypto.scryptSync(password, salt, 64);
  return hashedPassword.toString('hex') + ':' + salt;
}

function getAuthorizedUsersFromEnv() {
  const users = [];

  for (let i = 1; i <= MAX_SEED_USERS; i++) {
    const email = process.env[`SEED_USER_${i}_EMAIL`];
    const password = process.env[`SEED_USER_${i}_PASSWORD`];

    if (!email && !password) break;

    if (!email || !password) {
      console.error(
        `Config incompleta: SEED_USER_${i}_EMAIL y SEED_USER_${i}_PASSWORD deben definirse juntos.`,
      );
      process.exit(1);
    }

    users.push({ email, password });
  }

  if (users.length === 0) {
    console.error(
      'No hay usuarios configurados. Definí SEED_USER_1_EMAIL / SEED_USER_1_PASSWORD (y siguientes) en .env.local o en Railway.',
    );
    process.exit(1);
  }

  return users;
}

const authorizedUsers = getAuthorizedUsersFromEnv();
const db = openDbWithSchema();
const insert = db.prepare(
  'INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)',
);

for (const user of authorizedUsers) {
  const result = insert.run(user.email, hashUserPassword(user.password));
  if (result.changes > 0) {
    console.log(`Usuario creado: ${user.email}`);
  } else {
    console.log(`Usuario ya existía: ${user.email}`);
  }
}

console.log('Seed de usuarios completado.');
