/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["en", "fr", "es"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "photos.zillowstatic.com" },
      { protocol: "https", hostname: "lid.zoocdn.com" },
      { protocol: "https", hostname: "static.zoocdn.com" },
      { protocol: "https", hostname: "st.zoocdn.com" },
    ],
  },
};

export default nextConfig;
