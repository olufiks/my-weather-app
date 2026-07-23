import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "weather.db"));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    country TEXT NOT NULL,
    timezone TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL
  );
`);

const CITIES_SEED = [
  { name: "New York", country: "US", timezone: "America/New_York", lat: 40.7128, lng: -74.006 },
  { name: "London", country: "UK", timezone: "Europe/London", lat: 51.5074, lng: -0.1278 },
  { name: "Tokyo", country: "JP", timezone: "Asia/Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Nairobi", country: "KE", timezone: "Africa/Nairobi", lat: -1.2921, lng: 36.8219 },
  { name: "Abuja", country: "NG", timezone: "Africa/Lagos", lat: 9.0579, lng: 7.4951 },
];

function seedCities() {
  const existing = db.prepare("SELECT name FROM cities").all();
  const existingNames = new Set(existing.map((c) => c.name));

  const insert = db.prepare(
    "INSERT OR IGNORE INTO cities (name, country, timezone, lat, lng) VALUES (?, ?, ?, ?, ?)"
  );
  const remove = db.prepare("DELETE FROM cities WHERE name = ?");

  const transaction = db.transaction(() => {
    const seedNames = new Set(CITIES_SEED.map((c) => c.name));
    for (const name of existingNames) {
      if (!seedNames.has(name)) {
        remove.run(name);
      }
    }
    for (const city of CITIES_SEED) {
      insert.run(city.name, city.country, city.timezone, city.lat, city.lng);
    }
  });

  transaction();
}

seedCities();

export { db };
