/**
 * Borra trainings del catálogo sin asignaciones en users_trainings,
 * y asignaciones rotas (user o training inexistente).
 * Railway: railway ssh -- node scripts/cleanup-orphan-trainings.mjs
 */
import { openDbWithSchema } from './db-utils.mjs';

const { db } = openDbWithSchema();

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

if (orphanCatalog === 0 && brokenAssignments === 0) {
  console.log('No hay trainings huérfanos ni asignaciones rotas.');
  process.exit(0);
}

db.exec(`
  DELETE FROM users_trainings
  WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = user_id)
     OR NOT EXISTS (SELECT 1 FROM trainings t WHERE t.id = training_id);

  DELETE FROM training_rounds
  WHERE training_id IN (
    SELECT t.id FROM trainings t
    WHERE NOT EXISTS (
      SELECT 1 FROM users_trainings ut WHERE ut.training_id = t.id
    )
  );

  DELETE FROM trainings
  WHERE NOT EXISTS (
    SELECT 1 FROM users_trainings ut WHERE ut.training_id = id
  );
`);

console.log(
  `Eliminados ${orphanCatalog} training(s) del catálogo sin asignaciones y ${brokenAssignments} asignación(es) rota(s).`,
);
