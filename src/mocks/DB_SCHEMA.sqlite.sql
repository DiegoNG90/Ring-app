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
  user_id INTEGER,
  title TEXT,
  description TEXT,
  times_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
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
