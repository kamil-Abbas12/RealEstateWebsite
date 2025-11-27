// pages/properties/preview/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Button, Heading, Text, Grid, Image, VStack, HStack, Badge, Spinner
} from "@chakra-ui/react";

export default function PropertyPreview() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProp = async () => {
      try {
        const res = await axios.get(`/api/properties/${id}`);
        if (res.data?.success) setProperty(res.data.property);
      } catch (err) {
        console.error("fetch property error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProp();
  }, [id]);

  async function handleProceedToPay() {
    if (!property) return;
    setProcessing(true);
    try {
      const res = await axios.post("/api/create-checkout-session", {
        propertyId: property._id,
        propertyTitle: property.title,
        listingFee: 5,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert("Payment session could not be created");
      }
    } catch (err) {
      console.error("checkout error:", err);
      alert(err?.response?.data?.error || err.message || "Checkout error");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <Box p={8}><Spinner /></Box>;
  if (!property) return <Box p={8}><Text>Property not found.</Text></Box>;

  return (
    <Box p={8} maxW="900px" mx="auto">
      <Heading>{property.title}</Heading>
      <Text mt={2}><strong>Price:</strong> {property.price} {property.currency}</Text>
      <Text mt={1}><strong>Address:</strong> {property.address}</Text>
      <HStack mt={2} spacing={2}>
        <Badge colorScheme={property.status === "active" ? "green" : "yellow"}>
          {property.status}
        </Badge>
      </HStack>

      {property.images && property.images.length > 0 && (
        <Grid templateColumns="repeat(auto-fill, minmax(160px, 1fr))" gap={3} mt={4}>
          {property.images.map((url, i) => (
            <Image key={i} src={url} alt={`img-${i}`} objectFit="cover" h="140px" w="100%" borderRadius="md" />
          ))}
        </Grid>
      )}

      <VStack align="stretch" mt={6}>
        <Text>{property.description}</Text>

        {property.status === "active" ? (
          <Button colorScheme="teal" onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        ) : (
          <Button colorScheme="teal" isLoading={processing} onClick={handleProceedToPay}>Proceed to Pay ${5}</Button>
        )}
      </VStack>
    </Box>
  );
}
