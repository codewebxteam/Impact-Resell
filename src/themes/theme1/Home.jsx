/* eslint-disable no-unused-vars */
import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowUpRight,
  Play,
  Sparkles,
  CheckCircle2,
  Users,
  BookOpen,
  Check,
  ArrowRight,
  Zap,
  Crown,
  Star,
  Bookmark,
  Minus,
  Plus,
  MessageCircleQuestion,
  Award,
  Layers,
  Box,
  BookCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAgency } from "../../context/AgencyContext";
import AuthModal from "../../components/AuthModal";

// ==========================================
// THEME CONFIGURATION (Centralized Colors)
// ==========================================
const THEME = {
  // Base Colors
  bg: "bg-slate-50",
  textMain: "text-slate-900",
  textMuted: "text-slate-500",
  accentText: "text-[var(--brand-color)]",
  
  // Gradients
  gradientText: "bg-gradient-to-r from-slate-900 via-[var(--brand-color)] to-[var(--accent-color)] bg-clip-text text-transparent",
  progressGradient: "bg-gradient-to-r from-[var(--accent-color)] to-[var(--brand-color)]",
  
  // Glass & Cards
  glassPanel: "bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50",
  cardBg: "bg-white shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300",
  
  // Buttons
  buttonPrimary: "bg-[var(--brand-color)] text-white shadow-lg shadow-[var(--brand-color)]/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300",
  buttonSecondary: "bg-white border-2 border-slate-200 text-slate-700 hover:border-[var(--brand-color)] hover:text-[var(--brand-color)] transition-all",
  
  // Ambient Glows
  cyanGlow: "bg-[var(--accent-color)]/20 blur-[120px]",
  blueGlow: "bg-[var(--brand-color)]/20 blur-[120px]",
  indigoGlow: "bg-slate-300/40 blur-[100px]",
  
  // UI Accents
  iconBg: "bg-[var(--brand-color)]/10 text-[var(--brand-color)]",
  badgeBg: "bg-white border border-[var(--brand-color)]/20 text-[var(--brand-color)]",
};

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
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleExploreCourses = () => {
    navigate("/courses");
  };

  return (
    <section className="relative min-h-[760px] sm:min-h-[850px] md:min-h-screen w-full overflow-hidden flex items-center">
      {/* LAPTOP / DESKTOP FULL SCREEN BACKGROUND (md and above) */}
      <img
        src="https://ik.imagekit.io/0s0fb4b2b/Theme/hero1theme.webp"
        alt="Theme Hero Background"
        className="hidden md:block absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* PHONE / MOBILE FULL SCREEN BACKGROUND (below md) */}
      <img
        src="https://ik.imagekit.io/0s0fb4b2b/Theme/hero1themeP.webp"
        alt="Theme Hero Mobile Background"
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
              <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-cyan-500 shadow-[0_0_0_4px_rgba(6,182,212,0.12)] animate-pulse" />
              AI Video & Animation Academy
              <Sparkles size={13} />
            </div>

            {/* Heading */}
            <h1 className="text-[32px] sm:text-[56px] md:text-[64px] lg:text-[76px] font-black leading-[1.04] tracking-[-0.04em] text-slate-900">
              Create Viral AI
              <br />
              <span className={THEME.gradientText}>
                Videos & Avatars.
              </span>
            </h1>

            {/* Description */}
            <p className={`mt-2.5 sm:mt-6 max-w-[560px] text-[13.5px] sm:text-[17px] font-medium leading-relaxed sm:leading-8 ${THEME.textMuted}`}>
              Master AI avatar vlogging, 2D & 3D animation, AI influencer ads, historical documentaries, and viral video creation with hands-on projects.
            </p>

            {/* Action Buttons */}
            <div className="mt-4.5 sm:mt-8 flex flex-wrap items-center gap-2.5 sm:gap-4">
              <button 
                onClick={handleExploreCourses} 
                className={`group flex items-center gap-2.5 sm:gap-3 rounded-2xl px-5 sm:px-7 py-2.5 sm:py-4 text-[13px] sm:text-[15px] font-bold ${THEME.buttonPrimary}`}
              >
                Explore Courses
                <span className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-cyan-400 text-[#101828] transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight size={15} />
                </span>
              </button>

              <button className={`group flex items-center gap-2 sm:gap-3 rounded-2xl px-4.5 sm:px-6 py-2.5 sm:py-4 text-[13px] sm:text-[15px] font-bold ${THEME.buttonSecondary}`}>
                <span className={`flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full ${THEME.iconBg}`}>
                  <Play size={13} fill="currentColor" />
                </span>
                How it works
              </button>
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
                  <CheckCircle2 size={15} className="text-cyan-500" />
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
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultMode="signup" />
    </section>
  );
};

