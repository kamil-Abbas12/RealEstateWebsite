"use client";

import { useRouter } from "next/router";
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { useState } from "react";

export default function DeleteProperty() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await fetch(`/api/property/delete?id=${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    // console.log(data);

    if (data.success) {
      router.push("/dashboard"); // redirect after delete
    }

    setLoading(false);
  };

  return (
    <Box maxW="600px" mx="auto" mt={10} p={5} borderWidth="1px" borderRadius="md">
      <Heading size="md">Delete Property</Heading>
      <Text mt={3}>
        Are you sure you want to delete this property? This action cannot be undone.
      </Text>

      <Button
        colorScheme="red"
        mt={5}
        onClick={handleDelete}
        isLoading={loading}
      >
        Yes, Delete
      </Button>

      <Button mt={5} ml={3} onClick={() => router.push("/dashboard")}>
        Cancel
      </Button>
    </Box>
  );
}
