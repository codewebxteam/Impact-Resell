import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ShoppingBag,
  BookOpen,
  GraduationCap,
  ChevronDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
} from "lucide-react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

const SalesIntelligence = () => {
  const { currentUser } = useAuth();
  const partnerId = currentUser?.uid;

  // --- STATE ---
  const [timeRange, setTimeRange] = useState("All Time");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination States (5 items per page)
  const [assetPage, setAssetPage] = useState(1);
  const [timelinePage, setTimelinePage] = useState(1);
  const assetItemsPerPage = 5;
  const timelineItemsPerPage = 5;

  // --- FETCH REAL DATA ---
  useEffect(() => {
    const fetchSalesData = async () => {
      if (!partnerId) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "orders"),
          where("partnerId", "==", partnerId),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Normalize date
          date: doc.data().createdAt?.toDate
            ? doc.data().createdAt.toDate()
            : new Date(),
          // Normalize product type (fallback to Course if missing)
          type: doc.data().productType || "Course",
        }));
        setOrders(data);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [partnerId]);

  // --- COMPUTED LOGIC ---
  const computed = useMemo(() => {
    let filtered = orders;
    const now = new Date();

    // 1. Time Filter Logic
    filtered = filtered.filter((o) => {
      const d = new Date(o.date);

      if (timeRange === "Today") {
        return d.toDateString() === now.toDateString();
      }
      if (timeRange === "7D") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        return d >= weekAgo;
      }
      if (timeRange === "Month") {
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }
      if (timeRange === "Year") {
        return d.getFullYear() === now.getFullYear();
      }
      if (timeRange === "Custom") {
        if (!customDates.start || !customDates.end) return true;
        const start = new Date(customDates.start);
        start.setHours(0, 0, 0, 0);

        const end = new Date(customDates.end);
        end.setHours(23, 59, 59, 999);

        return d >= start && d <= end;
      }
      return true;
    });

    // 2. Aggregations
    let courseRev = 0,
      ebookRev = 0,
      courseUnits = 0,
      ebookUnits = 0;
    const assetMap = {};
    const timelineMap = {};

    filtered.forEach((o) => {
      const val = Number(o.sellingPrice || 0);
      const dayKey = o.date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      // Revenue & Units
      if (o.type === "E-Book") {
        ebookRev += val;
        ebookUnits++;
      } else {
        courseRev += val;
        courseUnits++;
      }

      // Product Performance
      const title = o.courseTitle || "Untitled Product";
      if (!assetMap[title]) {
        assetMap[title] = { name: title, type: o.type, units: 0, revenue: 0 };
      }
      assetMap[title].units++;
      assetMap[title].revenue += val;

      // Sales History (Group by Day)
      if (!timelineMap[dayKey]) {
        timelineMap[dayKey] = {
          name: dayKey,
          date: o.date,
          courses: 0,
          ebooks: 0,
          total: 0,
        };
      }
      if (o.type === "E-Book") timelineMap[dayKey].ebooks += val;
      else timelineMap[dayKey].courses += val;
      timelineMap[dayKey].total += val;
    });

    // Sort & Format
    const assets = Object.values(assetMap).sort(
      (a, b) => b.revenue - a.revenue
    );

    // Sort timeline by date ascending for graph
    const timeline = Object.values(timelineMap).sort((a, b) => a.date - b.date);

    return {
      courseRev,
      ebookRev,
      courseUnits,
      ebookUnits,
      assets,
      timeline,
      filteredOrders: filtered,
    };
  }, [orders, timeRange, customDates]);

  // --- PAGINATION SLICES ---
  const currentAssets = computed.assets.slice(
    (assetPage - 1) * assetItemsPerPage,
    assetPage * assetItemsPerPage
  );

  // Orders for Table (Newest First)
  const timelineTableData = [...computed.filteredOrders].sort((a, b) => b.date - a.date);
  const currentTimeline = timelineTableData.slice(
    (timelinePage - 1) * timelineItemsPerPage,
    timelinePage * timelineItemsPerPage
  );

  return (
    <div className="space-y-8 pb-10">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Sales Intelligence
          </h2>
          <p className="text-sm text-slate-400 font-medium italic">
            Revenue Streams & Product Performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {timeRange === "Custom" && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-100 shadow-sm">
              <input
                type="date"
                className="text-[10px] font-bold outline-none bg-slate-50 p-1.5 rounded-lg"
                onChange={(e) =>
                  setCustomDates({ ...customDates, start: e.target.value })
                }
              />
              <span className="text-[9px] font-black text-slate-300">TO</span>
              <input
                type="date"
                className="text-[10px] font-bold outline-none bg-slate-50 p-1.5 rounded-lg"
                onChange={(e) =>
                  setCustomDates({ ...customDates, end: e.target.value })
                }
              />
            </div>
          )}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-slate-900 text-white pl-5 pr-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer shadow-lg hover:bg-slate-800 transition-all"
            >
              {["All Time", "Today", "7D", "Month", "Year", "Custom"].map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                )
              )}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* --- KPI GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Course Revenue"
          val={`₹${computed.courseRev.toLocaleString()}`}
          sub={`${computed.courseUnits} Units Sold`}
          icon={<GraduationCap />}
          color="indigo"
        />
        {/* E-Book Revenue card removed */}

        {/* Top Performing Assets */}
        <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Top Selling Course
            </p>
          </div>
          {computed.assets.find((a) => a.type === "Course") ? (
            <div>
              <h4 className="text-sm font-black text-slate-900 line-clamp-1">
                {computed.assets.find((a) => a.type === "Course").name}
              </h4>
              <p className="text-[10px] font-bold text-emerald-500 mt-1">
                ₹
                {computed.assets
                  .find((a) => a.type === "Course")
                  .revenue.toLocaleString()}{" "}
                Revenue
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-300 font-bold">
              No data available
            </p>
          )}
        </div>

        {/* Top Selling E-Book card removed */}
      </div>

      {/* --- CHART SECTION --- */}
      <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">
            Sales Trend
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="size-2 bg-indigo-500 rounded-full" />{" "}
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Courses
              </span>
            </div>
          </div>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={computed.timeline}>
              <defs>
                <linearGradient id="colorCourse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEbook" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="courses"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#colorCourse)"
              />
              <Area
                type="monotone"
                dataKey="ebooks"
                stroke="#f97316"
                strokeWidth={3}
                fill="url(#colorEbook)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- TABLES GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Performance Table */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
              Product Performance
            </h3>
            <ShoppingBag size={20} className="text-slate-300" />
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Product Name</th>
                  <th className="px-8 py-5 text-center">Type</th>
                  <th className="px-8 py-5 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentAssets.length > 0 ? (
                  currentAssets.map((asset, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-5">
                        <p className="text-xs font-black text-slate-800 line-clamp-1">
                          {asset.name}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400">
                          {asset.units} Units Sold
                        </p>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span
                          className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                            asset.type === "E-Book"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-indigo-50 text-indigo-600"
                          }`}
                        >
                          {asset.type}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right text-xs font-black text-slate-900">
                        ₹{asset.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="p-8 text-center text-xs text-slate-400 font-bold uppercase"
                    >
                      No assets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            current={assetPage}
            total={Math.ceil(computed.assets.length / assetItemsPerPage)}
            setPage={setAssetPage}
          />
        </div>

        {/* Sales History Table */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
            <h3 className="text-lg font-black uppercase tracking-tighter">
              Sales History
            </h3>
            <Calendar size={20} className="text-slate-500" />
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5 text-center">Course / Bundle</th>
                  <th className="px-8 py-5 text-right">Selling Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentTimeline.length > 0 ? (
                  currentTimeline.map((order, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-5 text-xs font-black text-slate-800">
                        {order.date.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          {order.courseTitle || "Untitled Course"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right text-xs font-black text-emerald-600">
                        ₹{Number(order.sellingPrice || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="p-8 text-center text-xs text-slate-400 font-bold uppercase"
                    >
                      No history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            current={timelinePage}
            total={Math.ceil(timelineTableData.length / timelineItemsPerPage)}
            setPage={setTimelinePage}
          />
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const Pagination = ({ current, total, setPage }) =>
  total > 1 ? (
    <div className="p-5 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
        Page {current} of {total}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={current === 1}
          className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => setPage((p) => Math.min(total, p + 1))}
          disabled={current === total}
          className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  ) : null;

const StatCard = ({ label, val, sub, icon, color }) => {
  const themes = {
    indigo: "bg-indigo-50 text-indigo-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all duration-500 group">
      <div
        className={`p-4 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110 ${themes[color]}`}
      >
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">
        {val}
      </h3>
      <p className="text-[10px] font-bold text-slate-300 uppercase">{sub}</p>
    </div>
  );
};

export default SalesIntelligence;
