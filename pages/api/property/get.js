// pages/api/property/get.js
import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("realestate");

    // Only return active/published properties for public listing
    const props = await db
      .collection("properties")
      .find({ status: "active" })
      .project({
        title: 1,
        price: 1,
        currency: 1,
        images: 1,
        listingType: 1,
        isPremium: 1,
        address: 1,
        area: 1,
        propertyType: 1,
        createdAt: 1,
      })
      .toArray();

    const safe = props.map((p) => ({
      _id: p._id.toString(),
      title: p.title,
      price: p.price,
      currency: p.currency,
      images: p.images || [],
      listingType: p.listingType || "sale",
      isPremium: !!p.isPremium,
      address: p.address || "",
      area: p.area || "",
      propertyType: p.propertyType || "",
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    }));

    // Important: return an array (your frontend expects an array)
    return res.status(200).json(safe);
  } catch (err) {
    // console.error("❌ /api/property/get error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch properties" });
  }
}
