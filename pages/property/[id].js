// pages/property/[id].js
import React, { useState } from "react";
import {
  Box,
  Flex,
  Spacer,
  Text,
  Avatar,
  Image,
  Grid,
  GridItem,
  Stack,
  HStack,
  VStack,
  Button,
  Heading,
  Badge,
  Divider,
} from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";

import { FaBed, FaBath } from "react-icons/fa";
import { BsGridFill } from "react-icons/bs";
import { GoVerified } from "react-icons/go";
import millify from "millify";
import axios from "axios";

import ImageScrollbar from "../../components/ImageScrollbar";

// ADDED: mongodb imports (safe, minimal)
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

const serializeDates = (obj) => {
  const copy = { ...obj };
  for (const key in copy) {
    if (copy[key] instanceof Date) {
      copy[key] = copy[key].toISOString();
    }
  }
  return copy;
};

const parsePriceFromLabel = (label) => {
  if (!label) return null;
  const cleaned = String(label).replace(/[^0-9.]/g, "");
  return cleaned === "" ? null : Number(cleaned);
};

// ==== Normalizers (unchanged) ====
const normalizeZooplaDetail = (raw) => {
  const pricing = raw.pricing || {};
  const price = pricing.value ?? parsePriceFromLabel(pricing.label) ?? raw.price ?? null;

  const photos =
    raw.images ||
    raw.imageUris ||
    raw.media ||
    raw.photos ||
    raw.photos_list ||
    raw.gallery ||
    [];

  const mappedPhotos = Array.isArray(photos)
    ? photos
        .map((p, i) => {
          if (!p) return null;
          if (typeof p === "string") return { id: `photo-${i}`, url: p };
          return { id: p.id || p.photo_id || p.uri || i, url: p.url || p.src || p.href || p.link || p.original || null };
        })
        .filter(Boolean)
    : [];

  return {
    price,
    rentFrequency: raw.rentFrequency || raw.frequency || null,
    rooms: raw.attributes?.bedrooms ?? raw.num_bedrooms ?? raw.bedrooms ?? null,
    title: raw.title || raw.displayTitle || raw.shortDescription || "",
    baths: raw.attributes?.bathrooms ?? raw.num_bedrooms ?? raw.baths ?? null,
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
  const price = raw.price ?? raw.zestimate ?? null;

  const photos = raw.images || raw.imgSrc || raw.carouselPhotos || raw.photos || [];
  const mappedPhotos = Array.isArray(photos)
    ? photos
        .map((p, i) => {
          if (!p) return null;
          if (typeof p === "string") return { id: `photo-${i}`, url: p };
          return { id: p.id || p.photoId || i, url: p.url || p.src || p.imgSrc || null };
        })
        .filter(Boolean)
    : [];

  return {
    price,
    rentFrequency: raw.rentFrequency || null,
    rooms: raw.bedrooms ?? raw.bedroomsCount ?? null,
    title: raw.title || raw.propertyType || raw.shortDesc || "",
    baths: (raw.bathrooms ?? raw.bathroomsCount) || null,
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

// ==== Component UI ====
const PropertyDetails = ({ propertyDetails }) => {
  
  const { isOpen: isPlanOpen, onOpen: onPlanOpen, onClose: onPlanClose } = useDisclosure();
  const { isOpen: isOwnerOpen, onOpen: onOwnerOpen, onClose: onOwnerClose } = useDisclosure();
  const { isOpen: isGalleryOpen, onOpen: onGalleryOpen, onClose: onGalleryClose } = useDisclosure();

  // Form states
  const [planName, setPlanName] = useState("");
  const [planEmail, setPlanEmail] = useState("");
  const [planMessage, setPlanMessage] = useState("");
  const [buyerInfo, setBuyerInfo] = useState({ name: "", email: "", phone: "" });

  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerMessage, setOwnerMessage] = useState("");

  const {
    price,
    rentFrequency,
    rooms,
    title,
    baths,
    area,
    agency,
    isVerified,
    description,
    type,
    purpose,
    furnishingStatus,
    amenities,
    photos,
    raw,
  } = propertyDetails;

  const gallery = Array.isArray(photos) ? photos : [];
  const [selected, setSelected] = useState(0);

  const toast = useToast();

  if (!propertyDetails) {
    return (
      <Box p="8">
        <Text>Property not found.</Text>
      </Box>
    );
  }

  // ---------- NEW: handlers that prefer direct owner contact when available ----------
  const handlePlanClick = () => {
    // If owner allowed direct contact and provided email (or phone), show their contact info directly
    if (raw?.allowDirectContact && (raw.ownerContactEmail || raw.ownerContactPhone)) {
      setBuyerInfo({
        name: raw.ownerContactName || "Property Owner",
        email: raw.ownerContactEmail || "",
        phone: raw.ownerContactPhone || "",
      });

      toast({
        title: "Owner contact available",
        description: "Owner contact information has been revealed below. You can email or call them directly.",
        status: "success",
        duration: 4500,
        isClosable: true,
      });

      // scroll into view for user convenience
      if (typeof window !== "undefined") {
        setTimeout(() => {
          const el = document.getElementById("owner-contact-card");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 120);
      }

      return; // do not open the "request plan" form modal
    }

    // fallback to existing flow (open request plan modal)
    onPlanOpen();
  };

  const handleOwnerClick = () => {
    if (raw?.allowDirectContact && (raw.ownerContactEmail || raw.ownerContactPhone)) {
      setBuyerInfo({
        name: raw.ownerContactName || "Property Owner",
        email: raw.ownerContactEmail || "",
        phone: raw.ownerContactPhone || "",
      });

      toast({
        title: "Owner contact available",
        description: "Owner contact information has been revealed below. You can email or call them directly.",
        status: "success",
        duration: 4500,
        isClosable: true,
      });

      if (typeof window !== "undefined") {
        setTimeout(() => {
          const el = document.getElementById("owner-contact-card");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 120);
      }

      return; // do not open the "contact owner" form modal
    }

    // fallback: open the existing owner contact modal (the current messaging form)
    onOwnerOpen();
  };

  // ---------- existing handlers (unchanged) ----------
  const handlePlanSubmit = async () => {
    if (!planName || !planEmail || !planMessage) {
      toast({ title: "Error", description: "Please fill all fields", status: "error", duration: 5000, isClosable: true });
      return;
    }
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.SMTP_USER,
          subject: `Plan Request from ${planName}`,
          html: `<p><strong>Name:</strong> ${planName}</p><p><strong>Email:</strong> ${planEmail}</p><p><strong>Message:</strong> ${planMessage}</p>`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Request sent!", description: "We will contact you shortly.", status: "success", duration: 5000, isClosable: true });
        setPlanName(""); setPlanEmail(""); setPlanMessage("");
        onPlanClose();
      } else throw new Error(data.error || "Failed to send email");
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleOwnerSubmit = async () => {
    if (!ownerName || !ownerEmail || !ownerMessage) {
      toast({ title: "Error", description: "Please fill all fields", status: "error", duration: 5000, isClosable: true });
      return;
    }

    // Check if owner allows direct contact
    if (!raw?.allowDirectContact) {
      toast({
        title: "Contact Not Available",
        description: "Owner has not provided contact information",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: raw.ownerContactEmail || process.env.SMTP_USER,
          subject: `Property Inquiry from ${ownerName}`,
          html: `
            <h3>New Property Inquiry</h3>
            <p><strong>Property:</strong> ${title}</p>
            <p><strong>Buyer Name:</strong> ${ownerName}</p>
            <p><strong>Buyer Email:</strong> ${ownerEmail}</p>
            <p><strong>Message:</strong></p>
            <p>${ownerMessage}</p>
          `,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Show buyer the owner's contact info
        setBuyerInfo({
          name: raw.ownerContactName || "Property Owner",
          email: raw.ownerContactEmail || "",
          phone: raw.ownerContactPhone || "",
        });

        toast({
          title: "Message sent!",
          description: "Owner contact information is displayed below",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setOwnerName("");
        setOwnerEmail("");
        setOwnerMessage("");
        onOwnerClose();
      } else throw new Error(data.error || "Failed to send email");
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error", duration: 5000, isClosable: true });
    }
  };

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      <Grid templateColumns={{ base: "1fr", lg: "3fr 1fr" }} gap={6}>
        {/* Left: gallery + details */}
        <Box>
          {/* Gallery grid: main image + vertical thumbnails on right */}
          <Grid templateColumns={{ base: "1fr", md: "3fr 1fr" }} gap={3} alignItems="start">
            <Box borderRadius="md" overflow="hidden" bg="gray.100">
              {gallery[selected] ? (
                <Image src={gallery[selected].url} alt={`photo-${selected}`} objectFit="cover" w="100%" h={{ base: "300px", md: "520px" }} />
              ) : (
                <Box h={{ base: "300px", md: "520px" }} display="flex" alignItems="center" justifyContent="center">
                  <Text>No images</Text>
                </Box>
              )}
            </Box>

            {/* Thumbnails */}
            <VStack spacing={3} align="stretch">
              {gallery.slice(0, 6).map((p, i) => (
                <Box
                  key={p.id || i}
                  borderRadius="md"
                  overflow="hidden"
                  cursor="pointer"
                  border={i === selected ? "2px solid" : "1px solid"}
                  borderColor={i === selected ? "blue.400" : "gray.200"}
                  onClick={() => setSelected(i)}
                >
                  <Image src={p.url} alt={`thumb-${i}`} objectFit="cover" w="100%" h="84px" />
                </Box>
              ))}

              {gallery.length > 6 && (
                <Button variant="outline" size="sm" onClick={onGalleryOpen}>
                  See all {gallery.length} photos
                </Button>
              )}
            </VStack>
          </Grid>

          {/* Title / price / address / stats */}
          <Box mt={6}>
            <HStack justify="space-between" align="start">
              <Box>
                <Heading size="lg" mb={2}>
                  {price ? `USD ${price.toLocaleString()}` : "Price N/A"}
                </Heading>
                {raw?.address && <Text color="gray.600">{raw.address}</Text>}
              </Box>

              <HStack spacing={6} align="center">
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold">{rooms ?? "-"}</Text>
                  <Text fontSize="sm" color="gray.500">beds</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold">{baths ?? "-"}</Text>
                  <Text fontSize="sm" color="gray.500">baths</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold">{area ? millify(area) : "-"}</Text>
                  <Text fontSize="sm" color="gray.500">sqft</Text>
                </Box>
              </HStack>
            </HStack>

            <HStack mt={4} spacing={3}>
              {isVerified && (
                <Badge colorScheme="green" display="inline-flex" alignItems="center">
                  <GoVerified style={{ marginRight: 6 }} /> Verified
                </Badge>
              )}
              {agency?.logo?.url && <Avatar size="sm" src={agency.logo.url} />}
              {furnishingStatus && <Badge>{furnishingStatus}</Badge>}
            </HStack>
          </Box>

          <Divider my={6} />

          <Box>
            <Heading size="md" mb={2}>Overview</Heading>
            <Text color="gray.700" lineHeight="1.8">{description || "No description available."}</Text>
          </Box>

          <Divider my={6} />

          {/* Property metadata */}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <Box>
              <Text fontSize="sm" color="gray.500">Type</Text>
              <Text fontWeight="bold">{type || "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.500">Purpose</Text>
              <Text fontWeight="bold">{purpose || "-"}</Text>
            </Box>
            {furnishingStatus && (
              <Box>
                <Text fontSize="sm" color="gray.500">Furnishing</Text>
                <Text fontWeight="bold">{furnishingStatus}</Text>
              </Box>
            )}
          </Grid>

          {/* Amenities / Facilities */}
          {amenities && amenities.length > 0 && (
            <>
              <Heading size="md" mt={6} mb={3}>Facilities</Heading>
              <Flex wrap="wrap" gap={2}>
                {amenities?.map((group, gi) => {
                  const items = Array.isArray(group?.amenities)
                    ? group.amenities
                    : Array.isArray(group?.items)
                    ? group.items
                    : Array.isArray(group)
                    ? group
                    : [group];

                  return items.map((amenity, ai) => {
                    const text = amenity?.text || amenity?.name || amenity;
                    return (
                      <Box key={`amen-${gi}-${ai}`} px={3} py={1} bg="gray.100" borderRadius="md" fontWeight="semibold" color="blue.600" m={1}>
                        {text}
                      </Box>
                    );
                  });
                })}
              </Flex>
            </>
          )}
        </Box>

        {/* Right: action card (like Request a tour / Contact agent) */}
        <VStack spacing={4} position="relative" top={{ base: 0, md: 20 }}>
          <Box borderWidth="1px" borderRadius="md" p={4} boxShadow="sm" bg="white" w="full">
            <Text fontSize="sm" color="gray.500">Request a plan</Text>
            <Heading size="sm" mt={2}>as early as today at 9:00 am</Heading>
            <Button colorScheme="green" size="lg" mt={4} width="100%" onClick={handlePlanClick}>Request a plan</Button>
            <Button variant="outline" size="md" mt={3} width="100%" onClick={handleOwnerClick}>Contact Owner</Button>
          </Box>

          {/* Buyer Info Display - Shows after successful contact or when owner contact is revealed */}
          {buyerInfo.email && (
            <Box id="owner-contact-card" p={4} borderWidth="1px" borderRadius="md" bg="green.50" borderColor="green.200" w="full">
              <Heading size="sm" mb={3} color="green.700">Owner Contact Information</Heading>
              <VStack align="start" spacing={2}>
                <Text><strong>Name:</strong> {buyerInfo.name}</Text>
                <Text><strong>Email:</strong> {buyerInfo.email}</Text>
                <Text><strong>Phone:</strong> {buyerInfo.phone}</Text>
                <HStack pt={2}>
                  {buyerInfo.email && (
                    <Button size="sm" as="a" href={`mailto:${buyerInfo.email}`} target="_blank">Email Owner</Button>
                  )}
                  {buyerInfo.phone && (
                    <Button size="sm" as="a" href={`tel:${buyerInfo.phone}`}>Call Owner</Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => { setBuyerInfo({ name: "", email: "", phone: "" }); }}>Hide</Button>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Additional quick details card */}
          <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50" w="full">
            <VStack align="start" spacing={3}>
              <HStack>
                <Box>
                  <Text fontSize="sm" color="gray.500">Built</Text>
                  <Text fontWeight="bold">{raw?.yearBuilt || "-"}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">Lot</Text>
                  <Text fontWeight="bold">{raw?.lotSize || "-"}</Text>
                </Box>
              </HStack>
              <Box>
                <Text fontSize="sm" color="gray.500">Parking</Text>
                <Text fontWeight="bold">{raw?.parking ? "Yes" : "No"}</Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Grid>

      {/* Modals */}
      {/* <Modal isOpen={isPlanOpen} onClose={onPlanClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request a Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}><FormLabel>Name</FormLabel><Input value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="Your Name" /></FormControl>
            <FormControl mb={3}><FormLabel>Email</FormLabel><Input value={planEmail} onChange={(e) => setPlanEmail(e.target.value)} placeholder="Your Email" /></FormControl>
            <FormControl><FormLabel>Message</FormLabel><Textarea value={planMessage} onChange={(e) => setPlanMessage(e.target.value)} placeholder="Your message" /></FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handlePlanSubmit}>Send Request</Button>
            <Button variant="ghost" onClick={onPlanClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOwnerOpen} onClose={onOwnerClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Contact Owner</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}><FormLabel>Name</FormLabel><Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Your Name" /></FormControl>
            <FormControl mb={3}><FormLabel>Email</FormLabel><Input value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="Your Email" /></FormControl>
            <FormControl><FormLabel>Message</FormLabel><Textarea value={ownerMessage} onChange={(e) => setOwnerMessage(e.target.value)} placeholder="Your message" /></FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleOwnerSubmit}>Send Message</Button>
            <Button variant="ghost" onClick={onOwnerClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal> */}

      <Modal isOpen={isGalleryOpen} onClose={onGalleryClose} size="full">
        <ModalOverlay />
        <ModalContent bg="black">
          <ModalCloseButton color="white" />
          <ModalBody p={4}>
            <Grid 
              templateColumns={{
                base: "1fr",
                md: "repeat(3, 1fr)",
              }} 
              gap={4}
            >
              {gallery.map((img, i) => (
                <Box key={i} borderRadius="md" overflow="hidden">
                  <Image 
                    src={img.url} 
                    alt={`photo-${i}`} 
                    objectFit="cover" 
                    w="100%" 
                    h="250px"
                  />
                </Box>
              ))}
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PropertyDetails;


/* ------------------------------------------------------------------------
  getServerSideProps (UNCHANGED logic) — your MongoDB lookup + Zoopla/Zillow fallbacks
  I left the code below intact except ensuring serialization of ObjectId and Date fields
------------------------------------------------------------------------- */

export async function getServerSideProps({ params, query }) {
  const { id } = params;
  const source = (query.source || "").toLowerCase(); // 'zoopla' or 'zillow'

  // try MongoDB first (non-destructive — will not affect your Zoopla/Zillow flows)
  try {
    const client = await clientPromise;
    const db = client.db("realestate");

    let propertyFromDB = null;

    // 1) try as ObjectId
    try {
      propertyFromDB = await db.collection("properties").findOne({ _id: new ObjectId(id) });
    } catch (e) {
      // invalid ObjectId - ignore and try string match below
    }

    // 2) try as string _id (some setups store string ids)
    if (!propertyFromDB) {
      propertyFromDB =
        (await db.collection("properties").findOne({ _id: id })) ||
        (await db.collection("properties").findOne({ propertyId: id })) ||
        null;
    }

    if (propertyFromDB) {
      const normalized = {
        price: propertyFromDB.price,
        rentFrequency: null,
        rooms: propertyFromDB.bedrooms,
        title: propertyFromDB.title,
        baths: propertyFromDB.bathrooms,
        area: propertyFromDB.area,
        agency: { logo: { url: propertyFromDB.agencyLogo || null } },
        isVerified: true,
        description: propertyFromDB.description || "",
        type: propertyFromDB.propertyType || null,
        purpose: propertyFromDB.listingType || null,
        furnishingStatus: propertyFromDB.furnished ? "Furnished" : "Unfurnished",
        amenities: propertyFromDB.amenities || [],
        photos: Array.isArray(propertyFromDB.images)
          ? propertyFromDB.images.map((url, i) => ({ id: `photo-${i}`, url }))
          : [],
        raw: serializeDates({
          ...propertyFromDB,
          _id: propertyFromDB._id.toString(), // ObjectId → string
        }),
      };

      return { props: { propertyDetails: normalized } };
    }
  } catch (err) {
    // console.error("MongoDB lookup failed (non-fatal):", err);
    // continue to zoopla/zillow fallbacks below
  }

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
      if (fetchZooplaHelper) {
        const raw = await fetchZooplaHelper(id);
        const normalized = normalizeZooplaDetail(raw || {});
        return { props: { propertyDetails: normalized } };
      }

      const perPage = 50;
      const maxPages = 5;
      for (let page = 1; page <= maxPages; page++) {
        const res = await axios
          .get("https://zoopla.p.rapidapi.com/properties/v2/list", {
            params: { page, section: "for-sale", locationValue: "London" },
            headers: {
              "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY_ZOOPLA,
              "x-rapidapi-host": "zoopla.p.rapidapi.com",
            },
          })
          .catch(() => ({ data: null }));
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

      return { props: { propertyDetails: null } };
    }

    if (source === "zillow") {
      if (fetchZillowHelper) {
        const raw = await fetchZillowHelper(id);
        const normalized = normalizeZillowDetail(raw || {});
        return { props: { propertyDetails: normalized } };
      }

      const perPage = 50;
      const maxPages = 5;
      for (let page = 1; page <= maxPages; page++) {
        const res = await axios
          .get("https://zillow69.p.rapidapi.com/search", {
            params: { location: "Houston, TX", page },
            headers: {
              "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY_ZILLOW,
              "x-rapidapi-host": "zillow69.p.rapidapi.com",
            },
          })
          .catch(() => ({ data: null }));
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
      const res = await axios
        .get("https://zoopla.p.rapidapi.com/properties/v2/list", {
          params: { page: 1, section: "for-sale", locationValue: "London" },
          headers: {
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY_ZOOPLA,
            "x-rapidapi-host": "zoopla.p.rapidapi.com",
          },
        })
        .catch(() => ({ data: null }));
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
      const res = await axios
        .get("https://zillow69.p.rapidapi.com/search", {
          params: { location: "Houston, TX", page: 1 },
          headers: {
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY_ZILLOW,
            "x-rapidapi-host": "zillow69.p.rapidapi.com",
          },
        })
        .catch(() => ({ data: null }));
      const rawResults = res.data?.props || res.data?.results || res.data?.data || res.data || [];
      const found = rawResults.find((r) => String(r.zpid || r.id) === String(id));
      if (found) return normalizeZillowDetail(found);
      return null;
    })();

    if (tryZillow) return { props: { propertyDetails: tryZillow } };

    return { props: { propertyDetails: null } };
  } catch (err) {
    // console.error("Property detail fetch error", err);
    return { props: { propertyDetails: null } };
  }
}
