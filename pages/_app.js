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
import Script from "next/script"; // <-- Add this
import "leaflet/dist/leaflet.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-807CYQCC8H"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-807CYQCC8H');
        `}
      </Script>

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
