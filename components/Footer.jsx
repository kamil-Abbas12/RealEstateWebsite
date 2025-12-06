"use client";

import {
  Box,
  Flex,
  Text,
  Link,
  VStack,
  HStack,
  Icon,
  Divider,
} from "@chakra-ui/react";
import { BsChevronRight } from "react-icons/bs";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import translations from "@/utils/translations";
import { useRouter } from "next/router";

export default function Footer() {
  const router = useRouter();
  const locale = router?.locale || "en"; // detect locale or default to English
  const t = translations[locale]?.footer || translations.en.footer;

  return (
    <Box
      bg="white"
      color="green.900"
      py={{ base: 10, md: 14 }}
      px={{ base: 6, md: 20, lg: 28 }}
      borderTop="1px solid"
      borderColor="gray.200"
    >
      <Flex
        direction="row"
        wrap={{ base: "wrap", md: "wrap", lg: "nowrap" }}
        justify="space-between"
        align="flex-start"
        rowGap={{ base: 10, md: 10, lg: 0 }}
        columnGap={{ base: 0, md: 8, lg: 12 }}
      >
        {/* Company Info */}
        <VStack
          align="flex-start"
          spacing={3}
          w={{ base: "100%", sm: "48%", md: "48%", lg: "23%" }}
        >
          <Text fontSize="2xl" fontWeight="bold" color="green.800">
            {t.company}
          </Text>
          <Text color="green.700" fontSize={{ base: "sm", md: "md" }}>
            {t.about}
          </Text>
        </VStack>

        {/* Quick Links */}
        <VStack
          align="flex-start"
          spacing={2}
          w={{ base: "100%", sm: "48%", md: "48%", lg: "23%" }}
        >
          <Text fontSize="xl" fontWeight="semibold" color="green.800">
            {t.quickLinks}
          </Text>
          {[
            { name: t.links.home, href: "/" },
            { name: t.links.buy, href: "/search?listing_status=sale" },
            { name: t.links.sell, href: "/search?listing_status=rent" },
            { name: t.links.properties, href: "/properties" },
            { name: t.links.contact, href: "/blog" },
          ].map((link) => (
            <Link
              key={link.name}
              href={link.href}
              display="flex"
              alignItems="center"
              gap={2}
              _hover={{ color: "green.500" }}
            >
              <BsChevronRight />
              {link.name}
            </Link>
          ))}
        </VStack>

        {/* Contact Info */}
        <VStack
          align="flex-start"
          spacing={2}
          w={{ base: "100%", sm: "48%", md: "48%", lg: "23%" }}
        >
          <Text fontSize="xl" fontWeight="semibold" color="green.800">
            {t.contact}
          </Text>
          <Text>{t.address}</Text>
          <Text>{t.email}</Text>
        </VStack>

        {/* Social Media */}
        <VStack
          align="flex-start"
          spacing={3}
          w={{ base: "100%", sm: "48%", md: "48%", lg: "23%" }}
        >
          <Text fontSize="xl" fontWeight="semibold" color="green.800">
            {t.follow}
          </Text>
          <HStack spacing={4}>
            <Link href="#" _hover={{ color: "blue.500" }}>
              <Icon as={FaFacebook} boxSize={6} />
            </Link>
            <Link href="#" _hover={{ color: "pink.500" }}>
              <Icon as={FaInstagram} boxSize={6} />
            </Link>
            <Link href="#" _hover={{ color: "blue.700" }}>
              <Icon as={FaLinkedin} boxSize={6} />
            </Link>
            <Link href="#" _hover={{ color: "red.500" }}>
              <Icon as={FaYoutube} boxSize={6} />
            </Link>
            <Link href="#" _hover={{ color: "gray.700" }}>
              <Icon as={FaGithub} boxSize={6} />
            </Link>
          </HStack>
        </VStack>
      </Flex>

      <Divider my={8} borderColor="gray.300" />

      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="center"
        textAlign={{ base: "center", md: "left" }}
        gap={3}
      >
        <Text fontSize="sm" color="green.700">
          © {new Date().getFullYear()} {t.company}. {t.rights}
        </Text>
        <Text fontSize="sm" color="green.700">
          {t.designed}
        </Text>
      </Flex>
    </Box>
  );
}
