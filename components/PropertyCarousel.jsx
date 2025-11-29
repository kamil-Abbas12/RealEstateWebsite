// components/PropertyCarousel.jsx
"use client";

import { Box, Flex, Heading, IconButton, Text } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import Image from "next/image";
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

  const toggleLike = (id) => setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

 const settings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  swipeToSlide: true,
  adaptiveHeight: true,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 768, settings: { slidesToShow: 2 } },
    { breakpoint: 640, settings: { slidesToShow: 1 } }, // <-- 1 slide on mobile
  ],
};


  return (
    <Box position="relative" w="100%" py={10} px={{ base: 4, md: 10 }}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading color="white" fontSize={{ base: "xl", md: "2xl" }}>
          {t("carousel.title")}
        </Heading>
        <Flex gap={2}>
          <IconButton
            aria-label="Previous"
            icon={<FaChevronLeft />}
            onClick={() => sliderRef.current?.slickPrev()}
            variant="outline"
            size={{ base: "sm", md: "md" }}
          />
          <IconButton
            aria-label="Next"
            icon={<FaChevronRight />}
            onClick={() => sliderRef.current?.slickNext()}
            variant="outline"
            size={{ base: "sm", md: "md" }}
          />
        </Flex>
      </Flex>

      <Box className="property-carousel-container">
        <Slider ref={sliderRef} {...settings}>
          {properties.map((p) => (
            <Box key={p._id} className="property-slide" px={2}>
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
              >
                {/* wrapper with fixed height so next/image fill works predictably */}
                <Box position="relative" width="100%" height={{ base: "220px", md: "250px" }}>
                  <Image
                    src={p.coverPhoto || "/placeholder.jpg"}
                    alt={String(p.price)}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width:1024px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                    priority={false}
                  />
                </Box>

                <Box position="absolute" top="3" right="3" zIndex="2">
                  <IconButton
                    aria-label="Like"
                    icon={liked[p._id] ? <FaHeart color="red" /> : <FaRegHeart color="white" />}
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

      <style jsx global>{`
    /* slick carousel container */
.property-carousel-container .slick-list {
  overflow: hidden;
}

/* track must be flex always */
.property-carousel-container .slick-track {
  display: flex !important;
  align-items: stretch;
}

/* slides fill width properly */
.property-carousel-container .slick-slide {
  display: flex !important;
  justify-content: center;
  align-items: stretch;
  height: auto !important;
  box-sizing: border-box;
  padding: 0 !important;
}

/* slide content fills parent */
.property-carousel-container .slick-slide > div {
  width: 100% !important;
  max-width: 100% !important;
  display: flex;
  flex-direction: column;
}

/* override padding on slide wrapper */
.property-slide {
  width: 100% !important;
  max-width: 100% !important;
  padding: 0 !important;
}

/* mobile override */
@media (max-width: 640px) {
  .property-slide,
  .property-carousel-container .slick-slide > div {
    width: 100% !important;
    max-width: 100% !important;
  }
}

      `}</style>
    </Box>
  );
}
