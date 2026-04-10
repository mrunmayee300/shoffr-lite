"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

const ITEM_TYPES = ["Phone", "Wallet", "Bag", "Laptop", "Keys", "Other"];

function LostItemContent() {
  const { user, ready } = useAuth();
  const sp = useSearchParams();
  const presetTrip = sp.get("tripId");
  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState(presetTrip || "");
  const [itemType, setItemType] = useState("Phone");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const loadTrips = useCallback(async () => {
    if (!user || user.role !== "user") return;
    const t = await api.trips();
    const completed = (t.trips || []).filter((x) => x.status === "completed");
    setTrips(completed);
    setTripId((prev) => prev || completed[0]?.id || "");
  }, [user]);

  useEffect(() => {
    if (!ready || !user || user.role !== "user") return;
    loadTrips();
  }, [ready, user, loadTrips]);

  useEffect(() => {
    if (presetTrip) setTripId(presetTrip);
  }, [presetTrip]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await api.createLostItem({
        trip_id: tripId,
        item_type: itemType,
        description,
        image_url: imageUrl || undefined,
      });
      setMsg("Report submitted. Your driver will be notified.");
      setDescription("");
      setImageUrl("");
    } catch (err) {
      setMsg(err.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/50 text-sm">
        Loading…
      </div>
    );
  }

  if (!user || user.role !== "user") {
    return (
      <div className="min-h-screen bg-black px-4 pt-16 text-center max-w-md mx-auto">
        <p className="text-white/70 text-sm mb-4">Rider login required.</p>
        <a href="/profile" className="text-gold underline text-sm">
          Profile
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <ScreenHeader title="Lost item" subtitle="" backHref="/trips" />
      <form onSubmit={submit} className="px-4 pb-28 pt-4 space-y-4 max-w-lg mx-auto">
        <p className="text-sm text-white/55">
          We&apos;ll link this to your trip and assigned driver. Use mock image URL if needed.
        </p>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-gold">Trip</label>
          <select
            className="mt-1 w-full rounded-2xl bg-surface ring-1 ring-white/10 px-4 py-3 text-sm outline-none"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
          >
            {trips.length === 0 ? (
              <option value="">No completed trips yet</option>
            ) : (
              trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.trip_type} · {t.pickup} → {t.dropoff}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-gold">Item type</label>
          <select
            className="mt-1 w-full rounded-2xl bg-surface ring-1 ring-white/10 px-4 py-3 text-sm outline-none"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
          >
            {ITEM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-gold">Description</label>
          <textarea
            className="mt-1 w-full rounded-2xl bg-surface ring-1 ring-white/10 px-4 py-3 text-sm outline-none min-h-[96px] placeholder:text-white/30"
            placeholder="Colour, brand, where you sat…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-gold">
            Image URL (optional)
          </label>
          <input
            className="mt-1 w-full rounded-2xl bg-surface ring-1 ring-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/30"
            placeholder="https://…"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        {msg ? <p className="text-sm text-gold/90">{msg}</p> : null}

        <button
          type="submit"
          disabled={busy || !tripId}
          className="w-full rounded-pill bg-gold-gradient py-4 text-sm font-bold text-black disabled:opacity-40"
        >
          {busy ? "Submitting…" : "Submit report"}
        </button>
      </form>
    </div>
  );
}

export default function LostItemPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white/50 text-sm">
          Loading…
        </div>
      }
    >
      <LostItemContent />
    </Suspense>
  );
}
