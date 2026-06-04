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
} from "lucide-react";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const ResellManager = () => {
  // --- States for Whitelisting Flow ---
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState(null);

  // Real-time listener: Jaise hi database me badlav hoga, bina reload kiye table update hogi
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "allowedResellers"),
      (snapshot) => {
        const list = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));
        setAllowedEmails(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching allowed resellers:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // --- 1. GRANT RESELL RIGHTS (EMAIL ADD KARNA) ---
  const handleGrantRights = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    setActionLoading(true);
    setMessage(null);

    try {
      // Email ko hi Document ID bana rhe hain taaki backend pe search fast ho jaye
      const docRef = doc(db, "allowedResellers", newEmail.trim().toLowerCase());

      // Default status 'allowed' rahega, jab user register karega toh 'registered' ho jayega
      await setDoc(docRef, {
        email: newEmail.trim().toLowerCase(),
        status: "allowed",
        allowedAt: serverTimestamp(),
      });

      setNewEmail("");
      setMessage({
        type: "success",
        text: `Resell rights pre-approved for ${newEmail}. They can now verify and register.`,
      });
    } catch (error) {
      console.error("Error granting resell rights:", error);
      setMessage({ type: "error", text: "Failed to grant access rights." });
    } finally {
      setActionLoading(false);
    }
  };

  // --- 2. REVOKE RESELL RIGHTS (ACCESS HATA NA) ---
  const handleRevokeRights = async (emailId) => {
    if (
      !window.confirm(
        `Are you sure you want to revoke resell rights for ${emailId}?`,
      )
    )
      return;

    try {
      await deleteDoc(doc(db, "allowedResellers", emailId));
      alert("Access rights revoked successfully.");
    } catch (error) {
      console.error("Error revoking rights:", error);
      alert("Failed to revoke rights.");
    }
  };

  // Search filter for table
  const filteredEmails = useMemo(() => {
    return allowedEmails.filter((item) =>
      item.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allowedEmails, searchQuery]);

  return (
    <div className="space-y-12 pb-24 font-sans max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <span className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-transparent bg-clip-text">
              Resell Rights Manager
            </span>
            <ShieldCheck className="text-indigo-500 size-8" />
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Pre-approve emails for resale licenses. Whitelisted users will
            verify during registration.
          </p>
        </div>
      </div>

      {/* INPUT FORM: EMAIL ADD KARNE KE LIYE */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100">
          <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2 mb-4">
            <UserPlus size={24} className="text-indigo-500" />
            Pre-Approve New Partner Email
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Enter the user's email below. Once added, when they try to register
            with this email, they will see a verification prompt to activate
            their account.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <input
                type="email"
                placeholder="partner.user@gmail.com"
                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium transition-all"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGrantRights()}
              />
            </div>
            <button
              onClick={handleGrantRights}
              disabled={actionLoading}
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/10 active:scale-95 flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Grant Resell Rights"
              )}
            </button>
          </div>

          {message && (
            <div
              className={`mt-4 p-4 rounded-xl flex items-center gap-3 font-bold border ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
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
            Whitelisted Emails & Live Tracking
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
              placeholder="Search whitelisted emails..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-xs font-bold text-slate-500">
            Total Access Control: {allowedEmails.length} Emails
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Whitelisted Email
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                    Current Live Status
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">
                    Revoke Rights
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmails.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-12 text-center text-slate-500 font-medium"
                    >
                      No emails whitelisted yet. Enter an email above to grant
                      rights.
                    </td>
                  </tr>
                ) : (
                  filteredEmails.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Mail size={18} />
                          </div>
                          <span className="font-mono text-sm text-slate-900 font-semibold">
                            {item.email}
                          </span>
                        </div>
                      </td>
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
                          {item.status === "registered" && (
                            <UserCheck size={12} />
                          )}
                          {item.status === "allowed"
                            ? "Allowed (Pending)"
                            : item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRevokeRights(item.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all inline-flex items-center"
                          title="Revoke Rights"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
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
