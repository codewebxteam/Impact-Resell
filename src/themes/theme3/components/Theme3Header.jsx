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
  Sparkles
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

const Theme3Header = ({ currentTheme = "theme3" }) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { currentUser, userData, logout } = useAuth();
  const { agency, isMainSite } = useAgency();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const isPartner = userData?.role === "partner";
  const isAdmin = userData?.role === "admin";

  let dashboardPath = "/dashboard";
  if (isPartner) dashboardPath = "/partner";
  if (isAdmin) dashboardPath = "/admin";

  const isDev = location.pathname.startsWith("/dev/");
  const getRoute = (path) => (isDev ? `/dev/${currentTheme}${path}` : (path === "/home" ? "/" : path));

  const academyName = !isMainSite && agency?.name ? agency.name : (agency?.name || "AI Courses");
  const tagline = !isMainSite && agency?.tagline ? agency.tagline : (agency?.tagline || "");

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

  const navLinks = [
    { name: "Home", path: getRoute("/home"), icon: Home },
    { name: "Courses", path: getRoute("/courses"), icon: GraduationCap },
    { name: "About Us", path: getRoute("/about"), icon: Users },
    { name: "Contact Us", path: getRoute("/contact"), icon: Mail },
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
            ? "bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-md py-3"
            : "bg-white md:bg-transparent border-b border-slate-100 md:border-transparent py-3 sm:py-5 shadow-xs md:shadow-none"
        }`}
      >
        <div className="max-w-[1500px] mx-auto px-5 sm:px-10 lg:px-16 flex items-center justify-between">
          <NavLink 
            to={getRoute("/home")} 
            className="flex items-center gap-3 group shrink-0"
          >
            {agency?.logo ? (
              <img
                src={agency.logo}
                alt={academyName}
                className="h-9 sm:h-10 w-auto object-contain rounded-xl"
              />
            ) : (
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#fedc5c] text-slate-950 shadow-md shadow-amber-400/30 group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
            )}
            
            <div className="flex flex-col">
              <span className="text-[16px] sm:text-[18px] font-black tracking-tight text-slate-900 leading-tight">
                {academyName}
              </span>
              <span className="text-[10.5px] sm:text-[11.5px] font-bold text-amber-600 leading-tight">
                {tagline}
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
                        ? "font-extrabold text-slate-950 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#fedc5c] after:rounded-full"
                        : "font-semibold text-slate-700 hover:text-amber-600"
                    }`;
                  }}
                >
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100/90 transition-all border border-slate-200/80 cursor-pointer bg-white shadow-xs"
                >
                  <div className="size-8 rounded-full bg-[#fedc5c] text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-black text-slate-900 leading-none">
                      {currentUser.displayName ? currentUser.displayName.split(" ")[0] : "Student"}
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
                        <p className="text-sm font-black text-slate-900 truncate">
                          {currentUser.displayName || "Student"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {currentUser.email}
                        </p>
                        {isAdmin && (
                          <span className="mt-1 inline-block text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Admin Access
                          </span>
                        )}
                        {isPartner && (
                          <span className="mt-1 inline-block text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Partner Portal
                          </span>
                        )}
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          to={dashboardPath}
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-slate-700 rounded-xl hover:bg-amber-50 hover:text-amber-900 transition-colors"
                        >
                          <LayoutDashboard className="size-4 text-[#fedc5c]" />
                          <span>{isPartner ? "Partner Dashboard" : isAdmin ? "Admin Panel" : "My Dashboard"}</span>
                        </Link>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="size-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => openAuth("login")}
                className="inline-flex items-center gap-2 bg-[#fedc5c] hover:bg-amber-400 text-slate-950 text-[13px] sm:text-[14px] font-black px-5 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md shadow-amber-400/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* MOBILE BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950 border-t border-slate-800 lg:hidden pb-safe pt-2 px-6 shadow-2xl">
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
                        isActive ? "text-[#fedc5c] stroke-[2.5px]" : "text-slate-400 stroke-[1.5px]"
                      }`}
                    />
                  </motion.div>
                </div>
                <span
                  className={`text-[10px] tracking-tight transition-colors duration-200 ${
                    isActive ? "font-bold text-[#fedc5c]" : "font-medium text-slate-400"
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

export default Theme3Header;
