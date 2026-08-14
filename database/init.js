const Database = require(`better-sqlite3`)
const db = new Database(`./database/hotel.db`)
db.pragma('foreign_keys = ON')

db.exec(`CREATE TABLE IF NOT EXISTS rooms (
        room_id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_number INT NOT NULL UNIQUE,
        room_type TEXT NOT NULL ,
        room_price_per_night INT NOT NULL ,
        room_capacity INT NOT NULL,
        room_status TEXT NOT NULL DEFAULT 'Available',
        room_description TEXT NOT NULL,
        room_image TEXT 
    );`)

const fill_rooms = db.prepare(`INSERT INTO rooms (
    room_number,room_type,room_price_per_night,room_capacity,room_description,room_image)
    VALUES(?,?,?,?,?,?)`)

    // INSERTING SAMPLE DATA IN ROOMS TABLE

//     for (let room = 101; room <= 114; room++) {
//         let room_type;
//         let room_price;
//         let room_capacity;
//         let room_desc;
//         if(room <= 106)
//             {
//                 room_type = 'Standard';
//                 room_capacity = 2;
//                 room_price = 1800;
//                 room_desc = `Comfort meets simplicity with everything
//           you need for a relaxing stay.`;
//                 room_img = "/assets/images/standard-room.png";
//             }        
//         else if(room > 106 && room <= 111)
//         {
//             room_type = 'Deluxe';
//             room_capacity = 3;
//             room_price = 2600;
//             room_desc = `Spacious interiors with premium amenities
// for a more luxurious experience.`;
//             room_img = "/assets/images/deluxe-room.jpg";
//         }
//         else
//         {
//             room_type = 'Suite';
//             room_capacity = 4;
//             room_price = 3800;
//             room_desc = `Our most luxurious accommodation,
// perfect for families and special occasions.`
//             room_img = "/assets/images/suite-room.jpg"
//         }
//         fill_rooms.run(room,room_type,room_price,room_capacity,room_desc,room_img);
//     }
//     for (let room = 201; room <= 214; room++) {
//         let room_type;
//         let room_price;
//         let room_capacity;
//         let room_desc;
//         if(room <= 206)
//             {
//                 room_type = 'Standard';
//                 room_capacity = 2;
//                 room_price = 1800;
//                 room_desc = `Comfort meets simplicity with everything
//           you need for a relaxing stay.`;
//                 room_img = "/assets/images/standard-room.png";
//             }        
//         else if(room > 206 && room <= 211)
//         {
//             room_type = 'Deluxe';
//             room_capacity = 3;
//             room_price = 2600;
//             room_desc = `Spacious interiors with premium amenities
// for a more luxurious experience.`;
//             room_img = "/assets/images/deluxe-room.jpg";
//         }
//         else
//         {
//             room_type = 'Suite';
//             room_capacity = 4;
//             room_price = 3800;
//             room_desc = `Our most luxurious accommodation,
// perfect for families and special occasions.`
//             room_img = "/assets/images/suite-room.jpg"
//         }
//         fill_rooms.run(room,room_type,room_price,room_capacity,room_desc,room_img);
//     }





const fill_bookings = db.prepare(`INSERT INTO bookings (
    room_id,user_id,check_in,check_out,booking_status,total_amount)
    VALUES(?,?,?,?,?,?)`)

// INSERTING SAMPLE DATA IN BOOKINGS TABLE

fill_bookings.run(4,4,'2026-08-10', '2026-08-13', 'Confirmed', 1800)
fill_bookings.run(26,3,'2026-08-10', '2026-08-13', 'Confirmed', 2600)
fill_bookings.run(9,1,'2026-08-10', '2026-08-13', 'Confirmed', 3800)

module.exports = db;
