// pages/api/properties/[id].js
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const { id } = req.query;

  // ✅ Validate ID format early
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid property ID" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("realestate");

    // ✅ GET - Fetch single property
    if (req.method === "GET") {
      const property = await db
        .collection("properties")
        .findOne({ _id: new ObjectId(id) });

      if (!property) {
        return res.status(404).json({ success: false, message: "Property not found" });
      }

      // ✅ Convert ObjectId and Dates to strings for Next.js serialization
      const safeProperty = {
        ...property,
        _id: property._id.toString(),
        createdAt: property.createdAt ? new Date(property.createdAt).toISOString() : null,
        updatedAt: property.updatedAt ? new Date(property.updatedAt).toISOString() : null,
      };

      return res.status(200).json({ success: true, property: safeProperty });
    }

    // ✅ PUT - Update property (requires authentication)
    if (req.method === "PUT") {
      // ✅ Use getServerSession (more secure than getSession)
      const session = await getServerSession(req, res, authOptions);
      
      if (!session) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const ownerId = session.user.email;

      // ✅ Check if property exists and verify ownership
      const existing = await db.collection("properties").findOne({ 
        _id: new ObjectId(id) 
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: "Property not found" });
      }

      if (existing.userId !== ownerId) {
        return res.status(403).json({ 
          success: false, 
          message: "Forbidden: You cannot edit this property" 
        });
      }

      // ✅ Prepare update data
      const { _id, userId, createdAt, ...updates } = req.body;
      updates.updatedAt = new Date();

      // ✅ Perform update
      const result = await db.collection("properties").updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );

      if (result.modifiedCount === 0) {
        return res.status(200).json({ 
          success: true, 
          message: "No changes detected" 
        });
      }

      return res.status(200).json({ 
        success: true, 
        message: "Property updated successfully" 
      });
    }

    // ✅ DELETE - Remove property (optional, for future use)
    if (req.method === "DELETE") {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const ownerId = session.user.email;

      const existing = await db.collection("properties").findOne({ 
        _id: new ObjectId(id) 
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: "Property not found" });
      }

      if (existing.userId !== ownerId) {
        return res.status(403).json({ 
          success: false, 
          message: "Forbidden: You cannot delete this property" 
        });
      }

      await db.collection("properties").deleteOne({ _id: new ObjectId(id) });

      return res.status(200).json({ 
        success: true, 
        message: "Property deleted successfully" 
      });
    }

    // ❌ Method not allowed
    return res.status(405).json({ success: false, message: "Method not allowed" });

  } catch (error) {
    // console.error("❌ /api/properties/[id] error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
}
