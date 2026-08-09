-- Seed idempotente de entrenamientos spar (catálogo compartido + asignación a usuarios).
--
-- Desde la raíz del proyecto:
--   pnpm db:seed-trainings

-- Catálogo: Light spar
INSERT INTO trainings (title, description)
SELECT 'Light spar', 'Rutina de sparring corta'
WHERE NOT EXISTS (
  SELECT 1 FROM trainings WHERE title = 'Light spar'
);

INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions)
SELECT t.id, 2, 120, 60, 0
FROM trainings t
WHERE t.title = 'Light spar'
  AND NOT EXISTS (
    SELECT 1 FROM training_rounds r WHERE r.training_id = t.id
  );

-- Catálogo: Medium spar
INSERT INTO trainings (title, description)
SELECT 'Medium spar', 'Rutina de sparring mediana (6 rounds)'
WHERE NOT EXISTS (
  SELECT 1 FROM trainings WHERE title = 'Medium spar'
);

INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions)
SELECT t.id, 6, 120, 60, 0
FROM trainings t
WHERE t.title = 'Medium spar'
  AND NOT EXISTS (
    SELECT 1 FROM training_rounds r WHERE r.training_id = t.id
  );

-- Asignación a usuarios MVP
INSERT OR IGNORE INTO users_trainings (user_id, training_id)
SELECT u.id, t.id
FROM users u
CROSS JOIN trainings t
WHERE u.email IN ('diego@test.com', 'profe', 'alumno')
  AND t.title IN ('Light spar', 'Medium spar');
