import { logout } from "../utils/logout.js";
import { loadWeatherCard } from "../utils/weather_card.js";
import { initSidebar } from "../utils/sidebar.js";

loadWeatherCard();
logout();
initSidebar();

const theHouse = document.getElementById('theHouse');
theHouse.addEventListener('click', () => {
    window.location.href = '/explore-rooms';
});

let allPlaces = [];
let activeFilter = "ALL";

/* =====================================================
   CATEGORY ICONS + LABELS
   ===================================================== */
const categoryConfig = {
    Attraction: { icon: "\u{1F3F0}", label: "Attraction" },
    Restaurant: { icon: "\u{1F37D}\uFE0F", label: "Restaurant" },
    Cafe: { icon: "\u2615", label: "Cafe" },
    Park: { icon: "\u{1F333}", label: "Park" },
    Shopping: { icon: "\u{1F6CD}\uFE0F", label: "Shopping" },
    Place: { icon: "\u{1F4CD}", label: "Place" }
};

/* =====================================================
   SKELETON LOADER
   ===================================================== */
function showSkeleton() {
    const container = document.getElementById("aroundTownContainer");
    container.innerHTML = `
        <div class="town-hero">
            <div class="town-hero-content">
                <div class="hero-left">
                    <div class="skeleton skeleton-text short" style="background:rgba(255,255,255,0.15);width:140px;height:12px;"></div>
                    <div class="skeleton skeleton-heading" style="background:rgba(255,255,255,0.1);width:350px;height:40px;"></div>
                    <div class="skeleton skeleton-text" style="background:rgba(255,255,255,0.08);width:300px;height:16px;"></div>
                </div>
                <div class="hero-right">
                    <div class="skeleton skeleton-badge" style="background:rgba(255,255,255,0.1);width:180px;height:42px;border-radius:30px;"></div>
                </div>
            </div>
        </div>
        <div class="filters-section">
            <div class="filters-bar">
                ${Array(6).fill("").map(() => `<div class="skeleton" style="width:90px;height:38px;border-radius:30px;"></div>`).join("")}
            </div>
        </div>
        <div class="places-section">
            <div class="places-grid">
                ${Array(6).fill("").map(() => `
                    <div class="skeleton-card">
                        <div class="skeleton skeleton-card-top"></div>
                        <div class="skeleton-card-body">
                            <div class="skeleton skeleton-heading"></div>
                            <div class="skeleton skeleton-text"></div>
                            <div class="skeleton skeleton-text short"></div>
                            <div style="height:16px"></div>
                            <div class="skeleton skeleton-btn"></div>
                        </div>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}

/* =====================================================
   RENDER HERO
   ===================================================== */
function renderHero(placeCount) {
    const heroContainer = document.getElementById("townHero");
    if (heroContainer) {
        heroContainer.innerHTML = `
            <div class="town-hero-content">
                <div class="hero-left">
                    <span class="hero-eyebrow">Discover Lucknow</span>
                    <h1 class="hero-title">Explore <em>Around Town.</em></h1>
                    <p class="hero-subtitle">Find the best attractions, restaurants, cafes, parks, and shops near Bright Homes.</p>
                </div>
                <div class="hero-right">
                    <div class="place-count-badge">
                        <span class="count">${placeCount}</span> places nearby
                    </div>
                    <a href="/dashboard" class="back-to-dashboard">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Dashboard
                    </a>
                </div>
            </div>
        `;
    }
}

/* =====================================================
   RENDER FILTERS
   ===================================================== */
function renderFilters() {
    const filtersContainer = document.getElementById("filtersBar");
    if (!filtersContainer) return;

    const categories = ["ALL", "ATTRACTIONS", "RESTAURANTS", "CAFES", "SHOPPING", "PARKS"];
    filtersContainer.innerHTML = categories.map(cat => `
        <button class="filter-btn${cat === activeFilter ? ' active' : ''}" data-filter="${cat}">
            ${cat}
        </button>
    `).join("");

    filtersContainer.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            activeFilter = btn.dataset.filter;
            filtersContainer.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderPlaces(filterPlaces(allPlaces));
        });
    });
}

/* =====================================================
   FILTER PLACES
   ===================================================== */
