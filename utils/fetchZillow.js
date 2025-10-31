// utils/fetchZillow.js
import axios from "axios";

/**
 * Fetch Zillow listings (RapidAPI wrapper)
 * @param {'sale'|'rent'} listing_status
 * @param {string} location
 * @param {number} limit
 */
export async function fetchZillow(listing_status = "sale", location = "Houston, TX", limit = 6) {
  try {
    const url = "https://zillow69.p.rapidapi.com/search";
    // Zillow wrapper expects status_type like 'ForSale' or 'ForRent'
    const params = {
      location,
      status_type: listing_status === "sale" ? "ForSale" : "ForRent",
      // add additional params if needed
      page: 1,
      limit,
    };

    const res = await axios.get(url, {
      params,
      headers: {
        "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY_ZILLOW,
        "x-rapidapi-host": "zillow69.p.rapidapi.com",
      },
      timeout: 15000,
    });

    // Defensive: wrapper sometimes returns data array or .props/results etc.
    const raw = res?.data;
    // Try common paths
    let items = [];
    if (Array.isArray(raw)) items = raw;
    else if (Array.isArray(raw?.props)) items = raw.props;
    else if (Array.isArray(raw?.results)) items = raw.results;
    else if (Array.isArray(raw?.data)) items = raw.data;
    else if (Array.isArray(raw?.listings)) items = raw.listings;
    else items = [];

    items = items.slice(0, limit);

    const normalized = items.map((it, idx) => {
      const priceVal = (it?.price && (typeof it.price === "object" ? it.price?.value : it.price)) ?? null;
      return {
        id: it?.zpid ? `zillow-${it.zpid}` : `zillow-${idx}`,
        title: it?.address ?? it?.hdpView?.hdpUrl ?? "Zillow property",
        price: priceVal,
        priceLabel: priceVal ? String(priceVal) : it?.price ?? null,
        currency: it?.currency ?? "USD",
        bedrooms: it?.bedrooms ?? it?.bedroom ?? null,
        bathrooms: it?.bathrooms ?? null,
        image: it?.imgSrc ?? (it?.carouselPhotos && it.carouselPhotos[0]) ?? null,
        location: (it?.address && (it.address.streetAddress ?? `${it.address.streetAddress ?? ""}, ${it.address.city ?? ""}`)) ?? it?.location ?? null,
        propertyType: it?.propertyType ?? null,
        detailUrl: it?.detailUrl ?? it?.hdpView?.hdpUrl ?? null,
        source: "Zillow",
      };
    });

    return normalized;
  } catch (error) {
    console.error("❌ Zillow fetch error:", error?.message || error);
    return [];
  }
}
