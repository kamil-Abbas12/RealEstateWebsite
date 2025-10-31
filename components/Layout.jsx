import Head from "next/head";
import { Box } from "@chakra-ui/react";
import { Navbar } from "./Navbar";
import Footer from "./Footer";

const Layout = ({children}) => (
    <div backgroundColor="green.800">
    <Head>

    <title>
        Real Estate 
    </title>
    </Head>
    <Box maxWidth="100%" marginTop='0' >
<header >
    <Navbar/>
</header>
<main>
    {children}
</main>
<footer>
    <Footer/>
</footer>
    </Box>
    </div>
)

export default Layout;