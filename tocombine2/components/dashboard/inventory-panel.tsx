type InventoryItem = {
  item: string;
  onHand: number;
  threshold: number;
  daysRemaining: number;
  usageTrend: "rising" | "steady" | "cooling";
};

type InventoryPanelProps = {
  items: InventoryItem[];
};

const trendCopy: Record<InventoryItem["usageTrend"], string> = {
  rising: "Rising consumption",
  steady: "Stable",
  cooling: "Cooling demand",
};

export function InventoryPanel({ items }: InventoryPanelProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <table className="w-full text-left text-sm text-white/80">
        <thead className="bg-white/5 text-xs uppercase tracking-[0.3em] text-white/50">
          <tr>
            <th className="px-4 py-3 font-normal">Item</th>
            <th className="px-4 py-3 font-normal">On-hand</th>
            <th className="px-4 py-3 font-normal">Threshold</th>
            <th className="px-4 py-3 font-normal">Days</th>
            <th className="px-4 py-3 font-normal">Signal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.item}
              className="border-t border-white/5 text-white/90 hover:bg-white/5"
            >
              <td className="px-4 py-3 font-semibold text-white">
                {item.item}
              </td>
              <td className="px-4 py-3">{item.onHand}</td>
              <td className="px-4 py-3 text-white/60">{item.threshold}</td>
              <td
                className={`px-4 py-3 font-semibold ${
                  item.daysRemaining < 7
                    ? "text-rose-200"
                    : item.daysRemaining < 14
                    ? "text-amber-200"
                    : "text-emerald-200"
                }`}
              >
                {item.daysRemaining}
              </td>
              <td className="px-4 py-3 text-xs">{trendCopy[item.usageTrend]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
