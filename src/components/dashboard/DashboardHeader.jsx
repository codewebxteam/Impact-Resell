import React, { useState, useRef, useEffect } from "react";
import { Bell, Search, Menu, User, LogOut, ShieldCheck, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const DashboardHeader = ({ onMenuClick }) => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  const isPartner = userData?.role === "partner";

  // [NEW] Dynamic Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const greeting = getGreeting();

  const firstName = currentUser?.displayName
    ? currentUser.displayName.split(" ")[0]
    : "Student";

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="h-20 lg:h-24 bg-[#F4F7FE]/80 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
      {/* Mobile Toggle & Welcome */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-3 bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-sm lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
            Student / <span className="text-slate-900">Learning Portal</span>
          </p>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {greeting},{" "}
            <span className="text-emerald-600 font-black">
              {firstName}
            </span>{" "}
            👋
          </h1>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* On/Off Mode Switcher Toggle (Only visible if partnership access is active) */}
        {isPartner && (
          <div
            onClick={() => navigate("/partner")}
            className="flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm hover:shadow-md rounded-full py-1.5 px-3 sm:px-4 cursor-pointer hover:border-emerald-300 transition-all group select-none"
            title="Toggle back to Partner Panel"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
              <ShieldCheck size={15} />
              <span className="hidden sm:inline">Partner</span>
            </div>

            {/* Classic iOS / On-Off Toggle Switch */}
            <div
              role="switch"
              aria-checked="true"
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-950 group-hover:bg-slate-900 transition-colors duration-200 ease-in-out"
            >
              <span
                className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-emerald-400 shadow-md ring-0 transition duration-200 ease-in-out translate-x-5"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Student</span>
            </div>
          </div>
        )}

        <div className="hidden md:flex items-center bg-white border border-slate-200/80 rounded-full px-4 py-2 w-64 shadow-2xs">
          <Search className="size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search learning materials..."
            className="bg-transparent border-none outline-none text-xs ml-2 w-full text-slate-700 font-medium"
          />
        </div>

        <button className="relative p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-2xl shadow-2xs transition-colors">
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-2 bg-emerald-500 rounded-full border-2 border-white"></span>
        </button>

        {/* PROFILE DROPDOWN */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="size-10 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center font-black text-sm border-2 border-white shadow-md hover:scale-105 transition-transform"
          >
            {firstName[0]}
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[100]"
              >
                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {currentUser?.displayName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {currentUser?.email}
                  </p>
                  {isPartner && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                      Partner Active
                    </span>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  {isPartner && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/partner");
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4" />
                        <span>Partner Panel</span>
                      </div>
                      <ArrowRight className="size-3.5" />
                    </button>
                  )}
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 hover:text-[#0891b2] transition-colors"
                  >
                    <User className="size-4" /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="size-4" /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
