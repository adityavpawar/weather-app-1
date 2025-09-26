// ---------- API & DOM Elements ----------
const API_KEY = "6b41946380aa0153c182698eea5409cf"; // Replace with your OpenWeatherMap API key
const weatherBox = document.getElementById("weather-box");
const forecastCards = document.getElementById("forecast-cards");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const themeToggleBtn = document.getElementById("theme-toggle");

// ---------- State Management ----------
const state = {
  currentCity: "",
  currentWeather: null,
  forecast: []
};

// ---------- Theme Handling ----------
window.onload = () => {
  // Load theme from localStorage
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);

  // Load last searched city
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    document.getElementById("city-input").value = lastCity;
    getWeather(lastCity);
  }
};

// Theme toggle button
themeToggleBtn.addEventListener("click", () => {
  const currentTheme = document.body.classList.contains("dark") ? "light" : "dark";
  setTheme(currentTheme);
});

function setTheme(mode) {
  document.body.className = mode === "dark" ? "dark" : "";
  localStorage.setItem("theme", mode);
}

// ---------- Fetch Weather Data ----------
async function getWeather(city) {
  city = city || document.getElementById("city-input").value.trim();
  if (!city) return;

  loadingEl.style.display = "block";
  errorEl.textContent = "";
  weatherBox.innerHTML = "";
  forecastCards.innerHTML = "";

  try {
    // --- Current Weather ---
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();

    // Update state
    state.currentCity = city;
    state.currentWeather = data;

    // Save last searched city
    localStorage.setItem("lastCity", city);

    // --- 5-Day Forecast ---
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    const forecastData = await forecastRes.json();

    // Filter 12:00 PM for each day
    state.forecast = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));

    // Render UI
    renderUI();

  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    loadingEl.style.display = "none";
  }
}

// ---------- Render UI ----------
function renderUI() {
  // Current weather card
  if (state.currentWeather) {
    const data = state.currentWeather;
    weatherBox.innerHTML = `
      <div><strong>🌍 ${data.name}</strong></div>
      <div>🌡️ Temperature: ${data.main.temp}°C</div>
      <div>☁️ Weather: ${data.weather[0].main}</div>
      <div>💧 Humidity: ${data.main.humidity}%</div>
    `;
  }

  // 5-day forecast cards
  if (state.forecast.length > 0) {
    forecastCards.innerHTML = state.forecast.map(day => `
      <div class="forecast-card">
        <div><strong>${new Date(day.dt_txt).toLocaleDateString()}</strong></div>
        <div>🌡️Temp: ${day.main.temp}°C</div>
        <div>☁️Weather: ${day.weather[0].main}</div>
        <div>💧Humidity: ${day.main.humidity}%</div>
      </div>
    `).join("");
  }
}
