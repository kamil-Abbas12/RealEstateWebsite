import Head from "next/head";
import { Box } from "@chakra-ui/react";
import { Navbar } from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => (
  <div style={{ backgroundColor: "green.800" }}>
    <Head>

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Default Meta */}
      <meta
        name="description"
        content="Evergreen Estate Glob — explore properties for sale and rent worldwide."
      />

      <meta property="og:locale" content="en_US" />
    </Head>

    <Box maxWidth="100%" marginTop="0">
      <header>
        <Navbar />
      </header>
      <main>{children}</main>
      <footer>
        <Footer />
      </footer>
    </Box>
  </div>
);

export default Layout;
