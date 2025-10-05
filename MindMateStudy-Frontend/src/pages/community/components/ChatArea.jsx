import React, { useEffect, useRef, useState } from "react";
import MessageArea from "./MessageArea";
import { useSocket } from "../../../context/SocketProvider";
import { useDispatch, useSelector } from "react-redux";
import { useChatContext } from "../../../context/ChatProvider";
import toast from "react-hot-toast";
import { setOnlineUsers } from "../../../../store/chatSlice";
import { FiMoreVertical, FiUsers } from "react-icons/fi";
import { FaVideo } from "react-icons/fa";
import { Link } from "react-router-dom";
import axiosInstance from "../../../config/axiosConfig";
import Loader from "../../../components/common/Loader";
import dayjs from "dayjs";

export const formatDate = (date) => {
  const messageDate = dayjs(date);
  const today = dayjs();
  const yesterday = today.subtract(1, "day");

  if (messageDate.isSame(today, "day")) return "Today";
  if (messageDate.isSame(yesterday, "day")) return "Yesterday";
  return messageDate.format("MMM D, YYYY");
};

export default function ChatArea() {
  const socket = useSocket();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user);
  const onlineUsers = useSelector((state) => state.chat.onlineUsers);

  const [messageLoading, setMessageLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    notifications,
    setNotifications,
    setLatestMessage,
    messages,
    setMessages,
    setAllChats,
    currSelectedChat,
    setCurrSelectedChat,
  } = useChatContext();

  const handleFetchChatMessages = async () => {
    if (!currSelectedChat) return;
    try {
      setMessageLoading(true);
      const res = await axiosInstance.get(
        `/community/messages/${currSelectedChat._id}`
      );
      setMessages(res.data.messages);
    } catch (error) {
      console.log(error);
    } finally {
      setMessageLoading(false);
    }
  };

  useEffect(() => {
    handleFetchChatMessages();
  }, [currSelectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-[#020817]">
      {!currSelectedChat ? (
        <div className="flex items-center justify-center min-h-full w-full">
          <div className="flex flex-col items-center">
            <img
              className="object-cover h-32 w-32 rounded-full mb-4"
              src="https://assets.turbologo.ru/blog/ru/2022/04/15044031/156.png"
              alt="Start Chat"
            />
            <h2 className="text-white text-lg font-semibold opacity-70">
              START A CHAT
            </h2>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Header */}
          <div className="p-4 flex items-center justify-between bg-gradient-to-r from-gradient-secondary-dark to-gradient-primary-dark
 rounded-t-2xl shadow-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#0A111C] flex items-center justify-center text-white mr-3">
                <FiUsers size={18} />
              </div>
              <div>
                <h3 className="text-white font-semibold">{currSelectedChat?.name}</h3>
                <p className="text-gray-300 text-xs">{currSelectedChat?.memberCount} members</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to={`/community/vc/${currSelectedChat?._id}`}
                className="text-white hover:text-gray-200 transition"
              >
                <FaVideo size={20} />
              </Link>
              <button className="text-white hover:text-gray-200">
                <FiUsers size={20} />
              </button>
              <button className="text-white hover:text-gray-200">
                <FiMoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          {messageLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => {
                const isSender = msg.sender?._id === currentUser?._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                        isSender
                          ? "bg-gradient-to-r from-gradient-secondary to-gradient-primary text-white rounded-br-none"
                          : "bg-[#0A111C] text-white border border-gray-700 rounded-bl-none"
                      }`}
                    >
                      {!isSender && (
                        <p className="text-xs font-medium text-teal-400 mb-1">
                          {msg.sender?.name}
                        </p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 text-right ${
                          isSender ? "text-teal-200" : "text-gray-400"
                        }`}
                      >
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef}></div>
            </div>
          )}

          {/* Message Input */}
          <MessageArea currSelectedChat={currSelectedChat} setMessages={setMessages} />
        </>
      )}
    </div>
  );
}
