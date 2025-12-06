// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
    name="description"
    content="Evergreen Estate – Real estate listings, property buying & selling, premium homes and apartments."
  />
        <meta name="msvalidate.01" content="429BBDF5430000024ECA3FABBBC0E793" />
        <meta name="google-site-verification" content="e3jR08NOIOKT2rBvxqFo8HtBc32vbGE7izDwhPkydWg" />

<link rel="icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
<link rel="apple-touch-icon" sizes="192x192" href="/favicon-192x192.png" />

        {/* Fonts, favicons, or other head tags */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
