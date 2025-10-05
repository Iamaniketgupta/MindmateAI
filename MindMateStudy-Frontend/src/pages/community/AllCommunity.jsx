import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiUsers,
  FiBook,
  FiArrowRight,
  FiHash,
} from "react-icons/fi";
import { MdSchool, MdWorkspacesOutline } from "react-icons/md";
import axiosInstance from "../../config/axiosConfig";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useChatContext } from "../../context/ChatProvider";
import { Link } from "react-router-dom";

const AllCommunity = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [communities, setCommunities] = useState([]);
  const curruser = useSelector((state) => state.user);
  const { currSelectedChat, setCurrSelectedChat } = useChatContext();

  const handleFetchAllCommunities = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(`/community`);
      setCommunities(res.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCommunity = async (id) => {
    try {
      setIsLoading(true);
      await axiosInstance.put(`/community/join/${id}`);
      toast.success("Joined community successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Failed to join community!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchAllCommunities();
  }, []);

  const filteredCommunities =
    communities?.filter(
      (community) =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        community.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="min-h-screen p-6 bg-[#020817]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="md:text-3xl text-2xl lg:text-5xl font-bold font-technical bg-gradient-to-r from-gradient-secondary to-gradient-primary py-2 text-stone-200 bg-clip-text mb-3">
            Explore <span className="text-gradient-secondary">Learning</span>{" "}
            Communities
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Join vibrant communities of learners, educators, and experts to
            enhance your knowledge journey.
          </p>
        </header>

        {/* Search Bar */}
        <div className="relative mb-10 max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-white/50" size={20} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-3 border border-gray-700 rounded-xl bg-[#0A111C] text-white shadow-sm focus:ring-2 outline-none focus:ring-gradient-primary"
            placeholder="Search communities by name, topic or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Community Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-6 shadow-md h-64 animate-pulse"
              />
            ))
          ) : filteredCommunities.length > 0 ? (
            filteredCommunities.map((community) => (
              <Link
                to={`/community/dashboard`}
                onClick={() => setCurrSelectedChat(community)}
                key={community._id}
                className="glass rounded-2xl p-6 shadow-md hover:shadow-[var(--color-shadow-glow)] transition flex flex-col justify-between border border-glass-border"
              >
                <div>
                  <div className="flex items-start mb-4">
                    <div className="p-3 bg-[#0A111C] rounded-lg mr-4">
                      {community.icon === "academic" ? (
                        <MdSchool className="text-gradient-primary" size={24} />
                      ) : community.icon === "professional" ? (
                        <MdWorkspacesOutline
                          className="text-gradient-primary"
                          size={24}
                        />
                      ) : (
                        <FiHash className="text-gradient-primary" size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {community.name}
                      </h3>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-800 text-white/80 rounded-full mt-1">
                        {community.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-5">{community.description}</p>
                  <div className="flex justify-between items-center mb-5 text-gray-300 text-sm">
                    <div className="flex items-center">
                      <FiUsers className="mr-1" />
                      <span>{community.memberCount} members</span>
                    </div>
                    <div className="flex items-center">
                      <FiBook className="mr-1" />
                      {/* Courses or extra info */}
                    </div>
                  </div>
                </div>

                <button
                  disabled={community.members.some(
                    (member) => member._id === curruser._id
                  )}
                  onClick={() => handleJoinCommunity(community._id)}
                  className={`w-full flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-colors ${
                    community.members.some(
                      (member) => member._id === curruser._id
                    )
                      ? "bg-gradient-to-r from-gray-600 to-gray-700 opacity-50 cursor-not-allowed text-white"
                      : "bg-gradient-to-r from-gradient-secondary to-gradient-primary text-white"
                  }`}
                >
                  {community.members.some(
                    (member) => member._id === curruser._id
                  )
                    ? "Joined"
                    : "Join Community"}
                  {community.members.some(
                    (member) => member._id === curruser._id
                  ) && <FiArrowRight className="ml-2" />}
                </button>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-300">
              <MdWorkspacesOutline
                className="mx-auto text-gray-600"
                size={48}
              />
              <h3 className="mt-4 text-lg font-medium text-white">
                No communities found
              </h3>
              <p className="mt-1 text-gray-400">
                Try adjusting your search query
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllCommunity;
