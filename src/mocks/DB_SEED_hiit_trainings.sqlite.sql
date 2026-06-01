-- Seed idempotente de trainings HIIT (repetitions > 1).
-- Asocia a diego@test.com, profe y alumno.
--
-- Desde la raíz del proyecto:
--   pnpm db:seed-hiit

-- Functional 3 laps light (3 repeticiones)
INSERT INTO trainings (user_id, title, description)
SELECT u.id, 'Functional 3 laps light', 'HIIT funcional, 3 vueltas'
FROM users u
WHERE u.email IN ('diego@test.com', 'profe', 'alumno')
  AND NOT EXISTS (
    SELECT 1 FROM trainings t
    WHERE t.user_id = u.id AND t.title = 'Functional 3 laps light'
  );

INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions)
SELECT t.id, 4, 30, 10, 3
FROM trainings t
WHERE t.title = 'Functional 3 laps light'
  AND NOT EXISTS (
    SELECT 1 FROM training_rounds r WHERE r.training_id = t.id
  );

-- Functional 4 laps light (4 repeticiones)
INSERT INTO trainings (user_id, title, description)
SELECT u.id, 'Functional 4 laps light', 'HIIT funcional, 4 vueltas'
FROM users u
WHERE u.email IN ('diego@test.com', 'profe', 'alumno')
  AND NOT EXISTS (
    SELECT 1 FROM trainings t
    WHERE t.user_id = u.id AND t.title = 'Functional 4 laps light'
  );

INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions)
SELECT t.id, 4, 30, 10, 4
FROM trainings t
WHERE t.title = 'Functional 4 laps light'
  AND NOT EXISTS (
    SELECT 1 FROM training_rounds r WHERE r.training_id = t.id
  );
