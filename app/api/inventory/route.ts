import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";

type InventoryRecord = {
  _id?: string;
  name: string;
  category: string;
  quantity: number;
  avgWeeklyUsage?: number;
  threshold: number;
  status: "in_use" | "mix" | "idle" | "drained" | "spare";
  location: {
    site?: string;
    floor?: number | string;
    shelf?: string;
    area?: string;
  };
  usageHistory?: number[];
};

type InventoryResponse = InventoryRecord & {
  depletionStatus: string;
  weeksRemaining: number | null;
};

const getDepletionStatus = (item: InventoryRecord) => {
  const { quantity, avgWeeklyUsage = 0, threshold, usageHistory = [] } = item;

  if (avgWeeklyUsage <= 0) return "Healthy";

  let adjustedUsage = avgWeeklyUsage;
  if (usageHistory.length >= 2) {
    const trend = usageHistory[usageHistory.length - 1] - usageHistory[0];
    const trendFactor = trend / (usageHistory.length * 10);
    adjustedUsage += adjustedUsage * trendFactor;
  }

  const weeksRemaining = (quantity - threshold) / adjustedUsage;

  if (weeksRemaining <= 0) return "Depleted";
  if (weeksRemaining <= 1) return "Critical";
  if (weeksRemaining <= 2) return "Warning";
  return "Healthy";
};

const getWeeksRemaining = (item: InventoryRecord) => {
  if (!item.avgWeeklyUsage || item.avgWeeklyUsage <= 0) return null;
  return Number(
    ((item.quantity - item.threshold) / item.avgWeeklyUsage).toFixed(1),
  );
};

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("nmc");
    const rawItems = await db.collection("inventory").find({}).toArray();

    const items: InventoryResponse[] = rawItems.map((doc) => {
      const base: InventoryRecord = {
        _id: doc._id?.toString(),
        name: doc.name,
        category: doc.category,
        quantity: doc.quantity,
        avgWeeklyUsage: doc.avgWeeklyUsage,
        threshold: doc.threshold,
        status: doc.status,
        location: {
          site: doc.location?.site ?? "Unknown",
          floor: doc.location?.floor ?? "-",
          shelf: doc.location?.shelf ?? "-",
          area: doc.location?.area ?? "-",
        },
        usageHistory: doc.usageHistory ?? [],
      };

      return {
        ...base,
        depletionStatus: getDepletionStatus(base),
        weeksRemaining: getWeeksRemaining(base),
      };
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}
