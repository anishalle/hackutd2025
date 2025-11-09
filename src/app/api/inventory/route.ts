import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";


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
};


function getDepletionStatus(item: InventoryItem) {
  const { quantity, avgWeeklyUsage = 0, threshold, usageHistory = [] } = item;


  if (avgWeeklyUsage <= 0) return "Healthy";


  // Trend adjustment
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
}


function getWeeksRemaining(item: InventoryItem) {
  if (!item.avgWeeklyUsage || item.avgWeeklyUsage <= 0) return null;
  return Number(((item.quantity - item.threshold) / item.avgWeeklyUsage).toFixed(1));
}


export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("nmc");
    const rawItems = (await db.collection("inventory").find({}).toArray()) as any[];


    const items = rawItems.map((doc) => {
      const base: InventoryItem = {
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


      const depletionStatus = getDepletionStatus(base);
      const weeksRemaining = getWeeksRemaining(base);


      return { ...base, depletionStatus, weeksRemaining };
    });


    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}



