import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const client = await clientPromise;
    const db = client.db("realestate");

    // 🔍 Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    
    if (existingUser) {
      // ✅ If user exists via Google but no password, allow them to add password
      if (existingUser.provider === "google" && !existingUser.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.collection("users").updateOne(
          { email },
          { 
            $set: { 
              password: hashedPassword,
              name: name, // update name if provided
              provider: "both" // now supports both login methods
            } 
          }
        );
        
        return res.status(200).json({ message: "Password added successfully. You can now login with email/password." });
      }
      
      // ❌ User exists with credentials already
      return res.status(400).json({ error: "User already exists. Please login instead." });
    }

    // 🔐 Hash password for new user
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 Save new user
    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      provider: "credentials",
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    // console.error("Signup error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
