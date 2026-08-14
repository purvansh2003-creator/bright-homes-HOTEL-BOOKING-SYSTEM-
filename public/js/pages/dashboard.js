import { logout } from "../utils/logout.js"
import { loadWeatherCard } from "../utils/weather_card.js";
import { initSidebar } from "../utils/sidebar.js";
initSidebar();
async function checkBookingStatus() {
    let slides = '';
    let html = '';
    const response = await fetch('/api/booking-status',{
        method:"GET"
    })
    const data = await response.json()
    console.log(data)
    if(data.bookings.length>0)
    {
            data.bookings.forEach((booking)=>{
        slides += `
            <div class="booking-slide">
            
             <div class="booking-cards-container">

            <!-- Receipt Card Starts -->
            <div class="card receipt">

                <!-- Receipt Header -->
                <div class="receipt-header">
                    <div class="rec_header left">
                        <span class="txt receipt_txt">RECEIPT</span>
                        <span class="txt your-stay">Your stay</span>
                    </div>
                    <div class="rec_header right">
                        <span class="txt receipt_number">${booking.razorpay_order_id}</span>
                        <span class="txt receipt_code">${booking.razorpay_payment_id}</span>
                    </div>
                </div>

                <!-- Receipt Middle -->
                <div class="receipt-middle">
                    <div class="rec_middle left">
                        <div class="txt check-in">CHECK IN</div>
                        <div class="txt date-month check-in">${formatDate(booking.check_in)}</div>
                        <div class="txt day-time check-in">${getDay(booking.check_in)}</div>
                    </div>
                    <div class="rec_middle right">
                        <div class="txt check-out">CHECK OUT</div>
                        <div class="txt date-month check-in">${formatDate(booking.check_out)}</div>
                        <div class="txt day-time check-in">${getDay(booking.check_out)}</div>
                    </div>
                </div>

                <!-- Receipt Calculate -->
                <div class="receipt-calculate-container">

                    <div class="rec_calculate_box">
                        <div class="txt rec_calc left">Room · ${booking.room_type} · 4 nights</div>
                        <div class="txt rec_calc right">₹ ${booking.total_amount}</div>
                    </div>

                    <div class="rec_calculate_box">
                        <div class="txt rec_calc left">Breakfast · ${booking.room_capacity} guests</div>
                        <div class="txt rec_calc right">₹ ${booking.room_capacity * 600}</div>
                    </div>

                    <div class=" rec_calculate_box">
                        <div class=" txt rec_calc left">Tourist tax (18%)</div>
                        <div class="txt rec_calc right">₹ ${booking.total_amount * 0.18}</div>
                    </div>

                </div>

                <!-- Receipt Amount -->
                <br>

                <div class="receipt-amount-container">
                    <div class="rec_amount_box">
                        <div class="txt rec_amt left"> TOTAL PAID</div>
                        <div class="txt rec_amt right totalamt"> ₹ ${booking.total_amount + booking.room_capacity * 600 + booking.total_amount * 0.18} </div>
                    </div>
                    <br>
                    <div class="rec_amount_box">
                        <div class="txt rec_amt left paid-wise-gbp"> Paid · Wise · GBP</div>
                        <img class="img-barcode rec_amt right " src="/assets/logo/thank_you.png">
                    </div>

                    <!-- Receipt Card Ends -->
                </div>

            </div>

                    <!-- Welcome Card Starts -->

            <div class="card welcome">

                <div class="welcome-header">
                    <div class="txt welcomeCardtxt">WELCOME CARD</div>
                    <img class="img-sun" src="/assets/logo/bright-homes-logo.svg">
                </div>

                <div class="welcome-middle">
                    <span class="noteFromHost start">A note from your host,</span>
                    <span class="noteFromHost hostName">Purvansh .</span>
                    <span class="noteFromHost hostTxt"> We're so glad you're coming. The shutters will be open, the
                        lemonade cold,
                        and the cat - Poivre - pretending not to notice you.</span>
                    <br><br><br><br>
                    <span class="noteFromHost hostTxt">ROOM</span>
                    <span class="noteFromHost thankYou">Thank You !</span>
                </div>

            </div>
                    <!-- Welcome Card Ends -->

            </div>
            <!-- /.booking-cards-container -->

            <button class="cancel-booking-btn" data-booking-id="${booking.booking_id}" ${booking.booking_status === 'Cancelled' ? 'disabled style="display:none"' : ''}>
                Cancel Booking
            </button>

            </div>
            <!-- /.booking-slide -->`
    })


        html = `<!-- -----------------------------------------Header Starts------------------------------------------------------->
        <div class="header-container">
            <div class="left-container">
                <div class="booking status">BOOKING · CONFIRMED</div>
                <div id="user-name" class="booking name"></div>
            </div>

            <div class="right-container">
                <button class="btn printreceipt">Print receipt</button>
                <button class="btn addtocalender">Add to calendar</button>
            </div>

        </div>

        <!-- -----------------------------------------Header Ends------------------------------------------------------->


        <!-- -----------------------------------------Booking carousel Start------------------------------------------------------->

        <div class="carousel-wrapper" id="carouselWrapper">
            <button class="carousel-arrow left" id="carouselLeft" aria-label="Previous booking">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div class="booking-carousel" id="bookingCarousel">
                <div class="booking-carousel-track" id="bookingCarouselTrack">
                    ${slides}
                </div>
            </div>
            <button class="carousel-arrow right" id="carouselRight" aria-label="Next booking">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
        </div>
        <div class="carousel-dots" id="carouselDots" role="tablist" aria-label="Bookings"></div>`

        const allCancelled = data.bookings.every(b => b.booking_status === 'Cancelled');
        if (allCancelled) {
            html = html.replace('BOOKING · CONFIRMED', 'BOOKING · CANCELLED');
        }
    }
    else
    {
        html = `<!-- -----------------------------------------Header Starts------------------------------------------------------->
<div class="header-container">
    <div class="left-container">
        <div class="booking status">NO · BOOKING</div>
        <div id="user-name" class="booking name"></div>
    </div>

    <div class="right-container">
        <a href="/explore-rooms" class="btn browse-rooms">Browse Rooms</a>
    </div>
</div>
<!-- -----------------------------------------Header Ends------------------------------------------------------->
        <div class="no-booking-container">
    <div class="card no-booking-card">
        <div class="no-booking-header">
            <img class="img-sun" src="/assets/logo/bright-homes-logo.svg">
        </div>

        <div class="no-booking-middle">
            <span class="no-booking-title">No upcoming stays</span>
            <span class="no-booking-subtitle">You haven't made a reservation yet.</span>
            <span class="no-booking-text">
                Your next adventure begins here. Browse our rooms and find the perfect place to unwind.
            </span>
        </div>

        <div class="no-booking-action">
            <a href="/explore-rooms" class="btn-book-now">Explore Rooms</a>
        </div>
    </div>

    <div class="card welcome no-booking-welcome">
        <div class="welcome-header">
            <div class="txt welcomeCardtxt">WELCOME CARD</div>
            <img class="img-sun" src="/assets/logo/bright-homes-logo.svg">
        </div>

        <div class="welcome-middle">
            <span class="noteFromHost start">A note from your host,</span>
            <span class="noteFromHost hostName">Purvansh .</span>
            <span class="noteFromHost hostTxt">
                We're so glad you're considering a stay with us. 
                The shutters will be open, the lemonade cold, 
                and the cat - Poivre - pretending not to notice you.
            </span>
            <br><br><br><br>
            <span class="noteFromHost hostTxt">YOUR STAY AWAITS</span>
            <span class="noteFromHost thankYou">See You Soon!</span>
        </div>
    </div>
</div>`
    }
    document.getElementById('dashboardContainer').innerHTML = html;
    loadDashboard();
    initBookingCarousel();
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short"
    });
}

