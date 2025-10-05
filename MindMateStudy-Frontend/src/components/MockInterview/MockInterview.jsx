/* eslint-disable no-unused-vars */
import { useRef, useState, useEffect } from "react";
import axiosInstance from "../../config/axiosConfig";
import { FiLoader, FiMic, FiMicOff, FiVolume2, FiVideo, FiVideoOff, FiUpload, FiBook, FiMessageSquare, FiUser } from "react-icons/fi";
import { FaBrain, FaLightbulb, FaRobot, FaUserGraduate } from "react-icons/fa";
import { IoIosRocket } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import pdfToText from 'react-pdftotext';
import Tesseract from 'tesseract.js';
import FaceRecognition from "../../pages/FaceRecognition";
import toast from "react-hot-toast";

const AIStudyBuddy = () => {
  // Refs
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);

  // State
  const [videoStream, setVideoStream] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contentText, setContentText] = useState("");
  const [isProcessingContent, setIsProcessingContent] = useState(false);
  const [contentError, setContentError] = useState(null);
  const [error, setError] = useState(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("upload"); // upload, text, camera
  const navigate = useNavigate();
  const faceRef = useRef(null);
  const [info, setInfo] = useState([]);
  const [storedInfo, setStoredInfo] = useState({});
  const [techStats, setTechStats] = useState({
    speechRecognition: false,
    computerVision: false,
    nlpProcessing: false,
    realTimeAnalysis: false
  });

  // Initialize tech stats
  useEffect(() => {
    setTechStats({
      speechRecognition: "webkitSpeechRecognition" in window,
      computerVision: true, // FaceRecognition component
      nlpProcessing: true, // Always true since we're using AI
      realTimeAnalysis: true
    });
  }, []);

  // File processing functions
  const extractTextFromPdf = async (file) => {
    try {
      const text = await pdfToText(file);
      return text;
    } catch (error) {
      console.error(error);
      throw new Error('Error processing PDF');
    }
  };

  const handlePdf = async (file) => {
    try {
      setIsProcessingContent(true);
      setContentError(null);
      const text = await extractTextFromPdf(file);
      setContentText(text);
      toast.success('PDF processed successfully!');
    } catch (error) {
      console.error(error);
      setContentError('Error processing PDF');
      toast.error('Failed to process PDF');
    } finally {
      setIsProcessingContent(false);
    }
  };

  const handleImage = async (file) => {
    try {
      setIsProcessingContent(true);
      setContentError(null);
      const result = await Tesseract.recognize(file, 'eng');
      setContentText(result.data.text);
      toast.success('Image text extracted successfully!');
    } catch (error) {
      console.error(error);
      setContentError('Error processing image');
      toast.error('Failed to extract text from image');
    } finally {
      setIsProcessingContent(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      handlePdf(file);
    } else if (file.type.startsWith('image/')) {
      handleImage(file);
    } else {
      setContentError('Unsupported file type');
      toast.error('Please upload PDF or image files only');
    }
  };

  const handleTextSubmit = () => {
    if (userPrompt.trim()) {
      setContentText(userPrompt);
      toast.success('Custom topic set!');
    }
  };

  // Interview question handler
  const handleAskQuestion = async (updatedHistory = []) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.post("/interview", {
        history: updatedHistory,
        content: contentText || userPrompt
      });

      if (response.data?.response) {
        const question = response.data.response;
        const newHistory = [
          ...updatedHistory,
          {
            type: "question",
            speaker: "studybuddy",
            content: question,
            timestamp: new Date().toISOString()
          }
        ];
        setHistory(newHistory);
        speakText(question);
      }
    } catch (error) {
      console.error("Error asking question:", error);
      setError('Failed to get next question');
      toast.error('Network error - please try again');
    } finally {
      setLoading(false);
    }
  };

  // Speech synthesis
  const speakText = (text) => {
    if (!text) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    synth.speak(utterance);
  };

  const startInterview = async () => {
    if (!contentText && !userPrompt) {
      toast.error('Please provide content or a topic first!');
      return;
    }

    setInterviewStarted(true);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(console.log);
    }
    await handleAskQuestion([]);
  };

  // Speech recognition
  const startListening = () => {
    if (loading) return;

    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Speech recognition not supported in your browser");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    setTranscript("");
    setIsListening(true);

    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    let finalTranscript = "";

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const txt = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += txt + " ";
        } else {
          interimTranscript += txt;
        }
      }
      setTranscript(finalTranscript || interimTranscript);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) {
        const lastQuestion = history.findLast(item => item.type === "question");
        const updatedHistory = [
          ...history,
          {
            type: "answer",
            speaker: "user",
            content: finalTranscript.trim(),
            question: lastQuestion?.content || "",
            timestamp: new Date().toISOString(),
            confidence: parseInt(storedInfo?.confidence) || 0,
            gender: storedInfo?.gender || "Unknown",
            expression: storedInfo.expressions?.length > 0
              ? storedInfo.expressions.reduce((max, curr) =>
                parseFloat(curr.confidence) > parseFloat(max.confidence) ? curr : max
              ).name
              : "Neutral"
          }
        ];
        setHistory(updatedHistory);
        handleAskQuestion(updatedHistory);
      }
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // Camera setup
  const initCamera = async () => {
    try {
      setCameraError(null);
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setVideoStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Camera access denied");
      toast.error("Please allow camera access for full experience");
    }
  };

  const analyzeInterview = async () => {
    try {
      setIsAnalyzing(true);
      const response = await axiosInstance.post('/interview/report', { history });
      if (response.data) {
        navigate('/interview-analysis');
        toast.success('Analysis completed!');
      }
    } catch (error) {
      console.error("Error analyzing interview:", error);
      setError('Failed to generate report');
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initialize camera
  useEffect(() => {
    initCamera();

    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Face recognition data collection
  useEffect(() => {
    let lastToastTime = 0;
    const interval = setInterval(() => {
      if (faceRef.current) {
        const data = faceRef.current.getFaceData();
        setInfo(data);

        if (data.length > 0) {
          setStoredInfo(data[0]);
        }

        if (data.length > 1) {
          const now = Date.now();
          if (now - lastToastTime > 5000) {
            toast.error('Multiple faces detected');
            lastToastTime = now;
          }
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [faceRef.current]);

  // Auto-scroll chat
  useEffect(() => {
    // chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div className="min-h-screen text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900/50 to-gray-900/80"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center pt-8 pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <FaRobot className="text-4xl text-cyan-400 mr-3 animate-bounce" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r leading-18 from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            AI StudyBuddy
          </h1>
        </div>
        <p className="text-gray-300 text-lg">Your AI companion for interactive learning</p>
      </div>
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-3 gap-6">
         

          {/* Center Panel - Video & Chat */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Panel */}
            <div className="glass backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl">
              <div className="relative bg-black">
                {cameraError ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px] p-4">
                    <FiVideoOff className="text-4xl text-red-500 mb-3" />
                    <p className="text-red-400 mb-4">{cameraError}</p>
                    <button
                      onClick={initCamera}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center"
                    >
                      <FiVideo className="mr-2" />
                      Enable Camera
                    </button>
                  </div>
                ) : videoStream ? (
                  <div className="relative">
                    <FaceRecognition ref={faceRef} />
                    <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      {isListening ? (
                        <span className="flex items-center text-red-400">
                          <span className="relative flex h-3 w-3 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                          Listening...
                        </span>
                      ) : (
                        <span className="text-gray-300">Ready</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <FiLoader className="animate-spin text-3xl mb-3 text-cyan-400" />
                    <p className="text-gray-400">Initializing AI vision...</p>
                  </div>
                )}
              </div>

              {/* Conversation History */}
              <div className="max-h-[400px] overflow-y-auto p-6 space-y-4">
                {history.length === 0 && !interviewStarted ? (
                  <div className="text-center py-8 text-gray-400">
                    <FaUserGraduate className="text-4xl mx-auto mb-3 opacity-50" />
                    <p>Ready to start your interactive learning session!</p>
                  </div>
                ) : (
                  history.map((item, index) => (
                    <div
                      key={index}
                      className={`flex ${item.speaker === "studybuddy" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          item.speaker === "studybuddy"
                            ? "bg-cyan-600/20 border border-cyan-500/30 rounded-bl-none"
                            : "bg-purple-600/20 border border-purple-500/30 rounded-br-none"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {item.speaker === "studybuddy" && (
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                                <FaRobot className="text-white text-sm" />
                              </div>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-sm mb-1">
                              {item.speaker === "studybuddy" ? "StudyBuddy" : "You"}
                            </div>
                            <div className="text-white/90">{item.content}</div>
                          </div>
                          {item.speaker === "user" && (
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <FiUser className="text-white text-sm" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-cyan-600/20 border border-cyan-500/30 rounded-2xl rounded-bl-none p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                          <FaRobot className="text-white text-sm" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-cyan-300">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

           
          </div>

           {/* Left Panel - Content Input */}
           <div className="lg:col-span-1 space-y-6">
             {/* Control Panel */}
             <div className="glass backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={loading || !interviewStarted || cameraError}
                  className={`flex items-center justify-center py-4 px-4 rounded-xl font-medium transition-all ${
                    isListening
                      ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                      : "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30"
                  } ${loading || !interviewStarted || cameraError ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isListening ? (
                    <>
                      <FiMicOff className="mr-2" />
                      Stop Speaking
                    </>
                  ) : (
                    <>
                      <FiMic className="mr-2" />
                      Start Speaking
                    </>
                  )}
                </button>

                {!interviewStarted ? (
                  <button
                    onClick={startInterview}
                    disabled={(!contentText && !userPrompt && activeTab!="camera")}
                    className="col-span-2 flex items-center justify-center py-4 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IoIosRocket className="mr-2 text-lg" />
                    Start Learning Session
                  </button>
                ) : (
                  <>
                    <button
                      onClick={analyzeInterview}
                      disabled={isAnalyzing || history.length === 0}
                      className="flex items-center justify-center py-4 px-4 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 rounded-xl font-medium transition-all disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <FiLoader className="animate-spin mr-2" />
                      ) : (
                        <FaLightbulb className="mr-2" />
                      )}
                      {isAnalyzing ? "Analyzing..." : "Analyze Session"}
                    </button>
                    <button
                      onClick={() => navigate('/interview-analysis')}
                      className="flex items-center justify-center py-4 px-4 bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 rounded-xl font-medium transition-all"
                    >
                      <FiBook className="mr-2" />
                      View Reports
                    </button>
                  </>
                )}
              </div>

              {/* Speech Transcript */}
              <div className="mt-4 p-4 bg-gray-700/30 rounded-xl">
                <div className="text-sm font-medium text-gray-300 mb-2">Live Transcript</div>
             
                <div className="text-cyan-200 min-h-[20px]">
                  {transcript || (isListening ? "Listening for your response..." : "Speech input will appear here...")}
                </div>
              </div>
              <Link 
  to={"/interview-analysis"}
  className="inline-flex items-center mt-10 space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
>
  <span>Previous Reports</span>
</Link>
            </div>
            
          
            {/* Facial Analytics Card */}
            <div className="glass backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-purple-400 flex items-center">
                <FiUser className="mr-2" />
                Facial Analytics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{storedInfo.confidence || "0"}%</div>
                  <div className="text-xs text-gray-400">Confidence</div>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 capitalize">{storedInfo.gender || "Unknown"}</div>
                  <div className="text-xs text-gray-400">Gender</div>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4 text-center col-span-2">
                  <div className="text-lg font-bold text-green-400 capitalize">
                    {storedInfo.expressions?.length > 0
                      ? storedInfo.expressions.reduce((max, curr) =>
                        parseFloat(curr.confidence) > parseFloat(max.confidence) ? curr : max
                      ).name
                      : "Neutral"}
                  </div>
                  <div className="text-xs text-gray-400">Dominant Expression</div>
                </div>
              </div>
            </div>

            {/* Content Input Card */}
            <div className="glass backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-cyan-400 flex items-center">
                <FiBook className="mr-2" />
                Study Material
              </h3>
              
              {/* Tabs */}
              <div className="flex space-x-2 mb-4">
                {["upload", "text", "camera"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab
                        ? "bg-cyan-600 text-white shadow-lg"
                        : "bg-gray-700/50 text-gray-300 hover:bg-gray-700/70"
                    }`}
                  >
                    {tab === "upload" && <FiUpload className="inline mr-1" />}
                    {tab === "text" && <FiMessageSquare className="inline mr-1" />}
                    {tab === "camera" && <FiVideo className="inline mr-1" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {activeTab === "upload" && (
                  <div className="space-y-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-400 transition-colors"
                    >
                      <FiUpload className="text-3xl text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-300">Click to upload PDF or Image</p>
                      <p className="text-sm text-gray-500 mt-1">Supports OCR and PDF text extraction</p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,image/*"
                      className="hidden"
                    />
                  </div>
                )}

                {activeTab === "text" && (
                  <div className="space-y-3">
                    <textarea
                      ref={textAreaRef}
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="Enter your study topic, paste text, or ask questions..."
                      className="w-full h-32 bg-gray-700/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 resize-none"
                    />
                    <button
                      onClick={handleTextSubmit}
                      className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl font-medium transition-colors flex items-center justify-center"
                    >
                      <FiMessageSquare className="mr-2" />
                      Set Study Topic
                    </button>
                  </div>
                )}

                {activeTab === "camera" && (
                  <div className="space-y-3">
                    <div className="bg-gray-700/30 rounded-xl p-4 text-center">
                      <FiVideo className="text-2xl text-cyan-400 mx-auto mb-2" />
                      <p className="text-gray-300">Live camera feed for real-time analysis</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Processing Status */}
              {isProcessingContent && (
                <div className="mt-4 p-3 bg-blue-500/20 rounded-lg flex items-center">
                  <FiLoader className="animate-spin mr-2" />
                  <span>Processing content using {activeTab === "upload" ? "OCR/PDF extraction" : "AI analysis"}...</span>
                </div>
              )}

              {/* Content Preview */}
              {(contentText || userPrompt) && (
                <div className="mt-4 p-3 bg-green-500/20 rounded-lg">
                  <p className="text-sm text-green-300">
                    {contentText ? "Content loaded successfully!" : "Custom topic set!"}
                  </p>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStudyBuddy;