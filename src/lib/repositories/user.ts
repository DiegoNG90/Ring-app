import db from '../db';

export interface DbUser {
  id: number;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

// Creación de usuarios deprecada; usar scripts/seed-users.mjs o
// scripts/reset-dev-password.mjs --create-user (solo emergencias admin).
//
// export function createUser(email: string, password: string) {
//   const result = db
//     .prepare('INSERT INTO users (email, password) VALUES (?, ?)')
//     .run(email, password);
//
//   return result.lastInsertRowid;
// }

export function getUserByEmail(email: string): DbUser | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as
    | DbUser
    | undefined;
}
