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
  Sparkles,
  Search,
  ArrowRight
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

const Theme4Header = ({ currentTheme = "theme4" }) => {
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

  const academyName = !isMainSite && agency?.name ? agency.name : "AIFlix Academy";
  const tagline = !isMainSite && agency?.tagline ? agency.tagline : "Learn Today. Create Tomorrow.";

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
      navigate(getRoute("/home"));
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navLinks = [
    { name: "Home", path: getRoute("/home"), icon: Home },
    { name: "Courses", path: getRoute("/courses"), icon: GraduationCap },
    { name: "About Us", path: getRoute("/about"), icon: Users },
    { name: "Contact", path: getRoute("/contact"), icon: Mail },
    ...(currentUser ? [{ name: "Dashboard", path: dashboardPath, isDashboard: true, icon: LayoutDashboard }] : []),
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-xs h-16 sm:h-20 flex items-center transition-all duration-300"
      >
        <div className="w-full max-w-[1500px] mx-auto px-5 sm:px-10 lg:px-16 flex items-center justify-between">
          {/* Logo */}
          <NavLink 
            to={getRoute("/home")} 
            className="flex items-center gap-3 group shrink-0"
          >
            {agency?.logo ? (
              <img
                src={agency.logo}
                alt={academyName}
                className="h-10 w-auto object-contain rounded-xl"
              />
            ) : (
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 text-white shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
            )}
            
            <div className="flex flex-col">
              <span className="text-[17px] sm:text-[19px] font-black tracking-tight text-slate-900 leading-tight">
                {academyName}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-violet-600 leading-tight">
                {tagline}
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-9">
            {navLinks.map((item) => {
              const isAnchor = item.path.includes("#");
              return isAnchor ? (
                <a
                  key={item.name}
                  href={item.path}
                  className="text-[13.5px] font-bold text-slate-700 hover:text-violet-600 transition-colors py-1 cursor-pointer"
                >
                  {item.name}
                </a>
              ) : (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `text-[13.5px] font-bold transition-colors py-1 relative ${
                      isActive
                        ? "text-violet-600 font-black"
                        : "text-slate-700 hover:text-violet-600"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{item.name}</span>
                      {isActive && (
                        <motion.span
                          layoutId="activeTab4"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Icon button */}
            <NavLink
              to={getRoute("/courses")}
              className="p-2.5 rounded-full text-slate-700 hover:text-violet-600 hover:bg-slate-100 transition-colors"
              title="Search Courses"
            >
              <Search className="size-4.5 stroke-[2.5]" />
            </NavLink>

            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 hover:bg-violet-100 border border-violet-200/80 transition-all cursor-pointer"
                >
                  <div className="size-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <ChevronDown className="size-3.5 text-slate-600" />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-500">Signed in as</p>
                        <p className="text-sm font-black text-slate-900 truncate">
                          {currentUser.displayName || currentUser.email}
                        </p>
                      </div>

                      <Link
                        to={dashboardPath}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                      >
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="size-4" />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => openAuth("login")}
                className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-xs sm:text-sm shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/35 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <span>Start Learning</span>
                <ArrowRight className="size-3.5 stroke-[3]" />
              </button>
            )}
          </div>
        </div>
      </motion.nav>
      
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 lg:hidden pb-safe pt-2 px-4 sm:px-6 shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
          {navLinks.map((item) => {
            const isCourseDetails =
              item.name === "Courses" &&
              (location.pathname.startsWith("/courses") ||
                location.pathname.includes("/coursedetails") ||
                location.pathname.includes("/courses/"));
            const isActive = location.pathname === item.path || isCourseDetails;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full py-1 group select-none cursor-pointer"
              >
                <div className="relative p-1">
                  {isActive && (
                    <motion.div
                      layoutId="mobile-glow-theme4"
                      className="absolute inset-0 blur-md rounded-full bg-violet-500/20"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <motion.div
                    animate={{ y: isActive ? -2 : 0, scale: isActive ? 1.08 : 1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  >
                    {Icon && (
                      <Icon
                        className={`size-5 transition-colors duration-300 ${
                          isActive
                            ? "text-violet-600 stroke-[2.5px]"
                            : "text-slate-400 group-hover:text-slate-600 stroke-[1.75px]"
                        }`}
                      />
                    )}
                  </motion.div>
                </div>
                <span
                  className={`text-[10px] tracking-tight transition-colors duration-200 ${
                    isActive ? "font-black text-violet-600" : "font-bold text-slate-500 group-hover:text-slate-700"
                  }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-dot-theme4"
                    className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
                    transition={{ type: "spring", stiffness: 380, damping: 25 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultMode={authMode} />
    </>
  );
};

export default Theme4Header;
