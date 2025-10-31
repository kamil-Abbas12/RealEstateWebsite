// pages/property/[id].js
import React from "react";
import { Box, Flex, Spacer, Text } from "@chakra-ui/layout";
import { Avatar } from "@chakra-ui/avatar";
import { FaBed, FaBath } from "react-icons/fa";
import { BsGridFill } from "react-icons/bs";
import { GoVerified } from "react-icons/go";
import millify from "millify";
import axios from "axios";

import ImageScrollbar from "../../components/ImageScrollbar";

const parsePriceFromLabel = (label) => {
  if (!label) return null;
  const cleaned = String(label).replace(/[^0-9.]/g, "");
  return cleaned === "" ? null : Number(cleaned);
};

// Normalizers for list/detail raw objects
const normalizeZooplaDetail = (raw) => {
  const pricing = raw.pricing || {};
  const price = pricing.value ?? parsePriceFromLabel(pricing.label) ?? raw.price ?? null;

  // photos: create a simple array of { id, url } from likely fields
  const photos =
    raw.images ||
    raw.imageUris ||
    raw.media ||
    raw.photos ||
    raw.photos_list ||
    raw.gallery ||
    [];

  // map to { id, url }
  const mappedPhotos = Array.isArray(photos)
    ? photos.map((p, i) => {
        if (!p) return null;
        if (typeof p === "string") return { id: `photo-${i}`, url: p };
        return { id: p.id || p.photo_id || p.uri || i, url: p.url || p.src || p.href || p.link || p.original || null };
      }).filter(Boolean)
    : [];

  return {
    price,
    rentFrequency: raw.rentFrequency || raw.frequency || null,
    rooms: raw.attributes?.bedrooms ?? raw.num_bedrooms ?? raw.bedrooms ?? null,
    title: raw.title || raw.displayTitle || raw.shortDescription || "",
    baths: raw.attributes?.bathrooms ?? raw.num_bathrooms ?? raw.baths ?? null,
    area: raw.attributes?.area ?? raw.floorArea ?? raw.livingArea ?? raw.size ?? null,
    agency: { logo: { url: raw.agency?.logo?.url || raw.agent?.logo || null } },
    isVerified: Boolean(raw.isVerified || raw.verified || raw.agent?.isVerified),
    description: raw.description || raw.longDescription || raw.details || "",
    type: raw.attributes?.propertyType || raw.propertyType || raw.type || null,
    purpose: raw.category || raw.purpose || null,
    furnishingStatus: raw.furnishingStatus || raw.furnished || raw.furnishing || null,
    amenities: raw.amenities || raw.facilities || raw.features || [],
    photos: mappedPhotos,
    raw,
  };
};

const normalizeZillowDetail = (raw) => {
  // adapt to Zillow raw shapes returned by your RapidAPI wrapper
  const price = raw.price ?? raw.zestimate ?? null;

  const photos = raw.images || raw.imgSrc || raw.carouselPhotos || raw.photos || [];
  const mappedPhotos = Array.isArray(photos)
    ? photos.map((p, i) => {
        if (!p) return null;
        if (typeof p === "string") return { id: `photo-${i}`, url: p };
        return { id: p.id || p.photoId || i, url: p.url || p.src || p.imgSrc || null };
      }).filter(Boolean)
    : [];

  return {
    price,
    rentFrequency: raw.rentFrequency || null,
    rooms: raw.bedrooms ?? raw.bedroomsCount ?? null,
    title: raw.title || raw.propertyType || raw.shortDesc || "",
    baths: raw.bathrooms ?? raw.bathroomsCount ?? null,
    area: raw.area ?? raw.livingArea ?? null,
    agency: { logo: { url: raw.providerLogo || null } },
    isVerified: Boolean(raw.verified || raw.isVerified),
    description: raw.description || raw.overview || raw.propertyDescription || "",
    type: raw.propertyType || null,
    purpose: raw.listingStatus || raw.purpose || null,
    furnishingStatus: raw.furnishingStatus || raw.furnished || null,
    amenities: raw.amenities || raw.features || [],
    photos: mappedPhotos,
    raw,
  };
};

