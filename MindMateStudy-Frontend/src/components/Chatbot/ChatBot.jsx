import { useState, useRef, useEffect } from "react";
import {
  FaPaperPlane,
  FaImage,
  FaMicrophone,
  FaLightbulb,
  FaRobot,
  FaUser,
  FaExpand,
} from "react-icons/fa";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import {
  FiSend,
  FiImage,
  FiMic,
  FiX,
  FiDownload,
  FiShare,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../config/axiosConfig";
import { useNavigate } from "react-router-dom";
import AnalyzingModal from "./AnalyzingModal";
import SosModal from "./SOSAlert";
import { useSelector } from "react-redux";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your MindMate AI assistant. How can I help you learn today?",
      sender: "bot",
      emotion: "happy",
      timestamp: new Date(),
    },
  ]);
  const [showSOSAlert, setShowSOSAlert] = useState(false);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showMicModal, setShowMicModal] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // chat, analysis
  const [expandedImage, setExpandedImage] = useState(null);

  const user = useSelector((state) => state.user);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [location, setLocation] = useState({ lat: null, lon: null });

  const emotionIcons = {
    sad: "😢",
    happy: "😊",
    neutral: "😐",
    angry: "😡",
    disgust: "🤢",
    fear: "😱",
    excited: "🤩",
    curious: "🤔",
  };

  const emotionColors = {
    sad: "from-blue-400 to-purple-400",
    happy: "from-yellow-400 to-orange-400",
    neutral: "from-gray-400 to-gray-500",
    angry: "from-red-400 to-pink-400",
    disgust: "from-green-400 to-teal-400",
    fear: "from-purple-400 to-indigo-400",
    excited: "from-pink-400 to-red-400",
    curious: "from-cyan-400 to-blue-400",
  };

  const navigate = useNavigate();

  const fetchChat = async () => {
    try {
      setLoadingChats(true);
      const response = await axiosInstance.get("/chat/chats");
      if (response.data) {
        const arr = response.data.chats;
        let a = [];
        arr.forEach((res) => {
          a.push({
            text: res.message,
            emotion: res.emotion,
            sender: "user",
            timestamp: new Date(res.timestamp),
          });
          a.push({
            text: res.response,
            emotion: res.emotion,
            sender: "bot",
            timestamp: new Date(res.timestamp),
          });
        });
        setMessages(a);
      }
    } catch (error) {
      console.log("Error fetching chats:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (user) fetchChat();
  }, [user]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const speakText = (text) => {
    if (!text) return;

    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    synth.speak(utterance);
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() && !selectedImage) return;
    if (loading) return;

    setLoading(true);

    const newMessage = {
      text: messageText,
      image: imagePreview,
      sender: "user",
      emotion: "",
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    setInput("");
    setSelectedImage(null);
    setImagePreview(null);

    try {
      let response;

      if (selectedImage) {
        const formData = new FormData();
        formData.append("file", selectedImage);
        formData.append("message", messageText);
        formData.append("prevData", messages);
        formData.append("location", location);

        if (messageText.toLowerCase().includes("suicide")) {
          setShowSOSAlert(true);
        }

        response = await axiosInstance.post("/chat/img", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axiosInstance.post("/chat", {
          message: messageText,
          location,
        });
        console.log(response.data);
      }

      if (response.data) {
        if (response.data.response === "sos") {
          setShowSOSAlert(true);
        }

        const botMessage = {
          text: response.data.response,
          sender: "bot",
          emotion: response.data.chat.emotion || "neutral",
          timestamp: new Date(),
        };

        setMessages([...updatedMessages, botMessage]);
        speakText(response.data.response);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([
        ...updatedMessages,
        {
          text: "⚠️ Sorry, I encountered an error. Please try again.",
          sender: "bot",
          emotion: "sad",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (loading) return;

    try {
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        alert(
          "Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari."
        );
        return;
      }

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      setTranscript("");
      setShowMicModal(true);
      setIsListening(true);

      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      let finalTranscript = "";

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setShowMicModal(false);
        if (finalTranscript.trim()) {
          handleSend(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setShowMicModal(false);
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      setIsListening(false);
      setShowMicModal(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setShowMicModal(false);
  };

  const handleAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const response = await axiosInstance.get("/chat/analyze");
      if (response.data) {
        navigate("/dashboard/analysis");
      }
    } catch (error) {
      console.log("Error analyzing:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportChat = () => {
    const chatText = messages
      .map(
        (msg) =>
          `${msg.sender.toUpperCase()} [${msg.timestamp.toLocaleTimeString()}]: ${
            msg.text
          }`
      )
      .join("\n\n");

    const element = document.createElement("a");
    const file = new Blob([chatText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `MindMate-chat-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 📌 Get location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        async () => {
          try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            setLocation({
              lat: data.latitude,
              lon: data.longitude,
            });
          } catch (err) {
            console.error("IP-based location fetch failed:", err);
          }
        }
      );
    } else {
      // If geolocation API not supported → fallback
      (async () => {
        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();
          setLocation({
            lat: data.latitude,
            lon: data.longitude,
          });
        } catch (err) {
          console.error("IP-based location fetch failed:", err);
        }
      })();
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900/50 to-gray-900/80"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-r lg:px-20 md:lg-15 px-4 from-gray-800/50 to-gray-900/50 backdrop-blur-lg border-b border-gray-700/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FaRobot className="text-3xl text-cyan-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">MindMate AI</h1>
                <p className="text-gray-400 text-sm">
                  Your intelligent learning companion
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={exportChat}
                className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-colors"
                title="Export Chat"
              >
                <FiDownload className="text-gray-300" />
              </button>
              <button
                onClick={handleAnalysis}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-3 py-2 rounded-xl transition-all"
              >
                <FaLightbulb className="text-white" />
                <span className="text-white font-medium">Analyze</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingChats ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className={`max-w-md p-4 rounded-2xl relative animate-pulse backdrop-blur-lg ${
                    index % 2 === 0
                      ? "bg-cyan-500/10 ml-auto border border-cyan-500/20"
                      : "bg-gray-700/30 mr-auto border border-gray-600/20"
                  }`}
                >
                  <div className="h-4 w-20 bg-gray-600 rounded mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-600 rounded"></div>
                    <div className="h-3 w-5/6 bg-gray-600 rounded"></div>
                    <div className="h-3 w-4/6 bg-gray-600 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`group max-w-md rounded-2xl p-4 relative backdrop-blur-lg border ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20"
                        : "bg-gradient-to-r from-gray-700/30 to-gray-800/30 border-gray-600/20"
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-2 rounded-full ${
                            msg.sender === "user"
                              ? "bg-cyan-500/20"
                              : "bg-purple-500/20"
                          }`}
                        >
                          {msg.sender === "user" ? (
                            <FaUser className="text-cyan-400" />
                          ) : (
                            <FaRobot className="text-purple-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-300">
                          {msg.sender === "user" ? "You" : "MindMate"}
                        </span>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="text-gray-200 mb-2">{msg.text}</div>

                    {/* Image */}
                    {msg.image && (
                      <div className="mt-3 relative">
                        <img
                          src={msg.image}
                          alt="Sent"
                          className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setExpandedImage(msg.image)}
                        />
                        <button
                          onClick={() => setExpandedImage(msg.image)}
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 p-1 rounded-full transition-colors"
                        >
                          <FaExpand className="text-white text-xs" />
                        </button>
                      </div>
                    )}

                    {/* Emotion & Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        {msg.emotion && (
                          <>
                            <HiOutlineEmojiHappy className="text-gray-400" />
                            <span className="text-xs text-gray-400 capitalize">
                              {msg.emotion}
                            </span>
                            <span className="text-lg">
                              {emotionIcons[msg.emotion]}
                            </span>
                          </>
                        )}
                      </div>

                      {msg.sender === "bot" && (
                        <button
                          onClick={() => speakText(msg.text)}
                          className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
                          title="Speak message"
                        >
                          <FaMicrophone />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gradient-to-r from-gray-700/30 to-gray-800/30 border border-gray-600/20 rounded-2xl p-4 backdrop-blur-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-gray-400 text-sm">
                        MindMate is thinking...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700/30 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-lg p-4">
          <div className="max-w-4xl mx-auto">
            {/* Image Preview */}
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 flex items-center space-x-3 bg-gray-700/30 rounded-xl p-3 border border-gray-600/20"
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-gray-300 text-sm">Ready to send image</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <FiX className="text-lg" />
                </button>
              </motion.div>
            )}

            {/* Input Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-colors disabled:opacity-50"
                title="Upload image"
              >
                <FiImage className="text-gray-300 text-lg" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={loading}
              />

              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full p-3 bg-gray-700/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="Type your message... (Press Enter to send)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !loading && handleSend()
                  }
                  disabled={loading}
                />
              </div>

              <button
                onClick={startListening}
                disabled={loading}
                className={`p-3 rounded-xl transition-all ${
                  isListening
                    ? "bg-red-500 animate-pulse"
                    : "bg-gray-700/50 hover:bg-gray-600/50"
                } disabled:opacity-50`}
                title="Voice input"
              >
                <FiMic className="text-gray-300 text-lg" />
              </button>

              <button
                onClick={() => handleSend()}
                disabled={loading || (!input.trim() && !selectedImage)}
                className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl transition-all disabled:opacity-50"
                title="Send message"
              >
                <FiSend className="text-white text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Input Modal */}
      <AnimatePresence>
        {showMicModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 w-80 border border-gray-700/50"
            >
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isListening
                        ? "bg-red-500/20 animate-pulse"
                        : "bg-gray-700"
                    }`}
                  >
                    <FiMic
                      className={`text-2xl ${
                        isListening ? "text-red-400" : "text-gray-400"
                      }`}
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {isListening ? "Listening..." : "Processing..."}
                </h3>

                <div className="bg-gray-700/50 rounded-xl p-3 min-h-12 mb-4">
                  <p className="text-gray-200 break-words">
                    {transcript || "Speak now..."}
                  </p>
                </div>

                <button
                  onClick={stopListening}
                  className="w-full py-2 bg-red-500 hover:bg-red-600 rounded-xl text-white transition-colors"
                >
                  Stop Listening
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Image Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={expandedImage}
                alt="Expanded view"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
              >
                <FiX className="text-white text-lg" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnalyzingModal isOpen={isAnalyzing} />
      <SosModal isOpen={showSOSAlert} onClose={() => setShowSOSAlert(false)} />
    </div>
  );
};

export default ChatBot;
