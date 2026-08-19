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
      title TEXT NOT NULL,
      training_type TEXT NOT NULL DEFAULT 'HIIT',
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX idx_trainings_title_type
      ON trainings (title, training_type);

    CREATE TABLE users_trainings (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      training_id INTEGER NOT NULL,
      times_completed INTEGER DEFAULT 0,
      last_completed_at TIMESTAMP,
      is_user_created INTEGER NOT NULL DEFAULT 0,
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
  countUserCreatedRoutines,
  createTrainingForUser,
  findTrainingByTitleAndType,
  getAllTrainingsByUserId,
  getTrainingByIdForUser,
  isTrainingLinkedToUser,
  linkTrainingToUser,
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

  db.prepare(
    'INSERT INTO trainings (title, training_type, description) VALUES (?, ?, ?)',
  ).run('Shared routine', 'SPARRING_2', 'Same training for both users');

  const trainingId = (
    db.prepare('SELECT id FROM trainings WHERE title = ?').get('Shared routine') as {
      id: number;
    }
  ).id;

  db.prepare(
    'INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions, interval_seconds) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(trainingId, 3, 120, 60, 1, 0);

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
    expect(userATrainings[0].training_type).toBe('SPARRING_2');
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

  describe('orphan catalog cleanup on delete', () => {
    function countRows(table: 'trainings' | 'training_rounds', trainingId: number) {
      const column = table === 'trainings' ? 'id' : 'training_id';
      return (
        db
          .prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ${column} = ?`)
          .get(trainingId) as { n: number }
      ).n;
    }

    it('removes the catalog entry and its rounds when the last assignment goes away', () => {
      const trainingId = seedUsersAndTraining();

      unlinkTrainingFromUser(trainingId, 1);
      expect(countRows('trainings', trainingId)).toBe(1);
      expect(countRows('training_rounds', trainingId)).toBe(1);

      unlinkTrainingFromUser(trainingId, 2);

      expect(countRows('trainings', trainingId)).toBe(0);
      expect(countRows('training_rounds', trainingId)).toBe(0);
    });

    it('keeps rounds intact while another user still has the routine', () => {
      const trainingId = seedUsersAndTraining();

      unlinkTrainingFromUser(trainingId, 1);

      expect(countRows('training_rounds', trainingId)).toBe(1);
      expect(getAllTrainingsByUserId(2)).toHaveLength(1);
    });

    it('leaves no orphan rows after a create and delete cycle', () => {
      db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(
        'creator@test.com',
        'hash',
      );

      const created = createTrainingForUser(
        {
          name: 'Rutina temporal',
          trainingType: 'SPARRING_2',
          rounds: 3,
        },
        1,
      );

      unlinkTrainingFromUser(created.trainingId, 1);

      expect(countRows('trainings', created.trainingId)).toBe(0);
      expect(countRows('training_rounds', created.trainingId)).toBe(0);
      expect(
        (db.prepare('SELECT COUNT(*) AS n FROM trainings').get() as { n: number })
          .n,
      ).toBe(0);
    });

    it('frees the name so it can be reused right after deleting', () => {
      db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(
        'creator@test.com',
        'hash',
      );

      const payload = {
        name: 'Rutina reciclada',
        trainingType: 'SPARRING_2' as const,
        rounds: 3,
      };

      const first = createTrainingForUser(payload, 1);
      unlinkTrainingFromUser(first.trainingId, 1);

      expect(
        findTrainingByTitleAndType('Rutina reciclada', 'SPARRING_2'),
      ).toBeUndefined();

      const second = createTrainingForUser(payload, 1);

      expect(
        findTrainingByTitleAndType('Rutina reciclada', 'SPARRING_2')?.training_id,
      ).toBe(second.trainingId);
      expect(getAllTrainingsByUserId(1)).toHaveLength(1);
      expect(
        (db.prepare('SELECT COUNT(*) AS n FROM trainings').get() as { n: number })
          .n,
      ).toBe(1);
    });

    it('does not touch the catalog when the assignment does not exist', () => {
      const trainingId = seedUsersAndTraining();

      unlinkTrainingFromUser(trainingId, 999);

      expect(countRows('trainings', trainingId)).toBe(1);
      expect(countRows('training_rounds', trainingId)).toBe(1);
      expect(getAllTrainingsByUserId(1)).toHaveLength(1);
      expect(getAllTrainingsByUserId(2)).toHaveLength(1);
    });
  });

  it('creates a training and links it to the user', () => {
    db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(
      'creator@test.com',
      'hash',
    );

    const created = createTrainingForUser(
      {
        name: 'Nueva HIIT',
        trainingType: 'HIIT',
        segmentDuration: 30,
        restDuration: 10,
        rounds: 4,
      },
      1,
    );

    expect(created.trainingId).toBeGreaterThan(0);
    expect(isTrainingLinkedToUser(created.trainingId, 1)).toBe(true);
    expect(getTrainingByIdForUser(created.trainingId, 1)?.training_title).toBe(
      'Nueva HIIT',
    );
  });

  it('finds catalog entries by title and type', () => {
    seedUsersAndTraining();

    const found = findTrainingByTitleAndType('Shared routine', 'SPARRING_2');

    expect(found?.training_id).toBeGreaterThan(0);
    expect(found?.round_config.round_number).toBe(3);
  });

  it('links an existing catalog entry to another user', () => {
    const trainingId = seedUsersAndTraining();
    db.prepare('DELETE FROM users_trainings WHERE user_id = ?').run(2);

    const linked = linkTrainingToUser(trainingId, 2);

    expect(linked).toBe(true);
    expect(getAllTrainingsByUserId(2)).toHaveLength(1);
  });

  describe('user created routine count', () => {
    function seedUser() {
      db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(
        'creator@test.com',
        'hash',
      );
    }

    it('does not count routines coming from the seed', () => {
      seedUsersAndTraining();

      expect(countUserCreatedRoutines(1)).toBe(0);
      expect(countUserCreatedRoutines(2)).toBe(0);
    });

    it('counts routines created through the create flow', () => {
      seedUser();

      createTrainingForUser(
        {
          name: 'Propia uno',
          trainingType: 'SPARRING_2',
          rounds: 3,
        },
        1,
      );
      createTrainingForUser(
        {
          name: 'Propia dos',
          trainingType: 'SPARRING_3',
          rounds: 3,
        },
        1,
      );

      expect(countUserCreatedRoutines(1)).toBe(2);
    });

    it('counts a reused catalog entry when linked as user created', () => {
      const trainingId = seedUsersAndTraining();
      db.prepare('DELETE FROM users_trainings WHERE user_id = ?').run(2);

      linkTrainingToUser(trainingId, 2, true);

      expect(countUserCreatedRoutines(2)).toBe(1);
    });

    it('frees the slot when the user deletes its own routine', () => {
      seedUser();

      const created = createTrainingForUser(
        {
          name: 'Propia uno',
          trainingType: 'SPARRING_2',
          rounds: 3,
        },
        1,
      );

      expect(countUserCreatedRoutines(1)).toBe(1);

      unlinkTrainingFromUser(created.trainingId, 1);

      expect(countUserCreatedRoutines(1)).toBe(0);
    });

    it('keeps counts isolated per user', () => {
      seedUser();
      db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(
        'other@test.com',
        'hash',
      );

      createTrainingForUser(
        {
          name: 'Solo de uno',
          trainingType: 'SPARRING_2',
          rounds: 3,
        },
        1,
      );

      expect(countUserCreatedRoutines(1)).toBe(1);
      expect(countUserCreatedRoutines(2)).toBe(0);
    });
  });
});
