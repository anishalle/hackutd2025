import clientPromise from "@/lib/mongodb";

type InventoryItem = {
  _id?: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  avgWeeklyUsage?: number;
  threshold: number;
};

function getStatus(item: InventoryItem) {
  const { quantity, avgWeeklyUsage } = item;

  if (!avgWeeklyUsage || avgWeeklyUsage <= 0) return "Healthy"; // default safe
  const weeksRemaining = quantity / avgWeeklyUsage;

  if (weeksRemaining <= 1) return "Critical";
  if (weeksRemaining <= 2) return "Warning";
  return "Healthy";
}


function getWeeksRemaining(item: InventoryItem) {
  if (!item.avgWeeklyUsage || item.avgWeeklyUsage <= 0) return null;
  return Number((item.quantity / item.avgWeeklyUsage).toFixed(1));
}

export default async function Page() {
  const client = await clientPromise;
  const db = client.db("nmc");
  const rawItems = (await db.collection("inventory").find({}).toArray()) as any[];

  const items: (InventoryItem & {
    status: string;
    weeksRemaining: number | null;
  })[] = rawItems.map((doc) => {
    const base: InventoryItem = {
      _id: doc._id?.toString(),
      name: doc.name,
      category: doc.category,
      location: doc.location,
      quantity: doc.quantity,
      avgWeeklyUsage: doc.avgWeeklyUsage,
      threshold: doc.threshold,
    };

    const status = getStatus(base);
    const weeksRemaining = getWeeksRemaining(base);

    return { ...base, status, weeksRemaining };
  });

  const needsRefill = items.filter(
    (item) => item.status === "Warning" || item.status === "Critical"
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-2xl font-semibold mb-4">
        NMC Inventory Overview
      </h1>

      {/* Needs Refill Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Items Needing Refill (Warning & Critical)
        </h2>

        {needsRefill.length === 0 ? (
          <p className="text-sm text-slate-400">
            All inventory levels are currently healthy.
          </p>
        ) : (
          <table className="w-full border border-slate-800 text-sm">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Location</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Threshold</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Weeks Left</th>
              </tr>
            </thead>
            <tbody>
              {needsRefill.map((item) => (
                <tr key={item._id || item.name} className="border-t border-slate-800">
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">{item.category}</td>
                  <td className="px-3 py-2">{item.location}</td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">{item.threshold}</td>
                  <td
                    className={`px-3 py-2 font-medium ${
                      item.status === "Critical"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {item.status}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {item.weeksRemaining ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Divider */}
      <div className="border-t border-slate-800 my-6" />

      {/* All Inventory Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">All Inventory Items</h2>
        <table className="w-full border border-slate-800 text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Threshold</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Weeks Left</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id || item.name} className="border-t border-slate-800">
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2">{item.category}</td>
                <td className="px-3 py-2">{item.location}</td>
                <td className="px-3 py-2 text-right">{item.quantity}</td>
                <td className="px-3 py-2 text-right">{item.threshold}</td>
                <td
                  className={`px-3 py-2 font-medium ${
                    item.status === "Healthy"
                      ? "text-emerald-400"
                      : item.status === "Warning"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {item.status}
                </td>
                <td className="px-3 py-2 text-right">
                  {item.weeksRemaining ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
