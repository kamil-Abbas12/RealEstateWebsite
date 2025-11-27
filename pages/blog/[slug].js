"use client";
import React from "react";
import { useRouter } from "next/router";
import { Box, Heading, Text, Image, Divider } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import blogs from "../../data/blog";

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;

  const blog = blogs.find((b) => b.slug === slug);
  if (!blog) return <Text p={6}>Blog not found.</Text>;

  return (
    <Box p={{ base: 4, md: 8 }} maxW="900px" mx="auto">
      <Heading mb={4}>{blog.title}</Heading>

      {/* Featured image — constrain size and prevent layout shift */}
      <Box mb={6} borderRadius="md" overflow="hidden">
        <Image
          src={blog.featuredImage}
          alt={blog.title}
          width="100%"
          maxH="500px"
          objectFit="cover"
        />
      </Box>

      {/* Meta */}
      <Text color="gray.600" mb={4}>
        {blog.date} • {blog.author}
      </Text>

      {/* Render markdown content */}
      <Box className="blog-markdown" sx={{ lineHeight: 1.7 }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          // Map markdown elements to Chakra components
          components={{
            h1: ({node, ...props}) => <Heading as="h1" size="xl" mt={4} mb={4} {...props} />,
            h2: ({node, ...props}) => <Heading as="h2" size="lg" mt={4} mb={3} {...props} />,
            h3: ({node, ...props}) => <Heading as="h3" size="md" mt={3} mb={2} {...props} />,
            p: ({node, ...props}) => <Text mb={3} {...props} />,
            a: ({node, ...props}) => <Text as="a" color="teal.500" {...props} />,
            ul: ({node, ...props}) => <Box as="ul" pl={6} mb={3} {...props} />,
            ol: ({node, ...props}) => <Box as="ol" pl={6} mb={3} {...props} />,
            li: ({node, ...props}) => <Box as="li" mb={1} {...props} />,
            hr: ({node, ...props}) => <Divider my={6} {...props} />,
            strong: ({node, ...props}) => <Text as="strong" {...props} />,
            em: ({node, ...props}) => <Text as="em" {...props} />,
            // If your markdown contains images, this maps them to Chakra Image
            img: ({node, ...props}) => (
              <Image mb={4} maxW="100%" src={props.src} alt={props.alt || ""} />
            ),
          }}
        >
          {blog.content}
        </ReactMarkdown>
      </Box>
    </Box>
  );
}
