-- OBSOLETO: mock legacy estilo Postgres; no está conectado a scripts ni al esquema SQLite actual.
-- Usar DB_SCHEMA.sqlite.sql y los archivos DB_SEED_*.sqlite.sql en su lugar.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT NOT NULL PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS trainings (
  id SERIAL PRIMARY KEY,
  user_id INT,
  title VARCHAR(255),
  description VARCHAR,
  times_completed INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS training_rounds (
	id SERIAL PRIMARY KEY,
    training_id INT,
    round_number INT,
    duration_seconds INT,
    rest_seconds INT,
    repetitions INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (training_id) REFERENCES trainings(id)
  );



INSERT INTO Users (email, password)
VALUES ('diego@gmail.com', 'qwer6789');

INSERT INTO trainings (user_id, title, description)
VALUES (1, 'Light spar', 'Rutina de sparring corta');

INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions)
VALUES(1, 2, 120, 60, 0);


INSERT INTO trainings (user_id, title, description)
VALUES (1, 'Medium spar', 'Rutina de sparring mediana (6 rounds)');

INSERT INTO training_rounds (training_id, round_number, duration_seconds, rest_seconds, repetitions)
VALUES(2, 6, 120, 60, 0);

