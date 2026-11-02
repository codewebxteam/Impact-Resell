import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Unlock,
  UserCheck,
  MonitorPlay,
  Check,
  X,
  Clock,
  ShieldCheck,
  Mail,
  Zap,
  Phone,
  UserPlus,
  ArrowRight,
  Sparkles,
  DollarSign,
  GraduationCap,
  Briefcase,
  FileText,
  BadgeCheck,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const UserAccessManager = () => {
  // --- Content Data (Courses only, NO EBOOKS) ---
  const [courses, setCourses] = useState([]);

  // --- Alife Stable Leads State ---
  const [alifeLeads, setAlifeLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  // --- Manual Search State ---
  const [email, setEmail] = useState("");
  const [userStatus, setUserStatus] = useState("idle");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // --- Registration / Grant Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [modalForm, setModalForm] = useState({
    name: "",
    email: "",
    phone: "",
    accessType: "student", // 'student' | 'partner' | 'upgrade'
    customPrice: "999",
    alreadyPaid: "999",
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  // --- Pending Notifications State ---
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  // Active Tab: 'leads' | 'search' | 'pending'
  const [activeTab, setActiveTab] = useState("leads");

  // 1. Load Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snap = await getDocs(collection(db, "courseVideos"));
        setCourses(
          snap.docs.map((d) => ({
            id: d.id,
            title: d.data().title || "Untitled Course",
            price: d.data().price || 999,
          }))
        );
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // 2. Realtime Alife Stable Leads Listener
  useEffect(() => {
    setLeadsLoading(true);
    // Listen to demo_bookings
    const q = query(collection(db, "demo_bookings"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const leadsData = snapshot.docs.map((d) => {
          const data = d.data();
          let createdDate = new Date();
          if (data.createdAt?.toDate) {
            createdDate = data.createdAt.toDate();
          } else if (data.createdAt?.seconds) {
            createdDate = new Date(data.createdAt.seconds * 1000);
          }
          return {
            id: d.id,
            ...data,
            createdDate,
          };
        });

        // Sort latest first
        leadsData.sort((a, b) => b.createdDate - a.createdDate);
        setAlifeLeads(leadsData);
        setLeadsLoading(false);
      },
      (err) => {
        console.error("Error listening to leads:", err);
        setLeadsLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // 3. Pending Payment Notifications
  useEffect(() => {
    const q = query(
      collection(db, "payment_notifications"),
      where("status", "==", "pending")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setPendingRequests(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });
    return () => unsub();
  }, []);

  // --- Helper: Create Order Entry for Sales & Revenue Tracking ---
  const createOrderEntry = async (
    userId,
    userName,
    userEmail,
    itemTitle,
    itemId,
    priceAmount,
    orderType
  ) => {
    try {
      const saleAmount = parseInt(String(priceAmount).replace(/[^0-9]/g, "")) || 0;
      await addDoc(collection(db, "orders"), {
        userId: userId || "manual_" + Date.now(),
        studentName: userName || "Unknown",
        studentEmail: userEmail || "No Email",
        courseId: orderType === "course" ? itemId : null,
        assetName: itemTitle,
        title: itemTitle,
        productName: itemTitle,
        item: itemTitle,
        saleValue: saleAmount,
        amount: saleAmount,
        price: saleAmount,
        type: orderType,
        productType: orderType,
        source: "admin_manual_grant",
        status: "completed",
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error recording order entry:", err);
    }
  };

  // --- Open Registration Modal with Lead prefilled ---
  const handleOpenRegisterModal = (lead = null, defaultType = "student") => {
    setSelectedLead(lead);
    const isPartner = defaultType === "partner";
    const isUpgrade = defaultType === "upgrade";

    setModalForm({
      name: lead?.name || "",
      email: lead?.email || "",
      phone: lead?.phone || "",
      accessType: defaultType,
      customPrice: isPartner ? "2499" : isUpgrade ? "1500" : "999",
      alreadyPaid: isUpgrade ? "999" : "0",
    });
    setIsModalOpen(true);
    setMessage(null);
  };

  // --- Change Access Type in Modal ---
  const handleAccessTypeChange = (type) => {
    let price = "999";
    let alreadyPaid = "0";

    if (type === "partner") {
      price = "2499";
    } else if (type === "upgrade") {
      price = "1500"; // 2499 - 999 = 1500 default
      alreadyPaid = "999";
    }

    setModalForm((prev) => ({
      ...prev,
      accessType: type,
      customPrice: price,
      alreadyPaid,
    }));
  };

  // --- Submit Registration & Access Grant ---
  const handleRegisterAndGrant = async (e) => {
    e.preventDefault();
    const cleanName = modalForm.name.trim();
    const cleanEmail = modalForm.email.trim().toLowerCase();
    const cleanPhone = modalForm.phone.trim();
    const cleanPrice = parseInt(String(modalForm.customPrice).replace(/[^0-9]/g, "")) || 0;

    if (!cleanName || !cleanEmail) {
      alert("Please provide both Name and Email.");
      return;
    }

    setModalSubmitting(true);

    try {
      // 1. Check if user already exists in Firestore users
      const usersQuery = query(collection(db, "users"), where("email", "==", cleanEmail));
      const userSnap = await getDocs(usersQuery);

      const allCourseIds = courses.map((c) => c.id);
      const isPartner = modalForm.accessType === "partner" || modalForm.accessType === "upgrade";
      const targetRole = isPartner ? "partner" : "student";

      let finalUserId = "";

      if (!userSnap.empty) {
        // User exists -> Update user doc
        const existingDoc = userSnap.docs[0];
        finalUserId = existingDoc.id;
        const existingData = existingDoc.data();

        await updateDoc(doc(db, "users", finalUserId), {
          name: cleanName || existingData.name,
          phone: cleanPhone || existingData.phone || "",
          role: targetRole,
          enrolledCourses: arrayUnion(...allCourseIds),
          updatedAt: serverTimestamp(),
          registeredBy: "admin",
          registeredByAdmin: true,
          courseAccessGrantedBy: "admin",
          source: "admin_manual_grant",
          courseFeePaid: modalForm.accessType === "student" ? cleanPrice : (existingData.courseFeePaid || 999),
          partnershipFeePaid: isPartner ? cleanPrice : (existingData.partnershipFeePaid || 0),
        });
      } else {
        // Create new user document
        const newUserRef = await addDoc(collection(db, "users"), {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          role: targetRole,
          enrolledCourses: allCourseIds,
          createdAt: serverTimestamp(),
          registeredBy: "admin",
          registeredByAdmin: true,
          courseAccessGrantedBy: "admin",
          source: "admin_manual_grant",
          courseFeePaid: modalForm.accessType === "student" ? cleanPrice : 0,
          partnershipFeePaid: isPartner ? cleanPrice : 0,
        });
        finalUserId = newUserRef.id;

        // Initialize student/partner dashboard doc
        await setDoc(doc(db, "dashboard", finalUserId), {
          user: { name: cleanName, email: cleanEmail, avatar: "" },
          stats: { enrolledCourses: allCourseIds.length, activeHours: 0, certificates: 0, ebooks: 0 },
          activity: [{ day: "M", hours: 0 }, { day: "T", hours: 0 }, { day: "W", hours: 0 }, { day: "T", hours: 0 }, { day: "F", hours: 0 }, { day: "S", hours: 0 }, { day: "S", hours: 0 }],
          currentCourse: allCourseIds[0] || null,
          meta: { createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
        });
      }

      // 2. Sync to allowedResellers whitelist (Stores both Course Student & Partner access)
      await setDoc(
        doc(db, "allowedResellers", cleanEmail),
        {
          email: cleanEmail,
          name: cleanName,
          accessType: isPartner ? "partnership" : "course",
          status: "registered",
          grantedAt: serverTimestamp(),
          feePaid: modalForm.accessType === "upgrade" ? 2499 : cleanPrice,
          isUpgraded: modalForm.accessType === "upgrade",
          upgradeAmount: modalForm.accessType === "upgrade" ? cleanPrice : 0,
        },
        { merge: true }
      );

      // 3. Record Order / Sales for Revenue Tracking
      const productTitle =
        modalForm.accessType === "partner"
          ? "Partnership Resell Rights"
          : modalForm.accessType === "upgrade"
          ? "Student to Partner Upgrade (Remaining Balance)"
          : "Full Course Access";

      await createOrderEntry(
        finalUserId,
        cleanName,
        cleanEmail,
        productTitle,
        modalForm.accessType === "student" ? "all_courses" : "partnership_license",
        cleanPrice,
        modalForm.accessType === "student" ? "course" : modalForm.accessType === "upgrade" ? "upgrade" : "partnership"
      );

      // 4. If this came from an Alife Stable Lead, update lead doc
      if (selectedLead?.id) {
        await updateDoc(doc(db, "demo_bookings", selectedLead.id), {
          status: isPartner ? "registered_partner" : "registered_student",
          assignedEmail: cleanEmail,
          grantedPrice: cleanPrice,
          processedAt: serverTimestamp(),
        });
      }

      setMessage({
        type: "success",
        text: `🎉 Successfully granted ${targetRole.toUpperCase()} access to ${cleanName} (₹${cleanPrice})!`,
      });

      setIsModalOpen(false);
      setSelectedLead(null);
    } catch (err) {
      console.error("Error granting access:", err);
      alert("Failed to grant access. Check console for details.");
    } finally {
      setModalSubmitting(false);
    }
  };

  // --- Manual Search User ---
  const handleSearch = async () => {
    if (!email) return;
    setUserStatus("searching");
    setUserData(null);
    setMessage(null);

    try {
      const q = query(collection(db, "users"), where("email", "==", email.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setUserData({ id: userDoc.id, ...userDoc.data() });
        setUserStatus("found");
      } else {
        setUserStatus("not-found");
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Search failed" });
      setUserStatus("idle");
    }
  };

  // --- Quick Grant Course from Search ---
  const grantCourseAccess = async () => {
    if (!userData || !selectedCourse) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", userData.id);
      let courseTitle = "Course Access";
      let price = 999;

      if (selectedCourse === "all_courses") {
        const allIds = courses.map((c) => c.id);
        await updateDoc(userRef, {
          enrolledCourses: arrayUnion(...allIds),
          registeredBy: "admin",
          registeredByAdmin: true,
          courseAccessGrantedBy: "admin",
          source: "admin_manual_grant",
          courseFeePaid: price,
        });
        courseTitle = "All Courses Bundle";
      } else {
        const cObj = courses.find((c) => c.id === selectedCourse);
        courseTitle = cObj?.title || "Single Course";
        price = cObj?.price || 999;
        await updateDoc(userRef, {
          enrolledCourses: arrayUnion(selectedCourse),
          registeredBy: "admin",
          registeredByAdmin: true,
          courseAccessGrantedBy: "admin",
          source: "admin_manual_grant",
          courseFeePaid: price,
        });
      }

      await createOrderEntry(
        userData.id,
        userData.name,
        userData.email,
        courseTitle,
        selectedCourse,
        price,
        "course"
      );

      const updatedSnap = await getDoc(userRef);
      setUserData({ id: updatedSnap.id, ...updatedSnap.data() });
      setMessage({ type: "success", text: `Granted ${courseTitle} (₹${price}) successfully!` });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to grant course." });
    } finally {
      setLoading(false);
    }
  };

  // --- Quick Upgrade to Partner from Search ---
  const handleDirectUpgradeToPartner = () => {
    if (!userData) return;
    handleOpenRegisterModal(
      {
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      },
      "upgrade"
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* --- Top Header with Action Buttons --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600">
              User Access & Registration Hub
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Manage Access & Alife Leads
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Register new customers, enroll in courses (₹999), grant partnership rights (₹2,499), or upgrade.
          </p>
        </div>

        <button
          onClick={() => handleOpenRegisterModal(null, "student")}
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <UserPlus size={18} />
          <span>+ Register New Customer</span>
        </button>
      </div>

      {/* Global Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-bold animate-in fade-in ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-70">
            <X size={16} />
          </button>
        </div>
      )}

      {/* --- Nav Tabs --- */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab("leads")}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "leads"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>Alife Stable Leads</span>
          <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-black">
            {alifeLeads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === "search"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Search & Upgrade User
        </button>

        {pendingRequests.length > 0 && (
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "pending"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Pending</span>
            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-md text-[10px] font-black">
              {pendingRequests.length}
            </span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ALIFE STABLE LEADS (Direct Integration) */}
      {/* ========================================================= */}
      {activeTab === "leads" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-600" />
                Alife Stable Form Submissions
              </h2>
              <p className="text-xs text-slate-400">
                Customers who filled the "Book Free Demo" form on Alife Stable.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              Total Submissions: <span className="text-indigo-600 font-black">{alifeLeads.length}</span>
            </div>
          </div>

          {leadsLoading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
              <p className="text-xs font-bold uppercase tracking-wider">Loading Alife Leads...</p>
            </div>
          ) : alifeLeads.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                <FileText size={28} />
              </div>
              <h3 className="font-bold text-slate-700">No Form Submissions Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When visitors book a demo on Alife Stable, their name and phone number will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="py-3.5 px-6">Customer Name</th>
                    <th className="py-3.5 px-6">Phone Number</th>
                    <th className="py-3.5 px-6">Date / Time</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alifeLeads.map((lead) => {
                    const isRegisteredStudent = lead.status === "registered_student";
                    const isRegisteredPartner = lead.status === "registered_partner";
                    const isPending = !isRegisteredStudent && !isRegisteredPartner;

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-indigo-50 text-indigo-600 font-black text-xs flex items-center justify-center border border-indigo-100 shrink-0">
                              {lead.name ? lead.name[0]?.toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{lead.name || "Anonymous Lead"}</p>
                              <span className="text-[10px] text-slate-400">Source: Alife Stable</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-semibold text-slate-600">
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-slate-400" />
                            <span>{lead.phone || "No Phone"}</span>
                            {lead.phone && (
                              <a
                                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Chat on WhatsApp"
                                className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold hover:bg-emerald-100"
                              >
                                WhatsApp
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-xs text-slate-500">
                          {lead.createdDate ? lead.createdDate.toLocaleString() : "Recent"}
                        </td>

                        <td className="py-4 px-6">
                          {isRegisteredStudent && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <GraduationCap size={14} /> Student (Enrolled)
                            </span>
                          )}
                          {isRegisteredPartner && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <BadgeCheck size={14} /> Partner Active
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock size={14} /> Pending Call
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenRegisterModal(lead, "student")}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                            >
                              <span>Grant Student (₹999)</span>
                            </button>
                            <button
                              onClick={() => handleOpenRegisterModal(lead, "partner")}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                            >
                              <span>Partner (₹2,499)</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MANUAL SEARCH & UPGRADE USER */}
      {/* ========================================================= */}
      {activeTab === "search" && (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Search size={22} className="text-slate-400" />
              Search Existing User & Manage Access
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Search by email to upgrade a student to partner (with ₹999 fee deduction) or grant courses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                type="email"
                placeholder="Enter user email..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-indigo-600 text-sm font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all"
            >
              Search
            </button>
          </div>

          {userStatus === "searching" && (
            <div className="text-slate-400 text-xs font-bold flex items-center gap-2 animate-pulse">
              <Loader2 className="animate-spin" size={16} /> Searching database...
            </div>
          )}

          {userStatus === "not-found" && (
            <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-2">
              <AlertCircle size={18} /> No user found with this email. Click "+ Register New Customer" above to create an account.
            </div>
          )}

          {userStatus === "found" && userData && (
            <div className="mt-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 grid sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-6 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-lg">
                    {userData.name ? userData.name[0] : "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{userData.name || "Unnamed"}</h3>
                    <p className="text-xs text-slate-500">{userData.email}</p>
                    <p className="text-xs text-slate-400">Phone: {userData.phone || "Not set"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-slate-500">Current Role:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      userData.role === "partner"
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {userData.role ? userData.role.toUpperCase() : "STUDENT"}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Enrolled Courses: <span className="font-bold text-slate-900">{userData.enrolledCourses?.length || 0}</span>
                </p>
              </div>

              {/* Action Column for Searched User */}
              <div className="sm:col-span-6 space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                {userData.role !== "partner" ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-500" />
                      Upgrade to Partner (Reseller)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Standard Price ₹2,499 - Already Paid ₹999 = <span className="font-black text-indigo-600">₹1,500</span>
                    </p>
                    <button
                      onClick={handleDirectUpgradeToPartner}
                      className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      <BadgeCheck size={16} /> Upgrade to Partner (with Deduction)
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-purple-50 text-purple-700 rounded-xl border border-purple-100 text-xs font-bold flex items-center gap-2">
                    <BadgeCheck size={18} /> User is already an Approved Partner!
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="flex-1 text-xs border border-slate-200 rounded-lg p-2 bg-slate-50"
                  >
                    <option value="">Select Course...</option>
                    <option value="all_courses">🎓 All Courses Bundle (₹999)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={grantCourseAccess}
                    disabled={loading || !selectedCourse}
                    className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                  >
                    {loading ? "..." : "Enroll"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* MODAL: DIRECT USER REGISTRATION & ACCESS GRANT */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Admin Direct Enrollment
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                {modalForm.accessType === "upgrade"
                  ? "Upgrade Student to Partner"
                  : "Register & Grant Access"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter customer details and select whether they get Student Access (₹999) or Partnership Access (₹2,499).
              </p>
            </div>

            <form onSubmit={handleRegisterAndGrant} className="space-y-4">
              {/* Access Type Selection Cards */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleAccessTypeChange("student")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    modalForm.accessType === "student"
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-xs"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <GraduationCap size={20} className="mx-auto mb-1 text-indigo-600" />
                  <div className="text-xs font-bold">Student</div>
                  <div className="text-[10px] text-slate-400 font-semibold">₹999 (Courses)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAccessTypeChange("partner")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    modalForm.accessType === "partner"
                      ? "border-purple-600 bg-purple-50/50 text-purple-900 font-bold shadow-xs"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <Briefcase size={20} className="mx-auto mb-1 text-purple-600" />
                  <div className="text-xs font-bold">Partner</div>
                  <div className="text-[10px] text-slate-400 font-semibold">₹2,499 (Resell)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAccessTypeChange("upgrade")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    modalForm.accessType === "upgrade"
                      ? "border-amber-600 bg-amber-50/50 text-amber-900 font-bold shadow-xs"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <Zap size={20} className="mx-auto mb-1 text-amber-600" />
                  <div className="text-xs font-bold">Upgrade</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Deduct ₹999</div>
                </button>
              </div>

              {/* Field: Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Customer Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={modalForm.name}
                  onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium"
                />
              </div>

              {/* Field: Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address (Login ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@gmail.com"
                  value={modalForm.email}
                  onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium"
                />
              </div>

              {/* Field: Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number (WhatsApp)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={modalForm.phone}
                  onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium"
                />
              </div>

              {/* Pricing & Deduction Calculation Box */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">
                    {modalForm.accessType === "upgrade" ? "Net Upgrade Fee to Collect:" : "Fee Amount (Editable):"}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      value={modalForm.customPrice}
                      onChange={(e) => setModalForm({ ...modalForm, customPrice: e.target.value })}
                      className="w-24 px-2 py-1 text-right font-black text-slate-900 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                {modalForm.accessType === "upgrade" && (
                  <p className="text-[11px] text-slate-400">
                    💡 Base Partner fee ₹2,499 minus student course fee ₹999 = ₹1,500 net balance. You can edit the amount above.
                  </p>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={modalSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60 text-sm"
              >
                {modalSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Processing Enrollment...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>
                      Confirm & Grant {modalForm.accessType === "partner" || modalForm.accessType === "upgrade" ? "Partner Access" : "Student Access"}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccessManager;
