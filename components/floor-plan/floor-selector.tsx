import { FabricFloor } from "@/lib/floor-plan/types";

type FloorSelectorProps = {
  floors: FabricFloor[];
  activeFloorId: string;
  onSelect: (floorId: string) => void;
};

export function FloorSelector({
  floors,
  activeFloorId,
  onSelect,
}: FloorSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {floors.map((floor) => {
        const isActive = floor.id === activeFloorId;
        return (
          <button
            key={floor.id}
            type="button"
            onClick={() => onSelect(floor.id)}
            className={`flex flex-col rounded-2xl border px-4 py-3 text-left transition ${
              isActive
                ? "border-cyan-400/80 bg-cyan-500/10 text-white shadow-lg shadow-cyan-500/20"
                : "border-white/10 bg-white/5 text-white/70 hover:border-white/40"
            }`}
          >
            <span className="text-xs uppercase tracking-[0.3em]">
              {floor.level}
            </span>
            <span className="text-sm font-semibold">{floor.label}</span>
            <span className="text-xs text-white/50">{floor.elevation}</span>
          </button>
        );
      })}
    </div>
  );
}
