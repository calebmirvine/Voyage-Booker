# Voyage Booker ⚓

### Live Demo: [[https://calebmirvine.github.io/ICS128-Final_Project/](https://calebmirvine.github.io/ICS128-Final_Project/)]

**Voyage Booker** is a Single Page Application (SPA) that allows users to plan nautical trips and rent vessels based on real-time weather conditions and route metrics.

## 🛠️ Tech Stack

* **Languages:** JavaScript (ES6+), HTML5, CSS3
* **Libraries:** jQuery, Bootstrap 5, Leaflet.js, Turf.js, Masonry.js
* **APIs:** Azure Maps (Weather & Timezones), MapTiler (Nautical Charts)
* **Tools:** Git, GitHub Pages, LocalStorage

## 🚀 Key Technical Features

* **Interactive Mapping:** Utilized **Leaflet.js** for dynamic routing and **Turf.js** for geospatial analysis to strictly enforce "water-only" markers (preventing users from placing waypoints on land).
* **Async/Await Data Handling:** Implemented `Promise.all` to concurrently fetch real-time weather and timezone data from Azure Maps to minimize load times.
* **Dynamic Filtering Logic:**
* Calculates total nautical miles for the route.
* Automatically filters available vessels based on fuel range.
* Checks weather forecasts; if rain is detected at any port, open-top vessels are removed from the catalog.


* **Persistent State:** Uses `localStorage` to manage cart state, trip details, and user selection across browser sessions without a backend database.
* **Robust Validation:** Custom **Regex** implementation to validate billing forms (Credit Card, Email, Postal Code) with specific error handling.

## 💡 Skills Demonstrated

* **API Security & Cloud Configuration:** Configured strict **HTTP Origin (CORS)** restrictions on Azure and MapTiler dashboards to secure exposed API keys in a serverless, static hosting environment.
* **Third-Party API Integration:** Managing API keys, handling HTTP responses, and parsing complex JSON data.
* **DOM Manipulation:** Extensive use of jQuery for dynamic content rendering and UI updates.
* **Error Handling:** Implementation of `try...catch...finally` blocks to ensure application stability during network requests.
* **Vector Graphics:** Custom manipulation of SVGs for dynamic and scalable map markers.
