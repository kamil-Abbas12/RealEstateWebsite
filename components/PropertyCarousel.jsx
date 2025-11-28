"use client";

import { Box, Flex, Heading, IconButton, Image, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Slider from "react-slick";
import { FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/router";
import translations from "@/utils/translations";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function PropertyCarousel() {
  const router = useRouter();
  const locale = router?.locale || "en";

  const t = (path) => {
    const parts = path.split(".");
    let cur = translations[locale] || translations.en;
    for (const p of parts) {
      cur = cur?.[p];
      if (cur == null) return path;
    }
    return cur;
  };

  const [liked, setLiked] = useState({});
  const [properties, setProperties] = useState([]);

  const toggleLike = (id) =>
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  // Load premium listings from API
  useEffect(() => {
    async function fetchPremium() {
      try {
        const res = await fetch("/api/premium-properties");
        const data = await res.json();
        if (data.success) setProperties(data.data);
      } catch (err) {
        console.error("Failed to load premium properties", err);
      }
    }

    fetchPremium();
  }, []);

  let sliderRef;

  // FIXED SETTINGS - More aggressive mobile breakpoints
  const settings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 768, settings: { slidesToShow: 2 } },
    { breakpoint: 640, settings: { slidesToShow: 1 } },
  ],
};

  return (
    <Box position="relative" w="100%" py={10} px={{ base: 4, md: 10 }}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading color="white" fontSize={{ base: "xl", md: "2xl" }}>
          {t("carousel.title")}
        </Heading>

        <Flex gap={2}>
          <IconButton
            aria-label="Previous"
            icon={<FaChevronLeft />}
            onClick={() => sliderRef?.slickPrev()}
            colorScheme="whiteAlpha"
            variant="outline"
            size={{ base: "sm", md: "md" }}
          />
          <IconButton
            aria-label="Next"
            icon={<FaChevronRight />}
            onClick={() => sliderRef?.slickNext()}
            colorScheme="whiteAlpha"
            variant="outline"
            size={{ base: "sm", md: "md" }}
          />
        </Flex>
      </Flex>

      {/* Carousel */}
      <Box className="property-carousel-container">
        <Slider ref={(c) => (sliderRef = c)} {...settings}>
          {properties.map((p) => (
            <Box key={p._id} px={{ base: 2, md: 3 }}>
              <Box
                position="relative"
                borderRadius="2xl"
                overflow="hidden"
                bg="white"
                color="gray.800"
                h="370px"
                _hover={{ transform: "scale(1.02)" }}
                transition="all 0.3s ease"
                cursor="pointer"
                onClick={() => router.push(`/property/${p._id}`)}
                // IMPORTANT: Force minimum width on mobile
                minW={{ base: "280px", md: "auto" }}
                maxW={{ base: "320px", md: "auto" }}
                mx="auto"
              >
                {/* Image */}
                <Image
                  src={p.coverPhoto || "/placeholder.jpg"}
                  alt={p.price}
                  w="100%"
                  h="250px"
                  objectFit="cover"
                />

                {/* Heart icon */}
                <Box position="absolute" top="3" right="3" zIndex="2">
                  <IconButton
                    aria-label="Like"
                    icon={
                      liked[p._id] ? (
                        <FaHeart color="red" />
                      ) : (
                        <FaRegHeart color="white" />
                      )
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(p._id);
                    }}
                    bg="rgba(0,0,0,0.4)"
                    _hover={{ bg: "rgba(0,0,0,0.6)" }}
                    borderRadius="full"
                    size="sm"
                  />
                </Box>

                {/* Info */}
                <Box p={4}>
                  <Text color="goldenrod" fontWeight="bold" fontSize="lg">
                    ${p.price?.toLocaleString()}
                  </Text>

                  <Text color="gray.900" fontSize="sm">
                    {p.area || p.size || "—"} sq ft
                  </Text>

                  <Text color="gray.700" fontSize="xs" noOfLines={1}>
                    {p.location || ""}
                  </Text>
                </Box>
              </Box>
            </Box>
          ))}
        </Slider>
      </Box>

      {/* Add custom CSS for mobile fix */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .property-carousel-container .slick-track {
            display: flex !important;
          }
          
          .property-carousel-container .slick-slide {
            height: inherit !important;
            display: flex !important;
            justify-content: center !important;
          }
          
          .property-carousel-container .slick-slide > div {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </Box>
  );
}