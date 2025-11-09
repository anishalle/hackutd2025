"use client";

import { useState, useMemo, useEffect } from "react";

type InventoryItem = {
  _id?: string;
  name: string;
  category: string;
  quantity: number;
  avgWeeklyUsage?: number;
  threshold: number;
  status: "in_use" | "mix" | "idle" | "drained" | "spare";
  location: {
    site: string;
    floor: number | string;
    shelf: string;
    area?: string;
  };
  usageHistory?: number[];
  depletionStatus: string;
  weeksRemaining: number | null;
};

type SortField = "name" | "quantity" | "weeksRemaining" | "site" | "status";
type SortOrder = "asc" | "desc";

export default function Page() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching inventory:", error);
        setLoading(false);
      });
  }, []);


  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;


    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.location.site.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    return filtered.sort((a, b) => {
      let aVal: any = a[sortField === "site" ? "location" : sortField];
      let bVal: any = b[sortField === "site" ? "location" : sortField];

      if (sortField === "site") {
        aVal = a.location.site.toLowerCase();
        bVal = b.location.site.toLowerCase();
      } else if (sortField === "name") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      } else if (sortField === "weeksRemaining") {
        aVal = aVal ?? Infinity;
        bVal = bVal ?? Infinity;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [items, searchQuery, statusFilter, sortField, sortOrder]);

  const needsRefill = useMemo(
    () =>
      filteredAndSortedItems.filter(
        (item) => item.depletionStatus === "Warning" || item.depletionStatus === "Critical"
      ),
    [filteredAndSortedItems]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className={sortField !== field ? "text-slate-600 ml-1" : "ml-1"}>
      {sortField !== field ? "↕" : sortOrder === "asc" ? "↑" : "↓"}
    </span>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      in_use: "bg-green-500/20 text-green-400",
      mix: "bg-yellow-500/20 text-yellow-400",
      idle: "bg-blue-500/20 text-blue-400",
      drained: "bg-red-500/20 text-red-400",
      spare: "bg-slate-500/20 text-slate-300",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.spare}`}>
        {status}
      </span>
    );
  };

  const DepletionBadge = ({ status }: { status: string }) => {
    const colors = {
      Healthy: "bg-green-500/20 text-green-400",
      Warning: "bg-yellow-500/20 text-yellow-400",
      Critical: "bg-red-500/20 text-red-400",
      Depleted: "bg-red-600/20 text-red-500",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || "bg-slate-500/20 text-slate-300"}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading inventory...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-2xl font-semibold mb-4">NMC Inventory Overview</h1>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Search Bar */}
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="Search by name, category, or site..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-slate-500"
          >
            <option value="all">All Statuses</option>
            <option value="in_use">In Use</option>
            <option value="mix">Mix</option>
            <option value="idle">Idle</option>
            <option value="drained">Drained</option>
            <option value="spare">Spare</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="flex items-center px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg">
          <span className="text-sm text-slate-400">
            Showing {filteredAndSortedItems.length} of {items.length} items
          </span>
        </div>
      </div>

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
          <div className="overflow-x-auto">
            <table className="w-full border border-slate-800 text-sm">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-3 py-2 text-left">Asset</th>
                  <th className="px-3 py-2 text-left">Site</th>
                  <th className="px-3 py-2 text-left">Floor</th>
                  <th className="px-3 py-2 text-left">Shelf</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Threshold</th>
                  <th className="px-3 py-2 text-right">Weeks Left</th>
                  <th className="px-3 py-2 text-right">Predicted Depletion</th>
                </tr>
              </thead>
              <tbody>
                {needsRefill.map((item) => (
                  <tr key={item._id || item.name} className="border-t border-slate-800">
                    <td className="px-3 py-2">{item.name}</td>
                    <td className="px-3 py-2">{item.location.site}</td>
                    <td className="px-3 py-2">{item.location.floor}</td>
                    <td className="px-3 py-2">{item.location.shelf}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{item.threshold}</td>
                    <td className="px-3 py-2 text-right">{item.weeksRemaining ?? "-"}</td>
                    <td className="px-3 py-2 text-right">
                      <DepletionBadge status={item.depletionStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="border-t border-slate-800 my-6" />

      {/* All Inventory Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">All Inventory Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-slate-800 text-sm">
            <thead className="bg-slate-900">
              <tr>
                <th
                  className="px-3 py-2 text-left cursor-pointer hover:bg-slate-800"
                  onClick={() => handleSort("name")}
                >
                  Asset <SortIcon field="name" />
                </th>
                <th
                  className="px-3 py-2 text-left cursor-pointer hover:bg-slate-800"
                  onClick={() => handleSort("site")}
                >
                  Site <SortIcon field="site" />
                </th>
                <th className="px-3 py-2 text-left">Floor</th>
                <th className="px-3 py-2 text-left">Shelf</th>
                <th
                  className="px-3 py-2 text-left cursor-pointer hover:bg-slate-800"
                  onClick={() => handleSort("status")}
                >
                  Status <SortIcon field="status" />
                </th>
                <th
                  className="px-3 py-2 text-right cursor-pointer hover:bg-slate-800"
                  onClick={() => handleSort("quantity")}
                >
                  Qty <SortIcon field="quantity" />
                </th>
                <th className="px-3 py-2 text-right">Threshold</th>
                <th
                  className="px-3 py-2 text-right cursor-pointer hover:bg-slate-800"
                  onClick={() => handleSort("weeksRemaining")}
                >
                  Weeks Left <SortIcon field="weeksRemaining" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedItems.map((item) => (
                <tr key={item._id || item.name} className="border-t border-slate-800">
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">{item.location.site}</td>
                  <td className="px-3 py-2">{item.location.floor}</td>
                  <td className="px-3 py-2">{item.location.shelf}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">{item.threshold}</td>
                  <td className="px-3 py-2 text-right">{item.weeksRemaining ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedItems.length === 0 && (
          <p className="text-sm text-slate-400 mt-4 text-center">
            No items match your current filters.
          </p>
        )}
      </section>
    </main>
  );
}