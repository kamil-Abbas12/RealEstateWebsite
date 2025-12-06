"use client";
import React, { useState, useMemo } from "react";
import Head from "next/head";

import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Button,
  Badge,
  HStack,
  VStack,
  Divider,
  Spacer,
  IconButton,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import blogs from "../../data/blog";

export default function BlogList() {
  // pagination
  const itemsPerPage = 6;
  const [page, setPage] = useState(1);

  // sort newest first
  const sorted = useMemo(
    () => [...blogs].sort((a, b) => new Date(b.date) - new Date(a.date)),
    []
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const startIndex = (page - 1) * itemsPerPage;
  const visible = sorted.slice(startIndex, startIndex + itemsPerPage);

  // small helper to estimate read time
  const readTime = (text = "") => {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  };

  return (
    <>
    <Head>
        <title>Real Estate Blog – Market Trends & Insights</title>
        <meta
          name="description"
          content="Read the latest blog posts on real estate market trends, property insights, and investment tips."
          />
        <link rel="canonical" href="https://evergreenestateglob.com/blog" />
      </Head>
    <Box p={{ base: 4, md: 10 }} maxW="1100px" mx="auto">
      <Heading mb={6} textAlign="center">
        Explore Our Latest Blog Posts
      </Heading>

      <VStack spacing={6} align="stretch">
        {visible.map((post) => (
          <Box
            key={post.id}
            bg="white"
            borderRadius="md"
            boxShadow="sm"
            overflow="hidden"
            transition="all 0.18s ease"
            _hover={{ boxShadow: "lg", transform: "translateY(-4px)" }}
          >
            <Flex direction={{ base: "column", md: "row" }}>
              {/* Left: Image */}
              <Box
                flex="0 0 320px"
                minW={{ base: "100%", md: "320px" }}
                maxW={{ base: "100%", md: "320px" }}
                h={{ base: "220px", md: "auto" }}
                position="relative"
                overflow="hidden"
              >
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  objectFit="cover"
                  width="100%"
                  height="100%"
                  fallbackSrc="/placeholder.png"
                />
              </Box>

              {/* Right: Content */}
              <Box p={5} flex="1">
                <Flex align="center" mb={2}>
                  <Badge colorScheme="green" variant="subtle" mr={3}>
                    Real Estate
                  </Badge>
                  <Text color="gray.500" fontSize="sm">
                    {post.date} • {post.author}
                  </Text>
                  <Spacer />
                  <Text color="gray.400" fontSize="sm">
                    {readTime(post.excerpt)} min read
                  </Text>
                </Flex>

                <Heading size="md" mb={3} noOfLines={2}>
                  {post.title}
                </Heading>

                <Text color="gray.600" noOfLines={3} mb={4}>
                  {post.excerpt}
                </Text>

                <Flex gap={3} align="center">
                  <NextLink href={`/blog/${post.slug}`} passHref>
                    <Button as="a" colorScheme="teal" size="sm">
                      Read More
                    </Button>
                  </NextLink>

                  <Button size="sm" variant="ghost">
                    Share
                  </Button>

                  <Spacer />

                  {/* tags / categories if you want */}
                  <HStack spacing={2}>
                    <Badge variant="outline">Market</Badge>
                    <Badge variant="outline">Trends</Badge>
                  </HStack>
                </Flex>
              </Box>
            </Flex>
          </Box>
        ))}
      </VStack>

      {/* Pagination */}
      <HStack spacing={3} justify="center" mt={8}>
        <IconButton
          aria-label="prev"
          icon={<ChevronLeftIcon />}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          isDisabled={page === 1}
          variant="outline"
          rounded="md"
        />

        {[...Array(totalPages)].map((_, i) => (
          <Button
          key={i}
            onClick={() => setPage(i + 1)}
            minW="44px"
            h="44px"
            borderRadius="8px"
            bg={page === i + 1 ? "black" : "white"}
            color={page === i + 1 ? "white" : "black"}
            border="1px solid"
            borderColor="gray.200"
            _hover={{ transform: "translateY(-2px)" }}
          >
            {i + 1}
          </Button>
        ))}

        <IconButton
          aria-label="next"
          icon={<ChevronRightIcon />}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          isDisabled={page === totalPages}
          variant="outline"
          rounded="md"
          />
      </HStack>
    </Box>
          </>
  );
}
