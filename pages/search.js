// pages/search.js
import clientPromise from "@/lib/mongodb";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  Flex,
  Box,
  Text,
  Icon,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { BsFilter } from "react-icons/bs";
import translations from "@/utils/translations";
import Property from "@/components/Property";
import SearchFilters from "@/components/SearchFilters";
import noresult from "@/assets/images/noresult.png";

// Note: getServerSideProps will fetch initial props using server-side fetchers (below)
import axios from "axios";



/* ----------------- normalization (same pattern as API) ----------------- */
const parsePriceFromLabel = (label) => {
  if (!label) return null;
  const cleaned = String(label).replace(/[^0-9.]/g, "");
  return cleaned === "" ? null : Number(cleaned);
};

const normalizeZoopla = (raw) => {
  const pricing = raw.pricing || {};
  const priceNum = pricing.value ?? parsePriceFromLabel(pricing.label) ?? null;
  return {
    source: "Zoopla",
    id: raw.listingId || raw.listing_id || `zoopla-${Math.random().toString(36).slice(2, 8)}`,
    title: raw.title || raw.shortDescription || raw.displayTitle || "",
    price: priceNum,
    image: raw.imageUris?.[0] || raw.image || raw.image_url || null,
    address: raw.address || raw.displayable_address || raw.location?.label || "",
    bedrooms: raw.attributes?.bedrooms ?? raw.num_bedrooms ?? null,
    raw,
  };
};

const normalizeZillow = (raw) => {
  const priceNum = raw.price ?? raw.zestimate ?? null;
  return {
    source: "Zillow",
    id: raw.zpid || raw.id || `zillow-${Math.random().toString(36).slice(2, 8)}`,
    title: raw.title || raw.propertyType || "",
    price: priceNum,
    image: raw.imgSrc || raw.carouselPhotos?.[0] || null,
    address: raw.address || raw.streetAddress || raw.location || "",
    bedrooms: raw.bedrooms ?? raw.bedroomsCount ?? null,
    raw,
  };
};

/* ----------------- component ----------------- */
const Search = ({ properties = [], initialQuery = {} }) => {
console.log("Received properties:", properties);

  const [searchFiltersOpen, setSearchFiltersOpen] = useState(false);
const router = useRouter();
const locale = router.locale || "en";
const t = translations[locale]?.search || translations.en.search;
  // client-side incremental loading state
  const [items, setItems] = useState(properties || []);
  const [page, setPage] = useState(initialQuery.page ? Number(initialQuery.page) : 1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // reset when route changes (new search)
  useEffect(() => {
    setItems(properties || []);
    setPage(initialQuery.page ? Number(initialQuery.page) : 1);
    setHasMore(true);
  }, [router.asPath]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const q = router.query || {};
      const params = new URLSearchParams({
        ...q,
        page: String(page + 1),
        perSource: "6",
      }).toString();

      const res = await fetch(`/api/search?${params}`);
      const payload = await res.json();
      const newResults = payload.results || [];

      if (newResults.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...newResults]);
        setPage((p) => p + 1);

        // If result count less than expected combined chunk, mark no more
        const expectedCombined = Number(6) * 2; // perSource * 2 sources
        if (newResults.length < expectedCombined) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Load more error", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <Box bg="green.800" minH="100vh" p="6">
     <Flex
  m="5"
  cursor="pointer"
  bg="gray.100"
  fontSize="lg"
  fontWeight="black"
  borderColor="gray.200"
  borderBottom="1px"
  justifyContent="center"
  alignItems="center"
  p="2"
  borderRadius="md"
  onClick={() => setSearchFiltersOpen((prev) => !prev)}
>
  <Text color="black">{t.filterBtn}</Text>
  <Icon paddingLeft="2" w="7" color="gray.800" as={BsFilter} />
</Flex>

<Text p="4" fontSize="3xl" fontWeight="bold" color="white">
  {router.query.listing_status === "sale" ? t.titleSale : t.titleRent}
  {router.query.area && ` ${t.inArea} ${router.query.area}`}
</Text>


      <Flex flexWrap="wrap" justifyContent="center" gap={6}>
        {items?.length > 0 ? (
          items.map((property, idx) => (
            <Property property={property} key={property.id || property.listing_id || idx} />
          ))
        ) : (
          <Flex justifyContent="center" alignItems="center" flexDir="column" mt="10">
            <Image alt="noresult" src={noresult} width={200} />
           <Text mt="3" fontSize="2xl" color="white">
  {t.noResults}
</Text>
          </Flex>
        )}
      </Flex>

      <Flex justifyContent="center" mt="8">
        {loadingMore ? (
         <Button leftIcon={<Spinner />} isLoading>
  {t.loading}
</Button>
        ) : hasMore ? (
         <Button onClick={loadMore} colorScheme="teal">
  {t.loadMore}
</Button>
        ) : (
<Text color="gray.200">{t.noMore}</Text>
        )}
      </Flex>
    </Box>
  );
};

