import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  GraduationCap,
  BookOpen,
  Users,
  Mail,
  LogIn,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronDown,
  Lock, // [NEW] Added Lock icon for Reset Password
} from "lucide-react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";
import { useAgency } from "../context/AgencyContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // --- Destructure userData for Role Detection ---
  const { currentUser, userData, logout } = useAuth();
  const { agency, isMainSite } = useAgency();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Dynamic Styles based on Agency Settings
  // Safe check added for agency
  const brandColor = agency?.themeColor || "#0f172a";
  const accentColor = agency?.accentColor || "#5edff4";

  // --- [UPDATED] Logical Dashboard Paths for Student, Partner & Admin ---
  const isPartner = userData?.role === "partner";
  const isAdmin = userData?.role === "admin"; // Check if user is admin

  let dashboardPath = "/dashboard";
  if (isPartner) dashboardPath = "/partner";
  if (isAdmin) dashboardPath = "/admin"; // Redirect admin to Admin Panel

  // Profile Path
  let profilePath = "/dashboard/profile";
  if (isPartner) profilePath = "/partner/profile";
  if (isAdmin) profilePath = "/admin/settings"; // Admin profile usually in settings

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
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
    { name: "Home", path: "/", icon: Home },
    { name: "Courses", path: "/courses", icon: GraduationCap },
    { name: "E-Books", path: "/ebooks", icon: BookOpen },
    { name: "About Us", path: "/about", icon: Users },
    { name: "Contact Us", path: "/contact", icon: Mail },
    // Show Dashboard link if logged in
    ...(currentUser
      ? [{ name: "Dashboard", path: dashboardPath, icon: LayoutDashboard }]
      : []),
  ];

  return (
    <>
      {/* =======================================
          TOP BAR (Desktop & Mobile)
      ======================================= */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b
        ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-slate-200/50 py-2 shadow-lg shadow-slate-200/20"
            : "bg-transparent py-2 sm:py-3 border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* --- Logo & Name --- */}
          <NavLink to="/" className="flex items-center gap-2 group shrink-0">
            <div
              className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 shadow-lg shrink-0"
              style={{
                backgroundColor: brandColor,
                shadowColor: `${accentColor}33`,
              }}
            >
              {agency?.logoUrl ? (
                <img
                  src={agency.logoUrl}
                  alt="logo"
                  className="w-5 h-5 object-contain"
                />
              ) : (
                <GraduationCap
                  className="w-5 h-5"
                  style={{ color: accentColor }}
                />
              )}
            </div>
            <div className="flex flex-col">
              {/* [FIXED] Use agency.name instead of agency.agencyName */}
              <span className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 leading-none">
                {agency?.name || "Impact School Of AI"}
              </span>
              <span
                className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase block"
                style={{ color: accentColor }}
              >
               {/* {isMainSite ? "Academy" : "Institute"} */}
              </span>
            </div>
          </NavLink>

          {/* --- Desktop Links --- */}
          <div className="hidden lg:flex items-center bg-slate-100/50 backdrop-blur-sm px-1 py-1 rounded-full border border-slate-200/60">
            {navLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `relative px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300
                  ${
                    isActive
                      ? "text-slate-900"
                      : "text-slate-500 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="desktop-nav-bg"
                        className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-200/50"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* --- Action Buttons --- */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
                >
                  <div
                    className="size-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-md border border-slate-200"
                    style={{ backgroundColor: brandColor }}
                  >
                    {currentUser.displayName
                      ? currentUser.displayName[0].toUpperCase()
                      : "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-none">
                      {currentUser.displayName
                        ? currentUser.displayName.split(" ")[0]
                        : "User"}
                    </p>
                  </div>
                  <ChevronDown
                    className={`size-4 text-slate-400 transition-transform duration-300 ${
                      showProfileMenu ? "rotate-180" : ""
                    }`}
                  />
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
                        {/* Show Admin Badge */}
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

                        {/* --- [NEW] Reset Password Option for Admin --- */}
                        {isAdmin && (
                          <Link
                            to="/admin/settings"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <Lock className="size-4 text-indigo-500" /> Reset
                            Password
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
              <>
                <button
                  onClick={() => openAuth("login")}
                  className="flex text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors items-center gap-1 sm:gap-2 px-2 py-1.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden xs:inline">Login</span>
                </button>

                <button
                  onClick={() => openAuth("signup")}
                  className="relative overflow-hidden px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-white text-[10px] sm:text-sm font-bold shadow-xl group transition-transform active:scale-95 shrink-0 cursor-pointer"
                  style={{ backgroundColor: brandColor }}
                >
                  <span className="relative z-10 group-hover:opacity-80 transition-opacity duration-300">
                    Get Started
                  </span>
                  <div className="absolute inset-0 bg-black/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* =======================================
          MOBILE BOTTOM BAR
      ======================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 lg:hidden pb-safe pt-2 px-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center h-14">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center justify-center gap-1 w-full h-full"
              >
                <div className="relative p-1">
                  {isActive && (
                    <motion.div
                      layoutId="mobile-glow"
                      className="absolute inset-0 blur-lg rounded-full"
                      style={{ backgroundColor: `${accentColor}33` }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                  <motion.div
                    animate={{
                      y: isActive ? -2 : 0,
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <item.icon
                      className={`w-5 h-5 transition-colors duration-300 ${
                        isActive
                          ? "stroke-[2.5px]"
                          : "text-slate-400 stroke-[1.5px]"
                      }`}
                      style={{ color: isActive ? accentColor : undefined }}
                    />
                  </motion.div>
                </div>
                <span
                  className={`text-[9px] font-bold tracking-wide transition-all duration-300 ${
                    isActive
                      ? "text-slate-900 translate-y-0 opacity-100"
                      : "text-slate-400 translate-y-2 opacity-0 hidden"
                  }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-dot"
                    className="absolute -bottom-1 w-1 h-1 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
      <div className="h-16 lg:hidden" />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
};

export default Navbar;
