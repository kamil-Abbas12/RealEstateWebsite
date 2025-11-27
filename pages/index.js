// pages/index.js
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { Flex, Box, Text, Button, Center } from "@chakra-ui/react";
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
    <Box bg="green.800" minH="100vh" color="white">
      {/* Hero + Filters */}
      <Box position="relative">
        <HeroSection />
        <Center position="absolute" bottom="-5" justifySelf="center">
          <SearchFilters />
        </Center>
      </Box>

      {/* Property Carousel */}
      <Flex
        marginY={{ base: "30px", md: "60px" }}
        justify="center"
        alignItems="center"
        mx={{ base: "20px", md: "90px" }}
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
{/* <Box mx={{ base: 4, md: 12 }} my={{ base: 8, md: 16 }}>
  <ContactForm />
</Box>     */}
    </Box>
        </>
    
  );
};

export default Home;
