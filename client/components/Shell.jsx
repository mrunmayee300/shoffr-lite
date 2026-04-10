"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

const hideNav = ["/driver"];

export function Shell({ children }) {
  const pathname = usePathname();
  const hidden = hideNav.some((p) => pathname === p || pathname.startsWith(p + "/"));
  return (
    <>
      {children}
      <BottomNav hidden={hidden} />
    </>
  );
}
