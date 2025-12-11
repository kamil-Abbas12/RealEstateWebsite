import Head from "next/head";
import React from "react";
import { Box, Heading, Text, Image, Divider } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import blogs from "../../data/blog";

export default function BlogPost({ blog }) {
  if (!blog) return <Text p={6}>Blog not found.</Text>;

  return (
    <>
      {/* ✅ SEO Meta Tags */}
     <Head>
       <title>Blog Grid - Evergreen Estate Global</title>
  <meta name="description" content="Explore our latest real estate blogs in grid view." />
  <title>{blog.metaTitle || blog.title}</title>
  <meta
    name="description"
    content={blog.metaDescription || blog.excerpt}
  />
  <meta name="keywords" content={blog.keywords || ""} />

  {/* Open Graph */}
  <meta property="og:title" content={blog.metaTitle || blog.title} />
  <meta property="og:description" content={blog.metaDescription || blog.excerpt} />
  <meta property="og:image" content={blog.featuredImage} />

  {/* Canonical */}
 <link rel="canonical" href={`https://evergreenestateglob.com/blog/${blog.slug}`} />

</Head>


      <Box p={{ base: 4, md: 8 }} maxW="900px" mx="auto">
        <Heading mb={4}>{blog.title}</Heading>

        <Box mb={6} borderRadius="md" overflow="hidden">
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            width="100%"
            maxH="500px"
            objectFit="cover"
          />
        </Box>

        <Text color="gray.600" mb={4}>
          {blog.date} • {blog.author}
        </Text>

        {/* Markdown */}
        <Box sx={{ lineHeight: 1.7 }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: (props) => <Heading size="xl" mt={4} mb={4} {...props} />,
              h2: (props) => <Heading size="lg" mt={4} mb={3} {...props} />,
              h3: (props) => <Heading size="md" mt={3} mb={2} {...props} />,
              p: (props) => <Text mb={3} {...props} />,
              a: (props) => <Text as="a" color="teal.500" {...props} />,
              ul: (props) => <Box as="ul" pl={6} mb={3} {...props} />,
              ol: (props) => <Box as="ol" pl={6} mb={3} {...props} />,
              li: (props) => <Box as="li" mb={1} {...props} />,
              hr: (props) => <Divider my={6} {...props} />,
              img: (props) => (
                <Image mb={4} maxW="100%" src={props.src} alt={props.alt} />
              )
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </Box>
      </Box>
    </>
  );
}

/* ============================
   STATIC GENERATION (SEO BOOST)
   ============================ */
export async function getStaticPaths() {
  return {
    paths: blogs.map((blog) => ({
      params: { slug: blog.slug },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const blog = blogs.find((b) => b.slug === params.slug);

  return {
    props: {
      blog: blog || null,
    },
  };
}





