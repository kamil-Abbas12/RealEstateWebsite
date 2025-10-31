"use client";

import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import translations from "@/utils/translations";

export default function HeroSection() {
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

  return (
    <Box
      position="relative"
      bgImage="url('/cover.jpg')"
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      h={{ base: "70vh", md: "85vh", lg: "90vh" }}
      w="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
    >
      {/* Overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        w="100%"
        h="100%"
        bg="rgba(0, 0, 0, 0.35)"
        zIndex="0"
      />

      {/* Content */}
      <Flex
        direction="column"
        align="center"
        textAlign="center"
        px={{ base: 4, md: 6 }}
        maxW={{ base: "95vw", md: "80ch" }}
        zIndex="1"
      >
        <Heading
          fontSize={{ base: "2xl", sm: "3xl", md: "4xl", lg: "5xl" }}
          color="white"
          fontWeight="bold"
          lineHeight="1.1"
          mb={4}
          textShadow="0 2px 8px rgba(0,0,0,0.6)"
        >
          {t("hero.title")}
        </Heading>

        <Text
          fontSize={{ base: "sm", sm: "md", md: "lg" }}
          color="whiteAlpha.900"
          lineHeight="1.7"
          px={{ base: 2, md: 4 }}
          maxW={{ base: "95vw", md: "75ch" }}
          textShadow="0 1px 5px rgba(0,0,0,0.5)"
        >
          {t("hero.description")}
        </Text>
      </Flex>
    </Box>
  );
}
