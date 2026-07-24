import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { fetchWeather, formatCityResponse } from "../lib/weather.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cities = JSON.parse(readFileSync(join(__dirname, "data.json"), "utf-8"));

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const results = await Promise.all(
      cities.map(async (city) => {
        try {
          const data = await fetchWeather(city);
          return formatCityResponse(city, data);
        } catch (err) {
          console.error(`Failed to fetch weather for ${city.name}:`, err.message);
          return {
            name: city.name,
            country: city.country,
            timezone: city.timezone,
            lat: city.lat,
            lng: city.lng,
            weather: null,
            error: err.message,
          };
        }
      })
    );

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
