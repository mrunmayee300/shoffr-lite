"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

export default function DriverDashboardPage() {
  const { user, ready, login } = useAuth();
  const [items, setItems] = useState([]);
  const [photoById, setPhotoById] = useState({});

  const load = useCallback(async () => {
    try {
      const r = await api.driverLostItems();
      setItems(r.lost_items || []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    if (!ready || user?.role !== "driver") return;
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [ready, user, load]);

  const patch = async (id, status) => {
    try {
      const url = photoById[id]?.trim() || undefined;
      await api.patchLostItem(id, { status, driver_photo_url: url });
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

  if (!user || user.role !== "driver") {
    return (
      <div className="min-h-screen bg-black px-4 pt-16 pb-24 max-w-lg mx-auto text-center">
        <p className="text-white/70 text-sm mb-4">Driver login required.</p>
        <button
          type="button"
          onClick={() => login("driver")}
          className="rounded-pill border border-gold px-6 py-2.5 text-gold text-sm"
        >
          Log in as driver
        </button>
        <Link href="/profile" className="block mt-6 text-white/45 text-xs underline">
          Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 pt-10 pb-24 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gold">Driver</h1>
        <Link href="/profile" className="text-xs text-white/45 underline">
          Account
        </Link>
      </div>

      <h2 className="text-[11px] uppercase tracking-[0.2em] text-gold mb-3">
        Lost item requests
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-white/45">No open reports assigned to you.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((li) => (
            <li
              key={li.id}
              className="rounded-card bg-surface ring-1 ring-white/10 p-4 text-sm space-y-3"
            >
              <div className="flex justify-between gap-2">
                <span className="text-white capitalize">{li.item_type}</span>
                <span className="text-xs text-gold uppercase">{li.status.replace("_", " ")}</span>
              </div>
              <p className="text-white/50 text-xs">{li.description}</p>
              <p className="text-[10px] text-white/35 font-mono">{li.trip_id}</p>
              {li.status === "reported" ? (
                <>
                  <input
                    className="w-full rounded-xl bg-black/50 ring-1 ring-white/10 px-3 py-2 text-xs outline-none placeholder:text-white/30"
                    placeholder="Optional confirmation photo URL (mock)"
                    value={photoById[li.id] || ""}
                    onChange={(e) =>
                      setPhotoById((m) => ({ ...m, [li.id]: e.target.value }))
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => patch(li.id, "found")}
                      className="flex-1 rounded-pill bg-gold/20 text-gold py-2 text-xs ring-1 ring-gold/40"
                    >
                      Item Found
                    </button>
                    <button
                      type="button"
                      onClick={() => patch(li.id, "not_found")}
                      className="flex-1 rounded-pill border border-white/20 py-2 text-xs text-white/75"
                    >
                      Item Not Found
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-white/40">Awaiting rider recovery choice or resolved.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
