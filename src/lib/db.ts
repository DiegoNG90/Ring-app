import fs from 'node:fs';
import path from 'node:path';
import sql from 'better-sqlite3';

function resolveDbPath(): string {
  const fromEnv = process.env.DB_PATH;
  const volumeMounted = fs.existsSync('/data');

  if (fromEnv?.startsWith('/')) {
    if (fs.existsSync(path.dirname(fromEnv))) {
      return fromEnv;
    }
  }

  if (volumeMounted) {
    return '/data/training.db';
  }

  if (fromEnv && !fromEnv.startsWith('/')) {
    return fromEnv;
  }

  return 'training.db';
}

const dbPath = resolveDbPath();
const db = sql(dbPath);

// db.prepare(
//   `
//   DROP TABLE IF EXISTS training_rounds;
//   `
// ).run();

// db.prepare(
//   `
//   DROP TABLE IF EXISTS trainings;
//   `
// ).run();

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`CREATE TABLE IF NOT EXISTS sessions (
  id TEXT NOT NULL PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`);

db.exec(`
  CREATE TABLE IF NOT EXISTS trainings (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    title TEXT,
    description TEXT,
    times_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS training_rounds (
    id INTEGER PRIMARY KEY,
    training_id INTEGER,
    round_number INTEGER,
    duration_seconds INTEGER,
    rest_seconds INTEGER,
    repetitions INTEGER DEFAULT 1,
    FOREIGN KEY (training_id) REFERENCES trainings(id)
  );
`);

// const hasTrainings =
//   db.prepare('SELECT COUNT(*) as count FROM trainings').get().count > 0;

// if (!hasTrainings) {
//   db.exec(`
//     INSERT INTO trainings (title, image, description)
//     VALUES
//     ('Yoga', '/yoga.jpg', 'A gentle way to improve flexibility and balance.'),
//     ('Boxing', '/boxing.jpg', 'A high-energy workout that improves strength and speed.'),
//     ('Running', '/running.jpg', 'A great way to improve cardiovascular health and endurance.'),
//     ('Weightlifting', '/weightlifting.jpg', 'A strength-building workout that helps tone muscles.'),
//     ('Cycling', '/cycling.jpg', 'A low-impact workout that improves cardiovascular health and endurance.'),
//     ('Gaming', '/gaming.jpg', 'A fun way to improve hand-eye coordination and reflexes.'),
//     ('Sailing', '/sailing.jpg', 'A relaxing way to enjoy the outdoors and improve balance.');
// `);
// }

// console.log('Ejecuta DB???');

// db.prepare(
//   `INSERT INTO trainings (user_id, title, description)
// VALUES (?, ?, ?);`
// ).run(1, 'Light spar', 'Rutina de sparring corta');

// db.prepare(
//   `INSERT INTO trainings (user_id, title, description)
// VALUES (?, ?, ?);`
// ).run(1, 'Medium spar', 'Rutina de sparring mediana (6 rounds)');

// db.prepare(
//   `
//   INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions)
//   VALUES(?, ?, ?, ?, ?);
//   `
// ).run(1, 2, 120, 30, 0);

// db.prepare(
//   `
//   INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions)
//   VALUES(?, ?, ?, ?, ?);
//   `
// ).run(2, 6, 120, 30, 0);

// console.log('TERMINA DB???');

export default db;