// ==========================================
// 2. MARQUEE SECTION
// ==========================================
const MarqueeSection = () => {
  const { agency, isMainSite } = useAgency();
  const academyName = !isMainSite && agency ? agency.name.toUpperCase() : "AI VIDEO ACADEMY";
  const items = ["AI AVATAR VLOGGING", "3D ANIMATION", "HISTORICAL AI DOCUMENTARY", "AI INFLUENCER ADS", "ANIME & STICKMAN", academyName];

  return (
    <section className="relative w-full py-4 overflow-hidden border-y border-slate-200/50 bg-white/40 backdrop-blur-sm z-10">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#f7fbff] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#f7fbff] to-transparent z-10 pointer-events-none" />

      <div className="flex whitespace-nowrap select-none">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          className="flex items-center"
        >
          {[...Array(10)].map((_, iter) => (
            <div key={iter} className="flex items-center shrink-0">
              {items.map((text, index) => {
                const isBrand = text === academyName;
                return (
                  <React.Fragment key={index}>
                    <Sparkles className={`mx-6 size-3 md:size-4 ${isBrand ? "text-cyan-500" : "text-slate-300"}`} />
                    <span className={`font-bold tracking-[0.2em] uppercase text-sm md:text-base ${isBrand ? THEME.textMain : "text-slate-400"}`}>
                      {text}
                    </span>
                  </React.Fragment>
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
// 3. CARDS SWAP SECTION (The Syllabus)
// ==========================================
export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`absolute top-1/2 left-1/2 transform-3d will-change-transform backface-hidden ${customClass ?? ""} ${rest.className ?? ""}`.trim()}
  />
));
Card.displayName = "Card";

const makeSlot = (i, distX, distY, total) => ({ x: i * distX, y: -i * distY, z: -i * distX * 1.5, zIndex: total - i });
const placeNow = (el, slot, skew) => gsap.set(el, { x: slot.x, y: slot.y, z: slot.z, xPercent: -50, yPercent: -50, skewY: skew, transformOrigin: "center center", zIndex: slot.zIndex, force3D: true });

const SwapEngine = ({ width, height, cardDistance, verticalDistance, delay = 5000, pauseOnHover = false, onCardClick, skewAmount = 6, children }) => {
  const config = { ease: "elastic.out(0.6,0.9)", durDrop: 2, durMove: 2, durReturn: 2, promoteOverlap: 0.9, returnDelay: 0.05 };
  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(() => childArr.map(() => React.createRef()), [childArr]);
  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef(null);
  const intervalRef = useRef();
  const container = useRef(null);

  useEffect(() => {
    const total = refs.length;
    if (total === 0) return;
    refs.forEach((r, i) => placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount));

    const swap = () => {
      if (order.current.length < 2) return;
      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, { y: "+=300", opacity: 0, rotation: -5, duration: config.durDrop, ease: "power2.in" });
      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, "promote");
        tl.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease }, `promote+=${i * 0.15}`);
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      tl.call(() => { gsap.set(elFront, { zIndex: backSlot.zIndex, opacity: 0, rotation: 0 }); }, undefined, "return");
      tl.to(elFront, { x: backSlot.x, y: backSlot.y, z: backSlot.z, opacity: 1, duration: config.durReturn, ease: "power2.out" }, "return");
      tl.call(() => { order.current = [...rest, front]; });
    };

    if (childArr.length > 1) intervalRef.current = window.setInterval(swap, delay);
    return () => clearInterval(intervalRef.current);
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, childArr.length]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child) ? cloneElement(child, {
      key: i, ref: refs[i], style: { width, height, ...(child.props.style ?? {}) },
      onClick: (e) => { child.props.onClick?.(e); onCardClick?.(i); }
    }) : child
  );

  return (
    <div ref={container} className="relative flex items-center justify-center perspective-[900px] overflow-visible z-20" style={{ width, height }}>
      {rendered}
    </div>
  );
};

