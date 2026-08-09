/**
 * @jest-environment node
 */
import sql from 'better-sqlite3';

jest.mock('../db', () => {
  const db = new sql(':memory:');

  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE trainings (
      id INTEGER PRIMARY KEY,
      title TEXT UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE users_trainings (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      training_id INTEGER NOT NULL,
      times_completed INTEGER DEFAULT 0,
      last_completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (training_id) REFERENCES trainings(id),
      UNIQUE (user_id, training_id)
    );

    CREATE TABLE training_rounds (
      id INTEGER PRIMARY KEY,
      training_id INTEGER,
      round_number INTEGER,
      duration_seconds INTEGER,
      rest_seconds INTEGER,
      repetitions INTEGER DEFAULT 1,
      interval_seconds INTEGER DEFAULT 0,
      FOREIGN KEY (training_id) REFERENCES trainings(id)
    );
  `);

  return { __esModule: true, default: db };
});

import db from '../db';
import {
  getAllTrainingsByUserId,
  unlinkTrainingFromUser,
} from './trainings';

function seedUsersAndTraining() {
  db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(
    'user-a@test.com',
    'hash-a',
  );
  db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(
    'user-b@test.com',
    'hash-b',
  );

  db.prepare('INSERT INTO trainings (title, description) VALUES (?, ?)').run(
    'Shared routine',
    'Same training for both users',
  );

  const trainingId = (
    db.prepare('SELECT id FROM trainings WHERE title = ?').get('Shared routine') as {
      id: number;
    }
  ).id;

  db.prepare(
    'INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions, interval_seconds) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(trainingId, 3, 120, 60, 0, 0);

  db.prepare(
    'INSERT INTO users_trainings (user_id, training_id) VALUES (?, ?)',
  ).run(1, trainingId);
  db.prepare(
    'INSERT INTO users_trainings (user_id, training_id) VALUES (?, ?)',
  ).run(2, trainingId);

  return trainingId;
}

describe('trainings repository (normalized schema)', () => {
  beforeEach(() => {
    db.exec(`
      DELETE FROM training_rounds;
      DELETE FROM users_trainings;
      DELETE FROM trainings;
      DELETE FROM users;
    `);
  });

  it('lists trainings assigned to a user via users_trainings', () => {
    const trainingId = seedUsersAndTraining();

    const userATrainings = getAllTrainingsByUserId(1);
    const userBTrainings = getAllTrainingsByUserId(2);

    expect(userATrainings).toHaveLength(1);
    expect(userBTrainings).toHaveLength(1);
    expect(userATrainings[0].training_id).toBe(trainingId);
    expect(userBTrainings[0].training_id).toBe(trainingId);
    expect(userATrainings[0].training_title).toBe('Shared routine');
    expect(userATrainings[0].round_number).toBe(3);
  });

  it('shares the same training_id between two users', () => {
    seedUsersAndTraining();

    const userATrainings = getAllTrainingsByUserId(1);
    const userBTrainings = getAllTrainingsByUserId(2);

    expect(userATrainings[0].training_id).toBe(userBTrainings[0].training_id);
  });

  it('unlinks a training from one user without affecting others', () => {
    const trainingId = seedUsersAndTraining();

    const unlinked = unlinkTrainingFromUser(trainingId, 1);

    expect(unlinked).toBe(true);
    expect(getAllTrainingsByUserId(1)).toHaveLength(0);
    expect(getAllTrainingsByUserId(2)).toHaveLength(1);

    const catalogCount = (
      db.prepare('SELECT COUNT(*) AS n FROM trainings').get() as { n: number }
    ).n;
    expect(catalogCount).toBe(1);
  });

  it('returns false when unlinking a non-existent assignment', () => {
    seedUsersAndTraining();

    const unlinked = unlinkTrainingFromUser(999, 1);

    expect(unlinked).toBe(false);
  });
});
