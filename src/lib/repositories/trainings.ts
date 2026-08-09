import db from '../db';
import { Training } from '@/types/Trainings';

export function getAllTrainingsByUserId(userId: number): Training[] {
  const result = db
    .prepare(
      `
        SELECT 
            t.id AS training_id,
            t.title AS training_title,
            t.description AS training_description,
            tr.id AS round_id,
            tr.round_number,
            tr.duration_seconds,
            tr.rest_seconds,
            tr.repetitions,
            tr.interval_seconds
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
        SELECT 
            t.id AS training_id,
            t.title AS training_title,
            t.description AS training_description,
            tr.id AS round_id,
            tr.round_number,
            tr.duration_seconds,
            tr.rest_seconds,
            tr.repetitions,
            tr.interval_seconds
        FROM trainings t
        INNER JOIN training_rounds tr ON t.id = tr.training_id  
        WHERE t.id = ? 
        ORDER BY t.id, tr.round_number;
      `,
    )
    .get(id) as Training | undefined;

  return result;
}

export function unlinkTrainingFromUser(
  trainingId: number,
  userId: number,
): boolean {
  const result = db
    .prepare(
      'DELETE FROM users_trainings WHERE user_id = ? AND training_id = ?',
    )
    .run(userId, trainingId);

  return result.changes > 0;
}

/** @deprecated Use unlinkTrainingFromUser instead */
export function deleteTrainingById(
  trainingId: number,
  userId: number,
): boolean {
  return unlinkTrainingFromUser(trainingId, userId);
}
