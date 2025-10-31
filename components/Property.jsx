"use client";
import Image from "next/image";
import { Box, Flex, Text } from "@chakra-ui/react";
import { FaBed, FaBath } from "react-icons/fa";
import { BsGridFill } from "react-icons/bs";
import { GoVerified } from "react-icons/go";
import millify from "millify";
import DefaultImage from "../assets/images/house.jpg";

const GBP_TO_USD = 1.25; // fixed conversion rate for GBP

export default function Property({ property }) {
  const {
    id,
    listing_id,
    title,
    price,
    priceLabel,
    currency,
    bedrooms,
    bathrooms,
    image,
    location,
    propertyType,
  } = property || {};

  // image fallback logic
  const imageUrlRaw = image || DefaultImage;
  const imageSrc =
    typeof imageUrlRaw === "string"
      ? imageUrlRaw
      : imageUrlRaw?.src || imageUrlRaw?.default || DefaultImage;

  const origCurrency = (currency || "GBP").toUpperCase();

  let displayUSD = null;
  if (typeof price === "number") {
    displayUSD = origCurrency === "GBP" ? Math.round(price * GBP_TO_USD) : price;
  }

  const displayPrice = displayUSD
    ? `$${millify(displayUSD)}`
    : priceLabel || "N/A";
  const originalPriceStr = priceLabel
    ? `${priceLabel} ${origCurrency}`
    : null;

  return (
    <Box
      textDecoration="none"
      display="block"
      w={{ base: "100%", sm: "300px", md: "350px" }}
      p="4"
      bg="white"
      color="black"
      borderRadius="lg"
      boxShadow="md"
      _hover={{ transform: "scale(1.02)", transition: "0.2s" }}
      cursor="default"
    >
      <Box
        position="relative"
        width="100%"
        height={{ base: "200px", md: "220px" }}
        borderRadius="md"
        overflow="hidden"
      >
        <Image
          src={imageSrc}
          alt={title || location || "property image"}
          fill
          style={{ objectFit: "cover" }}
          unoptimized
        />
      </Box>

      <Box mt="3">
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontWeight="bold" fontSize="lg" color="green.600">
            {displayPrice}
          </Text>
          <Box as={GoVerified} color="green.500" />
        </Flex>

        {originalPriceStr && (
          <Text fontSize="sm" color="gray.500">
            {originalPriceStr}
          </Text>
        )}

        <Flex alignItems="center" mt="2" color="goldenrod" gap="4" flexWrap="wrap">
          <Flex alignItems="center" gap="1">
            <FaBed /> <Text>{bedrooms ?? "—"}</Text>
          </Flex>
          <Flex alignItems="center" gap="1">
            <FaBath /> <Text>{bathrooms ?? "—"}</Text>
          </Flex>
          <Flex alignItems="center" gap="1">
            <BsGridFill /> <Text>{propertyType ?? "—"}</Text>
          </Flex>
        </Flex>

        <Text mt="2" fontSize="md" color="gray.700" noOfLines={2}>
          {location || title}
        </Text>
      </Box>
    </Box>
  );
}