const GlassCourseCard = ({ data }) => {
  const { isMainSite, getPrice } = useAgency();
  const price = getPrice(data?.id, data?.price || "2,999");
  
  return (
    <div className={`size-full rounded-3xl p-1 flex flex-col relative overflow-hidden group ${THEME.cardBg} border-[3px] hover:border-[var(--brand-color)]`}>
      <div className="bg-slate-50 w-full h-full rounded-2xl p-6 md:p-8 flex flex-col justify-between">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className={`size-12 rounded-xl flex items-center justify-center shadow-sm ${THEME.iconBg}`}>
              <BookOpen className="size-6" />
            </div>
            <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 shadow-sm border border-slate-100">
              POPULAR
            </span>
          </div>
          <h3 className={`text-xl md:text-2xl font-extrabold line-clamp-2 leading-tight ${THEME.textMain}`}>
            {data?.title || "Course Title"}
          </h3>
          <p className={`mt-3 text-sm font-medium line-clamp-2 ${THEME.textMuted}`}>
            {data?.description || "Master new skills with our expert led courses."}
          </p>
        </div>
        <div className="relative z-10 mt-6 pt-6 border-t border-slate-200">
          {!isMainSite && (
            <div className="flex items-end gap-2 mb-6">
              <span className={`text-3xl font-black ${THEME.accentText}`}>
                {price == 0 || price === "Free" ? "Free" : `₹${price}`}
              </span>
            </div>
          )}
          <Link to={`/courses/${data?.id}`} className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer ${THEME.buttonPrimary}`}>
            View Details <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const CardsSwapSection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [courses, setCourses] = useState([]);
  const { isMainSite, agency } = useAgency();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snap = await getDocs(collection(db, "courseVideos"));
        let data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        data = isMainSite ? data.filter(c => !c.partnerId || c.partnerId === "admin") : data.filter(c => !c.partnerId || c.partnerId === "admin" || c.partnerId === agency?.id);
        data.sort((a, b) => (parseInt(a.priority) || 9999) - (parseInt(b.priority) || 9999));
        setCourses(data.slice(0, 5));
      } catch (e) { console.error(e); }
    };
    fetchCourses();
  }, [isMainSite, agency?.id]);

  const cardWidth = isMobile ? "320px" : "380px";
  const cardHeight = isMobile ? "480px" : "480px";

  return (
    <section className="w-full bg-transparent py-16 md:py-24 overflow-hidden relative">
      {/* Background decorations */}
      <div className={`absolute top-[20%] left-[-10%] h-[500px] w-[500px] rounded-full ${THEME.blueGlow} opacity-50`} />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 items-center gap-12 lg:gap-0">
          <div className="flex flex-col justify-center w-full order-1">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase mb-6 w-fit ${THEME.badgeBg}`}>
              <Bookmark className="size-3" /> The Syllabus
            </div>
            <h2 className={`text-3xl md:text-5xl font-bold leading-tight mb-6 ${THEME.textMain}`}>
              Choose Your <br />
              <span className={THEME.gradientText}>Career Path.</span>
            </h2>
            <p className={`text-base md:text-lg mb-8 ${THEME.textMuted}`}>
              From beginner basics to advanced specialization, we guide you every step of the way.
            </p>
            <div className="space-y-6">
              {[
                { num: 1, title: "Foundation", desc: "Build your skills from the ground up." },
                { num: 2, title: "Specialization", desc: "Master specific tools and frameworks." },
                { num: 3, title: "Career Launch", desc: "Turn Skills Into Career with expert guidance." },
              ].map((item) => (
                <div key={item.num} className="flex gap-4 group cursor-default">
                  <div className={`size-10 md:size-12 rounded-2xl flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform ${THEME.iconBg}`}>
                    {item.num}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm md:text-base ${THEME.textMain}`}>{item.title}</h4>
                    <p className="text-xs md:text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full flex items-center justify-center relative order-2 mt-10 lg:mt-0">
            {courses.length > 0 ? (
              <SwapEngine width={cardWidth} height={cardHeight} cardDistance={isMobile ? 30 : 45} verticalDistance={isMobile ? 40 : 55} delay={3500} skewAmount={3}>
                {courses.map((course) => (
                  <Card key={course.id}>
                    <GlassCourseCard data={course} />
                  </Card>
                ))}
              </SwapEngine>
            ) : (
              <div className={`animate-pulse rounded-4xl border flex items-center justify-center text-slate-400 ${THEME.cardBg}`} style={{ width: cardWidth, height: cardHeight }}>
                Loading Courses...
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 4. COURSES GRID SECTION (Matches Screenshot)
// ==========================================
const Theme1CourseCard = ({ course }) => {
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const courseUrl = isDev
    ? `/dev/${themeName}/coursedetails/${course.id}`
    : `/courses/${course.id}`;

  const defaultImages = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
  ];

  const imageUrl = course.image || (course.videoId ? `https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg` : defaultImages[0]);
  const lessons = course.lectures?.length ? `${course.lectures.length}+ Lessons` : (course.lessons || "12+ Lessons");
  const level = course.level || "Beginner Friendly";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-[26px] p-3.5 sm:p-4 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
    >
      <Link to={courseUrl} className="block">
        {/* Course Thumbnail */}
        <div className="relative h-48 sm:h-50 w-full rounded-2xl overflow-hidden bg-slate-950 mb-4">
          <img
            src={imageUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = defaultImages[0]; }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/40 via-transparent to-transparent" />
        </div>

        {/* Course Title */}
        <h3 className="text-lg sm:text-[19px] font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5 tracking-tight">
          {course.title || "AI Course"}
        </h3>

        {/* Course Description */}
        <p className="text-xs sm:text-[13px] text-slate-500 font-medium line-clamp-2 mb-5 leading-relaxed">
          {course.description || "Master visual storytelling, prompt design, and practical AI skills with expert guidance."}
        </p>
      </Link>

      {/* Card Footer: Metadata + Round Blue Arrow Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
        <div className="flex flex-col gap-1 text-slate-500">
          <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
            <BookOpen className="size-3.5 text-slate-400" />
            <span>{lessons}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
            <Users className="size-3.5 text-slate-400" />
            <span>{level}</span>
          </div>
        </div>

        <Link
          to={courseUrl}
          className="size-10 rounded-full bg-[#0070f3] hover:bg-[#0051cc] text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-110 transition-all duration-300 shrink-0"
        >
          <ArrowRight className="size-4.5 stroke-[2.2]" />
        </Link>
      </div>
    </motion.div>
  );
};

const CoursesGridSection = () => {
  const [courses, setCourses] = useState([]);
  const { isMainSite, agency } = useAgency();
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const coursesUrl = isDev ? `/dev/${themeName}/courses` : "/courses";

  // Fallback demo courses matching the exact screenshot if DB has few
  const fallbackCourses = [
    {
      id: "ai-video-gen",
      title: "AI Video Generation",
      description: "Master visual storytelling with top AI generation tools.",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
      lessons: "12+ Lessons",
      level: "Beginner Friendly",
    },
    {
      id: "ai-influencer",
      title: "AI Influencer Creation",
      description: "Build digital personas and virtual creators that engage audiences.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
      lessons: "10+ Lessons",
      level: "Beginner Friendly",
    },
    {
      id: "ai-copywriting",
      title: "AI Content & Copywriting",
      description: "Create high-converting copy, scripts, and content with AI.",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
      lessons: "8+ Lessons",
      level: "Beginner Friendly",
    },
    {
      id: "prompt-engineering",
      title: "Prompt Engineering",
      description: "Learn to communicate with AI models and LLMs effectively.",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop",
      lessons: "10+ Lessons",
      level: "All Levels",
    },
    {
      id: "ai-for-business",
      title: "AI for Business",
      description: "Apply AI workflows and automations to scale your business.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
      lessons: "12+ Lessons",
      level: "Intermediate",
    },
    {
      id: "ai-automation",
      title: "AI Automation",
      description: "Automate repetitive daily tasks, pipelines, and save hours.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
      lessons: "10+ Lessons",
      level: "Intermediate",
    },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snap = await getDocs(collection(db, "courseVideos"));
        let data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        data = isMainSite
          ? data.filter((c) => !c.partnerId || c.partnerId === "admin")
          : data.filter((c) => !c.partnerId || c.partnerId === "admin" || c.partnerId === agency?.id);
        data.sort((a, b) => (parseInt(a.priority) || 9999) - (parseInt(b.priority) || 9999));

        if (data.length > 0) {
          setCourses(data.slice(0, 6));
        } else {
          setCourses(fallbackCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses(fallbackCourses);
      }
    };
    fetchCourses();
  }, [isMainSite, agency?.id]);

  const displayList = courses.length > 0 ? courses : fallbackCourses;

  return (
    <section className="relative w-full py-20 sm:py-28 px-5 sm:px-10 lg:px-16 overflow-hidden bg-[#f7fbff]">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-cyan-200/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-200/20 blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* --- SECTION HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            {/* Small Badge */}
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-600 mb-3">
              <span>✦</span> OUR COURSES
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Learn AI. Build Skills. Create Your Future.
            </h2>

            {/* Subtitle */}
            <p className="mt-3 text-sm sm:text-base text-slate-500 font-medium max-w-2xl leading-relaxed">
              Choose from our industry-focused courses and gain hands-on experience with the latest AI tools.
            </p>
          </div>

          {/* Top Right "View All Courses →" Link */}
          <Link
            to={coursesUrl}
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors shrink-0 group"
          >
            <span>View All Courses</span>
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* --- COURSES GRID (4 on Phone, 6 on Laptop) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayList.map((course, index) => (
            <div key={course.id} className={index >= 4 ? "hidden md:block h-full" : "block h-full"}>
              <Theme1CourseCard course={course} />
            </div>
          ))}
        </div>

        {/* --- BOTTOM "Explore All Courses →" BUTTON --- */}
        <div className="mt-14 sm:mt-16 text-center">
          <Link
            to={coursesUrl}
            className="inline-flex items-center gap-3 bg-[#0B132B] hover:bg-[#1C2541] text-white text-[15px] sm:text-base font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full shadow-xl shadow-slate-900/15 hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-95 group cursor-pointer"
          >
            <span>Explore All Courses</span>
            <ArrowRight className="size-4.5 text-white group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 5. HOW IT WORKS SECTION (Matches Screenshot)
// ==========================================
const HowItWorksSection = () => {
  const stepsList = [
    {
      num: "01",
      title: "Learn",
      desc: "Understand concepts with easy-to-follow lessons.",
      icon: BookOpen,
    },
    {
      num: "02",
      title: "Build",
      desc: "Work on hands-on projects and real use cases.",
      icon: Box,
    },
    {
      num: "03",
      title: "Grow",
      desc: "Apply your skills, build your portfolio, and create opportunities.",
      icon: BookCheck,
    },
  ];

  return (
    <section className="relative w-full py-16 sm:py-24 px-5 sm:px-10 lg:px-16 overflow-hidden bg-white border-t border-slate-100">
      <div className="max-w-[1300px] mx-auto relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#0070f3] mb-2.5 block">
            HOW IT WORKS
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-[40px] font-extrabold text-[#0B132B] tracking-tight leading-[1.15]">
            A Simple Way to Learn and Grow
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-lg mx-auto">
            Get started in just 3 steps and move from learning to real-world success
          </p>
        </div>

        {/* --- 3 STEPS GRID WITH ARROWS --- */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
          {stepsList.map((step, idx) => (
            <React.Fragment key={step.num}>
              {/* Step Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.12 }}
                className="w-full bg-white rounded-[22px] sm:rounded-[26px] p-6 sm:p-7 border border-slate-100/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(0,112,243,0.08)] transition-all duration-300 hover:-translate-y-1 flex items-start gap-4 sm:gap-5 flex-1 group"
              >
                {/* Round Icon */}
                <div className="size-14 sm:size-16 rounded-full sm:rounded-[20px] bg-[#eef5ff] text-[#0070f3] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#0070f3] group-hover:text-white transition-all duration-300">
                  <step.icon className="size-6 sm:size-7 stroke-[1.8]" />
                </div>

                {/* Step Info */}
                <div className="flex flex-col">
                  <span className="text-[#0070f3] font-bold text-base sm:text-lg leading-tight">
                    {step.num}
                  </span>
                  <h3 className="text-[#0070f3] font-bold text-sm sm:text-base mt-0.5 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-[13px] font-normal leading-relaxed mt-2">
                    {step.desc}
                  </p>
                </div>
              </motion.div>

              {/* Connecting Arrow between cards (on desktop) */}
              {idx < stepsList.length - 1 && (
                <div className="hidden lg:flex items-center justify-center text-[#93c5fd] shrink-0 px-0.5">
                  <ArrowRight className="size-5 stroke-[2]" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 6. FAQ SECTION
// ==========================================
const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const coursesUrl = isDev ? `/dev/${themeName}/courses` : "/courses";

  return (
    <section className="w-full relative py-20 px-4 font-sans overflow-hidden bg-[#f7fbff]">
      <div className={`absolute top-10 left-10 size-64 rounded-full ${THEME.cyanGlow}`} />
      <div className={`absolute bottom-10 right-10 size-80 rounded-full ${THEME.blueGlow}`} />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 shadow-sm ${THEME.badgeBg}`}>
            <MessageCircleQuestion className="size-4" />
            <span className="text-xs font-bold tracking-wider uppercase">Got Questions?</span>
          </div>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight ${THEME.textMain}`}>
            Frequently Asked <span className={THEME.gradientText}>Questions</span>
          </h2>
          <p className={`mt-4 max-w-lg mx-auto text-sm md:text-base ${THEME.textMuted}`}>
            Everything you need to know about the academy and your learning journey.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`group rounded-3xl overflow-hidden transition-all duration-300 border ${
                activeIndex === index ? "bg-white border-cyan-200 shadow-xl shadow-cyan-100/50" : "bg-white/60 border-white hover:bg-white hover:border-cyan-100 shadow-sm"
              }`}
            >
              <button onClick={() => setActiveIndex(activeIndex === index ? null : index)} className="w-full flex items-center justify-between p-6 md:p-8 text-left cursor-pointer outline-none">
                <span className={`text-base md:text-lg font-bold transition-colors pr-4 ${activeIndex === index ? THEME.textMain : "text-slate-600 group-hover:text-[#101828]"}`}>
                  {faq.question}
                </span>
                <div className={`size-8 md:size-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
                  activeIndex === index ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white rotate-180 shadow-md" : "bg-cyan-50 text-cyan-600 group-hover:scale-110"
                }`}>
                  {activeIndex === index ? <Minus className="size-4 md:size-5" /> : <Plus className="size-4 md:size-5" />}
                </div>
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                    <div className="px-6 md:px-8 pb-8 pt-0">
                      <div className="w-full h-px bg-slate-100 mb-4" />
                      <p className="text-slate-500 text-sm md:text-base leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* --- AI FUTURE CTA BANNER (Matches Screenshot) --- */}
        <div className="mt-16 sm:mt-20">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#061129] px-6 sm:px-10 py-7 sm:py-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800/80">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Left: Heading & Description */}
            <div className="relative z-10 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl lg:text-[25px] font-extrabold text-white tracking-tight leading-tight">
                Your Future in AI Starts Here.
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300/90 font-medium">
                Gain practical skills, build real projects, and unlock new opportunities.
              </p>
            </div>

            {/* Middle: Decorative Doodle Loop Arrow */}
            <div className="hidden lg:flex items-center justify-center relative z-10 px-2 text-blue-200 pointer-events-none select-none">
              <svg
                className="w-32 h-14"
                viewBox="0 0 140 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="10" cy="22" r="2.5" fill="white" className="animate-pulse" />
                <circle cx="18" cy="48" r="1.5" fill="#60a5fa" />
                <path
                  d="M 15 45 C 35 52, 45 42, 60 25 C 72 10, 85 10, 78 32 C 72 50, 60 48, 64 30 C 70 8, 95 18, 125 24"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  className="opacity-75"
                />
                <path
                  d="M 118 18 L 126 24 L 118 30"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-90"
                />
              </svg>
            </div>

            {/* Right: Explore Courses Button */}
            <div className="relative z-10 shrink-0">
              <Link
                to={coursesUrl}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
              >
                <span>Explore Courses</span>
                <ArrowRight className="size-4 text-slate-900 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
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
    <main className={`min-h-screen w-full overflow-x-hidden ${THEME.bg} ${THEME.textMain}`}>
      <HeroSection />
      <CoursesGridSection />
      <HowItWorksSection />
      <FAQSection />
    </main>
  );
};

export default Home;