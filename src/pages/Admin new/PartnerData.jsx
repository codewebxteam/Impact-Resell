import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ChevronDown,
  Download,
  Loader2,
  Eye,
  Building2,
  Phone,
  Copy,
  Check,
  UserPlus,
  Globe,
  ExternalLink,
  Users,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  X,
  GraduationCap,
  Sparkles,
  ShoppingBag,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const PartnerData = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState(null);

  const [timeFilter, setTimeFilter] = useState("All Time");
  const [statusFilter, setStatusFilter] = useState("All");
  const [portalFilter, setPortalFilter] = useState("All"); // All | Launched | Pending
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- MULTI-SELECT & DELETE STATE ---
  const [selectedPartnerIds, setSelectedPartnerIds] = useState(new Set());
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    partnersToDelete: [],
    isDeleting: false,
  });
  const [toastMessage, setToastMessage] = useState(null);

  // Toggle selection for a single partner
  const handleToggleSelect = (partnerId) => {
    setSelectedPartnerIds((prev) => {
      const next = new Set(prev);
      if (next.has(partnerId)) {
        next.delete(partnerId);
      } else {
        next.add(partnerId);
      }
      return next;
    });
  };

  // Execute deletion across all collections and remove associated revenue
  const executeDeletePartners = async (partnersToDelete) => {
    if (!partnersToDelete || partnersToDelete.length === 0) return;
    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));

    try {
      for (const partner of partnersToDelete) {
        const emailLower = (partner.email || "").toLowerCase().trim();
        const pId = partner.id || partner.agencyId;
        const ownerId = partner.ownerId;

        // 1. Delete from allowedResellers (whitelist)
        if (emailLower) {
          try {
            await deleteDoc(doc(db, "allowedResellers", emailLower));
          } catch (e) {
            console.warn(`Could not delete allowedResellers doc for ${emailLower}:`, e);
          }
        }
        if (partner.id && partner.id.startsWith("allowed_")) {
          const rawId = partner.id.replace("allowed_", "");
          try {
            await deleteDoc(doc(db, "allowedResellers", rawId));
          } catch (e) {}
        }

        // 2. Delete from agencies collection
        if (partner.agencyId) {
          try {
            await deleteDoc(doc(db, "agencies", partner.agencyId));
          } catch (e) {}
        }
        if (pId && pId !== partner.agencyId && !pId.startsWith("allowed_")) {
          try {
            await deleteDoc(doc(db, "agencies", pId));
          } catch (e) {}
        }
        if (emailLower) {
          try {
            const agencyQ = query(collection(db, "agencies"), where("email", "==", emailLower));
            const agencySnap = await getDocs(agencyQ);
            for (const aDoc of agencySnap.docs) {
              await deleteDoc(doc(db, "agencies", aDoc.id));
            }
          } catch (e) {}
        }

        // 3. Delete from users collection
        if (ownerId && !ownerId.startsWith("allowed_")) {
          try {
            await deleteDoc(doc(db, "users", ownerId));
          } catch (e) {}
        }
        if (emailLower) {
          try {
            const userQ = query(collection(db, "users"), where("email", "==", emailLower));
            const userSnap = await getDocs(userQ);
            for (const uDoc of userSnap.docs) {
              await deleteDoc(doc(db, "users", uDoc.id));
            }
          } catch (e) {}
        }

        // 4. Delete all associated Orders & Revenue everywhere
        const orderIdsToDelete = new Set();
        if (emailLower) {
          try {
            const oSnap1 = await getDocs(query(collection(db, "orders"), where("studentEmail", "==", emailLower)));
            oSnap1.docs.forEach((d) => orderIdsToDelete.add(d.id));

            const oSnap2 = await getDocs(query(collection(db, "orders"), where("userEmail", "==", emailLower)));
            oSnap2.docs.forEach((d) => orderIdsToDelete.add(d.id));

            const oSnap3 = await getDocs(query(collection(db, "orders"), where("userId", "==", emailLower)));
            oSnap3.docs.forEach((d) => orderIdsToDelete.add(d.id));
          } catch (e) {}
        }

        const partnerIdToMatch = partner.agencyId || (pId && !pId.startsWith("allowed_") ? pId : null);
        if (partnerIdToMatch) {
          try {
            const oSnap4 = await getDocs(query(collection(db, "orders"), where("partnerId", "==", partnerIdToMatch)));
            oSnap4.docs.forEach((d) => orderIdsToDelete.add(d.id));
          } catch (e) {}
        }

        for (const oId of orderIdsToDelete) {
          try {
            await deleteDoc(doc(db, "orders", oId));
          } catch (e) {
            console.warn(`Could not delete order ${oId}:`, e);
          }
        }
      }

      // Update local state and clear selections
      const deletedIds = new Set(partnersToDelete.map((p) => p.id));
      setPartners((prev) => prev.filter((p) => !deletedIds.has(p.id)));
      setSelectedPartnerIds((prev) => {
        const next = new Set(prev);
        deletedIds.forEach((id) => next.delete(id));
        return next;
      });
      setDeleteModalState({ isOpen: false, partnersToDelete: [], isDeleting: false });
      if (selectedPartner && deletedIds.has(selectedPartner.id)) {
        setSelectedPartner(null);
      }

      setToastMessage({
        type: "success",
        text: `🎉 Successfully deleted ${partnersToDelete.length} partner(s) and cleared associated revenue everywhere!`,
      });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Error deleting partners:", err);
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
      setToastMessage({
        type: "error",
        text: "Failed to delete partner. Please check your connection and try again.",
      });
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // --- FETCH & MERGE ALL PARTNERS DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersSnap, agenciesSnap, allowedSnap, ordersSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "agencies")),
          getDocs(collection(db, "allowedResellers")),
          getDocs(collection(db, "orders")),
        ]);

        const agenciesMap = new Map();
        agenciesSnap.docs.forEach((d) => {
          const data = d.data();
          agenciesMap.set(d.id, { id: d.id, ...data });
          if (data.email) agenciesMap.set(data.email.toLowerCase(), { id: d.id, ...data });
          if (data.ownerId) agenciesMap.set(data.ownerId, { id: d.id, ...data });
        });

        const allowedMap = new Map();
        allowedSnap.docs.forEach((d) => {
          const data = d.data();
          allowedMap.set(d.id.toLowerCase(), { id: d.id, ...data });
          if (data.email) allowedMap.set(data.email.toLowerCase(), { id: d.id, ...data });
        });

        // Calculate students count under each partner
        const partnerStudentsCount = {};
        const partnerStudentsList = {};
        usersSnap.docs.forEach((u) => {
          const uData = u.data();
          const pId = uData.partnerId;
          if (pId && pId !== "direct") {
            partnerStudentsCount[pId] = (partnerStudentsCount[pId] || 0) + 1;
            if (!partnerStudentsList[pId]) partnerStudentsList[pId] = [];
            if (partnerStudentsList[pId].length < 10) {
              partnerStudentsList[pId].push({ id: u.id, name: uData.name || "Student", email: uData.email });
            }
          }
        });

        // Calculate orders & revenue under each partner
        const partnerOrdersCount = {};
        const partnerRevenueMap = {};
        const partnerOrdersList = {};
        ordersSnap.docs.forEach((o) => {
          const oData = o.data();
          const pId = oData.partnerId;
          if (pId) {
            const amount = Number(oData.price) || Number(oData.amount) || Number(oData.saleValue) || 0;
            partnerOrdersCount[pId] = (partnerOrdersCount[pId] || 0) + 1;
            partnerRevenueMap[pId] = (partnerRevenueMap[pId] || 0) + amount;
            if (!partnerOrdersList[pId]) partnerOrdersList[pId] = [];
            if (partnerOrdersList[pId].length < 10) {
              partnerOrdersList[pId].push({
                id: o.id,
                title: oData.title || oData.assetName || "Order",
                price: amount,
                date: oData.date || oData.createdAt,
              });
            }
          }
        });

        const partnerMap = new Map();

        // 1. From agencies
        agenciesSnap.docs.forEach((d) => {
          const data = d.data();
          const email = (data.email || "").toLowerCase();
          const pId = d.id;
          const ownerId = data.ownerId || d.id;

          const studentsCount =
            (partnerStudentsCount[pId] || 0) + (ownerId !== pId ? partnerStudentsCount[ownerId] || 0 : 0);
          const ordersCount =
            (partnerOrdersCount[pId] || 0) + (ownerId !== pId ? partnerOrdersCount[ownerId] || 0 : 0);
          const revenueGenerated =
            (partnerRevenueMap[pId] || 0) + (ownerId !== pId ? partnerRevenueMap[ownerId] || 0 : 0);

          const sanitizeDate = (dateField) => {
            if (!dateField) return new Date(0);
            if (dateField.toDate) return dateField.toDate();
            const parsed = new Date(dateField);
            return isNaN(parsed.getTime()) ? new Date(0) : parsed;
          };

          partnerMap.set(email || pId, {
            id: pId,
            agencyId: pId,
            ownerId: ownerId,
            name: data.ownerName || data.name || "Academy Partner",
            agency: data.name || "Unnamed Academy",
            email: data.email || "",
            phone: data.whatsapp || data.phone || "",
            domain: data.subdomain || "",
            customDomain: data.customDomain || "",
            status: data.status || "Active",
            createdAt: sanitizeDate(data.createdAt || data.updatedAt),
            source: data.customDomain ? "Custom Domain" : "Direct Partner",
            hasCustomDomain: Boolean(data.customDomain && data.customDomain.trim()),
            feePaid: data.partnershipFeePaid || 1999,
            studentsCount,
            ordersCount,
            revenueGenerated,
            studentsSample: partnerStudentsList[pId] || partnerStudentsList[ownerId] || [],
            ordersSample: partnerOrdersList[pId] || partnerOrdersList[ownerId] || [],
          });
        });

        // 2. From users where role == "partner" or isReseller
        usersSnap.docs.forEach((d) => {
          const data = d.data();
          if (data.role === "partner" || data.isReseller === true || data.resellerStatus === "approved") {
            const email = (data.email || "").toLowerCase();
            const existing = partnerMap.get(email) || partnerMap.get(d.id);
            const agencyData = agenciesMap.get(d.id) || (email ? agenciesMap.get(email) : null);
            const allowedData = email ? allowedMap.get(email) : null;

            const pId = agencyData?.id || d.id;
            const studentsCount =
              (partnerStudentsCount[d.id] || 0) + (pId !== d.id ? partnerStudentsCount[pId] || 0 : 0);
            const ordersCount =
              (partnerOrdersCount[d.id] || 0) + (pId !== d.id ? partnerOrdersCount[pId] || 0 : 0);
            const revenueGenerated =
              (partnerRevenueMap[d.id] || 0) + (pId !== d.id ? partnerRevenueMap[pId] || 0 : 0);

            const sanitizeDate = (dateField) => {
              if (!dateField) return new Date(0);
              if (dateField.toDate) return dateField.toDate();
              const parsed = new Date(dateField);
              return isNaN(parsed.getTime()) ? new Date(0) : parsed;
            };

            const customDom = (agencyData?.customDomain || existing?.customDomain || "").trim();

            partnerMap.set(email || d.id, {
              id: d.id,
              agencyId: agencyData?.id || existing?.agencyId || null,
              ownerId: d.id,
              name: data.name || agencyData?.name || existing?.name || "Partner",
              agency: agencyData?.name || data.agencyName || existing?.agency || "Personal Resell License",
              email: data.email || existing?.email || "",
              phone: data.phone || agencyData?.whatsapp || existing?.phone || "",
              domain: agencyData?.subdomain || existing?.domain || "",
              customDomain: customDom,
              status: data.status || agencyData?.status || existing?.status || "Active",
              createdAt: sanitizeDate(data.createdAt || existing?.createdAt),
              source:
                data.registeredBy === "admin" || data.registeredByAdmin
                  ? "Admin Registered"
                  : customDom
                  ? "Custom Domain"
                  : "Direct Partner",
              hasCustomDomain: Boolean(customDom),
              feePaid: data.partnershipFeePaid || allowedData?.feePaid || 1999,
              studentsCount: Math.max(studentsCount, existing?.studentsCount || 0),
              ordersCount: Math.max(ordersCount, existing?.ordersCount || 0),
              revenueGenerated: Math.max(revenueGenerated, existing?.revenueGenerated || 0),
              studentsSample: partnerStudentsList[d.id] || existing?.studentsSample || [],
              ordersSample: partnerOrdersList[d.id] || existing?.ordersSample || [],
            });
          }
        });

        // 3. From allowedResellers (ONLY Partners or Upgraded Partners — NEVER Course Students!)
        allowedSnap.docs.forEach((d) => {
          const data = d.data();
          const email = (data.email || d.id).toLowerCase();

          // STRICT CHECK: If accessType is "course", they are ONLY a student — skip completely!
          if (data.accessType === "course") return;

          if (!partnerMap.has(email)) {
            const sanitizeDate = (dateField) => {
              if (!dateField) return new Date(0);
              if (dateField.toDate) return dateField.toDate();
              const parsed = new Date(dateField);
              return isNaN(parsed.getTime()) ? new Date(0) : parsed;
            };

            partnerMap.set(email, {
              id: "allowed_" + d.id,
              agencyId: null,
              ownerId: null,
              name: data.name || "Registered Partner",
              agency: data.isUpgraded ? "Upgraded Partner License" : "Personal Resell License",
              email: email,
              phone: data.phone || "",
              domain: "",
              customDomain: "",
              status: data.status === "verified" ? "Active" : data.status || "Active",
              createdAt: sanitizeDate(data.grantedAt || data.allowedAt || data.upgradedAt),
              source: data.isUpgraded || data.upgradedAt ? "Upgraded from Student" : "Admin Registered",
              hasCustomDomain: false,
              feePaid: data.feePaid || 2499,
              isUpgraded: Boolean(data.isUpgraded || data.upgradedAt),
              studentsCount: 0,
              ordersCount: 0,
              revenueGenerated: 0,
              studentsSample: [],
              ordersSample: [],
            });
          }
        });

        // Final Filter: Ensure nobody with accessType === "course" accidentally slips in
        const list = Array.from(partnerMap.values())
          .filter((partner) => {
            const email = partner.email?.toLowerCase();
            const allowed = email ? allowedMap.get(email) : null;
            if (allowed?.accessType === "course" && !allowed?.isUpgraded) return false;
            return true;
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        setPartners(list);
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen to allowedResellers live so upgrades immediately show up in Partners tab
    const unsubAllowed = onSnapshot(collection(db, "allowedResellers"), () => {
      fetchData();
    });

    return () => unsubAllowed();
  }, []);

  // --- FILTER LOGIC ---
  const filteredPartners = useMemo(() => {
    let filtered = partners;

    // Status Filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (p) => (p.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Custom Domain / Portal Setup Filter
    if (portalFilter === "Custom") {
      filtered = filtered.filter((p) => Boolean(p.customDomain && p.customDomain.trim()));
    } else if (portalFilter === "Subdomain") {
      filtered = filtered.filter((p) => Boolean(p.domain) && !p.customDomain);
    } else if (portalFilter === "Pending") {
      filtered = filtered.filter((p) => !p.domain && !p.customDomain);
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
      filtered = filtered.filter((partner) => {
        if (timeFilter === "Custom" && customRange.end) {
          const endDate = new Date(customRange.end);
          endDate.setHours(23, 59, 59, 999);
          return partner.createdAt >= startDate && partner.createdAt <= endDate;
        }
        return partner.createdAt >= startDate;
      });
    }

    // Search Query Filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((partner) => {
        return (
          partner.name?.toLowerCase().includes(searchLower) ||
          partner.email?.toLowerCase().includes(searchLower) ||
          partner.phone?.toLowerCase().includes(searchLower) ||
          partner.agency?.toLowerCase().includes(searchLower) ||
          partner.domain?.toLowerCase().includes(searchLower) ||
          partner.customDomain?.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [partners, searchQuery, timeFilter, customRange, statusFilter, portalFilter]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPartners = filteredPartners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);

  const isAllVisibleSelected =
    currentPartners.length > 0 &&
    currentPartners.every((p) => selectedPartnerIds.has(p.id));

  const isSomeVisibleSelected =
    currentPartners.some((p) => selectedPartnerIds.has(p.id)) &&
    !isAllVisibleSelected;

  const handleSelectAllVisible = () => {
    if (isAllVisibleSelected) {
      setSelectedPartnerIds((prev) => {
        const next = new Set(prev);
        currentPartners.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedPartnerIds((prev) => {
        const next = new Set(prev);
        currentPartners.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, searchQuery, statusFilter, portalFilter]);

  // Overall Metrics
  const summaryMetrics = useMemo(() => {
    const total = partners.length;
    const active = partners.filter((p) => p.status?.toLowerCase() === "active").length;
    const customDomainsCount = partners.filter((p) => Boolean(p.customDomain && p.customDomain.trim())).length;
    const subdomainsCount = partners.filter((p) => Boolean(p.domain && p.domain.trim())).length;
    const totalStudentsEnrolled = partners.reduce((sum, p) => sum + (p.studentsCount || 0), 0);
    const totalRevenueGenerated = partners.reduce((sum, p) => sum + (p.revenueGenerated || 0), 0);
    const totalLicenseFees = partners.reduce((sum, p) => sum + (p.feePaid || 1999), 0);

    return {
      total,
      active,
      customDomainsCount,
      subdomainsCount,
      totalStudentsEnrolled,
      totalRevenueGenerated,
      totalLicenseFees,
    };
  }, [partners]);

  // Export CSV Handler
  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Partner Name,Academy Name,Email,Phone,Subdomain,Custom Domain,Status,Fee Paid,Students Count,Orders Count,Revenue Generated,Joined Date\n" +
      filteredPartners
        .map(
          (p) =>
            `"${p.id}","${p.name}","${p.agency}","${p.email}","${p.phone || "N/A"}","${
              p.domain || ""
            }","${p.customDomain || ""}","${p.status}",₹${p.feePaid || 1999},${
              p.studentsCount || 0
            },${p.ordersCount || 0},₹${p.revenueGenerated || 0},"${p.createdAt.toLocaleDateString()}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `impact_partners_data.csv`);
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
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-md border ${
              toastMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {toastMessage.type === "success" ? (
              <Check className="size-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="size-5 text-red-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOP HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
        <div>
          <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
              <ShieldCheck size={12} /> Partner Resell Network
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Partners Directory & Details
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Showing all registered partners, custom domains, license fees & performance ({filteredPartners.length} active)
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/admin/users"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
          >
            <UserPlus size={16} /> + Register New Partner
          </Link>
          <button
            onClick={handleExport}
            className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 transition-all flex items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* --- 4 STAT METRICS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Partners
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {summaryMetrics.total}
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 mt-0.5 inline-block">
              {summaryMetrics.active} Active Resellers
            </span>
          </div>
          <div className="size-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Briefcase size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Custom Domains Active
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {summaryMetrics.customDomainsCount}
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 mt-0.5 inline-block">
              Branded Custom Domains
            </span>
          </div>
          <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Globe size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Subdomains Active
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {summaryMetrics.subdomainsCount}
            </h3>
            <span className="text-[11px] font-bold text-blue-600 mt-0.5 inline-block">
              Configured Subdomain Portals
            </span>
          </div>
          <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Globe size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Partnership Fees
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              ₹{summaryMetrics.totalLicenseFees.toLocaleString("en-IN")}
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 mt-0.5 inline-block">
              Reseller License Plan
            </span>
          </div>
          <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* --- SEARCH & FILTERS BAR --- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="relative w-full xl:max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by partner name, email, phone, academy or domain..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Status Filter */}
          <div className="relative w-full sm:w-40">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <ShieldCheck size={16} />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-10 pr-8 py-3 rounded-xl outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Registered">Registered</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              <ChevronDown size={16} />
            </div>
          </div>

          {/* Domain Filter */}
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <Globe size={16} />
            </div>
            <select
              value={portalFilter}
              onChange={(e) => setPortalFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-10 pr-8 py-3 rounded-xl outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <option value="All">All Domain Types</option>
              <option value="Custom">Custom Domain ({summaryMetrics.customDomainsCount})</option>
              <option value="Subdomain">Subdomain Only</option>
              <option value="Pending">No Domain Linked</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              <ChevronDown size={16} />
            </div>
          </div>

          {/* Time Filter */}
          <div className="relative w-full sm:w-40">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <Filter size={16} />
            </div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold pl-10 pr-8 py-3 rounded-xl outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              {["All Time", "Today", "7D", "30D", "6M", "1Y", "Custom"].map((range) => (
                <option key={range} value={range}>
                  {range === "7D" ? "Last 7 Days" : range}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* --- PARTNERS DATA TABLE --- */}
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
                  <th className="pl-6 pr-2 py-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllVisibleSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isSomeVisibleSelected;
                      }}
                      onChange={handleSelectAllVisible}
                      className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      title="Select All Visible Partners"
                    />
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Partner & Academy
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Portal & Domain
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    License & Fee
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentPartners.length > 0 ? (
                  currentPartners.map((partner) => (
                    <tr
                      key={partner.id}
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        selectedPartnerIds.has(partner.id) ? "bg-indigo-50/30" : ""
                      }`}
                    >
                      {/* 0. Row Checkbox */}
                      <td className="pl-6 pr-2 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedPartnerIds.has(partner.id)}
                          onChange={() => handleToggleSelect(partner.id)}
                          className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* 1. Partner & Academy */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-base shadow-sm">
                            {partner.agency?.[0]?.toUpperCase() || partner.name?.[0]?.toUpperCase() || "P"}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm leading-tight">
                              {partner.name || "Unnamed Partner"}
                            </span>
                            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-1">
                              <Building2 size={12} /> {partner.agency || "Personal Academy"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Portal & Domain */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {partner.domain ? (
                            <a
                              href={`https://${partner.domain}.i-cpp.com`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              <Globe size={13} className="text-indigo-500 shrink-0" />
                              <span className="truncate max-w-[150px]">
                                {partner.domain}.i-cpp.com
                              </span>
                              <ExternalLink size={11} />
                            </a>
                          ) : (
                            <span className="text-xs font-medium text-slate-400 italic">
                              Subdomain not configured
                            </span>
                          )}

                          {partner.customDomain && (
                            <a
                              href={`https://${partner.customDomain}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors w-fit"
                            >
                              <Sparkles size={10} /> {partner.customDomain}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* 3. Contact Info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 group/copy">
                            <span className="text-sm font-medium text-slate-700">
                              {partner.email}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(partner.email);
                              }}
                              className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-indigo-500 transition-all cursor-pointer flex items-center"
                              title="Copy Email"
                            >
                              {copiedText === partner.email ? (
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
                              <Phone size={10} /> {partner.phone || "No Number"}
                            </span>
                            {partner.phone && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(partner.phone);
                                }}
                                className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-indigo-500 transition-all cursor-pointer flex items-center"
                                title="Copy Phone"
                              >
                                {copiedText === partner.phone ? (
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
                      </td>

                      {/* 4. License & Fee */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-black text-emerald-600">
                            ₹{partner.feePaid ? Number(partner.feePaid).toLocaleString("en-IN") : "1,999"}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                            <ShieldCheck size={12} className="text-indigo-500" /> Resell License
                          </span>
                        </div>
                      </td>

                      {/* 5. Performance */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <Users size={12} className="text-indigo-500" />
                            {partner.studentsCount} Students
                          </span>
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                            <ShoppingBag size={12} className="text-slate-400" />
                            {partner.ordersCount} Orders
                          </span>
                        </div>
                      </td>

                      {/* 6. Joined Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="whitespace-nowrap">
                            {partner.createdAt.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* 7. Action */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedPartner(partner)}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title="View Partner Details"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            onClick={() => {
                              setDeleteModalState({
                                isOpen: true,
                                partnersToDelete: [partner],
                                isDeleting: false,
                              });
                            }}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center cursor-pointer border border-red-200/60 shadow-sm hover:scale-105 active:scale-95"
                            title="Delete Partner & Clear Revenue"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-14 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="size-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Briefcase size={28} />
                        </div>
                        <p className="text-slate-800 font-bold text-base">
                          No Partners Found
                        </p>
                        <p className="text-slate-400 text-xs max-w-md">
                          No partners match the current search or filter criteria. Try resetting filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredPartners.length)} of {filteredPartners.length} Partners
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="size-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="size-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- FLOATING ACTION BAR FOR SELECTED PARTNERS --- */}
      <AnimatePresence>
        {selectedPartnerIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/70 flex items-center justify-between gap-4 sm:gap-8 max-w-xl w-full"
          >
            <div className="flex items-center gap-3">
              <span className="size-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-black text-xs flex items-center justify-center">
                {selectedPartnerIds.size}
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  {selectedPartnerIds.size} Partner{selectedPartnerIds.size > 1 ? "s" : ""} Selected
                </p>
                <p className="text-[11px] text-slate-400">
                  Delete will remove entry and clear revenue everywhere
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedPartnerIds(new Set())}
                className="px-3 py-2 text-xs font-bold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  const toDelete = partners.filter((p) => selectedPartnerIds.has(p.id));
                  setDeleteModalState({
                    isOpen: true,
                    partnersToDelete: toDelete,
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

      {/* --- DETAILED PARTNER MODAL --- */}
      <AnimatePresence>
        {selectedPartner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl relative z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-slate-950 text-white p-6 sm:p-8 relative overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="absolute top-6 right-6 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-5">
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-xl border-2 border-white/20">
                    {selectedPartner.agency?.[0]?.toUpperCase() || selectedPartner.name?.[0]?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {selectedPartner.status || "Active"} Partner
                      </span>
                      {selectedPartner.customDomain ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1">
                          <Sparkles size={11} /> Custom Domain Active
                        </span>
                      ) : null}
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      {selectedPartner.agency}
                    </h2>
                    <p className="text-xs text-indigo-300 font-semibold mt-0.5">
                      Owner: {selectedPartner.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                {/* 3 Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      License Fee
                    </span>
                    <h4 className="text-lg font-black text-emerald-600 mt-1">
                      ₹{selectedPartner.feePaid ? Number(selectedPartner.feePaid).toLocaleString("en-IN") : "1,999"}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold">Reseller Plan</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Enrolled Students
                    </span>
                    <h4 className="text-lg font-black text-indigo-600 mt-1">
                      {selectedPartner.studentsCount}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold">Under this Partner</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Orders & Volume
                    </span>
                    <h4 className="text-lg font-black text-slate-900 mt-1">
                      {selectedPartner.ordersCount} Orders
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      ₹{selectedPartner.revenueGenerated.toLocaleString("en-IN")} Total
                    </span>
                  </div>
                </div>

                {/* Contact & Academy Config */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Academy & Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                      <span className="text-slate-400 font-bold">Email Address</span>
                      <span className="font-bold text-slate-800 break-all">{selectedPartner.email}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                      <span className="text-slate-400 font-bold">Phone Number</span>
                      <span className="font-bold text-slate-800">{selectedPartner.phone || "Not Provided"}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                      <span className="text-slate-400 font-bold">Subdomain URL</span>
                      {selectedPartner.domain ? (
                        <a
                          href={`https://${selectedPartner.domain}.i-cpp.com`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                        >
                          {selectedPartner.domain}.i-cpp.com <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No subdomain configured</span>
                      )}
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                      <span className="text-slate-400 font-bold">Custom Domain</span>
                      {selectedPartner.customDomain ? (
                        <a
                          href={`https://${selectedPartner.customDomain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                        >
                          {selectedPartner.customDomain} <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No custom domain linked</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sample Students enrolled under partner */}
                {selectedPartner.studentsSample && selectedPartner.studentsSample.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Students Enrolled Under Partner ({selectedPartner.studentsCount})
                    </h4>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                      {selectedPartner.studentsSample.map((stu) => (
                        <div key={stu.id} className="p-3 text-xs flex justify-between items-center">
                          <span className="font-bold text-slate-800">{stu.name}</span>
                          <span className="text-slate-500 font-medium">{stu.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={() => {
                    setDeleteModalState({
                      isOpen: true,
                      partnersToDelete: [selectedPartner],
                      isDeleting: false,
                    });
                  }}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-red-200/60 cursor-pointer shadow-sm active:scale-95"
                >
                  <Trash2 size={14} /> Delete Partner & Clear Revenue
                </button>
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION MODAL --- */}
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
                    Delete Partner & Clear Revenue?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    You are about to permanently delete{" "}
                    <strong>{deleteModalState.partnersToDelete.length} partner(s)</strong>.
                  </p>
                </div>
              </div>

              {/* Partners Preview List */}
              <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 max-h-48 overflow-y-auto space-y-2">
                {deleteModalState.partnersToDelete.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200/60 last:border-0"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{p.name}</span>
                      <span className="text-[11px] font-mono text-slate-500">{p.email}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-600">
                        ₹{Number(p.feePaid || 2499).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-400 block">License Fee</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning Notice */}
              <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200/80 text-red-700 text-xs font-semibold space-y-1 mb-6">
                <p className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle size={13} className="shrink-0" /> Important Revenue Notice:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-600 pl-1 font-medium">
                  <li>Partner resell license & agency portal will be revoked.</li>
                  <li>
                    All associated sales orders & fees will be <strong>permanently deleted from Sales and Revenue totals everywhere</strong>.
                  </li>
                  <li>This action cannot be undone.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() =>
                    setDeleteModalState({
                      isOpen: false,
                      partnersToDelete: [],
                      isDeleting: false,
                    })
                  }
                  disabled={deleteModalState.isDeleting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeDeletePartners(deleteModalState.partnersToDelete)}
                  disabled={deleteModalState.isDeleting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {deleteModalState.isDeleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Deleting & Clearing Revenue...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} /> Yes, Delete Partner & Revenue
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerData;
