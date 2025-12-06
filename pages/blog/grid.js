"use client";
import React, { useState } from "react";
import { SimpleGrid, Box, Image, Text, Heading, Link, HStack, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import blogs from "../../data/blog";
import Head from "next/head";

export default function BlogGrid() {
  const itemsPerPage = 9;
  const [page , setPage] = useState(1)
  const totalPages = Math.ceil(blogs.length/itemsPerPage);
  const startIndex = (page-1)*itemsPerPage;
  const visibleBlogs = blogs.slice(startIndex , startIndex+itemsPerPage);
  return (
    <>
Real Estate Blog – Insights & Market Trends

  <Box p={6}>
    <Heading mb={6}>Blog Grid</Heading>
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {visibleBlogs.map((blog) => (
        <article key={blog.id} aria-label={blog.title}>
          <Box
            borderWidth="1px"
            borderRadius="md"
            overflow="hidden"
            boxShadow="sm"
            transition="all 0.3s"
            _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
          >
            <Box position="relative" width="100%" height="200px">
              <Image
                src={blog.featuredImage}
                alt={blog.title}
                fill
                style={{ objectFit: "cover" }}
                placeholder="blur"
                blurDataURL="/placeholder.png"
              />
            </Box>

            <Box p={4}>
              <Heading size="md">{blog.title}</Heading>
              <Text mt={2}>{blog.excerpt}</Text>
              <Link
                as={NextLink}
                href={`/blog/${blog.slug}`}
                color="teal.500"
                mt={2}
                display="block"
              >
                Read More
              </Link>
            </Box>
          </Box>
        </article>
      ))}
    </SimpleGrid>

    {/* Pagination */}
    <HStack spacing={4} justify="center" mt="10">
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
</>
  );
}
