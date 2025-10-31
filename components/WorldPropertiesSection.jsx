"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Box, Flex, Heading, Text, Image, SimpleGrid } from "@chakra-ui/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";
import { useRouter } from "next/router";
import translations from "@/utils/translations";

// Dynamically import leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function ChangeView({ coords }) {
  const map = useMap();
  if (map) map.flyTo(coords, 13, { duration: 1.5 });
  return null;
}

export default function WorldPropertiesSection() {
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

const localizedProps =
  translations[locale]?.world?.properties ||
  translations.en.world?.properties ||
  [];
const properties = (localizedProps || []).map((p, i) => ({
  id: i + 1,
  ...p,
  image: [
    "https://photos.zillowstatic.com/fp/dd134a502ce1d4bc964012837c76646a-cc_ft_960.webp",
    "https://lid.zoocdn.com/645/430/7ee93b0e5cd440f922f4c722108877895395d610.jpg:p",
    "https://www.thetrainline.com/cms/media/1385/spain-madrid-plaza-mayor.jpg?mode=crop&width=860&height=574&quality=70",
    "https://photos.zillowstatic.com/fp/50284200b4082029e1336e1320f31730-p_e.webp",
  ][i],
  coords: [
    [41.8781, -87.6298],
    [51.5074, -0.1278],
    [40.4168, -3.7038],
    [40.7484, -73.9857],
  ][i],
}));


const [selected, setSelected] = useState(properties?.[0] || null);

  return (
    <Box bg="white" py={{ base: 6, md: 10 }} px={{ base: 4, md: 10 }}>
      <Box textAlign="center" mb={8}>
        <Heading fontSize={{ base: "2xl", md: "3xl" }} color="teal.700">
          {t("world.title")}
        </Heading>
        <Text color="gray.600" mt={2}>
          {t("world.subtitle")}
        </Text>
      </Box>

      <Flex
        direction={{ base: "column", lg: "row" }}
        align="flex-start"
        justify="center"
        gap={{ base: 8, lg: 12 }}
      >
        {/* Property Grid */}
        <Box flex="1">
          <SimpleGrid
            columns={{ base: 1, sm: 2 }}
            spacing={4}
            w="100%"
            justifyItems="center"
          >
            {properties.map((prop) => (
              <Box
                key={prop.id}
                cursor="pointer"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="md"
                transition="all 0.3s"
bg={selected?.id === prop.id ? "blue.600" : "green.800"}
                onClick={() => setSelected(prop)}
                _hover={{ transform: "scale(1.03)" }}
                w="100%"
              >
                <Image
                  src={prop.image}
                  alt={prop.city}
                  w="100%"
                  h="160px"
                  objectFit="cover"
                />
                <Box p={3}>
                  <Text fontWeight="bold" color="goldenrod">
                    {prop.city}
                  </Text>
                  <Text fontSize="sm" color="gray.300">
                    {prop.street}
                  </Text>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Map Section */}
        <Box
          flex="1"
          w="100%"
          h={{ base: "300px", md: "400px", lg: "450px" }}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
        >
       <MapContainer
  center={selected?.coords || [40.4168, -3.7038]} // fallback Madrid coords
  zoom={13}
  style={{ width: "100%", height: "100%" }}
  scrollWheelZoom={false}
>
  {selected && (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      />
      <Marker position={selected.coords}>
        <Popup>
          <b>{selected.city}</b>
          <br />
          {selected.street}
        </Popup>
      </Marker>
      <ChangeView coords={selected.coords} />
    </>
  )}
</MapContainer>

        </Box>
      </Flex>
    </Box>
  );
}
