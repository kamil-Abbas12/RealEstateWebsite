// utils/fetchApi.js
import axios from "axios";

export const fetchApi = async (type, location, country) => {
  let url = "";
  let options = {};

  switch (country?.toLowerCase()) {
    case "uk":
      url = "https://zoopla-uk.p.rapidapi.com/properties/search";
      options = {
        method: "GET",
        url,
        params: {
          channel: type === "sale" ? "sale" : "rent",
          query: location || "London",
        },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "zoopla-uk.p.rapidapi.com",
        },
      };
      break;

    case "us":
      url = "https://zillow56.p.rapidapi.com/search";
      options = {
        method: "GET",
        url,
        params: {
          location: location || "New York",
          status: type === "sale" ? "forSale" : "forRent",
          page: "1",
        },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "zillow56.p.rapidapi.com",
        },
      };
      break;

    case "es":
    case "it":
    case "pt":
      url = "https://idealista2.p.rapidapi.com/es/search";
      options = {
        method: "GET",
        url,
        params: {
          country,
          operation: type === "sale" ? "sale" : "rent",
          location: location || "Madrid",
          numPage: "1",
        },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "idealista2.p.rapidapi.com",
        },
      };
      break;

    default:
      throw new Error("Unsupported country");
  }

  try {
    const { data } = await axios.request(options);

    // 🔹 New Zoopla API Format
    const listings =
      data?.listings?.regular ||
      data?.listings ||
      data?.props?.results ||
      data?.elementList ||
      [];

    return listings.map((item) => ({
      id:
        item.listing_id ||
        item.id ||
        Math.random().toString(36).substring(2, 8),
      title:
        item.address ||
        item.displayable_address ||
        item.location ||
        "Property",
      price:
        item.attributes?.price ||
        item.price ||
        item.price_value ||
        item.price_amount ||
        item.priceInfo?.amount ||
        null,
      image:
        item.imageUris?.[0] ||
        item.thumbnail ||
        item.image ||
        item.photos?.[0] ||
        null,
      address:
        item.address ||
        item.displayable_address ||
        item.location ||
        "Unknown",
      bedrooms:
        item.attributes?.bedrooms ||
        item.bedrooms ||
        item.rooms ||
        null,
      bathrooms:
        item.attributes?.bathrooms ||
        item.bathrooms ||
        item.bathroom_number ||
        null,
      flag: item.attributes?.flag || null,
      agent: item.agent?.branchName || item.agent?.name || "Agent",
      phone: item.agent?.phone || null,
      raw: item,
    }));
  } catch (error) {
    console.error("❌ API Fetch Error:", error.message);
    return [];
  }
};
