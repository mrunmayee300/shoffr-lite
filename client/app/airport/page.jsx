"use client";

import { useState } from "react";
import {
  CalendarClock,
  Info,
  MapPin,
  Plane,
  Plus,
  UserRound,
} from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BookingShell, DarkCard, RowDivider } from "@/components/BookingShell";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AirportPage() {
  const router = useRouter();
  const [mode, setMode] = useState("drop");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [when, setWhen] = useState("");
  const [flight, setFlight] = useState("");
  const [terminal, setTerminal] = useState("T1");
  const [guests, setGuests] = useState(2);
  const [roundTrip, setRoundTrip] = useState(false);
  const [corp, setCorp] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const { trip } = await api.createTrip({
        trip_type: "airport",
        pickup: mode === "drop" ? pickup || "Pick-up" : "KIA (BLR)",
        dropoff: mode === "drop" ? "KIA (BLR)" : dropoff || "Drop-off",
        meta: {
          airportMode: mode,
          terminal,
          flight,
          when,
          guests,
          roundTrip,
          corporate: corp,
        },
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
      <ScreenHeader title="Airport Transfers" subtitle="Bangalore" backHref="/" />
      <div className="px-4 mt-2 space-y-5">
        <div className="flex rounded-pill bg-[#161616] p-1 ring-1 ring-white/[0.06]">
          {[
            { id: "drop", label: "Airport Drop" },
            { id: "pickup", label: "Airport Pick-up" },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`flex-1 rounded-pill py-2.5 text-sm ${
                mode === id
                  ? "border border-gold text-gold"
                  : "text-white/45 border border-transparent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <DarkCard>
          {mode === "drop" ? (
            <>
              <div className="relative pl-10">
                <div className="absolute left-[0.85rem] top-8 bottom-10 w-px border-l border-dashed border-white/25" />
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
                  <Plane className="h-5 w-5 text-white/50 shrink-0" />
                  <span className="flex-1 text-sm text-white/85">KIA (BLR)</span>
                  <div className="flex gap-1">
                    {["T1", "T2"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTerminal(t)}
                        className={`rounded-pill px-3 py-1 text-xs ${
                          terminal === t
                            ? "border border-gold text-gold"
                            : "border border-white/15 text-white/45"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative pl-10">
                <div className="absolute left-[0.85rem] top-8 bottom-10 w-px border-l border-dashed border-white/25" />
                <div className="flex items-center gap-3 py-4 pl-1 pr-3">
                  <Plane className="h-5 w-5 text-white/50 shrink-0" />
                  <span className="flex-1 text-sm text-white/85">KIA (BLR)</span>
                  <div className="flex gap-1">
                    {["T1", "T2"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTerminal(t)}
                        className={`rounded-pill px-3 py-1 text-xs ${
                          terminal === t
                            ? "border border-gold text-gold"
                            : "border border-white/15 text-white/45"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
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
                  <button
                    type="button"
                    className="shrink-0 rounded-pill border border-white/20 px-2.5 py-1 text-[11px] text-white/70 flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Stop
                  </button>
                </div>
              </div>
            </>
          )}
          <RowDivider />
          <div className="flex items-center gap-3 py-4 px-4">
            <CalendarClock className="h-5 w-5 text-white/50 shrink-0" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/35"
              placeholder="Date and time"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
          </div>
        </DarkCard>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold mb-2">
            Flight no.
          </p>
          <div className="rounded-[1.25rem] bg-[#161616] ring-1 ring-white/[0.06] px-4 py-3 flex items-center gap-2">
            <Plane className="h-5 w-5 text-white/45" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/35"
              placeholder="E.g. - 6E242"
              value={flight}
              onChange={(e) => setFlight(e.target.value)}
            />
            <Info className="h-5 w-5 text-white/35" />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setGuests((g) => (g >= 6 ? 1 : g + 1))}
            className="flex-1 rounded-pill border border-white/15 py-3 text-sm flex items-center justify-center gap-2"
          >
            <UserRound className="h-4 w-4 text-gold" />
            {guests} Guests
          </button>
          <button
            type="button"
            onClick={() => setRoundTrip((v) => !v)}
            className={`flex-1 rounded-pill py-3 text-sm border ${
              roundTrip ? "border-gold text-gold" : "border-white/15 text-white/70"
            }`}
          >
            Add Round Trip
          </button>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold mb-2">
            Policy
          </p>
          <div className="flex gap-3 items-start">
            <div className="h-9 w-9 rounded-full bg-black flex items-center justify-center ring-1 ring-white/10 shrink-0">
              <CalendarClock className="h-4 w-4 text-gold" />
            </div>
            <p className="text-sm text-white/85">
              Free waiting for 15 mins. After that ₹50 per 5 mins.
            </p>
          </div>
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
