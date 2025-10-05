import { BotMessageSquare } from "lucide-react";
import { BatteryCharging } from "lucide-react";
import { Fingerprint } from "lucide-react";
import { ShieldHalf } from "lucide-react";
import { PlugZap } from "lucide-react";
import { GlobeLock } from "lucide-react";

// import user1 from "../../../assets/profile-pictures/user1.jpg";
// import user2 from "../../../assets/profile-pictures/user2.jpg";
// import user3 from "../../../assets/profile-pictures/user3.jpg";
// import user4 from "../../../assets/profile-pictures/user4.jpg";
// import user5 from "../../../assets/profile-pictures/user5.jpg";
// import user6 from "../../../assets/profile-pictures/user6.jpg";

export const navItems = [
  { label: "Features", href: "#" },
  { label: "Clinics", href: "/all/clinics" },
  { label: "Pricing", href: "#" },
  { label: "Testimonials", href: "#" },
];

export const testimonials = [
  {
    user: "Dr. Maya Sharma",
    company: "MindEase Therapy",
    text: "Using MinMate has transformed the way we support our clients. The platform offers personalized mental wellness exercises and study guidance, making it easier for individuals to balance learning and mental health.",
  },
  {
    user: "Rohan Mehta",
    company: "NextGen Learning Hub",
    text: "MinMate's intelligent suggestions have greatly improved my focus and study habits. The integration of mindfulness exercises keeps me calm and productive throughout the day, making learning enjoyable.",
  },
  {
    user: "Anita Kapoor",
    company: "Serenity Center",
    text: "The AI companion not only helps organize my study schedule but also provides mental wellness prompts. The seamless support ensures I stay motivated without feeling overwhelmed. It feels like having a personal coach 24/7.",
  },
  {
    user: "Dr. Arjun Rao",
    company: "WellMind Institute",
    text: "MinMate has revolutionized the way we approach student mental health. The personalized learning paths combined with guided meditation features help our students maintain focus and emotional balance simultaneously.",
  },
  {
    user: "Sofia Desai",
    company: "Mind & Learn Academy",
    text: "Thanks to MinMate, I can track my study progress while keeping my mental health in check. The combination of study tips, reminders, and wellness exercises has made a huge difference in my daily routine.",
  },
  {
    user: "Kunal Verma",
    company: "BrainWave Solutions",
    text: "The AI companion makes learning personalized and stress-free. Its mental health support features, alongside study planning, have improved my productivity and overall well-being significantly.",
  },
];


export const features = [
  {
    icon: <PlugZap />,
    text: "Real-Time AI Tutoring & Engagement Analysis",
    description:
      "Get instant AI-powered learning assistance and engagement tracking to optimize student performance.",
  },
  {
    icon: <ShieldHalf />,
    text: "Advanced Security",
    description:
      "Protect student data and privacy with enterprise-grade security measures.",
  },
  {
    icon: <BatteryCharging />,
    text: "Emergency Alerts",
    description:
      "Instant notification system for campus safety and urgent communications.",
  },
  {
    icon: <BotMessageSquare />,
    text: "Smart Classroom Management",
    description:
      "Effortlessly manage classes, assignments, and student interactions in one platform.",
  },
  {
    icon: <Fingerprint />,
    text: "Personalized Learning Paths",
    description:
      "Adaptive learning technology that customizes content to each student's needs.",
  },
  {
    icon: <GlobeLock />,
    text: "Mindfulness & Focus Tools",
    description:
      "Integrated meditation and focus exercises to enhance learning concentration.",
  },
];

export const checklistItems = [
  {
    title: "Efficient Patient Record Management",
    description:
      "Manage and access patient records digitally to streamline clinic operations.",
  },
  {
    title: "Seamless Appointment Scheduling",
    description: "Schedule, modify, and manage patient appointments with ease.",
  },
  {
    title: "Enhanced Security Features",
    description:
      "Protect sensitive patient data with advanced security protocols.",
  },
  {
    title: "Instant Data Sharing",
    description:
      "Share patient information quickly to improve communication and care.",
  },
];

export const pricingOptions = [
  {
    title: "Free",
    price: "Rs 0",
    features: [
      "Basic record management",
      "Appointment scheduling",
      "Standard analytics",
    ],
  },
  {
    title: "Pro",
    price: "Rs 3000",
    features: [
      "Advanced record management",
      "Priority support",
      "Enhanced analytics",
      "Additional security features",
    ],
  },
  {
    title: "Enterprise",
    price: "Rs 20000",
    features: [
      "Full record management suite",
      "Dedicated support",
      "Custom analytics solutions",
      "Advanced security and compliance",
    ],
  },
];

export const resourcesLinks = [
  { href: "#", text: "Getting Started" },
  { href: "#", text: "Documentation" },
  { href: "#", text: "Tutorials" },
  { href: "#", text: "API Reference" },
  { href: "#", text: "Community Forums" },
];

export const platformLinks = [
  { href: "#", text: "Features" },
  { href: "#", text: "Supported Devices" },
  { href: "#", text: "System Requirements" },
  { href: "#", text: "Downloads" },
  { href: "#", text: "Release Notes" },
];

export const communityLinks = [
  { href: "#", text: "Events" },
  { href: "#", text: "Meetups" },
  { href: "#", text: "Conferences" },
  { href: "#", text: "Hackathons" },
  { href: "#", text: "Jobs" },
];
