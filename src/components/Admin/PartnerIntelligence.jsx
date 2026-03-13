import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Search,
  Filter,
  Globe,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  ChevronDown,
  Award,
  FileSpreadsheet,
  Loader2,
  ShoppingBag,
  Plus,
  Mail,
  Hash,
  Trash2,
  CheckCircle,
  Clock,
  Ticket,
  Activity,
  Key,
} from "lucide-react";
import PartnerProfile from "./PartnerProfile";
import { listenToPartners } from "../../firebase/partners.service";
import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import * as XLSX from "xlsx";

const PartnerIntelligence = () => {
  // --- EXISTING STATE ---
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [activeTab, setActiveTab] = useState("ledger"); // 'ledger' or 'access'

  // Filters & Pagination
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- NEW ACCESS CONTROL STATE ---
  const [email, setEmail] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [allotLoading, setAllotLoading] = useState(false);
  const [codes, setCodes] = useState([]);
  const [codeSearch, setCodeSearch] = useState("");
  const [fetchingCodes, setFetchingCodes] = useState(false);
  const [codeStats, setCodeStats] = useState({ total: 0, used: 0, unused: 0 });

  // --- DATA FETCHING (PARTNERS) ---
  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToPartners((data) => {
      setPartners(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- DATA FETCHING (PARTNER CODES) ---
  const fetchCodes = async () => {
    setFetchingCodes(true);
    try {
      const q = query(
        collection(db, "partnerCodes"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCodes(data);
      const used = data.filter((c) => c.status === "used").length;
      setCodeStats({ total: data.length, used, unused: data.length - used });
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingCodes(false);
    }
  };

  useEffect(() => {
    if (activeTab === "access") fetchCodes();
  }, [activeTab]);

  // --- ALLOTMENT HANDLER ---
  const handleAllot = async (e) => {
    e.preventDefault();
    setAllotLoading(true);
    try {
      await addDoc(collection(db, "partnerCodes"), {
        email: email.toLowerCase().trim(),
        code: partnerCode.trim(),
        status: "unused",
        createdAt: new Date().toISOString(),
      });
      setEmail("");
      setPartnerCode("");
      fetchCodes();
    } catch (error) {
      alert("Error adding access");
    } finally {
      setAllotLoading(false);
    }
  };

  // --- EXISTING LOGIC (TIME FILTER, ELITE, LEDGER) ---
  const exportToExcel = () => {
    const exportData = filteredLedgerData.map((p) => ({
      "Partner ID": p.id,
      "Agency Name": p.agency,
      Owner: p.owner,
      Email: p.email,
      Phone: p.phone,
      Status: p.status,
      "Join Date": p.joinDate
        ? new Date(p.joinDate).toLocaleDateString("en-GB")
        : "N/A",
      "Total Units": p.sales.totalUnits,
      "Total Volume": p.financials.generated,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Partners");
    XLSX.writeFile(
      wb,
      `Partners_Report_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const timeFilteredPartners = useMemo(() => {
    if (timeFilter === "All Time") return partners;
    const now = new Date();
    return partners.filter((p) => {
      if (!p.joinDate) return false;
      const pDate = new Date(p.joinDate);
      if (timeFilter === "Today")
        return pDate.toDateString() === now.toDateString();
      if (timeFilter === "Week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return pDate >= weekAgo;
      }
      if (timeFilter === "Month")
        return (
          pDate.getMonth() === now.getMonth() &&
          pDate.getFullYear() === now.getFullYear()
        );
      if (timeFilter === "Custom" && customDates.start && customDates.end) {
        return (
          pDate >= new Date(customDates.start) &&
          pDate <= new Date(customDates.end)
        );
      }
      return true;
    });
  }, [partners, timeFilter, customDates]);

  const elitePartners = useMemo(() => {
    return [...timeFilteredPartners]
      .sort((a, b) => b.financials.generated - a.financials.generated)
      .slice(0, 5);
  }, [timeFilteredPartners]);

  const filteredLedgerData = useMemo(() => {
    return timeFilteredPartners.filter((p) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        p.agency?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [timeFilteredPartners, searchQuery, statusFilter]);

  const metrics = {
    total: timeFilteredPartners.length,
    active: timeFilteredPartners.filter((p) => p.status === "Active").length,
    totalVolume: timeFilteredPartners.reduce(
      (acc, curr) => acc + curr.financials.generated,
      0,
    ),
    avgVolume:
      timeFilteredPartners.length > 0
        ? timeFilteredPartners.reduce(
            (acc, curr) => acc + curr.financials.generated,
            0,
          ) / timeFilteredPartners.length
        : 0,
  };

  const currentItems = filteredLedgerData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredLedgerData.length / itemsPerPage);

  const filteredCodes = codes.filter(
    (c) =>
      c.email.toLowerCase().includes(codeSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(codeSearch.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-10">
          {/* HEADER */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                Partner Command Center
              </h1>
              <p className="text-sm text-slate-400 font-medium italic">
                Agency Performance & Sales Audit
              </p>
            </div>
            {/* DATE FILTER */}
            <div className="flex items-center bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
              <Calendar size={16} className="text-slate-400 mr-3" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-transparent text-xs font-black uppercase text-slate-700 outline-none pr-8 cursor-pointer"
              >
                {[
                  "All Time",
                  "Today",
                  "Week",
                  "Month",
                  "Quarter",
                  "Year",
                  "Custom",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              label="Total Agencies"
              val={metrics.total}
              sub="Registered Partners"
              icon={<Building2 />}
              color="blue"
            />
            <KPICard
              label="Active Units"
              val={metrics.active}
              sub={`${metrics.total - metrics.active} Inactive`}
              icon={<TrendingUp />}
              color="emerald"
            />
            <KPICard
              label="Total Business Volume"
              val={`₹${(metrics.totalVolume / 100000).toFixed(2)}L`}
              sub="Total Purchases"
              icon={<Globe />}
              color="indigo"
            />
            <KPICard
              label="Avg. Agency Vol."
              val={`₹${(metrics.avgVolume / 1000).toFixed(1)}k`}
              sub="Per Partner"
              icon={<ShoppingBag />}
              color="orange"
            />
          </div>

          {/* ELITE SCROLL */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Award className="text-amber-500" size={18} />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                Top Performing Agencies
              </h4>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar snap-x">
              {elitePartners.map((p, i) => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedPartner(p)}
                  className="min-w-[260px] snap-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-lg cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-amber-100">
                      Rank #{i + 1}
                    </span>
                    <div className="size-8 bg-slate-50 rounded-full flex items-center justify-center font-black text-xs">
                      {p.agency[0]}
                    </div>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    {p.agency}
                  </h4>
                  <p className="text-xl font-black text-slate-900 mt-2">
                    ₹{p.financials.generated.toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* TABS SECTION */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-50">
              <button
                onClick={() => setActiveTab("ledger")}
                className={`flex-1 py-6 font-black text-xs uppercase tracking-widest transition-all ${activeTab === "ledger" ? "text-indigo-600 bg-indigo-50/30 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Briefcase size={16} /> Agency Ledger
                </div>
              </button>
              <button
                onClick={() => setActiveTab("access")}
                className={`flex-1 py-6 font-black text-xs uppercase tracking-widest transition-all ${activeTab === "access" ? "text-[#0891b2] bg-cyan-50/30 border-b-2 border-[#0891b2]" : "text-slate-400 hover:text-slate-600"}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Key size={16} /> Access Control
                </div>
              </button>
            </div>

            {activeTab === "ledger" ? (
              /* --- LEDGER CONTENT --- */
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                  <h3 className="text-lg font-black text-slate-900 uppercase">
                    Audit Ledger
                  </h3>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-slate-50 text-[10px] font-black uppercase outline-none px-4 py-3 rounded-xl border border-slate-100"
                    >
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <div className="flex-1 md:w-64 flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
                      <Search size={16} className="text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search Agency..."
                        className="bg-transparent text-xs font-bold outline-none w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={exportToExcel}
                      className="size-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg"
                    >
                      <FileSpreadsheet size={18} />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto min-h-[400px]">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-8 py-5">Agency Identity</th>
                        <th className="px-8 py-5">Purchase Units</th>
                        <th className="px-8 py-5">Total Volume</th>
                        <th className="px-8 py-5 text-center">Status</th>
                        <th className="px-8 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {currentItems.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50/50 cursor-pointer"
                          onClick={() => setSelectedPartner(p)}
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                                {p.agency[0]}
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900">
                                  {p.agency}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                  {p.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-xs font-black text-slate-900">
                              {p.sales.totalUnits} Items
                            </p>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-xs font-black text-slate-900">
                              ₹{p.financials.generated.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${p.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase">
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* --- ACCESS CONTROL CONTENT --- */
              <div className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* ALLOTMENT FORM */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase">
                          Total
                        </p>
                        <p className="text-sm font-black text-slate-800">
                          {codeStats.total}
                        </p>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                        <p className="text-[8px] font-black text-emerald-400 uppercase">
                          Used
                        </p>
                        <p className="text-sm font-black text-emerald-600">
                          {codeStats.used}
                        </p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                        <p className="text-[8px] font-black text-amber-400 uppercase">
                          Waiting
                        </p>
                        <p className="text-sm font-black text-amber-600">
                          {codeStats.unused}
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                        <Plus className="size-4 text-[#0891b2]" /> New Partner
                        Access
                      </h3>
                      <form onSubmit={handleAllot} className="space-y-4">
                        <div className="relative">
                          <Mail className="absolute left-3 top-3.5 size-4 text-slate-300" />
                          <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                            placeholder="Partner Email"
                          />
                        </div>
                        <div className="relative">
                          <Hash className="absolute left-3 top-3.5 size-4 text-slate-300" />
                          <input
                            required
                            type="text"
                            value={partnerCode}
                            onChange={(e) => setPartnerCode(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                            placeholder="Manual Code"
                          />
                        </div>
                        <button
                          disabled={allotLoading}
                          className="w-full bg-slate-900 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all"
                        >
                          {allotLoading ? (
                            <Loader2
                              className="animate-spin mx-auto"
                              size={16}
                            />
                          ) : (
                            "Grant Access"
                          )}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* CODES TABLE */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                      <Search size={16} className="text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search access codes..."
                        className="bg-transparent text-xs font-bold outline-none w-full"
                        value={codeSearch}
                        onChange={(e) => setCodeSearch(e.target.value)}
                      />
                    </div>
                    <div className="border border-slate-50 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 font-black text-slate-400 uppercase tracking-widest text-[9px]">
                          <tr>
                            <th className="px-6 py-4">Partner</th>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredCodes.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/30">
                              <td className="px-6 py-4 font-bold text-slate-700">
                                {item.email}
                              </td>
                              <td className="px-6 py-4 font-mono font-black text-indigo-600">
                                {item.code}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${item.status === "used" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}
                                >
                                  {item.status === "used"
                                    ? "Registered"
                                    : "Waiting"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={async () => {
                                    if (confirm("Delete?")) {
                                      await deleteDoc(
                                        doc(db, "partnerCodes", item.id),
                                      );
                                      fetchCodes();
                                    }
                                  }}
                                  className="text-slate-300 hover:text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PARTNER PROFILE MODAL */}
      <AnimatePresence>
        {selectedPartner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <PartnerProfile
              partner={selectedPartner}
              onClose={() => setSelectedPartner(null)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
      <h3 className="text-2xl font-black text-slate-900 mt-1">{val}</h3>
      <p className="text-[10px] font-bold text-slate-400 mt-1">{sub}</p>
    </div>
  );
};

export default PartnerIntelligence;
