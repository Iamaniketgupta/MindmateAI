import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import { FaPhone, FaSearch } from "react-icons/fa";

export default function AllTherapists({ type = "therapist" }) {
  const [search, setSearch] = useState("");
  const [allTherapists, setAllTherapists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await axiosInstance.get(`/therapist/${type}`);
        setAllTherapists(response.data.therapists);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTherapists();
  }, []);

  const filteredTherapists = allTherapists.filter(
    (therapist) =>
      therapist.name?.toLowerCase().includes(search.toLowerCase()) ||
      therapist.specialization?.some((spec) =>
        spec.toLowerCase().includes(search.toLowerCase())
      )
  );

  return (
    <div
      className="lg:px-20 md:px-10 p-4 md:py-12 min-h-screen"
      style={{ backgroundColor: "#020817" }}
    >
      {/* Search */}
      <div className="flex mb-12 justify-center">
        <div className="relative w-full max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or specialization..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-transparent border border-gray-700 focus:border-pink-200 focus:ring-1 focus:ring-pink-300 text-white placeholder-gray-400 outline-none transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
            <div
            key={index}
            className="glass border border-glass-border rounded-2xl
                  hover-lift hover:shadow-[var(--color-shadow-glow)]
                  p-8 group cursor-pointer"
          >
                <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-3"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto mb-2"></div>
                <div className="h-10 bg-gray-700 rounded w-full mt-6"></div>
              </div>
            ))
          : filteredTherapists.map((therapist) => (
              <div
                key={therapist._id}
                className="glass border border-glass-border hover:shadow-[var(--color-shadow-glow)] hover-lift transition-all rounded-2xl p-8 w-full max-w-[320px] flex flex-col items-center text-white"
              >
                {/* Avatar */}
                <img
                  src="https://img.freepik.com/premium-vector/avatar-icon0002_750950-43.jpg?semt=ais_hybrid"
                  alt={therapist.name}
                  className="w-24 h-24 bg-white border-2 border-emerald-700 rounded-full mb-4"
                />

                {/* Name */}
                <h3 className="text-xl font-semibold">{therapist.name}</h3>

                {/* Info */}
                <p className="text-gray-400 text-sm mt-2 text-center">
                  Specialized in:{" "}
                  <span className="text-white">
                    {therapist.specialization.join(", ")}
                  </span>
                </p>
                <p className="text-gray-400 text-sm text-center">
                  Experience:{" "}
                  <span className="text-white">{therapist.experience} years</span>
                </p>

                {/* Fee */}
                <div className="mt-5 text-center">
                  <p>
                    Fee:{" "}
                    <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text">
                      Rs.{therapist.virtualFee}
                    </span>
                  </p>
                </div>

                {/* Action */}
                <Link
                  to={`/mentor/${therapist._id}`}
                  className="mt-6 bg-gradient-to-r from-gradient-secondary to-gradient-primary flex items-center gap-2 justify-center text-white py-2 px-6 rounded-lg font-medium hover:opacity-80 transition"
                >
                  <FaPhone />
                  Book a Call
                </Link>
              </div>
            ))}
      </div>
    </div>
  );
}
