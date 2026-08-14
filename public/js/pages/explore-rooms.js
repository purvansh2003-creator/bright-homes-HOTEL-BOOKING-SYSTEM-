import { logout } from "../utils/logout.js";
import { loadWeatherCard } from "../utils/weather_card.js";
import { initSidebar } from "../utils/sidebar.js";

loadWeatherCard();
logout();
initSidebar();

/* =====================================================
   SKELETON LOADER
   ===================================================== */
function showSkeleton() {
  const container = document.getElementById("roomContainer");
  container.innerHTML = `
    <div class="rooms-section">
      <div class="rooms-grid">
        ${Array(3).fill("").map(() => `
          <div class="skeleton skeleton-card">
            <div class="skeleton skeleton-card-img"></div>
            <div class="skeleton-card-body">
              <div class="skeleton skeleton-heading"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text short"></div>
              <div style="height:16px"></div>
              <div style="display:flex; gap:8px;">
                <div class="skeleton" style="width:80px; height:28px; border-radius:20px;"></div>
                <div class="skeleton" style="width:80px; height:28px; border-radius:20px;"></div>
                <div class="skeleton" style="width:80px; height:28px; border-radius:20px;"></div>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

/* =====================================================
   SCROLL REVEAL OBSERVER
   ===================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
  );

  reveals.forEach((el) => observer.observe(el));
}

/* =====================================================
   AMENITIES LIST
   ===================================================== */
const defaultAmenities = ["Free WiFi", "Air Conditioning", "Smart TV", "Breakfast"];

/* =====================================================
   MAIN FETCH + RENDER
   ===================================================== */
async function roomDataFetch() {
  showSkeleton();

  try {
    const response = await fetch("/api/room-types", { method: "GET" });
    const data = await response.json();

    renderHero(data.roomTypes.length);
    renderRooms(data.roomTypes);
    initScrollReveal();
  } catch (err) {
    document.getElementById("roomContainer").innerHTML = `
      <div class="rooms-section">
        <div class="no-rooms">
          <div class="no-rooms-icon">&#9888;&#65039;</div>
          <h2 class="no-rooms-title">Something went wrong</h2>
          <p class="no-rooms-text">Unable to load rooms. Please try refreshing the page.</p>
        </div>
      </div>`;
  }
}

/* =====================================================
   RENDER HERO
   ===================================================== */
function renderHero(roomCount) {
  const heroContainer = document.getElementById("exploreHero");
  if (heroContainer) {
    heroContainer.innerHTML = `
      <div class="explore-hero-content">
        <div class="hero-left">
          <span class="hero-eyebrow">Find your perfect stay</span>
          <h1 class="hero-title">Explore <em>Our Rooms.</em></h1>
          <p class="hero-subtitle">Choose the perfect stay for your comfort. Each room is designed to make you feel at home.</p>
        </div>
        <div class="hero-right">
          <div class="room-count-badge">
            <span class="count">${roomCount}</span> room types available
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
   RENDER ROOMS GRID
   ===================================================== */
function renderRooms(rooms) {
  const container = document.getElementById("roomContainer");

  if (!rooms || rooms.length === 0) {
    container.innerHTML = `
      <div class="rooms-section">
        <div class="no-rooms">
          <div class="no-rooms-icon">&#128716;</div>
          <h2 class="no-rooms-title">No rooms found</h2>
          <p class="no-rooms-text">Check back later for available rooms.</p>
        </div>
      </div>`;
    return;
  }

  const cards = rooms
    .map((room, index) => {
      const amenities = defaultAmenities;
      return `
      <a href="/rooms?type=${room.room_type}" class="room-card" style="animation-delay: ${0.1 + index * 0.1}s">
        <div class="room-card-image-wrapper">
          <img class="room-card-image" src="${room.room_image}" alt="${room.room_type} room" loading="lazy">
          <div class="room-card-type-badge">${room.room_type}</div>
          <div class="room-card-price-badge">&#8377;${room.room_price_per_night.toLocaleString()} <span>/ night</span></div>
        </div>
        <div class="room-card-body">
          <h3 class="room-card-name">${room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)} Room</h3>
          <p class="room-card-description">${room.room_description}</p>
          <div class="room-card-meta">
            <div class="room-card-meta-item">
              <div class="room-card-meta-icon">&#128101;</div>
              <span>${room.room_capacity} Guests</span>
            </div>
            <div class="room-card-meta-item">
              <div class="room-card-meta-icon">&#127968;</div>
              <span>Premium</span>
            </div>
          </div>
          <div class="room-card-amenities">
            ${amenities.map((a) => `<span class="amenity-tag">${a}</span>`).join("")}
          </div>
          <div class="room-card-footer">
            <div class="room-card-price-text">&#8377;${room.room_price_per_night.toLocaleString()} <span>/ night</span></div>
            <div class="room-card-cta">
              View Room
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
          </div>
        </div>
      </a>`;
    })
    .join("");

  container.innerHTML = `
    <div class="rooms-section">
      <div class="rooms-grid">
        ${cards}
      </div>
    </div>
  `;
}

/* =====================================================
   INIT
   ===================================================== */
roomDataFetch();
