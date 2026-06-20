import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // [ADDED]
import { useAuth } from "../../context/AuthContext";
import { useAgency } from "../../context/AgencyContext";
import { db } from "../../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  Rocket,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Save,
  Building2,
  MessageCircle,
  GraduationCap,
  BookOpen,
  DollarSign,
  Smartphone,
  Layout,
} from "lucide-react";

// Simple debounce function
const simpleDebounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const AgencySetup = () => {
  const { currentUser } = useAuth();
  const { refreshAgency } = useAgency();
  const navigate = useNavigate(); // [ADDED]

  // --- STEPS CONFIG ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  // --- DATA STATES ---
  const [courses, setCourses] = useState([]);
  const [ebooks, setEbooks] = useState([]);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    instituteName: "",
    subdomain: "",
    whatsappNumber: "",
    email: "",
    upiId: "",
    customPrices: {},
  });

  const [oldSubdomain, setOldSubdomain] = useState(null);
  const [subdomainStatus, setSubdomainStatus] = useState("idle");

  // --- FETCH INITIAL DATA ---
  useEffect(() => {
    const init = async () => {
      if (!currentUser?.uid) return;
      setDataLoading(true);
      try {
        // 1. Fetch Inventory
        const [cSnap, eSnap] = await Promise.all([
          getDocs(collection(db, "courseVideos")),
          getDocs(collection(db, "ebooks")),
        ]);

        setCourses(
          cSnap.docs.map((d) => ({ id: d.id, type: "course", ...d.data() }))
        );
        setEbooks(
          eSnap.docs.map((d) => ({ id: d.id, type: "ebook", ...d.data() }))
        );

        // 2. Check Existing Agency
        const docRef = doc(db, "agencies", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            instituteName: data.name || "",
            subdomain: data.subdomain || "",
            whatsappNumber: data.whatsapp || "",
            email: data.email || currentUser.email || "",
            upiId: data.upi || "",
            customPrices: data.customPrices || {},
          });
          setOldSubdomain(data.subdomain);
          setIsEditMode(true);
        } else {
          setFormData((prev) => ({ ...prev, email: currentUser.email || "" }));
        }
      } catch (err) {
        console.error("Init Error:", err);
      } finally {
        setDataLoading(false);
      }
    };
    init();
  }, [currentUser]);

  // --- SUBDOMAIN CHECKER ---
  const checkAvailability = useCallback(
    simpleDebounce(async (sub) => {
      if (!sub || sub.length < 3) {
        setSubdomainStatus("idle");
        return;
      }

      if (isEditMode && sub === oldSubdomain) {
        setSubdomainStatus("available");
        return;
      }

      setSubdomainStatus("checking");

      try {
        const subRef = doc(db, "subdomains", sub);
        const subSnap = await getDoc(subRef);

        if (subSnap.exists()) {
          setSubdomainStatus("unavailable");
        } else {
          setSubdomainStatus("available");
        }
      } catch (error) {
        console.error("Check failed", error);
        setSubdomainStatus("idle");
      }
    }, 500),
    [isEditMode, oldSubdomain]
  );

  const handleSubdomainChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData({ ...formData, subdomain: val });
    checkAvailability(val);
  };

  const handlePriceChange = (itemId, val) => {
    setFormData((prev) => ({
      ...prev,
      customPrices: {
        ...prev.customPrices,
        [itemId]: val,
      },
    }));
  };

  // --- SUBMIT (FIXED REDIRECTION) ---
  const handleFinalSubmit = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    try {
      const agencyRef = doc(db, "agencies", currentUser.uid);

      const payload = {
        name: formData.instituteName,
        subdomain: formData.subdomain,
        whatsapp: formData.whatsappNumber,
        email: formData.email,
        upi: formData.upiId,
        customPrices: formData.customPrices,
        updatedAt: new Date(),
        ownerId: currentUser.uid,
        status: "Active",
      };

      // 1. Save Agency
      await setDoc(agencyRef, payload, { merge: true });

      // 2. Save Subdomain
      if (formData.subdomain !== oldSubdomain) {
        await setDoc(doc(db, "subdomains", formData.subdomain), {
          ownerId: currentUser.uid,
          agencyName: formData.instituteName,
        });
      }

      // 3. Refresh Context
      if (refreshAgency && typeof refreshAgency === "function") {
        await refreshAgency();
      }

      // [CRITICAL FIX] Handle Redirect
      if (!isEditMode) {
        // If NEW setup, force reload to Dashboard to update User Role/Claims
        alert("Academy Launched Successfully! 🚀 Redirecting to Dashboard...");

        // Using window.location.href instead of navigate ensures a FULL STATE REFRESH
        // This fixes the issue where you have to logout/login to see the Partner Dashboard
        window.location.href = "/agency/dashboard";
        return;
      }

      alert("Academy Settings Updated!");
      setIsEditMode(true);
      setOldSubdomain(formData.subdomain);
    } catch (error) {
      console.error("Save Error:", error);
      alert("Failed to save settings. Check console.");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-12 text-indigo-600 animate-spin" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
            Loading Academy Console...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-10 font-sans text-slate-900 flex justify-center">
      <div className="w-full max-w-5xl">
        {/* HEADER */}
        <div className="text-center mb-8 lg:mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm mb-2">
            <span
              className={`size-2 rounded-full ${isEditMode ? "bg-emerald-500" : "bg-indigo-500"
                } animate-pulse`}
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {isEditMode ? "Live Mode" : "Setup Mode"}
            </span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter text-slate-900">
            {isEditMode ? "Academy Settings" : "Setup Your Academy"}
          </h1>
          <p className="text-slate-400 font-medium text-xs lg:text-sm px-4">
            {isEditMode
              ? "Update your commercial & operational configurations."
              : "Configure your digital institute in 4 simple steps."}
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-[32px] lg:rounded-[40px] shadow-xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row min-h-[500px] lg:min-h-[600px]">
          {/* LEFT: STEPS SIDEBAR */}
          <div className="w-full lg:w-[280px] bg-slate-950 p-6 lg:p-8 text-white flex flex-col justify-between shrink-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 size-64 bg-indigo-500/20 rounded-full blur-[80px] -ml-20 -mt-20 pointer-events-none" />

            <div className="relative z-10 space-y-6 lg:space-y-8">
              <div className="flex justify-between items-center lg:block">
                <div>
                  <h3 className="text-lg lg:text-xl font-black uppercase tracking-tight mb-1">
                    Config Wizard
                  </h3>
                  <p className="text-[10px] lg:text-xs text-slate-400 font-bold">
                    Step {step} of 4
                  </p>
                </div>
                <div className="lg:hidden text-xs font-black bg-white/10 px-2 py-1 rounded-lg">
                  {step}/4
                </div>
              </div>

              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                {[
                  { id: 1, label: "Identity", icon: <Layout size={16} /> },
                  { id: 2, label: "Pricing", icon: <DollarSign size={16} /> },
                  {
                    id: 3,
                    label: "Connect",
                    icon: <MessageCircle size={16} />,
                  },
                  { id: 4, label: "Launch", icon: <Rocket size={16} /> },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (isEditMode) setStep(s.id);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all min-w-[120px] lg:min-w-0 ${step === s.id
                        ? "bg-white/10 text-white shadow-lg border border-white/5"
                        : step > s.id
                          ? "text-emerald-400"
                          : "text-slate-500"
                      } ${isEditMode
                        ? "cursor-pointer hover:bg-white/5"
                        : "cursor-default"
                      }`}
                  >
                    <div
                      className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${step > s.id ? "bg-emerald-500/10" : "bg-black/20"
                        }`}
                    >
                      {step > s.id ? <CheckCircle2 size={14} /> : s.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: FORM CONTENT */}
          <div className="flex-1 flex flex-col bg-white min-w-0">
            <div className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 max-w-lg mx-auto"
                  >
                    <div className="text-center mb-8">
                      <div className="size-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Building2 size={28} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase">
                        Brand Identity
                      </h2>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        Name your digital institute
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Institute Name
                        </label>
                        <input
                          type="text"
                          placeholder="Ex. Nexus Academy"
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white p-4 rounded-2xl font-bold text-slate-900 outline-none transition-all"
                          value={formData.instituteName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              instituteName: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Subdomain
                        </label>
                        <div className="relative group">
                          <input
                            type="text"
                            placeholder="my-academy"
                            className={`w-full bg-slate-50 border-2 p-4 pr-32 rounded-2xl font-black text-slate-900 outline-none transition-all lowercase ${subdomainStatus === "available"
                                ? "border-emerald-100 focus:border-emerald-200"
                                : subdomainStatus === "unavailable"
                                  ? "border-red-100 focus:border-red-200"
                                  : "border-transparent focus:border-indigo-100"
                              }`}
                            value={formData.subdomain}
                            onChange={handleSubdomainChange}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none hidden sm:block">
                            .i-cpp.com
                          </span>
                        </div>

                        <div className="flex items-center gap-2 ml-1 h-5">
                          {subdomainStatus === "checking" && (
                            <>
                              <Loader2
                                size={12}
                                className="animate-spin text-slate-400"
                              />
                              <span className="text-[10px] font-bold text-slate-400">
                                Checking availability...
                              </span>
                            </>
                          )}
                          {subdomainStatus === "available" && (
                            <>
                              <CheckCircle2
                                size={12}
                                className="text-emerald-500"
                              />
                              <span className="text-[10px] font-bold text-emerald-500">
                                Available! This URL is yours.
                              </span>
                            </>
                          )}
                          {subdomainStatus === "unavailable" && (
                            <>
                              <AlertCircle size={12} className="text-red-500" />
                              <span className="text-[10px] font-bold text-red-500">
                                Oops! Already taken. Try another.
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: PRICING */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase">
                          Pricing Strategy
                        </h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                          Set your margins. You keep the profit.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg">
                          <div className="size-2 rounded-full bg-slate-300" />{" "}
                          <span className="text-[9px] font-bold uppercase text-slate-500">
                            Cost
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg">
                          <div className="size-2 rounded-full bg-emerald-500" />{" "}
                          <span className="text-[9px] font-bold uppercase text-emerald-600">
                            Profit
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Courses */}
                      <section>
                        <div className="flex items-center gap-2 mb-4">
                          <GraduationCap
                            size={18}
                            className="text-indigo-600"
                          />
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                            Video Courses
                          </h3>
                        </div>
                        <div className="grid gap-4">
                          {courses.map((course) => {
                            const adminPrice = Number(
                              course.price || course.discountPrice || 0
                            );
                            const sellingPrice =
                              formData.customPrices[course.id] || adminPrice;
                            const profit = Math.max(
                              0,
                              sellingPrice - adminPrice
                            );

                            return (
                              <div
                                key={course.id}
                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-4"
                              >
                                <div className="flex-1 w-full text-center sm:text-left">
                                  <p className="text-xs font-black text-slate-900 line-clamp-1">
                                    {course.title}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                    Admin Cost: ₹{adminPrice}
                                  </p>
                                </div>
                                <div className="flex items-center justify-center gap-4 w-full sm:w-auto">
                                  <div className="flex flex-col items-end">
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1">
                                      Your Price
                                    </label>
                                    <div className="relative w-24 sm:w-28">
                                      <input
                                        type="number"
                                        className="w-full pl-5 pr-2 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:border-indigo-300 transition-all text-right"
                                        value={sellingPrice}
                                        onChange={(e) =>
                                          handlePriceChange(
                                            course.id,
                                            e.target.value
                                          )
                                        }
                                      />
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                                        ₹
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end w-16 sm:w-20">
                                    <label className="text-[9px] font-black text-emerald-600 uppercase mb-1">
                                      Profit
                                    </label>
                                    <span className="text-sm font-black text-emerald-600">
                                      +₹{profit}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      {/* E-Books */}
                      {/*  <section>
                        <div className="flex items-center gap-2 mb-4">
                          <BookOpen size={18} className="text-orange-600" />
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                            E-Books
                          </h3>
                        </div>
                        <div className="grid gap-4">
                          {ebooks.map((ebook) => {
                            const adminPrice = Number(
                              ebook.price || ebook.discountPrice || 0
                            );
                            const sellingPrice =
                              formData.customPrices[ebook.id] || adminPrice;
                            const profit = Math.max(
                              0,
                              sellingPrice - adminPrice
                            );

                            return (
                              <div
                                key={ebook.id}
                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-4"
                              >
                                <div className="flex-1 w-full text-center sm:text-left">
                                  <p className="text-xs font-black text-slate-900 line-clamp-1">
                                    {ebook.title}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                    Admin Cost: ₹{adminPrice}
                                  </p>
                                </div>
                                <div className="flex items-center justify-center gap-4 w-full sm:w-auto">
                                  <div className="flex flex-col items-end">
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1">
                                      Your Price
                                    </label>
                                    <div className="relative w-24 sm:w-28">
                                      <input
                                        type="number"
                                        className="w-full pl-5 pr-2 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:border-indigo-300 transition-all text-right"
                                        value={sellingPrice}
                                        onChange={(e) =>
                                          handlePriceChange(
                                            ebook.id,
                                            e.target.value
                                          )
                                        }
                                      />
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                                        ₹
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end w-16 sm:w-20">
                                    <label className="text-[9px] font-black text-emerald-600 uppercase mb-1">
                                      Profit
                                    </label>
                                    <span className="text-sm font-black text-emerald-600">
                                      +₹{profit}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section> */ }
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: CONNECT */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 max-w-lg mx-auto"
                  >
                    <div className="text-center mb-8">
                      <div className="size-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={28} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase">
                        Automation
                      </h2>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        Connect your sales channel
                      </p>
                    </div>

                    <div className="bg-emerald-50/50 p-6 rounded-[24px] border border-emerald-100 mb-6">
                      <div className="flex items-start gap-3">
                        <Smartphone
                          size={20}
                          className="text-emerald-600 mt-1"
                        />
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase mb-1">
                            How it works?
                          </h4>
                          <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                            When a student clicks "Buy Now" on your site, they
                            will be redirected to your WhatsApp with a
                            pre-filled message.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          WhatsApp Number
                        </label>
                        <input
                          type="tel"
                          placeholder="Ex. 919876543210"
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white p-4 rounded-2xl font-bold text-slate-900 outline-none transition-all"
                          value={formData.whatsappNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              whatsappNumber: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Support Email
                        </label>
                        <input
                          type="email"
                          placeholder="help@nexus.com"
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white p-4 rounded-2xl font-bold text-slate-900 outline-none transition-all"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          UPI ID (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="yourname@upi"
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-100 focus:bg-white p-4 rounded-2xl font-bold text-slate-900 outline-none transition-all"
                          value={formData.upiId}
                          onChange={(e) =>
                            setFormData({ ...formData, upiId: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: LAUNCH */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-lg mx-auto py-10"
                  >
                    <div className="size-32 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-300">
                      <Rocket size={48} className="animate-bounce" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                      {isEditMode ? "Save Changes?" : "Ready for Liftoff!"}
                    </h2>

                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">
                      {isEditMode
                        ? "Your academy settings will be updated immediately across the platform."
                        : `You are about to launch "${formData.instituteName}". Your custom domain and pricing structure are set.`}
                    </p>

                    <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 mb-8 text-left space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Academy Name
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {formData.instituteName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Subdomain
                        </span>
                        <span className="text-sm font-black text-indigo-600">
                          {formData.subdomain}.i-cpp.com
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          WhatsApp
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {formData.whatsappNumber}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleFinalSubmit}
                      disabled={loading}
                      className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />{" "}
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Save size={18} />{" "}
                          {isEditMode ? "Update Academy" : "Launch Academy"}
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* NAV FOOTER */}
            <div className="p-6 lg:p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1 || loading}
                className="px-6 py-3 text-slate-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:text-slate-900 disabled:opacity-0 transition-all"
              >
                <ArrowLeft size={16} /> Back
              </button>

              {step < 4 && (
                <button
                  onClick={() => {
                    // Validation
                    if (
                      step === 1 &&
                      (!formData.instituteName ||
                        !formData.subdomain ||
                        (subdomainStatus !== "available" && !isEditMode))
                    ) {
                      alert(
                        "Please provide a valid Name and an available Subdomain."
                      );
                      return;
                    }
                    if (
                      step === 3 &&
                      (!formData.whatsappNumber || !formData.email)
                    ) {
                      alert("WhatsApp and Email are required.");
                      return;
                    }
                    setStep((s) => s + 1);
                  }}
                  className="px-8 py-3 bg-slate-900 text-white rounded-[18px] font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-lg"
                >
                  Next Step <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencySetup;
