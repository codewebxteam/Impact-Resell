import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PlayCircle,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  Zap,
  Calendar,
  Star,
  CheckCircle,
  Target,
  Crown, // [ADDED] Crown for Max Streak
  Flame,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCourse } from "../../context/CourseContext";
import { useAgency } from "../../context/AgencyContext";
// [REMOVED] useEBook is no longer needed for stats
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const { enrolledCourses } = useCourse();
  const { agency, isMainSite } = useAgency();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [continueLearning, setContinueLearning] = useState(null);
  const [activeHours, setActiveHours] = useState(0);
  const [gamification, setGamification] = useState({
    level: 1,
    xp: 0,
    streak: 0,
    maxStreak: 0, // [ADDED] Max Streak State
  });

  // [LOGIC] Dynamic Academy Name
  const academyName =
    !isMainSite && agency ? agency.name : "Impact School Of AI";

  // --- 1. STREAK TRACKING LOGIC (With Max Streak) ---
  useEffect(() => {
    const handleStreak = async () => {
      if (!currentUser) return;

      const userRef = doc(db, "users", currentUser.uid);

      try {
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const lastLogin = data.lastLoginDate?.toDate();
          const currentStreak = data.streak || 0;
          const currentMaxStreak = data.maxStreak || 0; // Get existing Max Streak

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let newStreak = currentStreak;
          let shouldUpdate = false;

          if (lastLogin) {
            const lastLoginDate = new Date(lastLogin);
            lastLoginDate.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(today - lastLoginDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              // Consecutive Login
              newStreak = currentStreak + 1;
              shouldUpdate = true;
            } else if (diffDays > 1) {
              // Streak Broken
              newStreak = 1;
              shouldUpdate = true;
            }
            // diffDays === 0 means same day login, do nothing to streak count
          } else {
            // First Login
            newStreak = 1;
            shouldUpdate = true;
          }

          // [LOGIC] Check & Update Maximum Streak
          // Even if streak didn't change (same day), we might need to sync maxStreak if it wasn't tracked before
          let newMaxStreak = currentMaxStreak;
          if (newStreak > currentMaxStreak) {
            newMaxStreak = newStreak;
            shouldUpdate = true; // Ensure we save if a record is broken
          } else if (currentStreak > currentMaxStreak) {
            // Fallback: If current streak is high but maxStreak wasn't recorded properly before
            newMaxStreak = currentStreak;
            shouldUpdate = true;
          }

          if (shouldUpdate) {
            await updateDoc(userRef, {
              streak: newStreak,
              maxStreak: newMaxStreak, // Save Max Streak
              lastLoginDate: serverTimestamp(),
            });
          }
        }
      } catch (error) {
        console.error("Error updating streak:", error);
      }
    };

    handleStreak();
  }, [currentUser]);

  // --- 2. CALCULATE DATA & LISTENERS ---
  useEffect(() => {
    if (currentUser && enrolledCourses) {
      // A. Active Hours Logic
      const totalSeconds = enrolledCourses.reduce(
        (acc, curr) => acc + (Number(curr.watchedDuration) || 0),
        0,
      );
      const hours = totalSeconds / 3600;
      setActiveHours(hours);

      // B. Continue Learning
      const sortedCourses = [...enrolledCourses].sort(
        (a, b) => new Date(b.lastAccessed || 0) - new Date(a.lastAccessed || 0),
      );
      const nextCourse = sortedCourses.find((c) => (c.progress || 0) < 100);
      setContinueLearning(nextCourse || sortedCourses[0]);

      // C. Listen to User Data
      const unsub = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGamification({
            level: data.level || 1,
            xp: data.xp || 0,
            streak: data.streak || 0,
            maxStreak: data.maxStreak || 0, // [ADDED] Read Max Streak
          });
        }
      });

      setLoading(false);
      return () => unsub();
    }
  }, [currentUser, enrolledCourses]);

  // --- 3. UPDATE STATS CARDS ---
  useEffect(() => {
    let timeDisplay = "0m";
    if (activeHours > 0) {
      if (activeHours < 1) {
        timeDisplay = `${Math.round(activeHours * 60)}m`;
      } else {
        timeDisplay = `${activeHours.toFixed(1)}h`;
      }
    }

    const certificatesCount = enrolledCourses.filter(
      (c) => Math.round(c.progress || 0) >= 100,
    ).length;

    setStats([
      {
        title: "Active Learning",
        value: timeDisplay,
        icon: Clock,
        color: "text-[#5edff4]",
        bg: "bg-[#5edff4]/10",
        border: "border-[#5edff4]/20",
        change: "Total Time",
      },
      {
        title: "Courses",
        value: enrolledCourses.length,
        icon: BookOpen,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20",
        change: "In Progress",
      },
      {
        title: "Certificates",
        value: certificatesCount,
        icon: Award,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        border: "border-purple-400/20",
        change: "Earned",
      },
      {
        title: "Max Streak", // [UPDATED] Replaced E-Books
        value: `${gamification.maxStreak} Days`, // [UPDATED] Dynamic Max Streak
        icon: Crown, // [UPDATED] Crown Icon for Record
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/20",
        change: "All Time Best",
      },
    ]);
  }, [activeHours, enrolledCourses, gamification.maxStreak]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 border-4 border-slate-200 border-t-[#5edff4] rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-24 md:pb-12 font-sans text-slate-900">
      {/* === HEADER SECTION (Mobile Optimized) === */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-white p-5 md:p-6 rounded-3xl md:rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5edff4]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Welcome to{" "}
              <span className="text-[#0891b2] block md:inline">
                {academyName}
              </span>
            </h1>
          </div>
          <p className="text-sm md:text-base text-slate-500 font-medium">
            Hello,{" "}
            <span className="font-bold text-slate-900">
              {currentUser?.displayName?.split(" ")[0] || "Student"}
            </span>
            ! Ready to learn?
          </p>
        </div>

        {/* Header Right: Current Streak Badge */}
        <div className="absolute top-5 right-5 md:relative md:top-auto md:right-auto z-10 flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 text-orange-600 rounded-full shadow-sm">
            <Flame
              size={16}
              className="fill-orange-500 text-orange-500 animate-pulse"
            />
            <span className="text-xs md:text-sm font-bold">
              {gamification.streak} Day Streak
            </span>
          </div>

          <button className="p-2.5 md:p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-[#5edff4] hover:text-[#0891b2] transition-all shadow-sm hidden md:flex">
            <Calendar size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* === STATS GRID (Mobile: 2 Columns) === */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white p-4 md:p-5 rounded-3xl md:rounded-[2rem] border ${stat.border} shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}
          >
            <div
              className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}
            >
              <stat.icon
                size={50}
                className={`${stat.color.replace("text-", "stroke-")} md:w-[60px] md:h-[60px]`}
              />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div
                  className={`p-2.5 md:p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon size={20} className="md:w-[22px] md:h-[22px]" />
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1">
                  {stat.title}
                </p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-[10px] md:text-xs font-medium text-slate-400 mt-1 md:mt-2 flex items-center gap-1">
                  <TrendingUp size={10} className="md:w-3 md:h-3" />{" "}
                  {stat.change}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* === MAIN: CONTINUE LEARNING === */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[280px] md:min-h-[300px] shadow-2xl shadow-slate-900/20"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5edff4] rounded-full blur-[180px] opacity-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600 rounded-full blur-[120px] opacity-15 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#5edff4] animate-pulse"></span>
                Resume Learning
              </span>
            </div>

            {continueLearning ? (
              <div className="max-w-xl">
                <h2 className="text-2xl md:text-4xl font-black mb-3 md:mb-4 leading-tight line-clamp-2">
                  {continueLearning.title}
                </h2>
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                  <p className="text-slate-400 text-xs md:text-sm font-medium flex items-center gap-2">
                    <Star
                      size={14}
                      className="text-yellow-400 fill-current md:w-4 md:h-4"
                    />{" "}
                    Premium Course
                  </p>
                </div>
              </div>
            ) : (
              <h2 className="text-2xl md:text-4xl font-black mb-4 leading-tight">
                Start your first course today!
              </h2>
            )}
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/10 p-4 md:p-5 rounded-2xl md:rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 shadow-inner">
            {continueLearning ? (
              <div className="flex-1 w-full">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-200 flex items-center gap-2">
                    <Target size={14} /> Course Progress
                  </span>
                  <span className="text-[#5edff4]">
                    {Math.round(continueLearning.progress)}%
                  </span>
                </div>
                <div className="h-2.5 md:h-3 bg-slate-950/50 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${continueLearning.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#5edff4] to-[#0891b2] rounded-full shadow-[0_0_15px_rgba(94,223,244,0.5)]"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 text-slate-300 text-sm font-medium w-full text-center sm:text-left">
                Browse our catalog to begin.
              </div>
            )}

            <button
              onClick={() =>
                navigate(
                  continueLearning
                    ? "/dashboard/my-courses"
                    : "/dashboard/explore",
                )
              }
              className="w-full sm:w-auto bg-white text-slate-900 p-3 md:p-4 rounded-xl md:rounded-2xl hover:scale-105 hover:bg-[#5edff4] transition-all shadow-xl shadow-black/20 group flex justify-center items-center"
            >
              {continueLearning ? (
                <PlayCircle
                  size={24}
                  className="group-hover:fill-slate-900 md:w-[28px] md:h-[28px]"
                />
              ) : (
                <ArrowRight size={20} className="md:w-[24px] md:h-[24px]" />
              )}
            </button>
          </div>
        </motion.div>

        {/* === NEW COURSES WIDGET === */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-6 shadow-sm flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="font-bold text-base md:text-lg text-slate-900">
                Discover
              </h3>
              <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                <ShoppingBag size={18} className="md:w-5 md:h-5" />
              </div>
            </div>
            <h4 className="text-xl md:text-2xl font-black text-slate-900 mb-2">
              New Arrivals
            </h4>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed line-clamp-3">
              Explore the latest AI courses added to {academyName}. Stay ahead
              of the curve.
            </p>
          </div>

          <div className="mt-4 md:mt-6">
            <div className="flex items-center -space-x-2 mb-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] md:text-xs font-bold text-slate-500"
                >
                  AI
                </div>
              ))}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[10px] md:text-xs font-bold text-white">
                +5
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/explore")}
              className="w-full py-3 md:py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-[#0891b2] transition-colors shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              Browse Catalog <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* === BOTTOM: RECENT ACHIEVEMENTS === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white border border-slate-100 rounded-[2rem] p-5 md:p-8 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
          <h3 className="font-bold text-base md:text-lg text-slate-900 flex items-center gap-2">
            <Award className="text-yellow-500" size={18} /> Recent Milestones
          </h3>
          <Link
            to="/dashboard/certificates"
            className="text-xs md:text-sm font-bold text-[#0891b2] bg-[#0891b2]/5 hover:bg-[#0891b2]/10 px-3 py-2 rounded-lg transition-colors text-center"
          >
            View Certificates
          </Link>
        </div>

        <div className="bg-slate-50 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 border border-slate-100 border-dashed hover:border-[#5edff4]/50 transition-colors">
          <div className="size-16 md:size-20 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20 rotate-3 transform transition-transform group-hover:rotate-6 shrink-0">
            <Star size={32} className="fill-current md:w-[40px] md:h-[40px]" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h4 className="font-bold text-slate-900 text-lg md:text-xl">
              {gamification.streak > 0
                ? `You're on a ${gamification.streak} Day Streak!`
                : "Start Your Streak Today"}
            </h4>
            <p className="text-slate-500 text-xs md:text-sm mt-1 md:mt-2 max-w-lg leading-relaxed">
              {gamification.streak > 0
                ? `Consistency is key! Keep learning daily on ${academyName} to increase your streak and unlock rewards.`
                : "Log in and learn daily to build your streak and stay ahead in your career."}
            </p>
          </div>
          {gamification.streak > 0 && (
            <div className="px-3 py-1.5 md:px-4 md:py-2 bg-green-100 text-green-700 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shrink-0">
              <CheckCircle size={14} className="md:w-4 md:h-4" /> Streak Active
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
