# Voyage Booker ⚓

**Voyage Booker** is a nautical trip-planning SPA developed as the final project for Camosun's **ICS 128** course. The application enables users to rent vessels based on real-time weather conditions and geospatial route metrics.

## Tech Stack

* **Languages:** JavaScript (ES6+), HTML5, CSS3
* **Libraries:** jQuery, Leaflet.js, Turf.js, Bootstrap 5, Masonry.js
* **APIs:** Azure Maps, MapTiler
* **Infrastructure:** Git, GitHub Pages, LocalStorage

## Key Features

* **Geospatial Routing:** Integrated **Leaflet.js** and **Turf.js** to enforce "water-only" waypoints and calculate nautical mileage.
* **Dynamic Vessel Filtering:** Logic automatically excludes open-top vessels if rain is forecasted and filters the catalog based on vessel fuel range.
* **Async Data Handling:** Utilized `Promise.all` to concurrently fetch real-time weather and timezone data, optimizing load times.
* **API Security:** Secured public-facing keys using **HTTP Origin (CORS)** restrictions within Azure and MapTiler dashboards.
* **Persistent State:** Managed cart data and user selections across sessions using `localStorage`.
* **Form Validation:** Robust client-side validation using custom **Regex** for billing and contact information.
