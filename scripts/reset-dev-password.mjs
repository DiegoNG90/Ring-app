/**
 * Solo desarrollo local: gestiona usuarios en training.db.
 *
 * Actualizar contraseña:
 *   node scripts/reset-dev-password.mjs <email> <nueva-contraseña>
 *
 * Crear usuario:
 *   node scripts/reset-dev-password.mjs --create-user <email> <contraseña>
 */
import crypto from 'node:crypto';
import { openDbWithSchema } from './db-utils.mjs';

function hashUserPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPassword = crypto.scryptSync(password, salt, 64);
  return hashedPassword.toString('hex') + ':' + salt;
}

const createUserMode = process.argv.includes('--create-user');
const email = createUserMode ? process.argv[3] : process.argv[2];
const password = createUserMode ? process.argv[4] : process.argv[3];

if (!email || !password) {
  if (createUserMode) {
    console.error(
      'Uso: node scripts/reset-dev-password.mjs --create-user <email> <contraseña>',
    );
  } else {
    console.error(
      'Uso: node scripts/reset-dev-password.mjs <email> <nueva-contraseña>',
    );
    console.error(
      '     node scripts/reset-dev-password.mjs --create-user <email> <contraseña>',
    );
  }
  process.exit(1);
}

const db = openDbWithSchema();
const hashed = hashUserPassword(password);

if (createUserMode) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    console.error(`Ya existe un usuario con email: ${email}`);
    process.exit(1);
  }

  const result = db
    .prepare('INSERT INTO users (email, password) VALUES (?, ?)')
    .run(email, hashed);

  console.log(`Usuario creado: ${email} (id: ${result.lastInsertRowid})`);
} else {
  const result = db
    .prepare(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
    )
    .run(hashed, email);

  if (result.changes === 0) {
    console.error(`No existe usuario con email: ${email}`);
    console.error('Tip: crea el usuario con --create-user');
    process.exit(1);
  }
  console.log(`Contraseña actualizada para ${email}`);
}
