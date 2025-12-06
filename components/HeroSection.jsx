"use client";

import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import translations from "@/utils/translations";
import Image from "next/image";

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
      w="100%"
      h={{ base: "55vh", sm: "60vh", md: "70vh", lg: "80vh" }}
    >
      <Image
        src="/cover.jpg"
        alt="Real Estate Background"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center" }}
      />
      {/* Overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        w="100%"
        h="100%"
        bg="rgba(0, 0, 0, 0.35)"
      />
      {/* Content */}
      <Flex
        direction="column"
        align="center"
        textAlign="center"
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        px={{ base: 3, md: 6 }}
        maxW="90%"
      >
        <Heading
          fontSize={{ base: "2xl", sm: "3xl", md: "4xl", lg: "5xl" }}
          color="white"
          fontWeight="bold"
          lineHeight="1.15"
          mb={3}
          textShadow="0 2px 8px rgba(0,0,0,0.6)"
        >
          {t("hero.title")}{" "}
        </Heading>{" "}
        <Text
          fontSize={{ base: "sm", sm: "md", md: "lg" }}
          color="whiteAlpha.900"
          maxW={{ base: "90%", md: "70%" }}
          lineHeight="1.6"
          textShadow="0 1px 5px rgba(0,0,0,0.5)"
        >
          {t("hero.description")}{" "}
        </Text>{" "}
      </Flex>{" "}
    </Box>
  );
}
