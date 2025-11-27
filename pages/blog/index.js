"use client";
import React, { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Link,
  Image,
  SimpleGrid,
  Button,
  HStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import blogs from "../../data/blog";

export default function BlogList() {
  const itemsPerPage = 6; 
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(blogs.length / itemsPerPage);

  const startIndex = (page - 1) * itemsPerPage;
  const visibleBlogs = blogs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <Heading mb={8} textAlign="center">
        Latest Blog Posts
      </Heading>

      {/* GRID LAYOUT */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        {visibleBlogs.map((blog) => (
          <Box
            key={blog.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg="white"
            boxShadow="sm"
            transition="all 0.3s"
            _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
          >
            {/* IMAGE */}
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              h="180px"
              w="100%"
              objectFit="cover"
            />

            {/* CONTENT */}
            <Box p={5}>
              <Heading size="md" noOfLines={2}>
                {blog.title}
              </Heading>

              <Text mt={3} noOfLines={3} color="gray.600">
                {blog.excerpt}
              </Text>

              <Link
                as={NextLink}
                href={`/blog/${blog.slug}`}
                color="teal.500"
                fontWeight="bold"
                display="inline-block"
                mt={4}
              >
                Read More →
              </Link>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      {/* PAGINATION */}
      <HStack spacing={4} justify="center" mt={10}>
        <Button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          isDisabled={page === 1}
          variant="outline"
        >
          ←
        </Button>

        {[...Array(totalPages)].map((_, index) => (
          <Button
            key={index}
            onClick={() => setPage(index + 1)}
            bg={page === index + 1 ? "black" : "white"}
            color={page === index + 1 ? "white" : "black"}
            borderWidth="1px"
          >
            {index + 1}
          </Button>
        ))}

        <Button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          isDisabled={page === totalPages}
          variant="outline"
        >
          →
        </Button>
      </HStack>
    </Box>
  );
}
