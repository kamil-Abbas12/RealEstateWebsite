"use client";
import NextLink from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Portal } from "@chakra-ui/react";

import {
  Menu, MenuButton, MenuList, MenuItem, IconButton,
  Flex, Box, Spacer, HStack, Link as ChakraLink, Button, Text, Avatar
} from "@chakra-ui/react";
import { FcHome, FcAbout, FcMenu } from "react-icons/fc";
import { FiKey, FiPlus } from "react-icons/fi";
import { BsChevronDown } from "react-icons/bs";
import { CheckIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import Image from "next/image";
import translations from "@/utils/translations";

export const Navbar = () => {
  const { data: session } = useSession(); // NextAuth session
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

  // Check login status
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const localUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
  const isLoggedIn = !!token || !!session;
  const user = session?.user || localUser;

  const handleAddProperty = () => router.push("/add-property");
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (session) {
      signOut({ callbackUrl: "/" });
    } else {
      router.reload();
    }
  };

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
      {/* Logo */}
      <Box display="flex" alignItems="center" fontWeight="bold">
        <ChakraLink as={NextLink} href="/" display="flex" alignItems="center" px="2">
          <Image src="/logo.png" alt="Brand Logo" width={40} height={40} priority />
          <Box as="span" ml="2" fontSize="lg" color="green.900" display={{ base: "none", md: "block" }}>
            {t("nav.brand")}
          </Box>
        </ChakraLink>
      </Box>

      <Spacer />

      {/* Desktop Navigation */}
      <HStack spacing={6} display={{ base: "none", lg: "flex" }} align="center">
        <ChakraLink as={NextLink} href="/" display="flex" alignItems="center" px="2">
          <FcHome style={{ marginRight: 8 }} /> {t("nav.home")}
        </ChakraLink>

        <ChakraLink as={NextLink} href="/search?listing_status=sale" display="flex" alignItems="center" px="2">
          <FcAbout style={{ marginRight: 8 }} /> {t("nav.buy")}
        </ChakraLink>

        <ChakraLink as={NextLink} href="/search?listing_status=rent" display="flex" alignItems="center" px="2">
          <FiKey style={{ marginRight: 8 }} /> {t("nav.rent")}
        </ChakraLink>

        <ChakraLink as={NextLink} href="/properties" display="flex" alignItems="center" px="2">
          <FiKey style={{ marginRight: 8 }} /> {t("nav.properties")}
        </ChakraLink>

        <ChakraLink as={NextLink} href="/dashboard" display="flex" alignItems="center" px="2">
          <FiKey style={{ marginRight: 8 }} /> {t("nav.dashboard")}
        </ChakraLink>

        {/* Blog Dropdown */}
        <Menu>
          <MenuButton as={Button} rightIcon={<BsChevronDown />} variant="ghost" size="sm" px="2">
            Blog
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => router.push("/blog/grid")}>Grid View</MenuItem>
            <MenuItem onClick={() => router.push("/blog/list")}>List View</MenuItem>
            <MenuItem onClick={() => router.push("/blog")}>Latest Post</MenuItem>
          </MenuList>
        </Menu>

        <Button colorScheme="green" size="sm" onClick={handleAddProperty}>
          <FiPlus style={{ marginRight: 6 }} /> Add Property
        </Button>

        {/* User Menu */}
        {isLoggedIn && user ? (
          <Menu>
            <MenuButton as={Avatar} size="sm" name={user.name} src={user.image} cursor="pointer" />
            <MenuList>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <Button colorScheme="blue" size="sm" onClick={() => router.push("/login")}>
            Login
          </Button>
        )}

        {/* Language Menu */}
        <Menu>
          <MenuButton as={Button} rightIcon={<BsChevronDown />} variant="outline" colorScheme="green" size="sm">
            {activeLang ? activeLang.label : t("nav.language")}
          </MenuButton>
          <MenuList>
            {languages.map((l) => (
              <MenuItem key={l.code} onClick={() => changeLanguage(l.code)} justifyContent="space-between">
                {l.label}
                {l.code === locale && <CheckIcon color="green.500" />}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </HStack>

      {/* Mobile Navigation */}
      <Flex display={{ base: "flex", lg: "none" }} align="center" gap="2">
        {/* Language Menu */}
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
              <MenuItem key={l.code} onClick={() => changeLanguage(l.code)} justifyContent="space-between">
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
  <Portal>
    <MenuList zIndex={3000}>
      <MenuItem onClick={() => router.push("/")}>
        <FcHome style={{ marginRight: 8 }} /> {t("nav.home")}
      </MenuItem>
      <MenuItem onClick={() => router.push("/search?listing_status=sale")}>
        <FcAbout style={{ marginRight: 8 }} /> {t("nav.buy")}
      </MenuItem>
      <MenuItem onClick={() => router.push("/search?listing_status=rent")}>
        <FiKey style={{ marginRight: 8 }} /> {t("nav.rent")}
      </MenuItem>
      <MenuItem onClick={() => router.push("/dashboard")}>
        <FiKey style={{ marginRight: 8 }} /> {t("nav.dashboard")}
      </MenuItem>

      <MenuItem onClick={() => router.push("/blog/grid")}>Blog Grid</MenuItem>
      <MenuItem onClick={() => router.push("/blog/list")}>Blog List</MenuItem>
      <MenuItem onClick={() => router.push("/blog")}>Latest Blog</MenuItem>

      <MenuItem onClick={handleAddProperty}>
        <FiPlus style={{ marginRight: 8 }} /> Add Property
      </MenuItem>
      <MenuItem onClick={() => router.push("/properties")}>
        <FiKey style={{ marginRight: 8 }} /> {t("nav.properties")}
      </MenuItem>

      {isLoggedIn && user ? (
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      ) : (
        <MenuItem onClick={() => router.push("/login")}>Login</MenuItem>
      )}
    </MenuList>
  </Portal>
</Menu>

      </Flex>
    </Flex>
  );
};

export default Navbar;
