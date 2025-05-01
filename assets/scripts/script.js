/**
 * Final Project - ICS 128 Web Scripting
 * Author: Caleb Irvine
 *
 * This final project showcases the skills I've developed throughout the term using JavaScript and jQuery
 * in combination with external libraries and APIs. It demonstrates an interactive map application with booking functionalities.
 * Uses Leaflet.js and a range of Leaflet plugins to handle dynamic markers, trip routing, and more
 *
 * The things i've learnt and practiced...
 * - Leaflet.js: Interactive maps
 * - Leaflet plugins: Nautic scale, responsive popups, fullscreen control, custom icons, and more
 * - Azure Maps API: Fetching real-time weather and time zone data using API keys and handling responses
 * -Map Tiler  API : for nautical map tilelayer
 * - WEB API localStorage: Storing cart items, trip data, and user selections across sessions
 * - jQuery: further praciticing and expanding what I can do, learning more what jQuery can do
 * - API: Understanding handling responses with fetch and async/await, managing API keys, and options
 * - CDNs and unpkg: Loading third party libraries like Leaflet and plugins directly into the browser without manual installation (no npm)
 * -Vectors: For fun, messed around with trying to make my own/edit svgs (the markers I made and put a stock photo inside)
 */

// COMMAND + F to find the exact use case, this is indicated by the ✅
// For everything else it means it is spread throughout and not just one instance, this is indicated by the ⬇️
//= ============================ARRAYS ✅=============================
//= ============================OBJECTS ✅=============================
//= ============================REGEX FORM VALIDATION ✅ =============================
//= ============================LOOPS ✅=============================
//= ============================TRY, CATCH, FINALLY ✅=============================
//= ============================THROWING ERRORS ✅=============================
//= ============================CONDITIONALS ⬇️=============================
//= ============================FETCH ✅=============================
//= ============================JSON DECONSTRUCTION ✅=============================
//= ============================VARIABLE ASSIGNMENT LET VS CONST ⬇️=============================
//= ============================FULL FORM VALIDATION ✅ =============================
//= ============================PROPER ERROR FEEDBACK ⬇️=============================
//= ============================JQUERY DOM ⬇️=============================
//= ============================COMMENTS ⬇️=============================
//= ============================LEAFLET KNOWLEDGE ⬇️=============================
//= ============================ASYNC AWAIT ✅=============================

// global variables
const TAX_RATE = 0.05;
const AZUREKEY = 'CocXxa9ttOwPiYjh2LobanHG7bW8F911GTm2OlLKYfUwAFVa3tGeJQQJ99BCACYeBjFsuc1mAAAgAZMP1gRC';
const MAPTILERKEY = 'M9Lb1wDn8WfXKX67TE8s';

