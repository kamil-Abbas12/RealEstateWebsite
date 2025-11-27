// pages/api/search.js
import axios from "axios";

/* ---------------- normalize functions ---------------- */
const normalizeZoopla = (raw) => {
  const pricing = raw.pricing || {};
  const priceNum = pricing.value ?? null;
  return {
    source: "Zoopla",
    id: raw.listingId || `zoopla-${Math.random().toString(36).slice(2, 8)}`,
    title: raw.title || raw.displayTitle || raw.address || "Property",
    price: priceNum,
    priceLabel: pricing.label || null,
    currency: (pricing.currency || "GBP").toUpperCase(),
    image: raw.imageUris?.[0] || raw.image || raw.image_url || null,
    address: raw.address || raw.displayable_address || raw.location?.label || "",
    bedrooms: raw.attributes?.bedrooms ?? raw.num_bedrooms ?? null,
    raw,
  };
};

const normalizeZillow = (raw) => ({
  source: "Zillow",
  id: raw.zpid || raw.id || `zillow-${Math.random().toString(36).slice(2, 8)}`,
  title: raw.title || raw.propertyType || raw.address || "Property",
  price: raw.price ?? null,
  priceLabel: raw.priceText || null,
  currency: (raw.currency || "USD").toUpperCase(),
  image: raw.imgSrc || raw.carouselPhotos?.[0] || null,
  address: raw.address || raw.streetAddress || raw.location || "",
  bedrooms: raw.bedrooms ?? raw.bedroomsCount ?? null,
  raw,
});

/* ---------------- provider fetchers ---------------- */
async function fetchZoopla(area, listing_status = "sale", page = 1, key) {
  try {
    const channel = listing_status === "sale" ? "sale" : "rent";
    const query = String(area || "").trim();

    const params = {
      channel,     // sale | rent
      query,       // "Oxford, Oxfordshire" or "Oxford"
      page: String(page),
      // add other params here only when provided (price_min, price_max, beds_min etc)
    };

    // remove empty keys
    Object.keys(params).forEach((k) => {
      if (params[k] === "" || params[k] == null) delete params[k];
    });

    const res = await axios.get("https://zoopla-uk.p.rapidapi.com/properties/search", {
      params,
      headers: {
        "x-rapidapi-key": key,
        "x-rapidapi-host": "zoopla-uk.p.rapidapi.com",
        Accept: "application/json",
      },
      timeout: 15000,
    });

    const body = res.data || {};
    const dataNode = body.data || body;

    // zoopla shape: data.listings.{regular,featured,extended} OR data.listings directly
    const rawListings =
      (dataNode.listings && (
        Array.isArray(dataNode.listings.regular) ? dataNode.listings.regular :
        Array.isArray(dataNode.listings.featured) ? dataNode.listings.featured :
        Array.isArray(dataNode.listings.extended) ? dataNode.listings.extended : []
      )) ||
      (Array.isArray(dataNode.listings) ? dataNode.listings : []);

    const results = (rawListings || []).map(normalizeZoopla);
    // console.log(`✅ Zoopla fetched ${results.length} results for "${query}" (channel=${channel})`);
    return { provider: "Zoopla", results };
  } catch (err) {
    // Log status & body to help debug 429/quota vs other errors
    // console.error("❌ Zoopla fetch error:", err?.response?.status, err?.response?.data || err?.message || err);
    return { provider: "Zoopla", results: [] };
  }
}

async function fetchZillow(area, listing_status = "sale", page = 1, key) {
  try {
    const status_type = listing_status === "sale" ? "ForSale" : "ForRent";
    const res = await axios.get("https://zillow56.p.rapidapi.com/search", {
      params: { location: area, status_type, page },
      headers: {
        "x-rapidapi-key": key,
        "x-rapidapi-host": "zillow56.p.rapidapi.com",
      },
      timeout: 12000,
    });

    const rawResults = res.data?.props || res.data?.results || res.data?.data || res.data || [];
    const results = (Array.isArray(rawResults) ? rawResults : []).map(normalizeZillow);
    // console.log(`✅ Zillow fetched ${results.length} results for "${area}"`);
    return { provider: "Zillow", results };
  } catch (err) {
    // console.error("❌ Zillow fetch error:", err?.response?.status, err?.response?.data || err?.message || err);
    return { provider: "Zillow", results: [] };
  }
}

/* ---------------- main handler ---------------- */
export default async function handler(req, res) {
  try {
    const { area = "", listing_status = "rent", page = 1, country = "" } = req.query;
    if (!area || String(area).trim() === "") {
      return res.status(400).json({ error: "Missing area parameter", results: [] });
    }
    const areaStr = String(area).trim();

    // Server-only keys
    const ZOOPLA_KEY = process.env.ZOOPLA_KEY || process.env.NEXT_PUBLIC_RAPIDAPI_KEY_ZOOPLA;
    const ZILLOW_KEY = process.env.ZILLOW_KEY || process.env.NEXT_PUBLIC_RAPIDAPI_KEY_ZILLOW;

    // Try Zoopla first (UK)
    if (ZOOPLA_KEY) {
      const zoopla = await fetchZoopla(areaStr, listing_status === "sale" ? "sale" : "rent", Number(page), ZOOPLA_KEY);
      if (zoopla.results && zoopla.results.length > 0) {
        return res.status(200).json({ provider: "Zoopla", results: zoopla.results, count: zoopla.results.length, country: "uk" });
      }
    }

    // Fallback: Zillow (US)
    if (ZILLOW_KEY) {
      const zillow = await fetchZillow(areaStr, listing_status === "sale" ? "sale" : "rent", Number(page), ZILLOW_KEY);
      if (zillow.results && zillow.results.length > 0) {
        return res.status(200).json({ provider: "Zillow", results: zillow.results, count: zillow.results.length, country: "us" });
      }
    }

    // nothing found
    return res.status(200).json({ provider: null, results: [], count: 0 });
  } catch (err) {
    // console.error("API handler error:", err?.response?.data || err?.message || err);
    return res.status(500).json({ results: [], error: err?.message || String(err) });
  }
}
