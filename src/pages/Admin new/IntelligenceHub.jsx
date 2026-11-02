import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  CreditCard,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Activity,
  Package,
  Clock,
  ChevronRight,
  ChevronDown,
  Filter,
  BookOpen,
  FileText,
  UserPlus,
  CheckCircle,
  Zap,
  Layers,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

const IntelligenceHub = () => {
  const [orders, setOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allowedResellers, setAllowedResellers] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [alifeLeads, setAlifeLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const sanitizeDate = (dateField) => {
    if (!dateField) return new Date(0);
    if (dateField.toDate) return dateField.toDate();
    const parsed = new Date(dateField);
    return isNaN(parsed.getTime()) ? new Date(0) : parsed;
  };

  // --- 1. Real-time Data Listeners ---
  useEffect(() => {
    setLoading(true);

    let currentPartnerTxns = [];
    let currentOrders = [];

    const mergeAndSetOrders = () => {
      // Get any deleted transaction IDs from storage
      const storedDeleted = (() => {
        try {
          return new Set(JSON.parse(localStorage.getItem("admin_deleted_sales_txns") || "[]"));
        } catch {
          return new Set();
        }
      })();

      // Strictly authentic live orders only (starts fresh from real transactions)
      const cleanOrders = currentOrders.filter((o) => {
        if (storedDeleted.has(o.id)) return false;
        const email = (o.studentEmail || "").toLowerCase().trim();
        if (email && (storedDeleted.has(`email_${email}_${o.price}`) || storedDeleted.has(`${email}_${o.price}`))) {
          return false;
        }
        return true;
      });

      cleanOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setOrders(cleanOrders);
    };

    // A. Listen to Orders (Live real-time)
    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
    );
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            studentName: data.studentName || data.userName || data.name || "Customer",
            studentEmail: data.studentEmail || data.userEmail || data.email || "",
            createdAt: sanitizeDate(data.createdAt || data.date),
            productName: data.productName || data.title || data.assetName || data.item || "Course Access",
            productType: (data.type || data.productType || "course").toLowerCase(),
            type: (data.type || data.productType || "course").toLowerCase(),
            price: Number(data.price) || Number(data.amount) || Number(data.saleValue) || 0,
          };
        })
        .filter((order) => {
          // Discard legacy bulk dummy seed orders (which have type 'Enrollment' and no source)
          if ((order.type === "enrollment" || order.type === "Enrollment") && !order.source) {
            return false;
          }
          const isCourseOrPartner =
            order.type === "course" ||
            order.type === "partnership" ||
            order.type === "partner" ||
            order.type === "resell_rights" ||
            order.type === "upgrade" ||
            order.productType === "course" ||
            order.productType === "partnership" ||
            order.productType === "partner" ||
            order.productType === "upgrade" ||
            order.isUpgrade;
          const hasValidSource =
            order.source === "admin_manual_grant" ||
            order.source === "admin_upgrade" ||
            order.source === "admin" ||
            order.source === "manual" ||
            order.source === "web" ||
            order.source === "razorpay" ||
            order.source === "portal";
          const isRecentOrder =
            order.createdAt &&
            order.createdAt.getTime() >= 1793170000000;

          return (isCourseOrPartner || hasValidSource) && (order.source !== undefined || isRecentOrder);
        });

      currentOrders = ordersData;
      mergeAndSetOrders();
    });

    // B. Real-time Listener for Allowed Resellers (Whitelisted Partners & Course Students)
    const unsubAllowed = onSnapshot(collection(db, "allowedResellers"), (snapshot) => {
      const allowedData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        email: (doc.data().email || doc.id).toLowerCase().trim(),
        createdAt: sanitizeDate(doc.data().allowedAt || doc.data().createdAt || doc.data().registeredAt),
      }));
      setAllowedResellers(allowedData);

      // Also rebuild partner transactions for legacy partners
      const partnerMap = new Map();
      allowedData.forEach((data) => {
        const email = data.email;
        // Strictly exclude course access students from partner transactions!
        if (data.accessType === "course" || data.isUpgraded) return;
        if (!partnerMap.has(email)) {
          partnerMap.set(email, {
            id: `PRT-${data.id.slice(0, 8).toUpperCase()}`,
            orderId: `PRT-${data.id.slice(0, 8).toUpperCase()}`,
            userId: data.id,
            studentName: data.name || email.split("@")[0],
            studentEmail: email,
            productName: "Partnership Plan (Reseller License)",
            productType: "partnership",
            type: "partnership",
            price: Number(data.feePaid) || 2499,
            createdAt: data.createdAt,
            status: "completed",
            source: "partner_onboarding",
          });
        }
      });
      currentPartnerTxns = Array.from(partnerMap.values());
      mergeAndSetOrders();
    });

    // C. Real-time Listener for Users (Students & Partners)
    const usersQuery = query(collection(db, "users"));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: sanitizeDate(doc.data().createdAt || doc.data().updatedAt || doc.data().enrolledAt),
        }))
        .filter((u) => u.role !== "admin");

      setAllUsers(usersData);
      setLoading(false);
    });

    // D. Real-time Listener for Agencies
    const agenciesQuery = query(collection(db, "agencies"));
    const unsubAgencies = onSnapshot(agenciesQuery, (snapshot) => {
      const agenciesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        email: (doc.data().email || "").toLowerCase().trim(),
        createdAt: sanitizeDate(doc.data().createdAt || doc.data().updatedAt),
      }));
      setAgencies(agenciesData);
    });

    // E. Real-time Listener for Alife Stable Leads (demo_bookings)
    const leadsQuery = query(collection(db, "demo_bookings"));
    const unsubLeads = onSnapshot(leadsQuery, (snapshot) => {
      const leads = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setAlifeLeads(leads);
    });

    return () => {
      unsubOrders();
      unsubAllowed();
      unsubUsers();
      unsubAgencies();
      unsubLeads();
    };
  }, []);

  // --- 2. Filter Logic (Shared for Orders, Users & Allowed Resellers) ---
  const { filteredOrders, filteredUsers, filteredAllowed = [] } = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    if (timeFilter === "All Time") {
      return {
        filteredOrders: orders,
        filteredUsers: allUsers,
        filteredAllowed: allowedResellers,
      };
    }

    switch (timeFilter) {
      case "Today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "7D":
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "30D":
        startDate.setDate(now.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "6M":
        startDate.setMonth(now.getMonth() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "1Y":
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "Custom":
        if (customRange.start) {
          startDate = new Date(customRange.start);
          startDate.setHours(0, 0, 0, 0);
        }
        break;
      default:
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
    }

    const filterFn = (item) => {
      const itemDate = item.createdAt;
      if (timeFilter === "Custom" && customRange.end) {
        const endDate = new Date(customRange.end);
        endDate.setHours(23, 59, 59, 999);
        return itemDate >= startDate && itemDate <= endDate;
      }
      return itemDate >= startDate;
    };

    return {
      filteredOrders: orders.filter(filterFn),
      filteredUsers: allUsers.filter(filterFn),
      filteredAllowed: allowedResellers.filter(filterFn),
    };
  }, [orders, allUsers, allowedResellers, timeFilter, customRange]);

  // --- 3. Metrics Calculation (Live Single Source of Truth) ---
  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce(
      (sum, o) => sum + (Number(o.price) || Number(o.amount) || Number(o.saleValue) || 0),
      0,
    );
    const totalOrders = filteredOrders.length;

    // A. Student Access Count
    // STRICT: Only users who CURRENTLY have active Course Access (Student Access),
    // and who have NOT been upgraded to Partner and do NOT have role === "partner"!
    const usersMap = new Map();
    allUsers.forEach((u) => {
      const email = (u.email || "").toLowerCase().trim();
      if (email) usersMap.set(email, u);
    });

    const studentEmails = new Set();

    allowedResellers.forEach((item) => {
      if (item.accessType !== "course") return;

      const email = (item.email || item.id || "").toLowerCase().trim();
      if (!email) return;

      const matchedUser = usersMap.get(email);
      const isUpgraded = Boolean(
        item.isUpgraded ||
        item.upgradedAt ||
        item.accessType === "partnership" ||
        item.role === "partner" ||
        matchedUser?.role === "partner" ||
        matchedUser?.isUpgraded ||
        matchedUser?.isReseller
      );

      if (!isUpgraded) {
        studentEmails.add(email);
      }
    });

    const studentAccessCount = studentEmails.size;

    // B. Partnership Access Count
    // Anyone granted partnership in allowedResellers (including upgraded students!),
    // plus partner users and agencies.
    const partnerEmails = new Set();

    filteredAllowed.forEach((item) => {
      if (item.accessType === "partnership" || item.isUpgraded) {
        const email = (item.email || item.id || "").toLowerCase().trim();
        if (email) partnerEmails.add(email);
      }
    });

    filteredUsers.forEach((u) => {
      if (u.role === "partner") {
        const email = (u.email || "").toLowerCase().trim();
        if (email) partnerEmails.add(email);
      }
    });

    agencies.forEach((a) => {
      const email = (a.email || "").toLowerCase().trim();
      if (email) partnerEmails.add(email);
    });

    const partnerAccessCount = partnerEmails.size;

    // C. Total Registration = Student Access + Partnership Access
    const totalRegistrations = studentAccessCount + partnerAccessCount;

    return {
      totalRevenue,
      totalOrders,
      totalRegistrations,
      studentAccessCount,
      partnerAccessCount,
    };
  }, [filteredOrders, filteredUsers, filteredAllowed, allowedResellers, allUsers, agencies]);

  // --- 4. [ENHANCED FIX] Chart Data Preparation ---
  const chartData = useMemo(() => {
    const dataMap = {};
    const now = new Date();

    // selected time range ke hisaab se days determine karna
    let daysToGenerate = 7;
    if (timeFilter === "Today") daysToGenerate = 1;
    else if (timeFilter === "7D") daysToGenerate = 7;
    else if (timeFilter === "30D") daysToGenerate = 30;
    else daysToGenerate = 14; // Default view

    // Pehle map ko 0 se bhar dena taaki koi din khali na rahe
    for (let i = 0; i < daysToGenerate; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dataMap[key] = 0;
    }

    // Backend data ko map mein merge karna
    filteredOrders.forEach((order) => {
      const dateKey = order.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (dataMap.hasOwnProperty(dateKey)) {
        dataMap[dateKey] += Number(order.price) || 0;
      }
    });

    // Dates ko chronological order mein sort karna (Puraane se naya)
    return Object.keys(dataMap)
      .map((date) => ({
        name: date,
        revenue: dataMap[date],
        timestamp: new Date(date + ", " + now.getFullYear()).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredOrders, timeFilter]);

  const recentActivity = filteredOrders.slice(0, 5);

  return (
    <div className="space-y-8 pb-10 font-sans bg-[#f8fafc]/50">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Intelligence Hub{" "}
            <Zap className="text-indigo-500 fill-indigo-500" size={28} />
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            Real-time performance analytics & sales breakdown.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <AnimatePresence>
            {timeFilter === "Custom" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xl w-full sm:w-auto"
              >
                <input
                  type="date"
                  className="text-xs font-bold bg-slate-50 p-2 rounded-xl outline-none w-full"
                  onChange={(e) =>
                    setCustomRange({ ...customRange, start: e.target.value })
                  }
                />
                <span className="text-slate-400 font-black">-</span>
                <input
                  type="date"
                  className="text-xs font-bold bg-slate-50 p-2 rounded-xl outline-none w-full"
                  onChange={(e) =>
                    setCustomRange({ ...customRange, end: e.target.value })
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative w-full sm:w-56">
            <Calendar
              className="absolute inset-y-0 left-4 my-auto text-indigo-500"
              size={18}
            />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full appearance-none bg-white border-2 border-slate-100 text-slate-700 text-sm font-black pl-12 pr-12 py-4 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer hover:bg-slate-50 transition-all"
            >
              {["Today", "7D", "30D", "6M", "1Y", "All Time", "Custom"].map(
                (range) => (
                  <option key={range} value={range}>
                    {range === "7D"
                      ? "Last 7 Days"
                      : range === "30D"
                        ? "Last 30 Days"
                        : range}
                  </option>
                ),
              )}
            </select>
            <ChevronDown
              className="absolute inset-y-0 right-4 my-auto text-slate-400 pointer-events-none"
              size={18}
            />
          </div>
        </div>
      </div>

      {/* METRICS GRID - 4 Core Admin Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`₹${metrics.totalRevenue.toLocaleString()}`}
          trend="Live Earnings"
          trendUp={true}
          icon={<DollarSign size={24} />}
          color="indigo"
          onClick={() => navigate("/admin/sales")}
          hint="Sales & Orders"
        />

        <MetricCard
          title="Total Registration"
          value={metrics.totalRegistrations}
          trend="Registered Users"
          trendUp={true}
          icon={<UserPlus size={24} />}
          color="blue"
          onClick={() => navigate("/admin/users")}
          hint="All Registered Users"
        />

        <MetricCard
          title="Partnership Access"
          value={metrics.partnerAccessCount}
          trend="Reseller Partners"
          trendUp={true}
          icon={<CheckCircle size={24} />}
          color="emerald"
          onClick={() => navigate("/admin/partners")}
          hint="Active Partners"
        />

        <MetricCard
          title="Student Access"
          value={metrics.studentAccessCount}
          trend="Enrolled Access"
          trendUp={true}
          icon={<Users size={24} />}
          color="purple"
          onClick={() => navigate("/admin/students")}
          hint="Course Enrolled"
        />
      </div>

      {/* CHARTS & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/60">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Revenue Growth
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="size-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Live View:{" "}
                  <span className="text-indigo-600 font-black">
                    {timeFilter}
                  </span>
                </p>
              </div>
            </div>
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[24px]">
              <Activity size={24} />
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 800 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 800 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "24px",
                    border: "none",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                    padding: "15px",
                  }}
                  itemStyle={{ fontWeight: "900", color: "#4f46e5" }}
                  formatter={(value) => [`₹${value}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/60 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900">Recent Pulse</h3>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase">
              <ShoppingBag size={12} /> {metrics.totalOrders} Total
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-2">
            {recentActivity.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Clock size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-bold">No pulse detected</p>
              </div>
            ) : (
              recentActivity.map((order) => {
                const isUpgrade = order.type === "upgrade" || order.productType === "upgrade" || order.isUpgrade;
                const isPartner = order.type === "partnership" || order.productType === "partnership" || order.type === "partner";

                return (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white hover:shadow-xl rounded-[24px] transition-all duration-300 border border-transparent hover:border-slate-100 group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                          isUpgrade
                            ? "bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
                            : isPartner
                            ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                            : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                        }`}
                      >
                        {isUpgrade ? (
                          <ArrowUpRight size={22} />
                        ) : isPartner ? (
                          <Package size={20} />
                        ) : order.productType === "ebook" ? (
                          <FileText size={20} />
                        ) : (
                          <BookOpen size={20} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 line-clamp-1">
                          {order.studentName || order.studentEmail || "Customer"}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                          {isUpgrade ? "UPGRADE" : isPartner ? "PARTNERSHIP" : "COURSE"} • SUCCESS
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-md font-black ${
                          isUpgrade
                            ? "text-purple-600"
                            : isPartner
                            ? "text-emerald-600"
                            : "text-indigo-600"
                        }`}
                      >
                        ₹{order.price}
                      </p>
                      <ArrowUpRight
                        size={14}
                        className="ml-auto text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
          <button
            onClick={() => navigate("/admin/sales")}
            className="mt-8 w-full py-4 bg-slate-900 text-white rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            Terminal Dashboard <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({
  title,
  value,
  trend,
  trendUp,
  icon,
  color,
  onClick,
  hint,
}) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className={`bg-white p-7 rounded-[35px] border-2 border-slate-50 shadow-xl shadow-slate-200/50 relative overflow-hidden group transition-all duration-500 ${onClick ? "cursor-pointer hover:border-indigo-100" : ""}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div
          className={`p-4 rounded-[22px] ${colors[color]} shadow-inner transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`}
        >
          {icon}
        </div>
        <div
          className={`flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1.5 rounded-full ${trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"} shadow-sm ml-2`}
        >
          {trendUp ? (
            <ArrowUpRight size={10} strokeWidth={3} />
          ) : (
            <ArrowDownRight size={10} strokeWidth={3} />
          )}
          <span className="whitespace-nowrap">{trend}</span>
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.1em] mb-2">
          {title}
        </p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
          {value}
        </h3>
      </div>
      {hint && (
        <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-indigo-100">
          {hint} <ChevronRight size={12} />
        </div>
      )}
      <div
        className={`absolute -bottom-6 -right-6 size-24 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-3xl ${colors[color].split(" ")[0]}`}
      />
    </motion.div>
  );
};

export default IntelligenceHub;
