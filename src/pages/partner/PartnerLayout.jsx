import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  CreditCard,
  Ticket,
  Users,
  Settings,
  Globe,
  Command,
  AlertCircle,
  TrendingUp,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";

const PartnerLayout = () => {
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [partnerAgency, setPartnerAgency] = useState(null);
  const [loadingAgency, setLoadingAgency] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch Real Partner Data
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsub = onSnapshot(doc(db, "agencies", currentUser.uid), (doc) => {
      if (doc.exists()) {
        setPartnerAgency(doc.data());
      } else {
        setPartnerAgency(null);
      }
      setLoadingAgency(false);
    });

    return () => unsub();
  }, [currentUser]);

  // Navigation Config
  const navItems = [
    {
      label: "Dashboard",
      path: "/partner",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Financials",
      path: "/partner/financials",
      icon: <CreditCard size={20} />,
    },
    {
      label: "Sales",
      path: "/partner/sales",
      icon: <TrendingUp size={20} />,
    },
    {
      label: "Coupons",
      path: "/partner/coupons",
      icon: <Ticket size={20} />,
    },
    {
      label: "Students",
      path: "/partner/students",
      icon: <Users size={20} />,
    },
    {
      label: "Academy Settings",
      path: "/partner/settings",
      icon: <Settings size={20} />,
    },
  ];

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogoutClick = () => {
    // Mobile menu open ho to close kardo
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Copy Logic
  const handleCopyDomain = () => {
    if (!partnerAgency?.subdomain) return;
    const domain = `${partnerAgency?.subdomain}.i-cpp.com`;
    navigator.clipboard.writeText(domain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7FE] font-sans selection:bg-indigo-500/10">
      {/* 1. DESKTOP SIDEBAR (HIDDEN ON MOBILE) */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-white border-r border-slate-200 sticky top-0 h-screen z-50">
        {/* Logo Section */}
        <div className="p-8 flex items-center gap-3">
          <div className="size-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
            <Command size={22} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter uppercase block leading-none">
              Partner <span className="text-slate-400 font-medium">Pro</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Control Center
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative group ${
                  isActive
                    ? "bg-slate-950 text-white shadow-2xl shadow-slate-400"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute left-0 w-1.5 h-6 bg-emerald-400 rounded-r-full"
                  />
                )}
                <span
                  className={`${
                    isActive ? "text-emerald-400" : "group-hover:text-slate-900"
                  } transition-colors`}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-black uppercase tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Agency Context */}
        <div className="p-6 mt-auto border-t border-slate-50">
          <div
            className={`rounded-3xl p-5 mb-4 border transition-all ${
              !partnerAgency?.subdomain
                ? "bg-orange-50 border-orange-100"
                : "bg-[#F4F7FE] border-slate-100"
            }`}
          >
            {!loadingAgency && partnerAgency?.subdomain ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Globe size={14} className="text-indigo-600" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Active Domain
                    </p>
                  </div>
                  <button
                    onClick={handleCopyDomain}
                    className="p-1.5 hover:bg-white rounded-md transition-colors text-slate-400 hover:text-indigo-600"
                    title="Copy Domain"
                  >
                    {copied ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <p className="text-xs font-black text-slate-900 truncate mb-1">
                  {partnerAgency?.name || "My Academy"}
                </p>
                <p className="text-[9px] font-bold text-slate-500 truncate">
                  {partnerAgency?.subdomain}.i-cpp.com
                </p>
              </>
            ) : (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-orange-600">
                  <AlertCircle size={18} />
                  <span className="text-xs font-black uppercase">
                    Setup Required
                  </span>
                </div>
                <p className="text-[10px] font-bold text-orange-400 leading-snug">
                  Please configure your academy settings to go live.
                </p>
                <button
                  onClick={() => navigate("/partner/settings")}
                  className="w-full py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  Setup Now <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all border border-transparent"
          >
            <LogOut size={18} /> <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 lg:h-24 bg-[#F4F7FE]/80 backdrop-blur-xl sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-3 bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-sm"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Management / <span className="text-slate-900">Console</span>
              </p>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Main Dashboard
              </h2>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-slate-400 bg-white/50 px-4 py-2 rounded-2xl border border-slate-100/50">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-xs font-bold italic tracking-wide">
                "Architecting the Future of Education"
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden md:block mx-1"></div>

            <button
              onClick={() => navigate("/partner/profile")}
              className="flex items-center gap-3 pl-2 pr-1 group"
            >
              <div className="size-10 rounded-xl bg-slate-950 flex items-center justify-center text-white font-black text-xs border-4 border-slate-100 shadow-xl shadow-slate-200 group-hover:border-indigo-100 transition-all uppercase">
                {partnerAgency?.name?.[0] || "P"}
              </div>
            </button>
          </div>
        </header>

        {/* 3. DYNAMIC CONTENT CONTAINER */}
        <main className="flex-1 p-6 lg:p-10 relative overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* 4. MOBILE DRAWER (UPDATED WITH LOGOUT BUTTON) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-[101] lg:hidden flex flex-col p-6 h-full" // Added h-full
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg">
                    <Command size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-lg font-black tracking-tight uppercase block leading-none text-slate-900">
                      Partner
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Mobile Console
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Nav Items */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                      location.pathname === item.path
                        ? "bg-slate-950 text-white shadow-xl shadow-slate-300"
                        : "text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {item.icon}
                    <span className="text-xs">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* [ADDED] Mobile Bottom Section (Logout) */}
              <div className="mt-6 pt-6 border-t border-slate-100 shrink-0 space-y-4">
                {/* Domain Info (Optional for Mobile) */}
                {partnerAgency?.subdomain && (
                  <div className="px-2 py-1 flex items-center gap-2 text-[10px] text-slate-400 font-medium bg-slate-50 rounded-lg justify-center mb-2">
                    <Globe size={12} />
                    <span className="truncate max-w-[200px]">
                      {partnerAgency.subdomain}.i-cpp.com
                    </span>
                  </div>
                )}

                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-50 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-100 hover:text-red-600 transition-all border border-red-100"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- LOGOUT MODAL (Fixed Width) --- */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white w-full max-w-sm rounded-[24px] p-6 shadow-2xl relative z-10 border border-slate-100 text-center"
            >
              <div className="size-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                Sign Out?
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-6 px-4 leading-relaxed">
                You will need to sign in again to access your partner console.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-95"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerLayout;
