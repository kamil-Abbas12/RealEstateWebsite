import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("realestate");

    // Fetch all properties
    const properties = await db.collection("properties").find().toArray();

    // Base URL
    const baseUrl = "https://evergreenestateglob.com";

    // Static pages
    const staticPages = [
      "",
      "/listings",
      "/add-property",
      "/properties",
            "/blog",
      "/blog/grid",
      "/blog/list",
      "/login"
    ];

    let urls = "";

    // Add static pages
    staticPages.forEach((page) => {
      urls += `
        <url>
          <loc>${baseUrl}${page}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>`;
    });

    // Add dynamic property pages
    properties.forEach((p) => {
      urls += `
        <url>
          <loc>${baseUrl}/property/${p._id}</loc>
          <lastmod>${new Date(p.updatedAt || p.createdAt).toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>1.0</priority>
        </url>`;
    });

    // Produce XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls}
      </urlset>`;

    res.setHeader("Content-Type", "text/xml");
    res.write(xml);
    res.end();
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    res.status(500).json({ error: "Failed to generate sitemap" });
  }
}
