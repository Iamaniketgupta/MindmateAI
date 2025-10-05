import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  FaRobot,
  FaChartBar,
  FaGamepad,
  FaHeartbeat,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { FaFaceSmile, FaPerson } from "react-icons/fa6";
import { SiCodementor } from "react-icons/si";
import {
  FaFileVideo,
  FaCalendarPlus,
  FaUserEdit,
  FaCalendarCheck,
} from "react-icons/fa";
import { FaNotesMedical } from "react-icons/fa6";

const TherapistDashboard = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    {
      name: "My Bookings",
      icon: <FaCalendarCheck />,
      path: "/therapist/dashboard",
    },
    {
      name: "Create Slot",
      icon: <FaCalendarPlus />,
      path: "/therapist/dashboard/create-slot",
    },
    {
      name: "Update Profile",
      icon: <FaUserEdit />,
      path: "/therapist/dashboard/update-profile",
    },
  ];

  return (
    <div className="relative text-white bg-background flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <motion.nav
        initial={{ x: -200, opacity: 0 }}
        animate={isOpen ? { x: 0, opacity: 1 } : { x: -200, opacity: 0 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 left-0 h-screen   shadow-lg w-64 z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          className=" p-2 rounded-full  transition-all absolute top-4 right-4"
          onClick={() => setIsOpen(false)}
        >
          <FaTimes />
        </button>

        {/* Tabs */}
        <div className="flex flex-col  space-y-4">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.path}
              onClick={() => setIsOpen(false)} // Close sidebar on click
              className={`flex items-center bg-background space-x-3 p-3 rounded-lg hover: transition-all duration-300 text-lg font-medium ${
                location.pathname === tab.path ? "" : ""
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span>{tab.name}</span>
            </Link>
          ))}
        </div>
      </motion.nav>

      {/* Hamburger Menu */}
      {!isOpen && (
        <button
          className="fixed top-4 left-4 z-50  p-3 bg-gray-900 rounded-full hover: transition-all"
          onClick={() => setIsOpen(true)}
        >
          <FaBars />
        </button>
      )}

      {/* Main Content Area */}
      <div className="flex-1 bg-background transition-all duration-300 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default TherapistDashboard;
