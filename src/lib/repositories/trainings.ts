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
            tr.repetitions
        FROM trainings t
        INNER JOIN training_rounds tr ON t.id = tr.training_id  
        WHERE t.user_id = ? 
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
            tr.repetitions
        FROM trainings t
        INNER JOIN training_rounds tr ON t.id = tr.training_id  
        WHERE t.id = ? 
        ORDER BY t.id, tr.round_number;
      `,
    )
    .get(id) as Training | undefined;

  return result;
}
