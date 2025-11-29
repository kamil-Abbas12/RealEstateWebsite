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
  const sliderRef = useRef(null);

  const toggleLike = (id) =>
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

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
    dots: true,
    infinite: properties.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    swipeToSlide: true,
    touchThreshold: 10,
    cssEase: "ease-in-out",
    responsive: [
      { 
        breakpoint: 9999, // Desktop
        settings: { 
          slidesToShow: 4,
          slidesToScroll: 1,
          dots: false
        } 
      },
      { 
        breakpoint: 1280, 
        settings: { 
          slidesToShow: 3,
          slidesToScroll: 1,
          dots: false
        } 
      },
      { 
        breakpoint: 768, 
        settings: { 
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true
        } 
      },
      { 
        breakpoint: 640, 
        settings: { 
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          centerMode: false
        } 
      },
    ],
  };

  return (
    <Box position="relative" w="100%" py={10} px={{ base: 0, md: 10 }}>
      {/* Header */}
      <Flex 
        justify="space-between" 
        align="center" 
        mb={6} 
        px={{ base: 4, md: 0 }}
      >
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
            display={{ base: "flex", md: "flex" }}
          />
          <IconButton
            aria-label="Next"
            icon={<FaChevronRight />}
            onClick={() => sliderRef.current?.slickNext()}
            colorScheme="whiteAlpha"
            variant="outline"
            size={{ base: "sm", md: "md" }}
            display={{ base: "flex", md: "flex" }}
          />
        </Flex>
      </Flex>

      {/* Carousel */}
      <Box 
        className="property-carousel-wrapper"
        px={{ base: 4, md: 0 }}
      >
        <Slider ref={sliderRef} {...settings}>
          {properties.map((p) => (
            <Box key={p._id} px={{ base: 0, md: 2 }}>
              <Box
                position="relative"
                borderRadius="2xl"
                overflow="hidden"
                bg="white"
                color="gray.800"
                cursor="pointer"
                _hover={{ transform: "scale(1.02)" }}
                transition="all 0.3s ease"
                onClick={() => router.push(`/property/${p._id}`)}
                mx={{ base: 0, md: "auto" }}
                maxW={{ base: "100%", md: "350px" }}
              >
                <Image
                  src={p.coverPhoto || "/placeholder.jpg"}
                  alt={p.price}
                  w="100%"
                  h={{ base: "280px", md: "250px" }}
                  objectFit="cover"
                />

                <Box position="absolute" top="3" right="3" zIndex="2">
                  <IconButton
                    aria-label="Like"
                    icon={
                      liked[p._id] ? <FaHeart color="red" /> : <FaRegHeart color="white" />
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

                <Box p={4}>
                  <Text color="goldenrod" fontWeight="bold" fontSize="lg">
                    ${p.price?.toLocaleString()}
                  </Text>
                  <Text color="gray.900" fontSize="sm" mt={1}>
                    {p.area || p.size || "—"} sq ft
                  </Text>
                  <Text color="gray.700" fontSize="xs" noOfLines={1} mt={1}>
                    {p.location || ""}
                  </Text>
                </Box>
              </Box>
            </Box>
          ))}
        </Slider>
      </Box>

      {/* Scoped styles */}
      <style jsx global>{`
        /* Reset any conflicting styles */
        .property-carousel-wrapper {
          width: 100%;
          overflow: hidden;
        }

        .property-carousel-wrapper .slick-slider {
          position: relative;
          display: block;
          box-sizing: border-box;
          user-select: none;
          touch-action: pan-y;
          -webkit-tap-highlight-color: transparent;
        }

        .property-carousel-wrapper .slick-list {
          position: relative;
          display: block;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }

        .property-carousel-wrapper .slick-track {
          position: relative;
          top: 0;
          left: 0;
          display: flex;
          margin-left: auto;
          margin-right: auto;
        }

        .property-carousel-wrapper .slick-slide {
          float: left;
          height: 100%;
          min-height: 1px;
          display: block;
        }

        .property-carousel-wrapper .slick-slide > div {
          height: 100%;
        }

        /* Mobile specific - ONE property only */
        @media (max-width: 640px) {
          .property-carousel-wrapper .slick-track {
            display: flex !important;
          }

          .property-carousel-wrapper .slick-slide {
            width: 100vw !important;
            max-width: calc(100vw - 32px);
            margin: 0;
          }

          .property-carousel-wrapper .slick-list {
            overflow: visible;
          }
        }

        /* Tablet - TWO properties */
        @media (min-width: 641px) and (max-width: 768px) {
          .property-carousel-wrapper .slick-slide {
            width: 50% !important;
          }
        }

        /* Desktop - FOUR properties */
        @media (min-width: 769px) {
          .property-carousel-wrapper .slick-slide {
            width: 25% !important;
          }
        }

        /* Dots styling */
        .property-carousel-wrapper .slick-dots {
          position: relative;
          bottom: 0;
          display: flex !important;
          justify-content: center;
          margin-top: 20px;
          padding: 0;
          list-style: none;
        }

        .property-carousel-wrapper .slick-dots li {
          position: relative;
          display: inline-block;
          margin: 0 5px;
          padding: 0;
          cursor: pointer;
        }

        .property-carousel-wrapper .slick-dots li button {
          font-size: 0;
          line-height: 0;
          display: block;
          width: 8px;
          height: 8px;
          padding: 0;
          cursor: pointer;
          color: transparent;
          border: 0;
          outline: none;
          background: white;
          border-radius: 50%;
          opacity: 0.5;
        }

        .property-carousel-wrapper .slick-dots li.slick-active button {
          background: goldenrod;
          opacity: 1;
        }

        .property-carousel-wrapper .slick-dots li button:before {
          display: none;
        }

        /* Hide dots on desktop */
        @media (min-width: 769px) {
          .property-carousel-wrapper .slick-dots {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
}
