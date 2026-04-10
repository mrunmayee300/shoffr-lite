"use client";

import Link from "next/link";
import { ChevronDown, ChevronLeft } from "lucide-react";

export function ScreenHeader({
  title,
  subtitle,
  backHref = "/",
  right,
  showLogo,
}) {
  return (
    <header className="relative z-10 pt-2">
      <div className="flex items-start justify-between gap-3 px-4 pt-3">
        <Link
          href={backHref}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-white ring-1 ring-white/10"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6 -ml-0.5" />
        </Link>
        {right ? <div className="shrink-0">{right}</div> : <span className="w-10" />}
      </div>
      <div className="px-4 pb-2">
        {showLogo ? (
          <div className="text-center mt-2">
            <div className="font-serif text-gold text-2xl tracking-widest">SHOFFR</div>
            {subtitle ? (
              <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-gold/90 flex items-center justify-center gap-2">
                <span className="h-px w-8 bg-gold/40" />
                {subtitle}
                <span className="h-px w-8 bg-gold/40" />
              </p>
            ) : null}
          </div>
        ) : (
          <>
            {title ? (
              <h1 className="mt-1 font-semibold text-gold text-2xl tracking-tight">{title}</h1>
            ) : null}
            {subtitle && !showLogo ? (
              <button
                type="button"
                className="mt-1 flex items-center gap-1 text-sm text-white/80"
              >
                {subtitle}
                <ChevronDown className="h-4 w-4 text-gold/80" />
              </button>
            ) : null}
          </>
        )}
      </div>
    </header>
  );
}
