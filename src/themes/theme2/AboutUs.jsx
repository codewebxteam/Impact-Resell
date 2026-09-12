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
  Sparkles,
  Star,
  BookOpen
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAgency } from "../../context/AgencyContext"; // [KEEP] Subdomain Logic untouched

// ==========================================
// THEME CONFIGURATION (Driven by CSS Variables)
// ==========================================
const THEME = {
  // Base Colors
  bg: "bg-white",
  textMain: "text-slate-900",
  textMuted: "text-slate-500",
  accentText: "text-[var(--brand-color)]",
  
  // Gradients
  gradientText: "bg-gradient-to-r from-slate-900 via-[var(--brand-color)] to-[var(--accent-color)] bg-clip-text text-transparent",
  
  // Cards & Containers
  cardOuter: "bg-white p-2.5 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-2",
  cardInner: "bg-slate-50 w-full h-full rounded-[2rem] p-8 md:p-10",
  
  // Buttons
  buttonPrimary: "bg-gradient-to-r from-[var(--brand-color)] to-[var(--accent-color)] text-white shadow-lg shadow-[var(--brand-color)]/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]",
  buttonSecondary: "bg-white border-2 border-slate-100 text-slate-700 hover:border-[var(--brand-color)] hover:text-[var(--brand-color)] transition-all shadow-sm",
  
  // Ambient Glows
  accentGlow: "bg-[var(--accent-color)]/10 blur-[120px]",
  brandGlow: "bg-[var(--brand-color)]/10 blur-[120px]",
  
  // UI Accents
  iconBg: "bg-[var(--brand-color)]/10 text-[var(--brand-color)]",
  badgeBg: "bg-white border border-[var(--brand-color)]/20 text-[var(--brand-color)] shadow-sm backdrop-blur",
};

