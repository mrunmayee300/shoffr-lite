"use client";

import { useState } from "react";
import {
  CalendarClock,
  Clock,
  MapPin,
  Plus,
  XCircle,
  CircleDollarSign,
} from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BookingShell, DarkCard, RowDivider } from "@/components/BookingShell";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

function PinStack({ children }) {
  return (
    <div className="relative pl-10">
      <div className="absolute left-[0.85rem] top-8 bottom-10 w-px border-l border-dashed border-white/25" />
      {children}
    </div>
  );
}

export default function OutstationPage() {
  const router = useRouter();
  const [tripMode, setTripMode] = useState("one_way");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [when, setWhen] = useState("");
  const [guests, setGuests] = useState(2);
  const [corp, setCorp] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const { trip } = await api.createTrip({
        trip_type: "outstation",
        pickup: pickup || "Pick-up",
        dropoff: dropoff || "Drop-off",
        meta: { tripMode, when, guests, corporate: corp },
      });
      router.push(`/trips?highlight=${trip.id}`);
    } catch (e) {
      alert(e.message || "Login as rider from Profile first");
    } finally {
      setBusy(false);
    }
  };

  return (
    <BookingShell>
      <ScreenHeader title="Outstation Trips" subtitle="Bangalore" backHref="/" />
      <div className="px-4 mt-2 space-y-5">
        <div className="flex rounded-pill bg-[#161616] p-1 ring-1 ring-white/[0.06]">
          {[
            { id: "one_way", label: "One Way" },
            { id: "round", label: "Round Trip" },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTripMode(id)}
              className={`flex-1 rounded-pill py-2.5 text-sm ${
                tripMode === id
                  ? "border border-gold text-gold"
                  : "text-white/45 border border-transparent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <DarkCard>
          <PinStack>
            <div className="flex items-center gap-3 py-4 pl-1 pr-3">
              <MapPin className="h-5 w-5 text-white/50 shrink-0" />
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/35"
                placeholder="Pick-up"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
              <button
                type="button"
                className="shrink-0 rounded-pill border border-white/20 px-2.5 py-1 text-[11px] text-white/70 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Stop
              </button>
            </div>
            <RowDivider />
            <div className="flex items-center gap-3 py-4 pl-1 pr-3">
              <MapPin className="h-5 w-5 text-white/50 shrink-0" />
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/35"
                placeholder="Drop-off"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
              />
            </div>
            <RowDivider />
            <div className="flex items-center gap-3 py-4 pl-1 pr-3">
              <CalendarClock className="h-5 w-5 text-white/50 shrink-0" />
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/35"
                placeholder="Date and time"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            </div>
          </PinStack>
        </DarkCard>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setGuests((g) => (g >= 6 ? 1 : g + 1))}
            className="rounded-pill border border-gold/50 px-4 py-2 text-sm text-gold"
          >
            {guests} Guests
          </button>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold mb-3">
            Policy
          </p>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <div className="h-9 w-9 rounded-full bg-black flex items-center justify-center ring-1 ring-white/10 shrink-0">
                <Clock className="h-4 w-4 text-gold" />
              </div>
              <p className="text-white/85">
                Free waiting for 30 mins. After that, ₹50 per 5 mins.
              </p>
            </li>
            <li className="flex gap-3">
              <div className="h-9 w-9 rounded-full bg-black flex items-center justify-center ring-1 ring-white/10 shrink-0">
                <XCircle className="h-4 w-4 text-gold" />
              </div>
              <p className="text-white/85">
                Free cancellation until 1 hr prior. Fee applicable after that{" "}
                <span className="underline text-gold/90">More Details</span>
              </p>
            </li>
            <li className="flex gap-3">
              <div className="h-9 w-9 rounded-full bg-black flex items-center justify-center ring-1 ring-white/10 shrink-0">
                <CircleDollarSign className="h-4 w-4 text-gold" />
              </div>
              <p className="text-white/85">Toll and parking additional</p>
            </li>
          </ul>
        </div>

        <label className="flex items-start gap-3 text-sm text-white/80 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 rounded border-white/30 bg-black"
            checked={corp}
            onChange={(e) => setCorp(e.target.checked)}
          />
          Bill to my company — I&apos;m travelling for work
        </label>

        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="w-full rounded-pill bg-[#2a2a2a] py-4 text-sm font-medium text-white/90 disabled:opacity-50"
        >
          {busy ? "Booking…" : "Check Fares"}
        </button>
      </div>
    </BookingShell>
  );
}
