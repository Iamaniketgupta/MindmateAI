import React, { useEffect, useState } from "react";
import { BsEmojiSmile, BsThreeDotsVertical, BsMicFill } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useChatContext } from "../../../context/ChatProvider";
import { useSocket } from "../../../context/SocketProvider";
import axiosInstance from "../../../config/axiosConfig";

const MessageArea = ({ currSelectedChat, setMessages }) => {
  const socket = useSocket();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const currentUser = useSelector((state) => state.user);
  const [typing, setTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { allChatsMessages } = useChatContext();

  // Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  const handleVoiceInput = () => {
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  useEffect(() => {
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
    };
    recognition.onspeechend = () => {
      recognition.stop();
      setIsRecording(false);
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error: " + event.error);
      setIsRecording(false);
    };
  }, [recognition]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const data = {
        communityId: currSelectedChat._id,
        content: message,
      };
      try {
        const res = await axiosInstance.post("/community/message", data);
        socket?.emit("new message", res.data.message);
        setMessages((prev) => [...prev, res.data.message]);
        setMessage("");
      } catch (error) {
        toast.error("Failed to send message");
        console.log(error);
      }
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (!socket) return;

    if (!typing) {
      setTyping(true);
      socket?.emit("typing", { roomId: currSelectedChat?._id, user: currentUser });
    }
    clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(() => {
        setTyping(false);
        socket?.emit("stop typing", currSelectedChat?._id);
      }, 1000)
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const onEmojiClick = (event) => {
    setMessage((prev) => prev + event.emoji);
  };

  return (
    <div className="p-4 bg-[#020817] border-t border-gray-700 relative">
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-0 z-20 shadow-lg rounded-xl overflow-hidden">
          <EmojiPicker height={350} width="20rem" emojiStyle="twitter" onEmojiClick={onEmojiClick} />
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-400 hover:text-teal-400 transition"
        >
          <BsEmojiSmile size={22} />
        </button>

        {/* File/More Options */}
        <label htmlFor="file" className="p-2 text-gray-400 hover:text-teal-400 cursor-pointer">
          <BsThreeDotsVertical size={22} />
        </label>
        <input type="file" id="file" hidden />

        {/* Input Box */}
        <input
          type="text"
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-full bg-[#0A111C] text-white focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400"
        />

        {/* Send / Voice */}
        {message.trim() ? (
          <button
            type="button"
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-gradient-secondary to-gradient-primary text-white p-2 rounded-full hover:opacity-90 transition"
          >
            <IoSend size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2 text-gray-400 hover:text-teal-400 rounded-full ${isRecording ? "text-red-500 animate-pulse" : ""}`}
          >
            <BsMicFill size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageArea;
