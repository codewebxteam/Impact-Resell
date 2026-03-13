import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext"; //
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Briefcase,
  BadgeCheck,
  Loader2,
  ArrowRight,
  Package,
} from "lucide-react"; //
import { useNavigate } from "react-router-dom"; //
import {
  doc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore"; //
import { db } from "../firebase/config"; //

const AuthModal = ({ isOpen, onClose, defaultMode = "login" }) => {
  const { login, signup } = useAuth(); //
  const navigate = useNavigate(); //

  const [mode, setMode] = useState(defaultMode); // 'login' | 'signup' | 'partner'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Partner Specific State
  const [partnerVerified, setPartnerVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agencyName: "",
    partnerId: "",
    packageName: "",
  });

  // --- Password Strength Logic ---
  const [strength, setStrength] = useState({ score: 0, label: "", color: "" });

  const checkStrength = (pass) => {
    let score = 0;
    if (pass.length > 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const levels = [
      { label: "Too Weak", color: "bg-red-400" },
      { label: "Weak", color: "bg-orange-400" },
      { label: "Moderate", color: "bg-yellow-400" },
      { label: "Strong", color: "bg-green-400" },
      { label: "Very Strong", color: "bg-emerald-500" },
    ];
    setStrength({ ...levels[score], score: (score / 4) * 100 });
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setErrors({});
      setPartnerVerified(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        agencyName: "",
        partnerId: "",
        packageName: "",
      });
      setStrength({ score: 0, label: "", color: "" });
    }
  }, [isOpen, defaultMode]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "password") checkStrength(value); //
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Real Verification for Partner ID using Firestore
  const handlePartnerVerify = async () => {
    if (!formData.partnerId) {
      setErrors({ ...errors, partnerId: "Please enter a Partner ID" });
      return;
    }
    if (!formData.email) {
      setErrors({ ...errors, email: "Please enter email first" });
      return;
    }

    setVerifying(true);

    try {
      // Query Firestore for the code assigned to this specific email
      const q = query(
        collection(db, "partnerCodes"),
        where("email", "==", formData.email.toLowerCase().trim()),
        where("code", "==", formData.partnerId.trim()),
        where("status", "==", "unused"),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setPartnerVerified(true);
        setErrors({ ...errors, partnerId: null });
      } else {
        setPartnerVerified(false);
        setErrors({ ...errors, partnerId: "Invalid code or email mismatch" });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setErrors({ ...errors, partnerId: "Verification service error" });
    } finally {
      setVerifying(false);
    }
  };

  // [FIXED LOGIC] Uses Firebase Login/Signup with Proper Redirection
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (
      (mode === "signup" || mode === "partner") &&
      formData.password !== formData.confirmPassword
    ) {
      setErrors({ ...errors, confirmPassword: "Passwords do not match" });
      return;
    }


    setLoading(true);

    try {
      if (mode === "login") {
        // [1] Firebase Login
        const userCredential = await login(formData.email, formData.password); //

        // [2] Fetch Role from Firestore to Redirect correctly
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid)); //
        const userData = userDoc.data();

        // [3] Check Role and Navigate
        if (userData?.role === "partner") {
          navigate("/partner-dashboard"); //
        } else {
          navigate("/dashboard"); //
        }
      } else {
        // Determine role based on mode
        const userRole = mode === "partner" ? "partner" : "student"; //

        // Firebase Signup with role
        await signup(
          formData.email,
          formData.password,
          formData.name,
          userRole,
        ); //

        // If Partner, mark the code as used in Firestore
        if (mode === "partner") {
          const q = query(
            collection(db, "partnerCodes"),
            where("email", "==", formData.email.toLowerCase().trim()),
            where("code", "==", formData.partnerId.trim()),
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const codeDoc = querySnapshot.docs[0];
            await updateDoc(doc(db, "partnerCodes", codeDoc.id), {
              status: "used",
              usedAt: new Date().toISOString(),
            });
          }
          navigate("/agency-setup"); //
        } else {
          navigate("/dashboard"); //
        }
      }

      setLoading(false);
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Auth Error:", error);
      setLoading(false);

      // Map Firebase error codes to friendly messages
      let msg = "Authentication failed. Please try again.";
      if (error.code === "auth/invalid-credential")
        msg = "Incorrect email or password.";
      if (error.code === "auth/email-already-in-use")
        msg = "This email is already registered.";
      if (error.code === "auth/weak-password")
        msg = "Password should be at least 6 characters.";

      // Display error
      alert(msg);
    }
  };

  if (!isOpen) return null; //

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 pt-8 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === "login" && "Welcome Back"}
              {mode === "signup" && "Create Account"}
              {mode === "partner" && "Become a Partner"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === "login" && "Enter your details to access your account."}
              {mode === "signup" && "Start your learning journey today."}
              {mode === "partner" && "Join our agency network & grow."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors text-slate-500 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. LOGIN MODE FIELDS */}
            {mode === "login" && (
              <>
                <InputGroup
                  icon={Mail}
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                />

                <div className="space-y-4">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 size-5 text-slate-400 group-focus-within:text-[#5edff4] transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 outline-none focus:border-[#5edff4] focus:ring-1 focus:ring-[#5edff4] transition-all font-medium text-slate-700"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm font-bold text-[#0891b2] hover:text-[#5edff4] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            )}

            {/* 2. SIGNUP & PARTNER COMMON FIELDS */}
            {(mode === "signup" || mode === "partner") && (
              <>
                <InputGroup
                  icon={User}
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <InputGroup
                  icon={Phone}
                  name="phone"
                  placeholder="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <InputGroup
                  icon={Mail}
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </>
            )}

            {/* 3. PARTNER SPECIFIC FIELDS */}
            {mode === "partner" && (
              <>
                <InputGroup
                  icon={Briefcase}
                  name="agencyName"
                  placeholder="Agency Name"
                  value={formData.agencyName}
                  onChange={handleChange}
                />

                <div className="relative group">
                  <Package className="absolute left-4 top-3.5 size-5 text-slate-400 group-focus-within:text-[#5edff4] pointer-events-none" />
                  
                  <div className="absolute right-4 top-4 pointer-events-none">
                    <div className="border-t-4 border-l-4 border-transparent border-t-slate-400"></div>
                  </div>
                  {errors.packageName && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      {errors.packageName}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <InputGroup
                      icon={BadgeCheck}
                      name="partnerId"
                      placeholder="Partner ID"
                      value={formData.partnerId}
                      onChange={handleChange}
                      error={errors.partnerId}
                      disabled={partnerVerified}
                      success={partnerVerified}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePartnerVerify}
                    disabled={
                      verifying || partnerVerified || !formData.partnerId
                    }
                    className={`h-[46px] px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center min-w-20 cursor-pointer
                      ${
                        partnerVerified
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-slate-900 text-white hover:bg-[#5edff4] hover:text-slate-900"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {verifying ? (
                      <Loader2 className="animate-spin size-5" />
                    ) : partnerVerified ? (
                      "Verified"
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>
              </>
            )}

            {/* 4. PASSWORD SECTION (FOR SIGNUP & PARTNER) */}
            {(mode === "signup" || mode === "partner") && (
              <div className="space-y-4">
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 size-5 text-slate-400 group-focus-within:text-[#5edff4] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 outline-none focus:border-[#5edff4] focus:ring-1 focus:ring-[#5edff4] transition-all font-medium text-slate-700"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>

                {/* --- PASSWORD STRENGTH METER --- */}
                {formData.password && (
                  <div className="px-1 space-y-1.5 animate-in fade-in slide-in-from-top-1">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Security Strength
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase ${strength.color.replace(
                          "bg-",
                          "text-",
                        )}`}
                      >
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${strength.score}%` }}
                        className={`h-full ${strength.color} transition-all duration-500`}
                      />
                    </div>
                  </div>
                )}

                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 size-5 text-slate-400 group-focus-within:text-[#5edff4] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 border rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-1 transition-all font-medium text-slate-700
                      ${
                        errors.confirmPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-slate-200 focus:border-[#5edff4] focus:ring-[#5edff4]"
                      }`}
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* --- SUBMIT BUTTON --- */}
            <button
              type="submit"
              disabled={loading || (mode === "partner" && !partnerVerified)}
              className="w-full bg-slate-900 text-white font-bold text-lg py-3.5 rounded-xl hover:bg-[#5edff4] hover:text-slate-900 transition-all shadow-lg hover:shadow-[#5edff4]/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin size-6" />
              ) : (
                <>
                  {mode === "login" && "Login"}
                  {mode === "signup" && "Create Account"}
                  {mode === "partner" && "Register Partner"}
                  <ArrowRight className="size-5" />
                </>
              )}
            </button>
          </form>

          {/* --- FOOTER SWITCHES --- */}
          <div className="mt-8 text-center space-y-3">
            {mode === "login" && (
              <>
                <p className="text-slate-500 text-sm">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="font-bold text-slate-900 hover:text-[#5edff4] transition-colors cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200"></span>
                  </div>
                </div>
              </>
            )}

            {mode === "signup" && (
              <>
                <p className="text-slate-500 text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="font-bold text-slate-900 hover:text-[#5edff4] transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                </p>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200"></span>
                  </div>
                </div>
              </>
            )}

            {mode === "partner" && (
              <p className="text-slate-500 text-sm">
                Already registered?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="font-bold text-slate-900 hover:text-[#5edff4] transition-colors cursor-pointer"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Reusable Input Component ---
const InputGroup = ({ icon: Icon, error, success, ...props }) => (
  <div className="relative group">
    <Icon
      className={`absolute left-4 top-3.5 size-5 transition-colors ${
        success
          ? "text-green-500"
          : "text-slate-400 group-focus-within:text-[#5edff4]"
      }`}
    />
    <input
      {...props}
      className={`w-full bg-slate-50 border rounded-xl py-3 pl-12 pr-4 outline-none transition-all font-medium text-slate-700
      ${
        error
          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
          : success
            ? "border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50"
            : "border-slate-200 focus:border-[#5edff4] focus:ring-[#5edff4]"
      } disabled:bg-slate-100 disabled:text-slate-400`}
      required
    />
    {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
  </div>
);

export default AuthModal;
