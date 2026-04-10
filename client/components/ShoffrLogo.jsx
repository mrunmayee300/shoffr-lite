export function ShoffrLogo({ className = "", size = "md" }) {
  const sz = size === "lg" ? "text-3xl sm:text-4xl" : "text-2xl";
  return (
    <div
      className={`font-serif font-semibold tracking-[0.18em] text-gold ${sz} ${className}`}
    >
      SH
      <span
        className="inline-block align-middle w-[0.5em] h-[0.5em] mx-0.5 rounded-full border-[0.12em] border-gold"
        aria-hidden
      />
      FR
    </div>
  );
}
