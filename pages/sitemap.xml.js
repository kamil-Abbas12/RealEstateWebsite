import clientPromise from "@/lib/mongodb";
import blogs from "@/data/blog";

export async function getServerSideProps({ res }) {
  try {
    const client = await clientPromise;
    const db = client.db("realestate");
    
    // Fetch all properties
    const properties = await db.collection("properties").find({}).toArray();
    
    const baseUrl = "https://evergreenestateglob.com";
    
    // Static pages with priorities
    const staticPages = [
      { url: "", priority: "1.0", changefreq: "daily" },
      { url: "/properties", priority: "0.9", changefreq: "daily" },
      { url: "/listings", priority: "0.9", changefreq: "daily" },
      { url: "/add-property", priority: "0.6", changefreq: "monthly" },
      { url: "/blog", priority: "0.8", changefreq: "weekly" },
      { url: "/blog/grid", priority: "0.7", changefreq: "weekly" },
      { url: "/blog/list", priority: "0.7", changefreq: "weekly" },
      { url: "/login", priority: "0.3", changefreq: "monthly" },
      { url: "/search?listing_status=sale", priority: "0.8", changefreq: "daily" },
      { url: "/search?listing_status=rent", priority: "0.8", changefreq: "daily" }
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach((page) => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add dynamic properties
    properties.forEach((property) => {
      const lastmod = property.updatedAt || property.createdAt || new Date();
      sitemap += `
  <url>
    <loc>${baseUrl}/property/${property._id}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
    });

    // Add blog pages
    if (blogs && blogs.length > 0) {
      blogs.forEach((blog) => {
        sitemap += `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${new Date(blog.date || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    }

    sitemap += `
</urlset>`;

    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate");
    res.write(sitemap);
    res.end();

  } catch (error) {
    console.error("Sitemap generation error:", error);
    
    // Fallback minimal sitemap
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://evergreenestateglob.com</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    res.setHeader("Content-Type", "text/xml");
    res.write(fallbackSitemap);
    res.end();
  }

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
