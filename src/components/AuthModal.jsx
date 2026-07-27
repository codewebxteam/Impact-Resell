import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useAgency } from "../context/AgencyContext";
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  BadgeCheck,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const AuthModal = ({ isOpen, onClose, defaultMode = "login" }) => {
  const { login, signup, resetPassword } = useAuth();
  const { isPartner, agency } = useAgency();
  const navigate = useNavigate();

  const [mode, setMode] = useState(defaultMode); // 'login' | 'signup' | 'partner' | 'forgotPassword'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Partner Verification State
  const [partnerVerified, setPartnerVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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

  // Reset state when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setErrors({});
      setPartnerVerified(false);
      setResetEmailSent(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      setStrength({ score: 0, label: "", color: "" });
    }
  }, [isOpen, defaultMode]);

  useEffect(() => {
    setErrors({});
    setPartnerVerified(false); // Reset verification if mode changes
    setResetEmailSent(false);
  }, [mode]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "password") checkStrength(value);

    // Auto-remove error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
    // If they change email after verifying, require verification again
    if (name === "email" && partnerVerified) {
      setPartnerVerified(false);
    }
  };

  // --- REAL VERIFICATION FOR PARTNER EMAIL ---
  const handleVerifyEmail = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      setErrors({ ...errors, email: "Please enter a valid email first" });
      return;
    }

    setVerifying(true);
    setErrors({ ...errors, email: null });

    try {
      const emailLower = formData.email.toLowerCase().trim();
      const docRef = doc(db, "allowedResellers", emailLower);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === "registered") {
          setErrors({
            ...errors,
            email: "Email is already registered. Please login.",
          });
          setPartnerVerified(false);
        } else {
          // Admin allowed this mail! Update status to verified.
          setPartnerVerified(true);
          await updateDoc(docRef, { status: "verified" });
        }
      } else {
        setPartnerVerified(false);
        setErrors({
          ...errors,
          email: "Access denied. This email is not whitelisted by the Admin.",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setErrors({ ...errors, email: "Verification service error. Try again." });
    } finally {
      setVerifying(false);
    }
  };

  // --- FORGOT PASSWORD HANDLER ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.email.includes("@")) {
      setErrors({ email: "Please enter a valid email address." });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await resetPassword(formData.email);
      setResetEmailSent(true);
    } catch (error) {
      console.error("Reset Password Error:", error);
      let msg = "Something went wrong. Please try again.";
      if (error.code === "auth/user-not-found") msg = "No account found with this email.";
      if (error.code === "auth/invalid-email") msg = "Please enter a valid email address.";
      if (error.code === "auth/too-many-requests") msg = "Too many attempts. Please try again later.";
      setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();

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
        const userCredential = await login(formData.email, formData.password);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        const userData = userDoc.data();

        if (userData?.role === "partner") {
          navigate("/partner-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        const userRole = mode === "partner" ? "partner" : "student";
        const partnerIdForSignup = mode === "partner" ? null : (isPartner ? agency.id : "direct");

        // Firebase Signup
        await signup(
          formData.email,
          formData.password,
          formData.name,
          formData.phone,
          userRole,
          partnerIdForSignup
        );

        // If Partner, update the allowedResellers status to "registered"
        if (mode === "partner") {
          const emailLower = formData.email.toLowerCase().trim();
          await updateDoc(doc(db, "allowedResellers", emailLower), {
            status: "registered",
            registeredAt: new Date().toISOString(),
          });
          navigate("/agency-setup");
        } else {
          navigate("/dashboard");
        }
      }

      setLoading(false);
      onClose();
    } catch (error) {
      console.error("Auth Error:", error);
      setLoading(false);
      let msg = "Authentication failed. Please try again.";
      if (error.code === "auth/invalid-credential")
        msg = "Incorrect email or password.";
      if (error.code === "auth/email-already-in-use")
        msg = "This email is already registered.";
      if (error.code === "auth/weak-password")
        msg = "Password should be at least 6 characters.";
      alert(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-8 pt-8 flex justify-between items-start shrink-0">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === "login" && "Welcome Back"}
              {mode === "signup" && "Create Account"}
              {mode === "partner" && "Partner Registration"}
              {mode === "forgotPassword" && "Reset Password"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === "login" && "Enter your details to access your account."}
              {mode === "signup" && "Start your learning journey today."}
              {mode === "partner" && "Verify your pre-approved email to join."}
              {mode === "forgotPassword" && "Enter your email to receive a reset link."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* LOGIN MODE FIELDS */}
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
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 size-5 text-slate-400 group-focus-within:text-[#0891b2] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 outline-none focus:border-[#0891b2] focus:ring-1 focus:ring-[#0891b2] font-medium text-slate-700"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMode("forgotPassword")}
                    className="text-sm font-bold text-[#0891b2] hover:text-[#5edff4]"
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            )}

            {/* FORGOT PASSWORD MODE */}
            {mode === "forgotPassword" && (
              <>
                {resetEmailSent ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4 py-4"
                  >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Check your inbox!</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        We've sent a password reset link to<br />
                        <span className="font-bold text-slate-700">{formData.email}</span>
                      </p>
                    </div>
                    <p className="text-xs text-slate-400">Didn't receive it? Check your spam folder.</p>
                    <button
                      type="button"
                      onClick={() => { setMode("login"); setResetEmailSent(false); }}
                      className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-[#0891b2] transition-all mt-2"
                    >
                      Back to Login
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <InputGroup
                      icon={Mail}
                      name="email"
                      type="email"
                      placeholder="Your registered email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 text-white font-bold text-lg py-3.5 rounded-xl hover:bg-[#0891b2] transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin size-6" />
                      ) : (
                        <><Mail className="size-5" /> Send Reset Link</>
                      )}
                    </button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        ← Back to Login
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* EMAIL VERIFICATION FIELD FOR PARTNER / SIGNUP */}
            {(mode === "signup" || mode === "partner") && (
              <div className="space-y-3">
                <InputGroup
                  icon={Mail}
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={mode === "partner" && partnerVerified}
                  success={mode === "partner" && partnerVerified}
                  error={errors.email}
                />

                {/* Show Verify Button ONLY for Partners if not verified */}
                {mode === "partner" && !partnerVerified && (
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={verifying}
                    className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold py-3 rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <Loader2 className="animate-spin size-5" />
                    ) : (
                      <>
                        <BadgeCheck className="size-5" /> Verify Access
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* SHOW REMAINING FIELDS ONLY IF SIGNUP OR (PARTNER && VERIFIED) */}
            {(mode === "signup" || (mode === "partner" && partnerVerified)) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 pt-1"
              >
                {mode === "partner" && partnerVerified && (
                  <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded-xl flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2Icon /> Email Verified! Please complete your
                    profile below.
                  </div>
                )}
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

                <div className="space-y-4">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 size-5 text-slate-400 group-focus-within:text-[#0891b2] transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-12 outline-none focus:border-[#0891b2] focus:ring-1 focus:ring-[#0891b2] font-medium text-slate-700"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>

                  {formData.password && (
                    <div className="px-1 space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Security Strength
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase ${strength.color.replace("bg-", "text-")}`}
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
                    <Lock className="absolute left-4 top-3.5 size-5 text-slate-400 group-focus-within:text-[#0891b2] transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 border rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-1 font-medium text-slate-700 ${errors.confirmPassword ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-[#0891b2] focus:ring-[#0891b2]"}`}
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* MAIN ACTION BUTTON */}
            <button
              type="submit"
              disabled={loading || (mode === "partner" && !partnerVerified)}
              className="w-full bg-slate-900 text-white font-bold text-lg py-3.5 rounded-xl hover:bg-[#0891b2] transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin size-6" />
              ) : (
                <>
                  {mode === "login" && "Login"}
                  {mode === "signup" && "Create Account"}
                  {mode === "partner" && "Complete Registration"}{" "}
                  <ArrowRight className="size-5" />
                </>
              )}
            </button>
          </form>

          {/* FOOTER SWITCHES */}
          <div className="mt-8 text-center space-y-3">
            {mode === "login" && (
              <>
                <p className="text-slate-500 text-sm">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="font-bold text-slate-900 hover:text-[#0891b2]"
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
              <p className="text-slate-500 text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="font-bold text-slate-900 hover:text-[#0891b2]"
                >
                  Login
                </button>
              </p>
            )}
            {mode === "partner" && (
              <p className="text-slate-500 text-sm">
                Already registered?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="font-bold text-slate-900 hover:text-[#0891b2]"
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

// Internal icon for success message
const CheckCircle2Icon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const InputGroup = ({ icon: Icon, error, success, ...props }) => (
  <div className="relative group">
    <Icon
      className={`absolute left-4 top-3.5 size-5 transition-colors ${success ? "text-emerald-500" : "text-slate-400 group-focus-within:text-[#0891b2]"}`}
    />
    <input
      {...props}
      className={`w-full bg-slate-50 border rounded-xl py-3 pl-12 pr-4 outline-none transition-all font-medium text-slate-700
      ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : success ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50" : "border-slate-200 focus:border-[#0891b2] focus:ring-[#0891b2]"} disabled:opacity-70 disabled:cursor-not-allowed`}
      required={!props.disabled}
    />
    {error && (
      <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1">
        <AlertCircle className="size-3" /> {error}
      </p>
    )}
  </div>
);

export default AuthModal;
