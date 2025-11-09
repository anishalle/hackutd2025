export type InventoryItem = {
  _id?: string;
  name: string;
  category: string;
  quantity: number;
  avgWeeklyUsage?: number;
  threshold: number;
  status: "in_use" | "idle" | "mix" | "drained" | "spare";
  location: {
    site?: string;
    floor?: number | string;
    shelf?: string;
    area?: string;
  };
  depletionStatus: "Healthy" | "Warning" | "Critical" | "Depleted" | string;
  weeksRemaining: number | null;
};

type InventoryTableProps = {
  items: InventoryItem[];
  loading?: boolean;
};

const statusColor: Record<InventoryItem["status"], string> = {
  in_use: "text-emerald-200 bg-emerald-500/10 border border-emerald-400/30",
  idle: "text-blue-200 bg-blue-500/10 border border-blue-400/30",
  mix: "text-amber-200 bg-amber-500/10 border border-amber-400/30",
  drained: "text-rose-200 bg-rose-500/10 border border-rose-400/30",
  spare: "text-cyan-200 bg-cyan-500/10 border border-cyan-400/30",
};

const depletionColor: Record<string, string> = {
  Healthy: "text-emerald-200 bg-emerald-500/10 border border-emerald-400/30",
  Warning: "text-amber-200 bg-amber-500/10 border border-amber-400/30",
  Critical: "text-rose-200 bg-rose-500/10 border border-rose-400/30",
  Depleted: "text-red-200 bg-red-500/10 border border-red-400/30",
};

export function InventoryTable({ items, loading }: InventoryTableProps) {
  const placeholderRows = Array.from({ length: 6 }, (_, idx) => idx);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <table className="w-full text-left text-sm text-white/80">
        <thead className="bg-white/5 text-xs uppercase tracking-[0.3em] text-white/40">
          <tr>
            {[
              "Asset",
              "Location",
              "Quantity",
              "Status",
              "Depletion",
              "Weeks remaining",
            ].map((column) => (
              <th key={column} className="px-4 py-4 font-normal">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? placeholderRows.map((row) => (
                <tr
                  key={`skeleton-${row}`}
                  className="border-t border-white/5 text-white/60"
                >
                  <td className="px-4 py-4">
                    <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-16 animate-pulse rounded-full bg-white/10" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-20 animate-pulse rounded-full bg-white/10" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-16 animate-pulse rounded-full bg-white/10" />
                  </td>
                </tr>
              ))
            : items.map((item) => (
                <tr
                  key={item._id ?? item.name}
                  className="border-t border-white/5 text-white hover:bg-white/5"
                >
                  <td className="px-4 py-4 font-semibold">
                    <p>{item.name}</p>
                    <p className="text-xs text-white/60">{item.category}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm">
                        Floor {item.location?.floor ?? "—"}
                      </span>
                      <span className="text-xs text-white/60">
                        Shelf {item.location?.shelf ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-base font-semibold">
                        {item.quantity}
                      </span>
                      <span className="text-xs text-white/60">
                        Threshold {item.threshold}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColor[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        depletionColor[item.depletionStatus] ??
                        "text-white bg-white/5 border border-white/10"
                      }`}
                    >
                      {item.depletionStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {item.weeksRemaining !== null
                      ? `${item.weeksRemaining} w`
                      : "—"}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
