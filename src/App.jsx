import { useState, useEffect } from "react";
import "./App.css";

const cities = ["New York", "London", "Tokyo", "Nairobi"];

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCity, setSelectedCity] = useState("New York");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <img src="weathericon.png" />
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
            key={city}
            className={`tab ${selectedCity === city ? "active" : ""}`}
            onClick={() => setSelectedCity(city)}
          >
            {city}
          </button>
        ))}
      </div>

      <div className="main-card">
        <div className="main-info">
          <div className="main-text">
            <div className="location">📍 {selectedCity}</div>
            <div className="temp-display">28°</div>
            <div className="condition-text">Sunny • Feels like 30°</div>
            <div className="local-time">
              <div>
                Local time:{" "}
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
          </div>
          <div className="sun-circle">
            <div className="circle-bg"></div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Humidity</div>
            <div className="stat-value">65%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Wind</div>
            <div className="stat-value">12 km/h</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pressure</div>
            <div className="stat-value">1013 hPa</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">UV Index</div>
            <div className="stat-value">6</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Visibility</div>
            <div className="stat-value">15 km</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Precipitation</div>
            <div className="stat-value">10%</div>
          </div>
        </div>

        {/* Sunrise & Sunset */}
        <div className="sun-row">
          <div className="stat-card">
            <div className="stat-label">Sunrise</div>
            <div className="stat-value">6:20 AM</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Sunset</div>
            <div className="stat-value">6:45 PM</div>
          </div>
        </div>

        {/* Hourly Forecast */}
        <div className="forecast-section">
          <div className="section-title">Next 12 Hours</div>
          <div className="hourly-grid">
            <div className="hour-card">
              <div className="hour-time">Now</div>
              <div className="hour-temp">28°</div>
            </div>
            <div className="hour-card">
              <div className="hour-time">1PM</div>
              <div className="hour-temp">29°</div>
            </div>
            <div className="hour-card">
              <div className="hour-time">3PM</div>
              <div className="hour-temp">27°</div>
            </div>
            <div className="hour-card">
              <div className="hour-time">5PM</div>
              <div className="hour-temp">25°</div>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="forecast-section">
          <div className="section-title">7-Day Outlook</div>
          <div className="daily-list">
            <div className="daily-row">
              <div className="daily-day">Today</div>
              <div className="daily-icon">☀️</div>
              <div className="daily-range-bar">
                <div className="daily-range-fill"></div>
              </div>
              <div className="daily-temps">24° / 30°</div>
            </div>
            <div className="daily-row">
              <div className="daily-day">Tomorrow</div>
              <div className="daily-icon">⛅</div>
              <div className="daily-range-bar">
                <div className="daily-range-fill"></div>
              </div>
              <div className="daily-temps">22° / 28°</div>
            </div>
            <div className="daily-row">
              <div className="daily-day">Wed</div>
              <div className="daily-icon">🌧️</div>
              <div className="daily-range-bar">
                <div className="daily-range-fill"></div>
              </div>
              <div className="daily-temps">20° / 25°</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
