// pages/_app.js
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import Router from "next/router";
import nProgress from "nprogress";
import "nprogress/nprogress.css";
import Head from "next/head";
import Layout from "../components/Layout";
import ScrollToTop from "@/components/ScrollToTop";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

// Initialize nProgress
Router.events.on("routeChangeStart", () => nProgress.start());
Router.events.on("routeChangeComplete", () => nProgress.done());
Router.events.on("routeChangeError", () => nProgress.done());

// Custom theme (optional)
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
      },
    },
  },
});

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  // Prevent rendering issues (SSR)
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet/dist/leaflet.css");
    }
  }, []);

  return (
    <>
      <Head>
        <title>Real Estate Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <SessionProvider session={session}>
        <ChakraProvider theme={theme}>
          <Layout>
            <Component {...pageProps} />
            <ScrollToTop />
          </Layout>
        </ChakraProvider>
      </SessionProvider>
    </>
  );
}

export default MyApp;
