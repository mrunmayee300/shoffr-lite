export function BookingShell({ children }) {
  return (
    <div className="min-h-screen bg-black relative bg-hex">
      <div className="absolute top-0 right-0 w-40 h-40 opacity-40 pointer-events-none bg-hex" />
      <div className="relative z-10 max-w-lg mx-auto pb-28">{children}</div>
    </div>
  );
}

export function DarkCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-[1.35rem] bg-[#161616] ring-1 ring-white/[0.06] overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export function RowDivider() {
  return <div className="h-px bg-white/[0.06] mx-4" />;
}
