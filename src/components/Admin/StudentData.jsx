import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Globe,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ChevronDown,
  GraduationCap,
  Zap,
  FileSpreadsheet,
  Loader2,
  Building2,
} from "lucide-react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import StudentProfile from "../partner/StudentProfile";
import * as XLSX from "xlsx";

const StudentData = () => {
  // --- STATE ---
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Filters
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- 1. FETCH REAL DATA (ADMIN GLOBAL - REALTIME) ---
  useEffect(() => {
    setLoading(true);

    // Admin panel ke liye global orders scan karna best hai student details ke liye
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const studentMap = {};

      allOrders.forEach((order) => {
        const email = order.studentEmail;
        if (!email) return;

        if (!studentMap[email]) {
          studentMap[email] = {
            id: `STU-${email}`,
            displayName: order.studentName || email.split("@")[0],
            email: email,
            partnerId: order.partnerId || "direct",
            partnerName:
              order.agencyName || order.partnerName || "Independent Partner",
            createdAt: order.createdAt, // Firebase Timestamp
            enrolledCourses: [],
            totalSpent: 0,
          };
        }

        // Mapping courses from orders
        const courseName =
          order.courseTitle || order.productName || "Unknown Asset";
        if (!studentMap[email].enrolledCourses.includes(courseName)) {
          studentMap[email].enrolledCourses.push(courseName);
        }

        studentMap[email].totalSpent += Number(order.sellingPrice || 0);
      });

      const studentList = Object.values(studentMap);
      setStudents(studentList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- EXCEL EXPORT ---
  const exportToExcel = () => {
    const exportData = filteredData.map((s) => ({
      "Student Name": s.displayName || "N/A",
      Email: s.email,
      "Partner Name": s.partnerName,
      "Partner ID": s.partnerId,
      "Courses Count": s.enrolledCourses?.length || 0,
      "Join Date": s.createdAt?.toDate
        ? s.createdAt.toDate().toLocaleDateString("en-GB")
        : "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Partner_Students");
    XLSX.writeFile(
      wb,
      `Students_Report_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // --- 2. FILTER LOGIC (FIXED FOR ALL TIME & SPECIFIC) ---
  const filteredData = useMemo(() => {
    let data = students;

    // A. Time Filter Logic
    if (timeFilter !== "All Time") {
      const now = new Date();
      data = data.filter((s) => {
        if (!s.createdAt?.toDate) return false;
        const joinDate = s.createdAt.toDate();

        if (timeFilter === "Today") {
          return joinDate.toDateString() === now.toDateString();
        }
        if (timeFilter === "Week") {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return joinDate >= weekAgo;
        }
        if (timeFilter === "Month") {
          return (
            joinDate.getMonth() === now.getMonth() &&
            joinDate.getFullYear() === now.getFullYear()
          );
        }
        if (timeFilter === "Year") {
          return joinDate.getFullYear() === now.getFullYear();
        }
        if (timeFilter === "Custom" && customDates.start && customDates.end) {
          const start = new Date(customDates.start);
          const end = new Date(customDates.end);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          return joinDate >= start && joinDate <= end;
        }
        return true;
      });
    }

    // B. Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(
        (s) =>
          (s.displayName || "").toLowerCase().includes(query) ||
          (s.email || "").toLowerCase().includes(query) ||
          (s.partnerName || "").toLowerCase().includes(query) ||
          (s.partnerId || "").toLowerCase().includes(query),
      );
    }

    return data;
  }, [students, timeFilter, searchQuery, customDates]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, searchQuery, customDates]);

  // --- METRICS ---
  const metrics = useMemo(() => {
    return {
      total: filteredData.length,
      active: filteredData.filter((s) => (s.enrolledCourses?.length || 0) > 0)
        .length,
      newThisMonth: filteredData.filter((s) => {
        if (!s.createdAt?.toDate) return false;
        const d = s.createdAt.toDate();
        const now = new Date();
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }).length,
    };
  }, [filteredData]);

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-sm font-bold text-slate-400">
              Synchronizing Registry...
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-10">
          {/* --- HEADER --- */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                Student Directory
              </h1>
              <p className="text-sm text-slate-400 font-medium italic">
                Global Network Student Acquisition
              </p>
            </div>

            {/* DATE FILTER */}
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
                  <span className="text-[9px] font-black text-slate-300">
                    TO
                  </span>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              label="Total Network Students"
              val={metrics.total.toLocaleString()}
              sub="Acquired Ecosystem"
              icon={<Users />}
              color="blue"
            />
            <KPICard
              label="Active Learners"
              val={metrics.active.toLocaleString()}
              sub="Verified Access"
              icon={<GraduationCap />}
              color="emerald"
            />
            <KPICard
              label="New Admissions"
              val={`+${metrics.newThisMonth}`}
              sub="Current Filter Period"
              icon={<Zap />}
              color="orange"
            />
          </div>

          {/* --- STUDENT TABLE --- */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="size-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                  <Globe size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase">
                  Registry Ledger
                </h3>
              </div>

              {/* SEARCH & EXPORT */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex-1 md:w-72 flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 focus-within:border-indigo-300 transition-all">
                  <Search size={16} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Student, Agency..."
                    className="bg-transparent text-xs font-bold outline-none w-full placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button
                  onClick={exportToExcel}
                  className="flex items-center justify-center size-10 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200 hover:scale-105 transition-all"
                  title="Download Report"
                >
                  <FileSpreadsheet size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-5">Student Identity</th>
                    <th className="px-8 py-5">Agency Source</th>
                    <th className="px-8 py-5">Courses</th>
                    <th className="px-8 py-5">Registry Date</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentItems.map((s) => (
                    <tr
                      key={s.id}
                      className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                      onClick={() => setSelectedStudent(s)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs uppercase">
                            {(s.displayName || "?")[0]}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900">
                              {s.displayName}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400">
                              {s.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-slate-400" />
                          <div>
                            <p className="text-xs font-bold text-indigo-600">
                              {s.partnerName}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">
                              ID: {s.partnerId?.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">
                          {s.enrolledCourses.length} Items
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-slate-500">
                          {s.createdAt?.toDate
                            ? s.createdAt.toDate().toLocaleDateString("en-GB")
                            : "N/A"}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(s);
                          }}
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase hover:bg-indigo-600 transition-all shadow-lg"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {currentItems.length === 0 && (
                <div className="p-20 text-center font-black text-slate-300">
                  NO STUDENT RECORDS FOUND
                </div>
              )}
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
      )}

      {/* --- STUDENT PROFILE MODAL --- */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <StudentProfile
              student={selectedStudent}
              onClose={() => setSelectedStudent(null)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- HELPER ---
const KPICard = ({ label, val, sub, icon, color }) => {
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
      <h3 className="text-3xl font-black text-slate-900 mt-1">{val}</h3>
      <p className="text-[10px] font-bold text-slate-400 mt-1">{sub}</p>
    </div>
  );
};

export default StudentData;
