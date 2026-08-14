import { logout } from "../utils/logout.js";
import { loadWeatherCard } from "../utils/weather_card.js";
import { initSidebar } from "../utils/sidebar.js";

logout();
loadWeatherCard();
initSidebar();

/* =====================================================
   SKELETON LOADER
   ===================================================== */
function showSkeleton() {
  const container = document.getElementById("roomDetailsContainer");
  container.innerHTML = `
    <div class="skeleton skeleton-hero"></div>
    <div class="room-content">
      <div class="room-details-left">
        <div style="padding:50px 40px; max-width:1300px; margin:0 auto;">
          <div class="skeleton skeleton-heading"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
          <div style="height:30px"></div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div class="skeleton skeleton-card" style="height:80px"></div>
            <div class="skeleton skeleton-card" style="height:80px"></div>
            <div class="skeleton skeleton-card" style="height:80px"></div>
            <div class="skeleton skeleton-card" style="height:80px"></div>
          </div>
        </div>
      </div>
      <div class="room-booking-right">
        <div style="padding:28px;">
          <div class="skeleton skeleton-text short" style="margin-bottom:20px"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
          <div style="height:30px"></div>
          <div class="skeleton" style="height:52px; border-radius:12px; margin-bottom:16px"></div>
          <div class="skeleton" style="height:52px; border-radius:12px; margin-bottom:16px"></div>
          <div class="skeleton" style="height:52px; border-radius:30px"></div>
        </div>
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
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  reveals.forEach((el) => observer.observe(el));
}

/* =====================================================
   MAIN ROOM DATA FETCH + RENDER
   ===================================================== */
const roomType = new URLSearchParams(window.location.search).get("type");

async function roomDataFetch() {
  showSkeleton();

  try {
    const response = await fetch(`api/rooms?type=${encodeURIComponent(roomType)}`, {
      method: "GET",
    });
    const data = await response.json();

    renderRoomPage(data);
    initScrollReveal();
  } catch (err) {
    document.getElementById("roomDetailsContainer").innerHTML = `
      <div style="text-align:center; padding:80px 20px; color:var(--muted);">
        <h2 style="font-family:'Fraunces',serif; color:var(--ink); margin-bottom:10px;">Room not found</h2>
        <p>The room type you're looking for doesn't exist.</p>
        <a href="/explore-rooms" class="btn back" style="margin-top:20px; display:inline-flex;">Browse Rooms</a>
      </div>`;
  }
}

function renderRoomPage(data) {
  const amenities = [
    "Free WiFi",
    "Air Conditioning",
    "Smart TV",
    "Complimentary Breakfast",
    "Room Service",
    "Mini Bar",
  ];

  const highlights = [
    { icon: "👥", title: `${data.room_capacity} Guests`, desc: "Max capacity" },
    { icon: "📶", title: "Free WiFi", desc: "High-speed" },
    { icon: "❄️", title: "Air Conditioning", desc: "Climate control" },
    { icon: "🍳", title: "Breakfast", desc: "Complimentary" },
  ];

  const html = `
    <!-- HERO -->
    <div class="room-hero">
      <img class="room-hero-img" src="${data.room_image}" alt="${data.room_type} room">
      <div class="room-hero-overlay">
        <div class="hero-top">
          <button id="backButton" class="hero-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <div class="hero-price-badge">
            <div class="hero-price-label">Price per night</div>
            <div class="hero-price-amount">&#8377;${data.room_price_per_night.toLocaleString()}</div>
          </div>
        </div>
        <div class="hero-bottom">
          <span class="hero-room-type">${data.room_type} Room</span>
          <h1 class="hero-room-name">${data.room_type.charAt(0).toUpperCase() + data.room_type.slice(1)} <em>Room.</em></h1>
        </div>
      </div>
    </div>

    <!-- TWO-COLUMN CONTENT -->
    <div class="room-content">

      <!-- LEFT: Details -->
      <div class="room-details-left">

        <div class="room-description-section reveal">
          <span class="section-eyebrow">About this room</span>
          <h2 class="section-title">A space designed for comfort</h2>
          <p class="room-description-text">${data.room_description}</p>
        </div>

        <div class="room-highlights reveal">
          ${highlights
      .map(
        (h) => `
            <div class="highlight-card">
              <div class="highlight-icon">${h.icon}</div>
              <div class="highlight-info">
                <h4>${h.title}</h4>
                <p>${h.desc}</p>
              </div>
            </div>`
      )
      .join("")}
        </div>

        <div class="amenities-section reveal">
          <span class="section-eyebrow">What's included</span>
          <h2 class="section-title">Amenities</h2>
          <div class="amenities-grid">
            ${amenities
      .map(
        (a) => `
              <div class="amenity-item">
                <div class="amenity-check">&#10003;</div>
                <span>${a}</span>
              </div>`
      )
      .join("")}
          </div>
        </div>

      </div>

      <!-- RIGHT: Booking Card (Sticky) -->
      <div class="room-booking-right">
        <div class="booking-card">
          <div class="booking-card-header">
            <div class="booking-card-price">&#8377;${data.room_price_per_night.toLocaleString()} <span>/ night</span></div>
            <div class="booking-card-rating">&#9733; 4.8</div>
          </div>

          <form id="availabilityForm" onsubmit="return false;">
            <div class="booking-date-group">
              <label class="booking-date-label">Check-in</label>
              <input id="checkIn" class="booking-date-input" placeholder="Select date" readonly>
            </div>
            <div class="booking-date-group">
              <label class="booking-date-label">Check-out</label>
              <input id="checkOut" class="booking-date-input" placeholder="Select date" readonly>
            </div>

            <div class="booking-breakdown">
              <div class="booking-line">
                <span>&#8377;${data.room_price_per_night.toLocaleString()} x <span id="nightCount">0</span> nights</span>
                <span id="subtotalPrice">&#8377;0</span>
              </div>
              <div class="booking-line">
                <span>Total</span>
                <span class="booking-total" id="totalPrice">&#8377;0</span>
              </div>
            </div>

            <button type="submit" class="booking-cta" id="checkAvailabilityBtn">
              Check Availability
            </button>
          </form>
          <p class="booking-note">Free cancellation up to 24 hours before check-in</p>
        </div>
      </div>

    </div>
  `;

  document.getElementById("roomDetailsContainer").innerHTML = html;

  // Back button
  document.getElementById("backButton").addEventListener("click", () => {
    window.location.href = "/explore-rooms";
  });

  // Flatpickr
  const checkInPicker = flatpickr("#checkIn", {
    minDate: "today",
    dateFormat: "Y-m-d",
    onChange: function (selectedDates) {
      if (selectedDates.length > 0) {
        const nextDay = new Date(selectedDates[0]);
        nextDay.setDate(nextDay.getDate() + 1);
        checkOutPicker.set("minDate", nextDay);

        const checkOutVal = document.getElementById("checkOut").value;
        if (checkOutVal && new Date(checkOutVal) <= selectedDates[0]) {
          document.getElementById("checkOut").value = "";
        }
      }
      updatePriceBreakdown();
    }
  });

  const checkOutPicker = flatpickr("#checkOut", {
    minDate: "today",
    dateFormat: "Y-m-d",
    onChange: updatePriceBreakdown
  });

  // Price breakdown updater
  function updatePriceBreakdown() {
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;
    if (checkIn && checkOut) {
      const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
      if (diff > 0) {
        document.getElementById("nightCount").textContent = diff;
        const subtotal = data.room_price_per_night * diff;
        document.getElementById("subtotalPrice").textContent = `\u20B9${subtotal.toLocaleString()}`;
        document.getElementById("totalPrice").textContent = `\u20B9${subtotal.toLocaleString()}`;
      }
    }
  }

  // Check availability
  document.getElementById("checkAvailabilityBtn").addEventListener("click", searchAvailability);

  async function searchAvailability() {
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;

    if (!checkIn || !checkOut) {
      alert("Please select both check-in and check-out dates");
      return;
    }

    const btn = document.getElementById("checkAvailabilityBtn");
    btn.textContent = "Searching...";
    btn.disabled = true;

    try {
      const response = await fetch("/api/check-availability", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roomType, checkIn, checkOut }),
      });
      const rooms = await response.json();

      renderAvailableRooms(rooms, checkIn, checkOut);
    } catch (err) {
      alert("Error checking availability. Please try again.");
    } finally {
      btn.textContent = "Check Availability";
      btn.disabled = false;
    }
  }

  // Load similar rooms
  loadSimilarRooms(data.room_type);
}

/* =====================================================
   RENDER AVAILABLE ROOMS
   ===================================================== */
function renderAvailableRooms(rooms, checkIn, checkOut) {
  const section = document.getElementById("availableSection");
  const container = document.getElementById("availabilityFormContainer");
  const countEl = document.getElementById("availableCount");

  section.style.display = "block";
  countEl.textContent = `${rooms.length} room${rooms.length !== 1 ? "s" : ""} available`;

  if (rooms.length === 0) {
    container.innerHTML = `
      <div class="no-rooms-message">
        <strong>No rooms available</strong>
        Try different dates to find an available room.
      </div>`;
    return;
  }

  container.innerHTML = rooms
    .map(
      (room) => `
    <div class="room-card">
      <div class="room-card-top">
        <div class="room-card-number">Room ${room.room_number}</div>
        <div class="room-card-status available">Available</div>
      </div>
      <button class="room-card-book" data-room-id="${room.room_id}">Book Now</button>
    </div>`
    )
    .join("");

  // Scroll to section
  section.scrollIntoView({ behavior: "smooth", block: "start" });

  // Bind book buttons
  document.querySelectorAll(".room-card-book").forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal(btn.dataset.roomId, checkIn, checkOut);
    });
  });
}

/* =====================================================
   SIMILAR ROOMS
   ===================================================== */
async function loadSimilarRooms(currentType) {
  try {
    const response = await fetch("/api/room-types", { method: "GET" });
    const data = await response.json();

    if (!data.roomTypes || data.roomTypes.length <= 1) return;

    const section = document.getElementById("similarSection");
    const container = document.getElementById("similarRooms");

    section.style.display = "block";

    container.innerHTML = data.roomTypes
      .map((room) => {
        const isCurrent = room.room_type.toLowerCase() === currentType.toLowerCase();
        return `
        <a href="/rooms?type=${room.room_type}" class="similar-card ${isCurrent ? "current" : ""}">
          <div class="similar-card-img-wrapper">
            <img class="similar-card-img" src="${room.room_image}" alt="${room.room_type} room">
            <div class="similar-card-badge">${room.room_type}</div>
          </div>
          <div class="similar-card-body">
            <div class="similar-card-type">${room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)} Room</div>
            <div class="similar-card-desc">${room.room_description}</div>
            <div class="similar-card-footer">
              <div class="similar-card-price">&#8377;${room.room_price_per_night.toLocaleString()} <span>/ night</span></div>
              <div class="similar-card-btn">View</div>
            </div>
          </div>
        </a>`;
      })
      .join("");

    // Scroll arrows
    const scrollEl = container;
    document.getElementById("similarLeft").addEventListener("click", () => {
      scrollEl.scrollBy({ left: -320, behavior: "smooth" });
    });
    document.getElementById("similarRight").addEventListener("click", () => {
      scrollEl.scrollBy({ left: 320, behavior: "smooth" });
    });
  } catch (err) {
    // Silently fail - similar rooms is optional
  }
}

/* =====================================================
   BOOKING MODAL
   ===================================================== */
const bookingModal = document.getElementById("bookingModal");
const modalRoomType = document.getElementById("modalRoomType");
const modalRoomNumber = document.getElementById("modalRoomNumber");
const modalGuests = document.getElementById("modalGuests");
const modalCheckIn = document.getElementById("modalCheckIn");
const modalCheckOut = document.getElementById("modalCheckOut");
const modalNights = document.getElementById("modalNights");
const modalPrice = document.getElementById("modalPrice");
const modalTotal = document.getElementById("modalTotal");
const proceedPayment = document.getElementById('proceedPayment')
proceedPayment.addEventListener('click', createOrder)
let selectedBooking = {};


async function openModal(roomId, checkIn, checkOut) {
  const response = await fetch("/api/booking-info", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ roomId, checkIn, checkOut }),
  });

  const data = await response.json();

  modalRoomType.textContent = data.data.room_type;
  modalRoomNumber.textContent = data.data.room_number;
  modalGuests.textContent = data.data.room_capacity;
  modalCheckIn.textContent = checkIn;
  modalCheckOut.textContent = checkOut;
  modalNights.textContent = data.diffdays;
  modalPrice.textContent = `${data.data.room_price_per_night.toLocaleString()} x ${data.diffdays}`;
  modalTotal.textContent = data.totalAmount.toLocaleString();

  bookingModal.classList.add("active");
  document.body.classList.add("modal-open");
  // --------------------------------------------------------------------------------------------------------------
  selectedBooking = {
    roomId: data.data.room_id,
    checkIn: checkIn,
    checkOut: checkOut
  }
}

function closeModal() {
  bookingModal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

bookingModal.addEventListener("click", (event) => {
  if (event.target === bookingModal) closeModal();
});

document.getElementById("cancelBooking").addEventListener("click", closeModal);
document.getElementById("crossModal").addEventListener("click", closeModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && bookingModal.classList.contains("active")) {
    closeModal();
  }
});



// ----------------------------------------------------------------------------------------------------------------------------
  async function createOrder() {
  proceedPayment.disabled = true
  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(selectedBooking)
  })
  const order = await response.json()

  const options = {
    key:order.key ,
    amount:order.order.amount,
    currency:order.order.currency,
    order_id : order.order.id,
    name : "Bright Homes",
    description :"HOTEL ROOM BOOKING",
    theme:{
      color:"#C85A2A"
    },
    
    handler: async function (response){
    const paymentResult = await fetch('/api/verify-payment',{
      method:"POST",
      headers:{'content-type': "application/json"},
      body:JSON.stringify({
        payment_id : response.razorpay_payment_id,
        order_id : response.razorpay_order_id,
        signature : response.razorpay_signature,
        roomId: selectedBooking.roomId,
        checkIn: selectedBooking.checkIn,
        checkOut: selectedBooking.checkOut

      })
    })
    const data = await paymentResult.json()
    if(data.success)
    {
      alert('Booking Confirmed');
      selectedBooking = {}
      window.location.href = '/dashboard';
    }
    else
    {
      alert(data.message);
    }
    }
  }

  const razorpay = new Razorpay(options);
  razorpay.open();
}

/* =====================================================
   INIT
   ===================================================== */
roomDataFetch();
