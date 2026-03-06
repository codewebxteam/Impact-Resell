import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { intelligenceService } from "../../services/intelligenceService";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  Timestamp,
  where,
  deleteDoc,
  doc,
  updateDoc,
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
  TrendingUp,
  Filter,
  GraduationCap,
  ArrowUpRight,
  Globe,
  Ticket,
  Plus,
  RefreshCw,
  X,
  Trash2,
  Pencil,
  Tag,
  ChevronDown,
} from "lucide-react";

// Fallback data - Partner Only
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
  const partnerId = currentUser?.uid;

  // --- MAIN STATE ---
  // Default set to "All Time" as requested
  const [timeRange, setTimeRange] = useState("All Time");
  const [velocityToggle, setVelocityToggle] = useState("Weekly");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });

  // --- COUPON INTELLIGENCE STATE ---
  const [coupons, setCoupons] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [value, setValue] = useState("");
  const [limit, setLimit] = useState("");
  const [expiry, setExpiry] = useState("");

  // --- ANALYTICS STATES (Populated directly from DB now) ---
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

  // 1. Fetch Real-time Orders & Calculate Distributions
  useEffect(() => {
    if (!partnerId) return;

    // Listen to ORDERS for this Partner
    const q = query(
      collection(db, "orders"),
      where("partnerId", "==", partnerId),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalRev = 0;
      let coursesSold = 0;
      let ebooksSold = 0;
      const studentsSet = new Set();

      const courseMap = {};
      const ebookMap = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();

        // Time Filtering Logic
        if (timeRange !== "All Time") {
          const orderDate = data.createdAt?.toDate?.() || new Date();
          const now = new Date();
          let isWithinRange = true;

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

        totalRev += Number(data.amount || data.price || 0);

        if (data.studentId || data.userId)
          studentsSet.add(data.studentId || data.userId);

        // Distributions Logic
        const assetName =
          data.courseTitle ||
          data.ebookTitle ||
          data.assetName ||
          "Unknown Item";
        const type = data.type || "course";

        if (type === "course") {
          coursesSold++;
          courseMap[assetName] = (courseMap[assetName] || 0) + 1;
        } else if (type === "ebook") {
          ebooksSold++;
          ebookMap[assetName] = (ebookMap[assetName] || 0) + 1;
        }
      });

      // Update Macro Stats
      setRevenueData({ totalRevenue: totalRev, partnerRevenue: totalRev });
      setCourseData({ total: coursesSold, partner: coursesSold });
      setStudentData({ total: studentsSet.size, partner: studentsSet.size });

      // Update Pie Charts
      const formatPieData = (map) =>
        Object.keys(map).map((key) => ({ name: key, value: map[key] }));

      setCoursePieData(formatPieData(courseMap));
      setEbookPieData(formatPieData(ebookMap));
    });

    return () => unsubscribe();
  }, [partnerId, timeRange, customDates]);

  // 2. Fetch Velocity Data
  useEffect(() => {
    intelligenceService
      .getRevenueVelocity(velocityToggle, timeRange, customDates)
      .then((velocity) => {
        if (velocity.length > 0) {
          const partnerOnlyVelocity = velocity.map((v) => ({
            name: v.name,
            sales: v.partner || v.sales || 0,
          }));
          setVelocityData(partnerOnlyVelocity);
        } else {
          setVelocityData(
            velocityToggle === "Weekly" ? FALLBACK_WEEKLY : FALLBACK_MONTHLY,
          );
        }
      })
      .catch(() =>
        setVelocityData(
          velocityToggle === "Weekly" ? FALLBACK_WEEKLY : FALLBACK_MONTHLY,
        ),
      );
  }, [timeRange, velocityToggle, customDates]);

  // 3. Fetch Real-time Coupon Data & Redemptions
  useEffect(() => {
    if (!partnerId) return;

    // Listen for Coupons
    const couponRef = query(
      collection(db, "coupons"),
      where("partnerId", "==", partnerId),
      orderBy("createdAt", "desc"),
    );

    const unsubCoupons = onSnapshot(couponRef, (snap) => {
      const now = new Date();
      const raw = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          status: data.expiry?.toDate?.() < now ? "Expired" : "Active",
        };
      });
      setCoupons(raw);
    });

    // Listen for Redemptions (Functional Audit Log)
    const redemptionRef = query(
      collection(db, "couponRedemptions"),
      where("partnerId", "==", partnerId),
      orderBy("createdAt", "desc"),
    );

    const unsubRedemptions = onSnapshot(redemptionRef, (snap) => {
      const rawRedemptions = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRedemptions(rawRedemptions);
    });

    return () => {
      unsubCoupons();
      unsubRedemptions();
    };
  }, [partnerId]);

  // --- HANDLERS ---

  // Coupon Handlers
  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++)
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    setCouponCode(result);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponCode(coupon.code);
    setDiscountType(coupon.type === "Percentage" ? "percentage" : "flat");
    setValue(coupon.value);
    setLimit(coupon.limit);
    setExpiry(coupon.expiry?.toDate?.().toISOString().split("T")[0]);
    setShowCreateModal(true);
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteDoc(doc(db, "coupons", couponId));
    } catch (err) {
      console.error("Error deleting coupon:", err);
    }
  };

  const handleCreateCoupon = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      if (!currentUser || !partnerId) return;
      if (!couponCode || !value || !limit || !expiry) {
        alert("Please fill all fields");
        return;
      }

      const payload = {
        partnerId,
        code: couponCode.toUpperCase(),
        type: discountType === "percentage" ? "Percentage" : "Flat",
        value: Number(value),
        limit: Number(limit),
        expiry: Timestamp.fromDate(new Date(expiry)),
      };

      if (editingCoupon) {
        await updateDoc(doc(db, "coupons", editingCoupon.id), payload);
      } else {
        await addDoc(collection(db, "coupons"), {
          ...payload,
          used: 0,
          status: "Active",
          createdAt: Timestamp.now(),
        });
      }

      setShowCreateModal(false);
      setEditingCoupon(null);
      setCouponCode("");
      setValue("");
      setLimit("");
      setExpiry("");
    } catch (error) {
      console.error("Error saving coupon:", error);
      alert("Failed to save coupon");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (ts) =>
    ts?.toDate?.().toLocaleDateString("en-IN") || "N/A";

  return (
    <div className="space-y-8 pb-10 relative">
      {/* --- OMNI-FILTER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Intelligence Neural Hub
          </h2>
          <p className="text-sm text-slate-400 font-medium italic">
            Partner Performance & Analytics
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
              {/* Added "All Time" to selection */}
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
          title="Total Revenue"
          val={
            revenueData.totalRevenue >= 100000
              ? `₹${(revenueData.totalRevenue / 100000).toFixed(1)}L`
              : `₹${revenueData.totalRevenue.toLocaleString()}`
          }
          subData={[
            { label: "Partner Sales", value: "100%" },
            { label: "Status", value: "Verified" },
          ]}
          icon={<Globe size={20} />}
          color="indigo"
        />
        <MacroCard
          title="Acquisitions"
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

        {/* ACTIVE CAMPAIGNS CARD */}
        <div
          onClick={() => {
            setEditingCoupon(null);
            setCouponCode("");
            setValue("");
            setLimit("");
            setExpiry("");
            setShowCreateModal(true);
          }}
          className="bg-slate-950 p-7 rounded-[40px] border border-slate-900 shadow-xl cursor-pointer group transition-all hover:scale-[1.02] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-all group-hover:rotate-12 transform">
            <Ticket size={100} className="text-white" />
          </div>
          <div className="size-14 bg-white/10 rounded-[20px] mb-6 flex items-center justify-center text-white backdrop-blur-md">
            <Ticket size={24} />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Active Campaigns
              </p>
              <h3 className="text-3xl font-black text-white tracking-tighter">
                {coupons.filter((c) => c.status === "Active").length}
              </h3>
            </div>
            <div className="size-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg animate-pulse">
              <Plus size={16} />
            </div>
          </div>
          <div className="mt-4 flex gap-2 relative z-10">
            <span className="text-[9px] font-black px-2.5 py-1.5 bg-white/10 text-slate-300 rounded-xl border border-white/5 uppercase tracking-tighter">
              Redeemed: {redemptions.length}
            </span>
          </div>
        </div>

        <MacroCard
          title="Students"
          val={studentData.total.toLocaleString()}
          subData={[
            { label: "Active", value: studentData.total },
            { label: "Type", value: "Partner" },
          ]}
          icon={<Users size={20} />}
          color="blue"
        />
      </div>

      {/* --- 2 & 3. VELOCITY & COUPON MONITOR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-black uppercase tracking-widest">
                Partner Performance
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                Sales Velocity Overview
              </p>
            </div>
            <div className="flex p-1.5 bg-slate-100 rounded-2xl">
              <button
                onClick={() => setVelocityToggle("Weekly")}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                  velocityToggle === "Weekly"
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-slate-400"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setVelocityToggle("Monthly")}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                  velocityToggle === "Monthly"
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-slate-400"
                }`}
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

        {/* COUPON MONITOR */}
        <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              Live Coupon Monitor
            </h3>
            <button
              onClick={() => navigate("/partner/coupon-intelligence")}
              className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
            >
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {coupons.length > 0 ? (
              coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="group p-4 bg-slate-50 rounded-[24px] border border-slate-100 hover:border-indigo-200 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                        {coupon.code}
                      </span>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                        {coupon.type === "Percentage"
                          ? `${coupon.value}% OFF`
                          : `₹${coupon.value} OFF`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditCoupon(coupon)}
                        className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full ${
                        coupon.status === "Expired"
                          ? "bg-red-400"
                          : "bg-indigo-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          (coupon.used / coupon.limit) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                    <span>
                      {coupon.used} / {coupon.limit} Used
                    </span>
                    <span
                      className={
                        coupon.status === "Expired"
                          ? "text-red-500"
                          : "text-emerald-500"
                      }
                    >
                      {coupon.status === "Expired"
                        ? "Expired"
                        : `Exp: ${formatDate(coupon.expiry)}`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[24px]">
                <Ticket size={24} className="mb-2 opacity-50" />
                <span className="text-[10px] font-black uppercase">
                  No Active Coupons
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- 4 & 5. REDEMPTION AUDIT & SALES DISTRIBUTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REDEMPTION AUDIT (FUNCTIONAL) */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black uppercase tracking-widest">
              Redemption Audit
            </h3>
            <Tag className="text-emerald-500" size={20} />
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {redemptions.length > 0 ? (
              redemptions.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-[24px] border border-slate-100"
                >
                  <div className="mt-1 text-emerald-500 bg-emerald-50 p-2 rounded-xl">
                    <TrendingUp size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-800">
                      {r.studentName || "Student"}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                      Used{" "}
                      <span className="text-indigo-500">{r.couponCode}</span> on{" "}
                      {r.purchasedItem?.split(" ").slice(0, 2).join(" ")}...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">
                      -₹{r.discountValue}
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">
                      {formatDate(r.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-xs text-slate-400 font-bold">
                  No redemptions yet
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/partner/coupon-intelligence")}
            className="w-full mt-6 py-3 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            View Full Log
          </button>
        </div>

        {/* E-Book Sales (FUNCTIONAL) */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-10 text-center">
            E-Book Distribution
          </h3>
          <div className="h-[200px]">
            {ebookPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ebookPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ebookPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Legend
                    iconSize={8}
                    wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 font-bold text-xs">
                No E-Book Sales Yet
              </div>
            )}
          </div>
        </div>

        {/* Course Sales (FUNCTIONAL) */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-10 text-center">
            Course Distribution
          </h3>
          <div className="h-[200px]">
            {coursePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coursePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {coursePieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Legend
                    iconSize={8}
                    wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 font-bold text-xs">
                No Course Sales Yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- CREATE COUPON MODAL --- */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>

              <h3 className="text-2xl font-black text-slate-900 mb-1">
                {editingCoupon ? "Edit Campaign" : "New Campaign"}
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Create a high-conversion discount strategy.
              </p>

              <div className="space-y-5">
                {/* Code Input */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                    Campaign Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      placeholder="SUMMER2025"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all uppercase placeholder:text-slate-300"
                    />
                    <button
                      onClick={generateRandomCode}
                      className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors"
                      title="Generate Random Code"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>

                {/* Type & Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                      Discount Type
                    </label>
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                      <button
                        onClick={() => setDiscountType("percentage")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                          discountType === "percentage"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-400"
                        }`}
                      >
                        % Off
                      </button>
                      <button
                        onClick={() => setDiscountType("flat")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                          discountType === "flat"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-400"
                        }`}
                      >
                        Flat ₹
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                      Value
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={discountType === "percentage" ? "20" : "500"}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Limit & Expiry */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      placeholder="100"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreateCoupon}
                  disabled={isSaving}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-indigo-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving
                    ? "Processing..."
                    : editingCoupon
                      ? "Update Campaign"
                      : "Launch Campaign"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MICRO-COMPONENTS ---
const MacroCard = ({ title, val, subData, icon, color, onClick }) => {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
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
            className="text-[9px] font-black px-2.5 py-1.5 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 uppercase tracking-tighter"
          >
            {item.label}: <span className="text-slate-900">{item.value}</span>
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default IntelligenceHub;
