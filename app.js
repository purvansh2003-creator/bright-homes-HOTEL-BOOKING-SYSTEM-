const dotenv = require(`dotenv`).config();
const express = require(`express`);
const Razorpay = require(`razorpay`)
const session = require(`express-session`)
const axios = require(`axios`)
const path = require(`path`)
const Database = require("better-sqlite3");
const bcrypt = require('bcrypt')
const crypto = require('crypto')

// Around Town - Hotel Location Config
const HOTEL_LAT = 26.8467;
const HOTEL_LON = 80.9462;
const SEARCH_RADIUS = 5000;

let db;
try {
    db = new Database(`./database/hotel.db`);
    console.log(`Connected to database`);
}
catch (err) {
    console.log(err.message)
}

db.pragma('foreign_keys = ON')

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})




db.exec(`CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        mobile_number TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL, 
        role TEXT NOT NULL DEFAULT 'guest'
    );`)

db.exec(`CREATE TABLE IF NOT EXISTS bookings (
        booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER NOT NULL  ,
        user_id INTEGER NOT NULL  ,
        check_in DATE NOT NULL ,
        check_out DATE NOT NULL,
        booking_status TEXT NOT NULL ,
        booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_amount REAL NOT NULL,
        razorpay_order_id TEXT,
        razorpay_payment_id TEXT,
        FOREIGN KEY (room_id) REFERENCES rooms(room_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );`)

const app = express();  // express server started .


app.use(express.json())

app.use(session({
    secret: "bright-homes-secret-key",
    resave: false,
    saveUninitialized: false
}))
app.use(express.static("public"));

app.get('/login', (req, res) => {
    return res.sendFile(path.join(__dirname, "public", "guest", "login.html"))
})

app.get('/register', (req, res) => {
    return res.sendFile(path.join(__dirname, "public", "guest", "register.html"))
})

app.post(`/login`, async (req, res) => {
    const mobile_number_value = req.body.mobile_number_value;
    const password_value = req.body.password_value;
    const query = db.prepare(`SELECT * FROM USERS WHERE mobile_number = ?`)
    try {
        const user = query.get(mobile_number_value);
        if (!user) {
            // User Not found
            return res.status(404).json({ success: false, message: "User Does Not Exist" })
        }
        const isValid = await bcrypt.compare(password_value, user.password_hash)
        if (!isValid) {
            // Password Invalid
            return res.status(401).json({ success: false, message: "Invalid Credentials" })
        }
        else {
            req.session.user = {
                id: user.user_id,
                name: user.full_name,
                role: user.role
            }
            res.status(200).json({ success: true })
        }

    }
    catch (err) {
        console.log(err.message)
    }

})


app.post("/register", async (req, res) => {

    const name_value = req.body.name_value;
    const mobile_number_value = req.body.mobile_number_value;
    const email_value = req.body.email_value;
    const password_hash_value = await bcrypt.hash(req.body.password_value, 10)

    const checkQuery1 = db.prepare(`SELECT * FROM users WHERE mobile_number = ?`)
    const mob = checkQuery1.get(mobile_number_value)

    const checkQuery2 = db.prepare(`SELECT * FROM users WHERE email = ?`)
    const em = checkQuery2.get(email_value)

    if (mob) {
        return res.status(409).json({ success: false, message: "Mobile number already exists" })
    }
    else if (em) {
        return res.status(409).json({ success: false, message: "Email-id already exists" })
    }
    else {
        const query = db.prepare(`INSERT INTO users (full_name,mobile_number,email,password_hash,role)
        VALUES(?,?,?,?,?)`);

        const result = query.run(name_value, mobile_number_value, email_value, password_hash_value, `guest`);
        return res.status(201).json({ success: true, message: "Registration Sucessful" })
    }
})

app.post('/api/check-availability', authenticate, noCache, (req, res) => {

    const roomType = req.body.roomType;
    const checkIn = req.body.checkIn;
    const checkOut = req.body.checkOut;

    const query = db.prepare(`SELECT room_number , room_status ,room_id FROM rooms WHERE room_type = ? AND room_id NOT IN (SELECT room_id FROM bookings WHERE check_in < ? AND check_out > ?) `)
    const data = query.all(roomType, checkOut, checkIn)

    res.json(data)
})

