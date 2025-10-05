import React, { useEffect, useState } from "react";
import { FaPhone } from "react-icons/fa6";
import { useSelector } from "react-redux";
import axiosInstance from "../../config/axiosConfig";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

export default function Appointment() {
  const currUser = useSelector((state) => state.user);
  const [allAppointments, setAllAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axiosInstance.get(
          "/appointment/my-appointments"
        );
        setAllAppointments(response.data.appointments);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAppointments();
  }, []);

  // Helper: check if slot is expired
  const isSlotExpired = (date, timeSlot) => {
    if (!timeSlot) return true;
    const [start, end] = timeSlot.split(" - ");
    const slotEnd = dayjs(`${date} ${end}`, "YYYY-MM-DD hh:mm A");
    return dayjs().isAfter(slotEnd);
  };

  const mentors = allAppointments.filter(
    (a) => a.therapistId?.type?.toLowerCase() === "mentor"
  );
  const therapists = allAppointments.filter(
    (a) => a.therapistId?.type?.toLowerCase() === "therapist"
  );

  const renderAppointmentCard = (appointment) => {
    const expired = isSlotExpired(
      appointment.slotId.date,
      appointment.slotId.timeSlot
    );

    return (
      <div
        key={appointment._id}
        className="relative rounded-2xl p-[2px] glass  shadow-md hover:shadow-[var(--color-shadow-glow)] transition"
      >
        <div className="glass rounded-2xl p-5 flex flex-col justify-between h-full">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {appointment.therapistId.name}
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              {dayjs(appointment.slotId.date).format("DD MMM, YYYY")} ·{" "}
              {appointment.slotId.timeSlot}
            </p>

            {/* Expired / Upcoming Badge */}
            <span
              className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                expired
                  ? "bg-red-500/20 text-red-400"
                  : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              {expired ? "Expired" : "Upcoming"}
            </span>
          </div>

          {expired ? (
            <button
              disabled
              className="mt-4 w-full bg-gray-700 text-gray-400 py-2 rounded-lg cursor-not-allowed"
            >
              <FaPhone className="inline-block mr-2" />
              Expired
            </button>
          ) : (
            <Link
              to={`/vc/${appointment.roomId}`}
              className="mt-4 bg-gradient-to-r from-gradient-secondary to-gradient-primary text-white text-center py-2 rounded-lg flex items-center gap-2 justify-center hover:opacity-90 transition"
            >
              <FaPhone />
              Join Call
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="lg:px-20 md:px-10 p-4 md:py-6 min-h-screen">
      {/* Title */}
      <h1 className="text-2xl md:text-5xl font-bold text-stone-200 bg-clip-text font-technical mb-6">
        My <span className="text-gradient-secondary">Appointments</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-5">
        {/* Mentor Column */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Mentor</h2>
          {mentors.length > 0 ? (
            <div className="grid grid-cols-1 gap-5">
              {mentors.map(renderAppointmentCard)}
            </div>
          ) : (
            <p className="text-gray-400">No mentor appointments found.</p>
          )}
        </div>

        {/* Therapist Column */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Therapist</h2>
          {therapists.length > 0 ? (
            <div className="grid grid-cols-1 gap-5">
              {therapists.map(renderAppointmentCard)}
            </div>
          ) : (
            <p className="text-gray-400">No therapist appointments found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
