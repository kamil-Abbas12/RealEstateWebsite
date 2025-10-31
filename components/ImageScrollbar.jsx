// components/ImageScrollbar.jsx
import React, { useContext } from "react";
import Image from "next/image";
import { Box, Icon, Flex } from "@chakra-ui/react";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";

/**
 * Robust ImageScrollbar:
 * - Accepts data: array of strings or objects.
 * - Tries many common fields to extract a usable URL.
 * - Uses next/image with `unoptimized` for dev (no domain config needed).
 */

const LeftArrow = () => {
  const { scrollPrev } = useContext(VisibilityContext);
  return (
    <Flex justifyContent="center" alignItems="center" marginRight="1">
      <Icon as={FaArrowAltCircleLeft} onClick={() => scrollPrev()} fontSize="2xl" cursor="pointer" display={["none","none","none","block"]} />
    </Flex>
  );
};

const RightArrow = () => {
  const { scrollNext } = useContext(VisibilityContext);
  return (
    <Flex justifyContent="center" alignItems="center" marginLeft="1">
      <Icon as={FaArrowAltCircleRight} onClick={() => scrollNext()} fontSize="2xl" cursor="pointer" display={["none","none","none","block"]} />
    </Flex>
  );
};

const extractUrl = (item) => {
  if (!item) return null;
  if (typeof item === "string") return item;
  // check many common fields used by zoopla/zillow and various wrappers
  const candidates = [
    item.url,
    item.src,
    item.imgSrc,
    item.image,
    item.image_url,
    item.link,
    item.href,
    item.original,
    item.photoUrl,
    item.uri,
    item.path,
  ];
  for (const c of candidates) {
    if (c && typeof c === "string" && c.trim()) return c;
  }
  // if item is object with nested sizes (like { images: [{ url }] })
  if (Array.isArray(item.images) && item.images.length) {
    return extractUrl(item.images[0]);
  }
  if (Array.isArray(item.photos) && item.photos.length) {
    return extractUrl(item.photos[0]);
  }
  if (Array.isArray(item.carouselPhotos) && item.carouselPhotos.length) {
    return extractUrl(item.carouselPhotos[0]);
  }
  // fallback: object values that look like urls
  const vals = Object.values(item).map(String);
  const maybe = vals.find(v => v && (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("//")));
  return maybe || null;
};

export default function ImageScrollbar({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  const items = data.map((d, i) => {
    const url = extractUrl(d);
    return { id: (d && (d.id || d.photo_id || d.listing_id)) || `img-${i}`, url };
  }).filter(it => it.url);

  if (items.length === 0) return null;

  return (
    <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow} style={{ overflow: "hidden" }}>
      {items.map((item) => (
        <Box key={String(item.id)} itemId={String(item.id)} overflow="hidden" p="1" width={["280px","360px","720px","910px"]}>
          <Box position="relative" width="100%" height={["180px","220px","360px"]} borderRadius="md" overflow="hidden" bg="gray.50">
            <Image
              src={item.url}
              alt={`property-${item.id}`}
              fill
              style={{ objectFit: "cover" }}
              unoptimized // avoids next.config image domain requirement during development
              priority={false}
            />
          </Box>
        </Box>
      ))}
    </ScrollMenu>
  );
}
