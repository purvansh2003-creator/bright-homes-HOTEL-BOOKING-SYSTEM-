# Bright Homes 🏨

A full-stack hotel booking website with a warm, elegant boutique-hotel aesthetic. Guests can register, browse rooms, check live availability, and complete bookings with Razorpay — all from a premium dashboard styled around your stay, the house, and the town around it.

## ✨ Features

- **User authentication** — Registration, login, and session management (Express sessions + bcrypt)
- **Room browsing** — Clean room cards with price, capacity, description, and amenities
- **Date-based availability** — Real-time check for rooms free within your chosen stay dates
- **Smart date picker** — Picking a check-in date automatically disables all earlier dates for check-out
- **Booking modal** — Review a summary of your stay before paying
- **Razorpay payments** — Order creation, hosted checkout, and server-side signature verification
- **Multiple bookings** — A dashboard carousel showing every booking you've made
- **Booking cancellation** — Cancel upcoming bookings with one click
- **Around Town** — Discover nearby attractions, restaurants, cafes, parks, and shops within 5 km of the hotel, powered by OpenStreetMap + the Overpass API, with category filters and live weather in the sidebar

## 🛠 Tech Stack

| Layer       | Technology                                              |
|-------------|---------------------------------------------------------|
| Frontend    | HTML, CSS, Vanilla JavaScript (ES modules)              |
| Backend     | Node.js, Express                                        |
| Database    | SQLite (`better-sqlite3`)                               |
| Auth        | Express sessions + bcrypt                               |
| Payments    | Razorpay                                                |
| Maps / POI  | OpenStreetMap, Overpass API                             |
| Weather     | OpenWeather API                                         |

No frameworks — just plain, clean, vanilla code.

## 📁 Project Structure

```
brightHomes/
├── app.js                  # Express server (all routes + middleware)
├── .env                    # API keys (not committed)
├── database/
│   ├── hotel.db            # SQLite database
│   └── init.js             # DB initialization + seed rooms
├── private/                # Auth-protected pages
│   ├── dashboard.html
│   ├── explore-rooms.html
│   ├── room-details.html
│   └── around-town.html
└── public/                 # Static assets served by Express
    ├── css/
    │   ├── base/           # Design tokens, reset, layout
    │   ├── components/     # Sidebar, buttons, cards, weather, header
    │   └── pages/          # Per-page styles
    ├── js/
    │   ├── pages/          # Page logic (dashboard, rooms, etc.)
    │   └── utils/          # Shared helpers (sidebar, logout, weather)
    ├── assets/             # Images, icons, logos
    └── guest/              # Public pages (login, register)
```

## 🚀 Getting Started

### Prerequisites

- Node.js **18+** (native `fetch` is used in the backend)
- A Razorpay account (test keys are fine)
- An OpenWeather API key

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd brightHomes

# 2. Install dependencies
npm install

# 3. Create your .env file (see below)
cp .env.example .env

# 4. Initialize the database (seeds room data)
node database/init.js

# 5. Start the server
npm start
```

The app will be running at **http://localhost:5000**.

### Environment Variables

Create a `.env` file in the project root:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxx
OPENWEATHER_API_KEY=xxxxxxxxxxxxxxxxxxx
```

## 🔧 Configuration

The hotel's location and the Around Town search radius are configurable in `app.js`:

```js
const HOTEL_LAT = 26.8467;   // Lucknow, India
const HOTEL_LON = 80.9462;
const SEARCH_RADIUS = 5000;  // metres (5 km)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-idea`)
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

ISC