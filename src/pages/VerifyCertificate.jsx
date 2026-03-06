import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Award,
  XCircle,
  ScanLine,
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

const VerifyCertificate = () => {
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!certId.trim()) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      // 1. Artificial Delay for "AI Scanning" feel (User experience)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 2. Real Database Query
      const certsRef = collection(db, "certificates");
      // Hum 'certificateId' field search kar rahe hain (e.g., IMP-WEB-12345)
      const q = query(certsRef, where("certificateId", "==", certId.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Data Found
        const docData = querySnapshot.docs[0].data();
        setResult(docData);
      } else {
        // Not Found
        setError(
          "Invalid Credential ID. No record found in our blockchain-verified database.",
        );
      }
    } catch (err) {
      console.error("Verification Error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-200">
      {/* --- BACKGROUND EFFECTS (AI Theme) --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#5edff4]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="max-w-xl w-full relative z-10">
        {/* --- HEADER --- */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex p-4 rounded-3xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-xl mb-6 shadow-2xl shadow-[#5edff4]/10"
          >
            <ShieldCheck className="w-12 h-12 text-[#5edff4]" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            Verify Credential
          </h1>
          <p className="text-slate-400 text-lg">
            Authenticate certificates issued by{" "}
            <span className="text-[#5edff4] font-semibold">
              Impact School of AI
            </span>
          </p>
        </div>

        {/* --- SEARCH CARD --- */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden"
        >
          {/* Top Line Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#5edff4]/50 to-transparent" />

          <form onSubmit={handleVerify} className="relative z-10">
            <label className="block text-slate-400 text-sm font-bold uppercase tracking-wider mb-3 ml-1">
              Certificate ID
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Award
                  className={`h-6 w-6 transition-colors ${loading ? "text-[#5edff4]" : "text-slate-500 group-focus-within:text-[#5edff4]"}`}
                />
              </div>
              <input
                type="text"
                placeholder="e.g. IMP-AI-883920"
                className="w-full bg-slate-950/60 border border-slate-700 text-white text-lg rounded-2xl py-5 pl-14 pr-4 focus:outline-none focus:ring-2 focus:ring-[#5edff4]/50 focus:border-[#5edff4] transition-all placeholder-slate-600 shadow-inner"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !certId}
              className="mt-6 w-full bg-gradient-to-r from-[#5edff4] to-[#0891b2] text-slate-950 font-black text-lg py-5 rounded-2xl shadow-lg shadow-[#5edff4]/20 hover:shadow-[#5edff4]/40 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-6 h-6" />
                  Verifying...
                </>
              ) : (
                <>
                  Validate Now <Search className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* --- RESULTS AREA --- */}
        <div className="mt-8 min-h-[100px]">
          <AnimatePresence mode="wait">
            {/* 1. LOADING STATE (Scanner Animation) */}
            {loading && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-6 text-[#5edff4]"
              >
                <div className="relative w-24 h-24 mb-4">
                  <div className="absolute inset-0 border-2 border-[#5edff4]/30 rounded-xl" />
                  <div className="absolute inset-0 border-2 border-[#5edff4] rounded-xl animate-ping opacity-20" />
                  <motion.div
                    className="absolute top-0 left-0 w-full h-1 bg-[#5edff4] shadow-[0_0_15px_#5edff4]"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <ScanLine className="absolute inset-0 m-auto w-10 h-10 text-[#5edff4]" />
                </div>
                <p className="text-sm font-mono tracking-widest uppercase animate-pulse">
                  Scanning Database...
                </p>
              </motion.div>
            )}

            {/* 2. ERROR STATE */}
            {!loading && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-2xl flex items-center gap-4 shadow-xl"
              >
                <XCircle className="w-10 h-10 text-red-500 shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-red-400">
                    Verification Failed
                  </h3>
                  <p className="text-sm opacity-80">{error}</p>
                </div>
              </motion.div>
            )}

            {/* 3. SUCCESS STATE (The "Official" Look) */}
            {!loading && result && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-gradient-to-b from-slate-900 to-slate-950 border border-[#5edff4]/30 rounded-[2rem] p-1 relative overflow-hidden shadow-[0_0_50px_rgba(94,223,244,0.15)]"
              >
                {/* Holographic Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#5edff4]/10 to-transparent opacity-50 pointer-events-none" />

                <div className="bg-slate-950/90 rounded-[1.8rem] p-8 relative z-10">
                  {/* Verified Badge */}
                  <div className="flex flex-col items-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white">
                      Officially Verified
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      ID:{" "}
                      <span className="font-mono text-[#5edff4]">
                        {result.certificateId}
                      </span>
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">
                        Student Name
                      </span>
                      <span className="text-white font-bold text-lg">
                        {result.studentName}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">
                        Course
                      </span>
                      <span className="text-white font-bold text-right">
                        {result.courseTitle}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">
                        Issue Date
                      </span>
                      <span className="text-white font-bold">
                        {result.issueDate}
                      </span>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-slate-500 text-xs">Issued By</span>
                      <div className="flex items-center gap-2">
                        <img
                          src="https://ui-avatars.com/api/?name=Impact+School&background=0D9488&color=fff"
                          alt="Logo"
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-[#5edff4] font-bold text-sm">
                          {result.issuedBy || "Impact School of AI"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
