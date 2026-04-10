"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function ProfilePage() {
  const { user, ready, login, logout } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/50 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 pt-12 pb-28 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold text-gold mb-2">Profile</h1>
      <p className="text-sm text-white/55 mb-8">
        Mock login — switch between rider and driver for the full lost-item loop.
      </p>

      {user ? (
        <div className="rounded-card bg-surface ring-1 ring-white/10 p-5 mb-6">
          <p className="text-white font-medium">{user.name}</p>
          <p className="text-xs text-white/45 mt-1">{user.email}</p>
          <p className="text-xs text-gold mt-2 uppercase tracking-wide">{user.role}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full rounded-pill border border-white/20 py-2.5 text-sm text-white/80"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          <button
            type="button"
            onClick={() => login("user")}
            className="w-full rounded-pill bg-gold-gradient py-3.5 text-sm font-semibold text-black"
          >
            Continue as Rider
          </button>
          <button
            type="button"
            onClick={() => login("driver")}
            className="w-full rounded-pill border border-gold py-3.5 text-sm font-medium text-gold"
          >
            Continue as Driver
          </button>
        </div>
      )}

      {user?.role === "driver" ? (
        <Link
          href="/driver"
          className="block text-center rounded-pill bg-white/10 py-3 text-sm text-white mb-4"
        >
          Open driver dashboard
        </Link>
      ) : null}

      {user?.role === "user" ? (
        <p className="text-xs text-white/40 text-center">
          Driver view: sign out and log in as driver to confirm lost items.
        </p>
      ) : null}
    </div>
  );
}
