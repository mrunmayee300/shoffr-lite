"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CarFront, UserRound } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/trips", label: "Trips", Icon: CarFront },
  { href: "/profile", label: "Profile", Icon: UserRound },
];

export function BottomNav({ hidden }) {
  const pathname = usePathname();
  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-black/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-2">
        {tabs.map(({ href, label, Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-xs ${
                active ? "text-gold" : "text-white/45"
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="mx-auto h-1 w-28 rounded-full bg-white/20 mb-1" aria-hidden />
    </nav>
  );
}
