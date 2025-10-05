import React, { useEffect, useState } from "react";
import { FiUsers, FiStar } from "react-icons/fi";
import axiosInstance from "../../../config/axiosConfig";
import { useSelector } from "react-redux";
import { useChatContext } from "../../../context/ChatProvider";

export default function AllChats({ isDarkTheme }) {
  const currUser = useSelector((state) => state.user);
  const { allChats, setAllChats, currSelectedChat, setCurrSelectedChat } = useChatContext();
  const [loading, setLoading] = useState(false);

  const fetchAllChats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/community/user`);
      setAllChats(response.data?.data);
    } catch (error) {
      console.error("Error fetching all chats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllChats();
  }, [currUser]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse h-16 rounded-2xl bg-gray-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {allChats.map((community) => (
        <div
          key={community._id}
          onClick={() => setCurrSelectedChat(community)}
          className={`p-4 cursor-pointer flex items-center rounded-2xl transition-all
            ${
              currSelectedChat?._id === community._id
                ? "bg-gradient-to-r from-gradient-secondary to-gradient-primary shadow-lg"
                : isDarkTheme
                ? "bg-[#0A111C] hover:bg-[#111827] shadow-sm"
                : "bg-white hover:bg-gray-50 shadow-sm"
            }`}
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-gradient-secondary to-gradient-primary flex items-center justify-center text-white mr-3">
            <FiUsers size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-semibold text-white truncate">
                {community.name}
                {community.isFavorite && (
                  <FiStar className="inline ml-1 text-yellow-400" size={14} />
                )}
              </p>
              {community.unread > 0 && (
                <span className="bg-gradient-to-r from-gradient-secondary to-gradient-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {community.unread}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-300 truncate">
              {community.lastMessage || "No messages yet"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
