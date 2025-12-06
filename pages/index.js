// pages/index.js
import dynamic from "next/dynamic";
import Head from "next/head";
import { Flex, Box } from "@chakra-ui/react";
import SearchFilters from "@/components/SearchFilters";
import HeroSection from "@/components/HeroSection";
import PropertyCarousel from "@/components/PropertyCarousel";
import Services from "@/components/Services";

const WorldPropertiesSection = dynamic(
  () => import("../components/WorldPropertiesSection"),
  { ssr: false }
);

const Home = () => {
  return (
    <>
      <Head>
        {/* Primary SEO */}
        <title>Evergreen Estate Glob | Real Estate Buy, Sell & Rent</title>
        <meta
          name="description"
          content="Explore property listings worldwide with Evergreen Estate Glob. Buy, sell, or rent real estate with trusted agents, premium properties, and a seamless experience."
        />
        <meta
          name="keywords"
          content="real estate, buy home, sell property, rent house, real estate Pakistan, evergreen estate, global real estate"
        />
        <meta name="author" content="Evergreen Estate Glob" />

        {/* Canonical */}
        <link rel="canonical" href="https://evergreenestateglob.com/" />

        {/* OpenGraph */}
        <meta property="og:title" content="Evergreen Estate Glob" />
        <meta
          property="og:description"
          content="Find global property listings — buy, sell, and rent real estate with Evergreen Estate Glob."
        />
        <meta property="og:url" content="https://evergreenestateglob.com/" />
        <meta
          property="og:image"
          content="https://evergreenestateglob.com/favicon_512x512.png"
        />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Evergreen Estate Glob" />
        <meta
          name="twitter:description"
          content="Global real estate marketplace — explore listings, buy, sell and rent properties."
        />
        <meta
          name="twitter:image"
          content="https://evergreenestateglob.com/favicon_512x512.png"
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "Evergreen Estate Glob",
              url: "https://evergreenestateglob.com",
              logo: "https://evergreenestateglob.com/favicon_512x512.png",
              description:
                "Global platform for buying, selling, and renting real estate properties.",
              sameAs: [
                "https://www.facebook.com/",
                "https://www.instagram.com/",
                "https://twitter.com/",
              ],
            }),
          }}
        />
      </Head>

      <Box bg="green.800" minH="100vh" color="white">
        {/* Hero + Filters */}
        <Box position="relative">
          <HeroSection />
         <Box
  position="absolute"
  bottom="-5"
  left="50%"
  zIndex={{base:"150px", md:"1px"}}
  transform="translateX(-50%)"
  w="100%"
  display="flex"
  justifyContent="center"
>
  <SearchFilters />
</Box>

        </Box>

        {/* Property Carousel */}
        <Flex
          marginY={{ base: "30px", md: "60px" }}
          justify="center"
          alignItems="center"
          px={{ base: 0, md: 4 }}
        >
          <PropertyCarousel />
        </Flex>

        {/* World Properties */}
        <Box
          bg="white"
          color="black"
          px={{ base: 4, md: 12 }}
          py={{ base: 8, md: 16 }}
          borderRadius="2xl"
          mx={{ base: 2, md: 10 }}
          my={{ base: 10, md: 16 }}
        >
          <WorldPropertiesSection />
        </Box>

        <Box m={{ base: 4, md: 8 }}>
          <Services />
        </Box>
      </Box>
    </>
  );
};

export default Home;
