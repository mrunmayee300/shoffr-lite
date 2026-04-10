import express from "express";
import cors from "cors";
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

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

const EARLY_PROMPT_MINS = 15;

function auth(req, res, next) {
  const h = req.headers.authorization;
  const id = h?.startsWith("Bearer ") ? h.slice(7).trim() : null;
  if (!id) return res.status(401).json({ error: "Unauthorized" });
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!user) return res.status(401).json({ error: "Invalid user" });
  req.user = user;
  next();
}

function parseJson(s, fallback = {}) {
  try {
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
}

app.post("/api/auth/login", (req, res) => {
  const { role = "user", email } = req.body || {};
  let row = db
    .prepare("SELECT * FROM users WHERE role = ? ORDER BY created_at LIMIT 1")
    .get(role);
  if (email) {
    row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) || row;
  }
  if (!row) return res.status(400).json({ error: "No user — run npm run seed" });
  res.json({ user: row, token: row.id });
});

app.get("/api/me", auth, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/trips", auth, (req, res) => {
  if (req.user.role === "driver") {
    const rows = db
      .prepare(
        `SELECT t.* FROM trips t WHERE t.driver_id = ? ORDER BY datetime(t.created_at) DESC`
      )
      .all(req.user.id);
    return res.json({ trips: rows.map(serializeTrip) });
  }
  const rows = db
    .prepare(
      `SELECT * FROM trips WHERE user_id = ? ORDER BY datetime(created_at) DESC`
    )
    .all(req.user.id);
  res.json({ trips: rows.map(serializeTrip) });
});

