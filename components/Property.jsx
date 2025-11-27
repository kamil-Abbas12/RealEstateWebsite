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
  _id,
  title,
  price,
  currency,
  bedrooms,
  bathrooms,
  images,
  address,
  listingType,
} = property || {};


  // image fallback logic
const raw = images?.[0] || DefaultImage;
  // UNIVERSAL IMAGE HANDLER (Zillow + Zoopla + Local)
const imageSrc =
  // Local DB structure
  property?.image ||

  // Local uploaded images array: ["url1", "url2"]
  (Array.isArray(images) && typeof images[0] === "string" && images[0]) ||

  // Local uploaded Next/Image file import (object)
  (Array.isArray(images) && typeof images[0] === "object" && (images[0].url || images[0].src)) ||

  // Zoopla typical structure
  property?.image_url ||
  property?.thumbnail_url ||

  // Zillow structure
  property?.raw?.imgSrc ||

  // Final fallback
  DefaultImage;


  const origCurrency = (currency || "Usd").toUpperCase();

  let displayUSD = null;
  if (typeof price === "number") {
    displayUSD = origCurrency === "GBP" ? Math.round(price * GBP_TO_USD) : price;
  }

  const displayPrice = displayUSD
  ? `$${millify(displayUSD)}`
  : price
  ? `${price} ${origCurrency}`
  : "N/A";

const originalPriceStr = price
  ? `${price} ${origCurrency}`
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
  <BsGridFill /> <Text>{listingType?.toUpperCase() ?? "—"}</Text>
</Flex>

        </Flex>

        <Text mt="2" fontSize="md" color="gray.700" noOfLines={2}>
{address || title}
        </Text>
      </Box>
    </Box>
  );
}
