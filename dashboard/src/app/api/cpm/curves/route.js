import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const col = db.collection("CPM_Data");

    const curveDoc = await col.findOne({ _id: "CurveData" });

    if (!curveDoc) {
      return new Response(JSON.stringify({ error: "No curve data found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ cylinders: curveDoc.cylinders }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ API error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
