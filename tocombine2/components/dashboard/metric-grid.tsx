type Metric = {
  label: string;
  value: string;
  subLabel: string;
  trend?: string;
  accent?: string;
};

type MetricGridProps = {
  metrics: Metric[];
};

export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4 text-white shadow-[0_10px_35px_-25px_rgba(14,165,233,1)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_rgba(15,23,42,0))]" />
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            {metric.label}
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-semibold">{metric.value}</p>
            {metric.trend && (
              <span className="text-xs font-medium text-emerald-300">
                {metric.trend}
              </span>
            )}
          </div>
          <p className="text-sm text-white/70">{metric.subLabel}</p>
        </div>
      ))}
    </div>
  );
}