const AboutUs = () => {
  const { agency, isMainSite } = useAgency();
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const coursesUrl = isDev ? `/dev/${themeName}/courses` : "/courses";
  const contactUrl = isDev ? `/dev/${themeName}/contact` : "/contact";

  // [LOGIC] Dynamic Name
  const academyName = !isMainSite && agency ? agency.name : "AI Courses";
  const shortName = !isMainSite && agency ? agency.name : "AI Courses";

  return (
    <div
      className={`min-h-screen w-full relative overflow-hidden font-roboto-condensed selection:bg-[var(--brand-color)] selection:text-white ${THEME.bg}`}
      style={{
        '--brand-color': '#6366f1',
        '--accent-color': '#ec4899'
      }}
    >
      
      {/* Background Ambient Glows & Patterns */}
      <div className={`absolute -left-40 top-0 h-[600px] w-[600px] rounded-full ${THEME.brandGlow} pointer-events-none`} />
      <div className={`absolute right-[-100px] top-[30%] h-[700px] w-[700px] rounded-full ${THEME.accentGlow} pointer-events-none`} />
      
      {/* Dotted Grids for App-Style Look */}
      <div className="absolute top-40 left-10 grid grid-cols-3 gap-3 opacity-20 -z-10 hidden lg:grid">
        {Array.from({length: 18}).map((_, i) => <div key={i} className="size-1.5 bg-slate-400 rounded-full" />)}
      </div>

      <div className="pt-24 md:pt-32 pb-0 relative z-10">
        
        {/* =========================================
            1. HERO SECTION: Vision & Mission
        ========================================= */}
        <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 ${THEME.badgeBg}`}>
                <Sparkles className="size-4" /> Our Story
              </div>

              <h1 className={`text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight ${THEME.textMain}`}>
                We Are Building The <br />
                <span className={THEME.gradientText}>
                  Future of Learning.
                </span>
              </h1>

              <p className={`text-lg md:text-xl leading-relaxed mb-10 font-medium ${THEME.textMuted}`}>
                {academyName} wasn’t built in a boardroom. It started with a
                simple vision: education should be accessible, practical, and
                future-ready. We empower learners with AI-driven tools, hands-on
                projects, and industry-aligned skills.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className={THEME.cardOuter}>
                  <div className="bg-slate-50 rounded-[2rem] p-5 flex items-center gap-4 h-full">
                    <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${THEME.iconBg}`}>
                      <Target className="size-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Mission</p>
                      <p className={`font-bold text-sm ${THEME.textMain}`}>Empower 1M+ Creators</p>
                    </div>
                  </div>
                </div>
                
                <div className={THEME.cardOuter}>
                  <div className="bg-slate-50 rounded-[2rem] p-5 flex items-center gap-4 h-full">
                    <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-[var(--accent-color)]/10 text-[var(--accent-color)]`}>
                      <Heart className="size-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Values</p>
                      <p className={`font-bold text-sm ${THEME.textMain}`}>Students First, Always</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Modern App-Style Image Collage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full aspect-square flex items-center justify-center"
            >
              {/* Center decorative blob */}
              <div className="absolute inset-10 bg-gradient-to-tr from-[var(--brand-color)]/20 to-[var(--accent-color)]/20 rounded-full blur-3xl -z-10" />

              <div className="relative w-full h-full max-w-[500px]">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400&auto=format&fit=crop"
                  alt="Team"
                  className="absolute top-[5%] left-[5%] w-[55%] h-[45%] object-cover rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-[6px] border-white -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500 z-20"
                />
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=400&auto=format&fit=crop"
                  alt="Work"
                  className="absolute bottom-[5%] left-[10%] w-[45%] h-[40%] object-cover rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-[6px] border-white rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 z-30"
                />
                <img
                  src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=400&auto=format&fit=crop"
                  alt="Creative Workspace"
                  className="absolute top-[20%] right-[5%] w-[45%] h-[60%] object-cover rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-[6px] border-white rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500 z-10"
                />
                
                {/* Floating Satisfaction Badge */}
                <div className="absolute bottom-[25%] right-[0%] bg-white p-4 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-3 z-40 animate-bounce" style={{animationDuration: '3s'}}>
                  <div className="size-10 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center">
                    <Star className="size-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Satisfaction</p>
                    <p className="text-lg font-black text-slate-900">100%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* =========================================
            2. CORE VALUES SECTION
        ========================================= */}
        <div className="relative py-12 mb-20 md:mb-32 bg-slate-50/50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              {[
                { label: "Industry-Aligned", icon: Briefcase },
                { label: "Project-Based", icon: Layers },
                { label: "Future-Ready Skills", icon: Cpu },
                { label: "Creator-First", icon: User },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={THEME.cardOuter}
                >
                  <div className="bg-white h-full rounded-[2rem] p-6 flex flex-col items-center justify-center group">
                    <div className={`size-14 mb-4 rounded-2xl flex items-center justify-center group-hover:-translate-y-1 transition-all duration-300 shadow-sm ${THEME.iconBg}`}>
                      <item.icon className="size-6" />
                    </div>
                    <h3 className={`text-base md:text-lg font-extrabold leading-tight ${THEME.textMain}`}>
                      {item.label}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================
            3. WHY CHOOSE US?
        ========================================= */}
        <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-32">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className={`text-4xl md:text-5xl font-extrabold mb-5 tracking-tight ${THEME.textMain}`}>
              Why <span className={THEME.gradientText}>{shortName}?</span>
            </h2>
            <p className={`text-base md:text-lg font-medium ${THEME.textMuted}`}>
              We don't just sell courses; we curate career paths. Here is what
              sets us apart from the crowd.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Curated Content",
                desc: "We manually verify every course. No outdated tutorials. Only industry-standard, high-quality AI-Powered lessons.",
                color: "bg-blue-50 text-blue-600 border border-blue-100",
              },
              {
                title: "Community Driven",
                desc: "We foster a supportive learning community where creators grow, collaborate, and learn together.",
                color: `${THEME.iconBg} border border-[var(--brand-color)]/20`,
              },
              {
                title: "Affordable Pricing",
                desc: "High-quality education should be accessible. We work directly with creators to offer fair, region-appropriate pricing.",
                color: "bg-purple-50 text-purple-600 border border-purple-100",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className={`${THEME.cardOuter} group`}
              >
                <div className={`${THEME.cardInner} bg-white`}>
                  <div className={`size-14 rounded-2xl ${card.color} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                    <CheckCircle2 className="size-7" />
                  </div>
                  <h3 className={`text-xl font-extrabold mb-4 ${THEME.textMain}`}>
                    {card.title}
                  </h3>
                  <p className={`leading-relaxed font-medium text-sm md:text-base ${THEME.textMuted}`}>{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* =========================================
            4. LEARNING PHILOSOPHY
        ========================================= */}
        <div className="relative py-20 md:py-32 mb-10 border-t border-slate-100">
          <div className={`absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[var(--accent-color)]/5 via-transparent to-transparent opacity-80 pointer-events-none`} />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              {/* Image */}
              <div className="relative shrink-0">
                <div className="size-64 md:size-80 rounded-[3rem] overflow-hidden border-[8px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=400&auto=format&fit=crop"
                    alt="Philosophy"
                    className="size-full object-cover scale-110"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-3xl shadow-xl border border-slate-100">
                  <Lightbulb className="size-10 text-yellow-500" />
                </div>
              </div>

              {/* Text */}
              <div className="text-center md:text-left flex-1">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 ${THEME.badgeBg}`}>
                  <BookOpen className="size-4" /> Methodology
                </div>
                <h3 className={`text-4xl md:text-5xl font-extrabold mb-6 tracking-tight ${THEME.textMain}`}>
                  Our Learning Philosophy
                </h3>

                <div className="relative bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                  <span className={`absolute -top-4 -left-2 text-7xl opacity-20 font-serif hidden md:block ${THEME.accentText}`}>
                    "
                  </span>
                  <p className={`text-base md:text-lg leading-relaxed relative z-10 font-medium ${THEME.textMuted}`}>
                    At <strong className={THEME.textMain}>{academyName}</strong>, we believe learning should be practical,
                    accessible, and future-ready. Our philosophy is built around
                    hands-on, project-based education that reflects real
                    industry workflows. By combining structured learning paths,
                    modern tools, and AI-driven approaches, we help learners
                    move beyond theory and build skills that are relevant,
                    applicable, and career-focused. 
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            5. CTA SECTION
        ========================================= */}
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900 rounded-[3rem] p-12 md:p-24 relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.25)] border border-slate-800"
          >
            {/* Glows */}
            <div className="absolute top-0 right-0 size-96 bg-[var(--brand-color)]/30 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 size-96 bg-[var(--accent-color)]/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />

            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 relative z-10 tracking-tight">
              Ready to start your journey?
            </h2>
            <p className="text-white/70 font-medium max-w-2xl mx-auto mb-12 text-lg md:text-xl relative z-10">
              Transform your career today. Get unlimited access to our premium
              library and community.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-5 relative z-10">
              <NavLink
                to={coursesUrl}
                className={`px-8 py-4 rounded-full font-bold text-sm md:text-base flex items-center justify-center gap-2 ${THEME.buttonPrimary}`}
              >
                Explore Courses <ArrowRight className="size-5" />
              </NavLink>
              <NavLink
                to={contactUrl}
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold text-sm md:text-base hover:bg-white/20 hover:-translate-y-1 transition-all shadow-lg"
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