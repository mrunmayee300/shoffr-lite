import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "shoffr.db");

export function openDb() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  return db;
}

export function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user','driver')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      driver_id TEXT,
      trip_type TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('booked','ongoing','completed')),
      pickup TEXT,
      dropoff TEXT,
      stops_json TEXT,
      meta_json TEXT,
      started_at TEXT,
      ended_at TEXT,
      duration_mins INTEGER,
      lost_item_prompt INTEGER DEFAULT 0,
      lost_item_prompt_shown INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (driver_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS lost_items (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      driver_id TEXT,
      item_type TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      driver_photo_url TEXT,
      status TEXT NOT NULL CHECK(status IN ('reported','found','not_found','returned')),
      tracking_status TEXT NOT NULL DEFAULT 'reported'
        CHECK(tracking_status IN ('reported','confirmed','in_transit','delivered')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (trip_id) REFERENCES trips(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (driver_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS recovery_requests (
      id TEXT PRIMARY KEY,
      lost_item_id TEXT NOT NULL,
      recovery_type TEXT NOT NULL CHECK(recovery_type IN (
        'meet_driver','next_ride','express_delivery','hub_pickup'
      )),
      status TEXT NOT NULL DEFAULT 'pending',
      mock_data_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (lost_item_id) REFERENCES lost_items(id)
    );

    CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
    CREATE INDEX IF NOT EXISTS idx_lost_trip ON lost_items(trip_id);
    CREATE INDEX IF NOT EXISTS idx_lost_driver ON lost_items(driver_id);
 `);
}
