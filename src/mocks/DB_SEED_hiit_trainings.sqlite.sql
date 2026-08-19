-- Seed idempotente de trainings HIIT (repetitions > 1).
-- Catálogo compartido + asignación a diego@test.com, profe y alumno.
--
-- Desde la raíz del proyecto:
--   pnpm db:seed-hiit

-- Functional 3 laps light (3 repeticiones)
INSERT INTO trainings (title, training_type, description)
SELECT 'Functional 3 laps light', 'HIIT', 'HIIT funcional, 3 vueltas'
WHERE NOT EXISTS (
  SELECT 1 FROM trainings WHERE title = 'Functional 3 laps light' AND training_type = 'HIIT'
);

INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions)
SELECT t.id, 4, 30, 10, 3
FROM trainings t
WHERE t.title = 'Functional 3 laps light' AND t.training_type = 'HIIT'
  AND NOT EXISTS (
    SELECT 1 FROM training_rounds r WHERE r.training_id = t.id
  );

-- Functional 4 laps light (4 repeticiones)
INSERT INTO trainings (title, training_type, description)
SELECT 'Functional 4 laps light', 'HIIT', 'HIIT funcional, 4 vueltas'
WHERE NOT EXISTS (
  SELECT 1 FROM trainings WHERE title = 'Functional 4 laps light' AND training_type = 'HIIT'
);

INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions)
SELECT t.id, 4, 30, 10, 4
FROM trainings t
WHERE t.title = 'Functional 4 laps light' AND t.training_type = 'HIIT'
  AND NOT EXISTS (
    SELECT 1 FROM training_rounds r WHERE r.training_id = t.id
  );

-- Asignación a usuarios MVP
INSERT OR IGNORE INTO users_trainings (user_id, training_id)
SELECT u.id, t.id
FROM users u
CROSS JOIN trainings t
WHERE u.email IN ('diego@test.com', 'profe', 'alumno')
  AND t.title IN ('Functional 3 laps light', 'Functional 4 laps light');
