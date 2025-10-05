import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import {
  BarChart3,
  Calendar,
  FileText,
  Trophy,
  Users,
  TrendingUp,
  Brain,
  Target,
  Zap,
  Star,
  Clock,
  Activity,
  Smile,
  Frown,
  Meh,
  ArrowUpRight,
  Eye,
  Download,
  Filter,
} from "lucide-react";
import Header from "./Header";
import Loader from "../../components/common/Loader";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from "chart.js";
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";
import AppointmentsWidget from "../../components/AppointmentWidget";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    analytics: {},
    performance: [],
    moodData: [],
    skillAnalysis: [],
    appointments: [],
    insights: [],
  });

  // Advanced mock data with more metrics
  const mockData = {
    stats: {
      totalEvents: 47,
      interviews: 23,
      quizzes: 34,
      therapySessions: 12,
      productivityScore: 87,
      consistency: 92,
    },
    analytics: {
      avgSessionTime: "45min",
      completionRate: 94,
      improvementRate: 18,
      stressLevel: 32,
    },
    performance: [
      { week: "W1", technical: 65, behavioral: 58, cognitive: 72 },
      { week: "W2", technical: 72, behavioral: 64, cognitive: 68 },
      { week: "W3", technical: 78, behavioral: 71, cognitive: 75 },
      { week: "W4", technical: 85, behavioral: 79, cognitive: 82 },
      { week: "W5", technical: 82, behavioral: 76, cognitive: 88 },
    ],
    moodData: [
      { day: "Mon", mood: 75, energy: 80, focus: 70 },
      { day: "Tue", mood: 82, energy: 75, focus: 78 },
      { day: "Wed", mood: 68, energy: 70, focus: 65 },
      { day: "Thu", mood: 90, energy: 85, focus: 88 },
      { day: "Fri", mood: 78, energy: 78, focus: 72 },
      { day: "Sat", mood: 85, energy: 90, focus: 80 },
      { day: "Sun", mood: 80, energy: 88, focus: 85 },
    ],
    skillAnalysis: [
      { skill: "Technical", score: 85, target: 90 },
      { skill: "Communication", score: 78, target: 85 },
      { skill: "Problem Solving", score: 92, target: 95 },
      { skill: "Leadership", score: 68, target: 80 },
      { skill: "Adaptability", score: 81, target: 85 },
    ],
    appointments: [
      {
        therapist: "Dr. Sarah Smith",
        date: "2024-01-15",
        time: "14:30",
        type: "Cognitive Therapy",
        status: "upcoming",
      },
      {
        therapist: "Dr. Mike Johnson",
        date: "2024-01-17",
        time: "10:00",
        type: "Behavioral Session",
        status: "upcoming",
      },
    ],
    insights: [
      {
        title: "Performance Peak",
        description: "Thursdays show 25% higher productivity",
        impact: "high",
        trend: "up",
      },
      {
        title: "Stress Management",
        description: "Stress levels decreased by 18% this month",
        impact: "medium",
        trend: "down",
      },
    ],
  };

  // Chart configurations
  const performanceChart = {
    labels: mockData.performance.map((p) => p.week),
    datasets: [
      {
        label: "Technical Skills",
        data: mockData.performance.map((p) => p.technical),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Behavioral",
        data: mockData.performance.map((p) => p.behavioral),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Cognitive",
        data: mockData.performance.map((p) => p.cognitive),
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const moodChart = {
    labels: mockData.moodData.map((m) => m.day),
    datasets: [
      {
        label: "Mood Level",
        data: mockData.moodData.map((m) => m.mood),
        borderColor: "rgb(236, 72, 153)",
        backgroundColor: "rgba(236, 72, 153, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Energy Level",
        data: mockData.moodData.map((m) => m.energy),
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const skillRadarData = {
    labels: mockData.skillAnalysis.map((s) => s.skill),
    datasets: [
      {
        label: "Current Score",
        data: mockData.skillAnalysis.map((s) => s.score),
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgb(59, 130, 246)",
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(59, 130, 246)",
      },
      {
        label: "Target Score",
        data: mockData.skillAnalysis.map((s) => s.target),
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        borderColor: "rgb(34, 197, 94)",
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(34, 197, 94)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#9CA3AF",
          font: {
            size: 11,
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(75, 85, 99, 0.3)",
        },
        ticks: {
          color: "#9CA3AF",
        },
      },
      y: {
        grid: {
          color: "rgba(75, 85, 99, 0.3)",
        },
        ticks: {
          color: "#9CA3AF",
        },
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: "rgba(75, 85, 99, 0.3)",
        },
        grid: {
          color: "rgba(75, 85, 99, 0.3)",
        },
        pointLabels: {
          color: "#9CA3AF",
        },
        ticks: {
          color: "#9CA3AF",
          backdropColor: "transparent",
        },
      },
    },
  };

  useEffect(() => {
    setTimeout(() => {
      setDashboardData(mockData);
      setLoading(false);
    }, 1500);
  }, []);

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    chartData,
  }) => (
    <div className="group glass rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover-lift">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              change > 0
                ? "bg-green-400/20 text-green-400"
                : "bg-red-400/20 text-red-400"
            }`}
          >
            <TrendingUp
              className={`w-3 h-3 ${change < 0 ? "rotate-180" : ""}`}
            />
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mb-2">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
      {chartData && (
        <div className="h-[60px] mt-3">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { x: { display: false }, y: { display: false } },
            }}
          />
        </div>
      )}
    </div>
  );

  const AnalyticsCard = ({ title, children, action }) => (
    <div className="glass rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {action && (
          <button className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors text-sm">
            {action.icon && <action.icon className="w-4 h-4" />}
            {action.label}
          </button>
        )}
      </div>
      {children}
    </div>
  );

  const InsightBadge = ({ insight }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600">
      <div
        className={`p-2 rounded-full ${
          insight.trend === "up"
            ? "bg-green-400/20 text-green-400"
            : "bg-blue-400/20 text-blue-400"
        }`}
      >
        <Eye className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{insight.title}</p>
        <p className="text-xs text-gray-400">{insight.description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:px-15 px-4">
      <Header />

      <div className="p-6 space-y-6">
        {/* Time Range Filter */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
             Dashboard
            </h1>
            <p className="text-gray-400">
              Comprehensive overview of your performance metrics
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Productivity Score"
            value={`${dashboardData.stats.productivityScore}/100`}
            change={12}
            icon={Activity}
            color="text-blue-400"
          />
          <MetricCard
            title="Consistency"
            value={`${dashboardData.stats.consistency}%`}
            change={8}
            icon={TrendingUp}
            color="text-green-400"
          />
          <MetricCard
            title="Therapy Sessions"
            value={dashboardData.stats.therapySessions}
            change={6}
            icon={Brain}
            color="text-purple-400"
          />
          <MetricCard
            title="Avg Session Time"
            value={dashboardData.analytics.avgSessionTime}
            change={15}
            icon={Clock}
            color="text-orange-400"
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trend */}
          <AnalyticsCard
            title="Performance Trend"
            action={{ label: "Export", icon: Download }}
          >
            <div className="h-80">
              <Line data={performanceChart} options={chartOptions} />
            </div>
          </AnalyticsCard>

          {/* Mood & Energy Analysis */}
          <AnalyticsCard
            title="Mood & Energy Analysis"
            action={{ label: "Filter", icon: Filter }}
          >
            <div className="h-80">
              <Line data={moodChart} options={chartOptions} />
            </div>
          </AnalyticsCard>
        </div>

        {/* Skills and Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skills Radar */}
          {/* <AnalyticsCard title="My Appointments">
            <div className="h-64">
              <AppointmentsWidget/>
            </div>
          </AnalyticsCard> */}
          <AnalyticsCard title="Skills Assessment">
            <div className="h-64">
              <Radar data={skillRadarData} options={radarOptions} />
            </div>
          </AnalyticsCard>

          {/* Key Insights */}
          <AnalyticsCard title="Key Insights" className="lg:col-span-2">
            <div className="space-y-3">
              {dashboardData.insights.map((insight, index) => (
                <InsightBadge key={index} insight={insight} />
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-gray-700/30">
                <p className="text-2xl font-bold text-green-400">
                  {dashboardData.analytics.improvementRate}%
                </p>
                <p className="text-sm text-gray-400">Improvement Rate</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-700/30">
                <p className="text-2xl font-bold text-blue-400">
                  {dashboardData.analytics.completionRate}%
                </p>
                <p className="text-sm text-gray-400">Completion Rate</p>
              </div>
            </div>
          </AnalyticsCard>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
