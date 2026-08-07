import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Download,
  Globe,
  Loader2,
} from "lucide-react";
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

const StudentProfile = ({ student, onClose, onRevoke }) => {
  const [activeTab, setActiveTab] = useState("academic");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [liveUserData, setLiveUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [courses, setCourses] = useState(student?.courses || []);

  // Fetch fresh user data from Firestore 'users' collection by email
  useEffect(() => {
    const fetchUserData = async () => {
      if (!student?.email) {
        console.log("❌ [StudentProfile] No email provided");
        setLoadingUser(false);
        return;
      }
      console.log("🔍 [StudentProfile] Fetching user data for:", student.email);
      try {
        const usersQ = query(
          collection(db, "users"),
          where("email", "==", student.email)
        );
        const snap = await getDocs(usersQ);
        console.log("📦 [StudentProfile] Users found:", snap.size);
        if (!snap.empty) {
          const userData = snap.docs[0].data();
          const userId = snap.docs[0].id;
          console.log("✅ [StudentProfile] User data from Firestore:", JSON.stringify({
            name: userData.name,
            phone: userData.phone,
            location: userData.location,
            email: userData.email,
          }));
          setLiveUserData({ ...userData, id: userId });
          if (userData.courses) {
            setCourses(userData.courses);
          }
        } else {
          console.log("⚠️ [StudentProfile] No user document found for:", student.email);
        }
      } catch (err) {
        console.error("❌ [StudentProfile] Error fetching user data:", err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserData();
  }, [student?.email]);

  if (!student) return null;

  // Merge: live Firestore data takes priority over parent-passed props
  const phone = liveUserData?.phone || student.phone || "N/A";
  const studentName = liveUserData?.name || student.name || "Unknown Student";

  const handleRevoke = async (courseId) => {
    if (!window.confirm("Are you sure you want to revoke access to this course?")) return;
    
    const targetEmail = liveUserData?.email || student.email;
    if (!targetEmail) {
      alert("Cannot find student email to revoke access.");
      return;
    }

    console.log("🔴 REVOKE START — courseId:", courseId, "email:", targetEmail);

    // STEP 0: Always resolve the REAL Firestore user document ID from email
    let realUserId = liveUserData?.id;
    if (!realUserId || realUserId.startsWith("STU-")) {
      try {
        const userQ = query(collection(db, "users"), where("email", "==", targetEmail));
        const userSnap = await getDocs(userQ);
        if (!userSnap.empty) {
          realUserId = userSnap.docs[0].id;
          console.log("✅ Resolved real user ID:", realUserId);
        }
      } catch (e) {
        console.warn("Failed to resolve user ID:", e);
      }
    }

    // STEP 1: Delete from 'users' collection (courses array)
    if (realUserId) {
      try {
        const userRef = doc(db, "users", realUserId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.courses && Array.isArray(userData.courses)) {
            const filtered = userData.courses.filter(c => {
              const cId = c.id || c.courseId;
              return cId !== courseId && cId !== String(courseId);
            });
            await updateDoc(userRef, { courses: filtered });
            console.log("✅ Deleted from users.courses");
          }
        }
      } catch (e) {
        console.warn("Failed to update users collection:", e);
      }
    }

    // STEP 2: Delete from 'orders' collection (Sales History, Profit, etc.)
    try {
      const ordersQ = query(
        collection(db, "orders"),
        where("studentEmail", "==", targetEmail),
        where("courseId", "==", String(courseId))
      );
      const orderSnap = await getDocs(ordersQ);
      const deletePromises = orderSnap.docs.map(orderDoc => deleteDoc(doc(db, "orders", orderDoc.id)));
      await Promise.all(deletePromises);
      console.log(`✅ Deleted ${orderSnap.size} orders`);
    } catch (e) {
      console.warn("Failed to delete orders:", e);
    }

    // STEP 3: Delete from 'enrollments' collection (Recent Enrollments)
    if (realUserId) {
      try {
        const enrollQ = query(
          collection(db, "enrollments"),
          where("studentId", "==", realUserId),
          where("courseId", "==", String(courseId))
        );
        const enrollSnap = await getDocs(enrollQ);
        const enrollPromises = enrollSnap.docs.map(eDoc => deleteDoc(doc(db, "enrollments", eDoc.id)));
        await Promise.all(enrollPromises);
        console.log(`✅ Deleted ${enrollSnap.size} enrollments`);
      } catch (e) {
        console.warn("Failed to delete enrollments:", e);
      }
    }

    // STEP 4: Delete from 'enrolledCourses' collection (Student Dashboard)
    if (realUserId) {
      try {
        const ecRef = doc(db, "enrolledCourses", realUserId);
        const ecSnap = await getDoc(ecRef);
        if (ecSnap.exists()) {
          const ecData = ecSnap.data();
          if (ecData.courses && Array.isArray(ecData.courses)) {
            const newEcCourses = ecData.courses.filter(c => {
              const cId = c.courseId || c.id;
              return cId !== courseId && cId !== String(courseId);
            });
            await updateDoc(ecRef, { courses: newEcCourses });
            console.log("✅ Deleted from enrolledCourses");
          }
        }
      } catch (e) {
        console.warn("Failed to update enrolledCourses:", e);
      }
    }

    // Update local UI state
    const newCourses = courses.filter((c) => {
      const cId = c.id || c.courseId;
      return cId !== courseId && cId !== String(courseId);
    });
    setCourses(newCourses);

    alert("Access revoked and associated sales data removed.");
    if (onRevoke) {
      onRevoke();
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl relative z-50 overflow-hidden flex flex-col max-h-[90vh]"
    >
      {/* --- HEADER: IDENTITY & SOURCE --- */}
      <div className="bg-slate-900 text-white p-8 sm:p-10 relative overflow-hidden flex-shrink-0">
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-6">
            <div className="size-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl font-black shadow-inner border border-white/20 uppercase">
              {studentName ? studentName[0] : "U"}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  {studentName}
                </h2>
                <span
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                    student.source === "Direct"
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                  }`}
                >
                  {student.source === "Direct"
                    ? "Self Acquired"
                    : "Partner Referral"}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-slate-400">
                <span className="flex items-center gap-2 text-xs font-bold">
                  <Mail size={14} /> {student.email}
                </span>
                <span className="flex items-center gap-2 text-xs font-bold">
                  <Phone size={14} />{" "}
                  {loadingUser ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    phone
                  )}
                </span>
                {student.partnerName && (
                  <span className="flex items-center gap-2 text-xs font-bold text-orange-300">
                    <Globe size={14} /> via {student.partnerName}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all text-white"
          >
            <X size={20} />
          </button>
        </div>
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </div>

      {/* --- NAVIGATION TABS --- */}
      <div className="px-8 sm:px-10 pt-6 pb-2 bg-[#F8FAFC]">
        <div className="flex gap-1 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
          {[
            {
              id: "academic",
              label: "Academic Progress",
              icon: <GraduationCap size={14} />,
            },
            {
              id: "history",
              label: "Purchase History",
              icon: <CheckCircle2 size={14} />,
            },
            {
              id: "personal",
              label: "Personal Details",
              icon: <User size={14} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- BODY CONTENT --- */}
      <div className="p-8 sm:p-10 overflow-y-auto no-scrollbar flex-1 bg-[#F8FAFC]">
        {/* TAB 1: ACADEMIC PROGRESS */}
        {activeTab === "academic" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <StatBox
                label="Courses Enrolled"
                val={courses.length || 0}
                icon={<BookOpen size={18} />}
                color="blue"
              />
            </div>

            {/* Course List (Just Names & Type) */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">
                Enrolled Courses List
              </h4>
              {courses.length > 0 ? (
                courses.map((course, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-6">
                      <div className="size-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <GraduationCap size={24} />
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-slate-900">
                          {course.name}
                        </h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                          {course.type || "Course"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevoke(course.id)}
                      className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                    >
                      Revoke
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 font-bold">
                  No courses enrolled yet.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: PURCHASE HISTORY */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] border border-slate-100 overflow-hidden"
          >
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Asset Name</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5 text-right">Amount</th>
                  <th className="px-8 py-5 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {student.transactions?.length > 0 ? (
                  student.transactions.map((txn, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-5 text-xs font-bold text-slate-500">
                        #{txn.id ? txn.id.slice(-6) : "N/A"}
                      </td>
                      <td className="px-8 py-5 text-sm font-black text-slate-900">
                        {txn.asset}
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-500">
                        {txn.date}
                      </td>
                      <td className="px-8 py-5 text-xs font-black text-slate-900">
                        ₹{txn.amount}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => setSelectedInvoice(txn)}
                          className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200"
                        >
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-6 text-center text-xs text-slate-400 font-bold"
                    >
                      No purchase history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* TAB 3: PERSONAL DETAILS */}
        {activeTab === "personal" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <InfoCard
              label="Full Name"
              val={studentName}
              icon={<User size={16} />}
            />
            <InfoCard
              label="Email Address"
              val={student.email}
              icon={<Mail size={16} />}
            />
            <InfoCard
              label="WhatsApp Contact"
              val={loadingUser ? "Loading..." : phone}
              icon={<Phone size={16} />}
            />
            <InfoCard
              label="Enrollment Date"
              val={(() => {
                try {
                  if (!student.joinDate) return "N/A";
                  const d = student.joinDate?.toDate ? student.joinDate.toDate() : new Date(student.joinDate);
                  return isNaN(d) ? "N/A" : d.toLocaleDateString("en-GB");
                } catch { return "N/A"; }
              })()}
              icon={<Calendar size={16} />}
            />
            <InfoCard
              label="Acquisition Source"
              val={
                student.source === "Direct"
                  ? "Direct Website"
                  : `Partner: ${student.partnerName}`
              }
              icon={<Globe size={16} />}
              highlight
            />
          </motion.div>
        )}
      </div>

      {/* --- INVOICE MODAL --- */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md relative"
            >
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl"
              >
                <X size={16} />
              </button>
              <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Invoice Details</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Student Name</span>
                  <span className="text-sm font-bold text-slate-900">{studentName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Course Name</span>
                  <span className="text-sm font-bold text-slate-900 text-right max-w-[200px]">{selectedInvoice.asset}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount Paid</span>
                  <span className="text-sm font-black text-indigo-600">₹{selectedInvoice.amount}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</span>
                  <span className="text-sm font-bold text-slate-900">{selectedInvoice.date}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Helpers
const StatBox = ({ label, val, color, icon }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };
  return (
    <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
      <div
        className={`size-10 rounded-xl flex items-center justify-center ${styles[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <h4 className="text-xl font-black text-slate-900 tracking-tight">
          {val}
        </h4>
      </div>
    </div>
  );
};

const InfoCard = ({ label, val, icon, highlight }) => (
  <div
    className={`p-6 rounded-[24px] border flex items-center gap-4 ${
      highlight ? "bg-indigo-50 border-indigo-100" : "bg-white border-slate-100"
    }`}
  >
    <div className="size-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p
        className={`text-sm font-black ${
          highlight ? "text-indigo-700" : "text-slate-900"
        }`}
      >
        {val}
      </p>
    </div>
  </div>
);

export default StudentProfile;
