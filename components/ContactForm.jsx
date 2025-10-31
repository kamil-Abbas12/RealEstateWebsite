"use client";

import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Heading,
  Image,
} from "@chakra-ui/react";

export default function ContactForm() {
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      align="center"
      justify="center"
      w="100%"
      bg="white"
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="md"
    >
      {/* Left: Form Section */}
      <Box
        flex="1"
        p={{ base: 6, md: 10 }}
        bg="white"
        w="100%"
        color="gray.800"
      >
        <VStack spacing={6} align="center" textAlign="center">
          <Heading fontSize={{ base: "2xl", md: "3xl" }} color="green.800">
            Get in Touch
          </Heading>

          <FormControl id="name" isRequired>
            <FormLabel>Name</FormLabel>
            <Input placeholder="Enter your name" />
          </FormControl>

          <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" placeholder="Enter your email" />
          </FormControl>

          <FormControl id="subject">
            <FormLabel>Subject</FormLabel>
            <Input placeholder="Subject" />
          </FormControl>

          <Button
            mt={4}
            w="full"
            colorScheme="green"
            bg="green.800"
            color="white"
            _hover={{ bg: "green.700" }}
          >
            Submit
          </Button>
        </VStack>
      </Box>

      {/* Right: Image Section (hidden on small devices) */}
      <Box flex="1" display={{ base: "none", md: "block" }} h="100%">
        <Image
          src="/contact.jpg"
          alt="Contact"
          objectFit="cover"
          w="100%"
          h="100%"
        />
      </Box>
    </Flex>
  );
}