app.post('/api/booking-info', authenticate, noCache, (req, res) => {
    const roomId = req.body.roomId;
    const check_in = new Date(req.body.checkIn)
    const check_out = new Date(req.body.checkOut)


    const diff = check_out - check_in;
    const diffdays = diff / (1000 * 60 * 60 * 24);

    const query = db.prepare('SELECT * FROM rooms WHERE room_id = ?')

    const data = query.get(roomId);

    const totalAmount = data.room_price_per_night * diffdays

    res.json({
        success: true,
        diffdays,
        totalAmount,
        data
    })
})

app.get('/dashboard', authenticate, noCache, (req, res) => {
    return res.sendFile(path.join(__dirname, "private", "dashboard.html"));
})

app.get('/explore-rooms', authenticate, noCache, (req, res) => {
    return res.sendFile(path.join(__dirname, "private", "explore-rooms.html"))
})

app.get('/rooms', authenticate, noCache, (req, res) => {
    return res.sendFile(path.join(__dirname, "private", "room-details.html"))
})


app.get('/api/rooms', authenticate, noCache, (req, res) => {
    const roomType = req.query.type
    const query = db.prepare('SELECT DISTINCT room_type,room_price_per_night,room_capacity,room_description,room_image FROM rooms WHERE room_type = ?')
    const data = query.get(roomType);

    res.json(data);
})


app.get('/api/booking-status', authenticate, noCache, (req, res) => {
    const user_id = req.session.user.id;
    const query = db.prepare(`
        SELECT
            b.booking_id,
            b.room_id,
            b.check_in,
            b.check_out,
            b.booking_status,
            b.booking_date,
            b.total_amount,
            b.razorpay_order_id,
            b.razorpay_payment_id,
            r.room_number,
            r.room_type,
            r.room_capacity,
            r.room_price_per_night
        FROM bookings b
        JOIN rooms r
            ON b.room_id = r.room_id
        WHERE b.user_id = ? and b.booking_status = ?
        ORDER BY b.booking_date DESC
    `);
 
    const data = query.all(user_id , 'Confirmed');

    res.json({
        success: true,
        bookings: data
    }) 
})


app.get(`/api/dashboard`, authenticate, noCache, (req, res) => {
    const query = db.prepare("SELECT user_id,full_name,mobile_number,email,role FROM USERS WHERE user_id = ?")
    const data = query.get(req.session.user.id)
    return res.json({
        success: true,
        data
    })
})
app.get(`/api/weather`, authenticate, noCache, async (req, res) => {
    const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
            params: {
                lat: 26.8467,
                lon: 80.9462,
                appid: process.env.OPENWEATHER_API_KEY,
                units: "metric"
            }
        }
    )
    res.json({
        success: true,
        main: {
            temp: response.data.main.temp
        },
        weather: {
            description: response.data.weather[0].description
        }
    });
})

app.get('/api/room-types', authenticate, noCache, (req, res) => {
    const query = db.prepare("SELECT DISTINCT room_type,room_price_per_night,room_capacity,room_description,room_image FROM rooms")
    const data = query.all()

    res.status(200).json({
        success: true,
        roomTypes: data
    })
})

app.post('/logout', noCache, (req, res) => {
    req.session.destroy();
    res.clearCookie("connect.sid");

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
})

function authenticate(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login')
    }
    next();
}

function noCache(req, res, next) {
    res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        "Pragma": "no-cache",
        "Expires": "0"
    });
    next();
}

// -------------------------------------------------------------------------------------------------------------------

