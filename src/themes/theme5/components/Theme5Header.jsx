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
  Sparkles,
  Search,
  ArrowRight,
  Menu,
  X,
  Play
} from "lucide-react";
import {
  NavLink,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import AuthModal from "../../../components/AuthModal";
import { useAuth } from "../../../context/AuthContext";
import { useAgency } from "../../../context/AgencyContext";

const Theme5Header = ({ currentTheme = "theme5" }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
      navigate(currentTheme ? `/dev/${currentTheme}/home` : "/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const isDev = location.pathname.startsWith("/dev/");
  const getRoute = (path) => (isDev ? `/dev/${currentTheme}${path}` : path);

  const navLinks = [
    { name: "Home", path: getRoute("/home") },
    { name: "Courses", path: getRoute("/courses") },
    { name: "About", path: getRoute("/about") },
    { name: "Contact", path: getRoute("/contact") },
  ];

  const brandName = !isMainSite && agency?.name ? agency.name : (agency?.name || "AIFlix");

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-xs border-b border-indigo-50/80 h-16 sm:h-20"
            : "bg-white/90 backdrop-blur-sm border-b border-slate-100 h-16 sm:h-20"
        } flex items-center`}
      >
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          
          {/* Brand / Logo */}
          <Link
            to={getRoute("/home")}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="size-10 sm:size-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                <div className="size-6 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white">
                  <Play className="size-3.5 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {brandName}
                </span>
                <span className="inline-block size-2 rounded-full bg-pink-500" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase -mt-1 hidden sm:block">
                Learn Today, Create Tomorrow
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? "text-indigo-600 bg-indigo-50/70"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* Quick Courses Search Button */}
            <Link
              to={getRoute("/courses")}
              title="Search courses"
              className="size-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-all border border-slate-200/60 hidden sm:flex"
            >
              <Search className="size-4.5" />
            </Link>

            {/* Auth / Profile or Start Learning */}
            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer"
                >
                  <div className="size-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-bold text-slate-700 hidden sm:inline max-w-[90px] truncate">
                    {currentUser.displayName || "My Account"}
                  </span>
                  <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {currentUser.displayName || "Student"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {currentUser.email}
                        </p>
                      </div>

                      <Link
                        to={dashboardPath}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors"
                      >
                        <LayoutDashboard className="size-4" />
                        Go to Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="size-4" />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth("login")}
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Log In
                </button>

                <Link
                  to={getRoute("/courses")}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="size-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-indigo-600 md:hidden transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute top-full left-0 right-0 bg-white/98 backdrop-blur-md border-b border-slate-200/80 shadow-xl overflow-hidden md:hidden"
            >
              <div className="p-5 space-y-3">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`
                    }
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="size-4 opacity-50" />
                  </NavLink>
                ))}

                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  {!currentUser ? (
                    <button
                      onClick={() => openAuth("login")}
                      className="w-full py-3 rounded-xl text-sm font-bold text-center text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Student / Partner Login
                    </button>
                  ) : (
                    <Link
                      to={dashboardPath}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 rounded-xl text-sm font-bold text-center text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                    >
                      Dashboard Access
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
};

export default Theme5Header;
