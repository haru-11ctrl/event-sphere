
// Sample Events

function futureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
}

const defaultEvents = [
    {
        id: 1,
        title: "Tech Innovation Hackathon",
        category: "Hackathon",
        date: futureDate(5),
        time: "09:00",
        venue: "Innovation Lab",
        seats: 50,
        description: "Build creative solutions to real-world problems."
    },
    {
        id: 2,
        title: "Web Development Workshop",
        category: "Workshop",
        date: futureDate(8),
        time: "10:00",
        venue: "Computer Lab",
        seats: 40,
        description: "Learn the fundamentals of modern web development."
    },
    {
        id: 3,
        title: "Cultural Fest",
        category: "Cultural",
        date: futureDate(12),
        time: "11:00",
        venue: "University Auditorium",
        seats: 100,
        description: "Enjoy music, dance and cultural performances."
    },
    {
        id: 4,
        title: "Inter College Sports Meet",
        category: "Sports",
        date: futureDate(15),
        time: "08:00",
        venue: "Sports Ground",
        seats: 60,
        description: "Participate in exciting sports competitions."
    }
];

// Load saved data

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch {
        return fallback;
    }
}

let events = loadData("events", defaultEvents);
let registrations = loadData("registrations", []);

// Save data

function saveData() {
    localStorage.setItem("events", JSON.stringify(events));
    localStorage.setItem("registrations", JSON.stringify(registrations));
}

saveData();

// Escape user-entered text before displaying it

function safeText(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Navigation

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");

    renderAll();
}

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        showPage(this.dataset.view);
    });
});

// Event Card

function createEventCard(event) {
    const registeredCount = registrations.filter(
        r => Number(r.eventId) === Number(event.id)
    ).length;

    const remainingSeats = Math.max(0, Number(event.seats) - registeredCount);

    return `
        <div class="event-card">
            <span class="category">${safeText(event.category)}</span>

            <h3>${safeText(event.title)}</h3>

            <p>📅 ${safeText(event.date)}</p>
            <p>⏰ ${safeText(event.time)}</p>
            <p>📍 ${safeText(event.venue)}</p>

            <p>${safeText(event.description)}</p>

            <p>Available Seats: ${remainingSeats}</p>

            <button data-action="register"
                    data-id="${event.id}"
                    ${remainingSeats === 0 ? "disabled" : ""}>
                ${remainingSeats === 0 ? "Full" : "Register"}
            </button>
        </div>
    `;
}

// Display Events

function displayEvents() {
    const eventList = document.getElementById("eventList");

    const search = document.getElementById("searchInput").value.toLowerCase();

    const category = document.getElementById("categoryFilter").value;

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(search);

        const matchesCategory =
            category === "All" || event.category === category;

        return matchesSearch && matchesCategory;
    });

    eventList.innerHTML = filteredEvents.length
        ? filteredEvents.map(createEventCard).join("")
        : "<p>No events found.</p>";
}

// Featured Events

function displayFeatured() {
    const featured = document.getElementById("featuredEvents");

    featured.innerHTML = events.slice(0, 3)
        .map(createEventCard).join("");
}

// Search and Filter

document.getElementById("searchInput").addEventListener(
    "input", displayEvents
);

document.getElementById("categoryFilter").addEventListener(
    "change", displayEvents
);

// Open Registration Modal

