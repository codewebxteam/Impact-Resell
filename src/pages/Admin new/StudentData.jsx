import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ChevronDown,
  Download,
  Loader2,
  Eye,
  BookOpen,
  Phone,
  Copy,
  Check,
  UserPlus,
  ShieldCheck,
  Clock,
  AlertCircle,
  Mail,
} from "lucide-react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import StudentProfile from "../../components/Admin/StudentProfile";

const StudentData = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState(null);

  const [timeFilter, setTimeFilter] = useState("All Time");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Universal Date Sanitizer
  const sanitizeDate = (dateField) => {
    if (!dateField) return new Date();
    if (dateField.toDate) return dateField.toDate();
    if (dateField.toMillis) return new Date(dateField.toMillis());
    if (dateField.seconds) return new Date(dateField.seconds * 1000 + (dateField.nanoseconds || 0) / 1000000);
    if (typeof dateField === "number") return new Date(dateField);
    const parsed = new Date(dateField);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  useEffect(() => {
    setLoading(true);
    let allowedDocs = [];
    let userDocs = [];

    const rebuildStudentList = () => {
      // 1. Build a map of all registered users by email
      const usersMap = new Map();
      userDocs.forEach((doc) => {
        const data = doc.data();
        if (data.role === "admin") return;
        const email = (data.email || "").toLowerCase().trim();
        if (email) {
          usersMap.set(email, {
            id: doc.id,
            ...data,
            createdAt: sanitizeDate(data.createdAt || data.updatedAt),
            coursesCount: Array.isArray(data.enrolledCourses)
              ? data.enrolledCourses.length
              : 0,
          });
        }
      });

      // 2. Build student list strictly from allowedResellers where accessType === "course"
      // (Only students granted access from Admin -> Partnership Access tab)
      const studentList = [];
      const processedEmails = new Set();

      allowedDocs.forEach((doc) => {
        const data = doc.data();
        // Only pick course-type access grants (Student Access)
        if (data.accessType !== "course") return;

        const email = (data.email || doc.id).toLowerCase().trim();
        if (processedEmails.has(email)) return;
        processedEmails.add(email);

        const matchedUser = usersMap.get(email);

        // Strict condition: If upgraded to partner in Partnership Access tab or has partner role,
        // REMOVE from student tab immediately!
        const isUpgraded = Boolean(
          data.isUpgraded ||
          data.upgradedAt ||
          data.accessType === "partnership" ||
          matchedUser?.role === "partner" ||
          matchedUser?.isUpgraded
        );
        if (isUpgraded) return;

        const isVerified = Boolean(matchedUser);
        const grantDate = sanitizeDate(data.allowedAt || data.registeredAt || data.createdAt);

        if (isVerified) {
          // User verified & registered on portal — show full details
          studentList.push({
            id: matchedUser.id,
            ...matchedUser,
            email: email,
            name: matchedUser.name || data.name || email.split("@")[0],
            phone: matchedUser.phone || matchedUser.whatsapp || "",
            role: "student",
            courseFeePaid: Number(data.feePaid) || Number(matchedUser.courseFeePaid) || 999,
            coursesCount: matchedUser.coursesCount || 0,
            enrolledCourses: matchedUser.enrolledCourses || [],
            createdAt: matchedUser.createdAt || grantDate,
            grantedAt: grantDate,
            verificationStatus: "verified",
            source: "admin_grant",
          });
        } else {
          // User not verified/registered yet — show pending
          studentList.push({
            id: `pending-${email}`,
            email: email,
            name: data.name || email.split("@")[0],
            phone: "",
            role: "student",
            courseFeePaid: Number(data.feePaid) || 999,
            coursesCount: 0,
            enrolledCourses: [],
            createdAt: grantDate,
            grantedAt: grantDate,
            verificationStatus: "pending",
            source: "admin_grant",
          });
        }
      });

      // Sort: Latest first
      studentList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setStudents(studentList);
      setLoading(false);
    };

    // Real-time listener for allowedResellers (Partnership Access collection)
    const unsubAllowed = onSnapshot(
      collection(db, "allowedResellers"),
      (snapshot) => {
        allowedDocs = snapshot.docs;
        rebuildStudentList();
      },
      (error) => {
        console.error("Error listening to allowedResellers in StudentData:", error);
        setLoading(false);
      }
    );

    // Real-time listener for users collection (syncs verification when user logs in/registers)
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        userDocs = snapshot.docs;
        rebuildStudentList();
      },
      (error) => {
        console.error("Error listening to users in StudentData:", error);
      }
    );

    return () => {
      unsubAllowed();
      unsubUsers();
    };
  }, []);

  // Filter Logic
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Verification Status Filter
    if (statusFilter === "Verified") {
      filtered = filtered.filter((s) => s.verificationStatus === "verified");
    } else if (statusFilter === "Pending") {
      filtered = filtered.filter((s) => s.verificationStatus === "pending");
    }

    // Time Filter Logic
    const now = new Date();
    let startDate = null;
    if (timeFilter !== "All Time") {
      startDate = new Date();
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
          startDate = customRange.start ? new Date(customRange.start) : null;
          if (startDate) startDate.setHours(0, 0, 0, 0);
          break;
        default:
          startDate = null;
      }
    }

    if (startDate) {
      filtered = filtered.filter((student) => {
        if (timeFilter === "Custom" && customRange.end) {
          const endDate = new Date(customRange.end);
          endDate.setHours(23, 59, 59, 999);
          return student.createdAt >= startDate && student.createdAt <= endDate;
        }
        return student.createdAt >= startDate;
      });
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name?.toLowerCase().includes(searchLower) ||
          student.email?.toLowerCase().includes(searchLower) ||
          student.phone?.toLowerCase().includes(searchLower) ||
          student.id?.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  }, [students, searchQuery, timeFilter, customRange, statusFilter]);

  const verifiedCount = students.filter((s) => s.verificationStatus === "verified").length;
  const pendingCount = students.filter((s) => s.verificationStatus === "pending").length;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, searchQuery, statusFilter]);

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Status,Name,Email,Phone,Role,Courses Enrolled,Fee Paid,Access Granted Date\n" +
      filteredStudents
        .map(
          (s) =>
            `${s.verificationStatus === "verified" ? "Verified" : "Pending"},\"${s.name}\",\"${s.email}\",\"${s.phone || "N/A"}\",${s.role || "student"},${s.coursesCount},₹${s.courseFeePaid || 999},${s.createdAt.toLocaleDateString()}`,
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_enrolled_students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
        <div>
          <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600">
              Student Access Management
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Student Access Management
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Track all students granted course access — verified & pending ({filteredStudents.length} total)
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/resell"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
          >
            <UserPlus size={16} /> Grant Access
          </Link>
          <button
            onClick={handleExport}
            className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 transition-all flex items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Students</p>
            <h3 className="text-2xl font-black text-slate-900">{students.length}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified & Registered</p>
            <h3 className="text-2xl font-black text-emerald-600">{verifiedCount}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Verification</p>
            <h3 className="text-2xl font-black text-amber-600">{pendingCount}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="relative w-full xl:max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, email, phone or UID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Verification Status Filter */}
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <ShieldCheck size={16} />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-10 pr-10 py-3 rounded-xl outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <option value="All Status">All Status</option>
              <option value="Verified">✅ Verified</option>
              <option value="Pending">⏳ Pending</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              <ChevronDown size={16} />
            </div>
          </div>

          <AnimatePresence>
            {timeFilter === "Custom" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <input
                  type="date"
                  className="text-xs font-bold bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                  onChange={(e) =>
                    setCustomRange({ ...customRange, start: e.target.value })
                  }
                />
                <span className="text-slate-400 font-bold">-</span>
                <input
                  type="date"
                  className="text-xs font-bold bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                  onChange={(e) =>
                    setCustomRange({ ...customRange, end: e.target.value })
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative w-full sm:w-44">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <Filter size={16} />
            </div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-10 pr-10 py-3 rounded-xl outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              {["All Time", "Today", "7D", "30D", "6M", "1Y", "Custom"].map(
                (range) => (
                  <option key={range} value={range}>
                    {range === "7D" ? "Last 7 Days" : range}
                  </option>
                ),
              )}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Verification Status
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Course Access & Fee
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Access Date
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentStudents.length > 0 ? (
                  currentStudents.map((student) => {
                    const isVerified = student.verificationStatus === "verified";

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-slate-50/80 transition-colors group ${!isVerified ? "bg-amber-50/30" : ""}`}
                      >
                        {/* Student Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm ${isVerified ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"}`}>
                              {student.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 text-sm leading-tight">
                                {student.name || "Unknown"}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">
                                {student.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Verification Status */}
                        <td className="px-6 py-4">
                          {isVerified ? (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700">
                                <ShieldCheck size={12} /> Verified & Registered
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Registration completed & verified
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700">
                                <Clock size={12} /> Pending Verification
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Course access not yet activated by user
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Course Access & Fee */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {isVerified ? (
                              <>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                  <BookOpen size={13} className="text-indigo-600" />
                                  {student.coursesCount > 0
                                    ? `${student.coursesCount} Courses Enrolled`
                                    : "Full Course Access"}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                  <span>Fee: ₹{student.courseFeePaid || 999}</span>
                                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                    Admin Enrolled
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                                  <AlertCircle size={13} />
                                  Access Granted — Not Activated
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                  <span>Fee: ₹{student.courseFeePaid || 999}</span>
                                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                    Awaiting Login
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="px-6 py-4">
                          {isVerified ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 group/copy">
                                <span className="text-sm font-medium text-slate-600">
                                  {student.email}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(student.email);
                                  }}
                                  className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-indigo-500 transition-all cursor-pointer flex items-center"
                                  title="Copy Email"
                                >
                                  {copiedText === student.email ? (
                                    <span className="text-emerald-500 flex items-center gap-1 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                      <Check size={12} /> Copied!
                                    </span>
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center gap-2 group/copy">
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                  <Phone size={10} /> {student.phone || "No Number"}
                                </span>
                                {student.phone && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(student.phone);
                                    }}
                                    className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-indigo-500 transition-all cursor-pointer flex items-center"
                                    title="Copy Phone"
                                  >
                                    {copiedText === student.phone ? (
                                      <span className="text-emerald-500 flex items-center gap-1 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                        <Check size={12} /> Copied!
                                      </span>
                                    ) : (
                                      <Copy size={12} />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Mail size={13} className="text-slate-400" />
                                <span className="text-sm font-medium text-slate-500">
                                  {student.email}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold italic">
                                Details available after registration
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Access Date */}
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="whitespace-nowrap">
                              {student.createdAt.toLocaleString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          {isVerified ? (
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className="px-4 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-2"
                            >
                              <Eye size={14} /> View
                            </button>
                          ) : (
                            <span className="px-4 py-2 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold inline-flex items-center gap-2">
                              <Clock size={14} /> Waiting
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-14 text-center text-slate-400"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="size-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <BookOpen size={28} />
                        </div>
                        <p className="text-slate-800 font-bold text-base">
                          No Students Found
                        </p>
                        <p className="text-slate-400 text-xs max-w-md">
                          Students who have been granted Course Access via the Admin Panel will appear here.
                        </p>
                        <Link
                          to="/admin/resell"
                          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          <UserPlus size={15} /> Grant Student Access
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredStudents.length)} of{" "}
              {filteredStudents.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="size-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="size-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

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

export default StudentData;
