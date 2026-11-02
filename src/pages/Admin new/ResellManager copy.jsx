import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  ShieldCheck,
  UserCheck,
  X,
  CheckCircle2,
  AlertCircle,
  Mail,
  UserPlus,
  Trash2,
  Lock,
  Unlock,
  Clock,
  GraduationCap,
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const ResellManager = () => {
  // --- States for Access Grant & Whitelisting Flow ---
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [checkingLoading, setCheckingLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null); // { status: 'new' | 'exists', isCourseStudent, isPartner, feePaid, email, ... }
  const [actionLoading, setActionLoading] = useState(false);
  const [upgradeLoadingId, setUpgradeLoadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState(null);

  // Helper to extract timestamp in ms for sorting (latest-first)
  const getTimestamp = (item) => {
    const d = item.allowedAt || item.registeredAt || item.createdAt || item.timestamp;
    if (!d) return Date.now();
    if (d.toMillis) return d.toMillis();
    if (d.toDate) return d.toDate().getTime();
    if (d.seconds) return d.seconds * 1000 + (d.nanoseconds || 0) / 1000000;
    const parsed = new Date(d).getTime();
    return isNaN(parsed) ? 0 : parsed;
  };

  // Real-time listener: Auto-updates table when changes occur in database
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "allowedResellers"),
      (snapshot) => {
        const list = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        // Sort descending: Latest access granted appears at the very top
        list.sort((a, b) => getTimestamp(b) - getTimestamp(a));

        setAllowedEmails(list);
      },
      (error) => {
        console.error("Error fetching allowed resellers:", error);
      },
    );

    return () => unsubscribe();
  }, []);

  // --- 1. CHECK EMAIL STATUS ---
  const handleCheckEmail = async () => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    setCheckingLoading(true);
    setMessage(null);
    setCheckResult(null);

    try {
      // A. Check in allowedResellers whitelist collection
      const resellerDocRef = doc(db, "allowedResellers", cleanEmail);
      const resellerSnap = await getDoc(resellerDocRef);

      // B. Check in users collection
      const userQ = query(collection(db, "users"), where("email", "==", cleanEmail));
      const userSnap = await getDocs(userQ);
      const userDoc = userSnap.docs[0];
      const userData = userDoc?.data();

      if (resellerSnap.exists()) {
        const rData = resellerSnap.data();
        const isCourse = rData.accessType === "course";
        const fee = Number(rData.feePaid) || (isCourse ? 999 : 2499);

        // If accessType is course, they are strictly Course Student; otherwise Partner
        setCheckResult({
          status: "exists",
          email: cleanEmail,
          name: rData.name || userData?.name || cleanEmail.split("@")[0],
          accessType: isCourse ? "course" : "partnership",
          feePaid: fee,
          isCourseStudent: isCourse,
          isPartner: !isCourse,
          allowedDoc: rData,
          uid: userDoc?.id,
        });
      } else if (userData) {
        const isPartner = userData.role === "partner" || userData.isReseller;
        const fee = isPartner
          ? Number(userData.partnershipFeePaid) || 2499
          : Number(userData.courseFeePaid) || 999;

        setCheckResult({
          status: "exists",
          email: cleanEmail,
          name: userData.name || cleanEmail.split("@")[0],
          accessType: isPartner ? "partnership" : "course",
          feePaid: fee,
          isCourseStudent: !isPartner,
          isPartner: isPartner,
          uid: userDoc.id,
        });
      } else {
        // New Email - No access granted yet
        setCheckResult({
          status: "new",
          email: cleanEmail,
          name: cleanEmail.split("@")[0],
          isCourseStudent: false,
          isPartner: false,
        });
      }
    } catch (err) {
      console.error("Error checking email status:", err);
      setMessage({ type: "error", text: "Failed to verify email status. Please try again." });
    } finally {
      setCheckingLoading(false);
    }
  };

  // --- 2. GRANT ACCESS (NEW USER: COURSE ACCESS ₹999 OR PARTNERSHIP ₹2,499) ---
  const handleGrantAccess = async (accessType, price) => {
    if (!checkResult?.email) return;

    setActionLoading(true);
    setMessage(null);

    const emailLower = checkResult.email;
    const cleanName = checkResult.name || emailLower.split("@")[0];
    const isCourse = accessType === "course";

    try {
      // A. Save to allowedResellers whitelist
      const docRef = doc(db, "allowedResellers", emailLower);
      await setDoc(
        docRef,
        {
          email: emailLower,
          name: cleanName,
          accessType: accessType, // 'course' | 'partnership'
          feePaid: price,
          status: "allowed",
          allowedAt: serverTimestamp(),
        },
        { merge: true },
      );

      // B. If user already exists in users collection, update role & courses
      try {
        const userQuery = query(collection(db, "users"), where("email", "==", emailLower));
        const userSnap = await getDocs(userQuery);
        for (const uDoc of userSnap.docs) {
          const uid = uDoc.id;
          if (isCourse) {
            await updateDoc(doc(db, "users", uid), {
              role: "student",
              courseFeePaid: price,
              updatedAt: serverTimestamp(),
            });

            // Grant bundle access to all admin courses
            const ecRef = doc(db, "enrolledCourses", uid);
            await setDoc(
              ecRef,
              {
                userId: uid,
                courses: [
                  {
                    courseId: "bundle",
                    title: "All Courses Bundle Access",
                    enrolledAt: new Date().toISOString(),
                  },
                ],
                updatedAt: new Date().toISOString(),
              },
              { merge: true },
            );
          } else {
            await updateDoc(doc(db, "users", uid), {
              role: "partner",
              partnershipFeePaid: price,
              updatedAt: serverTimestamp(),
            });
          }
        }
      } catch (err) {
        console.warn("Could not auto-update users collection on grant:", err);
      }

      // C. Record Order in 'orders' collection for Sales & Transaction tracking
      try {
        await addDoc(collection(db, "orders"), {
          studentName: cleanName,
          studentEmail: emailLower,
          userId: emailLower,
          title: isCourse ? "Full Course Access" : "Partnership Resell Rights",
          productName: isCourse ? "Full Course Access (Student)" : "Partnership Plan (Reseller License)",
          item: isCourse ? "Full Course Access" : "Partnership Plan",
          productType: isCourse ? "course" : "partnership",
          type: isCourse ? "course" : "partnership",
          price: price,
          amount: price,
          saleValue: price,
          source: "admin_manual_grant",
          status: "completed",
          date: new Date().toISOString(),
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn("Could not record order for sales:", err);
      }

      setMessage({
        type: "success",
        text: isCourse
          ? `🎉 Course Access (₹999) granted for ${emailLower}! Student panel access ready and ₹999 added to Sales.`
          : `🎉 Partnership License (₹2,499) granted for ${emailLower}! Partner panel access ready and ₹2,499 added to Sales.`,
      });

      // Update checkResult to reflect newly granted status
      setCheckResult({
        status: "exists",
        email: emailLower,
        name: cleanName,
        accessType: accessType,
        feePaid: price,
        isCourseStudent: isCourse,
        isPartner: !isCourse,
      });
    } catch (error) {
      console.error("Error granting rights:", error);
      setMessage({ type: "error", text: "Failed to grant access rights." });
    } finally {
      setActionLoading(false);
    }
  };

  // --- 3. UPGRADE TO PARTNER (COURSE ₹999 -> PARTNERSHIP ₹2,499, BALANCE ₹1,500) ---
  const handleUpgradeToPartner = async (itemOrResult) => {
    const alreadyPaid = Number(itemOrResult.feePaid) || 999;
    const upgradeAmount = 2499 - alreadyPaid; // 2499 - 999 = 1500
    const emailLower = (itemOrResult.email || itemOrResult.id).toLowerCase().trim();

    if (
      !window.confirm(
        `Upgrade ${emailLower} from Course Access to Partnership License?\n\n` +
          `• Course Fee Already Paid: ₹${alreadyPaid}\n` +
          `• Total Partnership Fee: ₹2,499\n` +
          `• Remaining Balance to Add to Sales: ₹${upgradeAmount}\n\n` +
          `User will now log in to the Partner Panel.`,
      )
    ) {
      return;
    }

    setUpgradeLoadingId(emailLower);
    try {
      // A. Update allowedResellers
      await updateDoc(doc(db, "allowedResellers", emailLower), {
        accessType: "partnership",
        feePaid: 2499,
        previousFeePaid: alreadyPaid,
        upgradedAt: serverTimestamp(),
      });

      // B. Update users collection (role -> partner)
      const userQuery = query(collection(db, "users"), where("email", "==", emailLower));
      const userSnap = await getDocs(userQuery);
      for (const uDoc of userSnap.docs) {
        await updateDoc(doc(db, "users", uDoc.id), {
          role: "partner",
          partnershipFeePaid: 2499,
          upgradedToPartnerAt: serverTimestamp(),
        });
      }

      // C. Add Upgrade order to orders collection (₹1,500)
      await addDoc(collection(db, "orders"), {
        studentName: itemOrResult.name || emailLower.split("@")[0],
        studentEmail: emailLower,
        userId: emailLower,
        title: "Student to Partner Upgrade",
        productName: "Partnership Upgrade License",
        item: "Partnership Upgrade",
        productType: "partnership",
        type: "partnership",
        price: upgradeAmount,
        amount: upgradeAmount,
        saleValue: upgradeAmount,
        source: "admin_manual_grant",
        status: "completed",
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });

      alert(
        `🎉 Successfully upgraded ${emailLower} to Partner! User now has Partner Panel access, and ₹${upgradeAmount} has been recorded in Sales.`,
      );

      // If checkResult is active for this email, refresh it
      if (checkResult && checkResult.email === emailLower) {
        setCheckResult({
          status: "exists",
          email: emailLower,
          name: itemOrResult.name || emailLower.split("@")[0],
          accessType: "partnership",
          feePaid: 2499,
          isCourseStudent: false,
          isPartner: true,
        });
      }
    } catch (err) {
      console.error("Error upgrading user to partner:", err);
      alert("Failed to upgrade user to partner: " + err.message);
    } finally {
      setUpgradeLoadingId(null);
    }
  };

  // --- 4. REVOKE RIGHTS ---
  const handleRevokeRights = async (emailId) => {
    if (!window.confirm(`Are you sure you want to revoke access rights for ${emailId}?`))
      return;

    try {
      await deleteDoc(doc(db, "allowedResellers", emailId));
      alert("Access rights revoked successfully.");
      if (checkResult && checkResult.email === emailId) {
        setCheckResult(null);
      }
    } catch (error) {
      console.error("Error revoking rights:", error);
      alert("Failed to revoke rights.");
    }
  };

  // Search filter for table
  const filteredEmails = useMemo(() => {
    return allowedEmails.filter((item) => {
      const lower = searchQuery.toLowerCase();
      return (
        item.email?.toLowerCase().includes(lower) ||
        item.name?.toLowerCase().includes(lower) ||
        item.accessType?.toLowerCase().includes(lower) ||
        item.status?.toLowerCase().includes(lower)
      );
    });
  }, [allowedEmails, searchQuery]);

  return (
    <div className="space-y-12 pb-24 font-sans max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <span className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-transparent bg-clip-text">
              Resell Rights & Access Manager
            </span>
            <ShieldCheck className="text-indigo-500 size-8" />
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Verify user email to check current access level, upgrade Course Students to Partner, or pre-approve new users.
          </p>
        </div>
      </div>

      {/* INPUT FORM: EMAIL CHECK & CONDITIONAL ACCESS OPTIONS */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100">
          <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2 mb-2">
            <UserPlus size={24} className="text-indigo-500" />
            Check Email & Manage Access
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Enter the user's email below. The system checks if they already have <strong>Course Access</strong> to provide an instant <strong>Upgrade to Partner</strong> option, or prompts you to choose <strong>Course Bundle (₹999)</strong> vs <strong>Partnership License (₹2,499)</strong> for new users.
          </p>

          {/* EMAIL INPUT WITH CHECK BUTTON */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <input
                type="email"
                placeholder="Enter user email (e.g. user@gmail.com)"
                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium transition-all text-sm"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (checkResult) setCheckResult(null);
                  if (message) setMessage(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCheckEmail()}
              />
            </div>

            <button
              onClick={handleCheckEmail}
              disabled={checkingLoading || !emailInput}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm shrink-0 cursor-pointer disabled:opacity-50"
            >
              {checkingLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Search size={18} />
                  Check Email
                </>
              )}
            </button>

            {checkResult && (
              <button
                onClick={() => {
                  setCheckResult(null);
                  setEmailInput("");
                  setMessage(null);
                }}
                className="px-4 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                title="Clear and check another email"
              >
                <RefreshCw size={14} /> Clear
              </button>
            )}
          </div>

          {/* DYNAMIC RESULT CONTAINER (ONLY APPEARS AFTER CHECKING EMAIL) */}
          <AnimatePresence>
            {checkResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6"
              >
                {/* CASE 1: USER ALREADY HAS COURSE ACCESS -> SHOW UPGRADE TO PARTNER */}
                {checkResult.isCourseStudent && (
                  <div className="p-6 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="size-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <GraduationCap size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-slate-900 text-lg">
                            {checkResult.email}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-700 border border-indigo-200">
                            Course Access Active (Paid ₹{checkResult.feePaid || 999})
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs font-medium mt-1">
                          This user currently has Course Bundle Access (Student Panel). You can upgrade them to a full Partnership License.
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>
                            Course Fee Paid: <strong className="text-slate-800">₹{checkResult.feePaid || 999}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Total Partnership Fee: <strong className="text-slate-800">₹2,499</strong>
                          </span>
                          <span>•</span>
                          <span className="font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            Remaining Balance to Pay: ₹{2499 - (checkResult.feePaid || 999)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto shrink-0">
                      <button
                        onClick={() => handleUpgradeToPartner(checkResult)}
                        disabled={upgradeLoadingId === checkResult.email}
                        className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-7 py-4 rounded-xl font-black text-sm shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {upgradeLoadingId === checkResult.email ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <Zap size={18} className="text-amber-300" />
                            Upgrade to Partner (+₹{2499 - (checkResult.feePaid || 999)})
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* CASE 2: USER ALREADY HAS PARTNERSHIP LICENSE */}
                {checkResult.isPartner && (
                  <div className="p-6 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="size-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <ShieldCheck size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-slate-900 text-lg">
                            {checkResult.email}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Full Partnership Active (Paid ₹{checkResult.feePaid || 2499})
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs font-medium mt-1">
                          This user already holds a full Partnership Resell License & Partner Panel access. No further upgrade is required.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* CASE 3: NEW EMAIL -> ASK WHETHER COURSE ACCESS (₹999) OR PARTNERSHIP (₹2,499) */}
                {checkResult.status === "new" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-xs font-bold text-slate-700">
                          Email Verified: <span className="font-mono font-bold text-slate-900">{checkResult.email}</span> (No Existing Access)
                        </p>
                      </div>
                      <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                        Select Access Plan to Grant:
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* OPTION A: COURSE BUNDLE ACCESS (₹999) */}
                      <div className="p-6 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/20 transition-all flex flex-col justify-between shadow-sm group">
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="size-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <GraduationCap size={24} />
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 text-base">
                                  Course Bundle Access
                                </h4>
                                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                                  Student Panel Login
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-black text-slate-900">₹999</span>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">One-time</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mt-3 font-medium">
                            Grants access to all admin-uploaded courses. Student Panel opens upon registration and records <strong>+₹999</strong> in Sales.
                          </p>
                        </div>

                        <button
                          onClick={() => handleGrantAccess("course", 999)}
                          disabled={actionLoading}
                          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {actionLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              <GraduationCap size={16} />
                              Grant Course Access (₹999)
                            </>
                          )}
                        </button>
                      </div>

                      {/* OPTION B: PARTNERSHIP LICENSE (₹2,499) */}
                      <div className="p-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 transition-all flex flex-col justify-between shadow-sm group">
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="size-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <ShieldCheck size={24} />
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 text-base">
                                  Partnership License
                                </h4>
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                                  Partner Panel Login
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-black text-slate-900">₹2,499</span>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Standard Plan</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mt-3 font-medium">
                            Grants full Resell Rights & Academy Portal. Partner Panel opens upon registration and records <strong>+₹2,499</strong> in Sales.
                          </p>
                        </div>

                        <button
                          onClick={() => handleGrantAccess("partnership", 2499)}
                          disabled={actionLoading}
                          className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {actionLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              <ShieldCheck size={16} />
                              Grant Partnership Rights (₹2,499)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {message && (
            <div
              className={`mt-4 p-4 rounded-xl flex items-center gap-3 font-bold border text-sm ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 size={20} className="shrink-0" />
              ) : (
                <AlertCircle size={20} className="shrink-0" />
              )}
              {message.text}
            </div>
          )}
        </div>
      </section>

      {/* SEPARATOR */}
      <div className="relative py-4 mt-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-slate-50 px-4 text-sm text-slate-400 font-bold uppercase tracking-widest">
            Whitelisted Users, Access Plans & Upgrade
          </span>
        </div>
      </div>

      {/* TABLE: LIVE STATUS TRACKING */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden mt-2">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by email, name, or plan..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm focus:border-indigo-500 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-xs font-bold text-slate-500">
            Total Access Control: {allowedEmails.length} Users
          </div>
        </div>

        {allowedEmails.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Whitelisted User
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Access Plan & Fee
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Live Status
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmails.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-slate-500 font-medium"
                    >
                      No users found. Enter an email above to check access or grant new rights.
                    </td>
                  </tr>
                ) : (
                  filteredEmails.map((item) => {
                    const isCourse = item.accessType === "course";
                    const isUpgrading = upgradeLoadingId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* 1. User & Email */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                                isCourse
                                  ? "bg-indigo-50 text-indigo-600"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {isCourse ? <GraduationCap size={18} /> : <Mail size={18} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-slate-900 font-semibold block">
                                  {item.email}
                                </span>
                                {item.name && (
                                  <span className="text-xs text-slate-500 font-medium">
                                    ({item.name})
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                <Clock size={11} className="text-slate-400" />
                                Granted:{" "}
                                {new Date(getTimestamp(item)).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Access Plan & Fee */}
                        <td className="px-6 py-4">
                          {isCourse ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase border inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border-indigo-200">
                              <GraduationCap size={12} />
                              Course Access • ₹{item.feePaid || 999}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase border inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                              <ShieldCheck size={12} />
                              Partnership • ₹{item.feePaid || 2499}
                            </span>
                          )}
                        </td>

                        {/* 3. Live Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border inline-flex items-center gap-1.5 ${
                              item.status === "registered"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : item.status === "verified"
                                  ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                                  : "bg-amber-50 text-amber-600 border-amber-200"
                            }`}
                          >
                            {item.status === "allowed" && <Lock size={12} />}
                            {item.status === "verified" && <Unlock size={12} />}
                            {item.status === "registered" && <UserCheck size={12} />}
                            {item.status === "allowed" ? "Allowed (Pending)" : item.status}
                          </span>
                        </td>

                        {/* 4. Actions: Upgrade to Partner + Revoke */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isCourse && (
                              <button
                                onClick={() => handleUpgradeToPartner(item)}
                                disabled={isUpgrading}
                                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                title="Upgrade to Partnership License (+₹1,500)"
                              >
                                {isUpgrading ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <>
                                    <Zap size={13} className="text-amber-300" />
                                    Upgrade to Partner (+₹1,500)
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              onClick={() => handleRevokeRights(item.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all inline-flex items-center cursor-pointer"
                              title="Revoke Rights"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResellManager;
