import { useState, useEffect, useRef, useCallback } from "react";
import { getCitiesWeather, searchCities, getCityWeather } from "./weather";
import "./App.css";

function tempToColor(temp) {
  if (temp <= -10) return "#4a90d9";
  if (temp <= 0) return "#5ba3e6";
  if (temp <= 10) return "#7eb8ff";
  if (temp <= 18) return "#a8d8a8";
  if (temp <= 25) return "#e8c547";
  if (temp <= 32) return "#e89a3c";
  return "#d96048";
}

export default function App() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchCity, setSearchCity] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    getCitiesWeather()
      .then((data) => {
        setCities(data);
        setSelectedCity(data[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSearch = useCallback((q) => {
    if (!q.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchCities(q.trim())
      .then((data) => {
        setSearchResults(data);
        setSearching(false);
      })
      .catch(() => {
        setSearchResults([]);
        setSearching(false);
      });
  }, []);

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchQuery(val);
    setShowDropdown(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSearch(val), 300);
  }

  function handleSelectResult(result) {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setSearchLoading(true);

    getCityWeather({
      name: result.name,
      country: result.country || "",
      timezone: result.timezone || "UTC",
      lat: result.lat,
      lng: result.lng,
    })
      .then((data) => {
        setSearchCity(data);
        setSearchLoading(false);
      })
      .catch(() => {
        setSearchCity(null);
        setSearchLoading(false);
      });
  }

  function handleBackToTabs() {
    setSearchCity(null);
    setSelectedCity(cities[0] || null);
  }

  function handleSearchFocus() {
    if (searchQuery.trim()) {
      setShowDropdown(true);
    }
  }

  const viewing = searchCity || selectedCity;
  const weather = viewing?.weather;
  const isDaytime = weather?.isDaytime;

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">Loading weather data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error">Error: {error}.</div>
      </div>
    );
  }

  return (
    <div className={`app-container ${isDaytime ? "daytime" : "nighttime"}`}>
      <header className="header">
        <div className="logo">
          <img src="weathericon.png" alt="Weather" />
        </div>
        <div className="search-wrapper" ref={searchRef}>
          <input
            type="text"
            className="search-bar"
            placeholder="Search city..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
          />
          {showDropdown && (searchResults.length > 0 || searching) && (
            <div className="search-dropdown">
              {searching && <div className="search-status">Searching...</div>}
              {searchResults.map((result) => (
                <button
                  key={`${result.name}-${result.country}`}
                  className="search-result"
                  onClick={() => handleSelectResult(result)}
                >
                  <span className="search-result-name">{result.name}</span>
                  <span className="search-result-country">{result.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {searchCity && (
        <button className="back-button" onClick={handleBackToTabs}>
          ← Back to Abuja
        </button>
      )}

      {searchLoading ? (
        <div className="main-card">
          <div className="loading">Loading weather data...</div>
        </div>
      ) : weather ? (
        <div className={`main-card ${isDaytime ? "card-day" : "card-night"}`} key={viewing.name}>
          <div className="main-info">
            <div className="main-text">
              <div className="location">
                📍 {viewing.name}, {viewing.country}
              </div>
              <div className="temp-display">{weather.temperature}°</div>
              <div className="condition-text">
                {weather.condition} • Feels like {weather.feelsLike}°
              </div>
              <div className="local-time">
                <div>
                  🕐 Local time: {weather.currentTime}
                </div>
              </div>
              <div className="timezone-badge">
                {viewing.timezone}
              </div>
            </div>
            <div className="sun-circle">
              {isDaytime ? (
                <svg viewBox="0 0 120 120" className="sun-svg">
                  <circle cx="60" cy="60" r="22" fill="#f4c542" />
                  {[0,45,90,135,180,225,270,315].map((angle) => (
                    <line
                      key={angle}
                      x1="60" y1="60"
                      x2={60 + 40 * Math.cos((angle * Math.PI) / 180)}
                      y2={60 + 40 * Math.sin((angle * Math.PI) / 180)}
                      stroke="#f4c542"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  ))}
                </svg>
              ) : (
                <svg viewBox="0 0 120 120" className="moon-svg">
                  <circle cx="55" cy="55" r="28" fill="#c8d6e5" />
                  <circle cx="70" cy="44" r="24" fill="#1a1a3e" />
                </svg>
              )}
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Humidity</div>
              <div className="stat-value">{weather.humidity}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Wind</div>
              <div className="stat-value">{weather.windSpeed} km/h</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pressure</div>
              <div className="stat-value">{weather.pressure} hPa</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">UV Index</div>
              <div className="stat-value">{weather.uvIndex}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Visibility</div>
              <div className="stat-value">{weather.visibility} km</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Precipitation</div>
              <div className="stat-value">{weather.precipitation}%</div>
            </div>
          </div>

          <div className="sun-row">
            <div className="stat-card">
              <div className="stat-label">Sunrise</div>
              <div className="stat-value">{weather.sunrise}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Sunset</div>
              <div className="stat-value">{weather.sunset}</div>
            </div>
          </div>

          <div className="forecast-section">
            <div className="section-title">Next 12 Hours</div>
            <div className="hourly-grid">
              {weather.hourlyForecast.map((h, i) => (
                <div
                  key={i}
                  className={`hour-card ${h.isDaytime ? "hour-day" : "hour-night"}`}
                >
                  <div className="hour-time">{h.hour}</div>
                  <div className="hour-icon">{h.icon || (h.isDaytime ? "☀️" : "🌙")}</div>
                  <div className="hour-temp">{h.temperature}°</div>
                </div>
              ))}
            </div>
          </div>

          <div className="forecast-section">
            <div className="section-title">7-Day Outlook</div>
            <div className="daily-list">
              {weather.dailyForecast.map((d, i) => (
                <div className="daily-row" key={i}>
                  <div className="daily-day">{d.day}</div>
                  <div className="daily-icon">{d.icon}</div>
                  <div className="daily-range-bar">
                    <div
                      className="daily-range-fill"
                      style={{
                        width: `${((d.tempHigh - d.tempLow) / 40) * 100}%`,
                        marginLeft: `${((d.tempLow + 5) / 45) * 100}%`,
                        background: `linear-gradient(90deg, ${tempToColor(d.tempLow)}, ${tempToColor(d.tempHigh)})`,
                      }}
                    ></div>
                  </div>
                  <div className="daily-temps">
                    {d.tempLow}° / {d.tempHigh}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="main-card">
          <div className="error">Weather data unavailable for {viewing?.name}</div>
        </div>
      )}
    </div>
  );
}
