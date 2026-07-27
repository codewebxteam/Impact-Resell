import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  GraduationCap,
  BookOpen,
  UserCheck,
} from "lucide-react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
// ✨ Importing StudentProfile from components folder
import StudentProfile from "../../components/partner/StudentProfile";

const StudentIntelligence = () => {
  const { currentUser } = useAuth();
  const partnerId = currentUser?.uid;

  // --- STATE ---
  const [timeRange, setTimeRange] = useState("All Time");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const [rawOrders, setRawOrders] = useState([]);
  const [rawUsers, setRawUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);

  // ✨ Pagination set to 10
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      if (!partnerId) return;
      setLoading(true);
      try {
        // 1. Fetch orders for this partner
        const ordersQ = query(
          collection(db, "orders"),
          where("partnerId", "==", partnerId),
          orderBy("createdAt", "desc")
        );
        const ordersSnap = await getDocs(ordersQ);
        const ordersData = ordersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate
            ? doc.data().createdAt.toDate()
            : new Date(),
        }));

        // 2. Fetch users who have this partnerId (no compound index needed)
        const usersQ = query(
          collection(db, "users"),
          where("partnerId", "==", partnerId)
        );
        const usersSnap = await getDocs(usersQ);
        
        const allUsersMap = new Map();
        usersSnap.docs.forEach((doc) => {
          if (doc.data().email) {
            allUsersMap.set(doc.data().email, { id: doc.id, ...doc.data() });
          }
        });

        // 3. Fetch missing users by email from orders (chunked by 10)
        const orderEmails = [...new Set(ordersData.map(o => o.studentEmail).filter(Boolean))];
        const missingEmails = orderEmails.filter(email => !allUsersMap.has(email));
        
        const chunks = [];
        for (let i = 0; i < missingEmails.length; i += 10) {
          chunks.push(missingEmails.slice(i, i + 10));
        }

        await Promise.all(chunks.map(async (chunk) => {
          const chunkQ = query(collection(db, "users"), where("email", "in", chunk));
          const chunkSnap = await getDocs(chunkQ);
          chunkSnap.docs.forEach((doc) => {
             if (doc.data().email) {
               allUsersMap.set(doc.data().email, { id: doc.id, ...doc.data() });
             }
          });
        }));

        const usersData = Array.from(allUsersMap.values())
          .map((data) => {
            // Filter only students client-side (avoids composite index)
            if (data.role !== "student") return null;
            let userCreatedAt = data.createdAt;
            if (typeof userCreatedAt === "string") {
              userCreatedAt = new Date(userCreatedAt);
            } else if (userCreatedAt?.toDate) {
              userCreatedAt = userCreatedAt.toDate();
            } else {
              userCreatedAt = new Date();
            }
            return {
              id: data.id,
              ...data,
              createdAt: userCreatedAt,
            };
          })
          .filter(Boolean); // Remove nulls (non-student users)

        setRawOrders(ordersData);
        setRawUsers(usersData);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [partnerId]);

  // --- PROCESSED STUDENT DATA WITH ROBUST FILTERS ---
  const students = useMemo(() => {
    const studentMap = {};

    rawUsers.forEach((user) => {
      const email = user.email;
      if (!email) return;

      studentMap[email] = {
        id: `STU-${email}`,
        name: user.name || "Unknown Student",
        email: email,
        phone: user.phone || "Not Provided",
        location: user.location || "Not Provided",
        joinDate: user.createdAt,
        source: "Partner",
        partnerName: "You",
        courses: [],
        transactions: [],
        totalSpent: 0,
      };
    });

    rawOrders.forEach((order) => {
      const email = order.studentEmail;
      if (!email) return;

      if (!studentMap[email]) {
        studentMap[email] = {
          id: `STU-${email}`,
          name: order.studentName || "Unknown Student",
          email: email,
          phone: order.studentPhone || "Not Provided",
          location: "Not Provided",
          joinDate: order.createdAt,
          source: "Partner",
          partnerName: "You",
          courses: [],
          transactions: [],
          totalSpent: 0,
        };
      } else {
        if (studentMap[email].phone === "Not Provided" && order.studentPhone) {
          studentMap[email].phone = order.studentPhone;
        }
      }

      // Update Join Date to the earliest one
      if (order.createdAt < studentMap[email].joinDate) {
        studentMap[email].joinDate = order.createdAt;
      }

      // Add Course/Product
      studentMap[email].courses.push({
        name: order.courseTitle || order.productTitle || "Unknown Asset",
        type: order.productType || "Course",
      });

      // Add Transaction
      studentMap[email].transactions.push({
        id: order.id,
        asset: order.courseTitle || "Asset",
        date: order.createdAt.toLocaleDateString("en-IN"),
        amount: order.sellingPrice,
      });

      studentMap[email].totalSpent += Number(order.sellingPrice || 0);
    });

    let studentList = Object.values(studentMap);
    const now = new Date();

    // 1. Time Filter (Fixed Logic)
    studentList = studentList.filter((s) => {
      const d = new Date(s.joinDate);

      if (timeRange === "Today") {
        return d.toDateString() === now.toDateString();
      }
      if (timeRange === "7D") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0); // Include full days
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

    // 2. Search Filter
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      studentList = studentList.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerQ) ||
          s.email.toLowerCase().includes(lowerQ)
      );
    }

    return studentList.sort((a, b) => b.joinDate - a.joinDate);
  }, [rawOrders, rawUsers, timeRange, customDates, searchQuery]);

  // --- PAGINATION SLICE ---
  const currentStudents = students.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(students.length / itemsPerPage);

  // --- MACRO METRICS ---
  const metrics = useMemo(() => {
    return {
      total: students.length,
      courseLearners: students.filter((s) =>
        s.courses.some((c) => c.type === "Course")
      ).length,
      ebookReaders: students.filter((s) =>
        s.courses.some((c) => c.type === "E-Book")
      ).length,
    };
  }, [students]);

  return (
    <div className="space-y-8 pb-10">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Student Registry
          </h2>
          <p className="text-sm text-slate-400 font-medium italic">
            Manage your enrolled learners
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

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Students"
          val={metrics.total}
          icon={<Users />}
          color="indigo"
        />
        <StatCard
          label="Course Learners"
          val={metrics.courseLearners}
          icon={<GraduationCap />}
          color="blue"
        />
      </div>

      {/* --- STUDENT TABLE --- */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="size-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">
              Learner Directory
            </h3>
          </div>

          <div className="w-full sm:w-64 flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 focus-within:border-indigo-200 transition-all">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="bg-transparent text-xs font-bold outline-none w-full placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-6">Student Identity</th>
                <th className="px-8 py-6">First Seen</th>
                <th className="px-8 py-6 text-center">Library Access</th>
                <th className="px-8 py-6 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-10 text-center text-slate-400 text-xs font-bold uppercase animate-pulse"
                  >
                    Syncing Student Data...
                  </td>
                </tr>
              ) : currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm uppercase">
                          {student.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">
                            {student.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={14} />
                        <span className="text-xs font-bold">
                          {student.joinDate.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
                        {student.courses.length} Items Enrolled
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center opacity-50">
                      <Users size={32} className="text-slate-300 mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        No students found
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

// --- HELPER COMPONENT ---
const StatCard = ({ label, val, icon, color }) => {
  const themes = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all duration-500">
      <div className={`p-4 rounded-2xl w-fit mb-4 ${themes[color]}`}>
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
        {val}
      </h3>
    </div>
  );
};

export default StudentIntelligence;
