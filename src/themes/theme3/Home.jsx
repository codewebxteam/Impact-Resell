/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Users,
  BookOpen,
  Check,
  Star,
  Minus,
  Plus,
  MessageCircleQuestion,
  GraduationCap,
  TrendingUp,
  Code,
  Clock,
  Play,
  Video,
  Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAgency } from "../../context/AgencyContext";

// ==========================================
// THEME CONFIGURATION (#fedc5c Accent Driven)
// ==========================================
const THEME = {
  bg: "bg-white",
  textMain: "text-slate-950",
  textMuted: "text-slate-600",
  accentColor: "#fedc5c",
  
  // Gradients & Buttons
  gradientText: "bg-gradient-to-r from-slate-950 via-slate-900 to-amber-600 bg-clip-text text-transparent",
  buttonPrimary: "bg-[#fedc5c] text-slate-950 font-black shadow-lg shadow-amber-400/30 hover:bg-amber-400 hover:-translate-y-1 hover:shadow-xl transition-all duration-300",
  buttonSecondary: "bg-white border-2 border-slate-200 text-slate-800 hover:border-amber-400 hover:text-slate-950 transition-all shadow-sm hover:-translate-y-1 font-extrabold",
  
  // Cards & Badges
  cardOuter: "bg-white p-2.5 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_30px_60px_rgba(254,220,92,0.18)] transition-all duration-500 hover:-translate-y-2",
  cardImageWrap: "relative h-56 rounded-[2rem] overflow-hidden bg-slate-100",
  badgeBg: "bg-white/90 border border-amber-400/40 text-slate-900 shadow-sm backdrop-blur-md font-black",
  iconBg: "bg-[#fedc5c] text-slate-950",
};

// ==========================================
// DATA: FAQS
// ==========================================
const faqs = [
  { id: 1, question: "Do I need a high-end PC or camera to create AI videos and avatars?", answer: "No! All AI video generation, avatar creation, and 2D/3D animations can be done using cloud-based AI tools on any mobile or computer." },
  { id: 2, question: "What video styles will I learn in this academy?", answer: "You will master AI Avatar Vlogging, 2D/3D Animation, AI Influencer UGC Ads, Historical Documentaries, Anime, Stickman, Baby Podcast, and Business Promos." },
  { id: 3, question: "Can I monetize these AI videos on YouTube, Instagram, or sell to clients?", answer: "Yes! We teach you exact strategies to build viral YouTube Shorts, Instagram Reels, grow AI channels, and land paying clients." },
  { id: 4, question: "Are the AI video tools free to use?", answer: "We cover completely free AI tools as well as top-tier paid AI platforms with free credits and trial workflows." },
  { id: 5, question: "Will I get step-by-step AI prompts and project templates?", answer: "Yes! You get ready-to-use AI text prompts, voiceover setups, animation workflows, and lifetime updates." },
  { id: 6, question: "Will I get support if I face issues while generating videos?", answer: "Yes! You’ll have direct access to WhatsApp & Email support from our team to guide you step-by-step." },
];

