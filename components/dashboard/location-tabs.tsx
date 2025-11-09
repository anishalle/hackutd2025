type LocationOption = {
  id: string;
  name: string;
  status: string;
  detail?: string;
  disabled?: boolean;
};

type LocationTabsProps = {
  locations: LocationOption[];
  activeId: string;
  onSelect?: (id: string) => void;
};

export function LocationTabs({
  locations,
  activeId,
  onSelect,
}: LocationTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
      {locations.map((location) => {
        const isActive = location.id === activeId;
        return (
          <button
            key={location.id}
            onClick={() => !location.disabled && onSelect?.(location.id)}
            className={`flex min-w-[160px] flex-1 cursor-pointer flex-col rounded-2xl px-4 py-3 text-left transition ${
              location.disabled
                ? "cursor-not-allowed opacity-40"
                : isActive
                ? "bg-gradient-to-r from-cyan-500/60 to-blue-500/60 text-white shadow-[0_15px_45px_-25px_rgba(56,189,248,0.9)]"
                : "text-white/70 hover:bg-white/10"
            }`}
            disabled={location.disabled}
          >
            <span className="text-sm font-semibold">{location.name}</span>
            <span className="text-xs uppercase tracking-wide text-white/60">
              {location.status}
            </span>
            {location.detail && (
              <span className="text-[11px] text-white/50">{location.detail}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
