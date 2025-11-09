"use client";

import { useEffect, useMemo, useState } from "react";

import {
  InventoryTable,
  type InventoryItem,
} from "@/components/inventory/inventory-table";
import { FilterMultiSelect } from "@/components/tickets/filter-multi-select";
import { LocationSwitcher } from "@/components/layout/location-switcher";
import { fabricLocations } from "@/lib/locations";

const searchKeys: Array<keyof InventoryItem> = ["name", "category"];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<
    InventoryItem["status"][]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/inventory");
        if (!res.ok) throw new Error("Failed to fetch inventory");
        const data = (await res.json()) as InventoryItem[];
        setItems(data);
      } catch (err) {
        console.error("Inventory fetch failed", err);
        setError("Unable to load inventory from MongoDB");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const statusOptions = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.status))).map(
      (status) => ({
        value: status,
        label: status,
      }),
    );
  }, [items]);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.category))).map(
      (category) => ({
        value: category,
        label: category,
      }),
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (
        selectedStatus.length > 0 &&
        !selectedStatus.includes(item.status)
      ) {
        return false;
      }
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(item.category)
      ) {
        return false;
      }
      if (query.trim().length > 0) {
        const haystack = [
          ...searchKeys.map((key) => String(item[key] ?? "")),
          item.location?.floor ?? "",
          item.location?.shelf ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedStatus, selectedCategories, query]);

  const refillCount = filteredItems.filter((item) =>
    ["Warning", "Critical", "Depleted"].includes(item.depletionStatus),
  ).length;

  const spareCount = filteredItems.filter(
    (item) => item.status === "spare",
  ).length;

  return (
    <div className="min-h-screen bg-[#01040b] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_45%)]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-16 pt-10 lg:px-10">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">
                Inventory
              </p>
              <h1 className="text-4xl font-semibold">
                Predictive shelves · live Mongo feed
              </h1>
              <p className="mt-2 max-w-2xl text-base text-white/70">
                Track high-velocity spares, thresholds, and depletion signals
                across the fabric without exposing site metadata.
              </p>
            </div>
            <div className="w-full max-w-xs flex-1">
              <LocationSwitcher locations={fabricLocations} initialId="demo" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Tracked items",
                value: filteredItems.length.toString().padStart(2, "0"),
                sub: `${items.length} total`,
              },
              {
                label: "Needs refill",
                value: refillCount.toString().padStart(2, "0"),
                sub: "Warning · Critical · Depleted",
              },
              {
                label: "Spare-ready",
                value: spareCount.toString().padStart(2, "0"),
                sub: "Deployable now",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  {stat.label}
                </p>
                <p className="text-3xl font-semibold">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.sub}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <FilterMultiSelect
              label="Status"
              options={statusOptions}
              selected={selectedStatus}
              onChange={(values) =>
                setSelectedStatus(
                  values as InventoryItem["status"][],
                )
              }
            />
            <FilterMultiSelect
              label="Category"
              options={categoryOptions}
              selected={selectedCategories}
              onChange={setSelectedCategories}
            />
            <div className="ml-auto flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search asset, category, floor, or shelf"
                className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none placeholder:text-white/40"
              />
            </div>
          </div>
          {error ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : (
            <InventoryTable items={filteredItems} loading={loading} />
          )}
        </section>
      </div>
    </div>
  );
}
