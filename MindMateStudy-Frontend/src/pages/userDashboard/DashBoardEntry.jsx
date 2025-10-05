import React, { useState } from "react";
import { Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import SideBar from "../../components/SideBar";

const DashboardLayout = () => {
  const userData = useSelector((state) => state.user);
  console.log(userData);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className=" bg-background text-white font-saas">
      {/* Sidebar */}
      <SideBar />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-background border-b border-gray-800 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Dashboard
                </h1>
              
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
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors"
                  >
                    <img
                      src={userData?.avatar}
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
                      <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white hover:bg-opacity-5 transition-colors">
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white hover:bg-opacity-5 transition-colors">
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <hr className="border-gray-700 my-1" />
                      <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-400 hover:bg-opacity-10 transition-colors">
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

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
