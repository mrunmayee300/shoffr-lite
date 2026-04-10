# Shoffr Lite

## Folder structure

```
shoffr/
├── README.md                 ← this file
├── client/                   ← Next.js 14 + Tailwind (port 3000)
│   ├── app/                  ← App Router pages
│   ├── components/
│   ├── lib/
│   └── public/ui/            ← Shoffr UI reference images
└── server/                   ← Express + SQLite (port 3001)
    ├── src/
    │   ├── index.js          ← API + HTTP server
    │   ├── db.js             ← schema + DB open
    │   └── seed.js           ← sample users & trips
    └── data/                 ← created at runtime (shoffr.db)
```

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Body: `{ role?: "user"\|"driver", email?: string }`. Returns `{ user, token }`. |
| GET | `/api/me` | Bearer | Current user. |
| GET | `/api/trips` | Bearer | Rider: own trips. Driver: assigned trips. |
| GET | `/api/trips/:id` | Bearer | Single trip. |
| POST | `/api/trips` | Bearer | Rider creates trip. Body: `trip_type`, `pickup`, `dropoff`, `stops?`, `meta?`, `driver_id?`. |
| PATCH | `/api/trips/:id/status` | Bearer | Body: `{ status: "booked"\|"ongoing"\|"completed" }`. Completing sets `lost_item_prompt` (short trips still prompt — same flag). |
| POST | `/api/trips/:id/dismiss-lost-prompt` | Bearer | Rider dismisses “left anything behind?” without reporting. |
| GET | `/api/prompts/lost-item` | Bearer | Rider: pending completed trip needing prompt. |
| GET | `/api/lost-items` | Bearer | Rider: own reports. Driver: assigned reports. |
| GET | `/api/lost-items/:id` | Bearer | Single lost item. |
| POST | `/api/lost-items` | Bearer | Rider. Body: `trip_id`, `item_type`, `description?`, `image_url?`. |
| PATCH | `/api/lost-items/:id` | Bearer | Driver: `status` `found` / `not_found`, `driver_photo_url?`. |
| GET | `/api/driver/lost-items` | Bearer | Driver-only list. |
| POST | `/api/recovery-requests` | Bearer | Rider. Body: `lost_item_id`, `recovery_type`. Item must be `found`. |
| GET | `/api/recovery-requests?lost_item_id=` | Bearer | Rider’s recovery rows (scoped). |
| GET | `/api/health` | — | `{ ok: true }`. |

## Database schema (SQLite)

**users** — `id`, `email`, `name`, `role` (`user` \| `driver`), `created_at`

**trips** — `id`, `user_id`, `driver_id`, `trip_type`, `status` (`booked` \| `ongoing` \| `completed`), `pickup`, `dropoff`, `stops_json`, `meta_json`, `started_at`, `ended_at`, `duration_mins`, `lost_item_prompt`, `lost_item_prompt_shown`, `created_at`

**lost_items** — `id`, `trip_id`, `user_id`, `driver_id`, `item_type`, `description`, `image_url`, `driver_photo_url`, `status` (`reported` \| `found` \| `not_found` \| `returned`), `tracking_status` (`reported` \| `confirmed` \| `in_transit` \| `delivered`), `created_at`

**recovery_requests** — `id`, `lost_item_id`, `recovery_type` (`meet_driver` \| `next_ride` \| `express_delivery` \| `hub_pickup`), `status`, `mock_data_json`, `created_at`

## Seed / sample data

`npm run seed` in `server/` prints **user** and **driver** ids (also emails above). It creates:

- One **booked** hourly trip, one **ongoing** airport trip, two **completed** trips (one long, one short) with `lost_item_prompt` pending so the home flow can show **“Did you leave anything behind?”**

## UX notes

- **Lost item prompt** polls every **8s** while logged in as a rider.
- **Trips** and **driver dashboard** refresh lost-item state on the same interval.
- **Recovery** simulates delivery: after choosing an option, tracking moves to **delivered** / item **returned** after ~8s (timer on server).

