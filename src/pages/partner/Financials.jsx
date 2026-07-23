import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Filter,
  ChevronDown,
  Search,
  Banknote,
  History,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  AlertCircle,
  DollarSign,
  Calendar,
  Briefcase, // ✨ Added missing import
} from "lucide-react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

const Financials = () => {
  const { currentUser } = useAuth();
  const partnerId = currentUser?.uid;

  // --- STATE ---
  const [activeTab, setActiveTab] = useState("ledger"); // ledger only for now
  const [timeRange, setTimeRange] = useState("All Time");
  const [currentPage, setCurrentPage] = useState(1);
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✨ Configured for 10 items per page
  const itemsPerPage = 10;

  // --- FETCH ORDERS ---
  useEffect(() => {
    const fetchOrders = async () => {
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
          // Ensure timestamps are converted to Date objects
          date: doc.data().createdAt?.toDate
            ? doc.data().createdAt.toDate()
            : new Date(),
        }));
        setOrders(data);
      } catch (error) {
        console.error("Error fetching financials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [partnerId]);

  // --- FILTER LOGIC ---
  const filteredOrders = useMemo(() => {
    let data = orders;

    // 1. Time Filter
    const now = new Date();
    data = data.filter((item) => {
      const orderDate = new Date(item.date);
      if (timeRange === "Today") {
        return orderDate.toDateString() === now.toDateString();
      }
      if (timeRange === "7D") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return orderDate >= weekAgo;
      }
      if (timeRange === "Month") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeRange === "Year") {
        return orderDate.getFullYear() === now.getFullYear();
      }
      if (timeRange === "Custom" && customDates.start && customDates.end) {
        const start = new Date(customDates.start);
        const end = new Date(customDates.end);
        end.setHours(23, 59, 59, 999);
        return orderDate >= start && orderDate <= end;
      }
      return true;
    });

    // 2. Search Filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        (o) =>
          o.studentName?.toLowerCase().includes(lowerQuery) ||
          o.courseTitle?.toLowerCase().includes(lowerQuery) ||
          o.id.toLowerCase().includes(lowerQuery)
      );
    }

    return data;
  }, [orders, timeRange, customDates, searchQuery]);

  // --- METRICS CALCULATION ---
  const metrics = useMemo(() => {
    let revenue = 0; // Total Selling Price
    let cost = 0; // Total Admin Price

    filteredOrders.forEach((o) => {
      revenue += Number(o.sellingPrice || 0);
      cost += Number(o.adminPrice || 0);
    });

    return {
      revenue,
      cost,
      profit: revenue - cost,
      count: filteredOrders.length,
    };
  }, [filteredOrders]);

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 pb-10">
      {/* --- HEADER & FILTERS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Profit Ledger
          </h2>
          <p className="text-sm text-slate-400 font-medium italic">
            Track your earnings, costs, and net margins.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Custom Date Inputs */}
          {timeRange === "Custom" && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-100 shadow-sm">
              <input
                type="date"
                className="text-[10px] font-bold outline-none bg-slate-50 p-1.5 rounded-lg text-slate-600"
                onChange={(e) =>
                  setCustomDates({ ...customDates, start: e.target.value })
                }
              />
              <span className="text-[9px] font-black text-slate-300">TO</span>
              <input
                type="date"
                className="text-[10px] font-bold outline-none bg-slate-50 p-1.5 rounded-lg text-slate-600"
                onChange={(e) =>
                  setCustomDates({ ...customDates, end: e.target.value })
                }
              />
            </div>
          )}

          {/* Time Range Selector */}
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

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Revenue"
          val={`₹${metrics.revenue.toLocaleString()}`}
          sub="Gross Sales"
          icon={<Briefcase />}
          color="indigo"
        />
        <StatCard
          label="Net Profit"
          val={`₹${metrics.profit.toLocaleString()}`}
          sub="Your Earnings"
          icon={<DollarSign />}
          color="emerald"
        />
        <StatCard
          label="Total Enrollments"
          val={metrics.count}
          sub="Students"
          icon={<ShoppingBag />}
          color="blue"
        />
      </div>

      {/* --- TRANSACTIONS TABLE --- */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="size-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
              <History size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">
              Enrollment History
            </h3>
          </div>

          <div className="w-full sm:w-64 flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 focus-within:border-indigo-200 transition-all">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search student or course..."
              className="bg-transparent text-xs font-bold outline-none w-full placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-6">Date & Order ID</th>
                <th className="px-8 py-6">Student & Course</th>
                <th className="px-8 py-6 text-right">Selling Price</th>
                <th className="px-8 py-6 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-10 text-center text-slate-400 text-xs font-bold uppercase animate-pulse"
                  >
                    Loading Records...
                  </td>
                </tr>
              ) : currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <CheckCircle2 size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">
                            {order.date.toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            })}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            #{order.id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-slate-900">
                        {order.studentName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {order.courseTitle}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded">
                        ₹{Number(order.sellingPrice).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        +₹{Number(order.profit).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center opacity-50">
                      <AlertCircle size={32} className="text-slate-300 mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        No records found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 flex justify-between items-center bg-white">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- HELPER COMPONENT ---
const StatCard = ({ label, val, sub, icon, color }) => {
  const themes = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-50 text-slate-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
      <div>
        <div
          className={`size-12 rounded-[20px] flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${themes[color]}`}
        >
          {React.cloneElement(icon, { size: 22 })}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
          {val}
        </h3>
        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
          {sub}
        </p>
      </div>
    </div>
  );
};

export default Financials;
