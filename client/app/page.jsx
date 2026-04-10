import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Plane,
  Luggage,
  Zap,
  Headphones,
  PawPrint,
  ArrowRight,
  Building2,
  Wine,
} from "lucide-react";
import { ShoffrLogo } from "@/components/ShoffrLogo";
import { UI } from "@/lib/uiAssets";

const services = [
  { href: "/hourly", label: "Hourly Rentals", Icon: Clock },
  { href: "/airport", label: "Airport Transfers", Icon: Plane },
  { href: "/outstation", label: "Outstation Trips", Icon: Luggage },
];

const partners = [
  { href: "/events?focus=corporate", label: "Corporate Partnerships", Icon: Building2 },
  { href: "/events", label: "Wedding & Events", Icon: Wine },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <div className="relative h-[220px] sm:h-[260px] w-full overflow-hidden">
        <Image
          src={UI.homeHero}
          alt=""
          fill
          className="object-cover object-[center_35%] opacity-90"
          priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/75 to-black" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4 text-center">
          <ShoffrLogo size="lg" className="drop-shadow-lg" />
          <p className="mt-3 text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-gold flex items-center gap-3">
            <span className="h-px w-10 bg-gold/50" />
            The gold standard of rides
            <span className="h-px w-10 bg-gold/50" />
          </p>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10 space-y-6 max-w-lg mx-auto">
        <div className="grid grid-cols-3 gap-2">
          {services.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="rounded-card bg-white/[0.04] ring-1 ring-white/10 px-2 py-4 flex flex-col items-center gap-2 text-center hover:ring-gold/40 transition-colors"
            >
              <Icon className="h-7 w-7 text-gold" strokeWidth={1.25} />
              <span className="text-[11px] leading-tight text-gold font-medium">{label}</span>
            </Link>
          ))}
        </div>

        <div className="rounded-card bg-surface ring-1 ring-white/10 overflow-hidden">
          <div className="bg-[#1a1510] px-4 py-2.5 text-center text-xs font-medium text-gold tracking-wide">
            Read FAQs
          </div>
          <div className="p-4 flex gap-3">
            <ul className="flex-1 space-y-3 text-sm text-white/90">
              <li className="flex gap-2 items-start">
                <Zap className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                Premium BYD EVs
              </li>
              <li className="flex gap-2 items-start">
                <Headphones className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                Human Support
              </li>
              <li className="flex gap-2 items-start">
                <PawPrint className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                Pet Friendly
              </li>
            </ul>
            <button
              type="button"
              className="shrink-0 h-12 w-12 rounded-full border border-gold/60 flex items-center justify-center text-gold"
              aria-label="More"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-gold font-semibold mb-3">
            Explore partnerships
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {partners.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="rounded-card aspect-[4/3] bg-white/[0.04] ring-1 ring-white/10 flex flex-col items-center justify-center gap-2 hover:ring-gold/35 transition-colors"
              >
                <Icon className="h-8 w-8 text-gold" strokeWidth={1.2} />
                <span className="text-xs text-gold text-center px-2 leading-snug">{label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
