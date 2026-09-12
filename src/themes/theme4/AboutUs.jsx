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
  Film,
  BookOpen,
  Heart,
  Video,
  Clock
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAgency } from "../../context/AgencyContext";

const AboutUs = () => {
  const { agency, isMainSite } = useAgency();
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "theme4";
  const coursesUrl = isDev ? `/dev/${themeName}/courses` : "/courses";
  const contactUrl = isDev ? `/dev/${themeName}/contact` : "/contact";

  const academyName = !isMainSite && agency?.name ? agency.name : (agency?.name || "AIFlix Academy");
  const supportPhone = !isMainSite && agency?.whatsapp ? agency.whatsapp : "+91 74818 96182";
  const whatsappLink = `https://wa.me/${supportPhone.replace(/\D/g, "")}?text=${encodeURIComponent("Hello! I want to know more about the academy.")}`;

  const stats = [
    { label: "Active Creators", value: "10,000+", icon: Users, color: "text-violet-600 bg-violet-50" },
    { label: "AI Video Modules", value: "15+", icon: Layers, color: "text-indigo-600 bg-indigo-50" },
    { label: "Course Rating", value: "4.9/5", icon: Star, color: "text-amber-500 bg-amber-50" },
    { label: "Practical Learning", value: "100%", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" },
  ];

  const pillars = [
    {
      step: "01",
      title: "AI Avatar Vlogging & Digital Humans",
      desc: "Master creating talking digital avatars, realistic human models, and multilingual automated videos without ever showing your face or holding a camera.",
      icon: Users,
      badge: "Zero Camera Confidence Needed",
    },
    {
      step: "02",
      title: "2D & 3D Cinematic Animation",
      desc: "Generate studio-grade 3D character renders, Pixar-style storytelling, Japanese anime scenes, and viral stickman fights using cutting-edge motion AI tools.",
      icon: Layers,
      badge: "Hollywood & Cartoon Aesthetics",
    },
    {
      step: "03",
      title: "High-Converting UGC Ads & Shorts",
      desc: "Turn your video creation skills into a high-paying freelancing or e-commerce agency, creating viral short-form ads for brands with exceptional ROI.",
      icon: Rocket,
      badge: "High-Income Commercial Skill",
    },
  ];

  const whyChooseUs = [
    {
      title: "100% Practical Workflows",
      desc: "No fluff theory. You follow step-by-step video creation pipelines from prompt generation to final 4K video exports.",
      icon: Zap,
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Beginner-Friendly Approach",
      desc: "Designed for students, creators, and professionals with zero prior video editing, 3D modeling, or coding experience.",
      icon: GraduationCap,
      color: "bg-pink-50 text-pink-600",
    },
    {
      title: "Lifetime Access & Free Updates",
      desc: "AI evolves every month. When new breakthrough models launch, our course syllabus is updated free for all enrolled students.",
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Dedicated WhatsApp Mentorship",
      desc: "Stuck on a prompt or render error? Chat directly with experienced video creators on WhatsApp for instant assistance.",
      icon: MessageCircle,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans bg-slate-50">
      <div className="pt-24 md:pt-32 pb-24 relative z-10">
        
        {/* ================= 1. HERO BANNER ================= */}
        <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-24">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-14 md:p-16 text-white border border-violet-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 size-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 size-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase mb-6 bg-white/10 border border-violet-400/30 text-violet-300 backdrop-blur-md">
                  <Sparkles className="size-4 text-violet-400 fill-violet-400" /> About {academyName}
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-[1.08]">
                  Empowering <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                    Next-Gen AI Creators
                  </span>
                </h1>

                <p className="text-base sm:text-lg md:text-xl font-bold text-slate-300 leading-relaxed max-w-2xl mb-8">
                  We bridge the gap between creative imagination and cutting-edge artificial intelligence. Master AI avatars, 2D/3D animation, UGC influencer ads, and viral video creation.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to={coursesUrl}
                    className="px-7 py-3.5 rounded-full text-xs sm:text-sm font-black bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Explore Our Courses</span>
                    <ArrowRight className="size-4 stroke-[3]" />
                  </Link>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-7 py-3.5 rounded-full text-xs sm:text-sm font-black bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="size-4 text-emerald-400" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* 4 Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl flex flex-col justify-between hover:border-violet-400/40 transition-colors shadow-lg"
                    >
                      <div className="size-11 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center mb-4">
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

        {/* ================= 2. MISSION & VISION SECTION ================= */}
        <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-24">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Mission Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-violet-300 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="size-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-6">
                  <Target className="size-6 stroke-[2.5]" />
                </div>
                <h3 className="text-2xl font-black text-slate-950 mb-3">Our Mission</h3>
                <p className="text-slate-600 text-sm sm:text-base font-bold leading-relaxed">
                  To democratize high-end video production by equipping every creator, freelancer, and business owner with simple, actionable AI workflows. We believe powerful video creation should not require millions in equipment or years of editing school.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-black text-violet-600">
                <CheckCircle2 className="size-4" />
                <span>Democratizing Video Production for Everyone</span>
              </div>
            </div>

            {/* Vision Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="size-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                  <Rocket className="size-6 stroke-[2.5]" />
                </div>
                <h3 className="text-2xl font-black text-slate-950 mb-3">Our Vision</h3>
                <p className="text-slate-600 text-sm sm:text-base font-bold leading-relaxed">
                  To build the most forward-thinking global community of AI video artists and entrepreneurs, leading the next wave of social storytelling, virtual cinema, and high-impact automated marketing.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-black text-indigo-600">
                <CheckCircle2 className="size-4" />
                <span>Empowering Global AI Video Entrepreneurs</span>
              </div>
            </div>

          </div>
        </div>

        {/* ================= 3. CORE PILLARS ================= */}
        <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-24">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider bg-violet-50 border border-violet-200 text-violet-700 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              OUR CORE PILLARS
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight">
              What We Teach at Our Academy
            </h2>
            <p className="mt-3 text-sm md:text-base font-bold text-slate-600">
              Hands-on practical training designed to get you real results and viral impressions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.step}
                  className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="size-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-xs">
                        <Icon className="size-6 stroke-[2.5]" />
                      </div>
                      <span className="text-2xl font-black font-mono text-slate-300">{card.step}</span>
                    </div>

                    <h3 className="text-xl font-black text-slate-950 mb-3">{card.title}</h3>
                    <p className="text-xs md:text-sm font-bold text-slate-500 leading-relaxed mb-6">{card.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <span className="inline-block text-[11px] font-black text-violet-700 bg-violet-50 px-3 py-1 rounded-lg">
                      {card.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= 4. WHY CHOOSE US ================= */}
        <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-24">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-violet-600">THE AIFLIX ADVANTAGE</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 mt-1">
              Why 10,000+ Students Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`size-12 rounded-2xl ${item.color} flex items-center justify-center mb-5`}>
                    <item.icon className="size-6 stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-black text-slate-950 mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= 5. CERTIFICATE SECTION ================= */}
        <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-24">
          <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-14 shadow-2xl relative overflow-hidden">
            <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 mb-5">
                  <Award className="size-4 text-amber-300" /> Verifiable Credentials
                </div>
                <h3 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
                  Earn Your Industry Recognized <br />
                  AI Video Creator Certificate
                </h3>
                <p className="text-violet-100 text-xs sm:text-base font-bold leading-relaxed mb-6 max-w-xl">
                  Showcase your practical expertise to clients, agencies, and employers with a verifiable certificate awarded upon completing any course.
                </p>
                <Link
                  to={coursesUrl}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-black text-xs sm:text-sm bg-[#fedc5c] text-slate-950 hover:bg-amber-300 transition-all shadow-lg hover:scale-105"
                >
                  <span>Start Learning Today</span>
                  <ArrowRight className="size-4 stroke-[3]" />
                </Link>
              </div>

              <div className="flex justify-center">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl text-center max-w-[280px]">
                  <Award className="size-20 text-amber-300 mx-auto mb-3" />
                  <h4 className="text-base font-black text-white mb-1">Official Certification</h4>
                  <p className="text-xs font-bold text-violet-200">Verifiable digital credential with unique certificate ID</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 6. FINAL CALL TO ACTION ================= */}
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm">
            <h3 className="text-2xl sm:text-4xl font-black text-slate-950 mb-3">
              Ready to Master AI Video Creation?
            </h3>
            <p className="text-xs sm:text-base font-bold text-slate-500 max-w-lg mx-auto mb-8">
              Join thousands of creators turning simple text prompts into viral masterpieces.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to={coursesUrl}
                className="px-8 py-4 rounded-full font-black text-xs sm:text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:scale-105 transition-all"
              >
                Browse All AI Courses
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 rounded-full font-black text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all flex items-center gap-2"
              >
                <MessageCircle className="size-4 text-emerald-600" />
                <span>Talk to Learning Support</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
