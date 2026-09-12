/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Users,
  Target,
  Award,
  Zap,
  CheckCircle2,
  ArrowRight,
  Play,
  Star,
  GraduationCap,
  Layers,
  Globe,
  Rocket,
  Cpu,
  ShieldCheck,
  MessageCircle,
  Check
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAgency } from "../../context/AgencyContext";

// ==========================================
// THEME CONFIGURATION (#fedc5c Driven Aesthetic)
// ==========================================
const THEME = {
  bg: "bg-slate-50/60",
  textMain: "text-slate-950",
  textMuted: "text-slate-600",
  accentColor: "#fedc5c",
  
  badgeBg: "bg-white border border-amber-400/50 text-slate-950 shadow-xs font-black",
  buttonPrimary: "bg-[#fedc5c] text-slate-950 font-black shadow-lg shadow-amber-400/30 hover:bg-amber-400 hover:-translate-y-1 hover:shadow-xl transition-all duration-300",
  buttonOutline: "bg-white border-2 border-slate-200 text-slate-800 hover:border-amber-400 hover:text-slate-950 transition-all font-black shadow-xs",
};

const AboutUs = () => {
  const { agency, isMainSite } = useAgency();
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const coursesUrl = isDev ? `/dev/${themeName}/courses` : "/courses";
  const contactUrl = isDev ? `/dev/${themeName}/contact` : "/contact";

  const academyName = !isMainSite && agency ? agency.name : "AI Video Academy";

  const stats = [
    { label: "Active Creators", value: "10,000+", icon: Users },
    { label: "AI Video Modules", value: "15+", icon: Layers },
    { label: "Course Rating", value: "4.9/5", icon: Star },
    { label: "Support Hours", value: "24/7", icon: ShieldCheck },
  ];

  const pillars = [
    {
      step: "01",
      title: "AI Avatar Vlogging",
      desc: "Learn to build realistic digital twins, match custom voiceovers, and produce viral talking avatar videos without camera shyness.",
      icon: Users,
    },
    {
      step: "02",
      title: "2D & 3D AI Animation",
      desc: "Master character generation, motion prompts, and image-to-video tools to create studio-quality animated stories.",
      icon: Layers,
    },
    {
      step: "03",
      title: "UGC Ads & Viral Shorts",
      desc: "Turn AI video skills into commercial high-converting UGC ad campaigns for brands, e-commerce, and YouTube channels.",
      icon: Rocket,
    },
  ];

  const timelineSteps = [
    {
      num: "1",
      title: "Prompt Engineering & Asset Creation",
      desc: "Generate hyper-realistic characters, 3D backgrounds, and historical scenes using top AI generators.",
    },
    {
      num: "2",
      title: "Motion & Animation Synthesis",
      desc: "Transform static images into cinematic fluid videos with precise camera motion and lip-sync AI.",
    },
    {
      num: "3",
      title: "Voice Cloning & Audio Design",
      desc: "Synthesize natural multilingual voiceovers, background scores, and automated captions in seconds.",
    },
    {
      num: "4",
      title: "Monetization & Channel Growth",
      desc: "Publish viral shorts, build subscriber pipelines, and pitch AI video creation services to paying clients.",
    },
  ];

  return (
    <div className={`min-h-screen w-full relative overflow-hidden font-sans ${THEME.bg}`}>
      
      <div className="pt-24 md:pt-32 pb-20 relative z-10">
        
        {/* ==========================================
            1. MODERN HERO BANNER WITH FLOATING STATS
           ========================================== */}
        <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-28">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-[2.5rem] p-8 sm:p-14 md:p-16 text-white border border-amber-400/20 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#fedc5c]/15 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

            <div className="relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase mb-6 bg-white/10 border border-amber-400/30 text-[#fedc5c] backdrop-blur-md">
                  <Sparkles className="size-4 text-[#fedc5c] fill-amber-400" /> About {academyName}
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-[1.08]">
                  Empowering <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-[#fedc5c] via-amber-300 to-amber-500 bg-clip-text text-transparent">Next-Gen AI Video Creators</span>
                </h1>

                <p className="text-base sm:text-lg md:text-xl font-bold text-slate-300 leading-relaxed max-w-2xl mb-8">
                  We exist to eliminate camera fear and technical barriers. Our academy teaches step-by-step AI avatar vlogging, 2D/3D animation, and high-income video creation skills.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <NavLink
                    to={coursesUrl}
                    className={`px-7 py-3.5 rounded-full text-xs sm:text-sm flex items-center gap-2 ${THEME.buttonPrimary}`}
                  >
                    <span>Explore Our Courses</span>
                    <ArrowRight className="size-4 stroke-[3]" />
                  </NavLink>
                  <NavLink
                    to={contactUrl}
                    className="px-7 py-3.5 rounded-full text-xs sm:text-sm font-black bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
                  >
                    Contact Support
                  </NavLink>
                </div>
              </div>

              {/* Grid of 4 Stats */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl flex flex-col justify-between hover:border-amber-400/40 transition-colors"
                    >
                      <div className="size-10 rounded-xl bg-[#fedc5c] text-slate-950 flex items-center justify-center mb-4 shadow-sm">
                        <Icon className="size-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-black text-white mb-0.5">{item.value}</div>
                        <div className="text-xs font-bold text-slate-400">{item.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            2. OUR 3 CORE PILLARS (Clean Card Grid)
           ========================================== */}
        <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-28">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider bg-amber-100/80 border border-amber-300/60 text-slate-900 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              OUR CORE PILLARS
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight">
              What Sets Our Academy Apart
            </h2>
            <p className="mt-3 text-sm md:text-base font-bold text-slate-600">
              We focus 100% on hands-on practical workflows that generate real viral results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.step}
                  className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#fedc5c] text-slate-950 flex items-center justify-center shadow-md shadow-amber-400/30">
                        <Icon className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <span className="text-2xl font-black font-mono text-slate-200">{card.step}</span>
                    </div>

                    <h3 className="text-xl font-black text-slate-950 mb-3">{card.title}</h3>
                    <p className="text-xs md:text-sm font-bold text-slate-500 leading-relaxed">{card.desc}</p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-black text-amber-600">
                    <CheckCircle2 className="size-4" />
                    <span>Industry Ready Curriculum</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==========================================
            3. STEP-BY-STEP LEARNING TIMELINE
           ========================================== */}
        <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-28">
          <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 md:p-16 border border-slate-100 shadow-sm">
            <div className="text-center mb-14 max-w-3xl mx-auto">
              <span className="text-xs font-mono font-black text-amber-600 uppercase tracking-widest block mb-2">The AI Creator Roadmap</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight">
                How You Will Master AI Video Creation
              </h2>
              <p className="mt-3 text-sm md:text-base font-bold text-slate-600">
                A structured step-by-step path designed for complete beginners and active content creators.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {timelineSteps.map((step, index) => (
                <div key={step.num} className="relative bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-full bg-slate-950 text-[#fedc5c] font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                      {step.num}
                    </div>
                    <h4 className="font-black text-slate-950 text-base mb-2">{step.title}</h4>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==========================================
            4. WARM YELLOW CALL TO ACTION BANNER
           ========================================== */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#fef9c3] border border-amber-200/90 rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 md:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
            <div className="max-w-2xl">
              <span className="text-xs font-mono font-black text-amber-600 uppercase tracking-widest block mb-2">Start Today</span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 leading-snug mb-3">
                Ready to Build Your AI Video Channel & Skills?
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                Enroll now to get lifetime access to all courses, step-by-step AI prompt templates, and dedicated support.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-4">
              <NavLink
                to={coursesUrl}
                className={`px-8 py-4 rounded-full text-xs sm:text-sm flex items-center gap-2 ${THEME.buttonPrimary}`}
              >
                <span>Browse All Courses</span>
                <ArrowRight className="size-4 stroke-[3]" />
              </NavLink>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
