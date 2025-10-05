import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Analysis from "./components/Analysis.jsx";
import Playground from "./components/Playground.jsx";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import AllTherapists from "./pages/allTherapists/AllTherapists.jsx";
import TherapyProfile from "./pages/allTherapists/TherapyProfile.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import SideBar from "./components/SideBar.jsx";
import ChatBot from "./components/Chatbot/ChatBot.jsx";
import VideoCallComponent from "./pages/VideoCall/VideoCallComponent.jsx";
import Appointment from "./pages/appointments/Appointment.jsx";
import { Provider } from "react-redux";

import store from "../store/store";
import AllCommunity from "./pages/community/AllCommunity.jsx";
import CreateCommunity from "./pages/community/CreateCommunity.jsx";
import CommunityDashboard from "./pages/community/CommunityDashboard.jsx";
import { ChatProvider } from "./context/ChatProvider.jsx";
import { SocketProvider } from "./context/SocketProvider.jsx";
import MockInterview from "./components/MockInterview/MockInterview.jsx";
import { getCookie } from "./utils/cookiesApi.js";
import ProtectedRouteComponent from "./ProtectedComponent.jsx";
import Quiz from "./pages/Quiz.jsx";
import Category from "./pages/Category.jsx";
import Result from "./pages/Result.jsx";
import QuizAnalysis from "./pages/QuizAnalysis.jsx";
import Prepare from "./pages/Prepares.jsx";
import CommunityVideoCall from "./pages/VideoCall/VideoCallComponent.jsx";
import Summarizer from "./pages/Summarizer.jsx";
import NotesPage from "./pages/Notes.jsx";
import InterviewReports from "./components/MockInterview/InterviewAnalysis.jsx";
import MainDashboard from "./pages/MainDashboard.jsx";
import FaceRecognition from "./pages/FaceRecognition.jsx";
import TherapistDashboard from "./pages/TherapistDashboard/TherapistDashboard.jsx";
import CreateSlot from "./pages/TherapistDashboard/components/CreateSlot.jsx";
import MyBookings from "./pages/TherapistDashboard/components/MyBookings.jsx";
import UpdateProfile from "./pages/TherapistDashboard/components/UpdateProfile.jsx";
import UserDashboard from "./pages/userDashboard/UserDashboard.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Public Routes
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },

      // Protected Routes
      {
        element: <ProtectedRouteComponent />,
        children: [
          // Routes with Sidebar
          {
            element: <SideBar />,
            path: "/dashboard", // parent route
            children: [
              {
                path: "", // default dashboard page
                element: <UserDashboard />,
              },
              {
                path: "chat", // 👈 relative path
                element: <ChatBot />,
              },
              {
                path: "analysis", // 👈 relative path
                element: <Analysis />,
              },
              {
                path: "playground", // 👈 relative path
                element: <Playground />,
              },
              {
                path: "quiz/:category_id", // 👈 relative path
                element: <Quiz />,
              },
              {
                path: "quiz", // 👈 relative path
                element: <Category />,
              },
            ],
          },

          // Other protected routes without sidebar
          {
            path: "/therapists",
            element: <AllTherapists />,
          },
          {
            path: "/therapist/dashboard",
            element: <TherapistDashboard />,
            children: [
              {
                index: true, // default route inside dashboard
                element: <MyBookings />,
              },
              {
                path: "create-slot", // ✅ relative path
                element: <CreateSlot />,
              },
              {
                path: "update-profile", // ✅ relative path
                element: <UpdateProfile />,
              },
            ],
          },

          {
            path: "/therapist/:id",
            element: <TherapyProfile />,
          },
          {
            path: "/vc/:roomID",
            element: <VideoCallComponent />,
          },
          {
            path: "/vc/therapist/:roomID",
            element: <VideoCallComponent />,
          },
          {
            path: "/appointments",
            element: <Appointment />,
          },
          {
            path: "/mockInterview",
            element: <MockInterview />,
          },
          {
            path: "/playground",
            element: <Playground />,
          },
          {
            path: "/result/:result_id",
            element: <Result />,
          },
          {
            path: "/results",
            element: <QuizAnalysis />,
          },
          {
            path: "/prepare/:category_id",
            element: <Prepare />,
          },
          {
            path: "/face-recog",
            element: <FaceRecognition />,
          },
          {
            path: "/notes",
            element: <NotesPage />,
          },
          {
            path: "/summarizer",
            element: <Summarizer />,
          },
          {
            path: "/interview-analysis",
            element: <InterviewReports />,
          },
        ],
      },
      {
        path: "/dashboard",
        element: <MainDashboard />,
      },
      {
        path: "/mentors",
        element: <AllTherapists type="therapist" />,
      },
      {
        path: "/therapists",
        element: <AllTherapists type="mentor" />,
      },
      {
        path: "/mentor/:id",
        element: <TherapyProfile />,
      },
      {
        path: "/vc/:roomID",
        element: <VideoCallComponent />,
      },
      {
        path: "/vc/mentor/:roomID",
        element: <VideoCallComponent />,
      },

      {
        path: "/appointments",
        element: <Appointment />,
      },
      {
        path: "/community",
        element: <AllCommunity />,
      },
      {
        path: "/community/vc/:roomID",
        element: <CommunityVideoCall />,
      },
      {
        path: "/community/dashboard",
        element: <CommunityDashboard />,
      },
      {
        path: "/community/new",
        element: <CreateCommunity />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_ID}>
    <Provider store={store}>
      <SocketProvider>
        <ChatProvider>
          <RouterProvider router={router} />
        </ChatProvider>
      </SocketProvider>
    </Provider>
  </GoogleOAuthProvider>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("serviceWorker.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((err) => {
        console.log("Service Worker registration failed:", err);
      });
  });
}