// ==========================================
// 1. HERO SECTION
// ==========================================
const HeroSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const coursesUrl = isDev ? `/dev/${themeName}/courses` : "/courses";

  const handleExploreCourses = () => navigate(coursesUrl);

  return (
    <section className="relative min-h-[760px] sm:min-h-[850px] md:min-h-screen w-full overflow-hidden flex items-center">
      {/* LAPTOP / DESKTOP FULL SCREEN BACKGROUND (md and above) */}
      <img
        src="https://ik.imagekit.io/0s0fb4b2b/Theme/hero3theme.webp"
        alt="Theme 3 Hero Desktop Background"
        className="hidden md:block absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* PHONE / MOBILE FULL SCREEN BACKGROUND (below md) */}
      <img
        src="https://ik.imagekit.io/0s0fb4b2b/Theme/hero3themeP.webp"
        alt="Theme 3 Hero Mobile Background"
        className="block md:hidden absolute top-16 sm:top-20 inset-x-0 bottom-0 w-full h-[calc(100%-4rem)] object-cover object-bottom pointer-events-none select-none z-0"
      />

      {/* CONTENT CONTAINER */}
      <div className="relative z-10 w-full max-w-[1500px] mx-auto px-5 sm:px-10 lg:px-16 pt-20 sm:pt-24 pb-[380px] sm:pb-[440px] md:py-24 lg:py-32 flex flex-col justify-start md:justify-center min-h-[880px] sm:min-h-[960px] md:min-h-screen">
        <div className="w-full max-w-[650px] lg:max-w-[700px]">
          
          {/* TEXT CONTENT ANIMATION */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start"
          >
            {/* Small badge */}
            <div className={`mb-4 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[12px] uppercase tracking-[0.18em] ${THEME.badgeBg}`}>
              <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-400 shadow-[0_0_0_4px_rgba(254,220,92,0.3)] animate-pulse" />
              AI Video & Avatar Academy
              <Sparkles size={13} className="text-amber-500 fill-amber-400" />
            </div>

            {/* Heading */}
            <h1 className="text-[32px] sm:text-[56px] md:text-[64px] lg:text-[76px] font-black leading-[1.04] tracking-[-0.04em] text-slate-950">
              Create Viral AI
              <br />
              <span className="bg-gradient-to-r from-slate-950 via-amber-600 to-amber-500 bg-clip-text text-transparent">
                Videos & Avatars.
              </span>
            </h1>

            {/* Description */}
            <p className={`mt-2.5 sm:mt-6 max-w-[560px] text-[13.5px] sm:text-[17px] font-bold leading-relaxed sm:leading-8 ${THEME.textMuted}`}>
              Master AI avatar vlogging, 2D & 3D animation, AI influencer ads, historical documentaries, and viral video creation with hands-on projects.
            </p>

            {/* Action Buttons */}
            <div className="mt-4.5 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-6">
              <button 
                onClick={handleExploreCourses} 
                className={`group flex items-center gap-2.5 sm:gap-3 rounded-2xl px-5 sm:px-7 py-2.5 sm:py-4 text-[13px] sm:text-[15px] ${THEME.buttonPrimary}`}
              >
                Explore Courses
                <span className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-slate-950 text-[#fedc5c] transition-transform duration-300 group-hover:rotate-45">
                  <ArrowRight size={15} />
                </span>
              </button>

              {/* Hand-drawn Curvy Arrow + Start your journey today */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg
                  width="65"
                  height="40"
                  viewBox="0 0 100 50"
                  fill="none"
                  className="text-amber-500 stroke-current -rotate-6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M 10 40 Q 45 5 85 25" />
                  <path d="M 70 18 L 85 25 L 75 35" />
                </svg>
                <span className="text-slate-950 font-black text-xs sm:text-sm -rotate-6 leading-tight select-none">
                  Start your<br />journey today!
                </span>
              </div>
            </div>

            {/* Social Trust Metrics - Hidden on phone view */}
            <div className="hidden sm:flex mt-5 sm:mt-10 flex-wrap items-center gap-3 sm:gap-7">
              <div className="flex items-center">
                {[12, 32, 47, 68].map((img, index) => (
                  <img
                    key={index}
                    src={`https://i.pravatar.cc/80?img=${img}`}
                    alt="Student"
                    className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full border-[2.5px] sm:border-[3px] border-white object-cover shadow-xs ${
                      index !== 0 ? "-ml-2.5 sm:-ml-3" : ""
                    }`}
                  />
                ))}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-amber-500 fill-amber-400" />
                  <span className={`text-xs sm:text-sm font-black ${THEME.textMain}`}>
                    10,000+ AI Video Creators
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] sm:text-xs font-bold text-slate-500">
                  Trusted by content creators worldwide
                </p>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, iconColor, iconBg, title, desc }) => (
  <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 flex items-start gap-4 hover:-translate-y-1 transition-transform">
    <div className={`size-10 sm:size-11 ${iconBg} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
      <Icon className={`${iconColor} size-5`} strokeWidth={2.5} />
    </div>
    <div>
      <h4 className="font-black text-slate-950 text-sm sm:text-base mb-0.5">{title}</h4>
      <p className="text-xs text-slate-500 font-bold leading-relaxed">{desc}</p>
    </div>
  </div>
);

const FeaturesOverlapBar = () => (
  <div className="relative z-30 max-w-7xl mx-auto px-5 sm:px-6 -mt-16 sm:-mt-20 md:-mt-24 mb-6 sm:mb-10">
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      <FeatureCard icon={Users} iconColor="text-slate-950" iconBg="bg-[#fedc5c]" title="Expert Mentors" desc="Learn from industry professionals" />
      <FeatureCard icon={Code} iconColor="text-slate-950" iconBg="bg-[#fedc5c]" title="Real Projects" desc="Build portfolio with real-world experience" />
      <FeatureCard icon={Users} iconColor="text-slate-950" iconBg="bg-[#fedc5c]" title="Active Community" desc="Collaborate, learn and grow together" />
      <FeatureCard icon={TrendingUp} iconColor="text-slate-950" iconBg="bg-[#fedc5c]" title="Career Focused" desc="Get job-ready skills that matter" />
    </div>
  </div>
);

// ==========================================
// 3. TOP FEATURED COURSES SECTION (6 Courses: 3x2 Grid)
// ==========================================
const FeaturedCoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const { isMainSite, agency } = useAgency();
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const coursesUrl = isDev ? `/dev/${themeName}/courses` : "/courses";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snap = await getDocs(collection(db, "courseVideos"));
        let data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        data = isMainSite ? data.filter(c => !c.partnerId || c.partnerId === "admin") : data.filter(c => !c.partnerId || c.partnerId === "admin" || c.partnerId === agency?.id);
        data.sort((a, b) => (parseInt(a.priority) || 9999) - (parseInt(b.priority) || 9999));
        setCourses(data.slice(0, 6));
      } catch (e) { console.error(e); }
    };
    fetchCourses();
  }, [isMainSite, agency?.id]);

  return (
    <section className="w-full bg-slate-50 py-20 md:py-28 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-4xl mx-auto">
           <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] md:text-xs uppercase mb-6 ${THEME.badgeBg}`}>
             <BookOpen className="size-4 text-amber-500" /> Top Trending AI Courses
           </div>
           <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 ${THEME.textMain}`}>
             Master The Most <span className="bg-gradient-to-r from-slate-950 via-amber-600 to-amber-500 bg-clip-text text-transparent">Viral AI Video Skills</span>
           </h2>
           <p className={`text-base md:text-xl font-bold ${THEME.textMuted}`}>
             Explore top-rated courses designed to launch your AI content creation career.
           </p>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div key={course.id} className={index >= 3 ? "hidden md:block" : "block"}>
                <HomeCourseCard data={course} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 animate-pulse text-slate-400 font-mono text-sm">
             loading_courses...
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <Link to={coursesUrl}>
            <button className={`group flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm md:text-base ${THEME.buttonSecondary}`}>
               Explore All Courses
               <div className="size-6 bg-[#fedc5c] text-slate-950 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <ArrowRight className="size-3.5 stroke-[3]" />
               </div>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const HomeCourseCard = ({ data }) => {
  const { isMainSite, getPrice } = useAgency();
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const courseUrl = isDev ? `/dev/${themeName}/coursedetails/${data?.id}` : `/courses/${data?.id}`;

  const price = getPrice(data?.id, data?.price || "2,999");
  const imageUrl = data?.image || (data?.videoId ? `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg` : "https://placehold.co/600x400?text=No+Image");
  const duration = data?.duration || "Flexible";
  
  let lecturesCount = "1 Module";
  if (data?.lectures && Array.isArray(data.lectures)) {
    lecturesCount = `${data.lectures.length} Lectures`;
  } else if (typeof data?.lectures === "string" || typeof data?.lectures === "number") {
    lecturesCount = data.lectures;
  }

  return (
    <div className={`group flex flex-col h-full ${THEME.cardOuter}`}>
      <Link to={courseUrl} className="block cursor-pointer relative">
        <div className={`${THEME.cardImageWrap} group-hover:shadow-inner`}>
          <img
            src={imageUrl}
            alt={data?.title}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/70 opacity-80" />

          {/* Top-Right Arrow Badge on Image */}
          <div className="absolute top-3 right-3 z-10 size-8 sm:size-9 rounded-full bg-[#fedc5c] text-slate-950 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
            <ArrowUpRight className="size-4 sm:size-5 stroke-[2.5] transition-transform duration-300 group-hover:rotate-45" />
          </div>
        </div>
      </Link>

      <div className="px-4 pt-4 pb-3 flex flex-col flex-1 justify-between">
        <div>
          <Link to={courseUrl} className="block mb-3">
            <h3 className={`text-base sm:text-lg font-black line-clamp-2 leading-snug transition-colors ${THEME.textMain} group-hover:text-amber-600`}>
              {data?.title || "Course Title"}
            </h3>
          </Link>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100">
              <Clock className="size-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-600 truncate">{duration}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100">
              <BookOpen className="size-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-600 truncate">{lecturesCount}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {!isMainSite ? (
            <span className={`text-lg font-black ${price == 0 || price === "Free" ? "text-emerald-500" : THEME.textMain}`}>
              {price == 0 || price === "Free" ? "Free" : `₹${price}`}
            </span>
          ) : (
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">AI Course</span>
          )}

          <Link
            to={courseUrl}
            className="flex items-center gap-1 text-xs font-black text-amber-600 group-hover:translate-x-1 transition-transform"
          >
            <span>View</span>
            <ArrowRight className="size-3.5 stroke-[3]" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. HOW IT WORKS SECTION
// ==========================================
const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      icon: Video,
      title: "Choose a Course",
      desc: "Pick the course that matches your interest.",
    },
    {
      step: "02",
      icon: GraduationCap,
      title: "Learn & Practice",
      desc: "Follow step-by-step lessons and practice with examples.",
    },
    {
      step: "03",
      icon: Rocket,
      title: "Create & Grow",
      desc: "Start creating your own videos and share them with the world.",
    },
  ];

  return (
    <section className="w-full bg-[#fffdf5] py-20 md:py-28 overflow-hidden relative border-t border-amber-100/60">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto relative">
          <div className="hidden lg:flex absolute right-[-80px] top-[-10px] items-center gap-2">
            <svg
              width="50"
              height="40"
              viewBox="0 0 100 50"
              fill="none"
              className="text-slate-700 stroke-current -rotate-12"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 10 40 Q 45 5 85 25" />
              <path d="M 70 18 L 85 25 L 75 35" />
            </svg>
            <span className="font-sans font-black text-slate-800 text-xs leading-tight text-left select-none italic">
              Learn.<br />Create.<br />Grow.
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider bg-amber-100/80 border border-amber-300/60 text-slate-900 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            HOW IT WORKS
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950 mb-4">
            A Simple Path to{" "}
            <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-slate-950 bg-clip-text text-transparent">
              Video Mastery
            </span>
          </h2>
          <p className="text-sm md:text-lg font-bold text-slate-600">
            Start learning and create amazing videos in just 3 simple steps.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 relative flex flex-col justify-between"
              >
                {/* Header row: step number + icon */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#fedc5c] text-slate-950 font-black text-lg flex items-center justify-center shadow-md shadow-amber-400/30 shrink-0">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-950 mb-2">{item.title}</h3>
                  <p className="text-xs md:text-sm font-bold text-slate-500 leading-relaxed">{item.desc}</p>
                </div>

                {/* Right Arrow indicator except for last card */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 items-center justify-center shadow-xs">
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 5. TESTIMONIALS SECTION
// ==========================================
const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Rohit Sharma",
      role: "YouTuber",
      avatar: "https://i.pravatar.cc/100?img=12",
      quote: "The courses are easy to follow and very practical. I created my first AI historical video in just 2 weeks!",
      stars: 5,
    },
    {
      id: 2,
      name: "Priya Verma",
      role: "Entrepreneur",
      avatar: "https://i.pravatar.cc/100?img=32",
      quote: "Amazing content and great support. Now I create UGC ads for my brand using AI!",
      stars: 5,
    },
    {
      id: 3,
      name: "Aman Khan",
      role: "Student",
      avatar: "https://i.pravatar.cc/100?img=47",
      quote: "Best investment! Everything is explained in simple language and really works.",
      stars: 5,
    },
  ];

  return (
    <section className="w-full bg-white py-20 md:py-28 overflow-hidden relative border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider bg-amber-100/80 border border-amber-300/60 text-slate-900 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              STUDENT TESTIMONIALS
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950">
              What Our Learners Say
            </h2>
            <p className="mt-2 text-sm md:text-base font-bold text-slate-500 max-w-xl">
              Join thousands of students who are already creating amazing videos with AI.
            </p>
          </div>

          <div className="shrink-0">
            <button className="flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs md:text-sm bg-[#fedc5c] text-slate-950 shadow-md hover:bg-amber-400 transition-all hover:-translate-y-0.5">
              <span>View All Reviews</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/80 rounded-3xl p-7 border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* Avatar + Stars */}
                <div className="flex items-center justify-between mb-5">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div className="flex items-center gap-1">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs md:text-sm font-bold text-slate-700 leading-relaxed italic mb-6">
                  "{item.quote}"
                </p>
              </div>

              <div>
                <h4 className="text-sm md:text-base font-black text-slate-950">{item.name}</h4>
                <p className="text-xs font-bold text-slate-400">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 6. CALL TO ACTION SECTION
// ==========================================
const CallToActionSection = () => {
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const coursesUrl = isDev ? `/dev/${themeName}/courses` : "/courses";

  return (
    <section className="w-full bg-white pb-20 md:pb-28 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#fef9c3] border border-amber-200/90 rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 md:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-xs">
          
          {/* Left: Overlapping Tilted Cards Showcase */}
          <div className="relative w-full md:w-1/2 h-48 sm:h-56 flex items-center justify-center">
            {/* Card 1: Left Tilted */}
            <div className="absolute left-2 sm:left-6 top-4 w-32 sm:w-40 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-xl border-2 border-white -rotate-12 bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80"
                alt="AI Video 1"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/90 text-slate-950 flex items-center justify-center shadow-md">
                  <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                </div>
              </div>
            </div>

            {/* Card 2: Center Straight */}
            <div className="absolute z-10 w-36 sm:w-44 h-44 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80"
                alt="AI Video 2"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#fedc5c] text-slate-950 flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                </div>
              </div>
            </div>

            {/* Card 3: Right Tilted */}
            <div className="absolute right-2 sm:right-6 top-4 w-32 sm:w-40 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-xl border-2 border-white rotate-12 bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                alt="AI Video 3"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/90 text-slate-950 flex items-center justify-center shadow-md">
                  <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content & CTA */}
          <div className="w-full md:w-1/2 flex flex-col items-start text-left z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 leading-snug mb-3">
              Ready to Create Your Own Amazing Videos?
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed mb-6 max-w-md">
              Join now and get lifetime access to all courses, updates, and community support.
            </p>

            <Link to={coursesUrl}>
              <button className="flex items-center gap-2.5 px-7 py-3.5 rounded-full font-black text-xs sm:text-sm bg-[#fedc5c] text-slate-950 shadow-md shadow-amber-400/30 hover:bg-amber-400 transition-all hover:-translate-y-1">
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </Link>
          </div>

          {/* Decorative Rays */}
          <div className="absolute bottom-4 right-6 text-amber-500 opacity-70 pointer-events-none">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" className="stroke-current stroke-[3]">
              <line x1="20" y1="5" x2="20" y2="12" />
              <line x1="30" y1="10" x2="25" y2="15" />
              <line x1="35" y1="20" x2="28" y2="20" />
            </svg>
          </div>

        </div>
      </div>
    </section>
  );
};

// ==========================================
// 7. FAQ SECTION
// ==========================================
const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const contactUrl = isDev ? `/dev/${themeName}/contact` : "/contact";

  return (
    <section className="w-full relative py-20 md:py-28 px-6 bg-slate-50 overflow-hidden border-t border-slate-100">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-14 lg:gap-16">

          {/* LEFT: heading + support prompt */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-amber-600 font-black mb-5">
              <MessageCircleQuestion className="size-4" /> faq.log
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-950 leading-[1.05]">
              Questions, <br /> answered.
            </h2>
            <p className="mt-6 text-slate-600 font-bold max-w-sm">
              Everything you need to know before you enroll. Can't find it here? Our team replies fast.
            </p>

            <div className="mt-10 rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs">
              <p className="font-mono text-xs text-slate-400 mb-2">$ still_stuck --help</p>
              <h3 className="text-lg font-black text-slate-950 mb-5">Talk to our team directly</h3>
              <Link to={contactUrl}>
                <button className="w-full sm:w-auto px-7 py-3.5 rounded-full font-black text-sm bg-[#fedc5c] text-slate-950 shadow-md hover:bg-amber-400 transition-transform hover:-translate-y-0.5">
                  Get in Touch
                </button>
              </Link>
            </div>
          </div>

          {/* RIGHT: numbered Q/A log */}
          <div className="flex flex-col">
            {faqs.map((faq, index) => {
              const isOpen = activeIndex === index;
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className={`border-b ${index === 0 ? "border-t" : ""} border-slate-200/70`}
                >
                  <button
                    onClick={() => setActiveIndex(isOpen ? null : index)}
                    className="w-full flex items-start gap-5 py-6 text-left cursor-pointer outline-none group bg-transparent"
                  >
                    <span className={`font-mono text-xs mt-1 shrink-0 transition-colors ${isOpen ? "text-amber-600 font-black" : "text-slate-400"}`}>
                      Q{String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={`flex-1 text-base md:text-lg font-black transition-colors ${isOpen ? "text-slate-950" : "text-slate-700 group-hover:text-slate-950"}`}>
                      {faq.question}
                    </span>
                    <div className={`size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 border ${isOpen ? "rotate-45 border-amber-500 bg-[#fedc5c] text-slate-950" : "border-slate-300 text-slate-400"}`}>
                      <Plus className="size-3.5 stroke-[2.5]" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                        <div className="pl-[3.1rem] pb-7 pr-8">
                          <p className="text-slate-600 text-sm md:text-base leading-relaxed font-bold">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// MAIN HOME COMPONENT
// ==========================================
const Home = () => {
  return (
    <main className={`min-h-screen w-full overflow-x-hidden ${THEME.textMain}`}>
      <HeroSection />
      <FeaturesOverlapBar />
      <FeaturedCoursesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CallToActionSection />
      <FAQSection />
    </main>
  );
};

export default Home;
