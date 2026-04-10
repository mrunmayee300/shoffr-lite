"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Cake, Heart, Presentation } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { UI } from "@/lib/uiAssets";

const types = [
  { id: "Wedding", Icon: Heart },
  { id: "Birthdays", Icon: Cake },
  { id: "Conferences", Icon: Presentation },
];

function EventsContent() {
  const sp = useSearchParams();
  const focus = sp.get("focus");
  const [tab, setTab] = useState(
    focus === "corporate" ? "Conferences" : "Wedding"
  );
  const [eventType, setEventType] = useState(
    focus === "corporate" ? "Corporate" : "Wedding"
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [desc, setDesc] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="relative h-[200px] w-full">
        <Image
          src={UI.eventsHero}
          alt=""
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/75 to-black" />
        <ScreenHeader backHref="/" showLogo subtitle="FOR EVENTS" />
        <div className="absolute bottom-4 left-0 right-0 px-4 text-center">
          <h1 className="font-serif text-2xl sm:text-3xl text-gold">Delight Your Guests</h1>
          <p className="mt-2 text-sm text-white/80 max-w-md mx-auto leading-relaxed">
            Events bring people together and create lasting memories. Make yours even more special
            by treating your guests to the Shoffr experience.
          </p>
        </div>
      </div>

      <div className="px-4 pt-6 max-w-lg mx-auto">
        <div className="flex justify-around border-b border-white/10 pb-2">
          {types.map(({ id, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setEventType(id);
              }}
              className={`flex flex-col items-center gap-1 min-w-[4.5rem] ${
                tab === id ? "text-gold" : "text-white/40"
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={1.25} />
              <span className="text-[11px]">{id}</span>
              {tab === id ? (
                <span className="h-0.5 w-10 bg-gold rounded-full -mb-0.5" />
              ) : (
                <span className="h-0.5 w-10 -mb-0.5" />
              )}
            </button>
          ))}
        </div>

        <h2 className="font-serif text-xl text-gold text-center mt-8 mb-2">
          Plan Your Perfect Event
        </h2>
        <p className="text-sm text-white/75 text-center mb-6">
          Tell us about your event, and we&apos;ll tailor our services to fit your needs.
          We&apos;ll get back to you within 24-48 hours.
        </p>

        <form
          onSubmit={submit}
          className="rounded-t-[2rem] bg-white text-black px-5 pt-8 pb-10 -mx-1 shadow-[0_-8px_40px_rgba(0,0,0,0.45)]"
        >
          {sent ? (
            <p className="text-center text-sm py-8 text-black/70">
              Thank you. Our partnerships team will reach out shortly.
            </p>
          ) : (
            <>
              <label className="block text-xs text-black/50 mb-1.5">Event Type</label>
              <select
                className="w-full rounded-2xl border border-black/15 bg-white px-4 py-3.5 text-sm mb-4 outline-none"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option>Wedding</option>
                <option>Birthdays</option>
                <option>Conferences</option>
                <option>Corporate</option>
              </select>
              <label className="block text-xs text-black/50 mb-1.5">Name</label>
              <input
                className="w-full rounded-2xl bg-neutral-100 px-4 py-3.5 text-sm mb-4 outline-none placeholder:text-black/35"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label className="block text-xs text-black/50 mb-1.5">Phone</label>
              <input
                className="w-full rounded-2xl bg-neutral-100 px-4 py-3.5 text-sm mb-4 outline-none placeholder:text-black/35"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <label className="block text-xs text-black/50 mb-1.5">Description</label>
              <textarea
                className="w-full rounded-2xl bg-neutral-100 px-4 py-3.5 text-sm mb-6 outline-none placeholder:text-black/35 min-h-[100px] resize-none"
                placeholder="Description (date and scale)."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <button
                type="submit"
                className="w-full rounded-pill bg-gold-gradient py-4 text-sm font-bold text-black"
              >
                Get a Callback
              </button>
            </>
          )}
        </form>

        <p className="text-center text-xs text-white/50 mt-8 mb-4">We&apos;ve done events for</p>
        <div className="flex justify-center gap-8 opacity-60 pb-8">
          <span className="text-gold font-semibold tracking-widest text-sm">ATHER</span>
          <span className="text-gold font-semibold tracking-widest text-sm">CRED</span>
          <span className="text-gold font-semibold tracking-widest text-sm">LEVI&apos;S</span>
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white/50 text-sm">
          Loading…
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
