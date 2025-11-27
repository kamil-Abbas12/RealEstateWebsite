import clientPromise from "../../lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const ownerId = session.user.email;
    const client = await clientPromise;
    const db = client.db("realestate");

    // ✅ GET all properties of logged-in user
    if (req.method === "GET") {
      const properties = await db
        .collection("properties")
        .find({ userId: ownerId })
        .toArray();

      const safeProperties = properties.map((p) => ({
         ...p, // copy everything
  _id: p._id.toString(),
  isPremium: p.isPremium || false,
  images: p.images || [],
  createdAt: p.createdAt?.toISOString?.() || null,
  updatedAt: p.updatedAt?.toISOString?.() || null,
      }));

      return res.status(200).json({ success: true, properties: safeProperties });
    }

    // ✅ CREATE NEW PROPERTY
    if (req.method === "POST") {
      const body = req.body;

      if (!body?.title || !body?.address || !body?.price || !body?.images?.length) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      const insertDoc = {
        title: body.title,
        listingType: body.listingType || "sale",
        type: body.listingType === "rent" ? "rent" : "buy",
        price: body.price,
        currency: body.currency || "USD",
        address: body.address,
        lat: body.lat || null,
        lng: body.lng || null,
        bedrooms: body.bedrooms || 1,
        bathrooms: body.bathrooms || 1,
        area: body.area || "",
        propertyType: body.propertyType || "House",
        yearBuilt: body.yearBuilt || "",
        furnished: body.furnished || false,
        garden: body.garden || false,
        parking: body.parking || false,
        description: body.description || "",
        amenities: Array.isArray(body.amenities) ? body.amenities : [],
        images: Array.isArray(body.images) ? body.images : [],
        status: "pending_payment", // ✅ Pending until payment
        isPremium: false, // ✅ Will be set after payment
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: ownerId,
      };

      const result = await db.collection("properties").insertOne(insertDoc);
      return res.status(200).json({ success: true, propertyId: result.insertedId.toString() });
    }

    // ✅ UPDATE EXISTING PROPERTY
    if (req.method === "PUT") {
      const { id, ...updateData } = req.body;
      if (!id)
        return res.status(400).json({ success: false, message: "Missing property ID" });

      const existing = await db.collection("properties").findOne({ _id: new ObjectId(id) });
      if (!existing)
        return res.status(404).json({ success: false, message: "Property not found" });

      if (existing.userId !== ownerId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      if (updateData._id) delete updateData._id;
      updateData.updatedAt = new Date();

      await db.collection("properties").updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("❌ /api/properties error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to save/update property", error: error.message });
  }
}
