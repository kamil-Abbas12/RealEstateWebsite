import React, { useEffect } from "react";
import { Container, Box, Heading, Text, Spinner, Center } from "@chakra-ui/react";
import PropertyForm from "./PropertyForm";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";

export default function AddPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    async function protectRoute() {
      const session = await getSession();
      if (!session?.user) {
        router.push("/login"); // redirect if not logged in
      } else {
        setLoading(false);
      }
    }
    protectRoute();
  }, []);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box bg="green.800" minH="100vh" py={10}>
      <Container maxW="container.lg">
        <Box p={8} borderRadius="xl" bg="white" boxShadow="xl">
          <Heading size="lg" mb={2} color="green.700">
            Add Property
          </Heading>
          <Text mb={6} color="gray.600">
            Professional listing form — worldwide address autocomplete, images, and full details.
          </Text>

          <PropertyForm />
        </Box>
      </Container>
    </Box>
  );
}
