-- Schema SQLite para training.db (mismo esquema que src/lib/db.ts).
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT,
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
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  training_type TEXT NOT NULL DEFAULT 'HIIT',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trainings_title_type
  ON trainings (title, training_type);

CREATE TABLE IF NOT EXISTS users_trainings (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  training_id INTEGER NOT NULL,
  times_completed INTEGER DEFAULT 0,
  last_completed_at TIMESTAMP,
  is_user_created INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (training_id) REFERENCES trainings(id),
  UNIQUE (user_id, training_id)
);

CREATE TABLE IF NOT EXISTS training_rounds (
  id INTEGER PRIMARY KEY,
  training_id INTEGER,
  round_number INTEGER,
  duration_seconds INTEGER,
  rest_seconds INTEGER,
  repetitions INTEGER DEFAULT 1,
  interval_seconds INTEGER DEFAULT 0,
  FOREIGN KEY (training_id) REFERENCES trainings(id)
);
