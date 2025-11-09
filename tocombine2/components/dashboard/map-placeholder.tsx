export function MapPlaceholder() {
  return (
    <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-3xl border border-dashed border-cyan-400/40 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.4),_transparent_55%)]" />
      <div className="relative space-y-1 text-white/80">
        <p className="text-sm uppercase tracking-[0.4em] text-white/40">
          Map placeholder
        </p>
        <p className="text-lg font-semibold">Next.js canvas is reserved</p>
        <p className="text-xs text-white/60">
          Floor plan + distance model plugs in here.
        </p>
      </div>
    </div>
  );
}