app.post('/api/create-order', authenticate, async (req, res) => {
    const room_id = req.body.roomId;
    const check_in = req.body.checkIn;
    const check_out = req.body.checkOut;

    // CHECKING FOR ANYTHING MISSING ....

    if (!room_id || !check_in || !check_out) {
        return res.status(400).json({
            success: false,
            message: 'Missing Booking Information'
        })
    }

    // CHECKING IF THAT ROOM ID EXISTS OR NOT ....

    const query = db.prepare('SELECT * FROM rooms WHERE room_id = ? ')

    const queryRes = query.get(room_id);

    if (!queryRes) {
        return res.status(400).json({
            success: false,
            message: 'ROOM not found .'
        })
    }

    // CHECKING IF BOOKING ALREADY EXISTS OR NOT ....

    const roomCheckQuery = db.prepare(`SELECT * FROM bookings WHERE room_id = ? AND check_in < ? AND check_out > ?`)
    const rooomCheckQueryRes = roomCheckQuery.get(room_id, check_out, check_in)

    if (rooomCheckQueryRes) {
        return res.status(409).json({
            success: false,
            message: 'Room is not Available Now'
        })
    }

    // CALCULATING TOTAL AMOUNT ....

    const checkIn = new Date(check_in);
    const checkOut = new Date(check_out);

    const diff = checkOut - checkIn;

    const diffdays = diff / (1000 * 60 * 60 * 24);
    const totalAmount = queryRes.room_price_per_night * diffdays

    // NOW WE TALK TO RAZORPAY ....
 
    const order = await razorpay.orders.create({
        amount: totalAmount * 100, // razorpay stores value in paise .
        currency: "INR", 
        receipt: `receipt_${Date.now()}`
    })
    return res.json({
        success: true,
        order,
        key: process.env.RAZORPAY_KEY_ID
    });

})

