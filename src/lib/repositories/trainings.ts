import db from '../db';
import {
  getRoutineTypeDefinition,
  mapPayloadToRoundConfig,
  roundConfigsMatch,
  type CreateRoutinePayload,
  type RoutineRoundConfig,
  type RoutineType,
} from '@/lib/routines/routine-types';
import { Training } from '@/types/Trainings';

const TRAINING_SELECT = `
  SELECT
    t.id AS training_id,
    t.title AS training_title,
    t.description AS training_description,
    t.training_type,
    tr.id AS round_id,
    tr.round_number,
    tr.duration_seconds,
    tr.rest_seconds,
    tr.repetitions,
    tr.interval_seconds
`;

export function getAllTrainingsByUserId(userId: number): Training[] {
  const result = db
    .prepare(
      `
        ${TRAINING_SELECT}
        FROM users_trainings ut
        INNER JOIN trainings t ON t.id = ut.training_id
        INNER JOIN training_rounds tr ON t.id = tr.training_id
        WHERE ut.user_id = ?
        ORDER BY t.id, tr.round_number;
      `,
    )
    .all(userId) as Training[];

  return result;
}

export function getTrainingById(id: number): Training | undefined {
  const result = db
    .prepare(
      `
        ${TRAINING_SELECT}
        FROM trainings t
        INNER JOIN training_rounds tr ON t.id = tr.training_id
        WHERE t.id = ?
        ORDER BY t.id, tr.round_number;
      `,
    )
    .get(id) as Training | undefined;

  return result;
}

export function getTrainingByIdForUser(
  id: number,
  userId: number,
): Training | undefined {
  const result = db
    .prepare(
      `
        ${TRAINING_SELECT}
        FROM users_trainings ut
        INNER JOIN trainings t ON t.id = ut.training_id
        INNER JOIN training_rounds tr ON t.id = tr.training_id
        WHERE t.id = ? AND ut.user_id = ?
        ORDER BY t.id, tr.round_number;
      `,
    )
    .get(id, userId) as Training | undefined;

  return result;
}

export interface CatalogTraining {
  training_id: number;
  training_title: string;
  training_type: RoutineType;
  training_description: string;
  round_config: RoutineRoundConfig;
}

export function findTrainingByTitleAndType(
  title: string,
  trainingType: RoutineType,
): CatalogTraining | undefined {
  const row = db
    .prepare(
      `
        SELECT
          t.id AS training_id,
          t.title AS training_title,
          t.training_type,
          t.description AS training_description,
          tr.round_number,
          tr.duration_seconds,
          tr.rest_seconds,
          tr.repetitions,
          tr.interval_seconds
        FROM trainings t
        INNER JOIN training_rounds tr ON t.id = tr.training_id
        WHERE t.title = ? AND t.training_type = ?
        LIMIT 1;
      `,
    )
    .get(title, trainingType) as
    | {
        training_id: number;
        training_title: string;
        training_type: RoutineType;
        training_description: string;
        round_number: number;
        duration_seconds: number;
        rest_seconds: number;
        repetitions: number;
        interval_seconds: number;
      }
    | undefined;

  if (!row) {
    return undefined;
  }

  return {
    training_id: row.training_id,
    training_title: row.training_title,
    training_type: row.training_type,
    training_description: row.training_description,
    round_config: {
      round_number: row.round_number,
      duration_seconds: row.duration_seconds,
      rest_seconds: row.rest_seconds,
      repetitions: row.repetitions,
      interval_seconds: row.interval_seconds,
    },
  };
}

export function isTrainingLinkedToUser(
  trainingId: number,
  userId: number,
): boolean {
  const row = db
    .prepare(
      'SELECT 1 AS linked FROM users_trainings WHERE user_id = ? AND training_id = ?',
    )
    .get(userId, trainingId) as { linked: number } | undefined;

  return Boolean(row);
}

export function linkTrainingToUser(
  trainingId: number,
  userId: number,
  isUserCreated = false,
): boolean {
  const result = db
    .prepare(
      'INSERT OR IGNORE INTO users_trainings (user_id, training_id, is_user_created) VALUES (?, ?, ?)',
    )
    .run(userId, trainingId, isUserCreated ? 1 : 0);

  return result.changes > 0;
}

export function countUserCreatedRoutines(userId: number): number {
  const row = db
    .prepare(
      'SELECT COUNT(*) AS total FROM users_trainings WHERE user_id = ? AND is_user_created = 1',
    )
    .get(userId) as { total: number };

  return row.total;
}

export function createTrainingForUser(
  payload: CreateRoutinePayload,
  userId: number,
): { trainingId: number } {
  const definition = getRoutineTypeDefinition(payload.trainingType);
  const roundConfig = mapPayloadToRoundConfig(payload);

  const create = db.transaction(() => {
    const insertTraining = db
      .prepare(
        'INSERT INTO trainings (title, training_type, description) VALUES (?, ?, ?)',
      )
      .run(payload.name, payload.trainingType, definition.description);

    const trainingId = Number(insertTraining.lastInsertRowid);

    db.prepare(
      `
        INSERT INTO training_rounds (
          training_id,
          round_number,
          duration_seconds,
          rest_seconds,
          repetitions,
          interval_seconds
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
    ).run(
      trainingId,
      roundConfig.round_number,
      roundConfig.duration_seconds,
      roundConfig.rest_seconds,
      roundConfig.repetitions,
      roundConfig.interval_seconds,
    );

    db.prepare(
      'INSERT INTO users_trainings (user_id, training_id, is_user_created) VALUES (?, ?, 1)',
    ).run(userId, trainingId);

    return { trainingId };
  });

  return create();
}

export function getRoundConfigForTraining(
  trainingId: number,
): RoutineRoundConfig | undefined {
  const row = db
    .prepare(
      `
        SELECT
          round_number,
          duration_seconds,
          rest_seconds,
          repetitions,
          interval_seconds
        FROM training_rounds
        WHERE training_id = ?
        LIMIT 1
      `,
    )
    .get(trainingId) as RoutineRoundConfig | undefined;

  return row;
}

export { roundConfigsMatch };

/**
 * Desvincula la rutina del usuario y, si nadie mas la tiene asignada, borra la
 * entrada del catalogo junto con sus rounds. Evita que el catalogo crezca sin
 * limite con registros huerfanos (misma semantica que db:cleanup-orphan-trainings).
 */
export function unlinkTrainingFromUser(
  trainingId: number,
  userId: number,
): boolean {
  const unlink = db.transaction(() => {
    const result = db
      .prepare(
        'DELETE FROM users_trainings WHERE user_id = ? AND training_id = ?',
      )
      .run(userId, trainingId);

    if (result.changes === 0) {
      return false;
    }

    const remaining = db
      .prepare(
        'SELECT 1 AS assigned FROM users_trainings WHERE training_id = ? LIMIT 1',
      )
      .get(trainingId) as { assigned: number } | undefined;

    if (!remaining) {
      db.prepare('DELETE FROM training_rounds WHERE training_id = ?').run(
        trainingId,
      );
      db.prepare('DELETE FROM trainings WHERE id = ?').run(trainingId);
    }

    return true;
  });

  return unlink();
}

/** @deprecated Use unlinkTrainingFromUser instead */
export function deleteTrainingById(
  trainingId: number,
  userId: number,
): boolean {
  return unlinkTrainingFromUser(trainingId, userId);
}
