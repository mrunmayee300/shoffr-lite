import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import { openDb, migrate } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = openDb();
migrate(db);

const uid = (prefix) => `${prefix}_${nanoid(8)}`;
const userId = uid("usr");
const driverId = uid("drv");

db.prepare("DELETE FROM recovery_requests").run();
db.prepare("DELETE FROM lost_items").run();
db.prepare("DELETE FROM trips").run();
db.prepare("DELETE FROM users").run();

db.prepare(
  `INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)`
).run(userId, "guest@shoffr.demo", "Guest Rider", "user");

db.prepare(
  `INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)`
).run(driverId, "driver@shoffr.demo", "Rajesh K.", "driver");

const tripBooked = uid("trp");
const tripOngoing = uid("trp");
const tripCompleted = uid("trp");
const tripCompletedShort = uid("trp");

const now = new Date();
const iso = (d) => d.toISOString();

db.prepare(
  `INSERT INTO trips (id, user_id, driver_id, trip_type, status, pickup, dropoff, stops_json, meta_json, started_at, ended_at, duration_mins, lost_item_prompt, lost_item_prompt_shown)
   VALUES (?, ?, ?, 'hourly', 'booked', 'Indiranagar', 'Koramangala', '[]', '{}', NULL, NULL, NULL, 0, 0)`
).run(tripBooked, userId, driverId);

db.prepare(
  `INSERT INTO trips (id, user_id, driver_id, trip_type, status, pickup, dropoff, stops_json, meta_json, started_at, ended_at, duration_mins, lost_item_prompt, lost_item_prompt_shown)
   VALUES (?, ?, ?, 'airport', 'ongoing', 'Home', 'KIA (BLR)', '[]', '{"terminal":"T1","flight":"6E242","airportMode":"drop"}', ?, NULL, NULL, 0, 0)`
).run(tripOngoing, userId, driverId, iso(new Date(now - 20 * 60 * 1000)));

db.prepare(
  `INSERT INTO trips (id, user_id, driver_id, trip_type, status, pickup, dropoff, stops_json, meta_json, started_at, ended_at, duration_mins, lost_item_prompt, lost_item_prompt_shown)
   VALUES (?, ?, ?, 'outstation', 'completed', 'Bangalore', 'Mysore', '[]', '{"tripMode":"one_way"}', ?, ?, 120, 1, 0)`
).run(
  tripCompleted,
  userId,
  driverId,
  iso(new Date(now - 3 * 60 * 60 * 1000)),
  iso(new Date(now - 1 * 60 * 60 * 1000))
);

db.prepare(
  `INSERT INTO trips (id, user_id, driver_id, trip_type, status, pickup, dropoff, stops_json, meta_json, started_at, ended_at, duration_mins, lost_item_prompt, lost_item_prompt_shown)
   VALUES (?, ?, ?, 'hourly', 'completed', 'UB City', 'MG Road', '[]', '{}', ?, ?, 8, 1, 0)`
).run(
  tripCompletedShort,
  userId,
  driverId,
  iso(new Date(now - 30 * 60 * 1000)),
  iso(new Date(now - 22 * 60 * 1000))
);

console.log("Seed OK");
console.log({ userId, driverId, tripBooked, tripOngoing, tripCompleted, tripCompletedShort });
