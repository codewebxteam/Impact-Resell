import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  X,
  ChevronDown,
  Calendar,
  Eye,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
  Copy,
  Check,
  Users,
  Handshake,
  ArrowUpRight,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { collection, onSnapshot, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { listenToAllOrders } from "../../firebase/orders.service";

const SalesManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTxn, setSelectedTxn] = useState(null);

  // Selection & Deletion State
  const [selectedTxnIds, setSelectedTxnIds] = useState(new Set());
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    txnsToDelete: [],
    isDeleting: false,
  });
  const [toastMessage, setToastMessage] = useState(null);

  // Stored deleted IDs helper (guarantees deleted records never reappear)
  const getStoredDeletedIds = () => {
    try {
      return new Set(JSON.parse(localStorage.getItem("admin_deleted_sales_txns") || "[]"));
    } catch {
      return new Set();
    }
  };

  // Filters State
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [typeFilter, setTypeFilter] = useState("All"); // All | Course | Partnership
  const [copiedText, setCopiedText] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- 1. Real-time Listeners (Orders + Partners) ---
  useEffect(() => {
    setLoading(true);

    let currentPartnerTxns = [];
    let currentOrders = [];

    const sanitizeDate = (dateField) => {
      if (!dateField) return new Date(0);
      if (dateField.toDate) return dateField.toDate();
      const parsed = new Date(dateField);
      return isNaN(parsed.getTime()) ? new Date(0) : parsed;
    };

    const mergeAndSetTransactions = () => {
      const combined = [...currentPartnerTxns];

      currentOrders.forEach((newOrder) => {
        const email = (newOrder.studentEmail || "").toLowerCase();
        const isUpgrade = newOrder.type === "upgrade" || newOrder.productType === "upgrade" || newOrder.isUpgrade;

        // Upgrade transactions are distinct remaining-balance payments and should NEVER be merged into previous orders!
        const existingIdx = !isUpgrade
          ? combined.findIndex(
              (t) =>
                t.id === newOrder.id ||
                (email &&
                  t.studentEmail?.toLowerCase() === email &&
                  (newOrder.type === "partnership" || newOrder.type === "partner") &&
                  !t.isUpgrade),
            )
          : -1;

        if (existingIdx !== -1) {
          combined[existingIdx] = {
            ...combined[existingIdx],
            ...newOrder,
            price: Number(newOrder.price) || combined[existingIdx].price,
            createdAt: newOrder.createdAt || combined[existingIdx].createdAt,
          };
        } else {
          combined.push(newOrder);
        }
      });

      // Filter out deleted transactions
      const storedDeleted = getStoredDeletedIds();
      const validTxns = combined.filter((t) => {
        if (storedDeleted.has(t.id)) return false;
        const email = (t.studentEmail || "").toLowerCase().trim();
        if (email && (storedDeleted.has(`email_${email}_${t.price}`) || storedDeleted.has(`${email}_${t.price}`))) {
          return false;
        }
        return true;
      });

      // Sort descending by date (latest first)
      validTxns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setTransactions(validTxns);
      setLoading(false);
    };

    // 1. Fetch & Build Partner Transactions from Agencies, Users, AllowedResellers
    const loadPartners = async () => {
      try {
        const [usersSnap, agenciesSnap, allowedSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "agencies")),
          getDocs(collection(db, "allowedResellers")),
        ]);

        const partnerMap = new Map();

        // A. From Agencies
        agenciesSnap.docs.forEach((d) => {
          const data = d.data();
          const email = (data.email || "").toLowerCase();
          partnerMap.set(email || d.id, {
            id: `PRT-${d.id.slice(0, 8).toUpperCase()}`,
            orderId: `PRT-${d.id.slice(0, 8).toUpperCase()}`,
            userId: d.id,
            studentName: data.ownerName || data.name || "Partner",
            studentEmail: data.email || "",
            productName: "Partnership Plan (Reseller License)",
            productType: "partnership",
            type: "partnership",
            price: Number(data.partnershipFeePaid) || 2499,
            createdAt: sanitizeDate(data.createdAt || data.updatedAt),
            status: "completed",
            source: "partner_onboarding",
          });
        });

        // B. From Users (role === 'partner' or isReseller)
        usersSnap.docs.forEach((d) => {
          const data = d.data();
          // Upgraded users already have Course (999) + Upgrade (1500) orders in orders collection — skip synthetic transaction
          if (data.isUpgraded || data.previousRole === "student") return;
          if (data.role === "partner" || data.isReseller === true || data.resellerStatus === "approved") {
            const email = (data.email || "").toLowerCase();
            const existing = partnerMap.get(email) || partnerMap.get(d.id);
            partnerMap.set(email || d.id, {
              id: existing?.id || `PRT-${d.id.slice(0, 8).toUpperCase()}`,
              orderId: existing?.orderId || `PRT-${d.id.slice(0, 8).toUpperCase()}`,
              userId: d.id,
              studentName: data.name || existing?.studentName || "Partner",
              studentEmail: data.email || existing?.studentEmail || "",
              productName: "Partnership Plan (Reseller License)",
              productType: "partnership",
              type: "partnership",
              price: Number(data.partnershipFeePaid) || Number(existing?.price) || 2499,
              createdAt: sanitizeDate(data.createdAt || data.enrolledAt || existing?.createdAt),
              status: "completed",
              source: "partner_onboarding",
            });
          }
        });

        // C. From AllowedResellers (Partnership ONLY — NEVER pure course students, and not upgraded as order already records them!)
        allowedSnap.docs.forEach((d) => {
          const data = d.data();
          const email = (data.email || d.id).toLowerCase();
          if (data.accessType === "course" || data.isUpgraded) return;
          if (!partnerMap.has(email)) {
            partnerMap.set(email, {
              id: `PRT-${d.id.slice(0, 8).toUpperCase()}`,
              orderId: `PRT-${d.id.slice(0, 8).toUpperCase()}`,
              userId: d.id,
              studentName: data.name || email.split("@")[0],
              studentEmail: email,
              productName: "Partnership Plan (Reseller License)",
              productType: "partnership",
              type: "partnership",
              price: Number(data.feePaid) || 2499,
              createdAt: sanitizeDate(data.allowedAt || data.registeredAt),
              status: "completed",
              source: "partner_onboarding",
            });
          }
        });

        currentPartnerTxns = Array.from(partnerMap.values());
        mergeAndSetTransactions();
      } catch (err) {
        console.error("Error loading partners for sales:", err);
      }
    };

    loadPartners();

    // 2. Real-time listener for allowedResellers (new partners appear live)
    const unsubAllowed = onSnapshot(collection(db, "allowedResellers"), (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const d = change.doc;
          const data = d.data();
          const email = (data.email || d.id).toLowerCase();
          if (data.accessType === "course" || data.isUpgraded) return;
          const exists = currentPartnerTxns.some(
            (p) => p.studentEmail?.toLowerCase() === email || p.userId === d.id,
          );
          if (!exists) {
            currentPartnerTxns.push({
              id: `PRT-${d.id.slice(0, 8).toUpperCase()}`,
              orderId: `PRT-${d.id.slice(0, 8).toUpperCase()}`,
              userId: d.id,
              studentName: data.name || email.split("@")[0],
              studentEmail: email,
              productName: "Partnership Plan (Reseller License)",
              productType: "partnership",
              type: "partnership",
              price: Number(data.feePaid) || 2499,
              createdAt: sanitizeDate(data.allowedAt || data.registeredAt || new Date()),
              status: "completed",
              source: "partner_onboarding",
            });
            mergeAndSetTransactions();
          }
        }
      });
    });

    // 3. Real-time listener for Orders (Course & Partnership live sales)
    const unsubOrders = listenToAllOrders((orders) => {
      const formatted = orders
        .map((order) => ({
          ...order,
          studentName: order.studentName || order.userName || order.name || "Customer",
          studentEmail: order.studentEmail || order.userEmail || order.email || "",
          createdAt: sanitizeDate(order.createdAt || order.date),
          productName: order.productName || order.title || order.assetName || order.item || "Course Access",
          productType: (order.type || order.productType || "course").toLowerCase(),
          type: (order.type || order.productType || "course").toLowerCase(),
          price: Number(order.price) || Number(order.amount) || Number(order.saleValue) || 0,
        }))
        .filter((order) => {
          // Discard legacy bulk dummy seed orders (which have type 'Enrollment' and no source)
          if ((order.type === "enrollment" || order.type === "Enrollment") && !order.source) {
            return false;
          }
          const isCourseOrPartner =
            order.type === "course" ||
            order.type === "partnership" ||
            order.type === "partner" ||
            order.type === "resell_rights" ||
            order.type === "upgrade" ||
            order.productType === "course" ||
            order.productType === "partnership" ||
            order.productType === "partner" ||
            order.productType === "upgrade" ||
            order.isUpgrade;
          const hasValidSource =
            order.source === "admin_manual_grant" ||
            order.source === "admin_upgrade" ||
            order.source === "admin" ||
            order.source === "manual" ||
            order.source === "web" ||
            order.source === "razorpay" ||
            order.source === "portal";
          const isRecentOrder =
            order.createdAt &&
            order.createdAt.getTime() >= 1793170000000;

          return (isCourseOrPartner || hasValidSource) && (order.source !== undefined || isRecentOrder);
        });

      // Deduplicate orders
      const uniqueOrders = [];
      const seen = new Set();
      formatted.forEach((txn) => {
        const itemKey = txn.courseId || txn.productName || txn.type;
        const key = txn.id ? txn.id : `${txn.userId || txn.studentEmail}_${itemKey}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueOrders.push(txn);
        }
      });

      currentOrders = uniqueOrders;
      mergeAndSetTransactions();
    });

    return () => {
      unsubAllowed();
      unsubOrders();
    };
  }, []);

  // --- 2. Filter Logic (Date + Type + Search) ---
  const filteredData = useMemo(() => {
    let data = transactions;

    // A. Date Filter
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
          break;
        case "30D":
          startDate.setDate(now.getDate() - 30);
          break;
        case "6M":
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "1Y":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case "Custom":
          startDate = customRange.start ? new Date(customRange.start) : null;
          break;
        default:
          startDate = null;
      }
    }

    if (startDate) {
      data = data.filter((txn) => {
        if (timeFilter === "Custom" && customRange.end) {
          const endDate = new Date(customRange.end);
          endDate.setHours(23, 59, 59, 999);
          return txn.createdAt >= startDate && txn.createdAt <= endDate;
        }
        return txn.createdAt >= startDate;
      });
    }

    // B. Type Filter (Course / Partnership / Upgrade)
    if (typeFilter !== "All") {
      data = data.filter((txn) => {
        const itemType = (txn.type || txn.productType || "").toLowerCase();
        if (typeFilter === "Course") {
          return itemType === "course" && !txn.isUpgrade && txn.type !== "upgrade";
        }
        if (typeFilter === "Partnership") {
          return (
            itemType === "partnership" ||
            itemType === "partner" ||
            itemType === "resell_rights" ||
            itemType === "upgrade" ||
            txn.isUpgrade
          );
        }
        if (typeFilter === "Upgrade") {
          return itemType === "upgrade" || txn.isUpgrade;
        }
        return true;
      });
    }

    // C. Search Filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        (txn) =>
          txn.studentName?.toLowerCase().includes(lowerQuery) ||
          txn.studentEmail?.toLowerCase().includes(lowerQuery) ||
          txn.productName?.toLowerCase().includes(lowerQuery) ||
          txn.id?.toLowerCase().includes(lowerQuery),
      );
    }

    return data;
  }, [transactions, searchQuery, timeFilter, customRange, typeFilter]);

  // --- 3. Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, searchQuery, typeFilter]);

  // --- 4. KPI Calculations ---
  const totalRevenue = filteredData.reduce(
    (sum, t) => sum + (Number(t.price) || 0),
    0,
  );
  const totalSales = filteredData.length;

  // Partnership & Student Unit Counts
  const partnershipUnits = filteredData.filter(
    (t) =>
      t.productType === "partnership" ||
      t.type === "partnership" ||
      t.type === "upgrade" ||
      t.productType === "upgrade" ||
      t.isUpgrade,
  ).length;
  const studentUnits = filteredData.filter(
    (t) =>
      (t.productType === "course" || t.type === "course") &&
      !t.isUpgrade &&
      t.type !== "upgrade",
  ).length;

  // CSV Export
  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Transaction ID,Student,Product,Type,Amount,Status\n" +
      filteredData
        .map(
          (e) =>
            `${e.createdAt.toLocaleDateString()},${e.id},${e.studentName},${e.productName},${e.productType},${e.price},Paid`,
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${timeFilter}.csv`);
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

  // --- Selection Logic ---
  const handleToggleSelect = (id) => {
    setSelectedTxnIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const visibleIds = currentItems.map((t) => t.id);
  const isAllVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedTxnIds.has(id));
  const isSomeVisibleSelected = visibleIds.some((id) => selectedTxnIds.has(id));

  const handleSelectAllVisible = () => {
    setSelectedTxnIds((prev) => {
      const next = new Set(prev);
      if (isAllVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const selectedTotalAmount = useMemo(() => {
    return transactions
      .filter((t) => selectedTxnIds.has(t.id))
      .reduce((sum, t) => sum + (Number(t.price) || 0), 0);
  }, [transactions, selectedTxnIds]);

  // --- Deletion Execution ---
  const executeDeleteTransactions = async (txnsToDelete) => {
    if (!txnsToDelete || txnsToDelete.length === 0) return;
    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));

    try {
      const deletedIds = new Set(txnsToDelete.map((t) => t.id));
      const stored = getStoredDeletedIds();

      for (const txn of txnsToDelete) {
        stored.add(txn.id);
        const emailLower = (txn.studentEmail || "").toLowerCase().trim();
        if (emailLower) {
          stored.add(`email_${emailLower}_${txn.price}`);
          stored.add(`${emailLower}_${txn.price}`);
        }

        // 1. Delete from orders collection by doc ID (if not synthetic)
        if (txn.id && !txn.id.startsWith("PRT-")) {
          try {
            await deleteDoc(doc(db, "orders", txn.id));
          } catch (e) {
            console.warn(`Could not delete order ${txn.id}:`, e);
          }
        }

        // 2. Also check if there are matching orders in orders collection
        if (emailLower) {
          try {
            const oSnap = await getDocs(
              query(collection(db, "orders"), where("studentEmail", "==", emailLower))
            );
            for (const oDoc of oSnap.docs) {
              const oData = oDoc.data();
              if (
                Number(oData.price) === Number(txn.price) ||
                oDoc.id === txn.id ||
                (txn.id && txn.id.startsWith("PRT-"))
              ) {
                await deleteDoc(doc(db, "orders", oDoc.id));
              }
            }
          } catch (e) {
            console.warn("Could not delete matching order doc:", e);
          }
        }
      }

      localStorage.setItem("admin_deleted_sales_txns", JSON.stringify(Array.from(stored)));

      // Remove from local transactions state immediately
      setTransactions((prev) => prev.filter((t) => !deletedIds.has(t.id)));

      // Remove from selection
      setSelectedTxnIds((prev) => {
        const next = new Set(prev);
        deletedIds.forEach((id) => next.delete(id));
        return next;
      });

      setDeleteModalState({ isOpen: false, txnsToDelete: [], isDeleting: false });
      if (selectedTxn && deletedIds.has(selectedTxn.id)) {
        setSelectedTxn(null);
      }

      setToastMessage({
        type: "success",
        text: `🎉 Successfully deleted ${txnsToDelete.length} transaction(s)! Total revenue updated.`,
      });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Error executing delete transactions:", err);
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
      setToastMessage({
        type: "error",
        text: "Failed to delete transaction. Please check your connection and try again.",
      });
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-8 pb-20 font-sans">
      {/* HEADER SECTION (Centered on Mobile) */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Financial Overview
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Track earnings, invoices, and transaction history.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 transition-all flex items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full xl:max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by student, email, course, or ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Type Filter Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {["All", "Course", "Partnership", "Upgrade"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${typeFilter === type
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {type === "All" ? "All" : type === "Course" ? "Courses" : type === "Partnership" ? "Partnerships" : "Upgrades"}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs */}
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

          {/* Date Dropdown */}
          <div className="relative w-full sm:w-40">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <Calendar size={16} />
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

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllVisibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeVisibleSelected && !isAllVisibleSelected;
                    }}
                    onChange={handleSelectAllVisible}
                    className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                    title="Select All Visible"
                  />
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Transaction ID
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Student
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Item
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Date
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Amount
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {currentItems.length > 0 ? (
                  currentItems.map((txn, index) => (
                    <motion.tr
                      key={txn.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b border-slate-50 hover:bg-slate-50/80 transition-colors group cursor-pointer ${
                        selectedTxnIds.has(txn.id) ? "bg-indigo-50/40" : ""
                      }`}
                      onClick={() => setSelectedTxn(txn)}
                    >
                      <td className="p-6 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedTxnIds.has(txn.id)}
                          onChange={() => handleToggleSelect(txn.id)}
                          className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                      </td>
                      <td className="p-6">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          #{txn.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                            {txn.studentName?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 line-clamp-1">
                              {txn.studentName}
                            </p>
                            <div className="flex items-center gap-2 group/copy">
                              <p className="text-xs text-slate-400">
                                {txn.studentEmail}
                              </p>
                              {txn.studentEmail && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(txn.studentEmail);
                                  }}
                                  className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-indigo-500 transition-all cursor-pointer flex items-center"
                                  title="Copy Email"
                                >
                                  {copiedText === txn.studentEmail ? (
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
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          {txn.type === "upgrade" || txn.productType === "upgrade" || txn.isUpgrade ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/80 flex items-center gap-1 shadow-sm">
                              <ArrowUpRight size={12} /> Upgrade
                            </span>
                          ) : txn.productType === "partnership" || txn.type === "partnership" || txn.productType === "partner" || txn.type === "partner" ? (
                            <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              Partnership
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                              Course
                            </span>
                          )}
                          <span className="text-sm font-medium text-slate-700 truncate max-w-[220px]">
                            {txn.isUpgrade || txn.type === "upgrade"
                              ? "Student to Partner Upgrade (Remaining Balance)"
                              : txn.productName || txn.title || "Access Granted"}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-slate-500 whitespace-nowrap">
                          <Clock size={14} />
                          <span className="text-xs font-bold">
                            {txn.createdAt.toLocaleString("en-US", {
                              year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <span className="text-sm font-black text-slate-900">
                          ₹{txn.price}
                        </span>
                      </td>
                      <td className="p-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedTxn(txn)}
                            className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteModalState({
                                isOpen: true,
                                txnsToDelete: [txn],
                                isDeleting: false,
                              });
                            }}
                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                            title="Delete Transaction History"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                        <DollarSign size={24} />
                      </div>
                      <p className="text-slate-800 font-bold text-base">
                        No Sales Records Yet
                      </p>
                      <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1">
                        All future Course and Partnership sales transactions will appear here live.
                      </p>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredData.length)} of{" "}
              {filteredData.length}
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

      {/* DETAILS MODAL (No Download Button) */}
      <AnimatePresence>
        {selectedTxn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-950 p-6 flex justify-between items-start">
                <div>
                  <h3 className="text-white text-lg font-bold">
                    Transaction Details
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    ID: #{selectedTxn.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center size-16 bg-emerald-50 text-emerald-500 rounded-full mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">
                    ₹{selectedTxn.price}
                  </h2>
                  <p className="text-emerald-600 font-bold text-sm mt-1">
                    Payment Successful
                  </p>
                </div>

                <div className="space-y-4 border-t border-b border-slate-100 py-6">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm font-medium">
                      Student
                    </span>
                    <span className="text-slate-900 text-sm font-bold text-right">
                      {selectedTxn.studentName}
                      <br />
                      <span className="text-slate-400 text-xs font-normal">
                        {selectedTxn.studentEmail}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm font-medium">
                      Product
                    </span>
                    <span className="text-slate-900 text-sm font-bold">
                      {selectedTxn.productName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm font-medium">
                      Date & Time
                    </span>
                    <span className="text-slate-900 text-sm font-bold">
                      {selectedTxn.createdAt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm font-medium">
                      Payment Method
                    </span>
                    <span className="text-slate-900 text-sm font-bold flex items-center gap-1">
                      <CreditCard size={14} /> Online
                    </span>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedTxn(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setDeleteModalState({
                        isOpen: true,
                        txnsToDelete: [selectedTxn],
                        isDeleting: false,
                      });
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/30 cursor-pointer active:scale-95"
                  >
                    <Trash2 size={14} /> Delete Transaction
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION BAR FOR SELECTED TRANSACTIONS */}
      <AnimatePresence>
        {selectedTxnIds.size > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-6"
          >
            <div className="flex items-center gap-3">
              <span className="size-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-black text-xs flex items-center justify-center">
                {selectedTxnIds.size}
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  {selectedTxnIds.size} Transaction{selectedTxnIds.size > 1 ? "s" : ""} Selected
                </p>
                <p className="text-[11px] text-emerald-400 font-bold">
                  Total: ₹{selectedTotalAmount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedTxnIds(new Set())}
                className="px-3 py-2 text-xs font-bold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  const toDelete = transactions.filter((t) => selectedTxnIds.has(t.id));
                  setDeleteModalState({
                    isOpen: true,
                    txnsToDelete: toDelete,
                    isDeleting: false,
                  });
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/30 cursor-pointer active:scale-95"
              >
                <Trash2 size={14} /> Delete Selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteModalState.isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl relative overflow-hidden p-6 sm:p-7 border border-slate-100"
            >
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900">
                    Delete Transaction History?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    You are about to permanently delete{" "}
                    <strong>{deleteModalState.txnsToDelete.length} transaction record(s)</strong>.
                  </p>
                </div>
              </div>

              {/* Transactions Preview List */}
              <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 max-h-48 overflow-y-auto space-y-2">
                {deleteModalState.txnsToDelete.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between text-xs py-2 border-b border-slate-200/60 last:border-0"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{t.studentName}</span>
                      <span className="text-[11px] font-mono text-slate-500">{t.studentEmail}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {t.productName || t.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-red-600 text-sm">
                        ₹{Number(t.price || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Deducted</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Deduction Summary */}
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs mb-4">
                <span className="font-bold text-slate-600">Total Revenue Deduction:</span>
                <span className="font-black text-red-600 text-sm">
                  -₹{deleteModalState.txnsToDelete.reduce((sum, t) => sum + (Number(t.price) || 0), 0).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Warning Notice */}
              <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200/80 text-red-700 text-xs font-semibold space-y-1 mb-6">
                <p className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle size={13} className="shrink-0" /> Important Financial Notice:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-600 pl-1 font-medium">
                  <li>These transaction records will be permanently removed from orders history.</li>
                  <li>Total sales revenue and transaction count will decrease everywhere in real time.</li>
                  <li>This action cannot be undone.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() =>
                    setDeleteModalState({
                      isOpen: false,
                      txnsToDelete: [],
                      isDeleting: false,
                    })
                  }
                  disabled={deleteModalState.isDeleting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeDeleteTransactions(deleteModalState.txnsToDelete)}
                  disabled={deleteModalState.isDeleting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {deleteModalState.isDeleting ? (
                    <>
                      <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} /> Confirm Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-8 right-8 z-[120] px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-3 backdrop-blur-md ${
              toastMessage.type === "success"
                ? "bg-slate-900/95 text-emerald-400 border-emerald-500/30"
                : "bg-red-950/95 text-red-300 border-red-500/30"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Reusable Stats Card ---
const KPICard = ({ label, value, icon, color }) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
      <div
        className={`size-14 rounded-2xl flex items-center justify-center ${colors[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
      </div>
    </div>
  );
};

export default SalesManager;