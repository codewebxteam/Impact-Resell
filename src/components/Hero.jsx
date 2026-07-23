import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";

const Hero = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // [UPDATED] Simplified navigation as requested
  const handleExploreCourses = () => {
    navigate("/courses");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center pt-5 pb-12 lg:pt-12 lg:pb-0 bg-linear-to-b from-white via-white via-75% to-[#5edff4]/10">
      {/* --- 1. Background Grid & Glows --- */}
      <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none border-slate-200/60 z-0">
        <div className="absolute left-1/2 top-0 bottom-0 w-px border-slate-200/60 -translate-x-1/2 hidden lg:block"></div>
      </div>

      <div className="absolute -bottom-[10%] -right-[5%] size-[70vw] bg-linear-to-t from-[#5edff4] via-[#22ccEB] to-transparent opacity-20 blur-[130px] rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-2 items-center gap-10 lg:gap-0">
        {/* --- LEFT SIDE: Text Content --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center lg:items-start gap-5 md:gap-8 max-w-xl mx-auto lg:mx-0 text-center lg:text-left order-1 lg:order-1"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f0fdff] border border-[#cff9fe] text-[#0891b2] text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-sm">
            <span className="size-2 rounded-full bg-[#5edff4] animate-pulse" />
            {/* [UPDATED] Text Change */}
            Skills That Pay You Back
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Master Skills That <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-slate-900 via-[#0891b2] to-[#5edff4]">
              Define The Future.
            </span>
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg">
            Join the elite academy for developers and creators. Real-world
            projects, expert mentorship, and a community that pushes you
            forward.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-2 w-full">
            {/* [UPDATED] Button 1: Explore Courses */}
            <button
              onClick={handleExploreCourses}
              className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-[#5edff4] text-slate-900 font-bold text-sm md:text-lg hover:bg-[#22ccEB] transition-all shadow-xl shadow-[#5edff4]/20 hover:shadow-[#5edff4]/40 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              Explore Courses <ArrowRight className="size-4 md:size-5" />
            </button>


          </div>

          <div className="flex items-center gap-4 text-xs md:text-sm font-medium text-slate-500 mt-2 md:mt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="size-7 sm:size-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden"
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${10 + i}`}
                    alt="Student"
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p>Trusted by 10,000+ Students</p>
          </div>
        </motion.div>

        {/* --- RIGHT SIDE: Falling Assets Animation --- */}
        <div className="relative w-full h-100 sm:h-125 lg:h-175 flex items-center justify-center lg:justify-end order-2 lg:order-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-20 w-64 sm:w-96 md:w-112.5 lg:w-162.5"
          >
            <div className="absolute inset-0 bg-[#5edff4]/30 blur-3xl rounded-full -z-10" />
            <img
              src="/assets/hero/main-image.svg"
              alt="Academy Student"
              className="size-full object-contain drop-shadow-2xl"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            {/* Fallback if image missing */}
            <div className="hidden absolute inset-0 border-2 border-dashed border-[#5edff4] bg-[#5edff4]/5 rounded-3xl items-center justify-center -z-20 p-4">
              <div className="text-center">
                <p className="text-[#0891b2] text-sm md:text-lg font-bold">
                  Learn & Grow
                </p>
              </div>
            </div>
          </motion.div>

          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden lg:overflow-visible">
            {/* Floating Icons (Simplified for reliability) */}
            <img
              src="/assets/hero/1.svg"
              className="absolute w-12 sm:w-20 lg:w-32 animate-fall-slow opacity-90"
              style={{ left: "5%", top: "-370px" }}
              alt=""
              onError={(e) => (e.target.style.display = "none")}
            />
            <img
              src="/assets/hero/2.svg"
              className="absolute w-16 sm:w-24 lg:w-40 animate-fall-medium opacity-90"
              style={{ right: "8%", top: "-80px" }}
              alt=""
              onError={(e) => (e.target.style.display = "none")}
            />
            <img
              src="/assets/hero/3.svg"
              className="absolute w-12 sm:w-20 lg:w-32 animate-fall-fast opacity-80"
              style={{ left: "12%", top: "-120px" }}
              alt=""
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="signup"
      />

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-150px); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(800px); opacity: 0; }
        }
        .animate-fall-slow { animation: fall 10s infinite linear; }
        .animate-fall-medium { animation: fall 7s infinite linear; animation-delay: 1.5s; }
        .animate-fall-fast { animation: fall 5s infinite linear; animation-delay: 3s; }
      `}</style>
    </div>
  );
};

export default Hero;
