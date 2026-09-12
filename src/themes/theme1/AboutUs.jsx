/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Globe,
  Award,
  Zap,
  CheckCircle2,
  ArrowRight,
  Heart,
  Target,
  Briefcase,
  Layers,
  Cpu,
  User,
  Lightbulb,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAgency } from "../../context/AgencyContext";

// ==========================================
// THEME CONFIGURATION (Centralized Colors)
// ==========================================
const THEME = {
  // Base Colors
  bg: "bg-[#f7fbff]",
  textMain: "text-[#101828]",
  textMuted: "text-slate-500",
  accentText: "text-[#1679a8]",
  
  // Gradients
  gradientText: "bg-gradient-to-r from-[#101828] via-[#1679a8] to-[#45cbe8] bg-clip-text text-transparent",
  
  // Glass & Cards
  glassPanel: "bg-white/35 backdrop-blur-[3px] border border-white/80 shadow-[0_30px_100px_rgba(39,116,145,0.12)]",
  cardBg: "bg-white/90 backdrop-blur border border-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]",
  
  // Buttons
  buttonPrimary: "bg-[#101828] text-white shadow-xl shadow-slate-300/50 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300",
  buttonSecondary: "bg-white/80 border border-slate-200 text-slate-700 shadow-sm backdrop-blur transition-all hover:border-slate-300 hover:bg-white",
  buttonAccent: "bg-cyan-400 text-[#101828] hover:bg-cyan-300 shadow-lg shadow-cyan-200/50 transition-all hover:-translate-y-1",
  
  // Ambient Glows
  cyanGlow: "bg-cyan-200/30 blur-[100px]",
  blueGlow: "bg-blue-200/40 blur-[120px]",
  indigoGlow: "bg-indigo-100/60 blur-[100px]",
  
  // UI Accents
  iconBg: "bg-cyan-50 text-cyan-600",
  badgeBg: "bg-white/80 border border-cyan-200 text-cyan-700 shadow-sm backdrop-blur",
};

