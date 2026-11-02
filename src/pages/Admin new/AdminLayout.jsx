import React, { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  GraduationCap,
  BookOpen,
  LogOut,
  Menu,
  X,
  Users,
  AlertCircle,
  Lock,
  User,
  Settings,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Loader2,
  Unlock,
  DollarSign,
  Briefcase,
  Video,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useAdminMode } from "../../context/AdminModeContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, currentUser, loading } = useAuth();
  const { adminMode, toggleAdminMode } = useAdminMode();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [resetStatus, setResetStatus] = useState("idle");

  // --- REFRESH PERSISTENCE LOGIC ---
  useEffect(() => {
    // Agar loading khatam ho jaye aur user na mile, tabhi root par bhejo
    if (!loading && !currentUser) {
      navigate("/", { replace: true });
    }
  }, [currentUser, loading, navigate]);

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Partners", path: "/admin/partners", icon: Briefcase },
    { label: "Students", path: "/admin/students", icon: Users },
    { label: "Sales", path: "/admin/sales", icon: TrendingUp },
    { label: "Demo", path: "/admin/demo", icon: Video },
    { label: "Partnership Access", path: "/admin/resell", icon: DollarSign },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    setResetStatus("loading");
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setResetStatus("success");
      setTimeout(() => setResetStatus("idle"), 3000);
    } catch (error) {
      console.error("Reset Error:", error);
      setResetStatus("error");
      setTimeout(() => setResetStatus("idle"), 3000);
    }
  };

  // 1. IMPORTANT: Jab tak Firebase check kar raha hai, yahi ruko
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="text-indigo-200 font-bold text-sm animate-pulse tracking-widest uppercase">
            Restoring Session...
          </p>
        </div>
      </div>
    );
  }

  // 2. Agar user nahi hai, toh render mat karo (useEffect navigate handle karega)
  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="hidden lg:flex w-[280px] bg-slate-950 text-white flex-col h-full shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

        <div className="p-8 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="text-white size-6" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none flex items-center gap-2">
                Admin <span className="text-[10px] bg-indigo-500/40 text-indigo-300 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">NEW</span>
              </h1>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">
                Console
              </p>
            </div>
          </div>

          {/* Toggle Switch to Classic */}
          <div className="mt-4 p-2 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-300">New Admin ON</span>
            </div>
            <button
              onClick={toggleAdminMode}
              title="Click to switch to Classic Admin Panel"
              className="px-2.5 py-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 text-indigo-300 hover:text-white rounded-lg transition-all border border-white/10 active:scale-95 cursor-pointer"
            >
              Switch Classic
            </button>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
            Management
          </p>
          {navItems.map((item) => {
            // Check active precisely
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/admin" &&
                location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/5"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon
                  size={20}
                  className={`transition-colors ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400"}`}
                />
                <span className="text-sm font-bold tracking-wide">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute right-3 size-1.5 rounded-full bg-indigo-400"
                  />
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5 bg-white/5 relative z-10">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
          >
            <div className="size-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {currentUser?.displayName?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {currentUser?.displayName || "Admin User"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {currentUser?.email}
              </p>
            </div>
            <Settings
              size={16}
              className="text-slate-500 group-hover:text-white transition-colors"
            />
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="lg:hidden h-16 bg-slate-950 flex items-center justify-between px-4 shrink-0 z-40">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white size-5" />
            </div>
            <span className="text-white font-bold text-sm">Admin NEW</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAdminMode}
              className="px-2.5 py-1 text-xs font-bold bg-white/10 hover:bg-white/20 text-indigo-300 rounded-lg border border-white/10"
            >
              Classic ➔
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-white p-2"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-24 custom-scrollbar bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {/* Yaha aapka current page load hoga refresh ke baad bhi */}
            <Outlet />
          </div>
        </main>
      </div>

      {/* --- MOBILE MENU & MODALS (Baki code same hai) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed inset-y-0 left-0 w-[280px] bg-slate-950 text-white z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-white/5">
                <h2 className="font-bold text-lg">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-white/10 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${isActive ? "bg-indigo-600 text-white font-bold" : "text-slate-400 font-medium hover:text-white"}`
                    }
                  >
                    <item.icon size={20} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-400 bg-red-500/10 rounded-xl font-bold"
                >
                  <LogOut size={20} /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="bg-slate-950 p-6 text-center relative">
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-all"
                >
                  <X size={18} />
                </button>
                <div className="size-20 bg-indigo-500 rounded-full flex items-center justify-center text-3xl font-black text-white mx-auto mb-4 border-4 border-slate-900 shadow-xl">
                  {currentUser?.displayName?.[0]?.toUpperCase() || "A"}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {currentUser?.displayName || "Administrator"}
                </h3>
                <p className="text-indigo-200 text-sm">{currentUser?.email}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="size-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Role
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      Super Admin
                    </p>
                  </div>
                </div>
                <button
                  onClick={handlePasswordReset}
                  disabled={resetStatus !== "idle"}
                  className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${resetStatus === "success" ? "bg-emerald-500 text-white" : resetStatus === "error" ? "bg-red-500 text-white" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                >
                  {resetStatus === "loading" ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Sending...
                    </>
                  ) : resetStatus === "success" ? (
                    <>
                      <CheckCircle size={18} /> Email Sent!
                    </>
                  ) : (
                    <>
                      <Lock size={18} /> Reset Password
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full py-4 text-red-500 font-bold text-sm bg-red-50 hover:bg-red-100 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative z-10 border border-slate-100 text-center"
            >
              <div className="size-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Confirm Logout?
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-8">
                Are you sure you want to end your session? You will need to sign
                in again to access the admin console.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLogout}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-100"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
