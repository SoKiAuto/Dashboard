import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const unit = await db.collection("Units").findOne({ _id: id });
      return new Response(JSON.stringify(unit || null), { status: 200 });
    }

    const units = await db.collection("Units").find({}).toArray();
    return new Response(JSON.stringify(units), { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