// VERIFYING PAYMENT STATUS ....
app.post('/api/verify-payment', authenticate, (req, res) => {
    const razorpay_order_id = req.body.order_id
    const razorpay_payment_id = req.body.payment_id
    const razorpay_signature = req.body.signature

    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex')

    if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
            success: false,
            message: 'Payment Verification Failed'
        })
    }

    const room_id = req.body.roomId;
    const check_in = req.body.checkIn;
    const check_out = req.body.checkOut;
    const user_id = req.session.user.id;

    const room = db.prepare(
        'SELECT room_price_per_night FROM rooms WHERE room_id = ?'
    ).get(room_id);

    const nights = Math.round(
        (new Date(check_out) - new Date(check_in)) /
        (1000 * 60 * 60 * 24)
    );

    const totalAmount = room.room_price_per_night * nights;

    const roomCheckQuery = db.prepare(`SELECT * FROM bookings WHERE room_id = ? AND check_in < ? AND check_out > ?`)
    const rooomCheckQueryRes = roomCheckQuery.get(room_id, check_out, check_in)

    if (rooomCheckQueryRes) {
        return res.status(409).json({
            success: false,
            message: 'Room is not Available Now'
        })
    }

    const insertBooking = db.prepare(`
    INSERT INTO bookings(
        room_id,
        user_id,
        check_in,
        check_out,
        booking_status,
        total_amount,
        razorpay_order_id,
        razorpay_payment_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);



    insertBooking.run(
        room_id,
        user_id,
        check_in,
        check_out,
        "Confirmed",
        totalAmount,
        razorpay_order_id,
        razorpay_payment_id
    );
    return res.json({
        success: true,
        message: "Booking confirmed successfully."
    });
    //    console.log(req.body)
})


// =============================================
// CANCEL BOOKING
// =============================================
app.post('/api/cancel-booking', authenticate, noCache, (req, res) => {
    const bookingId = req.body.bookingId;
    const userId = req.session.user.id;

    if (!bookingId) {
        return res.status(400).json({ success: false, message: 'Missing booking ID' });
    }

    const booking = db.prepare('SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?').get(bookingId, userId);

    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.booking_status === 'Cancelled') {
        return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (booking.check_in <= today) {
        return res.status(400).json({ success: false, message: 'Cannot cancel a booking that has already started' });
    }

    db.prepare('UPDATE bookings SET booking_status = ? WHERE booking_id = ?').run('Cancelled', bookingId);

    return res.json({ success: true, message: 'Booking cancelled successfully' });
});

// =============================================
// AROUND TOWN - Page Route
// =============================================
app.get('/around-town', authenticate, noCache, (req, res) => {
    return res.sendFile(path.join(__dirname, "private", "around-town.html"))
})

// =============================================
// AROUND TOWN - Haversine Distance Helper
// =============================================
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// =============================================
// AROUND TOWN - API Route
// =============================================
app.get('/api/around-town', authenticate, noCache, async (req, res) => {
    try {
        const overpassQuery = `
            [out:json][timeout:25];
            (
                node["tourism"="attraction"](around:${SEARCH_RADIUS},${HOTEL_LAT},${HOTEL_LON});
                node["amenity"="restaurant"](around:${SEARCH_RADIUS},${HOTEL_LAT},${HOTEL_LON});
                node["amenity"="cafe"](around:${SEARCH_RADIUS},${HOTEL_LAT},${HOTEL_LON});
                node["leisure"="park"](around:${SEARCH_RADIUS},${HOTEL_LAT},${HOTEL_LON});
                node["shop"](around:${SEARCH_RADIUS},${HOTEL_LAT},${HOTEL_LON});
                way["tourism"="attraction"](around:${SEARCH_RADIUS},${HOTEL_LAT},${HOTEL_LON});
                way["amenity"="restaurant"](around:${SEARCH_RADIUS},${HOTEL_LAT},${HOTEL_LON});
                way["amenity"="cafe"](around:${SEARCH_RADIUS},${HOTEL_LAT},${HOTEL_LON});
                way["leisure"="park"](around:${SEARCH_RADIUS},${HOTEL_LAT},${HOTEL_LON});
                way["shop"](around:${SEARCH_RADIUS},${HOTEL_LAT},${HOTEL_LON});
            );
            out center 40;
        `;

        const overpassEndpoints = [
            "https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter"
        ];

        let overpassResponse = null;
        for (const endpoint of overpassEndpoints) {
            try {
                overpassResponse = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "User-Agent": "BrightHomes/1.0 (student-project)"
                    },
                    body: `data=${encodeURIComponent(overpassQuery)}`
                });
                if (overpassResponse.ok) break;
            } catch (e) {
                continue;
            }
        }

        if (!overpassResponse || !overpassResponse.ok) {
            throw new Error("Overpass API unavailable");
        }

        if (!overpassResponse.ok) {
            throw new Error(`Overpass API returned ${overpassResponse.status}`);
        }

        const overpassData = await overpassResponse.json();

        if (!overpassData.elements || overpassData.elements.length === 0) {
            return res.json({ success: true, places: [] });
        }

        function getCategory(element) {
            const tags = element.tags || {};
            if (tags.tourism === "attraction") return "Attraction";
            if (tags.amenity === "restaurant") return "Restaurant";
            if (tags.amenity === "cafe") return "Cafe";
            if (tags.leisure === "park") return "Park";
            if (tags.shop) return "Shopping";
            return "Place";
        }

        function buildAddress(tags) {
            const parts = [];
            if (tags["addr:street"]) parts.push(tags["addr:street"]);
            if (tags["addr:area"]) parts.push(tags["addr:area"]);
            if (tags["addr:city"]) parts.push(tags["addr:city"]);
            if (tags["addr:postcode"]) parts.push(tags["addr:postcode"]);
            return parts.length > 0 ? parts.join(", ") : "";
        }

        const places = overpassData.elements
            .map(element => {
                const tags = element.tags || {};
                const lat = element.lat || (element.center && element.center.lat);
                const lon = element.lon || (element.center && element.lon);

                if (!lat || !lon) return null;

                const name = tags.name || tags["name:en"] || "";
                if (!name) return null;

                const distance = haversineDistance(HOTEL_LAT, HOTEL_LON, lat, lon);

                return {
                    name: name,
                    category: getCategory(element),
                    latitude: lat,
                    longitude: lon,
                    distance: distance.toFixed(1) + " km",
                    distanceValue: parseFloat(distance.toFixed(1)),
                    address: buildAddress(tags),
                    osmUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.distanceValue - b.distanceValue);

        return res.json({ success: true, places });
    } catch (err) {
        console.log("Around Town API error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch nearby places. Please try again later."
        });
    }
});

app.listen(5000)