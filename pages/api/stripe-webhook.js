import { buffer } from "micro";
import Stripe from "stripe";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error("⚠️  Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { propertyId, isPremium } = session.metadata;

    if (propertyId) {
      const client = await clientPromise;
      const db = client.db("realestate");

      // ✅ Update property status to active and set premium flag
      await db.collection("properties").updateOne(
        { _id: new ObjectId(propertyId) },
        {
          $set: {
            status: "active",
            isPremium: isPremium === "true", // ✅ Set premium status
            paidAt: new Date(),
          },
        }
      );

      // console.log(`✅ Property ${propertyId} activated. Premium: ${isPremium}`);
    }
  }

  res.json({ received: true });
}
