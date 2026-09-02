import React, { useEffect, useState } from "react";
import {
  ArrowRight,
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
  Laptop,
  Lightbulb,
  TrendingUp,
  Code,
  Clock,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAgency } from "../../context/AgencyContext";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../../components/AuthModal";

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
  progressGradient: "bg-gradient-to-r from-[var(--accent-color)] to-[var(--brand-color)]",

  // Glass & Cards
  glassPanel: "bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50",
  cardOuter: "bg-white p-2.5 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2",
  cardImageWrap: "relative h-52 rounded-[2rem] overflow-hidden bg-slate-100",

  // Buttons
  buttonPrimary: "bg-gradient-to-r from-[var(--brand-color)] to-[var(--accent-color)] text-white shadow-lg shadow-[var(--brand-color)]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300",
  buttonSecondary: "bg-white border border-slate-200 text-slate-700 hover:border-[var(--brand-color)] hover:text-[var(--brand-color)] transition-all shadow-sm hover:-translate-y-1",

  // Ambient Glows
  cyanGlow: "bg-[var(--accent-color)]/10 blur-[120px]",
  blueGlow: "bg-[var(--brand-color)]/10 blur-[120px]",
  indigoGlow: "bg-slate-300/40 blur-[100px]",

  // UI Accents
  iconBg: "bg-[var(--brand-color)]/10 text-[var(--brand-color)]",
  badgeBg: "bg-white border border-[var(--brand-color)]/20 text-[var(--brand-color)] shadow-sm",
};