function getDay(dateString) {
    return new Date(dateString).toLocaleDateString("en-GB", {
        weekday: "long"
    });
}

function initBookingCarousel() {
    const track = document.getElementById('bookingCarouselTrack');
    const dotsWrap = document.getElementById('carouselDots');
    const leftBtn = document.getElementById('carouselLeft');
    const rightBtn = document.getElementById('carouselRight');
    if (!track || !dotsWrap) return;

    const slides = Array.from(track.querySelectorAll('.booking-slide'));
    if (slides.length === 0) return;

    function getSlideWidth() {
        return slides[0].offsetWidth;
    }

    function scrollToSlide(index) {
        const w = getSlideWidth();
        track.scrollTo({ left: w * index, behavior: 'smooth' });
    }

    function getCurrentIndex() {
        const w = getSlideWidth();
        if (w === 0) return 0;
        return Math.round(track.scrollLeft / w);
    }

    function updateUI() {
        const idx = getCurrentIndex();
        dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
        if (leftBtn) leftBtn.style.display = idx === 0 ? 'none' : 'flex';
        if (rightBtn) rightBtn.style.display = idx >= slides.length - 1 ? 'none' : 'flex';
    }

    dotsWrap.innerHTML = slides.map((_, i) =>
        `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-slide="${i}" role="tab" aria-label="Booking ${i + 1}"></button>`
    ).join('');

    const dots = Array.from(dotsWrap.querySelectorAll('.carousel-dot'));

    track.addEventListener('scroll', updateUI, { passive: true });
    window.addEventListener('resize', updateUI);

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => scrollToSlide(i));
    });

    if (leftBtn) {
        leftBtn.addEventListener('click', () => {
            const idx = getCurrentIndex();
            if (idx > 0) scrollToSlide(idx - 1);
        });
    }

    if (rightBtn) {
        rightBtn.addEventListener('click', () => {
            const idx = getCurrentIndex();
            if (idx < slides.length - 1) scrollToSlide(idx + 1);
        });
    }

    updateUI();
}

function initCancelButtons() {
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.cancel-booking-btn');
        if (!btn) return;

        const bookingId = btn.dataset.bookingId;
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        btn.disabled = true;
        btn.textContent = 'Cancelling...';

        try {
            const res = await fetch('/api/cancel-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId })
            });
            const data = await res.json();
            if (data.success) {
                checkBookingStatus();
            } else {
                alert(data.message || 'Could not cancel booking.');
                btn.disabled = false;
                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancel Booking`;
            }
        } catch {
            alert('Something went wrong. Please try again.');
            btn.disabled = false;
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancel Booking`;
        }
    });
}

initCancelButtons();
checkBookingStatus();


loadWeatherCard();

async function loadDashboard() {
    const response = await fetch('/api/dashboard',{
        method:'GET'
    })
    const data = await response.json();
    const fullName = data.data.full_name.trim();
    const parts = fullName.split(" ");
    const firstName = parts.slice(0,-1).join(" ")
    const lastName = parts.slice(-1)[0]
    const userName = document.getElementById(`user-name`)
    userName.innerHTML = `${firstName} <span class="last-name">${lastName} .`
}
logout();

const theHouse = document.getElementById('theHouse')

theHouse.addEventListener('click',()=>{
    window.location.href = '/explore-rooms'
})
