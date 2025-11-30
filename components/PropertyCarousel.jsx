"use client";

import { Box, Flex, Heading, IconButton, Image, Text } from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart } from "react-icons/fa";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import translations from "@/utils/translations";

export default function PropertyCarousel() {
  const router = useRouter();
  const locale = router?.locale || "en";

  const t = (path) => {
    const keys = path.split(".");
    let obj = translations[locale] || translations.en;
    for (let k of keys) obj = obj?.[k];
    return obj || path;
  };

  const [properties, setProperties] = useState([]);
  const [liked, setLiked] = useState({});
  const scrollRef = useRef(null);

  useEffect(() => {
    async function getData() {
      try {
        const res = await fetch("/api/premium-properties");
        const data = await res.json();
        if (data.success) setProperties(data.data);
      } catch (err) {
        console.error(err);
      }
    }
    getData();
  }, []);

  const scrollByCard = (direction = 1) => {
    const container = scrollRef.current;
    if (!container) return;
    const firstCard = container.querySelector("[data-carousel-card]");
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const gap = Number(getComputedStyle(container).gap?.replace("px", "")) || 16;
    container.scrollBy({ left: (cardWidth + gap) * direction, behavior: "smooth" });
  };

  return (
    <Box w="100%" py={10} px={{ base: 2, md: 10 }}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading color="white" fontSize={{ base: "xl", md: "2xl" }}>
          {t("carousel.title")}
        </Heading>
        <Flex gap={2}>
          <IconButton
            aria-label="Left"
            icon={<FaChevronLeft />}
            onClick={() => scrollByCard(-1)}
            colorScheme="whiteAlpha"
            variant="outline"
            size={{ base: "sm", md: "md" }}
          />
          <IconButton
            aria-label="Right"
            icon={<FaChevronRight />}
            onClick={() => scrollByCard(1)}
            colorScheme="whiteAlpha"
            variant="outline"
            size={{ base: "sm", md: "md" }}
          />
        </Flex>
      </Flex>

      {/* Carousel */}
      <Flex
        ref={scrollRef}
        overflowX="auto"
        wrap="nowrap"
        gap={{ base: 4, md: 5 }}
        scrollSnapType="x mandatory"
        sx={{
          "&::-webkit-scrollbar": { display: "none" },
          scrollBehavior: "smooth",
        }}
      >
        {properties.map((p) => (
          <Box
            key={p._id}
            data-carousel-card
            flex="0 0 auto"
            w={{
              base: "96%", // one full card on mobile
              sm: "46%",    // 2 cards on small tablets
              md: "30%", // 3 cards on desktop
              lg: "23%",    // 4 cards on large screens
            }}
            scrollSnapAlign="start"
            scrollSnapStop="always"
            bg="white"
            borderRadius="2xl"
            overflow="hidden"
            position="relative"
            cursor="pointer"
            boxShadow="lg"
            onClick={() => router.push(`/property/${p._id}`)}
          >
            <Image
              src={p.coverPhoto || "/placeholder.jpg"}
              alt={p.price}
              w="100%"
              h="230px"
              objectFit="cover"
            />

            <IconButton
              aria-label="Like"
              icon={liked[p._id] ? <FaHeart color="red" /> : <FaRegHeart color="white" />}
              onClick={(e) => {
                e.stopPropagation();
                setLiked((prev) => ({ ...prev, [p._id]: !prev[p._id] }));
              }}
              position="absolute"
              top="3"
              right="3"
              bg="blackAlpha.500"
              size="sm"
              borderRadius="full"
              _hover={{ bg: "blackAlpha.700" }}
            />

            <Box p={4} color="black">
              <Text fontWeight="bold" fontSize="lg" color="goldenrod">
                ${p.price?.toLocaleString()}
              </Text>
              <Text fontSize="sm">{p.area || p.size} sq ft</Text>
              <Text fontSize="xs" noOfLines={1} color="gray.600">
                {p.location}
              </Text>
            </Box>
          </Box>
        ))}

      </Flex>
    </Box>
  );
}
