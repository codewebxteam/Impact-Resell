import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, BookOpen, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PaymentSuccessModal = ({ isOpen, onClose, courseTitle, paymentId, amount, courseId }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleStartLearning = () => {
    onClose();
    if (courseId && courseId !== "bundle") {
      navigate(`/courses/${courseId}`);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 p-6 sm:p-8 text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="size-5" />
          </button>

          {/* Success Badge & Animated Ring */}
          <div className="relative mx-auto size-20 mb-5">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative size-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="size-10 stroke-[2.5]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="size-3.5 text-emerald-600" />
            Instant Allocation Active
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Payment Successful! 🎉
          </h2>

          <p className="text-sm font-medium text-slate-600 mb-6">
            Congratulations! Access to <span className="font-bold text-slate-900">"{courseTitle || "Course"}"</span> has been instantly unlocked in your account.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Status</span>
              <span className="font-black text-emerald-600 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Confirmed & Enrolled
              </span>
            </div>
            {amount && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Amount Paid</span>
                <span className="font-black text-slate-900">₹{amount}</span>
              </div>
            )}
            {paymentId && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Payment ID</span>
                <span className="font-mono font-bold text-slate-600">{paymentId}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartLearning}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all cursor-pointer"
            >
              <BookOpen className="size-4" />
              <span>Start Learning</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentSuccessModal;
