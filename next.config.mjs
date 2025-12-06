/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  // --- Internationalization ---
  i18n: {
    locales: ["en", "fr", "es"],
    defaultLocale: "en",
  },

  // --- Image Optimization (add Cloudinary here) ---
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "photos.zillowstatic.com" },
      { protocol: "https", hostname: "lid.zoocdn.com" },
      { protocol: "https", hostname: "static.zoocdn.com" },
      { protocol: "https", hostname: "st.zoocdn.com" },
      { protocol: "https", hostname: "res.cloudinary.com" }, // ADD THIS
    ],
  },

  // --- Caching: Improve Lighthouse performance ---
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          },
        ],
      },
    ];
  },

  // --- Add Google Verification (optional but recommended) ---
  async rewrites() {
    return [
      {
        source: "/googlee3jR08NOIOKT2rBvxqFo8HtBc32vbGE7izDwhPkydWg.html",
        destination:
          "/api/google-site-verification?code=e3jR08NOIOKT2rBvxqFo8HtBc32vbGE7izDwhPkydWg",
      },
    ];
  },
};

export default nextConfig;
