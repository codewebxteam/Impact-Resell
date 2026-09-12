/* eslint-disable no-unused-vars */
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
        src="https://ik.imagekit.io/0s0fb4b2b/Theme/hero2theme.webp"
        alt="Theme 2 Hero Desktop Background"
        className="hidden md:block absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* PHONE / MOBILE FULL SCREEN BACKGROUND (below md) */}
      <img
        src="https://ik.imagekit.io/0s0fb4b2b/Theme/hero2themeP.webp"
        alt="Theme 2 Hero Mobile Background"
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
            <div className={`mb-4 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.18em] shadow-sm backdrop-blur-md ${THEME.badgeBg}`}>
              <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-purple-500 shadow-[0_0_0_4px_rgba(168,85,247,0.12)] animate-pulse" />
              AI Video & Avatar Mastery
              <Sparkles size={13} />
            </div>

            {/* Heading */}
            <h1 className="text-[32px] sm:text-[56px] md:text-[64px] lg:text-[76px] font-black leading-[1.04] tracking-[-0.04em] text-slate-900">
              Master AI Video
              <br />
              <span className={THEME.gradientText}>
                Creation & Animation.
              </span>
            </h1>

            {/* Description */}
            <p className={`mt-2.5 sm:mt-6 max-w-[560px] text-[13.5px] sm:text-[17px] font-medium leading-relaxed sm:leading-8 ${THEME.textMuted}`}>
              Master AI avatar vlogging, 2D & 3D animation, AI influencer ads, historical documentaries, and viral content creation with hands-on projects.
            </p>

            {/* Action Buttons */}
            <div className="mt-4.5 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-6">
              <button 
                onClick={handleExploreCourses} 
                className={`group flex items-center gap-2.5 sm:gap-3 rounded-2xl px-5 sm:px-7 py-2.5 sm:py-4 text-[13px] sm:text-[15px] font-bold ${THEME.buttonPrimary}`}
              >
                Explore Courses
                <span className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-purple-300 text-[#101828] transition-transform duration-300 group-hover:rotate-45">
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
                  className="text-purple-600 stroke-current -rotate-6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M 10 40 Q 45 5 85 25" />
                  <path d="M 70 18 L 85 25 L 75 35" />
                </svg>
                <span className="text-purple-600 font-extrabold text-xs sm:text-sm -rotate-6 leading-tight select-none">
                  Start your<br />journey today!
                </span>
              </div>
            </div>

            {/* Social Trust Metrics */}
            <div className="mt-5 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-7">
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
                  <CheckCircle2 size={15} className="text-purple-500" />
                  <span className={`text-xs sm:text-sm font-extrabold ${THEME.textMain}`}>
                    10,000+ AI Video Creators
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-slate-500">
                  Trusted by content creators worldwide
                </p>
              </div>
            </div>

          </motion.div>
        </div>

        {/* BOTTOM CARDS - Hidden on phone view */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden md:flex mt-16 lg:mt-24 flex-col xl:flex-row gap-8 items-stretch xl:items-end justify-between"
        >
          {/* Feature Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            <FeatureCard icon={Users} iconColor="text-[var(--brand-color)]" iconBg="bg-[var(--brand-color)]/10" title="Expert Mentors" desc="Learn from industry professionals" />
            <FeatureCard icon={Code} iconColor="text-blue-500" iconBg="bg-blue-50" title="Real Projects" desc="Build portfolio with real-world experience" />
            <FeatureCard icon={Users} iconColor="text-emerald-500" iconBg="bg-emerald-50" title="Active Community" desc="Collaborate, learn and grow together" />
            <FeatureCard icon={TrendingUp} iconColor="text-orange-500" iconBg="bg-orange-50" title="Career Focused" desc="Get job-ready skills that matter" />
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

// ==========================================
// 2. MARQUEE SECTION
// ==========================================
const MarqueeSection = () => {
  const { agency, isMainSite } = useAgency();
  const academyName = !isMainSite && agency ? agency.name.toUpperCase() : "AI VIDEO ACADEMY";
  const items = ["AI AVATAR VLOGGING", "3D ANIMATION", "HISTORICAL AI DOCUMENTARY", "AI INFLUENCER ADS", "ANIME & STICKMAN", academyName];

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
      className={`min-h-screen w-full overflow-x-hidden font-roboto-condensed ${THEME.textMain}`}
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