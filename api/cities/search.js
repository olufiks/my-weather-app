import { geocodeCity } from "../lib/weather.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(200).json([]);

    const results = await geocodeCity(q);
    res.status(200).json(results.slice(0, 8));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
