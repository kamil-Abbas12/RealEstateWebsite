// utils/fetchZoopla.js
import axios from "axios";

/**
 * Fetch Zoopla listings (v2 endpoint from RapidAPI)
 * @param {'sale'|'rent'} listing_status
 * @param {string} area
 * @param {number} limit
 * @returns {Promise<Array>} normalized property objects
 */
export async function fetchZoopla(listing_status = "rent", area = "Oxford", limit = 6) {
  try {
    const url = "https://zoopla.p.rapidapi.com/properties/v2/list";
    const params = {
      locationValue: area,
      locationIdentifier: "london", // Zoopla wrapper expects this - adjust if you have better identifier
      category: "residential",
      furnishedState: "Any",
      sortOrder: "newest_listings",
      page: "1",
      section: listing_status === "sale" ? "for-sale" : "to-rent",
    };

    const res = await axios.request({
      method: "GET",
      url,
      params,
      headers: {
        "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY_ZOOPLA,
        "x-rapidapi-host": "zoopla.p.rapidapi.com",
      },
      timeout: 15000,
    });

    const raw = res?.data;
    const regular = raw?.data?.listings?.regular || [];
    const featured = raw?.data?.listings?.featured || [];
    const extended = raw?.data?.listings?.extended || [];

    const items = [...regular, ...featured, ...extended].slice(0, limit);

    // Normalize & sanitize (only plain JS values)
    const list = items.map((it, idx) => {
      const priceValue = it?.pricing?.value ?? null;
      const priceLabel = it?.pricing?.label ?? it?.shortPriceTitle ?? null;
      const currency = raw?.data?.analyticsTaxonomy?.currencyCode ?? "GBP";

      return {
        id: it?.listingId ? `zoopla-${it.listingId}` : `zoopla-${idx}`,
        title: it?.title ?? it?.shortTitle ?? "Zoopla property",
        price: priceValue !== undefined ? priceValue : null,
        priceLabel: priceLabel ?? null,
        currency,
        bedrooms: it?.attributes?.bedrooms ?? null,
        bathrooms: it?.attributes?.bathrooms ?? null,
        image: (it?.imageUris && it.imageUris[0]) || it?.image_645_430_url || null,
        location: it?.address ?? it?.displayable_address ?? null,
        propertyType: it?.propertyType ?? it?.property_type ?? null,
        detailUrl: it?.detailUrl ?? null,
        source: "Zoopla",
      };
    });

    return list;
  } catch (error) {
    console.error("❌ Zoopla fetch error:", error?.message || error);
    return [];
  }
}