function openModal(eventId) {
    const event = events.find(e => Number(e.id) === Number(eventId));

    if (!event) return;

    const registeredCount = registrations.filter(
        r => Number(r.eventId) === Number(eventId)
    ).length;

    if (registeredCount >= Number(event.seats)) {
        alert("Sorry! All seats are filled.");
        return;
    }

    document.getElementById("registerEventId").value = eventId;

    document.getElementById("registrationModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("registrationModal").style.display = "none";
}

// Register Student

document.getElementById("registrationForm").addEventListener(
    "submit", function(event) {

        event.preventDefault();

        const eventId = Number(
            document.getElementById("registerEventId").value
        );

        const name = document.getElementById("studentName").value.trim();

        const email = document.getElementById("studentEmail").value.trim();

        const department = document.getElementById("studentDept").value.trim();

        const selectedEvent = events.find(e => Number(e.id) === eventId);

        if (!selectedEvent) {
            alert("Event not found.");
            return;
        }

        const registeredCount = registrations.filter(
            r => Number(r.eventId) === eventId
        ).length;

        if (registeredCount >= Number(selectedEvent.seats)) {
            alert("Sorry! All seats are filled.");
            return;
        }

        const alreadyRegistered = registrations.some(r =>
            Number(r.eventId) === eventId &&
            r.email.toLowerCase() === email.toLowerCase()
        );

        if (alreadyRegistered) {
            alert("You have already registered for this event!");
            return;
        }

        const newRegistration = {
            registrationId: "ES" + Date.now(),
            eventId: eventId,
            name: name,
            email: email,
            department: department
        };

        registrations.push(newRegistration);

        saveData();

        alert("Registration Successful!");

        this.reset();
        closeModal();

        renderAll();
    }
);

// Show My Registrations

function displayMyEvents() {
    const myList = document.getElementById("myEventList");

    if (registrations.length === 0) {
        myList.innerHTML = "<p>No registrations yet.</p>";
        return;
    }

    myList.innerHTML = registrations.map(registration => {

        const event = events.find(
            e => Number(e.id) === Number(registration.eventId)
        );

        if (!event) return "";

        return `
            <div class="event-card">
                <h3>${safeText(event.title)}</h3>

                <p>Student: ${safeText(registration.name)}</p>

                <p>Email: ${safeText(registration.email)}</p>

                <p>Department: ${safeText(registration.department)}</p>

                <p>Date: ${safeText(event.date)}</p>

                <p>Registration ID:
                    ${safeText(registration.registrationId)}
                </p>
            </div>
        `;
    }).join("");
}

// Add New Event

document.getElementById("eventForm").addEventListener(
    "submit", function(event) {

        event.preventDefault();

        const newEvent = {
            id: Date.now(),
            title: document.getElementById("eventTitle").value.trim(),
            category: document.getElementById("eventCategory").value,
            date: document.getElementById("eventDate").value,
            time: document.getElementById("eventTime").value,
            venue: document.getElementById("eventVenue").value.trim(),
            seats: Number(document.getElementById("eventSeats").value),
            description: document.getElementById("eventDescription").value.trim()
        };

        if (!newEvent.title || !newEvent.description ||
            !newEvent.venue || newEvent.seats < 1) {
            alert("Please enter valid event details.");
            return;
        }

        events.push(newEvent);

        saveData();

        alert("New Event Added Successfully!");

        this.reset();

        renderAll();
    }
);

// Admin Dashboard

function displayAdmin() {

    document.getElementById("totalEvents").textContent = events.length;

    document.getElementById("totalRegistrations").textContent =
        registrations.length;

    const adminList = document.getElementById("adminEventList");

    adminList.innerHTML = events.map(event => `
        <div class="admin-item">
            <div>
                <strong>${safeText(event.title)}</strong>
                <p>${safeText(event.date)} | ${safeText(event.category)}</p>
            </div>

            <button class="delete-btn"
                    data-action="delete"
                    data-id="${event.id}">
                Delete
            </button>
        </div>
    `).join("");
}

// Button Actions

document.addEventListener("click", function(event) {

    const button = event.target.closest("[data-action]");

    if (!button) return;

    const eventId = Number(button.dataset.id);

    if (button.dataset.action === "register") {
        openModal(eventId);
    }

    if (button.dataset.action === "delete") {

        if (confirm("Are you sure you want to delete this event?")) {

            events = events.filter(e => Number(e.id) !== eventId);

            registrations = registrations.filter(
                r => Number(r.eventId) !== eventId
            );

            saveData();

            renderAll();

            alert("Event Deleted Successfully!");
        }
    }
});

// Display Everything

function renderAll() {
    displayFeatured();
    displayEvents();
    displayMyEvents();
    displayAdmin();
}

// Initial Display

renderAll();
