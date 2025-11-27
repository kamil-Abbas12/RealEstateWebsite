import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("realestate");

  const premiumProperties = await db
    .collection("properties")
    .find({ isPremium: true })
    .sort({ paidAt: -1 })
    .limit(10)
    .toArray();

  // 🔥 FIX: Map DB fields → Carousel required fields
  const formatted = premiumProperties.map((p) => ({
    _id: p._id.toString(),
    price: p.price,
    area: p.area || null,
    size: p.area || null, // fallback
    location: p.address || p.city || "",
    coverPhoto: p.images?.[0] || null, // ❤️ MAIN FIX
    images: p.images || [],
  }));

  res.status(200).json({ success: true, data: formatted });
}
