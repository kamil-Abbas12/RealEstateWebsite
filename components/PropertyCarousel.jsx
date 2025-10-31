"use client";

import { Box, Flex, Heading, IconButton, Image, Text } from "@chakra-ui/react";
import { useState } from "react";
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
  const toggleLike = (id) => setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  const properties = [
    { id: 1, img: "/property1.jpg", price: "$1,200,000", area: "2200 sq ft" },
    { id: 2, img: "/property2.jpg", price: "$1,500,000", area: "1800 sq ft" },
    { id: 3, img: "/property3.jpg", price: "$1,350,000", area: "2400 sq ft" },
    { id: 4, img: "/property4.jpg", price: "$780,000", area: "1600 sq ft" },
    { id: 5, img: "/property5.jpg", price: "$1,050,000", area: "2000 sq ft" },
  ];

  let sliderRef;

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Box position="relative" w="100%" py={10} px={{ base: 4, md: 10 }}>
      {/* Header Section */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading color="white" fontSize={{ base: "xl", md: "2xl" }}>
          {t("carousel.title")}
        </Heading>

        <Flex gap={2}>
          <IconButton
            aria-label="Previous"
            icon={<FaChevronLeft />}
            onClick={() => sliderRef.slickPrev()}
            colorScheme="whiteAlpha"
            variant="outline"
            _hover={{ bg: "whiteAlpha.300" }}
          />
          <IconButton
            aria-label="Next"
            icon={<FaChevronRight />}
            onClick={() => sliderRef.slickNext()}
            colorScheme="whiteAlpha"
            variant="outline"
            _hover={{ bg: "whiteAlpha.300" }}
          />
        </Flex>
      </Flex>

      {/* Carousel */}
      <Slider ref={(c) => (sliderRef = c)} {...settings}>
        {properties.map((p) => (
          <Box key={p.id} px={3}>
            <Box
              position="relative"
              borderRadius="2xl"
              overflow="hidden"
              bg="white"
              color={"gray.800"}
              _hover={{ transform: "scale(1.02)" }}
              transition="all 0.3s ease"
            >
              <Image src={p.img} alt={p.price} w="100%" h="250px" objectFit="cover" />
              {/* Heart Icon */}
              <Box position="absolute" top="3" right="3" zIndex="2">
                <IconButton
                  aria-label="Like"
                  icon={liked[p.id] ? <FaHeart color="red" /> : <FaRegHeart color="white" />}
                  onClick={() => toggleLike(p.id)}
                  bg="rgba(0,0,0,0.4)"
                  _hover={{ bg: "rgba(0,0,0,0.6)" }}
                  borderRadius="full"
                  size="sm"
                />
              </Box>

              {/* Info */}
              <Box p={4}>
                <Text color="goldenrod" fontWeight="bold" fontSize="lg">
                  {p.price}
                </Text>
                <Text color="gray.900" fontSize="sm">
                  {p.area}
                </Text>
              </Box>
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
}
