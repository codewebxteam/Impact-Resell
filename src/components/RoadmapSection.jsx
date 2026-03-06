import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles, Brain } from "lucide-react";
import { Link } from "react-router-dom";

// --- Step Data (Academy Themed Content) ---
const steps = [
  {
    id: 1,
    title: "Apply & Enroll",
    description:
      "Submit your application, clear the basic assessment, and secure your seat in our premium cohort.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop",
    stat: "Step 1",
  },
  {
    id: 2,
    title: "Learn & Build",
    description:
      "Attend live classes, solve coding challenges, and build real-world projects with expert mentorship.",
    image:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1000&auto=format&fit=crop",
    stat: "Step 2",
  },
  {
    id: 3,
    title: "Capstone Project",
    description:
      "Develop a professional full-stack application to showcase your skills in your job portfolio.",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop",
    stat: "Step 3",
  },
  {
    id: 4,
    title: "Get Hired",
    description:
      "Mock interviews, resume building, and direct referrals to top tech companies to launch your career.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop",
    stat: "Goal",
  },
];

const RoadmapSection = () => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section className="w-full relative font-sans bg-linear-to-b from-white via-[#f0fdff] to-[#cff9fe] py-16 md:py-24 px-4 overflow-hidden">
      {/* Background Pattern & Ambience */}
      <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#5edff4]/20 via-transparent to-transparent opacity-50 pointer-events-none" />

      {/* --- Main Glassmorphism Container --- */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-6xl mx-auto bg-white/60 backdrop-blur-md rounded-3xl md:rounded-[3rem] p-6 md:p-12 shadow-2xl border border-white/50 relative z-10"
      >
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* --- LEFT SIDE: Content & Interactive List --- */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#5edff4]/30 bg-white w-fit mb-4 shadow-sm">
                <Sparkles className="size-3 text-[#0891b2] animate-pulse" />
                <span className="text-xs font-bold text-[#0891b2] tracking-wide uppercase">
                  How it works
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                Your Roadmap to{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0891b2] to-[#5edff4]">
                  Success
                </span>
                .
              </h2>
              <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                A structured path designed to take you from a beginner to an
                industry-ready professional in 4 strategic steps.
              </p>
            </motion.div>

            {/* Interactive Steps List */}
            <div className="flex flex-col gap-3 mt-4">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`group relative flex items-center justify-between p-4 rounded-2xl text-left transition-all duration-300 border cursor-pointer outline-none
                  ${
                    activeStep === step.id
                      ? "bg-slate-900 border-slate-900 shadow-xl scale-[1.02]"
                      : "bg-white/50 border-slate-100 hover:border-[#cff9fe] hover:bg-[#f0fdff]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`size-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-black transition-all
                      ${
                        activeStep === step.id
                          ? "bg-[#5edff4] text-slate-900 shadow-lg"
                          : "bg-[#cff9fe] text-[#0891b2] group-hover:bg-white"
                      }`}
                    >
                      0{step.id}
                    </div>
                    <div>
                      <span
                        className={`text-lg font-bold block transition-colors ${
                          activeStep === step.id
                            ? "text-white"
                            : "text-slate-700 group-hover:text-slate-900"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    className={`size-5 transition-all ${
                      activeStep === step.id
                        ? "text-[#5edff4] opacity-100 translate-x-0"
                        : "text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* --- RIGHT SIDE: Visual Display Area --- */}
          <div className="relative h-[350px] md:h-[500px] w-full flex items-center justify-center order-1 lg:order-2">
            {/* Background Glow Animation */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-linear-to-tr from-[#cff9fe] to-white rounded-4xl blur-3xl opacity-60"
            />

            {/* Main Image Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative size-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-900 ring-1 ring-slate-100"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="size-full"
                >
                  <img
                    src={steps[activeStep - 1].image}
                    alt={steps[activeStep - 1].title}
                    className="size-full object-cover"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Text Overlay on Image */}
              <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                <motion.div
                  key={`content-${activeStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#5edff4] text-slate-900 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-lg">
                      {steps[activeStep - 1].stat}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                    {steps[activeStep - 1].title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                    {steps[activeStep - 1].description}
                  </p>
                </motion.div>
              </div>

              {/* Floating "Step Complete" Logic */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="absolute -right-2 top-8 bg-white p-3 rounded-xl shadow-lg border border-slate-100 w-36 hidden sm:block"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="size-4 text-[#0891b2]" />
                  <span className="font-bold text-slate-800 text-[10px]">
                    Step Complete
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(activeStep / steps.length) * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="bg-[#5edff4] h-full"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* --- Bottom CTA Button --- */}
        <div className="mt-12 flex justify-center">
          <Link to="/courses">
            <button className="group relative px-10 py-4 bg-slate-900 rounded-full text-white font-bold text-lg shadow-2xl hover:shadow-[#5edff4]/40 hover:-translate-y-1 transition-all active:scale-95 overflow-hidden">
              <span className="relative z-10 flex items-center gap-3">
                Launch Your Career{" "}
                <ArrowRight className="size-5 text-[#5edff4] group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-[#0891b2] to-[#5edff4] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default RoadmapSection;
