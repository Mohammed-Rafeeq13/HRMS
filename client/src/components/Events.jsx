import React, { useState, useEffect } from "react";

// Add CSS to hide scrollbars
const hideScrollbarStyle = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// Inject the CSS
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = hideScrollbarStyle;
  document.head.appendChild(style);
}

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEventDate, setNewEventDate] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [calendarFilter, setCalendarFilter] = useState("all");
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    image: "",
    location: "",
    category: "Company Meeting",
    time: "",
  });

  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: 1,
      title: "Annual Company Meeting",
      date: "June 15, 2024",
      time: "10:00 AM",
      location: "Main Conference Room",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
      attendees: 150,
      description:
        "Join us for our annual company meeting to discuss achievements and future plans.",
      category: "Company Meeting",
    },
    {
      id: 2,
      title: "Team Building Workshop",
      date: "June 20, 2024",
      time: "2:00 PM",
      location: "Outdoor Park",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400",
      attendees: 75,
      description:
        "A fun-filled team building workshop to strengthen our bonds.",
      category: "Team Building",
    },
    {
      id: 3,
      title: "Training Session: New Technologies",
      date: "June 25, 2024",
      time: "9:00 AM",
      location: "Training Room A",
      image:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400",
      attendees: 50,
      description:
        "Learn about the latest technologies and tools in our industry.",
      category: "Training",
    },
  ]);

  const recentEvents = [
    {
      id: 4,
      title: "Q1 Review Meeting",
      date: "April 30, 2024",
      location: "Virtual",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
      participants: 45,
      description: "Review of Q1 performance and setting goals for Q2.",
      category: "Review",
    },
    {
      id: 5,
      title: "Employee Wellness Day",
      date: "April 25, 2024",
      location: "Company Gym",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      participants: 78,
      description: "A day dedicated to employee health and wellness.",
      category: "Wellness",
    },
    {
      id: 6,
      title: "Tech Talk Series",
      date: "April 20, 2024",
      location: "Auditorium",
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
      participants: 120,
      description: "Insights into the latest technology trends.",
      category: "Technology",
    },
  ];

  // Function to fetch events from database
  const fetchEventsFromDatabase = async () => {
    try {
      console.log("🔄 Fetching events from database...");
      const response = await fetch("http://localhost:5000/api/events");
      console.log("📡 Response status:", response.status);

      const result = await response.json();
      console.log("📊 API Response:", result);

      if (result.success) {
        if (result.data.length > 0) {
          // Convert backend data to frontend format
          const formattedEvents = result.data.map((event) => ({
            id: event._id,
            title: event.title,
            description: event.description,
            category: event.category,
            time: event.time,
            location: event.location,
            date: event.date,
            image: event.image,
            attendees: event.attendees || 0,
          }));

          // Update the upcomingEvents state with database data
          setUpcomingEvents(formattedEvents);
          console.log("✅ Events loaded from database:", formattedEvents);
        } else {
          console.log("📭 No events found in database");
        }
      } else {
        console.error("❌ API returned error:", result.error);
      }
    } catch (error) {
      console.error("❌ Error fetching events:", error);
    }
  };

  // Load events when component mounts
  useEffect(() => {
    fetchEventsFromDatabase();
  }, []);

  const handleEventClick = (event) => {
    // Add current date to the event when clicked
    const eventWithCurrentDate = {
      ...event,
      clickedDate: new Date().toLocaleDateString(),
      clickedTime: new Date().toLocaleTimeString()
    };
    setSelectedEvent(eventWithCurrentDate);
  };

  // Function to delete event from database
  const handleDeleteEvent = async (eventId) => {
    try {
      console.log("🗑️ Deleting event with ID:", eventId);

      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      console.log("📡 Delete response:", result);

      if (result.success) {
        // Remove from local state
        setUpcomingEvents(
          upcomingEvents.filter((event) => event.id !== eventId)
        );

        // Close dialog if the deleted event was selected
        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent(null);
        }

        alert("Event deleted successfully!");
        console.log("✅ Event deleted from database");

        // Refresh events from database to ensure sync
        fetchEventsFromDatabase();
      } else {
        alert("Failed to delete event: " + result.error);
        console.error("❌ Delete failed:", result.error);
      }
    } catch (error) {
      console.error("❌ Error deleting event:", error);
      alert("Error deleting event. Please check if the server is running.");
    }
  };

  const closeDialog = () => {
    setSelectedEvent(null);
    setShowCreateDialog(false);
    setNewEvent({
      title: "",
      description: "",
      image: "",
      location: "",
      category: "Company Meeting",
      time: "",
    });
    setNewEventDate("");
  };

  const handleDateClick = (date) => {
    setNewEventDate(date.toDateString());
    setShowCreateDialog(true);
  };

  const handleCreateEvent = async () => {
    if (newEvent.title && newEvent.description && newEvent.location) {
      try {
        // Prepare data for backend API
        const eventData = {
          title: newEvent.title,
          description: newEvent.description,
          category: newEvent.category,
          time: newEvent.time,
          location: newEvent.location,
          date: newEventDate,
          image:
            newEvent.image ||
            "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
        };

        // Send data to backend API
        const response = await fetch("http://localhost:5000/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        const result = await response.json();

        if (result.success) {
          // Create event object for local state (to display immediately)
          const newEventObj = {
            id: result.data._id, // Use MongoDB _id
            ...newEvent,
            date: newEventDate,
            attendees: 0,
            image:
              newEvent.image ||
              "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
          };

          // Add to local state for immediate display
          setUpcomingEvents([...upcomingEvents, newEventObj]);

          // Reset form
          setNewEvent({
            title: "",
            description: "",
            image: "",
            location: "",
            category: "Company Meeting",
            time: "",
          });
          setShowCreateDialog(false);
          setNewEventDate("");

          alert("Event created successfully and saved to database!");
          console.log("✅ Event saved to MongoDB:", result.data);

          // Refresh events from database to ensure sync
          fetchEventsFromDatabase();
        } else {
          alert("Failed to create event: " + result.error);
          console.error("❌ Create event failed:", result.error);
        }
      } catch (error) {
        console.error("Error creating event:", error);
        alert("Error creating event. Please check if the server is running.");
      }
    } else {
      alert(
        "Please fill in all required fields (Title, Description, Location)."
      );
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Company Meeting": "bg-blue-500",
      Training: "bg-green-500",
      "Team Building": "bg-purple-500",
      Review: "bg-orange-500",
      Wellness: "bg-pink-500",
      Technology: "bg-indigo-500",
      "Custom Event": "bg-gray-500",
    };
    return colors[category] || "bg-gray-500";
  };

  // Calendar Component (Integrated)
  const Calendar = ({ onDateClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const startDay = startOfMonth.getDay();
    const totalDays = endOfMonth.getDate();

    const prevMonth = () => {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    };

    const nextMonth = () => {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    };

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    const today = new Date();

    // Check if a date has events
    const hasEvent = (day) => {
      if (!day) return false;
      const dateStr = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      ).toDateString();
      return [...upcomingEvents, ...recentEvents].some(
        (event) => new Date(event.date).toDateString() === dateStr
      );
    };

    return (
      <div
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6"
      >
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <button
            onClick={prevMonth}
            className="p-2 sm:p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 text-gray-600 hover:text-blue-600"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center">
            {currentDate.toLocaleString("default", { month: "long" })}{" "}
            {currentDate.getFullYear()}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 sm:p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 text-gray-600 hover:text-blue-600"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day, index) => (
              <div
                key={day}
                className={`p-1 sm:p-2 text-center text-xs sm:text-sm font-semibold ${
                  index === 0 || index === 6 ? "text-red-500" : "text-gray-600"
                }`}
              >
                {day}
              </div>
            )
          )}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day, index) => {
            const isToday =
              day === today.getDate() &&
              currentDate.getMonth() === today.getMonth() &&
              currentDate.getFullYear() === today.getFullYear();

            const hasEventOnDay = hasEvent(day);
            const isWeekend = index % 7 === 0 || index % 7 === 6;

            return (
              <div
                key={index}
                onClick={() =>
                  day &&
                  onDateClick &&
                  onDateClick(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      day
                    )
                  )
                }
                className={`h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 text-xs sm:text-sm font-medium relative ${
                  day
                    ? isToday
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-110"
                      : hasEventOnDay
                      ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md hover:shadow-lg"
                      : isWeekend
                      ? "bg-white text-red-500 hover:bg-red-50 hover:shadow-md"
                      : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
                    : ""
                }`}
              >
                {day || ""}
                {hasEventOnDay && !isToday && (
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center items-center space-x-6 mt-4 sm:mt-6 text-xs"></div>
      </div>
    );
  };

  return (
    <div
      className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen"
      style={{ marginLeft: "60px" }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 sm:mb-8 space-y-4 lg:space-y-0">
          <div className="flex-1 lg:pr-6">
            <h1
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
              style={{ marginBottom: "8px" }}
            >
              Company Events
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Manage and track all company events with ease
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => {
                // Set current date when Create Event button is clicked
                const currentDate = new Date().toDateString();
                setNewEventDate(currentDate);
                setShowCreateDialog(true);
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl font-semibold text-sm transform hover:scale-105"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Create Event</span>
            </button>
            <div
              className="flex bg-white border border-gray-200 shadow-lg overflow-hidden rounded-lg"
            >
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 font-semibold text-sm ${
                  activeTab === "upcoming"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab("recent")}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 font-semibold text-sm ${
                  activeTab === "recent"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600"
                }`}
              >
                Recent
              </button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 sm:mb-8">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col space-y-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Event Calendar
              </h2>
              {/* Calendar Filters */}
              <div className="flex flex-col space-y-3">
                <select
                  value={calendarFilter}
                  onChange={(e) => setCalendarFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 text-sm transition-all duration-200"
                >
                  <option value="all">All Events</option>
                  <option value="Company Meeting">Company Meetings</option>
                  <option value="Training">Training</option>
                  <option value="Team Building">Team Building</option>
                  <option value="Review">Reviews</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Technology">Technology</option>
                </select>

                {/* Date Range Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <input
                    type="date"
                    className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 text-sm transition-all duration-200"
                    placeholder="From Date"
                  />
                  <span className="text-gray-500 text-sm text-center sm:text-left">to</span>
                  <input
                    type="date"
                    className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 text-sm transition-all duration-200"
                    placeholder="To Date"
                  />
                </div>
              </div>
            </div>
            <Calendar onDateClick={handleDateClick} />
          </div>
        </div>

        {/* Events Display */}
        <div className="mb-6 sm:mb-8">
          {activeTab === "upcoming" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Upcoming Events
                </h2>
                <span className="text-xs text-gray-500 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 rounded-full font-medium self-start sm:self-auto">
                  {upcomingEvents.length} events scheduled
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-32 sm:h-36 object-cover"
                    />
                    <div className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold text-white self-start ${getCategoryColor(
                            event.category
                          )}`}
                        >
                          {event.category}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {event.date}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                        {event.description}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 mb-3 space-y-1 sm:space-y-0">
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                          </svg>
                          <span>{event.attendees} attending</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          Show
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                "Are you sure you want to delete this event?"
                              )
                            ) {
                              handleDeleteEvent(event.id);
                            }
                          }}
                          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "recent" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Recent Events
                </h2>
                <span className="text-xs text-gray-500 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1 rounded-full font-medium self-start sm:self-auto">
                  {recentEvents.length} past events
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-32 sm:h-36 object-cover"
                    />
                    <div className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold text-white self-start ${getCategoryColor(
                            event.category
                          )}`}
                        >
                          {event.category}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {event.date}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                        {event.description}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 mb-3 space-y-1 sm:space-y-0">
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                          </svg>
                          <span>{event.participants} participated</span>
                        </div>
                      </div>
                      <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105">
                        View Photos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Event Detail Dialog */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Background Overlay */}
            <div
              className="absolute inset-0"
              onClick={closeDialog}
              style={{
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(10px)",
              }}
            ></div>

            {/* Dialog Content with Scroll */}
            <div
              className="relative rounded-xl shadow-2xl max-w-3xl w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] z-10 overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              {/* Dialog Header */}
              <div className="relative">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-40 sm:h-48 object-cover rounded-t-xl"
                />
                <button
                  onClick={closeDialog}
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 z-20"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg ${getCategoryColor(
                      selectedEvent.category
                    )}`}
                  >
                    {selectedEvent.category}
                  </span>
                </div>
              </div>

              {/* Dialog Body with Scroll */}
              <div
                className="overflow-y-auto p-4 sm:p-5"
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  maxHeight: "calc(95vh - 180px)",
                }}
              >
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
                  {selectedEvent.title}
                </h3>

                {/* Current Date Display */}
                {selectedEvent.clickedDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-blue-800 text-sm font-medium">
                      📅 Viewed on: {selectedEvent.clickedDate} at {selectedEvent.clickedTime}
                    </p>
                  </div>
                )}

                <p className="text-gray-600 mb-4 text-sm">
                  {selectedEvent.description}
                </p>

                {/* Event Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Date & Time
                        </p>
                        <p className="text-gray-600 text-sm">
                          {selectedEvent.date}{" "}
                          {selectedEvent.time && `at ${selectedEvent.time}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Location
                        </p>
                        <p className="text-gray-600 text-sm">
                          {selectedEvent.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-purple-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Attendees
                        </p>
                        <p className="text-gray-600 text-sm">
                          {selectedEvent.attendees ||
                            selectedEvent.participants}{" "}
                          {selectedEvent.attendees
                            ? "expected"
                            : "participated"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-orange-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Category
                        </p>
                        <p className="text-gray-600 text-sm">
                          {selectedEvent.category}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={closeDialog}
                    className="w-full sm:w-auto px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this event?"
                        )
                      ) {
                        handleDeleteEvent(selectedEvent.id);
                      }
                    }}
                    className="w-full sm:w-auto px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Event Dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Background Overlay */}
            <div
              className="absolute inset-0"
              onClick={closeDialog}
              style={{
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(10px)",
              }}
            ></div>

            {/* Dialog Content with Scroll */}
            <div
              className="relative rounded-xl shadow-2xl max-w-2xl w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] z-10 overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              {/* Dialog Header */}
              <div
                className="flex items-center justify-between border-b border-gray-200 bg-white rounded-t-xl p-4 sm:p-6"
              >
                <div className="flex-1 pr-4">
                  <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                    Create New Event
                  </h3>
                  <p className="text-gray-600 text-sm">
                    📅 Scheduled for {newEventDate}
                  </p>
                </div>
                <button
                  onClick={closeDialog}
                  className="w-8 h-8 bg-gray-500 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 flex-shrink-0"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Dialog Body with Scroll */}
              <div
                className="overflow-y-auto bg-white p-4 sm:p-6 space-y-4"
                style={{
                  maxHeight: "calc(95vh - 140px)",
                }}
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event title"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 text-sm shadow-sm"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 bg-white text-sm shadow-sm"
                      value={newEvent.category}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, category: e.target.value })
                      }
                    >
                      <option value="Company Meeting">Company Meeting</option>
                      <option value="Training">Training</option>
                      <option value="Team Building">Team Building</option>
                      <option value="Review">Review</option>
                      <option value="Wellness">Wellness</option>
                      <option value="Technology">Technology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 text-sm shadow-sm"
                      value={newEvent.time}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event location"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 text-sm shadow-sm"
                    value={newEvent.location}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    placeholder="Enter event description"
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 resize-none text-sm shadow-sm"
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Image *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 text-sm shadow-sm file:mr-2 sm:file:mr-3 file:py-1 file:px-2 sm:file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gradient-to-r file:from-blue-50 file:to-indigo-50 file:text-blue-700 hover:file:bg-gradient-to-r hover:file:from-blue-100 hover:file:to-indigo-100"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // In a real app, you'd upload this file and get a URL
                          const url = URL.createObjectURL(file);
                          setNewEvent({ ...newEvent, image: url });
                        }
                      }}
                    />
                  </div>
                  {newEvent.image && (
                    <img
                      src={newEvent.image}
                      alt="Preview"
                      className="mt-3 w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                  )}
                </div>
              </div>

              {/* Dialog Footer */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200 bg-white rounded-b-xl">
                <button
                  onClick={closeDialog}
                  className="w-full sm:w-auto px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-all duration-300 font-semibold text-sm shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="w-full sm:w-auto px-6 py-2 text-white bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 rounded-lg"
                >
                  Save Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
