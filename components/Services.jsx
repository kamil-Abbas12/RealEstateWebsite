"use client";

import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Image,
  SimpleGrid,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import translations from "@/utils/translations";

export default function Services() {
  const router = useRouter();
  const locale = router?.locale || "en"; // detect locale or default to English
  const t = translations[locale] || translations.en;

  return (
    <Box
      w="100%"
      minH={{ base: "500px", md: "600px" }}
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="green.800"
      px={{ base: 4, md: 6 }}
      py={{ base: 10, md: 16 }}
    >
      <VStack spacing={6} textAlign="center" w="full" maxW="1200px">
        <Heading
          as="h2"
          fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
          color="white"
          fontWeight="700"
        >
          {t.heading}
        </Heading>

        <Text color="white" fontSize={{ base: "sm", md: "md" }} maxW="720px">
          {t.subtitle}
        </Text>

        {/* GRID FOR CARDS */}
        <SimpleGrid
          columns={{ base: 1, sm: 2, lg: 3 }}
          spacing={{ base: 8, md: 10 }}
          mt={8}
          justifyItems="center"
        >
          {t.cards.map((card, i) => (
            <Box
              key={i}
              w={{ base: "full", sm: "280px", md: "330px" }}
              bg="white"
              rounded="2xl"
              textAlign="center"
              p={8}
              transition="all 0.3s"
              _hover={{ transform: "translateY(-8px)", boxShadow: "lg" }}
            >
              <VStack spacing={6}>
                <Image
                  src={card.image}
                  alt={card.title}
                  boxSize="160px"
                  mx="auto"
                  objectFit="contain"
                />

                <Heading size="md" fontWeight="bold" color="gray.900">
                  {card.title}
                </Heading>

                <Text fontSize="sm" color="gray.700">
                  {card.text1}
                  <br />
                  {card.text2}
                </Text>

                <Button
                  as={Link}
                  href="/search"
                  variant="outline"
                  borderColor="green.800"
                  color="green.800"
                  _hover={{ bg: "green.800", color: "white" }}
                  borderRadius="lg"
                >
                  {card.button}
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
