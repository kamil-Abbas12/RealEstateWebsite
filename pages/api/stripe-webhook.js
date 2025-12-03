import { buffer } from "micro";
import Stripe from "stripe";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const config = {
api: {
bodyParser: false, // Stripe requires raw body
},
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Method not allowed" });
}

let event;

try {
const buf = await buffer(req);
const sig = req.headers["stripe-signature"];

```
event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
```

} catch (error) {
console.error("❌ Webhook signature verification FAILED:", error);
return res.status(400).send(`Webhook Error: ${error.message}`);
}

// 🎉 PAYMENT SUCCESS (main event)
if (event.type === "checkout.session.completed") {
const session = event.data.object;

```
const propertyId = session.metadata?.propertyId;
const isPremium = session.metadata?.isPremium;

console.log("🏡 Payment received for property:", propertyId);

if (propertyId) {
  const client = await clientPromise;
  const db = client.db("realestate");

  await db.collection("properties").updateOne(
    { _id: new ObjectId(propertyId) },
    {
      $set: {
        status: "active",
        isPremium: isPremium === "true",
        paidAt: new Date(),
      },
    }
  );

  console.log("✅ Property updated after payment.");
}
```

}

// 🎯 Stripe requires this response
res.json({ received: true });
}
