"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { MapPin, PackageSearch, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

const STATUS_LABEL = {
  booked: "Booked",
  ongoing: "Ongoing",
  completed: "Completed",
};

const TRACK_LABEL = {
  reported: "Reported",
  confirmed: "Confirmed",
  in_transit: "In transit",
  delivered: "Delivered",
};

const RECOVERY = [
  { id: "meet_driver", title: "Meet Driver", desc: "Mock map pin & ETA" },
  { id: "next_ride", title: "Return via Next Ride", desc: "Driver route simulation" },
  { id: "express_delivery", title: "Express Delivery", desc: "Nearest partner" },
  { id: "hub_pickup", title: "Pickup from Hub", desc: "Static hub address" },
];

function TripsContent() {
  const { user, ready } = useAuth();
  const sp = useSearchParams();
  const highlight = sp.get("highlight");
  const [trips, setTrips] = useState([]);
  const [lost, setLost] = useState([]);
  const [err, setErr] = useState("");
  const [recoveryFor, setRecoveryFor] = useState(null);
  const [recoveryDetail, setRecoveryDetail] = useState(null);
  const [nudge, setNudge] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setErr("");
    try {
      const t = await api.trips();
      setTrips(t.trips || []);
      if (user.role === "user") {
        const l = await api.lostItems();
        setLost(l.lost_items || []);
      }
    } catch (e) {
      setErr(e.message || "Failed to load");
    }
  }, [user]);

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready, load]);

  useEffect(() => {
    if (!user || user.role !== "user") return;
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [user, load]);

  const setStatus = async (id, status) => {
    try {
      setNudge("");
      const data = await api.tripStatus(id, status);
      await load();
      if (data.early_lost_item_nudge) {
        setNudge("Short trip — please double-check the cabin for belongings.");
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const chooseRecovery = async (lostItemId, recovery_type) => {
    try {
      const { recovery_request } = await api.createRecovery({ lost_item_id: lostItemId, recovery_type });
      setRecoveryDetail(recovery_request);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/50 text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black px-4 pt-16 text-center max-w-md mx-auto">
        <p className="text-white/70 text-sm mb-4">Sign in from Profile to view trips.</p>
        <Link href="/profile" className="text-gold underline text-sm">
          Go to Profile
        </Link>
      </div>
    );
  }

  if (user.role === "driver") {
    return (
      <div className="min-h-screen bg-black px-4 pt-12 pb-28 max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-gold mb-2">Trips</h1>
        <p className="text-sm text-white/60 mb-6">
          Switch to rider mode to browse bookings, or open the driver dashboard.
        </p>
        <Link
          href="/driver"
          className="inline-block rounded-pill border border-gold px-5 py-3 text-gold text-sm"
        >
          Driver dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 pt-10 pb-28 max-w-lg mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-gold">Trips</h1>
        <button
          type="button"
          onClick={load}
          className="p-2 rounded-full bg-white/5 text-gold ring-1 ring-white/10"
          aria-label="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <Link
        href="/lost-item"
        className="mb-6 flex items-center gap-3 rounded-card bg-surface ring-1 ring-gold/25 px-4 py-4"
      >
        <PackageSearch className="h-6 w-6 text-gold shrink-0" />
        <div>
          <p className="font-medium text-white">Retrieve Lost Item</p>
          <p className="text-xs text-white/50 mt-0.5">Report against a recent trip</p>
        </div>
      </Link>

      {err ? <p className="text-red-400 text-sm mb-4">{err}</p> : null}
      {nudge ? (
        <p className="text-gold/90 text-sm mb-4 ring-1 ring-gold/30 rounded-card px-3 py-2 bg-gold/5">
          {nudge}
        </p>
      ) : null}

      {lost.length > 0 ? (
        <section className="mb-8">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-gold mb-3">
            Lost item reports
          </h2>
          <ul className="space-y-3">
            {lost.map((li) => (
              <li
                key={li.id}
                className="rounded-card bg-[#141414] ring-1 ring-white/10 p-4 text-sm"
              >
                <div className="flex justify-between gap-2">
                  <span className="text-white/90 capitalize">{li.item_type}</span>
                  <span className="text-gold text-xs uppercase">{li.status.replace("_", " ")}</span>
                </div>
                <p className="text-white/50 text-xs mt-1">{li.description}</p>
                <p className="text-white/40 text-xs mt-2">
                  Tracking: {TRACK_LABEL[li.tracking_status] || li.tracking_status}
                </p>
                {li.status === "found" ? (
                  <button
                    type="button"
                    onClick={() => setRecoveryFor(li)}
                    className="mt-3 w-full rounded-pill border border-gold py-2.5 text-gold text-xs"
                  >
                    Choose recovery option
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <h2 className="text-[11px] uppercase tracking-[0.2em] text-gold mb-3">Your rides</h2>
      <ul className="space-y-4">
        {trips.map((t) => (
          <li
            key={t.id}
            className={`rounded-card bg-[#141414] ring-1 p-4 ${
              highlight === t.id ? "ring-gold/50" : "ring-white/10"
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="text-xs uppercase text-gold/80">{t.trip_type}</p>
                <p className="text-sm font-medium mt-1">{STATUS_LABEL[t.status]}</p>
              </div>
              <span className="text-[10px] text-white/40 font-mono truncate max-w-[40%]">
                {t.id}
              </span>
            </div>
            <div className="mt-3 space-y-1.5 text-sm text-white/70">
              <p className="flex gap-2 items-start">
                <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span>
                  {t.pickup} → {t.dropoff}
                </span>
              </p>
              {t.duration_mins ? (
                <p className="text-xs text-white/45">Duration ~{t.duration_mins} min</p>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {t.status === "booked" ? (
                <button
                  type="button"
                  onClick={() => setStatus(t.id, "ongoing")}
                  className="rounded-pill bg-white/10 px-3 py-1.5 text-xs"
                >
                  Start trip
                </button>
              ) : null}
              {t.status === "ongoing" ? (
                <button
                  type="button"
                  onClick={() => setStatus(t.id, "completed")}
                  className="rounded-pill bg-gold/20 text-gold px-3 py-1.5 text-xs ring-1 ring-gold/40"
                >
                  Complete trip
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {recoveryFor ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 px-3 pb-10 pt-8">
          <div className="w-full max-w-md rounded-card bg-surface ring-1 ring-gold/30 p-5 max-h-[85vh] overflow-y-auto">
            <h3 className="font-serif text-lg text-gold text-center">How should we return it?</h3>
            <p className="text-xs text-white/55 text-center mt-1">Item marked found — pick one path</p>
            <div className="mt-4 space-y-2">
              {RECOVERY.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => chooseRecovery(recoveryFor.id, r.id)}
                  className="w-full text-left rounded-2xl bg-black/40 ring-1 ring-white/10 px-4 py-3 hover:ring-gold/35"
                >
                  <p className="text-sm text-white">{r.title}</p>
                  <p className="text-xs text-white/45 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-pill border border-white/20 py-2.5 text-sm text-white/70"
              onClick={() => setRecoveryFor(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {recoveryDetail ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-sm rounded-card bg-[#161616] ring-1 ring-gold/25 p-5 text-sm">
            <p className="text-gold font-medium">Recovery started</p>
            <pre className="mt-3 text-xs text-white/60 whitespace-pre-wrap break-words">
              {JSON.stringify(recoveryDetail.mock_data, null, 2)}
            </pre>
            <p className="text-xs text-white/45 mt-3">
              Status polls every ~8s — tracking moves to delivered when the mock delivery completes.
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-pill bg-gold-gradient py-3 font-semibold text-black"
              onClick={() => setRecoveryDetail(null)}
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function TripsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white/50 text-sm">
          Loading…
        </div>
      }
    >
      <TripsContent />
    </Suspense>
  );
}
