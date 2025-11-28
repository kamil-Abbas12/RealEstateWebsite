"use client";

import { Box, Flex, Heading, IconButton, Image, Text } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
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
  const sliderRef = useRef(null); // stable ref

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

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    adaptiveHeight: true,
    variableWidth: false,     // important: do not use variable widths
    centerMode: false,
    centerPadding: "0px",
    swipeToSlide: true,
    cssEase: "ease",
    initialSlide: 0,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      {
        // Mobile: force one slide per view and let each slide be full width
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
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
            onClick={() => sliderRef.current?.slickPrev()}
            colorScheme="whiteAlpha"
            variant="outline"
            size={{ base: "sm", md: "md" }}
          />
          <IconButton
            aria-label="Next"
            icon={<FaChevronRight />}
            onClick={() => sliderRef.current?.slickNext()}
            colorScheme="whiteAlpha"
            variant="outline"
            size={{ base: "sm", md: "md" }}
          />
        </Flex>
      </Flex>

      {/* Carousel */}
      <Box className="property-carousel-container">
        <Slider ref={sliderRef} {...settings}>
          {properties.map((p) => (
            <Box
              key={p._id}
              // wrapper around slide: ensure full width on mobile, fixed-ish max on larger screens
              className="property-slide"
              px={{ base: 2, md: 3 }}
              // use Chakra style props for spacing, but width controlled in CSS below
            >
              <Box
                position="relative"
                borderRadius="2xl"
                overflow="hidden"
                bg="white"
                color="gray.800"
                // let height adapt for mobile (adaptiveHeight true)
                h={{ base: "auto", md: "370px" }}
                _hover={{ transform: "scale(1.02)" }}
                transition="all 0.3s ease"
                cursor="pointer"
                onClick={() => router.push(`/property/${p._id}`)}
                // remove minW/maxW inline style — handled by CSS to avoid react-slick inline width conflicts
                mx="auto"
              >
                {/* Image */}
                <Image
                  src={p.coverPhoto || "/placeholder.jpg"}
                  alt={p.price}
                  w="100%"
                  h={{ base: "220px", md: "250px" }}
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

      {/* CSS fixes */}
      <style jsx global>{`
        /* ensure slider's list doesn't add extra paddings or show partial slides on mobile */
        .property-carousel-container .slick-list {
          padding: 0;
          margin: 0;
          overflow: hidden;
        }

        .property-carousel-container .slick-track {
          display: flex !important;
          align-items: stretch;
        }

        .property-carousel-container .slick-slide {
          display: flex !important;
          justify-content: center !important;
          align-items: stretch;
          height: auto !important;
        }

        /* wrapper inside the slide (the Box with class property-slide) */
        .property-slide {
          width: 100% !important; /* take full width on small screens */
          max-width: 360px; /* on larger screens cards won't explode */
        }

        /* larger screens: allow multiple cards to appear, up to max-width */
        @media (min-width: 768px) {
          .property-slide {
            width: 100% !important;
            max-width: 320px;
          }
        }

        /* override slick inline widths that sometimes cause peeking */
        .property-carousel-container .slick-slide > div {
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
        }
      `}</style>
    </Box>
  );
}
