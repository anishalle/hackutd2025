import { TileDefinition } from "@/lib/floor-plan/types";

type FloorPlanLegendProps = {
  tiles: TileDefinition[];
};

const legendOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function FloorPlanLegend({ tiles }: FloorPlanLegendProps) {
  const sorted = legendOrder
    .map((id) => tiles.find((tile) => tile.id === id))
    .filter((tile): tile is TileDefinition => Boolean(tile));

  return (
    <div className="rounded-3xl border border-white/5 bg-slate-950/60 p-5 shadow-lg">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Legend
      </p>
      <div className="mt-4 space-y-3">
        {sorted.map((tile) => (
          <div
            key={tile.id}
            className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-white/80"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-9 w-9 rounded-xl border border-white/10"
                style={{ backgroundColor: tile.fill }}
              />
              <div>
                <p className="font-mono text-xs text-white/60">
                  #{tile.id} · {tile.label}
                </p>
                <p className="text-[13px] text-white/70">{tile.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
