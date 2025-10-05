import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaExpand,
  FaTimes,
  FaMicrophone,
  FaMicrophoneSlash,
  FaRobot,
  FaHeadphones,
  FaFileAlt,
  FaDownload,
  FaShare,
  FaRegClock,
  FaRegCalendar,
} from "react-icons/fa";
import { FiPlay, FiPause, FiSquare, FiUpload } from "react-icons/fi";
import axiosInstance from "../config/axiosConfig";

function NotesBuddy() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioChunks, setAudioChunks] = useState([]);
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("idle"); // idle, recording, paused, processing
  const [activeTab, setActiveTab] = useState("saved"); // saved, record

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchNotes = async () => {
      try {
        const response = await axiosInstance.get("/chat/notes");
        setNotes(response.data.notes || []);
      } catch (err) {
        console.error("Error fetching notes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      setRecordingStatus("recording");
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setAudioChunks([]);
      setTranscribedText("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Setup audio visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        setAudioChunks(chunks);
        processRecording(audioBlob);
      };

      mediaRecorder.start(1000); // Collect data every second
      setAudioChunks(chunks);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      setRecordingStatus("idle");
      setIsRecording(false);
    }
  };

  // Pause/resume recording
  const togglePause = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setRecordingStatus("paused");
      clearInterval(timerRef.current);
    } else if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setRecordingStatus("recording");
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
      setRecordingStatus("processing");
      clearInterval(timerRef.current);
    }
  };

  // Process recording and send to backend
  const processRecording = async (audioBlob) => {
    try {
      setIsTranscribing(true);

      const formData = new FormData();
      formData.append("audio", audioBlob, "lecture-recording.webm");
      formData.append("duration", recordingTime.toString());

      const response = await axiosInstance.post(
        "/lecture/transcribe",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.transcript) {
        setTranscribedText(response.data.transcript);

        // Automatically summarize the transcript
        const summaryResponse = await axiosInstance.post("/lecture/summarize", {
          transcript: response.data.transcript,
          duration: recordingTime,
        });

        if (summaryResponse.data.summary) {
          // Save the summarized note
          const saveResponse = await axiosInstance.post("/chat/save-note", {
            title: `Lecture Recording - ${new Date().toLocaleDateString()}`,
            summary: summaryResponse.data.summary,
            type: "lecture",
            duration: recordingTime,
          });

          if (saveResponse.data.note) {
            setNotes((prev) => [saveResponse.data.note, ...prev]);
          }
        }
      }
    } catch (error) {
      console.error("Error processing recording:", error);
    } finally {
      setIsTranscribing(false);
      setRecordingStatus("idle");
    }
  };

  // Upload existing audio file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setRecordingStatus("processing");
      setIsTranscribing(true);

      const formData = new FormData();
      formData.append("audio", file);

      const response = await axiosInstance.post(
        "/lecture/transcribe",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.transcript) {
        setTranscribedText(response.data.transcript);

        const summaryResponse = await axiosInstance.post("/lecture/summarize", {
          transcript: response.data.transcript,
        });

        if (summaryResponse.data.summary) {
          const saveResponse = await axiosInstance.post("/chat/save-note", {
            title: `Uploaded Lecture - ${file.name}`,
            summary: summaryResponse.data.summary,
            type: "lecture",
            duration: 0,
          });

          if (saveResponse.data.note) {
            setNotes((prev) => [saveResponse.data.note, ...prev]);
          }
        }
      }
    } catch (error) {
      console.error("Error processing uploaded file:", error);
    } finally {
      setIsTranscribing(false);
      setRecordingStatus("idle");
    }
  };

  const exportNote = (note) => {
    const element = document.createElement("a");
    const file = new Blob([`# ${note.title}\n\n${note.summary}`], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen ">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900/50 to-gray-900/80"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaRobot className="text-4xl text-cyan-400 mr-3" />
            <h1 className="text-4xl md:text-5xl font-technical font-bold leading-18 bg-clip-text text-stone-200">
              <span className="bg-gradient-to-r from-cyan-400 to-gradient-secondary bg-clip-text text-transparent">
                Notes
              </span>{" "}
              Buddy
            </h1>
          </div>
          <p className="text-gray-200 text-lg">
            AI-powered lecture recording and smart summarization
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-1 border border-gray-700/30">
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-6 py-2 rounded-xl transition-all ${
                activeTab === "saved"
                  ? "bg-cyan-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FaFileAlt className="inline mr-2" />
              Saved Notes
            </button>
            <button
              onClick={() => setActiveTab("record")}
              className={`px-6 py-2 rounded-xl transition-all ${
                activeTab === "record"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FaMicrophone className="inline mr-2" />
              Record Lecture
            </button>
          </div>
        </div>

        {activeTab === "saved" ? (
          /* Saved Notes View */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Your Summarized Notes
              </h2>
              <Link
                to="/summarizer"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-2 rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg"
              >
                Summarize Text
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6)
                  .fill()
                  .map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse h-48 bg-gray-800/50 rounded-2xl shadow p-6 space-y-4"
                    >
                      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    </div>
                  ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">
                <FaFileAlt className="text-6xl mx-auto mb-4 opacity-50" />
                <p className="text-xl mb-4">No notes available yet.</p>
                <Link
                  to="/summarizer"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all"
                >
                  Create Your First Note
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note, index) => (
                  <motion.div
                    key={index}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl shadow-2xl border border-gray-700/30 p-6 hover:shadow-cyan-500/10 transition-all cursor-pointer backdrop-blur-lg group"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-lg font-semibold text-white line-clamp-2">
                        {note.title}
                      </h2>
                      <FaExpand className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex items-center text-gray-400 text-sm mb-3">
                      <FaRegCalendar className="mr-1" />
                      {new Date(
                        note.createdAt || Date.now()
                      ).toLocaleDateString()}
                      {note.duration && (
                        <>
                          <FaRegClock className="ml-3 mr-1" />
                          {formatTime(note.duration)}
                        </>
                      )}
                    </div>

                    <p className="text-gray-300 line-clamp-4 text-sm leading-relaxed">
                      {note.summary}
                    </p>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700/30">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          note.type === "lecture"
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-cyan-500/20 text-cyan-300"
                        }`}
                      >
                        {note.type || "text"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportNote(note);
                        }}
                        className="text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Lecture Recording View */
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl shadow-2xl border border-gray-700/30 p-8 backdrop-blur-lg">
              <h2 className="text-2xl font-bold text-white text-center mb-6 flex items-center justify-center">
                <FaHeadphones className="mr-3 text-purple-400" />
                Lecture Recording Studio
              </h2>

              {/* Recording Visualization */}
              <div className="mb-8">
                <div className="h-32 bg-gray-800/30 rounded-2xl p-4 flex items-end justify-center">
                  {isRecording && (
                    <div className="flex space-x-1 items-end h-20">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 bg-gradient-to-t from-cyan-400 to-purple-500 rounded-t"
                          animate={{
                            height: `${20 + Math.random() * 60}%`,
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: i * 0.05,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {!isRecording && (
                    <div className="text-gray-400 text-center">
                      <FaMicrophone className="text-4xl mx-auto mb-2 opacity-50" />
                      <p>Ready to record your lecture</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recording Controls */}
              <div className="text-center mb-6">
                <div className="text-3xl font-mono font-bold text-cyan-400 mb-4">
                  {formatTime(recordingTime)}
                </div>

                <div className="flex justify-center space-x-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-full shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all"
                    >
                      <FaMicrophone className="text-2xl" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={togglePause}
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white p-4 rounded-full shadow-lg hover:from-yellow-600 hover:to-amber-600 transition-all"
                      >
                        {isPaused ? (
                          <FiPlay className="text-2xl" />
                        ) : (
                          <FiPause className="text-2xl" />
                        )}
                      </button>
                      <button
                        onClick={stopRecording}
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:from-red-600 hover:to-pink-600 transition-all"
                      >
                        <FiSquare className="text-2xl" />
                      </button>
                    </>
                  )}
                </div>

                {/* Upload Option */}
                <div className="mt-6">
                  <label className="flex items-center justify-center space-x-2 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 px-4 py-2 rounded-xl cursor-pointer transition-colors">
                    <FiUpload />
                    <span>Upload Audio File</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Status Display */}
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    recordingStatus === "idle"
                      ? "bg-gray-700/50 text-gray-400"
                      : recordingStatus === "recording"
                      ? "bg-red-500/20 text-red-400"
                      : recordingStatus === "paused"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      recordingStatus === "idle"
                        ? "bg-gray-400"
                        : recordingStatus === "recording"
                        ? "bg-red-400 animate-pulse"
                        : recordingStatus === "paused"
                        ? "bg-yellow-400"
                        : "bg-blue-400"
                    }`}
                  ></div>
                  {recordingStatus === "idle" && "Ready to record"}
                  {recordingStatus === "recording" && "Recording..."}
                  {recordingStatus === "paused" && "Paused"}
                  {recordingStatus === "processing" && "Processing..."}
                </div>
              </div>

              {/* Transcription Preview */}
              {transcribedText && (
                <div className="mt-6 p-4 bg-gray-800/30 rounded-xl">
                  <h3 className="text-white font-semibold mb-2">
                    Transcription Preview
                  </h3>
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {transcribedText}
                  </p>
                </div>
              )}

              {/* Processing Indicator */}
              {isTranscribing && (
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center text-cyan-400">
                    <FaRobot className="animate-bounce mr-2" />
                    <span>AI is summarizing your lecture...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Note Detail Modal */}
        <AnimatePresence>
          {selectedNote && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative bg-gradient-to-br from-gray-800 to-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-700/50"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <button
                  onClick={() => setSelectedNote(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-400 transition z-10"
                >
                  <FaTimes className="text-2xl" />
                </button>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {selectedNote.title}
                    </h2>
                    <button
                      onClick={() => exportNote(selectedNote)}
                      className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-xl transition-colors"
                    >
                      <FaDownload />
                      <span>Export</span>
                    </button>
                  </div>

                  <div className="flex items-center text-gray-400 text-sm mb-6">
                    <FaRegCalendar className="mr-2" />
                    Created on{" "}
                    {new Date(
                      selectedNote.createdAt || Date.now()
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {selectedNote.duration && (
                      <>
                        <FaRegClock className="ml-4 mr-2" />
                        Duration: {formatTime(selectedNote.duration)}
                      </>
                    )}
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed text-lg font-sans">
                      {selectedNote.summary}
                    </pre>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default NotesBuddy;
