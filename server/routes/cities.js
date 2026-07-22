import { Router } from "express";
import { db } from "../db.js";

const router = Router();

const WMO_CODES = {
  0: "Clear Sky",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime Fog",
  51: "Light Drizzle",
  53: "Moderate Drizzle",
  55: "Dense Drizzle",
  56: "Freezing Drizzle",
  57: "Dense Freezing Drizzle",
  61: "Slight Rain",
  63: "Moderate Rain",
  65: "Heavy Rain",
  66: "Freezing Rain",
  67: "Heavy Freezing Rain",
  71: "Slight Snow",
  73: "Moderate Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Slight Showers",
  81: "Moderate Showers",
  82: "Violent Showers",
  85: "Slight Snow Showers",
  86: "Heavy Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm with Hail",
  99: "Thunderstorm with Heavy Hail",
};

const WMO_ICONS = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  56: "🌧️",
  57: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  66: "🌧️",
  67: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "❄️",
  77: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  85: "🌨️",
  86: "❄️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

function determineIsDaytime(cityTimezone, hourly, sunriseStr, sunsetStr) {
  const now = new Date();
  const currentHour = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: cityTimezone,
      hour: "numeric",
      hour12: false,
    }).format(now)
  );

  for (let i = 0; i < hourly.time.length; i++) {
    const timeStr = hourly.time[i];
    const hour = parseInt(timeStr.split("T")[1].split(":")[0]);
    if (hour === currentHour) {
      return hourly.is_day[i] === 1;
    }
  }

  const sunrise = new Date(sunriseStr);
  const sunset = new Date(sunsetStr);
  if (now >= sunrise && now < sunset) return true;
  return false;
}

async function fetchWeather(city) {
  const params = new URLSearchParams({
    latitude: city.lat,
    longitude: city.lng,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure",
    hourly: "temperature_2m,weather_code,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
    timezone: city.timezone,
    forecast_days: "7",
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);
  return res.json();
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getLocalTime(timezone) {
  return new Date().toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function buildHourlyForecast(cityTimezone, hourly) {
  const now = new Date();
  const currentHour = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: cityTimezone,
      hour: "numeric",
      hour12: false,
    }).format(now)
  );

  const forecast = [];
  const usedHours = new Set();

  for (let i = 0; i < hourly.time.length && forecast.length < 12; i++) {
    const timeStr = hourly.time[i];
    const hour = parseInt(timeStr.split("T")[1].split(":")[0]);
    const datePart = timeStr.split("T")[0];
    const today = now.toISOString().split("T")[0];

    let targetHour;
    if (forecast.length === 0) {
      targetHour = currentHour;
    } else {
      targetHour = (currentHour + forecast.length) % 24;
    }

    if (hour === targetHour && datePart === today && !usedHours.has(hour)) {
      usedHours.add(hour);
      const label =
        forecast.length === 0
          ? "Now"
          : `${hour > 12 ? hour - 12 : hour || 12}${hour >= 12 ? "PM" : "AM"}`;
      forecast.push({
        hour: label,
        temperature: Math.round(hourly.temperature_2m[i]),
        condition: WMO_CODES[hourly.weather_code[i]] || "Unknown",
        icon: WMO_ICONS[hourly.weather_code[i]] || "🌡️",
        isDaytime: hourly.is_day[i] === 1,
      });
    }
  }

  return forecast;
}

function buildDailyForecast(daily) {
  return daily.time.map((day, i) => {
    const date = new Date(day + "T12:00:00");
    const dayName =
      i === 0
        ? "Today"
        : i === 1
          ? "Tomorrow"
          : date.toLocaleDateString("en-US", { weekday: "short" });
    return {
      day: dayName,
      condition: WMO_CODES[daily.weather_code[i]] || "Unknown",
      icon: WMO_ICONS[daily.weather_code[i]] || "🌡️",
      tempLow: Math.round(daily.temperature_2m_min[i]),
      tempHigh: Math.round(daily.temperature_2m_max[i]),
      sunrise: formatTime(daily.sunrise[i]),
      sunset: formatTime(daily.sunset[i]),
    };
  });
}

function formatCityResponse(city, data) {
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;

  const dailyForecast = buildDailyForecast(daily);
  const hourlyForecast = buildHourlyForecast(city.timezone, hourly);
  const isDaytime = determineIsDaytime(city.timezone, hourly, daily.sunrise[0], daily.sunset[0]);

  return {
    name: city.name,
    country: city.country,
    timezone: city.timezone,
    lat: city.lat,
    lng: city.lng,
    weather: {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      condition: WMO_CODES[current.weather_code] || "Unknown",
      icon: WMO_ICONS[current.weather_code] || "🌡️",
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      pressure: Math.round(current.surface_pressure),
      uvIndex: 0,
      visibility: 10,
      precipitation: 0,
      sunrise: dailyForecast[0]?.sunrise || "--",
      sunset: dailyForecast[0]?.sunset || "--",
      isDaytime,
      currentTime: getLocalTime(city.timezone),
      hourlyForecast,
      dailyForecast,
    },
  };
}

async function geocodeCity(query) {
  const params = new URLSearchParams({
    name: query,
    count: "8",
    language: "en",
    format: "json",
  });
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`);
  if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    name: r.name,
    country: r.country_code || "",
    timezone: r.timezone || "UTC",
    lat: r.latitude,
    lng: r.longitude,
  }));
}

router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);

    const existing = db
      .prepare("SELECT * FROM cities WHERE LOWER(name) LIKE LOWER(?)")
      .all(`%${q}%`);

    if (existing.length > 0) {
      const results = await Promise.all(
        existing.map(async (city) => {
          try {
            const data = await fetchWeather(city);
            return formatCityResponse(city, data);
          } catch {
            return { name: city.name, country: city.country, timezone: city.timezone, lat: city.lat, lng: city.lng, weather: null };
          }
        })
      );
      return res.json(results);
    }

    const geoResults = await geocodeCity(q);
    const results = await Promise.all(
      geoResults.slice(0, 5).map(async (city) => {
        try {
          db.prepare(
            "INSERT OR IGNORE INTO cities (name, country, timezone, lat, lng) VALUES (?, ?, ?, ?, ?)"
          ).run(city.name, city.country, city.timezone, city.lat, city.lng);
          const data = await fetchWeather(city);
          return formatCityResponse(city, data);
        } catch {
          return { name: city.name, country: city.country, timezone: city.timezone, lat: city.lat, lng: city.lng, weather: null };
        }
      })
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const cities = db.prepare("SELECT * FROM cities").all();

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

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:name", async (req, res) => {
  try {
    const city = db
      .prepare("SELECT * FROM cities WHERE LOWER(name) = LOWER(?)")
      .get(req.params.name);

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    const data = await fetchWeather(city);
    res.json(formatCityResponse(city, data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
