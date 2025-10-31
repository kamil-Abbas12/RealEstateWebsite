"use client";

import { useState } from "react";
import { Flex, Box, Input, Button, Select } from "@chakra-ui/react";
import { useRouter } from "next/router";
import translations from "@/utils/translations";

export default function SearchFilters() {
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

  const [filters, setFilters] = useState({
    listing_status: "sale",
    area: "",
    country: "",
    minimum_price: "",
    maximum_price: "",
    minimum_beds: "",
    maximum_beds: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const searchProperties = async () => {
    setLoading(true);
    const query = {};
    for (const key in filters) {
      if (filters[key]) query[key] = filters[key];
    }
    await router.push({ pathname: "/search", query });
    setLoading(false);
  };

  return (
    <Flex
      bg="white"
      p={{ base: 4, md: 6 }}
      justify="center"
      align="center"
      flexWrap="wrap"
      borderRadius="xl"
      boxShadow="md"
      gap={{ base: 3, md: 4 }}
      maxW={{ base: "95%", md: "85%", lg: "70%" }}
      mx="auto"
      mt={{ base: 4, md: 0 }}
      direction={{ base: "column", sm: "row" }}
      zIndex="10"
      position="relative"
    >
      {/* Listing Type */}
      <Box w={{ base: "100%", sm: "auto" }}>
        <Select
          name="listing_status"
          value={filters.listing_status}
          onChange={handleChange}
          bg="gray.50"
          color="gray.800"
          w={{ base: "100%", sm: "160px" }}
        >
          <option value="sale">{t("filters.buy")}</option>
          <option value="rent">{t("filters.rent")}</option>
        </Select>
      </Box>

      {/* Area / City */}
      <Box w={{ base: "100%", sm: "200px", md: "250px" }}>
        <Input
          placeholder={t("filters.city")}
          name="area"
          value={filters.area}
          onChange={handleChange}
          bg="gray.50"
          color="gray.800"
        />
      </Box>

      {/* Min Price */}
      <Box w={{ base: "100%", sm: "140px" }}>
        <Select
          name="minimum_price"
          value={filters.minimum_price}
          onChange={handleChange}
          bg="gray.50"
          color="gray.800"
        >
          <option value="">{t("filters.minPrice")}</option>
          {[50, 100, 200, 500, 1000, 2000].map((p) => (
            <option key={p} value={p}>
              ${p}
            </option>
          ))}
        </Select>
      </Box>

      {/* Max Price */}
      <Box w={{ base: "100%", sm: "140px" }}>
        <Select
          name="maximum_price"
          value={filters.maximum_price}
          onChange={handleChange}
          bg="gray.50"
          color="gray.800"
        >
          <option value="">{t("filters.maxPrice")}</option>
          {[1000, 2000, 5000, 10000, 50000].map((p) => (
            <option key={p} value={p}>
              ${p}
            </option>
          ))}
        </Select>
      </Box>

      {/* Min Beds */}
      <Box w={{ base: "100%", sm: "120px" }}>
        <Select
          name="minimum_beds"
          value={filters.minimum_beds}
          onChange={handleChange}
          bg="gray.50"
          color="gray.800"
        >
          <option value="">{t("filters.minBeds")}</option>
          {[1, 2, 3, 4, 5].map((b) => (
            <option key={b} value={b}>
              {b}+
            </option>
          ))}
        </Select>
      </Box>

      {/* Search Button */}
      <Box w={{ base: "100%", sm: "auto" }}>
        <Button
          colorScheme="green"
          onClick={searchProperties}
          isLoading={loading}
          w={{ base: "100%", sm: "auto" }}
          px={{ base: 6, md: 8 }}
          fontWeight="semibold"
          borderRadius="lg"
        >
          {t("filters.search")}
        </Button>
      </Box>
    </Flex>
  );
}