const AboutUs = () => {
  const { agency, isMainSite } = useAgency();

  // [LOGIC] Dynamic Name
  const academyName = !isMainSite && agency ? agency.name : "AI Courses";
  const shortName = !isMainSite && agency ? agency.name : "AI Courses";

  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const coursesUrl = isDev ? `/dev/${themeName}/courses` : "/courses";
  const contactUrl = isDev ? `/dev/${themeName}/contact` : "/contact";

  return (
    <div className={`min-h-screen w-full relative overflow-hidden font-sans ${THEME.bg}`}>
      
      {/* Background Ambient Glows */}
      <div className={`absolute -left-40 top-0 h-[600px] w-[600px] rounded-full ${THEME.cyanGlow} pointer-events-none`} />
      <div className={`absolute right-[-100px] top-[30%] h-[700px] w-[700px] rounded-full ${THEME.blueGlow} pointer-events-none`} />
      <div className={`absolute left-[20%] bottom-[-200px] h-[500px] w-[500px] rounded-full ${THEME.indigoGlow} pointer-events-none`} />

      <div className="pt-24 md:pt-32 pb-0 relative z-10">
        
        {/* =========================================
            1. HERO SECTION: Vision & Mission
        ========================================= */}
        <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 ${THEME.badgeBg}`}>
                <span className="size-2 rounded-full bg-cyan-500 shadow-[0_0_0_4px_rgba(6,182,212,0.12)] animate-pulse" />
                Our Story
              </div>

              <h1 className={`text-4xl md:text-6xl font-black leading-[1.1] mb-6 tracking-tight ${THEME.textMain}`}>
                We Are Building The <br />
                <span className={THEME.gradientText}>
                  Future of AI Video Creation.
                </span>
              </h1>

              <p className={`text-lg leading-relaxed mb-8 max-w-xl font-medium ${THEME.textMuted}`}>
                {academyName} was built with a clear mission: to empower creators, marketers, and storytellers to produce viral AI videos, 3D animations, avatar vlogs, and AI influencer ads using cutting-edge AI tools without expensive camera setups.
              </p>

              <div className="flex flex-wrap gap-6 mt-10">
                <div className="flex items-center gap-4">
                  <div className={`size-14 rounded-2xl flex items-center justify-center shadow-lg ${THEME.iconBg}`}>
                    <Target className="size-7" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">
                      Mission
                    </p>
                    <p className={`font-bold text-sm md:text-base ${THEME.textMain}`}>
                      Empower 1M+ AI Video Creators
                    </p>
                  </div>
                </div>
                
                <div className="w-px h-14 bg-slate-200 hidden sm:block mx-2"></div>
                
                <div className="flex items-center gap-4">
                  <div className={`size-14 rounded-2xl flex items-center justify-center shadow-lg bg-blue-50 text-blue-600`}>
                    <Heart className="size-7" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">
                      Values
                    </p>
                    <p className={`font-bold text-sm md:text-base ${THEME.textMain}`}>
                      Practical AI Workflows
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Image Collage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className={`absolute inset-0 rounded-[3rem] -m-6 ${THEME.glassPanel} -z-10`} />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-8">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400&auto=format&fit=crop"
                    alt="Team"
                    className="w-full h-48 object-cover rounded-3xl shadow-lg hover:scale-[1.02] transition-transform duration-300"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=400&auto=format&fit=crop"
                    alt="Work"
                    className="w-full h-64 object-cover rounded-3xl shadow-lg hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <div className="space-y-4">
                  <img
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400&auto=format&fit=crop"
                    alt="Meeting"
                    className="w-full h-64 object-cover rounded-3xl shadow-lg hover:scale-[1.02] transition-transform duration-300"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=400&auto=format&fit=crop"
                    alt="Creative Workspace"
                    className="w-full h-48 object-cover rounded-3xl shadow-lg hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* =========================================
            2. CORE VALUES SECTION
        ========================================= */}
        <div className="relative py-12 mb-20 md:mb-32">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`rounded-[3rem] p-10 md:p-16 ${THEME.glassPanel}`}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
                {[
                  { label: "AI Avatar Creation", icon: User },
                  { label: "2D & 3D Animation", icon: Layers },
                  { label: "AI Prompt Engineering", icon: Cpu },
                  { label: "Viral Monetization", icon: Briefcase },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center group"
                  >
                    <div className={`size-16 mb-6 rounded-2xl flex items-center justify-center group-hover:-translate-y-2 transition-all duration-300 shadow-md ${THEME.cardBg} ${THEME.accentText}`}>
                      <item.icon className="size-8" />
                    </div>
                    <h3 className={`text-lg md:text-xl font-bold leading-tight ${THEME.textMain}`}>
                      {item.label}
                    </h3>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* =========================================
            3. WHY CHOOSE US?
        ========================================= */}
        <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-32">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className={`text-3xl md:text-5xl font-black mb-5 tracking-tight ${THEME.textMain}`}>
              Why <span className={THEME.gradientText}>{shortName}?</span>
            </h2>
            <p className={`text-base md:text-lg font-medium ${THEME.textMuted}`}>
              We don't just teach software; we teach step-by-step viral video creation and channel monetization.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Curated AI Workflows",
                desc: "Learn exact prompt formulas, voice synthesis, and image-to-video tools. No outdated tutorials—only battle-tested AI workflows.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                title: "Creator Community",
                desc: "Join thousands of AI video creators, exchange prompt strategies, get feedback on videos, and collaborate on viral channels.",
                color: "bg-cyan-50 text-cyan-600",
              },
              {
                title: "Monetization Ready",
                desc: "Turn skills into income. Learn how to launch faceless YouTube channels, Instagram Reels, and sell video creation services to clients.",
                color: "bg-indigo-50 text-indigo-600",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className={`p-8 md:p-10 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(39,116,145,0.12)] group ${THEME.cardBg}`}
              >
                <div className={`size-14 rounded-2xl ${card.color} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                  <CheckCircle2 className="size-7" />
                </div>
                <h3 className={`text-xl font-bold mb-4 ${THEME.textMain}`}>
                  {card.title}
                </h3>
                <p className={`leading-relaxed font-medium ${THEME.textMuted}`}>{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* =========================================
            4. LEARNING PHILOSOPHY
        ========================================= */}
        <div className="relative py-20 md:py-32 mb-10 border-y border-white/40">
          <div className={`absolute inset-0 ${THEME.glassPanel} rounded-none border-x-0 -z-10`} />
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              {/* Image */}
              <div className="relative shrink-0">
                <div className="size-56 md:size-72 rounded-full overflow-hidden border-[8px] border-white shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=400&auto=format&fit=crop"
                    alt="Philosophy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="absolute bottom-6 right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                  <Lightbulb className="size-8 text-cyan-400" />
                </div>
              </div>

              {/* Text */}
              <div className="text-center md:text-left">
                <h3 className={`text-3xl md:text-4xl font-black mb-6 tracking-tight ${THEME.textMain}`}>
                  Our Learning Philosophy
                </h3>

                <div className="relative">
                  <span className="absolute -top-6 -left-6 text-7xl text-cyan-300 opacity-40 font-serif hidden md:block">
                    "
                  </span>
                  <p className={`text-base md:text-lg leading-relaxed relative z-10 font-medium ${THEME.textMuted}`}>
                    At <strong className={THEME.textMain}>{academyName}</strong>, we believe video creation should be fast, accessible, and future-ready. Our philosophy is built around practical, project-based education that reflects real AI content creator workflows. From generating realistic AI avatars and 3D animations to crafting viral UGC ads and documentary scripts, we help you master tools that make high-quality video production effortless.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            5. CTA SECTION
        ========================================= */}
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#101828] to-[#1679a8] rounded-[3rem] p-12 md:p-24 relative overflow-hidden shadow-[0_30px_60px_rgba(22,121,168,0.25)] border border-[#1679a8]/30"
          >
            {/* Glows */}
            <div className="absolute top-0 right-0 size-96 bg-cyan-400/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 size-96 bg-blue-500/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 relative z-10 tracking-tight">
              Ready to start your journey?
            </h2>
            <p className="text-cyan-50 font-medium max-w-2xl mx-auto mb-12 text-lg md:text-xl relative z-10 opacity-90">
              Transform your career today. Get unlimited access to our premium
              library and community.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-5 relative z-10">
              <NavLink
                to={coursesUrl}
                className={`px-8 py-4 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-2 ${THEME.buttonAccent}`}
              >
                Explore Courses <ArrowRight className="size-5" />
              </NavLink>
              <NavLink
                to={contactUrl}
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm md:text-base hover:bg-white/20 hover:-translate-y-1 transition-all shadow-lg"
              >
                Contact Support
              </NavLink>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;