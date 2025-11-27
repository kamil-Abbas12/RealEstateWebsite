// pages/dashboard.js
import clientPromise from "../lib/mongodb";
import { getSession } from "next-auth/react";
import { Box, Heading, SimpleGrid, Image, Text, Badge, Button, HStack } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Dashboard({ properties }) {
  const router = useRouter();

  useEffect(() => {
    const { session_id } = router.query;
    if (session_id) {
      fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session_id }),
      })
        .then(res => res.json())
        .then(data => {
          // console.log("Payment verification result:", data);
          if (data.success) {
            router.replace("/dashboard"); // reload dashboard to show updated status
          }
        });
    }
  }, [router.query]);

  // create checkout session and redirect to stripe
  async function handlePay(propertyId, title, fee) {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          propertyTitle: title,
          listingFee: fee,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // console.error("No checkout url", data);
        alert("Failed to start checkout");
      }
    } catch (err) {
      // console.error("Checkout error:", err);
      alert("Checkout failed");
    }
  }

  return (
    <Box p={8} maxW="1100px" mx="auto">
      <Heading mb={4}>My Properties</Heading>
      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {properties.map(p => (
          <Box key={p._id} borderWidth="1px" borderRadius="md" overflow="hidden" p={3}>
            {p.images && p.images[0] && (
              <Image src={p.images[0]} alt={p.title} h="160px" w="100%" objectFit="cover" />
            )}
            <Heading size="sm" mt={2}>{p.title}</Heading>
            <Text mt={1}>{p.price} {p.currency}</Text>
            <Badge mt={2} colorScheme={p.status === "active" ? "green" : "yellow"}>
              {p.status}
            </Badge>

            <Box mt={2}>
              <Link href={`/property/edit/${p._id}`}>
                <Button size="sm" mr={2}>Edit</Button>
              </Link>
              <Link href={`/property/${p._id}`}>
                <Button size="sm" variant="outline">Preview</Button>
              </Link>
              <Link href={`/property/delete/${p._id}`}>
                <Button size="sm"  ml={2}>Delete</Button>
              </Link>
            </Box>

            {/* PAYMENT ACTIONS: show only for pending/non-active properties */}
            {p.status !== "active" && (
              <Box mt={3}>
                <Text fontSize="sm" mb={2}>Complete listing payment:</Text>
                <HStack spacing={2}>
                  <Button size="sm" colorScheme="teal" onClick={() => handlePay(p._id, p.title, 5)}>
                    Pay $5 (Standard)
                  </Button>
                  <Button size="sm" colorScheme="yellow" onClick={() => handlePay(p._id, p.title, 15)}>
                    Pay $15 (Premium)
                  </Button>
                </HStack>
              </Box>
            )}
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  // console.log("Session email:", session.user.email); // ✅ Server-side logging

  const client = await clientPromise;
  const db = client.db("realestate");

  const properties = await db
    .collection("properties")
    .find({ userId: session.user.email })
    .toArray();
  // console.log("Properties found:", properties.length); // ✅ Server-side logging

  const safeProperties = properties.map((p) => ({
    _id: p._id.toString(),
    title: p.title,
    price: p.price,
    currency: p.currency,
    images: p.images || [],
    status: p.status,
    listingType: p.listingType || "sale",
    isPremium: !!p.isPremium,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
  }));

  return { props: { properties: safeProperties } };
}
