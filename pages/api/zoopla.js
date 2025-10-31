// app/api/zoopla/route.js  (App Router)
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const area = searchParams.get("area") || "London";
  const listing_status = searchParams.get("listing_status") || "sale";
  const minimum_price = searchParams.get("minimum_price") || "";
  const maximum_price = searchParams.get("maximum_price") || "";
  const minimum_beds = searchParams.get("minimum_beds") || "";

  try {
    const response = await axios.get("https://zoopla.p.rapidapi.com/properties/list", {
      params: {
        listing_status,
        area,
        minimum_price,
        maximum_price,
        minimum_beds,
        page_size: 10,
      },
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "zoopla.p.rapidapi.com",
      },
    });

    return NextResponse.json({ listings: response.data.listings || [] });
  } catch (err) {
    console.error("Zoopla API Error:", err.response?.data || err.message);
    return NextResponse.json({ listings: [], error: "Failed to fetch Zoopla data" });
  }
}
