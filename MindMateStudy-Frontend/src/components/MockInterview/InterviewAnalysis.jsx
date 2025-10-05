import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosConfig';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  BarElement,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { 
  FiCalendar, 
  FiClock, 
  FiTrendingUp, 
  FiBarChart2, 
  FiSmile, 
  FiUser, 
  FiAward,
  FiDownload,
  FiEye,
  FiStar,
  FiActivity,
  FiTarget
} from 'react-icons/fi';
import { FaRobot, FaBrain, FaRegLaughBeam, FaRegMeh, FaRegFrown } from 'react-icons/fa';

ChartJS.register(
  LineElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  Tooltip, 
  Legend, 
  Filler,
  BarElement,
  RadialLinearScale
);

const ExpressionIcon = ({ expression }) => {
  const expressions = {
    'happy': { icon: FaRegLaughBeam, color: 'text-green-400' },
    'neutral': { icon: FaRegMeh, color: 'text-yellow-400' },
    'sad': { icon: FaRegFrown, color: 'text-red-400' },
    'angry': { icon: FaRegFrown, color: 'text-red-500' },
    'surprised': { icon: FiUser, color: 'text-purple-400' }
  };
  
  const ExpressionComponent = expressions[expression?.toLowerCase()]?.icon || FaRegMeh;
  const color = expressions[expression?.toLowerCase()]?.color || 'text-yellow-400';
  
  return <ExpressionComponent className={`text-lg ${color}`} />;
};

const ConfidenceMeter = ({ confidence }) => (
  <div className="relative">
    <div className="w-full bg-gray-700/30 rounded-full h-3">
      <div 
        className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-1000 ease-out"
        style={{ width: `${confidence}%` }}
      />
    </div>
    <div className="absolute -top-6 right-0 text-xs font-bold text-cyan-400">
      {confidence}%
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl shadow-2xl border border-gray-700/30 p-6 animate-pulse backdrop-blur-lg">
    <div className="flex items-center justify-between mb-4">
      <div className="h-6 bg-gray-700 rounded-full w-32" />
      <div className="h-8 bg-gray-700 rounded-full w-8" />
    </div>
    <div className="h-4 bg-gray-700 rounded w-3/4 mb-6" />
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-3 bg-gray-700 rounded w-1/3" />
          <div className="h-3 bg-gray-700 rounded w-1/4" />
        </div>
      ))}
    </div>
    <div className="mt-6 pt-4 border-t border-gray-700/30">
      <div className="h-2 bg-gray-700 rounded-full w-full mb-2" />
      <div className="h-2 bg-gray-700 rounded-full w-2/3" />
    </div>
  </div>
);

const MetricCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-4 border border-gray-700/30 shadow-2xl backdrop-blur-lg">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
        <Icon className="text-white text-lg" />
      </div>
      {trend && (
        <div className={`text-xs font-bold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </div>
);

const InterviewReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeView, setActiveView] = useState('grid'); // grid, detailed

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axiosInstance.get('/interview-reports/get');
        if (response.data) {
          setReports(response.data);
          if (response.data.length > 0) {
            setSelectedReport(response.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Enhanced chart data
  const performanceChartData = {
    labels: reports.map((_, i) => `Session ${i + 1}`),
    datasets: [
      {
        label: 'Confidence Score',
        data: reports.map(r => Number(r.confidence || 0)),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Response Time (sec)',
        data: reports.map(r => Number(r.averageResponseTime || 0)),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ],
  };

  const radarData = selectedReport ? {
    labels: ['Confidence', 'Response Speed', 'Engagement', 'Clarity', 'Professionalism'],
    datasets: [
      {
        label: 'Performance Metrics',
        data: [
          Number(selectedReport.confidence || 0),
          100 - Math.min(Number(selectedReport.averageResponseTime || 0) * 10, 100),
          80, // Placeholder for engagement
          75, // Placeholder for clarity
          85  // Placeholder for professionalism
        ],
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: '#8b5cf6',
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#8b5cf6',
      }
    ]
  } : { labels: [], datasets: [] };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#d1d5db',
          font: { size: 12 },
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#60a5fa',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 12,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(55, 65, 81, 0.3)' },
        ticks: { color: '#9ca3af' }
      },
      x: {
        grid: { color: 'rgba(55, 65, 81, 0.3)' },
        ticks: { color: '#9ca3af' }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(55, 65, 81, 0.3)' },
        grid: { color: 'rgba(55, 65, 81, 0.3)' },
        pointLabels: { color: '#d1d5db' },
        ticks: { 
          backdropColor: 'transparent',
          color: '#9ca3af'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#d1d5db',
          font: { size: 12 }
        }
      }
    }
  };

  const exportReport = (report) => {
    const reportData = {
      title: `AI StudyBuddy Report - ${new Date(report.createdAt).toLocaleDateString()}`,
      ...report
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studybuddy-report-${new Date(report.createdAt).toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <FaRobot className="text-6xl text-cyan-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-2">No Reports Yet</h2>
          <p className="text-gray-400">Complete your first AI StudyBuddy session to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900/50 to-gray-900/80"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-3">
            AI StudyBuddy Analytics
          </h1>
          <p className="text-gray-300 text-lg">Track your learning progress and performance metrics</p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-1 border border-gray-700/30">
            <button
              onClick={() => setActiveView('grid')}
              className={`px-6 py-2 rounded-xl transition-all ${
                activeView === 'grid' 
                  ? 'bg-cyan-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setActiveView('detailed')}
              className={`px-6 py-2 rounded-xl transition-all ${
                activeView === 'detailed' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Detailed View
            </button>
          </div>
        </div>

        {activeView === 'detailed' && selectedReport ? (
          /* Detailed View */
          <div className="space-y-6">
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MetricCard 
                icon={FiClock} 
                label="Duration" 
                value={`${selectedReport.duration || '0'}m`} 
                color="from-cyan-500 to-blue-500"
              />
              <MetricCard 
                icon={FiBarChart2} 
                label="Questions" 
                value={selectedReport.questionsAsked || '0'} 
                color="from-green-500 to-emerald-500"
              />
              <MetricCard 
                icon={FiTrendingUp} 
                label="Avg Response" 
                value={`${Number(selectedReport.averageResponseTime || 0).toFixed(1)}s`} 
                color="from-purple-500 to-pink-500"
              />
              <MetricCard 
                icon={FiAward} 
                label="Confidence" 
                value={`${selectedReport.confidence || '0'}%`} 
                color="from-orange-500 to-red-500"
              />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-6 border border-gray-700/30 shadow-2xl backdrop-blur-lg">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <FiActivity className="mr-2 text-cyan-400" />
                  Performance Trend
                </h3>
                <div className="h-80">
                  <Line data={performanceChartData} options={chartOptions} />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-6 border border-gray-700/30 shadow-2xl backdrop-blur-lg">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <FiTarget className="mr-2 text-purple-400" />
                  Skills Radar
                </h3>
                <div className="h-80">
                  <Radar data={radarData} options={radarOptions} />
                </div>
              </div>
            </div>

            {/* Report Details */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-6 border border-gray-700/30 shadow-2xl backdrop-blur-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Session Details</h3>
                <button 
                  onClick={() => exportReport(selectedReport)}
                  className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl transition-colors"
                >
                  <FiDownload className="mr-2" />
                  Export
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-300 mb-3">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Dominant Expression</span>
                      <div className="flex items-center">
                        <ExpressionIcon expression={selectedReport.expression} />
                        <span className="ml-2 text-white capitalize">{selectedReport.expression || 'Neutral'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Speech Clarity</span>
                      <span className="text-green-400 font-semibold">Good</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Engagement Level</span>
                      <span className="text-yellow-400 font-semibold">High</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-300 mb-3">AI Analysis</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Confidence Score</span>
                        <span className="text-cyan-400 font-semibold">{selectedReport.confidence || '0'}%</span>
                      </div>
                      <ConfidenceMeter confidence={selectedReport.confidence || 0} />
                    </div>
                    <div className="text-sm text-gray-400 mt-4">
                      <FiCalendar className="inline mr-2" />
                      Completed on {new Date(selectedReport.createdAt).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Grid View */
          <>
            {/* Overview Chart */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-6 mb-8 border border-gray-700/30 shadow-2xl backdrop-blur-lg">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <FiTrendingUp className="mr-2 text-cyan-400" />
                Learning Progress Overview
              </h3>
              <div className="h-80">
                <Line data={performanceChartData} options={chartOptions} />
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedReport(report)}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl shadow-2xl border border-gray-700/30 p-6 transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/10 cursor-pointer backdrop-blur-lg group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <FaBrain className="text-white text-lg" />
                      </div>
                      <div className="ml-3">
                        <h2 className="text-lg font-bold text-white">Session #{index + 1}</h2>
                        <div className="text-xs text-gray-400 flex items-center">
                          <FiCalendar className="mr-1" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        exportReport(report);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-700/50 rounded-lg"
                    >
                      <FiDownload className="text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center">
                        <FiClock className="mr-2" /> Duration
                      </span>
                      <span className="text-white font-semibold">{report.duration || '0'}m</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center">
                        <FiBarChart2 className="mr-2" /> Questions
                      </span>
                      <span className="text-white font-semibold">{report.questionsAsked || '0'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center">
                        <FiActivity className="mr-2" /> Avg Response
                      </span>
                      <span className="text-white font-semibold">
                        {report.averageResponseTime ? Number(report.averageResponseTime).toFixed(1) : '0'}s
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Confidence Level</span>
                      <span className="text-cyan-400 font-bold">{report.confidence || '0'}%</span>
                    </div>
                    <ConfidenceMeter confidence={report.confidence || 0} />
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center text-gray-400">
                        <ExpressionIcon expression={report.expression} />
                        <span className="ml-2 text-sm capitalize">{report.expression || 'Neutral'}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                          setActiveView('detailed');
                        }}
                        className="flex items-center text-cyan-400 hover:text-cyan-300 text-sm"
                      >
                        <FiEye className="mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewReports;