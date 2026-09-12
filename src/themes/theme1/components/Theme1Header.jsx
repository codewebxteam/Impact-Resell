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

const Theme1Header = ({ currentTheme = "theme1" }) => {
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

  const brandColor = agency?.themeColor || "#0f172a";
  const accentColor = agency?.accentColor || "#0070f3";

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
    const handlePartnerModalTrigger = () => {
      setAuthMode("partner");
      setIsAuthOpen(true);
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("openPartnerModal", handlePartnerModalTrigger);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("openPartnerModal", handlePartnerModalTrigger);
    };
  }, []);

  useEffect(() => {
    const authQuery = searchParams.get("auth");
    if (authQuery === "partner") {
      setTimeout(() => {
        setAuthMode("partner");
        setIsAuthOpen(true);
        searchParams.delete("auth");
        setSearchParams(searchParams, { replace: true });
      }, 0);
    }
  }, [searchParams, setSearchParams]);

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
      {/* TOP BAR */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-xs py-3"
            : "bg-white md:bg-transparent border-b border-slate-100 md:border-transparent py-3 sm:py-5 shadow-xs md:shadow-none"
        }`}
      >
        <div className="max-w-[1500px] mx-auto px-5 sm:px-10 lg:px-16 flex items-center justify-between">
          
          {/* Logo */}
          <NavLink 
            to={currentTheme ? `/dev/${currentTheme}/home` : "/"} 
            className="flex items-center gap-3 group shrink-0"
          >
            {agency?.logoUrl ? (
              <img
                src={agency.logoUrl}
                alt="Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl shadow-xs"
              />
            ) : (
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#06b6d4] text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
            )}
            
            <div className="flex flex-col">
              <span className="text-[16px] sm:text-[18px] font-extrabold tracking-tight text-slate-900 leading-tight">
                {agency?.name || "Your Academy"}
              </span>
              <span className="text-[10.5px] sm:text-[11.5px] font-medium text-slate-500 leading-tight">
                {agency?.tagline || "Learn AI. Create Impact."}
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav Links */}
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
                        ? "font-bold text-slate-950 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-slate-900 after:rounded-full"
                        : "font-semibold text-slate-600 hover:text-slate-950"
                    }`;
                  }}
                >
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          {/* Right Action / Auth Button */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-slate-100/80 transition-all border border-slate-200/60 cursor-pointer bg-white/80 backdrop-blur-xs"
                >
                  <div
                    className="size-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs"
                    style={{ backgroundColor: brandColor }}
                  >
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-none">
                      {currentUser.displayName ? currentUser.displayName.split(" ")[0] : "User"}
                    </p>
                  </div>
                  <ChevronDown className={`size-4 text-slate-400 transition-transform duration-300 ${showProfileMenu ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[100]"
                    >
                      <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {currentUser.displayName || "User"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {currentUser.email}
                        </p>
                        {isAdmin && (
                          <span className="mt-1 inline-block text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Admin Access
                          </span>
                        )}
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          to={dashboardPath}
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <LayoutDashboard className="size-4" /> Dashboard
                        </Link>

                        {!isAdmin && (
                          <Link
                            to={profilePath}
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <Settings className="size-4" /> My Profile
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin/settings"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <Lock className="size-4 text-indigo-500" /> Reset Password
                          </Link>
                        )}
                      </div>
                      <div className="p-2 border-t border-slate-50">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="size-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => openAuth("login")}
                className="inline-flex items-center gap-2 bg-[#0B132B] hover:bg-[#1C2541] text-white text-[13px] sm:text-[14px] font-bold px-5 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md shadow-slate-900/15 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Login</span>
              </button>
            )}
          </div>

        </div>
      </motion.nav>

      {/* MOBILE BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 lg:hidden pb-safe pt-2 px-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
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
                  {isActive && (
                    <motion.div
                      layoutId="mobile-glow-theme1"
                      className="absolute inset-0 blur-lg rounded-full bg-blue-500/20"
                      transition={{ duration: 0.5 }}
                    />
                  )}
                  <motion.div
                    animate={{ y: isActive ? -2 : 0, scale: isActive ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <item.icon
                      className={`w-5 h-5 transition-colors duration-300 ${
                        isActive ? "text-[#0070f3] stroke-[2.5px]" : "text-slate-400 stroke-[1.5px]"
                      }`}
                    />
                  </motion.div>
                </div>
                <span
                  className={`text-[10px] tracking-tight transition-colors duration-200 ${
                    isActive ? "font-bold text-slate-900" : "font-medium text-slate-500"
                  }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-dot-theme1"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#0070f3]"
                  />
                )}
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

export default Theme1Header;
