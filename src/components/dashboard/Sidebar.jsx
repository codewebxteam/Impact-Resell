import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  ShoppingCart,
  LogOut,
  X,
  GraduationCap,
  Award,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAgency } from "../../context/AgencyContext"; // [ADDED] Import Agency Context
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, currentUser, userData } = useAuth();
  const { agency, isMainSite } = useAgency(); // [ADDED] Get Agency Data
  const [dashboard, setDashboard] = useState(null);
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // [LOGIC] Dynamic Colors & Name
  const accentColor = agency?.accentColor || "#10b981";
  const appName = !isMainSite && agency ? agency.name : "AI Courses";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    if (!currentUser) return;

    const ref = doc(db, "dashboard", currentUser.uid);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setDashboard(snap.data());
      }
    });

    return () => unsub();
  }, [currentUser]);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: PlayCircle, label: "My Learning", path: "/dashboard/my-courses" },
    // { icon: BookOpen, label: "E-Book Library", path: "/dashboard/ebooks" },
    { icon: Award, label: "Certificates", path: "/dashboard/certificates" },
    {
      icon: ShoppingCart,
      label: "Explore Courses",
      path: "/dashboard/explore",
    },
  ];

  const SidebarContent = (
    <div className="h-full flex flex-col bg-white text-slate-900 border-r border-slate-200 relative">
      {/* 1. BRANDING AREA */}
      <div className="p-6 sm:p-7 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
            <GraduationCap size={22} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tighter uppercase block leading-none text-slate-900">
              {appName}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
              Student Portal
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* 2. MENU ITEMS */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-4 mb-3">
          Learning Menu
        </div>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => window.innerWidth < 1024 && onClose()}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              `w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all relative group ${
                isActive
                  ? "bg-slate-950 text-white shadow-xl shadow-slate-300 font-bold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="studentSidebarActive"
                    className="absolute left-0 w-1.5 h-6 bg-emerald-400 rounded-r-full"
                  />
                )}
                <span
                  className={`${
                    isActive
                      ? "text-emerald-400"
                      : "text-slate-400 group-hover:text-slate-900"
                  } transition-colors`}
                >
                  <item.icon className="size-5" />
                </span>
                <span className="text-sm tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* 3. LOGOUT BUTTON */}
      <div className="p-4 border-t border-slate-100 mt-auto">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-wider hover:bg-red-50 hover:text-red-500 transition-all border border-transparent cursor-pointer"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* 4. LOGOUT CONFIRMATION POPUP (Overlay) */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-x-4 bottom-20 bg-white border border-slate-200 p-5 rounded-2xl shadow-2xl z-50 text-slate-900"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-red-50 rounded-xl text-red-500">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Are you sure?</h4>
                <p className="text-xs text-slate-500">
                  You will be logged out of student portal.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
              >
                Yes, Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 z-40">
        {SidebarContent}
      </div>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-60 lg:hidden shadow-2xl"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
