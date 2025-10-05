import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeCookie } from "../../utils/cookiesApi";
import Cookies from "universal-cookie";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { addUser } from "../../../store/userSlice";

export default function Header() {
  const userData = useSelector((state) => state.user);
  const cookies = new Cookies();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  console.log(userData);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const handleLogout = () => {
    toast.success("Logged out successfully");
    dispatch(addUser(null));
    cookies.remove("user_token");
    navigate("/login");
  };
  return (
    <header className="bg-background border-b rounded-2xl border-gray-800 sticky top-0 z-40">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            {/* <h1 className="text-2xl px-4 font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dashboard
            </h1> */}
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:opacity-80 cursor-pointer transition-colors"
              >
                <img
                  src={
                    "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
                  }
                  alt={userData?.name}
                  className="w-8 h-8 rounded-full border-2 border-gray-600"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-white">
                    {userData?.name}
                  </p>
                  <p className="text-xs text-gray-400">{userData?.role}</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl py-2 shadow-lg border border-gray-700">
                  <button className="flex items-center gap-3 w-full px-4 py-3 cursor-pointer text-sm hover:opacity-80 text-gray-300 hover:glass hover:bg-opacity-5 transition-colors">
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="flex items-center gap-3 w-full px-4 py-3 cursor-pointer text-sm hover:opacity-80 text-gray-300 hover:glass hover:bg-opacity-5 transition-colors">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <hr className="border-gray-700 my-1" />
                  <button
                    onClick={() => {
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:opacity-80 cursor-pointer hover:bg-opacity-10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
