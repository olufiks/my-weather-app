import { fetchWeather, formatCityResponse } from "../lib/weather.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, country, timezone, lat, lng } = req.query;
    if (!name || lat == null || lng == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const city = {
      name,
      country: country || "",
      timezone: timezone || "UTC",
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    const data = await fetchWeather(city);
    res.status(200).json(formatCityResponse(city, data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