export default Search;

/* ----------------- server-side fetch (getServerSideProps) ----------------- */
export async function getServerSideProps({ query }) {

  const listing_status = query.listing_status === "sale" ? "sale" : "rent";
  const rawArea = query.area || null;
  const rawCountry = query.country || null; // kept in case you reuse later
  const area = rawArea ? String(rawArea).trim() : null;
  const country = rawCountry ? String(rawCountry).trim().toLowerCase() : null;
  const minPrice = query.minPrice ? Number(query.minPrice) : null;
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : null;
  const beds = query.beds ? Number(query.beds) : null;
  const propertyType = query.propertyType || null;
  const page = query.page ? Number(query.page) : 1;

  const perSource = 6;
  const zooplaSection = listing_status === "sale" ? "for-sale" : "to-rent";

  // Helpers --------------------------------------------------
  const normalizeString = (s = "") =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const areaNorm = normalizeString(area || "");
  const countryNorm = normalizeString(country || "");

  // Fetchers -------------------------------------------------
  const fetchZooplaDirect = async (areaArg = "London", listing_status = "sale", options = {}) => {
    try {
      const { minPrice, maxPrice, beds, page = 1, perPage = 12 } = options;
      const channel = listing_status === "sale" ? "sale" : "rent";
      const query = String(areaArg || "").trim();

      const params = {
        channel,
        query,
        page: String(page),
      };

      if (minPrice) params.price_min = minPrice;
      if (maxPrice) params.price_max = maxPrice;
      if (beds) params.beds_min = beds;

      Object.keys(params).forEach(k => params[k] == null && delete params[k]);

      const res = await axios.get("https://zoopla-uk.p.rapidapi.com/properties/search", {
        params,
        headers: {
          "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY_ZOOPLA || process.env.ZOOPLA_KEY,
          "x-rapidapi-host": "zoopla-uk.p.rapidapi.com",
          Accept: "application/json",
        },
        timeout: 15000,
      });

      const body = res.data || {};
      const dataNode = body.data || body;
      const listingsNode =
        (dataNode.listings && (dataNode.listings.regular || dataNode.listings.featured || dataNode.listings.extended))
          || dataNode.listings
          || [];

      const rawArray = Array.isArray(listingsNode) ? listingsNode
        : Array.isArray(dataNode.listings?.regular) ? dataNode.listings.regular
        : [];

      console.log("✅ Zoopla returned:", rawArray.length, "results for", query);
      return rawArray.slice(0, perPage);
    } catch (err) {
      console.error("❌ Zoopla direct fetch error:", err?.response?.data || err.message || err);
      return [];
    }
  };

  const fetchZillowDirect = async (locationArg = "Houston, TX", options = {}) => {
    try {
      const { minPrice, maxPrice, beds, propertyType, page = 1, perPage = 12 } = options;
      const url = "https://zillow56.p.rapidapi.com/search";
      const params = {
        location: locationArg,
        status_type: listing_status === "sale" ? "ForSale" : "ForRent",
        page,
      };
      if (minPrice) params.price_min = minPrice;
      if (maxPrice) params.price_max = maxPrice;
      if (beds) params.beds_min = beds;
      if (propertyType) params.property_type = propertyType;

      const res = await axios.get(url, {
        params,
        headers: {
          "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY_ZILLOW,
          "x-rapidapi-host": "zillow56.p.rapidapi.com",
        },
        timeout: 20000,
      });

      // different shapes - return array
      const rawResults = res.data?.props || res.data?.results || res.data?.data || res.data || [];
      return rawResults.slice(0, perPage);
    } catch (err) {
      console.error("Zillow direct fetch error:", err?.message || err);
      return [];
    }
  };

  // Matching function - checks many fields to ensure item belongs to the searched area
  const matchesArea = (item) => {
    if (!area) return true; // nothing to match against

    const raw = item.raw || {};
    const allCandidates = [];

    // address fields we might find data in
    const addrCandidates = [
      item.address,
      raw.address && (typeof raw.address === "string" ? raw.address : raw.address.displayable_address || raw.address.label),
      raw.displayable_address,
      raw.location && raw.location.label,
      raw.location && raw.location.name,
      raw.location && raw.location.city,
      raw.city,
      raw.town,
      raw.province,
      raw.region,
      raw.country,
      item.title,
      raw.title,
      raw.description,
    ].filter(Boolean);

    addrCandidates.forEach((v) => allCandidates.push(normalizeString(String(v))));

    // If provider gives explicit country code fields, include them
    const countryCandidates = [
      (raw.country || raw.location?.country || raw.address?.country || "").toString(),
    ].filter(Boolean)
      .map(normalizeString);

    // Combine and test
    const areaWords = areaNorm.split(/\s+/).filter(Boolean);

    // If user passed country, ensure item country matches (if available)
    if (countryNorm && countryCandidates.length > 0) {
      const hasCountry = countryCandidates.some((c) => c.includes(countryNorm));
      if (!hasCountry) return false;
    }

    // Check that at least one candidate contains all area words (strong match)
    const strongMatch = allCandidates.some((candidate) =>
      areaWords.every((w) => candidate.includes(w))
    );
    if (strongMatch) return true;

    // fallback: any candidate contains area as substring
    const weakMatch = allCandidates.some((candidate) => candidate.includes(areaNorm));
    if (weakMatch) return true;

    return false;
  };

  try {
    const options = { page, perPage: perSource, minPrice, maxPrice, beds, propertyType };

    // Fetch Zoopla and Zillow using the raw area string.
    const zooplaRaw = await fetchZooplaDirect(area || "London", listing_status, options);
    const zillowRaw = await fetchZillowDirect(area || "Houston, TX", options);

    // Normalize
    const zooplaNormalized = (zooplaRaw || []).map(normalizeZoopla).slice(0, perSource);
    const zillowNormalized = (zillowRaw || []).map(normalizeZillow).slice(0, perSource);

    // ⭐ Fetch Local DB properties
const localDBProperties = await getLocalProperties(area, country, listing_status);

   // ⭐ Combine ALL sources
const combined = [
  ...localDBProperties,
  ...zooplaNormalized.filter(matchesArea),
  ...zillowNormalized.filter(matchesArea),
];
// ⭐ Sort: Premium listings first (from Local DB only)
combined.sort((a, b) => {
  const aPremium = a.raw?.isPremium ? 1 : 0;
  const bPremium = b.raw?.isPremium ? 1 : 0;

  return bPremium - aPremium; // premium on top
});



    return {
      props: {
        properties: combined,
        initialQuery: query,
      },
    };
  } catch (err) {
    console.error("❌ Search error:", err?.message || err);
    return {
      props: {
        properties: [],
        initialQuery: query,
      },
    };
  }
}
async function getLocalProperties(area, country, listing_status) {
  try {
    const client = await clientPromise;
    const db = client.db("realestate");

    const query = {};

    if (area) {
      query.address = { $regex: area, $options: "i" };
    }

    if (country) {
      query.country = { $regex: country, $options: "i" };
    }

    if (listing_status) {
      query.listingType = listing_status === "sale" ? "sale" : "rent";
    }

    const props = await db.collection("properties").find(query).toArray();
function safeDoc(p) {
  const obj = { ...p };

  // Convert ObjectId
  if (obj._id) obj._id = obj._id.toString();

  // Convert all Date fields to ISO strings
  Object.keys(obj).forEach((key) => {
    if (obj[key] instanceof Date) {
      obj[key] = obj[key].toISOString();
    }
  });

  return obj;
}
    return props.map((p) => ({
      source: "Local",
      id: p._id.toString(),
      title: p.title,
      price: p.price,
      images: p.images || null,
      address: p.address,
      bedrooms: p.bedrooms || null,
    
raw: safeDoc(p),



    }));
  } catch (err) {
    console.error("Local DB fetch error:", err);
    return [];
  }
}