$(document).ready(() => {
    // Default Location Interurban Campus
    // Interurban Campus: [48.49103113795146,-123.41514114992222]
    // Hawaii for testing port icons: 21.3069 | -157.8583
    const defaultLat = 48.49103113795146;
    const defaultLong = -123.41514114992222;
    let myLat;
    let myLong;

    // Get the current user's location, if it fails, keep the default location AKA interurban
    const getLocation = (() => new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    myLat = position.coords.latitude;
                    myLong = position.coords.longitude;
                    resolve();
                },
                (err) => {
                    myLat = defaultLat;
                    myLong = defaultLong;
                    reject(err.message);
                },
            );
        } else {
            myLat = defaultLat;
            myLong = defaultLong;
            reject(new Error('Geolocation is not supported by this browser.'));
        }
    }));

    const initMap = (() => {
        //map with fullscreen leaflet plugin
        const map = L.map('map', {
            // My starting point
            center: [myLat, myLong],
            zoom: 4,
            fullscreenControl: true,
        });
        //leaflet alert plugin
        const notification = L.control
            .notifications({
                position: 'topright',
                closable: true,
                dismissable: true,
                className: 'pastel',
            })
            .addTo(map);

        //NM scale right below KM
        map.addControl(new L.Control.ScaleNautic({
            metric: true,
            imperial: false,
            nautic: true,
        }));

        // Add the tile layer
        //API Maptiler for a diffrent "nautial" map tilelayer
//= ============================LEAFLET KNOWLEDGE ⬇️=============================
        L.tileLayer(`https://api.maptiler.com/maps/ocean/{z}/{x}/{y}.png?key=${MAPTILERKEY}`, { // style URL
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            attribution: " \u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u00A9 MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u00A9 OpenStreetMap contributors\u003c/a\u003e <button id='btnStopTrip' class='btn btn-danger btn-sm m-1' style='--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;'>Stop Trip</button>",
            crossOrigin: true,
        }).addTo(map);
        $('#btnStopTrip').hide();

        // Custom marker Icons
        const homeIcon = L.icon({
            iconUrl: './assets/images/star.svg',
            iconSize: [20, 20], // size of the icon
            popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
        });
        const portIcon = L.icon({
            iconUrl: './assets/images/ship-wheel-marker.svg',
            iconSize: [44, 44], // size of the icon
            iconAnchor: [22, 44], // point of the icon which will correspond to marker's location
            popupAnchor: [null, -50], // point from which the popup should open relative to the iconAnchor
        });
        const anchorIcon = L.icon({
            iconUrl: './assets/images/anchor-marker.svg',
            iconSize: [40, 40], // size of the icon
            iconAnchor: [20, 40], // point of the icon which will correspond to marker's location
            popupAnchor: [null, -45], // point from which the popup should open relative to the iconAnchor
        });
        const boatIcon = L.icon({
            iconUrl: './assets/images/sailing_gif.gif',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
        });

        const homePopup = L.responsivePopup().setContent('<h3>You Are Here</h3>');
        const homeMarker = (
            L.marker(
                [myLat, myLong],
                { icon: homeIcon },
            ).addTo(map));
        homeMarker.on('click', () => {
            map.flyTo([myLat, myLong], 13);
            map.center = [myLat, myLong];
            homeMarker.bindPopup(homePopup).openPopup();
        });

        let selectedPorts = [];
        const setPortMakers = ((ports) => {
            // Loop through the ports and add them to the map
            //= ============================FOR LOOPS ✅=============================
            // For in loop to get the iteration
            for (const port in ports) {
                const thisPort = ports[port];
                const portName = thisPort.name;
                const portLat = thisPort.coordinates[0];
                const portLong = thisPort.coordinates[1];

                // Shorthand port name which is used to create the portID
                let portID = ((/((?!Port\b)(?!\s)(?!of\b)\b).+/g).exec(portName));
                portID = portID[0].replaceAll(' ', '-');
                portID = portID.replace(/[().]/g, '');

                const thisPortData = {
                    id: portID,
                    coordinates: [portLat, portLong],
                };

                // Add a marker for each port
                const portMarker = L.marker([portLat, portLong], { icon: portIcon }).addTo(map);

                const setPopup = (async () => {
                    try {
                        const portInfo = await getLocationInfo(portLat, portLong);

                        //little neat colors depending on the weather... rain/snow/shine
                        const setPopupAppearance = ((popupContent) => {
                            let popupAppearance;
                            switch (true) {
                                case (parseInt((/\d{2}/g).exec(portInfo.localeTime.time)) > 18 || parseInt((/\d{2}/g).exec(portInfo.localeTime.time)) < 5):
                                    popupAppearance = { className: 'popupNight', maxWidth: 550 };
                                    portMarker.bindPopup(L.responsivePopup({ offset: [25, 10] }).setContent(popupContent), popupAppearance).openPopup();
                                    break;
                                case (portInfo.localeWeather.phrase.search(/sun|clear/gi) !== -1):
                                    popupAppearance = { className: 'popupSun', maxWidth: 550 };
                                    portMarker.bindPopup(L.responsivePopup({ offset: [25, 10] }).setContent(popupContent), popupAppearance).openPopup();
                                    break;
                                case portInfo.localeWeather.precipitation:
                                    popupAppearance = { className: 'popupRain', maxWidth: 550 };
                                    portMarker.bindPopup(L.responsivePopup({ offset: [25, 10] }).setContent(popupContent), popupAppearance).openPopup();
                                    break;
                                case (portInfo.localeWeather.phrase.search(/Cloud/gi) !== -1):
                                    popupAppearance = { className: 'popupClouds', maxWidth: 550 };
                                    portMarker.bindPopup(L.responsivePopup({ offset: [25, 10] }).setContent(popupContent), popupAppearance).openPopup();
                                    break;
                                default:
                                    popupAppearance = { className: 'popupCustom', maxWidth: 550 };
                                    portMarker.bindPopup(L.responsivePopup({ offset: [25, 10] }).setContent(popupContent), popupAppearance).openPopup();
                            }
                        });
                        const setPopupContent = ((portInfo) => {
                            popupContent = `<div id="popupContent" class="w-100 h-100">
                                <h4 class="fw-bold">${portName} | ${portInfo.localeTime.country}</h4>
                                <h6 class="mb-2 d-inline">Locale Time: ${portInfo.localeTime.date} | ${portInfo.localeTime.time}</h6>
                                <i class="refreshPopup bi bi-arrow-clockwise cursor" role="button"></i>
                                <hr class="my-2">
                                <p class="p-0 fs-5 my-0">Locale Weather<span class="fw-bold"> | ${portInfo.localeWeather.phrase}</span> </p>
                                <div>
                                    <img class="d-inline mb-3 mx-auto" src="./assets/images/weather/${portInfo.localeWeather.icon}.svg" style="height: 125px;"/>
                                    <p class="d-inline fs-3 fw-bold p-0">${portInfo.localeWeather.temperature}&deg;C</p>
                                </div>
                                <div class="mb-0">
                                    <p class="d-inline">Sunrise ${portInfo.localeTime.sunCycle[0]}</p>
                                    <img class="d-inline sunCycle" src="./assets/images/sunrise.svg"></img>
                                </div>
                                <div class="mt-0">
                                    <p class="d-inline">Sunset ${portInfo.localeTime.sunCycle[1]}</p>
                                    <img class="d-inline sunCycle" src="./assets/images/sunset.svg"></img>
                                </div>
                                <div class="d-flex justify-content-between align-items-end">
                                    <p class="tzFont fw-light text-start mb-1 pb-0">Timezone: <span class="d-block">${portInfo.localeTime.timeZone}</span></p>
                                    <button class="portBtn btn btn-primary mb-0 mx-0 fw-heavy">Start New Voyage</button>
                                </div>
                            </div>`;
                            setPopupAppearance(popupContent);
                        });
                        setPopupContent(portInfo);

                        //if we have an existing port/journey, then the next port selected will stop it
                        (() => {
                            if (selectedPorts.length === 1) {
                                $('.portBtn').text('Stop Voyage');
                            }
                            $('.portBtn').on('click', () => {
                                map.flyTo([portLat, portLong], 4);
                                map.center = [portLat, portLong];
                                startJourney(thisPortData);
                                setTimeout(() => {
                                    portMarker.closePopup();
                                }, 200);
                            });
                        })();

                        $('.refreshPopup').on('click', async () => {
                            await setPopup();
                        });
                    } catch (err) {
                        // If the port is not found, popupContent shows an error message
                        portMarker.bindPopup(popupContent).openPopup();
                        popupContent = (`
                            <img class="d-block mb-3 mx-auto" src="./assets/images/compass.svg" style="height: 150px;"/>
                            <h6 class="text-center">Error loading ${portName}...</h6>
                              <h6 class="text-center">${err.message}</h6>
                            <h6 class="text-center">Please try again later.</h6>
                            `);
                    }
                });
                // Add a click event to the markers
                portMarker.on('click', () => {
                    map.flyTo([portLat, portLong], 8);
                    map.center = [portLat, portLong];
                    portMarker.bindPopup(popupContent).openPopup();
                    setPopup();
                });
                // default popup content (Loading page)
                let popupContent = `
                            <div id="popoutLoading" class="w-100 h-100">
                                <img class="d-block mb-3 mx-auto" src="./assets/images/compass.svg" style="height: 150px;"/>
                                <h5 class="text-center">Loading ${portName}...</h5>
                                <h6 class="text-center">Please wait...</h6>
                            </div> `;
            }
        });

        // Load and duplicate water polygons //
        // This stuff is where Joe differentiates the land and sea. DON'T Change this Stuff //
        // Unless you dont want it to work.
        // Duplicating the land and sea over 3 sets of world maps
        let waterPolygons;
        function duplicateWaterPolygons(original) {
            const offsets = [-360, 0, 360];
            const allFeatures = [];
            //= ============================LOOPS ✅=============================
            for (const offset of offsets) {
                const wrapped = JSON.parse(JSON.stringify(original));
                for (const feature of wrapped.features) {
                    const geom = feature.geometry;
                    if (geom.type === 'Polygon') {
                        geom.coordinates = geom.coordinates.map((ring) => ring.map(([lng, lat]) => [lng + offset, lat]));
                    } else if (geom.type === 'MultiPolygon') {
                        geom.coordinates = geom.coordinates.map((polygon) => polygon.map((ring) => ring.map(([lng, lat]) => [lng + offset, lat])));
                    }
                }
                allFeatures.push(...wrapped.features);
            }
            return {
                type: 'FeatureCollection',
                features: allFeatures,
            };
        }

        // Anonymous arrow function to fetch ports.
        (async () => {
            try {
                const [data1, data2] = await Promise.all([
                    fetch('./public/ports.json'),
                    fetch('./public/ocean.geojson'),
                ]);
                const portData = await data1.json();
                const oceanData = await data2.json();
                setPortMakers(portData);
                waterPolygons = duplicateWaterPolygons(oceanData);
            } catch (err) {
                $('.trip-info-container').html(`<h2 class="important-alert text-danger">${err}</h2>`);
            }
        })();

        let allCords = [];
        let cord1 = null;
        let cord2 = null;
        let totalDistance = 0;
        const journeyLayerGroup = L.layerGroup().addTo(map);

        map.on('click', (event) => {
            if (!waterPolygons) return;
            const thisLat = event.latlng.lat;
            const thisLong = event.latlng.lng;
            const clickedPoint = [thisLat, thisLong];
            const point = turf.point([event.latlng.lng, event.latlng.lat]);
            let isInWater = null;
            for (const feature of waterPolygons.features) {
                if (turf.booleanPointInPolygon(point, feature)) {
                    isInWater = true;
                    break;
                }
            }
            if (selectedPorts.length !== 0) {
                if (isInWater) {
                    if (selectedPorts.length === 1) {
                        cord1 = cord1 || selectedPorts[0].coordinates;
                        cord2 = clickedPoint;
                        const route = [cord1, cord2];
                        allCords.push(cord1, cord2);
                        L.marker(cord2, { icon: anchorIcon }).addTo(journeyLayerGroup).bounce(1);
                        L.polyline(route, { color: 'red', noClip: true }).addTo(journeyLayerGroup);
                        cord1 = cord2;
                    }
                } else {
                    // Alert when you click on land (leaflet Plugin, not a stupid alert)
                    notification.alert('Alert', 'You cannot place markers on land.', {
                        timeout: 1500,
                        closable: false,
                        dismissable: false,
                        icon: 'bi bi-life-preserver',
                        className: 'important-alert',
                    });
                }
            }
        });

        const startJourney = (async (thisPortData) => {
            if (selectedPorts.length === 0) {
                await localStorage.clear();
                await initVessels();
                await checkLocalStorage();
                journeyLayerGroup.clearLayers();
                cord1 = null;
                cord2 = null;
                totalDistance = 0;
                allCords = [];
                notification.info('Voyage started', 'Please select stops and your destination port.', {
                    timeout: 10000,
                    closable: true,
                    dismissable: true,
                    icon: 'bi bi-water',
                    className: 'info-alert',
                });
            }
            selectedPorts.push(thisPortData);
            $('#btnStopTrip').show();
            if (selectedPorts.length === 2) {
                cord1 = cord1 || selectedPorts[0].coordinates;
                cord2 = selectedPorts[1].coordinates;
                const route = [cord1, cord2];
                allCords.push(cord1, cord2);
                totalDistance = calculateDistanceTravelled().toFixed(1);
                L.polyline(route, { color: 'red', noClip: true }).addTo(journeyLayerGroup);
                animateBoat(allCords);
                initTrip(selectedPorts, totalDistance);
                cord1 = cord2;
                selectedPorts = [];
                notification.success('Voyage Complete', `Total Distance: <strong>${totalDistance}NM</strong>`, {
                    timeout: 10000,
                    dismissable: true,
                    icon: 'bi bi-suitcase-lg-fill',
                    className: 'success-alert',
                });
            }
        });

        if (localStorage.length) {
            $('#btnStopTrip').show();
        }
        $('#btnStopTrip').click(() => {
            resetTrip();
        });

        let calculateDistanceTravelled = (() => {
            let distanceTotal = 0;
            //= ============================LOOPS ✅=============================
            for (let i = 0; i < allCords.length - 1; i++) {
                const thisDistance = map.distance(allCords[i], allCords[i + 1]);
                distanceTotal += thisDistance;
            }
            // Meters -> KM -> NM;
            return ((distanceTotal / 1000) * 0.5399568);
        });

        // Incrementally move boat (uses leaflet slideTo plugin)
        let animateBoat = ((allCords) => {
            const boatMarker = L.marker(allCords[0], { icon: boatIcon }).addTo(journeyLayerGroup);
            let count = 0;
            const moveToNext = () => {
                if (count < allCords.length - 1) {
                    count++;
                    boatMarker.slideTo(allCords[count], {
                        duration: 5000,
                    });
                    setTimeout(moveToNext, 4500);
                }
            };
            moveToNext();
        });
    });

    // Refreshes page
    let resetTrip = (() => {
        localStorage.clear();
        location.reload();
    });

    const getLocationInfo = ((lat, long) =>
            //= ============================FETCH ✅=============================
            new Promise((resolve, reject) => {
                // Set up the variables to hold the data
                let localeTime; let
                    localeWeather;
                //= ============================ASYNC AWAIT ✅=============================
                // Fetch respective data from Azure Maps API using our passed in lat and long
                (async () => {
                    try {
                        const [data1, data2] = await Promise.all([
                            fetch(`https://atlas.microsoft.com/timezone/byCoordinates/json?api-version=1.0&options=all&query=${lat},${long}&subscription-key=${AZUREKEY}`),
                            fetch(`https://atlas.microsoft.com/weather/currentConditions/json?api-version=1.0&query=${lat},${long}&subscription-key=${AZUREKEY}`),
                        ]);
                        const timeZoneData = await data1.json();
                        const weatherData = await data2.json();
                        localeTime = getUTCTime(timeZoneData);
                        localeWeather = getCurrentWeather(weatherData);

                        // return the data to the calling function
                        resolve({ localeTime, localeWeather });
                    } catch (err) {
                        reject(err);
                    }
                })();

                // Get Location's current time
                let getUTCTime = ((UTCTime) => {
                    //= ============================JSON DECONSTRUCTION ✅=============================
                    // Get the current time in the local timezone
                    const wallTime = (UTCTime.TimeZones[0].ReferenceTime.WallTime);
                    const date = wallTime.replace(/T.*$/g, '');
                    const time = (/\d{2}:\d{2}(?!$)/g).exec(wallTime);

                    // Get the country and timezone name
                    const country = (UTCTime.TimeZones[0].Countries[0].Name);
                    const timeZone = UTCTime.TimeZones[0].Names.Generic;

                    // Get the sunrise and sunset times
                    let sunRise = (UTCTime.TimeZones[0].ReferenceTime.Sunrise);
                    sunRise = (/\d{2}:\d{2}(?!$)/g).exec(sunRise);
                    let sunSet = (UTCTime.TimeZones[0].ReferenceTime.Sunset);
                    sunSet = (/\d{2}:\d{2}(?!$)/g).exec(sunSet);
                    const sunCycle = [sunRise, sunSet];

                    // return the data as an object
                    return {
                        date, time, country, timeZone, sunCycle,
                    };
                });

                // Get Location's current weather
                let getCurrentWeather = ((weather) => {
                    //= ============================JSON DECONSTRUCTION ✅=============================
                    const { phrase } = weather.results[0];
                    const icon = weather.results[0].iconCode;
                    const precipitation = weather.results[0].hasPrecipitation;
                    const temperature = weather.results[0].temperature.value;

                    // return the data as an object
                    return {
                        phrase, icon, precipitation, temperature,
                    };
                });
            })
    );

    const mapLocation = (async () => {
        //= ============================TRY, CATCH, FINALLY ✅=============================
        // First Try to get the location, catch any errors, finally always initialize the map
        try {
            // Initialize the map with the user's location
            await getLocation();
        } catch (err) {
            $('.trip-info-container').html(`<h2 class="important-alert text-danger">${err}</h2>`);
        } finally {
            // Initialize the map with the default location
            initMap();
            $('#loadingMap').hide();
        }
    })();

    let allVessels;
    let initVessels = (async () => {
        const getVessels = (async () => {
            //= ============================ASYNC AWAIT ✅=============================
            //= ============================FETCH ✅=============================
            try {
                const response = await fetch('./public/vessels.json');
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                const vesselData = await response.json();
                return vesselData;
            } catch (error) {
                $('.trip-info-container').append(`<h2 class="important-alert text-danger">${error}</h2>`);
            }
        });
        allVessels = await getVessels();
        vesselMasonry(allVessels);
    });

    let vesselMasonry = ((allVessels) => {
        $('#catalog').empty();
        //= ============================LOOPS ✅=============================
        // for of loop returning list of values
        for (const vessel of allVessels) {
            const boatCard = `
                    <div class="boat-card card-col col-sm-6 col-lg-4 mb-4">
                        <div class="card p-3 lh-lg">
                            <div class="circle mx-auto">
                              <img src="./assets/images/boats/${(vessel.photo_name)}" class="card-img-top p-5 " alt="${(vessel.name)}">
                            </div>
                            <div class="card-body bg-platinum rounded">
                              <h4 class="card-title text-center fw-bold">${(vessel.name)}</h4>
                              <p class="card-text">
                                <strong>Type:</strong> <span class="fs-5">${(vessel.type)}</span><br>
                                <strong>Length:</strong> <span class="fs-5">${(vessel.length_meters)} meters</span><br>
                                <strong>Speed:</strong> <span class="fs-5">${(vessel.speed_knots)} knots</span><br>
                                <strong>Crew Required:</strong> <span class="fs-5">${(vessel.crew_required)}</span><br>
                                <strong>Crew Cost:</strong> <span class="fs-5">$${(vessel.crew_cost_per_member)} per member</span><br>
                                <strong>Base Rental Rate:</strong> <span class="fw-bold fs-5">$${(vessel.base_rental_rate)}/day</span><br>
                                <strong>Fuel Surcharge:</strong> <span class="fs-5">$${(vessel.fuel_surcharge)}</span><br>
                                <strong>Max Distance:</strong> <span class="fs-5">${(vessel.max_travel_distance_nautical_miles)} nautical miles</span><br>
                                <strong>Cost per Mile:</strong> <span class="fs-5">$${(vessel.cost_per_nautical_mile)}</span><br>
                                <strong>Suitable for Rain:</strong> <span class="fs-5">${vessel.suitable_for_rain ? 'Yes' : 'No'}</span>
                              </p>
                              <button class="addToCart btn btn-primary fw-bold" type="button" value='${JSON.stringify(vessel)}'>Add Vessel To Cart</button>
                            </div>
                        </div>
                    </div>
                      `;
            $('#catalog').append(boatCard);
        }
        refreshMasonry();
    });

    const sortVessels = ((sortVal) => {
        const alphaSort = ((sortVal) => {
            allVessels.sort((a, b) => {
                const nameA = a[sortVal].toUpperCase();
                const nameB = b[sortVal].toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                // 0 means names are equal
                return 0;
            });
        });
        // Sort alpabetical, desc and asc, by comparing the values with each other (performing basic arithmetic if needed)
        switch (sortVal) {
            case 'type':
                alphaSort(sortVal);
                break;
            case 'duration_desc':
                allVessels.sort((a, b) => a.speed_knots - b.speed_knots);
                break;
            case 'cost_to_client_desc':
                allVessels.sort((a, b) => {
                    const valueA = a.base_rental_rate + (a.crew_required * a.crew_cost_per_member) + a.cost_per_nautical_mile;
                    const valueB = b.base_rental_rate + (b.crew_required * b.crew_cost_per_member) + b.cost_per_nautical_mile;
                    return valueA - valueB;
                }).reverse();
                break;
            case 'duration_asc':
                allVessels.sort((a, b) => a.speed_knots - b.speed_knots).reverse();
                break;
            case 'cost_to_client_asc':
                allVessels.sort((a, b) => {
                    const valueA = a.base_rental_rate + (a.crew_required * a.crew_cost_per_member) + a.cost_per_nautical_mile;
                    const valueB = b.base_rental_rate + (b.crew_required * b.crew_cost_per_member) + b.cost_per_nautical_mile;
                    return valueA - valueB;
                });
                break;
            default:
                return allVessels;
        }
        vesselMasonry(allVessels);
    });

    // Sort section
    $('#mnuSortVessels').on('change', () => {
        const choice = $('select#mnuSortVessels').val();
        sortVessels(choice);
        validateButtons();
    });

    // This checks a bunch of stuff, essentially seeing if there is previous trip data in cart
    let checkLocalStorage = (async () => {
        await (async () => {
            const overlay = $('.overlay');
            if (localStorage.length !== 0) {
                $('.cart-body').html(`
                     <ul class="cart-group list-group rounded-0" style="width: fit-content"></ul>
                       <button class="clearCart btn btn-primary fw-bold mt-2" type="button">Clear Cart</button>
                       <div class="mt-5">
                           <h2 class="estimatedTripCost">Estimated Total: </h2>
                           <button class="checkOut btn btn-primary fw-bold" type="button"  data-bs-toggle='modal' data-bs-target='#staticBackdrop'>Check Out...</button>
                       </div>
                `);
                //If there is a past trip saved, get it and make everything consistent as it should be
                if (localStorage.getItem('tripDetails')) {
                    const tripDetails = JSON.parse(localStorage.getItem('tripDetails'));
                    allVessels = tripDetails.capableVessels;
                    vesselMasonry(tripDetails.capableVessels);
                    setTripInfo(tripDetails);
                }
                //VALIDATE EVERYTHING
                validateCartItems();
                validateButtons();
                calculateVesselCost();
            } else {
                $('.cart-body').html('<h1>Please map your voyage then choose your boats...</h1>');
                overlay.hide();
                $('#boatSelectionParent').on({
                    mouseenter: () => overlay.fadeIn(),
                    mouseleave: () => overlay.fadeOut(),
                });
                $('#catalog .addToCart').each(function () {
                    $(this).show();
                });
            }
        })();
        // Something not updating? Always bet on the masonry...
        refreshMasonry();
    });

    // Validate that the correct cart items are in cart/ and not DUPED
    let validateCartItems = (() => {
        for (let i = 0; i < localStorage.length; i++) {
            const value = localStorage.getItem(localStorage.key(i));
            if (localStorage.key(i) !== 'tripDetails') {
                setCartItem(JSON.parse(value));
            }
        }
    });

    // Checks if a button needs to be hidden for something already in the storage/cart
    let validateButtons = (() => {
        for (let i = 0; i < localStorage.length; i++) {
            const value = localStorage.getItem(localStorage.key(i));
            if (localStorage.key(i) !== 'tripDetails') {
                // This is checking to see if the boat it already in the cart
                $('#catalog .addToCart').each(function () {
                    if (value === $(this).val()) {
                        $(this).hide();
                    }
                });
            }
        }
    });

    // check localstorage on page load. first inits all vesels, then corrects view accordingly;
    (async () => {
        await initVessels();
        checkLocalStorage();
    })();

    // Add or remove items from cart in the offcanvas
    let setCartItem = ((vessel) => {
        $('.cart-group').append(`
           <li class="cart-item list-group-item">
               <button class="removeItem btn btn-primary text-danger fw-bold" type="button" value='${JSON.stringify(vessel)}'><i class="bi bi-eraser" role="button" aria-label="Remove From Cart" ></i></button>
               <p class="d-inline">
                   <strong>${(vessel.name)}</strong> (${(vessel.type)}) - ${(vessel.length_meters)}m, ${(vessel.speed_knots)} knots, Total Crew Cost: ${vessel.crew_required * vessel.crew_cost_per_member}, Cost: $${(vessel.base_rental_rate)}/day, Fuel: $${(vessel.fuel_surcharge)}, Max Distance: ${(vessel.max_travel_distance_nautical_miles)} nm, Rain Ready: ${vessel.suitable_for_rain ? 'Yes' : 'No'}
               </p>
           </li>
       `);
    });

    // Just get a full amount pre fees/taxes;
    let calculateVesselCost = (() => {
        const tripDetails = JSON.parse(localStorage.getItem('tripDetails'));
        let base_cost = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const vessel = JSON.parse(localStorage.getItem(localStorage.key(i)));
            if (key === 'tripDetails') {
                continue;
            }
            const {
                crew_required, crew_cost_per_member, base_rental_rate, fuel_surcharge, cost_per_nautical_mile
            } = vessel;
            base_cost += (base_rental_rate + (crew_required * crew_cost_per_member) + (tripDetails.totalDistance * cost_per_nautical_mile) + (tripDetails.rain ? fuel_surcharge : 0));
        }
        $('.estimatedTripCost').append(`
           <p class="trip-cost  d-inline"><strong> $${base_cost.toFixed(2)}</strong></p>
       `);
        return base_cost;
    });

    // Add to cart, which then checks the storage, the storage then validates the buttosn and such
    $('#catalog').on('click', '.addToCart', function () {
        addToCart(JSON.parse($(this).val()));
    });
    let addToCart = (async (vessel) => {
        const vesselName = (vessel.name).replaceAll(' ', '-');
        await localStorage.setItem(vesselName, JSON.stringify(vessel));
        checkLocalStorage();
    });

    $('.cart-body').on('click', '.clearCart', () => {
        // this is such a stupid way to do this, but I dont care... Joe's projects always take me the longest, I got other classes to worry about istg
        // im crashing out 🥀💔😭
        const tripDetails = (localStorage.getItem('tripDetails'));
        localStorage.clear();
        localStorage.setItem('tripDetails', tripDetails);
        checkLocalStorage();
    });

    $('.cart-body').on('click', '.removeItem', function () {
        const vessel = JSON.parse($(this).val());
        localStorage.removeItem(vessel.name.replaceAll(' ', '-'));
        checkLocalStorage();
        $('#catalog .addToCart').each(function () {
            const buttonValue = JSON.stringify(JSON.parse($(this).val()));
            for (let i = 0; i < localStorage.length; i++) {
                if (localStorage.key(i) !== 'tripDetails' && buttonValue === localStorage.getItem(localStorage.key(i))) {
                    $(this).hide();
                }
            }
        });
    });

    // Initialzing the trip and stores the trip info on local storage
    let initTrip = (async (selectedPorts, totalDistance) => {
        let rain = false;
        const tripCost = 0;
        await (async () => {
            for (const port of selectedPorts) {
                const portStatus = await getLocationInfo(port.coordinates[0], port.coordinates[1]);
                if (portStatus.localeWeather.precipitation) {
                    rain = true;
                    port.rain = true;
                }
            }
        })();
        // This is so the masonry will display the relevant/capable vessels
        const capableVessels = [];
        await allVessels.forEach((vessel) => {
            if (vessel.max_travel_distance_nautical_miles >= totalDistance || vessel.max_travel_distance_nautical_miles === 'Unlimited') {
                if (rain) {
                    if (vessel.suitable_for_rain) {
                        capableVessels.push(vessel);
                    }
                } else {
                    capableVessels.push(vessel);
                }
            }
        });
        allVessels = capableVessels;
        setTripInfo({ selectedPorts, totalDistance, rain });
        vesselMasonry(capableVessels);
        localStorage.setItem('tripDetails', JSON.stringify({
            selectedPorts,
            totalDistance,
            rain,
            tripCost,
            capableVessels,
        }));
    });

    // Displays trip info after seleccting ports
    let setTripInfo = (({ selectedPorts, totalDistance, rain }) => {
         $('.trip-info-container').fadeIn(() => {
             $('.trip-info-container').html(`
                 <div class="trip-card card bg-platinum text-richBlack">
                     <div class="card-body">
                         <h2 class="card-title text-center fw-bold">Trip Info:</h2>
                         <hr>
                         <p><strong>Starting Port:</strong> ${selectedPorts[0].id}</p>
                         <p><strong>Destination Port:</strong> ${selectedPorts[1].id}</p>
                         <p><strong>Total Distance:</strong> ${totalDistance} NM</p>
                         <p><strong>Rain Expected:</strong> ${rain ? 'Yes' : 'No'}</p>
                     </div>
                 </div>
             `);
         });
        // This makes it so the overlay appears and you cant click over it
        $('#boatSelectionParent').off('mouseenter');
        $('#boatSelectionParent').off('mouseleave');
        $('.overlay').toggle(false);
    });

    // Always bet on the masonry not working...
    let refreshMasonry = (() => {
        const catalog_container = document.getElementById('catalog'); // assuming your target is <div class='row' id='catalog'>
        jQuery(catalog_container).imagesLoaded(() => {
            const msnry = new Masonry(catalog_container); // this initializes the masonry container AFTER the product images are loaded
        });
    });

    const checkoutCartView = async () => {
        const tripDetails = JSON.parse(localStorage.getItem('tripDetails'));
        if (!tripDetails) return;
        let totalBeforeTax = 0;
        const taxRate = TAX_RATE;
        const checkoutListHTML = '';
        // Reset the checkout area so it doesnt DUPLICATE
        $('#checkoutCart').empty();
        // Add list group container
        $('#checkoutCart').append(`
        <h4 class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-muted">Your Cart</span>
        </h4>
        <ul id="checkoutList" class="list-group mb-3"></ul>
    `);

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Ignore the tripdetails so i doesnt break my forms
            if (key === 'tripDetails') continue;

            const vessel = JSON.parse(localStorage.getItem(key));

            const costPerNM = vessel.cost_per_nautical_mile * tripDetails.totalDistance;
            const crewCost = vessel.crew_required * vessel.crew_cost_per_member;
            const rainSurcharge = tripDetails.rain ? vessel.fuel_surcharge : 0;

            const vesselTotal = vessel.base_rental_rate + crewCost + costPerNM + rainSurcharge;
            totalBeforeTax += vesselTotal;

            $('#checkoutList').append(`
            <li class="list-group-item d-flex justify-content-between lh-condensed">
                <div>
                    <h6 class="my-0 fw-bold">${(vessel.name)}</h6>
                    <small class="text-white">Base: $${vessel.base_rental_rate.toFixed(2)}, Crew: $${crewCost.toFixed(2)}, 
                        Total NM Cost: $${costPerNM.toFixed(2)}, Rain: $${rainSurcharge}</small>
                </div>
                <span class="text-white">$${vesselTotal.toFixed(2)}</span>
            </li>
        `);
        }

        // Calculate tax and total
        const tax = totalBeforeTax * taxRate;
        const finalTotal = totalBeforeTax + tax;
        $('#checkoutList').append(`
        <li class="list-group-item d-flex justify-content-between ">
            <div class="text-white">
                <h6 class="my-0">Taxes</h6>
                <small class="my-0 fw-bold">${(taxRate * 100).toFixed(2)}%</small>
            </div>
            <span class="text-white">+$${tax.toFixed(2)}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between">
            <span><strong>Total (CAD)</strong></span>
            <strong>$${finalTotal.toFixed(2)}</strong>
        </li>
    `);
        $('#checkoutCart').append(`
        <form class="card p-2 mt-3 bg-darkBlue text-white">
            <div id="portSelection">
                <h5 class="">Route: ${tripDetails.selectedPorts[0].id} ➜<br>${tripDetails.selectedPorts[1].id}</h5>
                <p class="mb-0">Total Distance: <span class="fw-bold">${tripDetails.totalDistance} NM</span></p>
                <p class="mb-0">Rain Expected: ${tripDetails.rain ? 'Yes 🌧️' : 'No ☀️'}</p>
            </div>
        </form>
    `);
    };
    $(document).on('click', '.checkOut', checkoutCartView);

    //= ============================JQUERY DOM ⬇️=============================
    // This has a bunch of fadeins, fadeouts...
  $('#completeCheckout').on('click', () => {
        if (validateForm()) {
            $('#checkOutDesc').html('<span class="text-success fw-bold">✅ Payment Submitted!</span>');
            $('.modal-body').fadeOut(2500, () => {
                $('.modal-body').html(`
                    <div class="text-center">
                        <img id="loadingMap" class="mb-3 mx-auto" src="./assets/images/compass.svg" style="height: 150px;"/>
                        <p class="mt-3">Processing your order...</p>
                    </div>
                `).fadeIn(2500, () => {
                    $('.modal-body').fadeOut(2500, () => {
                        $('.modal-body').html('<h1 class="text-center text-white">Order Complete! A confirmation email has been sent.</h1>').fadeIn(1500);
                        setTimeout(()=>{resetTrip();},3500);
                    });
                });
            });
        }
    });

    //= ============================REGEX FORM VALIDATION ✅ =============================
    //= ============================FULL FORM VALIDATION ✅ =============================
    function validateForm() {
        // Get the values from the form using the form index 0 for the first form on the page, and the index of the input field
        //Trim white space for ease of use (I dont know if we were allowed to use HTML required attribute but here this is;
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const city = document.getElementById('city').value.trim();
        const country = document.getElementById('country').value.trim();
        const postal = document.getElementById('postal').value.trim();
        const ccNumber = document.getElementById('cc-number').value.trim();
        const ccExp = document.getElementById('cc-expiration').value.trim();
        const ccCVV = document.getElementById('cc-cvv').value.trim();

        // Regular expressions for the form fields
        const namePattern = /^[a-zA-Z]+$/;
        // Letters spaces at least 2
        const cityPattern = /^[a-zA-Z\s]{2,}$/;
        // letters, spaces, and min 5;
        const addressPattern = /^[\w\s\d\.,#-]{5,}$/;
        //include varies characters one or more times @ domain one or more time '.' top level domain min two chars
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        //222-222-222 or 222 222 222
        const phonePattern = /^[0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{4}$/;
        const postalPattern = /^[ABCEGHJKLMNPRSTVWXYZ]\d[ABCEGHJKLMNPRSTVWXYZ][ -]?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i;
        // 16 digits only with spaces and "-"
        const ccNumberPattern = /^(\d{4}[-\s]?){3}\d{4}$/;
        // MM/YY format, valid months ex. 01/12 with '/'
        const ccExpPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
        // 3 digits
        const ccCVVPattern = /^\d{3}$/;

        // Validate the form fields boolean, mostly implemented from previous lab
        try {
            switch (true) {
                case !firstName || !lastName || !email || !phone || !address || !city || !country || !postal || !ccNumber || !ccExp || !ccCVV:
                    throw '⚠️ All fields must be filled out.';
                case !namePattern.test(firstName) || !namePattern.test(lastName):
                    throw '⚠️ First and last name must only contain letters.';
                case !emailPattern.test(email):
                    throw '⚠️ Invalid email format.';
                case !phonePattern.test(phone):
                    throw '⚠️ Phone must be in format: 123-456-7890.';
                case !addressPattern.test(address):
                    throw '⚠️ Address must be at least 5 characters.';
                case !cityPattern.test(city):
                    throw '⚠️ City must only contain letters and spaces.';
                case !postalPattern.test(postal):
                    throw '⚠️ Postal code must be in format A1A 1A1.';
                case !ccNumberPattern.test(ccNumber):
                    throw "⚠️ Credit card number must be 16 digits and may include spaces or '-''s.";
                case !ccExpPattern.test(ccExp):
                    throw '⚠️ Expiration must be in MM/YY .';
                case !ccCVVPattern.test(ccCVV):
                    throw '⚠️ CVV must be exactly 3 digits. NO AMERICAN Express or Discover';
            }
            //   display error  in the formError
        } catch (error) {
            $('#checkOutDesc').html(`<span class="text-danger fw-bold">${error}</span>`);
            $('.modal-body').scrollTop(0);
            return false;
        }
        return true;
    }
});