// ==========================================
// DATA: FAQS
// ==========================================
const faqs = [
  { id: 1, question: "Who is this course for?", answer: "This course is designed for beginners, students, working professionals, and creators who want to build industry-ready skills from scratch." },
  { id: 2, question: "Do I need any prior experience?", answer: "No prior experience is required. The course starts from the basics and gradually moves to advanced, practical concepts." },
  { id: 3, question: "How will I access the course after enrollment?", answer: "You’ll get instant access to all course content after successful payment. Learn anytime, at your own pace." },
  { id: 4, question: "Is this course online or offline?", answer: "This is a 100% online course, accessible from anywhere using a mobile, tablet, or computer." },
  { id: 5, question: "Will I get a certificate after completing the course?", answer: "Yes, you’ll receive a certificate of completion after finishing the course." },
  { id: 6, question: "Will I get support if I face issues?", answer: "Yes. You’ll have access to WhatsApp & Email support and guidance from our team." },
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
    <section className="relative pt-24 lg:pt-32 pb-16 overflow-hidden flex items-center bg-white">
      {/* Top Right Blob */}
      <div className="absolute top-0 right-0 w-[600px] lg:w-[800px] h-[600px] lg:h-[800px] bg-[var(--brand-color)]/15 rounded-bl-[100%] -z-10 translate-x-1/4 -translate-y-1/4" />

      {/* Dotted Grids */}
      <div className="absolute top-32 left-1/2 -translate-x-12 grid grid-cols-4 gap-3 opacity-30 -z-10">
        {Array.from({ length: 24 }).map((_, i) => <div key={i} className="size-1.5 bg-slate-300 rounded-full" />)}
      </div>
      <div className="absolute bottom-24 right-12 grid grid-cols-3 gap-3 opacity-30 -z-10 hidden lg:grid">
        {Array.from({ length: 15 }).map((_, i) => <div key={i} className="size-1.5 bg-slate-300 rounded-full" />)}
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">

          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase mb-8 ${THEME.badgeBg}`}>
              <Sparkles className="size-4" />
              Skills That Pay You Back
            </div>

            {/* Heading */}
            <h1 className={`text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold leading-[1.1] mb-6 tracking-tight ${THEME.textMain}`}>
              Master Skills <br />
              That Define <br />
              <span className="text-[var(--brand-color)] relative inline-block mt-2">
                The Future.
                <svg className="absolute w-full h-4 -bottom-2 left-0 text-[var(--brand-color)]/40" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,10 Q50,20 100,10" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>

            {/* Description */}
            <p className={`mt-8 text-lg md:text-xl font-medium leading-relaxed max-w-lg ${THEME.textMuted}`}>
              Join the elite academy for developers and creators. Real-world projects, expert mentorship, and a community that pushes you forward.
            </p>

            {/* Button & Hand-drawn Arrow */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-10">
              <button onClick={handleExploreCourses} className={`group flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg ${THEME.buttonPrimary}`}>
                Explore Courses
                <div className="size-7 bg-white text-[var(--brand-color)] rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <ArrowRight className="size-4" />
                </div>
              </button>
              <div className="hidden sm:flex items-center gap-2 mt-4 sm:mt-0">
                <svg width="60" height="40" viewBox="0 0 100 50" className="text-[var(--brand-color)] fill-none stroke-current" strokeWidth="2" strokeLinecap="round" style={{ transform: "rotate(-10deg)" }}>
                  <path d="M10,40 Q40,10 90,30" />
                  <path d="M80,20 L90,30 L75,35" />
                </svg>
                <span className="text-[var(--brand-color)] font-medium -rotate-12 mt-6">Start your<br />journey today!</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT VISUAL (Orbiting System) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full aspect-square max-w-[600px] mx-auto flex items-center justify-center"
          >
            {/* Concentric Circles */}
            <div className="absolute inset-4 rounded-full border-[1.5px] border-slate-100" />
            <div className="absolute inset-16 rounded-full border-[1.5px] border-slate-200 border-dashed" />
            <div className="absolute inset-32 rounded-full border-[1.5px] border-slate-100" />

            {/* Center Hexagon */}
            <div className="absolute z-10 size-48 flex items-center justify-center drop-shadow-2xl">
              <svg viewBox="0 0 100 100" className="absolute inset-0 size-full text-white fill-current">
                <path d="M50 3.5 C52.5 3.5, 55 4.5, 57 6 L88 24.5 C91.5 26.5, 93.5 30.5, 93.5 34.5 L93.5 65.5 C93.5 69.5, 91.5 73.5, 88 75.5 L57 94 C53 96.5, 47 96.5, 43 94 L12 75.5 C8.5 73.5, 6.5 69.5, 6.5 65.5 L6.5 34.5 C6.5 30.5, 8.5 26.5, 12 24.5 L43 6 C45 4.5, 47.5 3.5, 50 3.5 Z" />
              </svg>
              <GraduationCap className="size-20 text-[var(--brand-color)] relative z-10" strokeWidth={1.5} />
            </div>

            {/* Orbiting Floating Cards */}
            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[10%] left-[15%] bg-white p-5 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-50 z-20">
              <Laptop className="text-emerald-500 size-8" strokeWidth={1.5} />
            </motion.div>
            <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[22%] right-[5%] bg-white p-5 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-50 z-20">
              <Lightbulb className="text-yellow-500 size-8" strokeWidth={1.5} />
            </motion.div>
            <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[28%] left-[2%] bg-white p-5 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-50 z-20">
              <TrendingUp className="text-blue-500 size-8" strokeWidth={1.5} />
            </motion.div>
            <motion.div animate={{ y: [8, -8, 8] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[18%] right-[12%] bg-white p-5 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-50 z-20">
              <Code className="text-rose-500 size-8" strokeWidth={1.5} />
            </motion.div>

            {/* Decorative Dots */}
            <div className="absolute top-[18%] left-[45%] size-3 bg-yellow-400 rounded-full" />
            <div className="absolute bottom-[25%] right-[32%] size-2.5 bg-[var(--accent-color)] rounded-full" />
            <div className="absolute top-[48%] left-[12%] size-2 bg-blue-500 rounded-full" />
          </motion.div>
        </div>

        {/* BOTTOM CARDS & STATS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 lg:mt-24 flex flex-col xl:flex-row gap-8 items-stretch xl:items-end justify-between"
        >
          {/* Feature Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            <FeatureCard icon={Users} iconColor="text-[var(--brand-color)]" iconBg="bg-[var(--brand-color)]/10" title="Expert Mentors" desc="Learn from industry professionals" />
            <FeatureCard icon={Code} iconColor="text-blue-500" iconBg="bg-blue-50" title="Real Projects" desc="Build portfolio with real-world experience" />
            <FeatureCard icon={Users} iconColor="text-emerald-500" iconBg="bg-emerald-50" title="Active Community" desc="Collaborate, learn and grow together" />
            <FeatureCard icon={TrendingUp} iconColor="text-orange-500" iconBg="bg-orange-50" title="Career Focused" desc="Get job-ready skills that matter" />
          </div>

          {/* Stats Box */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-50 flex items-center justify-between gap-6 shrink-0 w-full xl:w-auto overflow-x-auto">
            <StatItem icon={GraduationCap} color="bg-[var(--brand-color)]" title="250+" subtitle="Courses" />
            <div className="w-px h-12 bg-slate-100 shrink-0" />
            <StatItem icon={Users} color="bg-blue-500" title="10K+" subtitle="Students" />
            <div className="w-px h-12 bg-slate-100 shrink-0" />
            <StatItem icon={Star} color="bg-[var(--accent-color)]" title="98%" subtitle="Satisfaction" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, iconColor, iconBg, title, desc }) => (
  <div className="bg-white rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col justify-between h-full hover:-translate-y-1 transition-transform">
    <div className={`size-10 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
      <Icon className={`${iconColor} size-5`} strokeWidth={2} />
    </div>
    <div>
      <h4 className="font-bold text-slate-900 text-sm mb-1">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const StatItem = ({ icon: Icon, color, title, subtitle }) => (
  <div className="flex items-center gap-4 shrink-0">
    <div className={`size-12 ${color} text-white rounded-full flex items-center justify-center shadow-lg`}>
      <Icon className="size-6" strokeWidth={1.5} />
    </div>
    <div>
      <h4 className="font-black text-2xl text-slate-900">{title}</h4>
      <p className="text-xs font-medium text-slate-500">{subtitle}</p>
    </div>
  </div>
);

// ==========================================
// 2. MARQUEE SECTION
// ==========================================
const MarqueeSection = () => {
  const { agency, isMainSite } = useAgency();
  const academyName = !isMainSite && agency ? agency.name.toUpperCase() : "AI COURSES";
  const items = ["3D VIDEO MAKER", "AI COURSE", "2D CARTOON", "CARTOON VIDEO", academyName];

  return (
    <section className="relative w-full bg-slate-950 py-5 overflow-hidden z-10">
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 48px)" }}
      />
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

      <div className="flex whitespace-nowrap select-none">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ duration: 34, ease: "linear", repeat: Infinity }}
          className="flex items-center"
        >
          {[...Array(10)].map((_, iter) => (
            <div key={iter} className="flex items-center shrink-0">
              {items.map((text, index) => {
                const isBrand = text === academyName;
                return (
                  <div key={index} className="flex items-center">
                    <span className={`font-mono text-[10px] md:text-xs mr-2.5 ${isBrand ? "text-[var(--accent-color)]" : "text-slate-600"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={`font-bold tracking-[0.15em] uppercase text-sm md:text-lg ${isBrand ? "text-white" : "text-slate-500"}`}>
                      {text}
                    </span>
                    <span className="mx-6 md:mx-8 font-mono text-lg text-[var(--brand-color)]">/</span>
                  </div>
                );
              })}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ==========================================
// 3. TOP 3 COURSES SECTION (Replaces Card Swap)
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
        // Take Top 3 only
        setCourses(data.slice(0, 3));
      } catch (e) { console.error(e); }
    };
    fetchCourses();
  }, [isMainSite, agency?.id]);

  return (
    <section className="w-full bg-slate-50 py-20 md:py-28 overflow-hidden relative">
      <div className={`absolute top-[10%] left-[-10%] h-[450px] w-[450px] rounded-full ${THEME.blueGlow} opacity-30`} />
      <div className={`absolute bottom-[5%] right-[-10%] h-[350px] w-[350px] rounded-full ${THEME.cyanGlow} opacity-30`} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
           <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 ${THEME.badgeBg}`}>
             <BookOpen className="size-4" /> Top Trending
           </div>
           <h2 className={`text-4xl md:text-6xl font-extrabold tracking-tight mb-6 ${THEME.textMain}`}>
             Master the Most <br /> <span className={THEME.gradientText}>In-Demand Skills</span>
           </h2>
           <p className={`text-lg md:text-xl font-medium ${THEME.textMuted}`}>
             Explore our top-rated courses designed to launch your career into the future.
           </p>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course) => (
               <HomeCourseCard key={course.id} data={course} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 animate-pulse text-slate-400 font-mono text-sm">
             loading_courses...
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <Link to={coursesUrl}>
            <button className={`group flex items-center gap-3 px-8 py-4 rounded-full font-bold text-sm md:text-base ${THEME.buttonSecondary}`}>
               Click here to view all courses
               <div className="size-6 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:bg-[var(--brand-color)] group-hover:text-white">
                  <ArrowRight className="size-3.5" />
               </div>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Extracted Card Component for Home Top 3
const HomeCourseCard = ({ data }) => {
  const { isMainSite, getPrice } = useAgency();
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const courseUrl = isDev ? `/dev/${themeName}/coursedetails/${data?.id}` : `/courses/${data?.id}`;

  const price = getPrice(data?.id, data?.price || "2,999");
  const imageUrl = data?.image || (data?.videoId ? `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg` : "https://placehold.co/600x400?text=No+Image");
  const category = data?.category || "General";
  const duration = data?.duration || "Flexible";
  
  let lecturesCount = "1 Module";
  if (data?.lectures && Array.isArray(data.lectures)) {
    lecturesCount = `${data.lectures.length} Lectures`;
  } else if (typeof data?.lectures === "string" || typeof data?.lectures === "number") {
    lecturesCount = data.lectures;
  }

  return (
    <div className={`group flex flex-col h-full ${THEME.cardOuter}`}>
      <Link to={courseUrl} className="block cursor-pointer">
        <div className={`${THEME.cardImageWrap} group-hover:shadow-inner`}>
          <img
            src={imageUrl}
            alt={data?.title}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/70 opacity-80" />
          
          <div className="absolute bottom-4 left-4">
            <span className="text-[10px] font-black text-[var(--brand-color)] bg-white px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm border border-white/50">
              {category}
            </span>
          </div>
        </div>
      </Link>

      <div className="px-5 pt-6 pb-4 flex flex-col flex-1">
        <Link to={courseUrl} className="block mb-4">
          <h3 className={`text-xl font-extrabold line-clamp-2 min-h-[56px] leading-snug transition-colors ${THEME.textMain} group-hover:text-[var(--brand-color)]`}>
            {data?.title || "Course Title"}
          </h3>
        </Link>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
            <Clock className="size-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 truncate">{duration}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
            <BookOpen className="size-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 truncate">{lecturesCount}</span>
          </div>
        </div>

        <div className="mt-auto pt-5 border-t border-slate-100 border-dashed flex items-center justify-between">
          <Link
            to={courseUrl}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-center ${THEME.buttonOutline}`}
          >
            Explore
          </Link>

          {!isMainSite && (
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Price</span>
                <span className={`text-xl font-black ${price == 0 || price === "Free" ? "text-emerald-500" : THEME.textMain}`}>
                  {price == 0 || price === "Free" ? "Free" : `₹${price}`}
                </span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. FAQ SECTION
// ==========================================
const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const contactUrl = isDev ? `/dev/${themeName}/contact` : "/contact";

  return (
    <section className="w-full relative py-20 md:py-28 px-6 bg-white overflow-hidden">
      <div className="absolute top-1/3 -right-40 size-96 rounded-full bg-[var(--brand-color)]/5 blur-[140px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-14 lg:gap-16">

          {/* LEFT: heading + support prompt */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--brand-color)] mb-5">
              <MessageCircleQuestion className="size-4" /> faq.log
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
              Questions, <br /> answered.
            </h2>
            <p className="mt-6 text-slate-500 font-medium max-w-sm">
              Everything you need to know before you enroll. Can't find it here? Our team replies fast.
            </p>

            <div className="mt-10 rounded-3xl border border-slate-100 bg-slate-50 p-6 md:p-8">
              <p className="font-mono text-xs text-slate-400 mb-2">$ still_stuck --help</p>
              <h3 className="text-lg font-bold text-slate-900 mb-5">Talk to our team directly</h3>
              <Link to={contactUrl}>
                <button className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm text-white transition-transform hover:-translate-y-0.5" style={{ backgroundColor: "var(--brand-color)" }}>
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
                  className={`border-b ${index === 0 ? "border-t" : ""} border-slate-100`}
                >
                  <button
                    onClick={() => setActiveIndex(isOpen ? null : index)}
                    className="w-full flex items-start gap-5 py-6 text-left cursor-pointer outline-none group bg-transparent"
                  >
                    <span className={`font-mono text-xs mt-1 shrink-0 transition-colors ${isOpen ? "text-[var(--brand-color)]" : "text-slate-300"}`}>
                      Q{String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={`flex-1 text-base md:text-lg font-bold transition-colors ${isOpen ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"}`}>
                      {faq.question}
                    </span>
                    <div className={`size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 border ${isOpen ? "rotate-45 border-[var(--brand-color)] text-[var(--brand-color)]" : "border-slate-200 text-slate-400"}`}>
                      <Plus className="size-3.5" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                        <div className="pl-[3.1rem] pb-7 pr-8">
                          <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">{faq.answer}</p>
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
    // Style wrapper to inject the theme variables globally to this page
    <main
      className={`min-h-screen w-full overflow-x-hidden ${THEME.textMain}`}
      style={{
        '--brand-color': '#6366f1', // Indigo/Purple mapping from image
        '--accent-color': '#ec4899'  // Pink mapping from image
      }}
    >
      <HeroSection />
      <MarqueeSection />
      <FeaturedCoursesSection />
      <FAQSection />
    </main>
  );
};

export default Home;