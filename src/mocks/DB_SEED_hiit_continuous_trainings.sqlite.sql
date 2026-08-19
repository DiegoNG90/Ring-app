-- Seed idempotente de trainings HIIT rounds continuos (interval_seconds > 0).
-- Catálogo compartido + asignación a diego@test.com, profe y alumno.
--
-- Desde la raíz del proyecto:
--   pnpm db:seed-hiit-continuous

INSERT INTO trainings (title, training_type, description)
SELECT 'HIIT rounds continuos', 'HIIT_EXTENDED', 'HIIT continuo: 4 rounds de 80" con campana cada 20", descanso de 20" entre rounds'
WHERE NOT EXISTS (
  SELECT 1 FROM trainings WHERE title = 'HIIT rounds continuos' AND training_type = 'HIIT_EXTENDED'
);

INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions, interval_seconds)
SELECT t.id, 4, 80, 20, 1, 20
FROM trainings t
WHERE t.title = 'HIIT rounds continuos' AND t.training_type = 'HIIT_EXTENDED'
  AND NOT EXISTS (
    SELECT 1 FROM training_rounds r WHERE r.training_id = t.id
  );

INSERT OR IGNORE INTO users_trainings (user_id, training_id)
SELECT u.id, t.id
FROM users u
CROSS JOIN trainings t
WHERE u.email IN ('diego@test.com', 'profe', 'alumno')
  AND t.title = 'HIIT rounds continuos';
