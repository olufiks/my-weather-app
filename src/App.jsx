import { useState, useEffect } from "react";
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

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch weather data");
        return res.json();
      })
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
        <div className="error">Error: {error}. Make sure the server is running.</div>
      </div>
    );
  }

  const weather = selectedCity?.weather;
  const isDaytime = weather?.isDaytime;

  return (
    <div className={`app-container ${isDaytime ? "daytime" : "nighttime"}`}>
      <header className="header">
        <div className="logo">
          <img src="weathericon.png" alt="Weather" />
        </div>
        <input
          type="text"
          className="search-bar"
          placeholder="Search city..."
        />
      </header>

      <div className="city-tabs">
        {cities.map((city) => (
          <button
            key={city.name}
            className={`tab ${selectedCity?.name === city.name ? "active" : ""} ${
              city.weather?.isDaytime ? "tab-day" : "tab-night"
            }`}
            onClick={() => setSelectedCity(city)}
          >
            {city.weather ? (city.weather.isDaytime ? "☀️" : "🌙") : "🌡️"} {city.name}
          </button>
        ))}
      </div>

      {weather ? (
        <div className={`main-card ${isDaytime ? "card-day" : "card-night"}`} key={selectedCity.name}>
          <div className="main-info">
            <div className="main-text">
              <div className="location">
                📍 {selectedCity.name}, {selectedCity.country}
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
                {selectedCity.timezone}
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
          <div className="error">Weather data unavailable for {selectedCity.name}</div>
        </div>
      )}
    </div>
  );
}
