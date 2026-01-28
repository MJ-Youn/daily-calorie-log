-- Migration number: 0001 	 2024-05-20T00:00:00.000Z

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    picture TEXT,
    role TEXT DEFAULT 'USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs Table (Food and Exercise)
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('FOOD', 'EXERCISE')),
    content TEXT NOT NULL, -- The raw input text
    calories REAL NOT NULL DEFAULT 0, -- Calculated calories (negative for exercise?) -> Let's keep it absolute and use type to distinguish
    protein REAL DEFAULT 0, -- Protein in grams
    recorded_date TEXT NOT NULL, -- YYYY-MM-DD format
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster querying by date and user
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON activity_logs(user_id, recorded_date);
