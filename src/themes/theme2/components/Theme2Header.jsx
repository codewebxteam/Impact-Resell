/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  GraduationCap,
  Users,
  Mail,
  LogIn,
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronDown,
  Lock,
} from "lucide-react";
import {
  NavLink,
  useLocation,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import AuthModal from "../../../components/AuthModal";
import { useAuth } from "../../../context/AuthContext";
import { useAgency } from "../../../context/AgencyContext";

const Theme2Header = ({ currentTheme = "theme2" }) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { currentUser, userData, logout } = useAuth();
  const { agency } = useAgency();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const brandColor = agency?.themeColor || "#7c3aed";
  const accentColor = agency?.accentColor || "#a855f7";

  const isPartner = userData?.role === "partner";
  const isAdmin = userData?.role === "admin";

  let dashboardPath = "/dashboard";
  if (isPartner) dashboardPath = "/partner";
  if (isAdmin) dashboardPath = "/admin";

  let profilePath = "/dashboard/profile";
  if (isPartner) profilePath = "/partner/profile";
  if (isAdmin) profilePath = "/admin/settings";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navLinks = [
    { name: "Home", path: currentTheme ? `/dev/${currentTheme}/home` : "/", icon: Home },
    { name: "Courses", path: currentTheme ? `/dev/${currentTheme}/courses` : "/courses", icon: GraduationCap },
    { name: "About Us", path: currentTheme ? `/dev/${currentTheme}/about` : "/about", icon: Users },
    { name: "Contact Us", path: currentTheme ? `/dev/${currentTheme}/contact` : "/contact", icon: Mail },
    ...(currentUser ? [{ name: "Dashboard", path: dashboardPath, icon: LayoutDashboard }] : []),
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-purple-100 shadow-sm py-3"
            : "bg-white md:bg-transparent border-b border-slate-100 md:border-transparent py-3 sm:py-5 shadow-xs md:shadow-none"
        }`}
      >
        <div className="max-w-[1500px] mx-auto px-5 sm:px-10 lg:px-16 flex items-center justify-between">
          <NavLink 
            to={currentTheme ? `/dev/${currentTheme}/home` : "/"} 
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            
            <div className="flex flex-col">
              <span className="text-[16px] sm:text-[18px] font-extrabold tracking-tight text-slate-900 leading-tight">
                {agency?.name || "Theme 2 Academy"}
              </span>
              <span className="text-[10.5px] sm:text-[11.5px] font-medium text-purple-600 leading-tight">
                {agency?.tagline || "Innovate. Elevate. Succeed."}
              </span>
            </div>
          </NavLink>

          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navLinks.map((item) => {
              const isCourseDetails =
                item.name === "Courses" &&
                (location.pathname.startsWith("/courses") ||
                  location.pathname.includes("/coursedetails"));
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive: isExactActive }) => {
                    const isActive = isExactActive || isCourseDetails;
                    return `text-[14.5px] transition-all duration-200 relative py-1 ${
                      isActive
                        ? "font-bold text-purple-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-purple-600 after:rounded-full"
                        : "font-semibold text-slate-600 hover:text-purple-600"
                    }`;
                  }}
                >
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!currentUser && (
              <button
                onClick={() => openAuth("login")}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-[13px] sm:text-[14px] font-bold px-5 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md shadow-purple-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* MOBILE BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-purple-50 lg:hidden pb-safe pt-2 px-6 shadow-md">
        <div className="flex justify-between items-center h-14">
          {navLinks.map((item) => {
            const isCourseDetails =
              item.name === "Courses" &&
              (location.pathname.startsWith("/courses") ||
                location.pathname.includes("/coursedetails"));
            const isActive = location.pathname === item.path || isCourseDetails;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center justify-center gap-1 w-full h-full"
              >
                <div className="relative p-1">
                  <motion.div
                    animate={{ y: isActive ? -2 : 0, scale: isActive ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <item.icon
                      className={`w-5 h-5 transition-colors duration-300 ${
                        isActive ? "text-purple-600 stroke-[2.5px]" : "text-slate-400 stroke-[1.5px]"
                      }`}
                    />
                  </motion.div>
                </div>
                <span
                  className={`text-[10px] tracking-tight transition-colors duration-200 ${
                    isActive ? "font-bold text-purple-700" : "font-medium text-slate-500"
                  }`}
                >
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
};

export default Theme2Header;
