import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  FileText,
  Users,
  Wallet,
  XCircle,
  BookOpen,
  TrendingUp,
  Award,
  Star,
} from "lucide-react";
import { db } from "../../firebase/config"; // Direct config for admin logic
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const SalesManager = () => {
  // State
  const [transactions, setTransactions] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [searchQuery, setSearchQuery] = useState("");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- GLOBAL DATA SYNC (ADMIN) ---
  // src/components/Admin/SalesManager.jsx mein is logic ko update karein

  useEffect(() => {
    setLoading(true);

    // 1. Pehle Agencies (Partners) ki real-time list lete hain
    const unsubAgencies = onSnapshot(
      collection(db, "agencies"),
      (agencySnap) => {
        const agencyMap = {};
        agencySnap.docs.forEach((doc) => {
          // Agency ID ko key banakar uska asli 'name' store kar lete hain
          agencyMap[doc.id] = doc.data().name || "Unnamed Academy";
        });

        // 2. Ab Orders ko listen karte hain
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const unsubOrders = onSnapshot(q, (snapshot) => {
          const formattedOrders = snapshot.docs.map((doc) => {
            const order = doc.data();
            const dateObj = order.createdAt?.toDate
              ? order.createdAt.toDate()
              : new Date();

            return {
              id: doc.id,
              student:
                order.studentName || order.studentEmail || "Unknown Student",
              asset: order.courseTitle || order.productName || "Untitled Asset",
              type:
                order.productType === "E-Book" || order.productType === "ebook"
                  ? "E-Book"
                  : "Course",
              date: dateObj.toISOString().split("T")[0],
              fullDate: dateObj,
              amount: Number(order.sellingPrice || order.price || 0),
              commission: Number(order.adminPrice || 0),
              partnerId: order.partnerId || "Direct",

              // ✨ YAHAN HAI FIX ✨
              // Agar order mein partnerId hai, toh agencyMap se uska asli naam uthao
              // Agar map mein nahi mil raha tabhi fallback use karo
              partnerName:
                order.partnerId && agencyMap[order.partnerId]
                  ? agencyMap[order.partnerId]
                  : order.agencyName ||
                    order.partnerName ||
                    "Independent Partner",

              status: order.status || "Success",
              gateway: order.paymentGateway || "Razorpay",
              invoiceId: `INV-${doc.id.slice(0, 8).toUpperCase()}`,
            };
          });

          setTransactions(formattedOrders);
          setLoading(false);
        });

        return () => unsubOrders();
      },
    );

    return () => unsubAgencies();
  }, []);

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    let data = transactions;

    // 1. Time Filter
    if (timeFilter !== "All Time") {
      const now = new Date();
      data = data.filter((t) => {
        const tDate = t.fullDate;
        if (timeFilter === "Today") {
          return tDate.toDateString() === now.toDateString();
        }
        if (timeFilter === "Week") {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return tDate >= weekAgo;
        }
        if (timeFilter === "Month") {
          return (
            tDate.getMonth() === now.getMonth() &&
            tDate.getFullYear() === now.getFullYear()
          );
        }
        if (timeFilter === "Year") {
          return tDate.getFullYear() === now.getFullYear();
        }
        if (timeFilter === "Custom" && customDates.start && customDates.end) {
          const start = new Date(customDates.start);
          const end = new Date(customDates.end);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          return tDate >= start && tDate <= end;
        }
        return true;
      });
    }

    // 2. Search Filter
    return data.filter((t) => {
      const query = searchQuery.toLowerCase();
      return (
        t.student.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query) ||
        t.asset.toLowerCase().includes(query) ||
        t.partnerName.toLowerCase().includes(query) ||
        t.partnerId.toLowerCase().includes(query)
      );
    });
  }, [transactions, timeFilter, searchQuery, customDates]);

  // Pagination Slicing
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, searchQuery, customDates]);

  // --- METRICS (GLOBAL FOCUS) ---
  const metrics = useMemo(() => {
    const totalRev = filteredData.reduce((acc, curr) => acc + curr.amount, 0);

    // 1. Calculate Top Agency
    const agencyRevenue = {};
    filteredData.forEach((t) => {
      if (t.partnerName) {
        agencyRevenue[t.partnerName] =
          (agencyRevenue[t.partnerName] || 0) + t.amount;
      }
    });
    let topAgencyName = "N/A";
    let topAgencyRev = 0;
    Object.entries(agencyRevenue).forEach(([name, rev]) => {
      if (rev > topAgencyRev) {
        topAgencyRev = rev;
        topAgencyName = name;
      }
    });

    // 2. Calculate Top Selling Course
    const courseSales = {};
    filteredData.forEach((t) => {
      if (t.type === "Course") {
        courseSales[t.asset] = (courseSales[t.asset] || 0) + 1;
      }
    });
    let topCourseName = "N/A";
    let topCourseCount = 0;
    Object.entries(courseSales).forEach(([name, count]) => {
      if (count > topCourseCount) {
        topCourseCount = count;
        topCourseName = name;
      }
    });

    return {
      totalRev,
      activePartners: new Set(filteredData.map((t) => t.partnerId)).size,
      counts: {
        courses: filteredData.filter((t) => t.type === "Course").length,
        ebooks: filteredData.filter((t) => t.type === "E-Book").length,
      },
      topAgency: {
        name: topAgencyName,
        revenue: topAgencyRev,
      },
      topCourse: {
        name: topCourseName,
        sales: topCourseCount,
      },
    };
  }, [filteredData]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-4">
          <div className="size-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs">
            Syncing Global Ledger...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* --- HEADER --- */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
              Global Sales Hub
            </h1>
            <p className="text-sm text-slate-400 font-medium italic">
              Platform-Wide Revenue Streams & Partner Splits
            </p>
          </div>

          <div className="flex items-center bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
            <Calendar size={16} className="text-slate-400 mr-3" />
            {timeFilter === "Custom" && (
              <div className="flex items-center gap-2 border-r border-slate-100 mr-3 pr-3">
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
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="appearance-none bg-transparent text-xs font-black uppercase text-slate-700 outline-none pr-8 cursor-pointer"
              >
                {["All Time", "Today", "Week", "Month", "Year", "Custom"].map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ),
                )}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* --- KPI CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            label="Total Network Volume"
            val={`₹${metrics.totalRev.toLocaleString()}`}
            color="blue"
            icon={<Banknote />}
            renderSub={() => (
              <div className="flex gap-3 mt-2">
                <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                  <BookOpen size={10} /> {metrics.counts.courses} Courses
                </span>
                <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                  <FileText size={10} /> {metrics.counts.ebooks} E-Books
                </span>
              </div>
            )}
          />

          <KPICard
            label="Top Performance Agency"
            val={
              metrics.topAgency.name.length > 15
                ? metrics.topAgency.name.slice(0, 15) + "..."
                : metrics.topAgency.name
            }
            color="indigo"
            icon={<Award />}
            renderSub={() => (
              <div className="flex gap-3 mt-2">
                <span className="text-[9px] font-bold text-indigo-500">
                  Contrib: ₹{metrics.topAgency.revenue.toLocaleString()}
                </span>
              </div>
            )}
          />

          <KPICard
            label="Verified Partners"
            val={metrics.activePartners}
            color="emerald"
            icon={<Users />}
            renderSub={() => (
              <div className="flex gap-3 mt-2">
                <span className="text-[9px] font-bold text-slate-500">
                  Global Network Reach
                </span>
              </div>
            )}
          />

          <KPICard
            label="Global Bestseller"
            val={
              metrics.topCourse.name.length > 15
                ? metrics.topCourse.name.slice(0, 15) + "..."
                : metrics.topCourse.name
            }
            color="orange"
            icon={<Star />}
            renderSub={() => (
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-[9px] font-bold text-orange-500">
                  {metrics.topCourse.sales} Units Dispatched
                </span>
              </div>
            )}
          />
        </div>

        {/* --- TRANSACTION LEDGER --- */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="size-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                <ArrowUpRight size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase">
                Platform Ledger
              </h3>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex-1 md:w-72 flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 focus-within:border-indigo-300 transition-all">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Student, Agency, ID..."
                  className="bg-transparent text-xs font-bold outline-none w-full placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button
                className="flex items-center justify-center size-10 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200 hover:scale-105 transition-all"
                title="Export Platform Data"
              >
                <Download size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Txn ID & Date</th>
                  <th className="px-8 py-5">Student & Product</th>
                  <th className="px-8 py-5">Sourcing Agency</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((t) => (
                  <tr
                    key={t.id}
                    className="group hover:bg-slate-50/50 transition-all"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px]">
                          TX
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">
                            {t.id.slice(0, 12)}...
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {t.date}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-slate-900">
                        {t.asset}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        {t.type === "E-Book" ? (
                          <FileText size={10} />
                        ) : (
                          <BookOpen size={10} />
                        )}{" "}
                        {t.student}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-indigo-600">
                          {t.partnerName}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">
                          ID: {t.partnerId.slice(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">
                            ₹{t.amount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[9px] text-emerald-500 font-bold">
                          Admin Cut: ₹{t.commission.toLocaleString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => setSelectedTxn(t)}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                        title="View Details"
                      >
                        <FileText size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-slate-50 flex justify-between items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- INVOICE MODAL --- */}
      <AnimatePresence>
        {selectedTxn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="bg-slate-900 p-8 text-white relative">
                <h3 className="text-xl font-black uppercase tracking-tight">
                  Transaction Audit
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                  {selectedTxn.invoiceId}
                </p>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="absolute top-6 right-6 p-2 bg-white/10 rounded-xl hover:bg-white/20"
                >
                  <XCircle size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Platform Revenue
                  </span>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{selectedTxn.amount}
                  </span>
                </div>
                <div className="space-y-3">
                  <InvoiceRow label="Asset Type" val={selectedTxn.type} />
                  <InvoiceRow label="Product Name" val={selectedTxn.asset} />
                  <InvoiceRow label="Purchased By" val={selectedTxn.student} />
                  <InvoiceRow label="Transaction Date" val={selectedTxn.date} />
                  <InvoiceRow
                    label="Agency Sourced"
                    val={selectedTxn.partnerName}
                  />
                  <InvoiceRow
                    label="Admin Margin"
                    val={`₹${selectedTxn.commission}`}
                    highlight="text-emerald-600"
                  />
                  <InvoiceRow
                    label="Payment Gateway"
                    val={selectedTxn.gateway}
                  />
                </div>
                <button className="w-full py-4 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  <Download size={16} /> Export Audit Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};;

// Helpers
const KPICard = ({ label, val, color, icon, renderSub }) => {
  const styles = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    indigo: "text-indigo-600 bg-indigo-50",
    orange: "text-orange-600 bg-orange-50",
  };
  return (
    <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div
        className={`size-12 rounded-2xl flex items-center justify-center mb-4 ${styles[color]}`}
      >
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <h3 className="text-2xl font-black text-slate-900 mt-1">{val}</h3>
      {renderSub && renderSub()}
    </div>
  );
};

const InvoiceRow = ({ label, val, highlight }) => (
  <div className="flex justify-between items-center">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
      {label}
    </span>
    <span className={`text-xs font-bold ${highlight || "text-slate-900"}`}>
      {val}
    </span>
  </div>
);

export default SalesManager;