const PropertyDetails = ({ propertyDetails }) => {
  if (!propertyDetails) {
    return (
      <Box p="8">
        <Text>Property not found.</Text>
      </Box>
    );
  }

  const { price, rentFrequency, rooms, title, baths, area, agency, isVerified, description, type, purpose, furnishingStatus, amenities, photos } =
    propertyDetails;

  return (
    <Box maxWidth="1000px" margin="auto" p="4">
      {photos && photos.length > 0 && <ImageScrollbar data={photos} />}

      <Box w="full" p="6">
        <Flex paddingTop="2" alignItems="center">
          <Box paddingRight="3" color="green.400">{isVerified && <GoVerified />}</Box>
          <Text fontWeight="bold" fontSize="lg">
            {price ? `AED ${price}` : "Price N/A"} {rentFrequency && `/${rentFrequency}`}
          </Text>
          <Spacer />
          <Avatar size="sm" src={agency?.logo?.url}></Avatar>
        </Flex>

        <Flex alignItems="center" p="1" justifyContent="space-between" w="250px" color="blue.400">
          <Text>{rooms} <FaBed /></Text>
          <Text>{baths} <FaBath /></Text>
          <Text>{area ? millify(area) : "N/A"} sqft <BsGridFill /></Text>
        </Flex>
      </Box>

      <Box marginTop="2">
        <Text fontSize="lg" marginBottom="2" fontWeight="bold">{title}</Text>
        <Text lineHeight="2" color="gray.600">{description}</Text>
      </Box>

      <Flex flexWrap="wrap" textTransform="uppercase" justifyContent="space-between">
        <Flex justifyContent="space-between" w="400px" borderBottom="1px" borderColor="gray.100" p="3">
          <Text>Type</Text>
          <Text fontWeight="bold">{type}</Text>
        </Flex>
        <Flex justifyContent="space-between" w="400px" borderBottom="1px" borderColor="gray.100" p="3">
          <Text>Purpose</Text>
          <Text fontWeight="bold">{purpose}</Text>
        </Flex>
        {furnishingStatus && (
          <Flex justifyContent="space-between" w="400px" borderBottom="1px" borderColor="gray.100" p="3">
            <Text>Furnishing Status</Text>
            <Text fontWeight="bold">{furnishingStatus}</Text>
          </Flex>
        )}
      </Flex>

      <Box>
        {amenities && amenities.length > 0 && <Text fontSize="2xl" fontWeight="black" marginTop="5">Facilities:</Text>}
        <Flex flexWrap="wrap">
          {amenities?.map((group, gi) =>
            (group?.amenities || group?.items || group || []).map((amenity, ai) => {
              const text = amenity?.text || amenity?.name || amenity;
              return (
                <Text key={`amen-${gi}-${ai}`} fontWeight="bold" color="blue.400" fontSize="l" p="2" bg="gray.200" m="1" borderRadius="5">
                  {text}
                </Text>
              );
            })
          )}
        </Flex>
      </Box>
    </Box>
  );
};

export default PropertyDetails;

