const segments = [
  {
    id: "Fabric A",
    status: "Healthy · loss 0.4dB",
    barClass: "bg-emerald-400",
  },
  {
    id: "Fabric B",
    status: "Rerouted · awaiting sweep",
    barClass: "bg-amber-300",
  },
  {
    id: "NVLink spine",
    status: "Investigate · loss 2.1dB",
    barClass: "bg-rose-400",
  },
];

export function CablingVisualizer() {
  return (
    <div className="space-y-4">
      <svg
        viewBox="0 0 320 130"
        className="w-full rounded-3xl border border-white/10 bg-slate-950/40 p-4"
      >
        <defs>
          <linearGradient id="cableGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <polyline
          points="10,30 120,30 160,60 220,60 310,20"
          fill="none"
          stroke="url(#cableGlow)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.6"
        />
        <polyline
          points="10,80 80,80 120,40 200,100 310,100"
          fill="none"
          stroke="#fde047"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="6 8"
          opacity="0.8"
        />
        <polyline
          points="10,110 150,110 190,70 260,70 310,50"
          fill="none"
          stroke="#fb7185"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
      <div className="grid gap-3 md:grid-cols-3">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              {segment.id}
            </p>
            <p className="text-base font-semibold">{segment.status}</p>
            <div className="mt-2 h-1 rounded-full bg-white/10">
              <div
                className={`h-1 rounded-full ${segment.barClass}`}
                style={{ width: "80%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