app.get("/api/trips/:id", auth, (req, res) => {
  const row = db.prepare("SELECT * FROM trips WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  if (row.user_id !== req.user.id && row.driver_id !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });
  res.json({ trip: serializeTrip(row) });
});

app.post("/api/trips", auth, (req, res) => {
  if (req.user.role !== "user")
    return res.status(403).json({ error: "Only riders create trips" });
  const {
    trip_type,
    pickup,
    dropoff,
    stops = [],
    meta = {},
    driver_id,
  } = req.body || {};
  if (!trip_type)
    return res.status(400).json({ error: "trip_type required" });
  const id = `trp_${nanoid(10)}`;
  const drv =
    driver_id ||
    db.prepare("SELECT id FROM users WHERE role = 'driver' LIMIT 1").get()?.id ||
    null;
  db.prepare(
    `INSERT INTO trips (id, user_id, driver_id, trip_type, status, pickup, dropoff, stops_json, meta_json)
     VALUES (?, ?, ?, ?, 'booked', ?, ?, ?, ?)`
  ).run(
    id,
    req.user.id,
    drv,
    trip_type,
    pickup || "",
    dropoff || "",
    JSON.stringify(stops),
    JSON.stringify(meta)
  );
  const row = db.prepare("SELECT * FROM trips WHERE id = ?").get(id);
  res.status(201).json({ trip: serializeTrip(row) });
});

app.patch("/api/trips/:id/status", auth, (req, res) => {
  const { status } = req.body || {};
  if (!["booked", "ongoing", "completed"].includes(status))
    return res.status(400).json({ error: "Invalid status" });
  const row = db.prepare("SELECT * FROM trips WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  if (row.user_id !== req.user.id && row.driver_id !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });

  let lost_item_prompt = row.lost_item_prompt;
  let lost_item_prompt_shown = row.lost_item_prompt_shown;
  let started_at = row.started_at;
  let ended_at = row.ended_at;
  let duration_mins = row.duration_mins;

  if (status === "ongoing" && row.status === "booked") {
    started_at = new Date().toISOString();
  }
  if (status === "completed" && row.status !== "completed") {
    ended_at = new Date().toISOString();
    const start = started_at ? new Date(started_at) : new Date(row.created_at);
    const end = new Date(ended_at);
    duration_mins = Math.max(1, Math.round((end - start) / 60000));
    lost_item_prompt = 1;
    if (duration_mins < EARLY_PROMPT_MINS) lost_item_prompt = 1;
  }

  db.prepare(
    `UPDATE trips SET status = ?, started_at = COALESCE(?, started_at), ended_at = COALESCE(?, ended_at),
     duration_mins = COALESCE(?, duration_mins), lost_item_prompt = ?, lost_item_prompt_shown = ?
     WHERE id = ?`
  ).run(
    status,
    started_at,
    ended_at,
    duration_mins,
    lost_item_prompt,
    lost_item_prompt_shown,
    req.params.id
  );
  const updated = db.prepare("SELECT * FROM trips WHERE id = ?").get(req.params.id);
  const earlyLostNudge =
    status === "completed" &&
    updated.duration_mins != null &&
    updated.duration_mins < EARLY_PROMPT_MINS;
  res.json({ trip: serializeTrip(updated), early_lost_item_nudge: earlyLostNudge });
});

app.post("/api/trips/:id/dismiss-lost-prompt", auth, (req, res) => {
  const row = db.prepare("SELECT * FROM trips WHERE id = ?").get(req.params.id);
  if (!row || row.user_id !== req.user.id)
    return res.status(404).json({ error: "Not found" });
  db.prepare(
    `UPDATE trips SET lost_item_prompt_shown = 1 WHERE id = ?`
  ).run(req.params.id);
  res.json({ ok: true });
});

app.get("/api/prompts/lost-item", auth, (req, res) => {
  if (req.user.role !== "user") return res.json({ show: false });
  const row = db
    .prepare(
      `SELECT * FROM trips WHERE user_id = ? AND status = 'completed'
       AND lost_item_prompt = 1 AND lost_item_prompt_shown = 0
       ORDER BY datetime(ended_at) DESC LIMIT 1`
    )
    .get(req.user.id);
  if (!row) return res.json({ show: false });
  res.json({ show: true, trip: serializeTrip(row) });
});

app.get("/api/lost-items", auth, (req, res) => {
  if (req.user.role === "driver") {
    const rows = db
      .prepare(
        `SELECT * FROM lost_items WHERE driver_id = ? ORDER BY datetime(created_at) DESC`
      )
      .all(req.user.id);
    return res.json({ lost_items: rows.map(serializeLost) });
  }
  const rows = db
    .prepare(
      `SELECT * FROM lost_items WHERE user_id = ? ORDER BY datetime(created_at) DESC`
    )
    .all(req.user.id);
  res.json({ lost_items: rows.map(serializeLost) });
});

app.get("/api/lost-items/:id", auth, (req, res) => {
  const row = db.prepare("SELECT * FROM lost_items WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  if (row.user_id !== req.user.id && row.driver_id !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });
  res.json({ lost_item: serializeLost(row) });
});

app.post("/api/lost-items", auth, (req, res) => {
  if (req.user.role !== "user")
    return res.status(403).json({ error: "Riders only" });
  const { trip_id, item_type, description, image_url } = req.body || {};
  if (!trip_id || !item_type)
    return res.status(400).json({ error: "trip_id and item_type required" });
  const trip = db.prepare("SELECT * FROM trips WHERE id = ?").get(trip_id);
  if (!trip || trip.user_id !== req.user.id)
    return res.status(404).json({ error: "Trip not found" });
  const id = `lst_${nanoid(10)}`;
  db.prepare(
    `INSERT INTO lost_items (id, trip_id, user_id, driver_id, item_type, description, image_url, status, tracking_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'reported', 'reported')`
  ).run(
    id,
    trip_id,
    req.user.id,
    trip.driver_id,
    item_type,
    description || "",
    image_url || null
  );
  db.prepare(`UPDATE trips SET lost_item_prompt_shown = 1 WHERE id = ?`).run(
    trip_id
  );
  const row = db.prepare("SELECT * FROM lost_items WHERE id = ?").get(id);
  res.status(201).json({ lost_item: serializeLost(row) });
});

app.patch("/api/lost-items/:id", auth, (req, res) => {
  const row = db.prepare("SELECT * FROM lost_items WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  const { status, driver_photo_url, tracking_status } = req.body || {};
  if (req.user.role === "driver" && row.driver_id !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });
  if (req.user.role === "user" && row.user_id !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });

  let nextStatus = row.status;
  let nextTrack = row.tracking_status;
  let photo = row.driver_photo_url;

  if (req.user.role === "driver") {
    if (status === "found" || status === "not_found") nextStatus = status;
    if (driver_photo_url) photo = driver_photo_url;
    if (status === "found") nextTrack = "confirmed";
    if (status === "not_found") nextTrack = "reported";
  }
  if (req.user.role === "user" && tracking_status) nextTrack = tracking_status;

  db.prepare(
    `UPDATE lost_items SET status = ?, driver_photo_url = COALESCE(?, driver_photo_url), tracking_status = ? WHERE id = ?`
  ).run(nextStatus, photo || null, nextTrack, req.params.id);
  const u = db.prepare("SELECT * FROM lost_items WHERE id = ?").get(req.params.id);
  res.json({ lost_item: serializeLost(u) });
});

app.post("/api/recovery-requests", auth, (req, res) => {
  if (req.user.role !== "user")
    return res.status(403).json({ error: "Riders only" });
  const { lost_item_id, recovery_type } = req.body || {};
  if (!lost_item_id || !recovery_type)
    return res.status(400).json({ error: "lost_item_id and recovery_type required" });
  const li = db.prepare("SELECT * FROM lost_items WHERE id = ?").get(lost_item_id);
  if (!li || li.user_id !== req.user.id)
    return res.status(404).json({ error: "Lost item not found" });
  if (li.status !== "found")
    return res.status(400).json({ error: "Item must be marked found first" });

  const mock = buildMockRecovery(recovery_type, li);
  const rcvId = `rcv_${nanoid(10)}`;
  db.prepare(
    `INSERT INTO recovery_requests (id, lost_item_id, recovery_type, status, mock_data_json)
     VALUES (?, ?, ?, 'active', ?)`
  ).run(rcvId, lost_item_id, recovery_type, JSON.stringify(mock));

  db.prepare(`UPDATE lost_items SET tracking_status = 'in_transit' WHERE id = ?`).run(
    lost_item_id
  );

  setTimeout(() => {
    db.prepare(
      `UPDATE lost_items SET tracking_status = 'delivered', status = 'returned' WHERE id = ?`
    ).run(lost_item_id);
    db.prepare(`UPDATE recovery_requests SET status = 'completed' WHERE id = ?`).run(rcvId);
  }, 8000);

  const rrow = db.prepare(`SELECT * FROM recovery_requests WHERE id = ?`).get(rcvId);
  res.status(201).json({ recovery_request: serializeRecovery(rrow) });
});

app.get("/api/recovery-requests", auth, (req, res) => {
  const { lost_item_id } = req.query;
  let rows;
  if (lost_item_id) {
    rows = db
      .prepare(
        `SELECT r.* FROM recovery_requests r
         JOIN lost_items l ON l.id = r.lost_item_id
         WHERE r.lost_item_id = ? AND l.user_id = ?`
      )
      .all(lost_item_id, req.user.id);
  } else if (req.user.role === "user") {
    rows = db
      .prepare(
        `SELECT r.* FROM recovery_requests r
         JOIN lost_items l ON l.id = r.lost_item_id
         WHERE l.user_id = ? ORDER BY datetime(r.created_at) DESC`
      )
      .all(req.user.id);
  } else {
    rows = [];
  }
  res.json({ recovery_requests: rows.map(serializeRecovery) });
});

app.get("/api/driver/lost-items", auth, (req, res) => {
  if (req.user.role !== "driver")
    return res.status(403).json({ error: "Drivers only" });
  const rows = db
    .prepare(
      `SELECT * FROM lost_items WHERE driver_id = ? ORDER BY datetime(created_at) DESC`
    )
    .all(req.user.id);
  res.json({ lost_items: rows.map(serializeLost) });
});

app.get("/api/health", (_, res) => res.json({ ok: true }));

function serializeTrip(row) {
  return {
    ...row,
    stops: parseJson(row.stops_json, []),
    meta: parseJson(row.meta_json, {}),
    stops_json: undefined,
    meta_json: undefined,
    lost_item_prompt: !!row.lost_item_prompt,
    lost_item_prompt_shown: !!row.lost_item_prompt_shown,
  };
}

function serializeLost(row) {
  return { ...row };
}

function serializeRecovery(row) {
  if (!row) return null;
  return {
    ...row,
    mock_data: parseJson(row.mock_data_json, {}),
    mock_data_json: undefined,
  };
}

function buildMockRecovery(type, lostItem) {
  const base = { driverName: "Rajesh K.", hub: "Shoffr Hub — Indiranagar" };
  switch (type) {
    case "meet_driver":
      return {
        ...base,
        lat: 12.9716,
        lng: 77.5946,
        etaMins: 14,
        address: "Near MG Road Metro — mock pin",
      };
    case "next_ride":
      return {
        ...base,
        routeSummary: "Driver en route: Indiranagar → Whitefield",
        etaMins: 45,
      };
    case "express_delivery":
      return {
        ...base,
        deliveryTripId: `dlv_${nanoid(6)}`,
        etaMins: 35,
        courier: "Nearest Shoffr partner",
      };
    case "hub_pickup":
      return {
        ...base,
        lat: 12.9784,
        lng: 77.6408,
        hours: "10:00 — 20:00 IST",
      };
    default:
      return base;
  }
}

app.listen(PORT, () => {
  console.log(`Shoffr Lite API http://localhost:${PORT}`);
});
