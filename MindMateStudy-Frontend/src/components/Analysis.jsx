import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaRobot, 
  FaChartLine, 
  FaBrain, 
  FaSmile, 
  FaSadTear, 
  FaMeh,
  FaLightbulb,
  FaCalendarAlt,
  FaUser,
  FaHeartbeat
} from "react-icons/fa";
import { 
  FiBarChart2, 
  FiTrendingUp, 
  FiClock, 
  FiUsers,
  FiActivity,
  FiAward,
  FiMessageSquare
} from "react-icons/fi";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import moment from "moment";
import { Link } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";

function Analysis() {
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, detailed, trends
  const [selectedReport, setSelectedReport] = useState(null);

  async function getAnalysis() {
    try {
      const response = await axiosInstance.get("/chat/reports");
      setAnalysis(response.data.reports);
    } catch (error) {
      console.error("Error fetching analysis data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAnalysis();
  }, []);

  const emotionIcons = {
    sad: { icon: FaSadTear, color: "#3B82F6", bg: "from-blue-500 to-blue-600" },
    happy: { icon: FaSmile, color: "#10B981", bg: "from-green-500 to-green-600" },
    neutral: { icon: FaMeh, color: "#6B7280", bg: "from-gray-500 to-gray-600" },
    angry: { icon: FaSadTear, color: "#EF4444", bg: "from-red-500 to-red-600" },
    disgust: { icon: FaSadTear, color: "#8B5CF6", bg: "from-purple-500 to-purple-600" },
    fear: { icon: FaSadTear, color: "#F59E0B", bg: "from-yellow-500 to-yellow-600" },
  };

  const emotionColors = {
    sad: "#3B82F6",
    happy: "#10B981",
    neutral: "#6B7280",
    angry: "#EF4444",
    disgust: "#8B5CF6",
    fear: "#F59E0B"
  };

  // Process data for charts
  const chartData = analysis.reduce((acc, item) => {
    const date = moment(item.createdAt).format("MMM Do");
    const existing = acc.find((d) => d.date === date);
    if (existing) {
      existing.messages += item.totalMessages;
      existing.engagement = (existing.engagement + item.userEngagementScore) / 2;
    } else {
      acc.push({
        date,
        messages: item.totalMessages || 0,
        engagement: item.userEngagementScore || 0,
        sentiment: item.sentimentTrend?.split(' ')[0] || 'neutral'
      });
    }
    return acc;
  }, []);

  const sentimentData = analysis.flatMap(item => 
    item.dominantEmotions.map(emotion => ({
      name: emotion,
      value: 1,
      fill: emotionColors[emotion] || '#6B7280'
    }))
  );

  const radarData = [
    { subject: 'Engagement', A: analysis[0]?.userEngagementScore || 0, fullMark: 10 },
    { subject: 'Positivity', A: analysis[0]?.dominantEmotions.includes('happy') ? 8 : 4, fullMark: 10 },
    { subject: 'Activity', A: analysis[0]?.totalMessages ? Math.min(analysis[0].totalMessages / 5, 10) : 0, fullMark: 10 },
    { subject: 'Consistency', A: 7, fullMark: 10 },
    { subject: 'Depth', A: analysis[0]?.userMessages > 10 ? 8 : 5, fullMark: 10 },
  ];

  const SkeletonCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-6 border border-gray-700/30 shadow-2xl backdrop-blur-lg"
    >
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        <div className="h-4 bg-gray-700 rounded w-1/3"></div>
        <div className="h-20 bg-gray-700 rounded"></div>
      </div>
    </motion.div>
  );

  const MetricCard = ({ icon: Icon, label, value, color, trend }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 border border-gray-700/30 shadow-xl backdrop-blur-lg"
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
          <Icon className="text-white text-xl" />
        </div>
        {trend && (
          <div className={`text-sm font-bold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-gray-400 text-sm">{label}</div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900/50 to-gray-900/80"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <FaBrain className="text-4xl text-cyan-400 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Mental Wellness Analytics
            </h1>
          </div>
          <p className="text-gray-300 text-lg">AI-powered insights into your emotional patterns and well-being</p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-1 border border-gray-700/30">
            {["overview", "detailed", "trends"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === "overview" && <FiBarChart2 className="inline mr-2" />}
                {tab === "detailed" && <FaChartLine className="inline mr-2" />}
                {tab === "trends" && <FiTrendingUp className="inline mr-2" />}
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : analysis.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-96 text-center"
          >
            <FaRobot className="text-6xl text-cyan-400 mb-4 opacity-50" />
            <p className="text-gray-400 text-lg mb-4">No analysis data available yet.</p>
            <Link 
              to="/chat" 
              className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 rounded-xl text-white font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all"
            >
              Start a Conversation
            </Link>
          </motion.div>
        ) : (
          <>
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard 
                    icon={FiMessageSquare}
                    label="Total Messages"
                    value={analysis.reduce((sum, item) => sum + (item.totalMessages || 0), 0)}
                    color="from-cyan-500 to-blue-500"
                  />
                  <MetricCard 
                    icon={FiActivity}
                    label="Avg Engagement"
                    value={(analysis.reduce((sum, item) => sum + (item.userEngagementScore || 0), 0) / analysis.length).toFixed(1)}
                    color="from-green-500 to-emerald-500"
                  />
                  <MetricCard 
                    icon={FaHeartbeat}
                    label="Positive Sessions"
                    value={analysis.filter(item => item.dominantEmotions?.includes('happy')).length}
                    color="from-purple-500 to-pink-500"
                  />
                  <MetricCard 
                    icon={FaCalendarAlt}
                    label="Analysis Period"
                    value={`${analysis.length} days`}
                    color="from-orange-500 to-red-500"
                  />
                </div>

                {/* Main Chart */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-6 border border-gray-700/30 shadow-2xl backdrop-blur-lg">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <FiTrendingUp className="mr-2 text-cyan-400" />
                    Engagement Overview
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                          border: '1px solid rgba(55, 65, 81, 0.5)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="messages" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="engagement" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {activeTab === "detailed" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {analysis.map((item, index) => (
                  <motion.div
                    key={item._id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-6 border border-gray-700/30 shadow-2xl backdrop-blur-lg"
                  >
                    {/* Emotion Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl bg-gradient-to-r ${
                          emotionIcons[item.dominantEmotions[0]]?.bg || 'from-gray-500 to-gray-600'
                        }`}>
                          {item.dominantEmotions[0] && React.createElement(
                            emotionIcons[item.dominantEmotions[0]]?.icon || FaMeh,
                            { className: "text-white text-lg" }
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Session Analysis</h3>
                          <p className="text-gray-400 text-sm">{moment(item.createdAt).format('MMM Do, YYYY')}</p>
                        </div>
                      </div>
                      <div className="text-3xl">
                        {item.dominantEmotions.map(emotion => 
                          emotionIcons[emotion] ? React.createElement(emotionIcons[emotion].icon) : "😐"
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-cyan-400 font-semibold mb-2">Conversation Summary</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{item.conversationSummary}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-700/30 rounded-xl p-3">
                          <div className="text-2xl font-bold text-white">{item.totalMessages || 0}</div>
                          <div className="text-gray-400 text-sm">Total Messages</div>
                        </div>
                        <div className="bg-gray-700/30 rounded-xl p-3">
                          <div className="text-2xl font-bold text-white">{item.userEngagementScore || 0}/10</div>
                          <div className="text-gray-400 text-sm">Engagement</div>
                        </div>
                      </div>

                      <div className="bg-gray-700/30 rounded-xl p-3">
                        <h4 className="text-green-400 font-semibold mb-2">AI Suggestions</h4>
                        <p className="text-gray-300 text-sm">{item.solution || "Keep up the positive engagement!"}</p>
                      </div>

                      {/* Engagement Meter */}
                      <div>
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Engagement Level</span>
                          <span>{item.userEngagementScore || 0}/10</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-600">
                          <div
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              item.userEngagementScore <= 3
                                ? "bg-red-500"
                                : item.userEngagementScore <= 7
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${(item.userEngagementScore || 0) * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "trends" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid lg:grid-cols-2 gap-6"
              >
                {/* Sentiment Distribution */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-6 border border-gray-700/30 shadow-2xl backdrop-blur-lg">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <FaSmile className="mr-2 text-green-400" />
                    Emotion Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Wellness Radar */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-6 border border-gray-700/30 shadow-2xl backdrop-blur-lg">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <FiAward className="mr-2 text-purple-400" />
                    Wellness Metrics
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#9CA3AF" />
                      <Radar
                        name="Wellness"
                        dataKey="A"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Analysis;