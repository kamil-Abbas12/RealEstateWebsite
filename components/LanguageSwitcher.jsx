// components/LanguageSwitcher.jsx
"use client";
import { Menu, MenuButton, MenuList, MenuItem, Button, HStack, Text } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { useRouter } from "next/router";

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locale } = router;

  const languages = [
    { code: "en", label: "🇬🇧 English" },
    { code: "fr", label: "🇫🇷 Français" },
    { code: "es", label: "🇪🇸 Español" },
  ];

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="outline" colorScheme="green">
        {languages.find((l) => l.code === locale)?.label || "🌍 Language"}
      </MenuButton>
      <MenuList>
        {languages.map((lang) => (
          <MenuItem key={lang.code}>
            <Link href={router.asPath} locale={lang.code}>
              <HStack>
                <Text>{lang.label}</Text>
              </HStack>
            </Link>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
