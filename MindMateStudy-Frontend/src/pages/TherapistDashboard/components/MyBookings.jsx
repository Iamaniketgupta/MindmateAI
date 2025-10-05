import React, { useEffect, useState } from "react";
import axiosInstance from "../../../config/axiosConfig";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";
import { FaVideo } from "react-icons/fa";
import { Link } from "react-router-dom";

const MyBookings = () => {
  const user = useSelector((state) => state.user);
  const therapistId = user?._id;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState([]);

  const getBookings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/appointment/therapist-appointments/${therapistId}`
      );

      // Map slot info from response
      const fetchedBookings = response.data.appointments.map((b) => ({
        ...b,
        date: b.slotId?.date,
        timeSlot: b.slotId?.timeSlot, // expected format: "HH:mm-HH:mm"
      }));

      setBookings(fetchedBookings);

      // Prepare JS Date objects for calendar
      const marked = fetchedBookings
        .filter((b) => b.date)
        .map((b) => dayjs(b.date, "YYYY-MM-DD").toDate());
      setMarkedDates(marked);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (therapistId) getBookings();
  }, [therapistId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Check if current time is within the slot
  const isOngoing = (slot) => {
    if (!slot?.date || !slot?.timeSlot) return false;

    const [startStr, endStr] = slot.timeSlot.split("-"); // e.g., "00:04" & "01:06"
    const [startHour, startMin] = startStr.split(":").map(Number);
    const [endHour, endMin] = endStr.split(":").map(Number);

    const startTime = dayjs(slot.date)
      .hour(startHour)
      .minute(startMin)
      .second(0);

    const endTime = dayjs(slot.date)
      .hour(endHour)
      .minute(endMin)
      .second(0);

    const now = dayjs();

    return now.isAfter(startTime) && now.isBefore(endTime);
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const isBooked = markedDates.some(
        (d) =>
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
      );
      return isBooked ? "bg-emerald-200 rounded-lg font-semibold" : null;
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#020817" }}>
      <h1 className="text-3xl font-bold mb-8 text-center text-white bg-gradient-to-r from-gradient-secondary to-gradient-primary bg-clip-text">
        My Bookings
      </h1>

      {/* Calendar */}
      <div className="mb-10 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Appointments Calendar
        </h2>
        <Calendar
          tileClassName={tileClassName}
          value={markedDates}
          className="text-black bg-background p-4 rounded-2xl shadow-lg"
        />
        <p className="mt-2 text-gray-300 text-sm">
          Green dates indicate booked appointments
        </p>
      </div>

      {/* Bookings */}
      {loading ? (
        <p className="text-white text-center">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-white text-center">No bookings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const ongoing = isOngoing(booking?.slotId);

            return (
              <div
                key={booking._id}
                className="glass border border-glass-border rounded-2xl p-6 shadow-md hover:shadow-[var(--color-shadow-glow)] transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {booking.userId?.name || "Patient"}
                  </h3>
                  <p className="text-gray-300 mb-1">
                    <span className="font-medium text-white">Date:</span>{" "}
                    {dayjs(booking.date).format("DD MMM, YYYY")}
                  </p>
                  <p className="text-gray-300 mb-3">
                    <span className="font-medium text-white">Time:</span>{" "}
                    {booking.timeSlot}
                  </p>
                  {!ongoing && (
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                        booking.paymentStatus
                      )}`}
                    >
                      {booking.paymentStatus}
                    </span>
                  )}
                </div>

                {/* Join Call button if ongoing */}
                {/* {ongoing && ( */}
                  <Link
                    to={`/vc/${booking.roomId}`}
                    className="mt-4 bg-gradient-to-r from-gradient-secondary to-gradient-primary text-white text-center py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition"
                  >
                    <FaVideo />
                    Join Call
                  </Link>
                {/* )} */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
