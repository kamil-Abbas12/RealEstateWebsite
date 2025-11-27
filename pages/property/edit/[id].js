"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import PropertyFormStepper from "../../../components/PropertyFormStepper";
import { Spinner, Box, Text } from "@chakra-ui/react";

export default function EditPropertyPage() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    if (!id) return;
    async function fetchProperty() {
      try {
        const res = await axios.get(`/api/properties/${id}`);
        if (res.data?.success) {
          setProperty(res.data.property);
        }
      } catch (err) {
        // console.error("Failed to load property:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
        <Text mt={3}>Loading property...</Text>
      </Box>
    );
  }

  if (!property) {
    return (
      <Box textAlign="center" mt={10}>
        <Text>No property found.</Text>
      </Box>
    );
  }

  return <PropertyFormStepper propertyId={id} property={property} />;
}
