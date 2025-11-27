// pages/api/verify-payment.js
import Stripe from "stripe";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Method not allowed" });

  const { sessionId } = req.body;

  if (!sessionId)
    return res.status(400).json({ success: false, message: "Missing sessionId" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session)
      return res.status(404).json({ success: false, message: "Session not found" });

    // Require successful payment
    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

    const propertyId = session.metadata?.propertyId;
    const isPremium = session.metadata?.isPremium === "true";

    if (!propertyId) {
      return res
        .status(400)
        .json({ success: false, message: "No propertyId in session metadata" });
    }

    // Update DB
    const client = await clientPromise;
    const db = client.db("realestate");

    await db.collection("properties").updateOne(
      { _id: new ObjectId(propertyId) },
      {
        $set: {
          status: "active",
          isPremium,
          paidAt: new Date(),
          stripeSessionId: session.id,
        },
      }
    );

    return res.status(200).json({ success: true, propertyId, isPremium });
  } catch (err) {
    // console.error("verify-payment error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
