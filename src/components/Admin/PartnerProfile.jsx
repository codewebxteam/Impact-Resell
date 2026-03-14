import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Globe,
  GraduationCap,
  CreditCard,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  History,
  ShoppingBag,
  PackageCheck,
  Calendar,
  Hash,
  CheckCircle2,
  AlertCircle,
  Power,
} from "lucide-react";
import { db } from "../../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";

const PartnerProfile = ({ partner, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Pagination Settings
  const [histPage, setHistPage] = useState(1);
  const itemsPerPage = 5;

  // --- FETCH REAL PURCHASE HISTORY FROM ORDERS ---
  useEffect(() => {
    if (!partner.id) return;

    // Admin ko is specific partner ke saare orders dekhne hain
    const q = query(
      collection(db, "orders"),
      where("partnerId", "==", partner.id),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate
          ? doc.data().createdAt.toDate().toLocaleDateString("en-IN")
          : "N/A",
        amount: Number(doc.data().sellingPrice || 0),
      }));
      setHistory(orders);
      setLoadingHistory(false);
    });

    return () => unsubscribe();
  }, [partner.id]);

  // --- TOGGLE PARTNER STATUS (ACTIVE/INACTIVE) ---
  const togglePartnerStatus = async () => {
    setIsUpdating(true);
    try {
      const newStatus = partner.status === "Active" ? "Inactive" : "Active";
      const partnerRef = doc(db, "agencies", partner.id);
      await updateDoc(partnerRef, { status: newStatus });
      setShowStatusConfirm(false);
    } catch (error) {
      console.error("Status Update Failed:", error);
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const currentHistory = history.slice(
    (histPage - 1) * itemsPerPage,
    histPage * itemsPerPage,
  );

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl relative z-50 overflow-hidden flex flex-col max-h-[90vh]"
    >
      {/* --- HEADER --- */}
      <div className="bg-slate-950 text-white p-8 sm:p-10 relative overflow-hidden flex-shrink-0">
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-8">
            <div className="size-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-white/10">
              {partner.agency?.[0]}
            </div>

            <div>
              <div className="flex items-center gap-4 mb-3">
                <h2 className="text-4xl font-black uppercase tracking-tighter">
                  {partner.agency}
                </h2>
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    partner.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}
                >
                  {partner.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-400">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <User size={14} className="text-indigo-400" />
                  <span className="text-slate-300">{partner.owner}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Mail size={14} className="text-indigo-400" />
                  <span className="text-slate-300">{partner.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Phone size={14} className="text-indigo-400" />
                  <span className="text-slate-300">{partner.phone}</span>
                </div>
                {partner.domain && (
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Globe size={14} className="text-indigo-400" />
                    <span className="text-slate-300">{partner.domain}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {/* ✨ STATUS TOGGLE BUTTON ✨ */}
            <button
              onClick={() => setShowStatusConfirm(true)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${
                partner.status === "Active"
                  ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                  : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
              }`}
            >
              <Power size={14} />{" "}
              {partner.status === "Active" ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 size-96 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />
      </div>

      {/* --- TABS --- */}
      <div className="px-10 pt-8 pb-4 bg-[#F8FAFC] border-b border-slate-100/50">
        <div className="flex gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "overview" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"}`}
          >
            <TrendingUp size={14} /> Agency Overview
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "history" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"}`}
          >
            <History size={14} /> Purchase History
          </button>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="p-10 overflow-y-auto custom-scrollbar flex-1 bg-[#F8FAFC]">
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 h-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatBox
                label="Courses Purchased"
                val={partner.sales.courses}
                icon={<GraduationCap size={20} />}
                color="blue"
                subText="Core Assets"
              />
              <StatBox
                label="E-Books Purchased"
                val={partner.sales.ebooks}
                icon={<CreditCard size={20} />}
                color="orange"
                subText="Digital Assets"
              />
              <StatBox
                label="Total Lifetime Spend"
                val={`₹${partner.financials.generated.toLocaleString()}`}
                icon={<ShoppingBag size={20} />}
                color="emerald"
                subText="Total Volume"
              />
            </div>
            <div className="h-48 rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center p-8">
              <div className="size-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-slate-300">
                <PackageCheck size={24} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Agency Status: {partner.status}
              </h3>
              <p className="text-xs text-slate-400 font-medium max-w-sm mt-2">
                Manage this agency's access and view their historical
                procurement logs in the next tab.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <ShoppingBag size={16} />
                </div>
                <h4 className="text-xs font-black text-slate-900 uppercase">
                  Order Ledger
                </h4>
              </div>
              <div className="px-4 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-500 uppercase">
                Total Orders: {history.length}
              </div>
            </div>
            <div className="overflow-x-auto min-h-[350px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th className="px-8 py-5">Order ID</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Student / Beneficiary</th>
                    <th className="px-8 py-5">Item Purchased</th>
                    <th className="px-8 py-5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loadingHistory ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-8 py-20 text-center font-bold text-slate-300 uppercase animate-pulse"
                      >
                        Syncing Ledger...
                      </td>
                    </tr>
                  ) : currentHistory.length > 0 ? (
                    currentHistory.map((txn, i) => (
                      <tr
                        key={txn.id}
                        className="group hover:bg-slate-50/80 transition-all"
                      >
                        <td className="px-8 py-5 text-xs font-black text-slate-700 font-mono">
                          #{txn.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-8 py-5 text-[10px] font-bold uppercase text-slate-500">
                          {txn.date}
                        </td>
                        <td className="px-8 py-5 text-xs font-bold text-slate-800">
                          {txn.studentName}
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase">
                            {txn.courseTitle}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right text-sm font-black text-emerald-600">
                          ₹{txn.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest"
                      >
                        No History Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="p-5 border-t border-slate-100 flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  Page {histPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setHistPage((p) => Math.max(1, p - 1))}
                    disabled={histPage === 1}
                    className="p-2 border rounded-xl disabled:opacity-50"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setHistPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={histPage === totalPages}
                    className="p-2 bg-slate-900 text-white rounded-xl disabled:opacity-50"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ✨ STATUS CONFIRMATION MODAL ✨ */}
      <AnimatePresence>
        {showStatusConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-[32px] max-w-sm w-full text-center shadow-2xl"
            >
              <div
                className={`size-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${partner.status === "Active" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"}`}
              >
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Change Account Status?
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-8">
                Are you sure you want to mark <b>{partner.agency}</b> as{" "}
                <b>{partner.status === "Active" ? "Inactive" : "Active"}</b>?
                {partner.status === "Active" &&
                  " They will lose access to the partner panel immediately."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusConfirm(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={togglePartnerStatus}
                  disabled={isUpdating}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase text-white shadow-lg ${partner.status === "Active" ? "bg-red-500 shadow-red-200" : "bg-emerald-500 shadow-emerald-200"}`}
                >
                  {isUpdating ? "Processing..." : "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const StatBox = ({ label, val, color, icon, subText }) => {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    orange: "bg-orange-50 text-orange-600 ring-orange-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  };
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`size-12 rounded-2xl flex items-center justify-center ring-4 ${styles[color]}`}
        >
          {icon}
        </div>
        <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase rounded-lg">
          {subText}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">
          {val}
        </h4>
      </div>
    </div>
  );
};

export default PartnerProfile;
