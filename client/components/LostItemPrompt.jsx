"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "./AuthProvider";

const POLL_MS = 8000;

export function LostItemPrompt() {
  const { user, ready } = useAuth();
  const [trip, setTrip] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready || !user || user.role !== "user") return;
    let cancelled = false;
    const run = async () => {
      try {
        const data = await api.lostItemPrompt();
        if (cancelled) return;
        if (data.show && data.trip) {
          setTrip(data.trip);
          setOpen(true);
        }
      } catch {
        /* ignore */
      }
    };
    run();
    const id = setInterval(run, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user, ready]);

  if (!open || !trip) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-8 pt-12">
      <div className="w-full max-w-md rounded-card bg-surface ring-1 ring-gold/30 p-6 shadow-2xl">
        <h2 className="font-serif text-xl text-gold text-center">Did you leave anything behind?</h2>
        <p className="mt-3 text-center text-sm text-white/70">
          Trip completed{trip.dropoff ? ` to ${trip.dropoff}` : ""}. Our team can help recover
          belongings left in vehicle.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/lost-item?tripId=${encodeURIComponent(trip.id)}`}
            onClick={() => setOpen(false)}
            className="block w-full rounded-pill bg-gold-gradient py-3.5 text-center text-sm font-semibold text-black"
          >
            Report a lost item
          </Link>
          <button
            type="button"
            className="w-full rounded-pill border border-gold/50 py-3 text-sm text-gold"
            onClick={async () => {
              try {
                await api.dismissLostPrompt(trip.id);
              } finally {
                setOpen(false);
                setTrip(null);
              }
            }}
          >
            No, I&apos;m all set
          </button>
        </div>
      </div>
    </div>
  );
}
