import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  Briefcase,
  Filter,
  GraduationCap,
  Globe,
  ChevronDown,
} from "lucide-react";

// Fallback data - Admin Global
const FALLBACK_WEEKLY = [
  { name: "Sun", sales: 0 },
  { name: "Mon", sales: 0 },
  { name: "Tue", sales: 0 },
  { name: "Wed", sales: 0 },
  { name: "Thu", sales: 0 },
  { name: "Fri", sales: 0 },
  { name: "Sat", sales: 0 },
];

const FALLBACK_MONTHLY = [
  { name: "Jan", sales: 0 },
  { name: "Feb", sales: 0 },
  { name: "Mar", sales: 0 },
  { name: "Apr", sales: 0 },
  { name: "May", sales: 0 },
  { name: "Jun", sales: 0 },
];

// Colors for Pie Charts
const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const IntelligenceHub = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // --- MAIN STATE ---
  const [timeRange, setTimeRange] = useState("All Time");
  const [velocityToggle, setVelocityToggle] = useState("Weekly");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });

  // --- ANALYTICS STATES ---
  const [partnersCount, setPartnersCount] = useState(0);
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    partnerRevenue: 0,
  });
  const [courseData, setCourseData] = useState({ total: 0, partner: 0 });
  const [studentData, setStudentData] = useState({ total: 0, partner: 0 });
  const [velocityData, setVelocityData] = useState(FALLBACK_WEEKLY);

  // Distribution States
  const [coursePieData, setCoursePieData] = useState([]);
  const [ebookPieData, setEbookPieData] = useState([]);

  // --- EFFECTS ---

  // 1. Fetch GLOBAL Orders & GRAPH DATA (Admin Perspective)
  useEffect(() => {
    console.log("DEBUG: Initializing Admin Global Data Fetch...");

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(
        `DEBUG: Found ${snapshot.size} total documents in orders collection.`,
      );

      let totalRev = 0;
      let coursesSold = 0;
      let ebooksSold = 0;
      const studentsSet = new Set();
      const courseMap = {};
      const ebookMap = {};

      // Logic for Graph (Velocity)
      const graphMap = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const orderDate = data.createdAt?.toDate?.() || new Date();
        const now = new Date();

        // Time Filtering Logic for Metrics
        let isWithinRange = true;
        if (timeRange !== "All Time") {
          if (timeRange === "Today") {
            isWithinRange = orderDate.toDateString() === now.toDateString();
          } else if (timeRange === "7D") {
            const diff = (now - orderDate) / (1000 * 60 * 60 * 24);
            isWithinRange = diff <= 7;
          } else if (timeRange === "30D") {
            const diff = (now - orderDate) / (1000 * 60 * 60 * 24);
            isWithinRange = diff <= 30;
          } else if (
            timeRange === "Custom" &&
            customDates.start &&
            customDates.end
          ) {
            const start = new Date(customDates.start);
            const end = new Date(customDates.end);
            isWithinRange = orderDate >= start && orderDate <= end;
          }
          if (!isWithinRange) return;
        }

        // Calculation
        const price = Number(data.sellingPrice || 0);
        totalRev += price;
        if (data.studentEmail) studentsSet.add(data.studentEmail);

        const assetName = data.courseTitle || "Unknown Item";
        const type = data.productType || "Course";

        if (type === "Course") {
          coursesSold++;
          courseMap[assetName] = (courseMap[assetName] || 0) + 1;
        } else if (type === "E-Book") {
          ebooksSold++;
          ebookMap[assetName] = (ebookMap[assetName] || 0) + 1;
        }

        // GRAPH MAPPING LOGIC (GLOBAL)
        const dayKey = orderDate.toLocaleDateString("en-US", {
          weekday: "short",
        });
        const monthKey = orderDate.toLocaleDateString("en-US", {
          month: "short",
        });
        const key = velocityToggle === "Weekly" ? dayKey : monthKey;
        graphMap[key] = (graphMap[key] || 0) + price;
      });

      // Update Metrics
      setRevenueData({ totalRevenue: totalRev, partnerRevenue: totalRev });
      setCourseData({ total: coursesSold, partner: coursesSold });
      setStudentData({ total: studentsSet.size, partner: studentsSet.size });

      // Update Graph (Velocity)
      const baseLabels =
        velocityToggle === "Weekly"
          ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
          : [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];

      const formattedVelocity = baseLabels.map((label) => ({
        name: label,
        sales: graphMap[label] || 0,
      }));
      setVelocityData(formattedVelocity);

      // Update Pie Charts
      const formatPieData = (map) =>
        Object.keys(map).map((key) => ({ name: key, value: map[key] }));

      setCoursePieData(formatPieData(courseMap));
      setEbookPieData(formatPieData(ebookMap));
    });

    // Listen to agencies count
    const unsubAgencies = onSnapshot(collection(db, "agencies"), (snap) => {
      setPartnersCount(snap.size);
    });

    return () => {
      unsubscribe();
      unsubAgencies();
    };
  }, [timeRange, customDates, velocityToggle]);

  return (
    <div className="space-y-8 pb-10 relative">
      {/* --- OMNI-FILTER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Admin Neural Hub
          </h2>
          <p className="text-sm text-slate-400 font-medium italic">
            Global Network Performance & Assets
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          {timeRange === "Custom" && (
            <div className="flex items-center gap-2 px-2 border-r border-slate-100 mr-2">
              <input
                type="date"
                value={customDates.start}
                onChange={(e) =>
                  setCustomDates((prev) => ({ ...prev, start: e.target.value }))
                }
                className="text-[10px] font-bold p-1 bg-slate-50 rounded outline-none text-slate-700"
              />
              <span className="text-[10px] text-slate-300 font-black">TO</span>
              <input
                type="date"
                value={customDates.end}
                onChange={(e) =>
                  setCustomDates((prev) => ({ ...prev, end: e.target.value }))
                }
                className="text-[10px] font-bold p-1 bg-slate-50 rounded outline-none text-slate-700"
              />
            </div>
          )}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-slate-950 text-white pl-10 pr-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
            >
              {[
                "All Time",
                "Today",
                "7D",
                "30D",
                "Quarter",
                "Year",
                "Custom",
              ].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* --- 1. MACRO KPI ARCHITECTURE --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MacroCard
          title="Global Revenue"
          val={
            revenueData.totalRevenue >= 100000
              ? `₹${(revenueData.totalRevenue / 100000).toFixed(1)}L`
              : `₹${revenueData.totalRevenue.toLocaleString()}`
          }
          subData={[
            { label: "Database", value: "Global" },
            { label: "Status", value: "Synced" },
          ]}
          icon={<Globe size={20} />}
          color="indigo"
        />
        <MacroCard
          title="Total Assets Sold"
          val={courseData.total.toLocaleString()}
          subData={[
            { label: "Courses", value: courseData.total },
            {
              label: "E-Books",
              value: ebookPieData.reduce((acc, curr) => acc + curr.value, 0),
            },
          ]}
          icon={<GraduationCap size={20} />}
          color="emerald"
        />

        <MacroCard
          title="Active Partners"
          val={partnersCount.toLocaleString()}
          subData={[
            { label: "Network", value: "Verified" },
            { label: "Console", value: "Active" },
          ]}
          icon={<Briefcase size={20} />}
          color="indigo"
          onClick={() => navigate("/admin/partners")}
        />

        <MacroCard
          title="Total Students"
          val={studentData.total.toLocaleString()}
          subData={[
            { label: "Active", value: studentData.total },
            { label: "Type", value: "All Partners" },
          ]}
          icon={<Users size={20} />}
          color="blue"
          onClick={() => navigate("/admin/students")}
        />
      </div>

      {/* --- 2. GLOBAL VELOCITY PERFORMANCE --- */}
      <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest">
              Global Performance
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
              Platform Velocity Overview
            </p>
          </div>
          <div className="flex p-1.5 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setVelocityToggle("Weekly")}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase ${velocityToggle === "Weekly" ? "bg-white text-slate-900 shadow-lg" : "text-slate-400"}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setVelocityToggle("Monthly")}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase ${velocityToggle === "Monthly" ? "bg-white text-slate-900 shadow-lg" : "text-slate-400"}`}
            >
              Monthly
            </button>
          </div>
        </div>
        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={velocityData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700 }}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "24px",
                  border: "none",
                  boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)",
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#6366f1"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- 3. MARKET SHARE DISTRIBUTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-10 text-center">
            Course Market Share
          </h3>
          <div className="h-[260px]">
            {coursePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coursePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {coursePieData.map((e, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 font-bold text-xs">
                No Data
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-10 text-center">
            E-Book Market Share
          </h3>
          <div className="h-[260px]">
            {ebookPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ebookPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ebookPieData.map((e, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 font-bold text-xs">
                No Data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MacroCard = ({ title, val, subData, icon, color, onClick }) => {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="bg-white p-7 rounded-[40px] border border-slate-100 shadow-sm cursor-pointer group transition-all"
    >
      <div
        className={`size-14 rounded-[20px] mb-6 flex items-center justify-center transition-all group-hover:rotate-12 ${styles[color]}`}
      >
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {title}
      </p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
        {val}
      </h3>
      <div className="mt-4 flex gap-2">
        {subData.map((item, index) => (
          <span
            key={index}
            className="text-[9px] font-black px-2.5 py-1.5 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 uppercase"
          >
            {item.label}: <span className="text-slate-900">{item.value}</span>
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default IntelligenceHub;
