-- Seed de entrenamientos para SQLite (training.db).
-- Asocia los trainings al usuario por email (cambia el email si hace falta).
--
-- Desde la raíz del proyecto:
--   sqlite3 training.db ".read src/mocks/DB_SEED_trainings.sqlite.sql"
--
-- O en PowerShell:
--   sqlite3 training.db -init src/mocks/DB_SEED_trainings.sqlite.sql ""

INSERT INTO trainings (user_id, title, description)
VALUES (
  (SELECT id FROM users WHERE email = 'diego@gmail.com'),
  'Light spar',
  'Rutina de sparring corta'
);

INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions)
VALUES (last_insert_rowid(), 2, 120, 60, 0);

INSERT INTO trainings (user_id, title, description)
VALUES (
  (SELECT id FROM users WHERE email = 'diego@gmail.com'),
  'Medium spar',
  'Rutina de sparring mediana (6 rounds)'
);

INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions)
VALUES (last_insert_rowid(), 6, 120, 60, 0);
