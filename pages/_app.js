// pages/_app.js
import { ChakraProvider, defaultSystem,Box,Spinner } from '@chakra-ui/react'
import nProgress from 'nprogress'
import Router, { useRouter } from 'next/router'
import Head from 'next/head'
import "leaflet/dist/leaflet.css";
import ScrollToTop from "@/components/ScrollToTop"; // import the button

import Layout from "../components/Layout"
import { useEffect, useState } from 'react';
function MyApp({ Component, pageProps }) {
    const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    router.events.on("routeChangeStart", () => setLoading(true));
    router.events.on("routeChangeComplete", () => setLoading(false));
    router.events.on("routeChangeError", () => setLoading(false));
    return () => {
      router.events.off("routeChangeStart", () => setLoading(true));
      router.events.off("routeChangeComplete", () => setLoading(false));
      router.events.off("routeChangeError", () => setLoading(false));
    };
  }, [router.events]);
  return (
   <>
   <Head>

   </Head>
   
   <ChakraProvider value={defaultSystem} >
          <Box minH="100vh" bg="green.800" color="white">

    <Layout >
      
      <Component {...pageProps} />
       <ScrollToTop />
    </Layout>
    </Box>
    </ChakraProvider>
   </>
  )
}

export default MyApp