export async function getServerSideProps({ params, query }) {
  const { id } = params;
  const source = (query.source || "").toLowerCase(); // 'zoopla' or 'zillow'

  // attempt to import helper modules if present
  let fetchZooplaHelper = null;
  let fetchZillowHelper = null;
  try {
    fetchZooplaHelper = require("../../utils/fetchZoopla").fetchPropertyDetail;
  } catch (e) {}
  try {
    fetchZillowHelper = require("../../utils/fetchZillow").fetchPropertyDetail;
  } catch (e) {}

  try {
    // If source explicit:
    if (source === "zoopla") {
      // 1) try helper
      if (fetchZooplaHelper) {
        const raw = await fetchZooplaHelper(id);
        const normalized = normalizeZooplaDetail(raw || {});
        return { props: { propertyDetails: normalized } };
      }

      // 2) fallback: try listing endpoint pages to find the item with listingId === id
      const perPage = 50;
      const maxPages = 5;
      for (let page = 1; page <= maxPages; page++) {
        const res = await axios.get("https://zoopla.p.rapidapi.com/properties/v2/list", {
          params: { page, section: "for-sale", locationValue: "London" },
          headers: {
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY_ZOOPLA,
            "x-rapidapi-host": "zoopla.p.rapidapi.com",
          },
        }).catch(() => ({ data: null }));
        const data = res.data;
        const rawList = [
          ...(data?.data?.listings?.regular || []),
          ...(data?.data?.listings?.featured || []),
          ...(data?.data?.listings?.extended || []),
        ];
        const found = rawList.find((r) => String(r.listingId || r.listing_id) === String(id));
        if (found) {
          const normalized = normalizeZooplaDetail(found);
          return { props: { propertyDetails: normalized } };
        }
      }

      // not found
      return { props: { propertyDetails: null } };
    }

    if (source === "zillow") {
      // 1) try helper
      if (fetchZillowHelper) {
        const raw = await fetchZillowHelper(id);
        const normalized = normalizeZillowDetail(raw || {});
        return { props: { propertyDetails: normalized } };
      }

      // 2) fallback: search via RapidAPI listing pages and find by zpid/id
      const perPage = 50;
      const maxPages = 5;
      for (let page = 1; page <= maxPages; page++) {
        const res = await axios.get("https://zillow69.p.rapidapi.com/search", {
          params: { location: "Houston, TX", page },
          headers: {
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY_ZILLOW,
            "x-rapidapi-host": "zillow69.p.rapidapi.com",
          },
        }).catch(() => ({ data: null }));
        const rawResults = res.data?.props || res.data?.results || res.data?.data || res.data || [];
        const found = rawResults.find((r) => String(r.zpid || r.id) === String(id));
        if (found) {
          const normalized = normalizeZillowDetail(found);
          return { props: { propertyDetails: normalized } };
        }
      }

      return { props: { propertyDetails: null } };
    }

    // If source not provided, try to guess from id prefix:
    if (String(id).startsWith("zoopla") || String(id).includes("zp")) {
      return await getServerSideProps({ params, query: { ...query, source: "zoopla" } });
    } else if (String(id).startsWith("zillow") || String(id).startsWith("zpid") || String(id).includes("z")) {
      return await getServerSideProps({ params, query: { ...query, source: "zillow" } });
    }

    // final fallback: try zoopla then zillow
    const tryZoopla = await (async () => {
      const res = await axios.get("https://zoopla.p.rapidapi.com/properties/v2/list", {
        params: { page: 1, section: "for-sale", locationValue: "London" },
        headers: {
          "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY_ZOOPLA,
          "x-rapidapi-host": "zoopla.p.rapidapi.com",
        },
      }).catch(() => ({ data: null }));
      const rawList = [
        ...(res.data?.data?.listings?.regular || []),
        ...(res.data?.data?.listings?.featured || []),
      ];
      const found = rawList.find((r) => String(r.listingId || r.listing_id) === String(id));
      if (found) return normalizeZooplaDetail(found);
      return null;
    })();

    if (tryZoopla) return { props: { propertyDetails: tryZoopla } };

    const tryZillow = await (async () => {
      const res = await axios.get("https://zillow69.p.rapidapi.com/search", {
        params: { location: "Houston, TX", page: 1 },
        headers: {
          "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY_ZILLOW,
          "x-rapidapi-host": "zillow69.p.rapidapi.com",
        },
      }).catch(() => ({ data: null }));
      const rawResults = res.data?.props || res.data?.results || res.data?.data || res.data || [];
      const found = rawResults.find((r) => String(r.zpid || r.id) === String(id));
      if (found) return normalizeZillowDetail(found);
      return null;
    })();

    if (tryZillow) return { props: { propertyDetails: tryZillow } };

    return { props: { propertyDetails: null } };
  } catch (err) {
    console.error("Property detail fetch error", err);
    return { props: { propertyDetails: null } };
  }
}
