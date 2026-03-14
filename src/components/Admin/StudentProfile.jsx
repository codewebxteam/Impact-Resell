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
} from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const StudentProfile = ({ student, onClose }) => {
  const [activeTab, setActiveTab] = useState("academic");
  const [studentTransactions, setStudentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback for names
  const studentName = student.displayName || student.name || "Unknown Student";
  const studentEmail = student.email;

  // --- FETCH REAL-TIME DATA FOR STUDENT ---
  useEffect(() => {
    if (!studentEmail) {
      console.error("DEBUG: Student Email is missing!");
      setLoading(false);
      return;
    }

    console.log("DEBUG: Fetching orders for student:", studentEmail);

    // Query 'orders' collection by studentEmail
    const q = query(
      collection(db, "orders"),
      where("studentEmail", "==", studentEmail),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(`DEBUG: Found ${snapshot.size} orders for this student.`);

        const txns = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            date: d.createdAt?.toDate
              ? d.createdAt.toDate().toLocaleDateString("en-IN")
              : "N/A",
            amount: Number(d.sellingPrice || d.amount || 0),
            asset: d.courseTitle || d.productName || "Unknown Item",
          };
        });

        setStudentTransactions(txns);
        setLoading(false);
      },
      (error) => {
        console.error("Snapshot Error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [studentEmail]);

  // Derive unique courses from transactions
  const coursesList = useMemo(() => {
    const unique = [];
    const map = new Map();
    for (const item of studentTransactions) {
      if (!map.has(item.asset)) {
        map.set(item.asset, true);
        unique.push({
          name: item.asset,
          type: item.productType || "Course",
        });
      }
    }
    return unique;
  }, [studentTransactions]);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl relative z-50 overflow-hidden flex flex-col max-h-[90vh]"
    >
      {/* --- HEADER --- */}
      <div className="bg-slate-900 text-white p-8 sm:p-10 relative overflow-hidden flex-shrink-0">
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-6">
            <div className="size-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl font-black shadow-inner border border-white/20">
              {studentName[0]}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  {studentName}
                </h2>
                <span
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                    student.partnerId === "direct"
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                  }`}
                >
                  {student.partnerId === "direct"
                    ? "Self Acquired"
                    : "Agency Sourced"}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-slate-400">
                <span className="flex items-center gap-2 text-xs font-bold">
                  <Mail size={14} /> {studentEmail}
                </span>
                <span className="flex items-center gap-2 text-xs font-bold">
                  <Phone size={14} /> {student.phone || "N/A"}
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </div>

      {/* --- TABS --- */}
      <div className="px-8 sm:px-10 pt-6 pb-2 bg-[#F8FAFC]">
        <div className="flex gap-1 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
          {[
            {
              id: "academic",
              label: "Academic",
              icon: <GraduationCap size={14} />,
            },
            {
              id: "history",
              label: "History",
              icon: <CheckCircle2 size={14} />,
            },
            { id: "personal", label: "Details", icon: <User size={14} /> },
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

      {/* --- BODY --- */}
      <div className="p-8 sm:p-10 overflow-y-auto no-scrollbar flex-1 bg-[#F8FAFC]">
        {activeTab === "academic" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <StatBox
              label="Total Enrollments"
              val={coursesList.length}
              icon={<BookOpen size={18} />}
              color="blue"
            />
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                Enrolled Assets
              </h4>
              {coursesList.length > 0 ? (
                coursesList.map((course, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-6"
                  >
                    <div
                      className={`size-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${course.type === "E-Book" ? "bg-orange-50 text-orange-600" : "bg-indigo-50 text-indigo-600"}`}
                    >
                      <GraduationCap size={24} />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-black text-slate-900">
                        {course.name}
                      </h5>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {course.type}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-300 font-bold">
                  No Course Data Available
                </div>
              )}
            </div>
          </motion.div>
        )}

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
                  <th className="px-8 py-5">Product</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {studentTransactions.length > 0 ? (
                  studentTransactions.map((txn, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-5 text-xs font-bold text-slate-500">
                        #{txn.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-8 py-5 text-sm font-black text-slate-900">
                        {txn.asset}
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-500">
                        {txn.date}
                      </td>
                      <td className="px-8 py-5 text-xs font-black text-slate-900">
                        ₹{txn.amount.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 bg-slate-100 rounded-lg text-slate-400">
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-10 text-center text-slate-300 font-black uppercase"
                    >
                      No Transactions Synchronized
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}

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
              label="Official Email"
              val={studentEmail}
              icon={<Mail size={16} />}
            />
            <InfoCard
              label="WhatsApp Contact"
              val={student.phone || "Not Linked"}
              icon={<Phone size={16} />}
            />
            <InfoCard
              label="Acquisition"
              val={
                student.partnerId === "direct"
                  ? "Organic"
                  : `Partner: ${student.partnerName}`
              }
              icon={<Globe size={16} />}
              highlight
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const StatBox = ({ label, val, color, icon }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };
  return (
    <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 w-fit min-w-[240px]">
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
    className={`p-6 rounded-[24px] border flex items-center gap-4 ${highlight ? "bg-indigo-50 border-indigo-100" : "bg-white border-slate-100"}`}
  >
    <div className="size-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p
        className={`text-sm font-black ${highlight ? "text-indigo-700" : "text-slate-900"}`}
      >
        {val}
      </p>
    </div>
  </div>
);

export default StudentProfile;
