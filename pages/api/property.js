import formidable from "formidable";
import fs from "fs";
import path from "path";
import clientPromise from "@/lib/mongodb";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const form = new formidable.IncomingForm({ multiples: true, keepExtensions: true, uploadDir: path.join(process.cwd(), "/public/uploads") });

  // ensure upload dir
  if (!fs.existsSync(form.uploadDir)) fs.mkdirSync(form.uploadDir, { recursive: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      // console.error(err);
      return res.status(500).json({ success: false, message: "Upload error" });
    }

    // normalize images
    const uploadedImages = [];
    if (files.images) {
      const arr = Array.isArray(files.images) ? files.images : [files.images];
      for (const file of arr) {
        // file.path is already in uploadDir with a generated name
        const rel = file.path.replace(process.cwd() + "/public", "");
        uploadedImages.push(rel);
      }
    }

    // parse amenities if string
    let amenities = [];
    try { amenities = JSON.parse(fields.amenities || "[]"); } catch (e) { amenities = (fields.amenities || "").split(",").map(s=>s.trim()).filter(Boolean); }

    // save to DB
    try {
      const client = await clientPromise;
      const db = client.db("realestate");
    const doc = {
  title: fields.title,
  listingType: fields.listingType, // sale or rent ✅
  price: fields.price,
  currency: fields.currency,
  address: fields.address,
  lat: fields.lat,
  lng: fields.lng,
  bedrooms: Number(fields.bedrooms || 0),
  bathrooms: Number(fields.bathrooms || 0),
  area: fields.area,
  propertyType: fields.propertyType,
  yearBuilt: fields.yearBuilt,
  furnished: fields.furnished === "1",
  garden: fields.garden === "1",
  parking: fields.parking === "1",
  description: fields.description,
  amenities,
  images: uploadedImages,
  
  // ✅ ADD THESE
  ownerEmail: fields.ownerEmail || "guest",  
  paymentStatus: "pending",  // will change to "paid" after Stripe success
  published: false,          // become true after payment
  
  createdAt: new Date(),
};


      const r = await db.collection("properties").insertOne(doc);
      return res.status(201).json({ success: true, id: r.insertedId });
    } catch (dbErr) {
      // console.error(dbErr);
      return res.status(500).json({ success: false, message: "DB error" });
    }
  });
}
