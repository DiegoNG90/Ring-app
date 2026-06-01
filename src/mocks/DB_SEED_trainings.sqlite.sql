-- Seed idempotente de entrenamientos spar para diego@test.com, profe y alumno.
--
-- Desde la raíz del proyecto:
--   pnpm db:seed-trainings

INSERT INTO trainings (user_id, title, description)
SELECT u.id, 'Light spar', 'Rutina de sparring corta'
FROM users u
WHERE u.email IN ('diego@test.com', 'profe', 'alumno')
  AND NOT EXISTS (
    SELECT 1 FROM trainings t
    WHERE t.user_id = u.id AND t.title = 'Light spar'
  );

INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions)
SELECT t.id, 2, 120, 60, 0
FROM trainings t
INNER JOIN users u ON t.user_id = u.id
WHERE u.email IN ('diego@test.com', 'profe', 'alumno') AND t.title = 'Light spar'
  AND NOT EXISTS (
    SELECT 1 FROM training_rounds r WHERE r.training_id = t.id
  );

INSERT INTO trainings (user_id, title, description)
SELECT u.id, 'Medium spar', 'Rutina de sparring mediana (6 rounds)'
FROM users u
WHERE u.email IN ('diego@test.com', 'profe', 'alumno')
  AND NOT EXISTS (
    SELECT 1 FROM trainings t
    WHERE t.user_id = u.id AND t.title = 'Medium spar'
  );

INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions)
SELECT t.id, 6, 120, 60, 0
FROM trainings t
INNER JOIN users u ON t.user_id = u.id
WHERE u.email IN ('diego@test.com', 'profe', 'alumno') AND t.title = 'Medium spar'
  AND NOT EXISTS (
    SELECT 1 FROM training_rounds r WHERE r.training_id = t.id
  );
