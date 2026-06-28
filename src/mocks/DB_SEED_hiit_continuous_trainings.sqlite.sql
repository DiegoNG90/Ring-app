-- Seed idempotente de trainings HIIT rounds continuos (interval_seconds > 0).
-- Asocia a diego@test.com, profe y alumno.
--
-- Desde la raíz del proyecto:
--   pnpm db:seed-hiit-continuous

INSERT INTO trainings (user_id, title, description)
SELECT u.id, 'HIIT rounds continuos', 'HIIT continuo: 4 rounds de 80" con campana cada 20", descanso de 20" entre rounds'
FROM users u
WHERE u.email IN ('diego@test.com', 'profe', 'alumno')
  AND NOT EXISTS (
    SELECT 1 FROM trainings t
    WHERE t.user_id = u.id AND t.title = 'HIIT rounds continuos'
  );

INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions, interval_seconds)
SELECT t.id, 4, 80, 20, 1, 20
FROM trainings t
WHERE t.title = 'HIIT rounds continuos'
  AND NOT EXISTS (
    SELECT 1 FROM training_rounds r WHERE r.training_id = t.id
  );
