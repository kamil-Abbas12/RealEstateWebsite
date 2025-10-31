"use client";
import NextLink from "next/link";
import {
  Menu, MenuButton, MenuList, MenuItem, IconButton,
  Flex, Box, Spacer, HStack, Link as ChakraLink, Button, Text
} from "@chakra-ui/react";
import { FcHome, FcAbout, FcMenu } from "react-icons/fc";
import { BsSearch, BsChevronDown } from "react-icons/bs";
import { FiKey } from "react-icons/fi";
import { CheckIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import translations from "@/utils/translations";
import Image from "next/image";

export const Navbar = () => {
  const router = useRouter();
  const locale = router.locale || "en";

  const t = (path) => {
    const parts = path.split(".");
    let cur = translations[locale] || translations.en;
    for (const p of parts) {
      cur = cur?.[p];
      if (cur == null) return path;
    }
    return cur;
  };

  const languages = [
    { code: "en", label: "🇬🇧 English" },
    { code: "fr", label: "🇫🇷 Français" },
    { code: "es", label: "🇪🇸 Español" },
  ];

  const changeLanguage = (newLang) => {
    router.push(router.asPath, router.asPath, { locale: newLang });
  };

  const activeLang = languages.find((l) => l.code === locale);

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      p={{ base: 2, md: 3 }}
      borderBottom="1px"
      borderBottomColor="gray.200"
      bg="white"
      color="gray.800"
      w="100%"
      wrap="wrap"
      position="sticky"
      top="0"
      zIndex="10"
      boxShadow="sm"
    >
      {/* Logo & Brand */}
      <Box display="flex" alignItems="center" fontWeight="bold">
        <ChakraLink
          as={NextLink}
          href="/"
          display="flex"
          alignItems="center"
          px="2"
        >
          <Image
            src="/logo.png"
            alt="Brand Logo"
            width={40}
            height={40}
            priority
          />
          <Box
            as="span"
            ml="2"
            fontSize="lg"
            color="green.900"
            display={{ base: "none", md: "block" }}
          >
            {t("nav.brand")}
          </Box>
        </ChakraLink>
      </Box>

      <Spacer />

      {/* Desktop Navigation */}
      <HStack
        spacing={6}
        display={{ base: "none", lg: "flex" }}
        align="center"
      >
        <ChakraLink
          as={NextLink}
          href="/"
          display="flex"
          alignItems="center"
          px="2"
        >
          <FcHome style={{ marginRight: 8 }} /> {t("nav.home")}
        </ChakraLink>
        <ChakraLink
          as={NextLink}
          href="/search"
          display="flex"
          alignItems="center"
          px="2"
        >
         
          <FcAbout style={{ marginRight: 8 }} /> {t("nav.buy")}
        </ChakraLink>
        <ChakraLink
          as={NextLink}
          href="/search?listing_status=rent"
          display="flex"
          alignItems="center"
          px="2"
        >
          <FiKey style={{ marginRight: 8 }} /> {t("nav.rent")}
        </ChakraLink>

        {/* Language Menu */}
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<BsChevronDown />}
            variant="outline"
            colorScheme="green"
            size="sm"
          >
            {activeLang ? `${activeLang.label}` : t("nav.language")}
          </MenuButton>
          <MenuList>
            {languages.map((l) => (
              <MenuItem
                key={l.code}
                onClick={() => changeLanguage(l.code)}
                justifyContent="space-between"
              >
                {l.label}
                {l.code === locale && <CheckIcon color="green.500" />}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </HStack>

      {/* Mobile Navigation */}
      <Flex
        display={{ base: "flex", lg: "none" }}
        align="center"
        gap="2"
      >
        {/* Language Dropdown for Small Screens */}
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<Text fontSize="md">{activeLang?.label?.split(" ")[0] || "🌐"}</Text>}
            variant="outline"
            aria-label="Languages"
            size="sm"
          />
          <MenuList>
            {languages.map((l) => (
              <MenuItem
                key={l.code}
                onClick={() => changeLanguage(l.code)}
                justifyContent="space-between"
              >
                {l.label}
                {l.code === locale && <CheckIcon color="green.500" />}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        {/* Hamburger Menu */}
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FcMenu />}
            variant="outline"
            aria-label="Menu"
            size="md"
            bg="white"
          />
          <MenuList>
            <MenuItem onClick={() => router.push("/")}>
              <FcHome style={{ marginRight: 8 }} /> {t("nav.home")}
            </MenuItem>
          
            <MenuItem onClick={() => router.push("/search?listing_status=sale")}>
              <FcAbout style={{ marginRight: 8 }} /> {t("nav.buy")}
            </MenuItem>
            <MenuItem onClick={() => router.push("/search?listing_status=rent")}>
              <FiKey style={{ marginRight: 8 }} /> {t("nav.rent")}
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default Navbar;
