import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { propertyId, propertyTitle, listingFee } = req.body;

  if (!propertyId) {
    return res.status(400).json({ error: "Property ID is required" });
  }

  const fee = listingFee || 5; // default to $5
  const isPremium = fee >= 15; // ✅ Premium if $15

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `${isPremium ? "⭐ Premium" : "Standard"} Listing: ${propertyTitle || "Property"}`,
              description: isPremium ? "Featured at top of listings" : "Regular listing"
            },
            unit_amount: fee * 100, // ✅ Use selected fee
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/add-property`,
      metadata: {
        propertyId,
        isPremium: isPremium.toString(), // ✅ Store premium status
        listingFee: fee.toString(),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    // console.error("Stripe checkout error:", error);
    return res.status(500).json({ error: error.message });
  }
}
