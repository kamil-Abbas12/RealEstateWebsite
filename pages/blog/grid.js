"use client";
import React, { useState } from "react";
import { SimpleGrid, Box, Image, Text, Heading, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import blogs from "../../data/blog";

export default function BlogGrid() {
  const itemsPerPage = 9;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(blogs.length / itemsPerPage);

  const startIndex = (page - 1) * itemsPerPage;
  const currentItems = blogs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Box p={6}>
      <Heading size="lg" mb={6} textAlign="center">
        Latest Blog Posts
      </Heading>

      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {currentItems.map((blog) => (
          <Box
            key={blog.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg="white"
            shadow="md"
            _hover={{ shadow: "lg", transform: "scale(1.02)" }}
            transition="0.2s"
          >
            <NextLink href={`/blog/${blog.slug}`}>
              <Image
                src={blog.featuredImage}
                alt={blog.title}
                w="100%"
                h="200px"
                objectFit="cover"
              />
            </NextLink>

            <Box p={4}>
              <Text fontSize="xs" color="gray.500">
                {blog.date}
              </Text>

              <NextLink href={`/blog/${blog.slug}`}>
                <Heading size="md" mt={2} mb={2} _hover={{ color: "blue.500" }}>
                  {blog.title}
                </Heading>
              </NextLink>

              <Text fontSize="sm" color="gray.600" noOfLines={3}>
                {blog.excerpt}
              </Text>

              {/* READ MORE BUTTON */}
              <NextLink href={`/blog/${blog.slug}`}>
                <Button
                  size="sm"
                  mt={4}
                  colorScheme="blue"
                  variant="outline"
                >
                  Read More →
                </Button>
              </NextLink>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      {/* PAGINATION */}
      <Box mt={8} display="flex" justifyContent="center" alignItems="center" gap={4}>
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>

        <Text fontWeight="bold">
          Page {page} of {totalPages}
        </Text>

        <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </Box>
    </Box>
  );
}