function filterPlaces(places) {
    if (activeFilter === "ALL") return places;
    const map = {
        ATTRACTIONS: "Attraction",
        RESTAURANTS: "Restaurant",
        CAFES: "Cafe",
        SHOPPING: "Shopping",
        PARKS: "Park"
    };
    return places.filter(p => p.category === map[activeFilter]);
}

/* =====================================================
   RENDER PLACES
   ===================================================== */
function renderPlaces(places) {
    const container = document.getElementById("placesContainer");
    if (!container) return;

    if (places.length === 0) {
        container.innerHTML = `
            <div class="state-container">
                <div class="state-icon">&#128269;</div>
                <h2 class="state-title">No places found</h2>
                <p class="state-text">No nearby places found for this category. Try a different filter.</p>
            </div>
        `;
        return;
    }

    const cards = places.map((place, index) => {
        const config = categoryConfig[place.category] || categoryConfig.Place;
        const addressHTML = place.address
            ? `<div class="place-address">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    ${place.address}
               </div>`
            : `<div class="place-address empty">Address not available</div>`;

        return `
            <div class="place-card" style="animation: fadeInUp 0.4s ease forwards; animation-delay: ${0.05 + index * 0.05}s; opacity: 0;">
                <div class="place-card-top">
                    <div class="place-category-badge ${place.category.toLowerCase()}">
                        <span class="place-category-icon">${config.icon}</span>
                        ${config.label}
                    </div>
                    <div class="place-distance">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        ${place.distance}
                    </div>
                </div>
                <div class="place-card-body">
                    <h3 class="place-name">${place.name}</h3>
                    ${addressHTML}
                </div>
                <div class="place-card-footer">
                    <a href="${place.osmUrl}" target="_blank" rel="noopener noreferrer" class="place-map-link">
                        View on Map
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </a>
                </div>
            </div>
        `;
    }).join("");

    container.innerHTML = `
        <div class="places-section">
            <div class="places-grid">
                ${cards}
            </div>
        </div>
    `;
}

/* =====================================================
   RENDER ERROR STATE
   ===================================================== */
function renderError() {
    const container = document.getElementById("aroundTownContainer");
    container.innerHTML = `
        <div class="town-hero" id="townHero"></div>
        <div class="filters-section" id="filtersSection">
            <div class="filters-bar" id="filtersBar"></div>
        </div>
        <div class="state-container">
            <div class="state-icon">&#9888;&#65039;</div>
            <h2 class="state-title">Unable to load places</h2>
            <p class="state-text">We couldn't load nearby places around Bright Homes. Please check your connection and try again.</p>
            <button class="retry-btn" id="retryBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Try Again
            </button>
        </div>
    `;
    document.getElementById("retryBtn").addEventListener("click", fetchPlaces);
}

/* =====================================================
   RENDER EMPTY STATE
   ===================================================== */
function renderEmpty() {
    const container = document.getElementById("aroundTownContainer");
    container.innerHTML = `
        <div class="town-hero" id="townHero"></div>
        <div class="filters-section" id="filtersSection">
            <div class="filters-bar" id="filtersBar"></div>
        </div>
        <div class="state-container">
            <div class="state-icon">&#128205;</div>
            <h2 class="state-title">No nearby places found</h2>
            <p class="state-text">We couldn't find any places around Bright Homes at the moment. Please try again later.</p>
            <button class="retry-btn" id="retryBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Try Again
            </button>
        </div>
    `;
    document.getElementById("retryBtn").addEventListener("click", fetchPlaces);
}

/* =====================================================
   MAIN FETCH
   ===================================================== */
async function fetchPlaces() {
    showSkeleton();

    try {
        const response = await fetch("/api/around-town", { method: "GET" });
        const data = await response.json();

        if (!data.success) {
            renderError();
            return;
        }

        allPlaces = data.places;

        if (allPlaces.length === 0) {
            renderEmpty();
            return;
        }

        const container = document.getElementById("aroundTownContainer");
        container.innerHTML = `
            <div class="town-hero" id="townHero"></div>
            <div class="filters-section" id="filtersSection">
                <div class="filters-bar" id="filtersBar"></div>
            </div>
            <div id="placesContainer"></div>
        `;

        renderHero(allPlaces.length);
        renderFilters();
        renderPlaces(filterPlaces(allPlaces));

    } catch (err) {
        renderError();
    }
}

/* =====================================================
   INIT
   ===================================================== */
fetchPlaces();
