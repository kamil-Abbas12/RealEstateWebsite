"use client";
import { useEffect, useState } from "react";
import Property from "@/components/Property.jsx";
import { Box, Heading, SimpleGrid, Spinner, Text, Badge } from "@chakra-ui/react";
import Link from "next/link";

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/property/get")
      .then((res) => res.json())
      .then((data) => {
        // ✅ Sort: Premium first, then by date
        const sorted = (data || []).sort((a, b) => {
          if (a.isPremium && !b.isPremium) return -1;
          if (!a.isPremium && b.isPremium) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setProperties(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const buyProps = properties.filter((p) => p.listingType === "sale");
  const rentProps = properties.filter((p) => p.listingType === "rent");

  const renderGrid = (props) => (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
      {props.map((p) => (
        <Link key={p._id} href={`/property/${p._id}`}>
          <Box position="relative">
            {p.isPremium && (
              <Badge
                position="absolute"
                top={2}
                right={2}
                colorScheme="yellow"
                zIndex={10}
                fontSize="sm"
              >
                ⭐ PREMIUM
              </Badge>
            )}
            <Property property={p} />
          </Box>
        </Link>
      ))}
    </SimpleGrid>
  );

  return (
    <Box p={6}>
      <Heading mb={4}>Buy Properties</Heading>
      {loading ? (
        <Spinner />
      ) : buyProps.length === 0 ? (
        <Text>No properties for sale</Text>
      ) : (
        renderGrid(buyProps)
      )}

      <Heading mt={12} mb={4}>Rent Properties</Heading>
      {loading ? (
        <Spinner />
      ) : rentProps.length === 0 ? (
        <Text>No properties for rent</Text>
      ) : (
        renderGrid(rentProps)
      )}
    </Box>
  );
}
