import ChatAnalysis from "../models/analysis.js";
import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import { InterviewReport } from "../models/interviewReport.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get all data for the last week
    const [chatAnalyses, appointments, interviewReports, user] = await Promise.all([
      ChatAnalysis.find({ userId, createdAt: { $gte: oneWeekAgo } }),
      Appointment.find({ userId, createdAt: { $gte: oneWeekAgo } }),
      InterviewReport.find({ user: userId, createdAt: { $gte: oneWeekAgo } }),
      User.findById(userId)
    ]);

    // Calculate metrics
    const dashboardData = {
      stats: calculateStats(appointments, interviewReports, chatAnalyses),
      analytics: calculateAnalytics(appointments, interviewReports, chatAnalyses),
      performance: calculatePerformanceTrend(interviewReports),
      moodData: calculateMoodData(chatAnalyses),
      skillAnalysis: calculateSkillAnalysis(interviewReports),
      appointments: formatAppointments(appointments),
      insights: generateInsights(chatAnalyses, interviewReports, appointments)
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper functions
const calculateStats = (appointments, interviews, chats) => ({
  totalEvents: appointments.length + interviews.length + chats.length,
  interviews: interviews.length,
  quizzes: 0, // Add if you have quiz model
  therapySessions: appointments.length,
  productivityScore: calculateProductivityScore(interviews, chats),
  consistency: calculateConsistency(appointments, interviews)
});

const calculateAnalytics = (appointments, interviews, chats) => ({
  avgSessionTime: calculateAvgSessionTime(interviews),
  completionRate: calculateCompletionRate(appointments),
  improvementRate: calculateImprovementRate(interviews),
  stressLevel: calculateStressLevel(chats)
});

const calculateProductivityScore = (interviews, chats) => {
  const interviewScore = interviews.length * 10; // 10 points per interview
  const chatScore = Math.min(chats.length * 2, 30); // 2 points per chat, max 30
  return Math.min(interviewScore + chatScore, 100);
};

const calculateConsistency = (appointments, interviews) => {
  const totalSessions = appointments.length + interviews.length;
  const daysActive = new Set([...appointments, ...interviews]
    .map(item => item.createdAt.toDateString())).size;
  
  return Math.min(Math.round((daysActive / 7) * 100), 100);
};

const calculateAvgSessionTime = (interviews) => {
  if (interviews.length === 0) return "0min";
  const avgMinutes = interviews.reduce((sum, i) => sum + (i.duration || 0), 0) / interviews.length;
  return `${Math.round(avgMinutes)}min`;
};

const calculateCompletionRate = (appointments) => {
  if (appointments.length === 0) return 0;
  const completed = appointments.filter(a => a.isAttended).length;
  return Math.round((completed / appointments.length) * 100);
};

const calculateImprovementRate = (interviews) => {
  if (interviews.length < 2) return 0;
  const sorted = interviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const firstConfidence = sorted[0].confidence || 50;
  const lastConfidence = sorted[sorted.length - 1].confidence || 50;
  return Math.max(0, Math.round(((lastConfidence - firstConfidence) / firstConfidence) * 100));
};

const calculateStressLevel = (chats) => {
  if (chats.length === 0) return 50;
  
  const stressEmotions = ['sad', 'angry', 'fear', 'disgust'];
  let stressCount = 0;
  let totalEmotions = 0;

  chats.forEach(chat => {
    chat.dominantEmotions?.forEach(emotion => {
      totalEmotions++;
      if (stressEmotions.includes(emotion)) stressCount++;
    });
  });

  return totalEmotions > 0 ? Math.round((stressCount / totalEmotions) * 100) : 50;
};

const calculatePerformanceTrend = (interviews) => {
  return interviews.map((report, index) => ({
    week: `W${index + 1}`,
    technical: report.confidence || 50,
    behavioral: calculateBehavioralScore(report),
    cognitive: calculateCognitiveScore(report)
  })).slice(-5); // Last 5 entries
};

const calculateBehavioralScore = (report) => {
  // Based on expression and confidence
  let score = report.confidence || 50;
  if (report.expression === 'positive') score += 20;
  if (report.expression === 'negative') score -= 15;
  return Math.max(0, Math.min(100, score));
};

const calculateCognitiveScore = (report) => {
  // Based on response time and duration
  let score = 50;
  if (report.averageResponseTime < 5) score += 20; // Fast responses
  if (report.duration > 10) score += 15; // Longer engagement
  return Math.max(0, Math.min(100, score));
};

const calculateMoodData = (chats) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const moodMap = {};
  
  chats.forEach(chat => {
    const day = days[new Date(chat.createdAt).getDay()];
    const positiveEmotions = ['happy', 'neutral'];
    const moodScore = chat.dominantEmotions?.some(e => positiveEmotions.includes(e)) ? 80 : 40;
    
    if (!moodMap[day]) moodMap[day] = { total: 0, sum: 0 };
    moodMap[day].sum += moodScore;
    moodMap[day].total++;
  });

  return days.map(day => ({
    day,
    mood: moodMap[day] ? Math.round(moodMap[day].sum / moodMap[day].total) : 60,
    energy: 70, // Default
    focus: 75   // Default
  }));
};

const calculateSkillAnalysis = (interviews) => {
  if (interviews.length === 0) return defaultSkills;
  
  const latest = interviews[interviews.length - 1];
  return [
    { skill: "Communication", score: latest.confidence || 50, target: 85 },
    { skill: "Problem Solving", score: calculateProblemSolvingScore(latest), target: 90 },
    { skill: "Adaptability", score: calculateAdaptabilityScore(interviews), target: 80 },
    { skill: "Confidence", score: latest.confidence || 50, target: 90 }
  ];
};

const calculateProblemSolvingScore = (report) => {
  let score = 50;
  if (report.questionsAsked > 5) score += 20;
  if (report.duration > 15) score += 15;
  return Math.min(100, score);
};

const calculateAdaptabilityScore = (interviews) => {
  if (interviews.length < 2) return 60;
  const confidenceRange = Math.max(...interviews.map(i => i.confidence)) - 
                         Math.min(...interviews.map(i => i.confidence));
  return Math.max(30, 100 - confidenceRange * 2); // Less variation = more adaptable
};

const formatAppointments = (appointments) => {
  return appointments.map(apt => ({
    therapist: "Dr. Therapist", // You'd populate this from therapist ref
    date: apt.createdAt.toISOString().split('T')[0],
    time: "14:30", // You'd get from slot model
    type: "Video Call",
    status: apt.isAttended ? "completed" : "upcoming"
  }));
};

const generateInsights = (chats, interviews, appointments) => {
  const insights = [];
  
  // Mood insight
  const avgMood = calculateStressLevel(chats);
  if (avgMood < 30) {
    insights.push({
      title: "Positive Mood Trend",
      description: "Your mood analysis shows positive emotional patterns",
      impact: "high",
      trend: "up"
    });
  }

  // Consistency insight
  if (appointments.length + interviews.length >= 5) {
    insights.push({
      title: "Great Consistency",
      description: "You've maintained regular practice sessions",
      impact: "medium",
      trend: "up"
    });
  }

  return insights;
};

const defaultSkills = [
  { skill: "Communication", score: 50, target: 85 },
  { skill: "Problem Solving", score: 50, target: 90 },
  { skill: "Adaptability", score: 50, target: 80 },
  { skill: "Confidence", score: 50, target: 90 }
];