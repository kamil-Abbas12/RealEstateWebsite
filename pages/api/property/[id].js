import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const { id } = req.query;
  if (!id) return res.status(400).json({ message: "Property ID required" });

  try {
    const client = await clientPromise;
    const db = client.db("realestate");

    const property = await db.collection("properties").findOne({ _id: new ObjectId(id) });
    if (!property) return res.status(404).json({ message: "Property not found" });

    res.status(200).json(property);
  } catch (err) {
    // console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
