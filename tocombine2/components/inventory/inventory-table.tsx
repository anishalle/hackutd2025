type InventoryAsset = {
  id: string;
  item: string;
  shelf: string;
  floor: string;
  status: "in_use" | "idle" | "mix" | "drained";
  spare: boolean;
  timeInUse: string;
  utilization: string;
  slurmState: string;
};

type InventoryTableProps = {
  assets: InventoryAsset[];
};

const statusColor: Record<InventoryAsset["status"], string> = {
  in_use: "text-emerald-200 bg-emerald-500/10 border border-emerald-400/30",
  idle: "text-blue-200 bg-blue-500/10 border border-blue-400/30",
  mix: "text-amber-200 bg-amber-500/10 border border-amber-400/30",
  drained: "text-rose-200 bg-rose-500/10 border border-rose-400/30",
};

export function InventoryTable({ assets }: InventoryTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <table className="w-full text-left text-sm text-white/80">
        <thead className="bg-white/5 text-xs uppercase tracking-[0.3em] text-white/40">
          <tr>
            {[
              "Asset",
              "Shelf",
              "Floor",
              "Status",
              "Spare",
              "Time in use",
              "Utilization",
              "SLURM state",
            ].map((column) => (
              <th key={column} className="px-4 py-4 font-normal">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr
              key={asset.id}
              className="border-t border-white/5 text-white hover:bg-white/5"
            >
              <td className="px-4 py-4 font-semibold">
                <p>{asset.item}</p>
                <p className="text-xs text-white/60">{asset.id}</p>
              </td>
              <td className="px-4 py-4">{asset.shelf}</td>
              <td className="px-4 py-4">{asset.floor}</td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColor[asset.status]}`}
                >
                  {asset.status}
                </span>
              </td>
              <td className="px-4 py-4">
                {asset.spare ? (
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100">
                    Spare
                  </span>
                ) : (
                  <span className="text-white/50">Primary</span>
                )}
              </td>
              <td className="px-4 py-4">{asset.timeInUse}</td>
              <td className="px-4 py-4">{asset.utilization}</td>
              <td className="px-4 py-4">{asset.slurmState}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type { InventoryAsset };
