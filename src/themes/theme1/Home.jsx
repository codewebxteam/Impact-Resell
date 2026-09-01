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
} from "lucide-react";
import { motion, useMotionTemplate, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAgency } from "../../context/AgencyContext";
import { useAuth } from "../../context/AuthContext";
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

// ==========================================
// DATA: ROADMAP & FAQS
// ==========================================
const steps = [
  {
    id: 1,
    title: "Apply & Enroll",
    description: "Submit your application, clear the basic assessment, and secure your seat in our premium cohort.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop",
    stat: "Step 1",
  },
  {
    id: 2,
    title: "Learn & Build",
    description: "Attend live classes, solve coding challenges, and build real-world projects with expert mentorship.",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1000&auto=format&fit=crop",
    stat: "Step 2",
  },
  {
    id: 3,
    title: "Capstone Project",
    description: "Develop a professional full-stack application to showcase your skills in your job portfolio.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop",
    stat: "Step 3",
  },
  {
    id: 4,
    title: "Get Hired",
    description: "Mock interviews, resume building, and direct referrals to top tech companies to launch your career.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop",
    stat: "Goal",
  },
];

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
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleExploreCourses = () => {
    navigate("/courses");
  };

  return (
    <section className="relative min-h-[calc(100vh-1px)]">
      {/* Background decorations */}
      <div className={`absolute -left-40 top-20 h-[420px] w-[420px] rounded-full ${THEME.cyanGlow}`} />
      <div className={`absolute right-[-120px] top-[25%] h-[520px] w-[520px] rounded-full ${THEME.blueGlow}`} />
      <div className={`absolute bottom-[-200px] left-[35%] h-[450px] w-[450px] rounded-full ${THEME.indigoGlow}`} />

      <div className="relative mx-auto flex min-h-screen max-w-[1500px] items-center px-6 py-20 sm:px-10 lg:px-16">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
          
          {/* LEFT CONTENT */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 max-w-[680px]"
          >
            {/* Small badge */}
            <div className={`mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.18em] shadow-sm backdrop-blur ${THEME.badgeBg}`}>
              <span className="flex h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_0_4px_rgba(6,182,212,0.12)] animate-pulse" />
              Skills That Pay You Back
              <Sparkles size={14} />
            </div>

            {/* Heading */}
            <h1 className="text-[48px] font-black leading-[0.98] tracking-[-0.045em] sm:text-[62px] lg:text-[76px]">
              Master Skills That
              <br />
              <span className={THEME.gradientText}>
                Define The Future.
              </span>
            </h1>

            {/* Description */}
            <p className={`mt-7 max-w-[590px] text-[17px] font-medium leading-8 sm:text-[18px] ${THEME.textMuted}`}>
              Join the elite academy for developers and creators. Real-world projects, expert mentorship, and a community that pushes you forward.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button onClick={handleExploreCourses} className={`group flex items-center gap-3 rounded-2xl px-7 py-4 text-[15px] font-bold ${THEME.buttonPrimary}`}>
                Explore Courses
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-[#101828] transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight size={17} />
                </span>
              </button>

              <button className={`group flex items-center gap-3 rounded-2xl px-6 py-4 text-[15px] font-bold ${THEME.buttonSecondary}`}>
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${THEME.iconBg}`}>
                  <Play size={15} fill="currentColor" />
                </span>
                How it works
              </button>
            </div>

            {/* Trust */}
            <div className="mt-12 flex flex-wrap items-center gap-7">
              <div className="flex items-center">
                {[12, 32, 47, 68].map((img, index) => (
                  <img
                    key={index}
                    src={`https://i.pravatar.cc/80?img=${img}`}
                    alt="Student"
                    className={`h-10 w-10 rounded-full border-[3px] border-[#f7fbff] object-cover ${
                      index !== 0 ? "-ml-3" : ""
                    }`}
                  />
                ))}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-cyan-500" />
                  <span className={`text-sm font-extrabold ${THEME.textMain}`}>
                    10,000+ learners
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  Trusted by students worldwide
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT VISUAL */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative flex min-h-[550px] items-center justify-center lg:min-h-[650px]"
          >
            {/* Main glass panel */}
            <div className={`absolute right-[3%] top-[10%] h-[500px] w-[88%] rounded-[45px] sm:w-[78%] ${THEME.glassPanel}`} />

            {/* Floating top card */}
            <div className={`absolute right-[3%] top-[7%] z-20 rounded-2xl px-5 py-4 ${THEME.cardBg}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${THEME.iconBg}`}>
                  <BookOpen size={21} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Courses completed</p>
                  <p className={`text-xl font-black ${THEME.textMain}`}>24.8K+</p>
                </div>
              </div>
            </div>

            {/* Main 3D-style composition */}
            <div className="relative z-10 mt-8 flex h-[470px] w-full max-w-[650px] items-end justify-center">
              {/* Glow */}
              <div className="absolute bottom-8 h-[280px] w-[420px] rounded-full bg-cyan-300/30 blur-[70px]" />

              {/* Books */}
              <div className="absolute bottom-[55px] left-[6%] z-10 flex items-end gap-2">
                <div className="h-[42px] w-[95px] -rotate-3 rounded-lg bg-[#172554] shadow-lg" />
                <div className="h-[55px] w-[120px] rotate-2 rounded-lg bg-[#22c1dc] shadow-lg" />
                <div className="h-[45px] w-[105px] -rotate-2 rounded-lg bg-[#f59e0b] shadow-lg" />
              </div>

              {/* Center laptop */}
              <div className="absolute bottom-[60px] left-1/2 z-20 w-[330px] -translate-x-1/2">
                <div className="relative mx-auto h-[205px] w-[290px] rounded-[20px] border-[8px] border-slate-800 bg-slate-900 p-2 shadow-[0_30px_60px_rgba(15,23,42,0.28)]">
                  <div className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-gradient-to-br from-cyan-50 to-blue-100">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="h-2 w-16 rounded-full bg-slate-300" />
                      <div className="h-6 w-6 rounded-full bg-cyan-400" />
                    </div>
                    <div className="grid flex-1 grid-cols-[1fr_0.8fr] gap-3 px-4 pb-4">
                      <div className="rounded-xl bg-white p-3 shadow-sm">
                        <div className="h-2 w-14 rounded bg-slate-200" />
                        <div className="mt-4 flex items-end gap-1">
                          <span className="h-8 w-3 rounded bg-cyan-300" />
                          <span className="h-14 w-3 rounded bg-cyan-400" />
                          <span className="h-10 w-3 rounded bg-blue-400" />
                          <span className="h-20 w-3 rounded bg-slate-800" />
                          <span className="h-12 w-3 rounded bg-cyan-500" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="h-12 rounded-xl bg-[#101828]" />
                        <div className="h-12 rounded-xl bg-white shadow-sm" />
                        <div className="h-12 rounded-xl bg-cyan-400" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Laptop base */}
                <div className="mx-auto h-4 w-[340px] rounded-b-[20px] rounded-t-md bg-slate-700 shadow-xl" />
              </div>

              {/* Floating student card */}
              <div className={`absolute bottom-[170px] right-[4%] z-30 w-[175px] rounded-2xl p-4 ${THEME.cardBg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                    <Users size={17} />
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-600">LIVE</span>
                </div>
                <p className="mt-4 text-xs font-semibold text-slate-400">Active learners</p>
                <p className={`mt-1 text-2xl font-black ${THEME.textMain}`}>8,420</p>
              </div>

              {/* Floating progress card */}
              <div className={`absolute bottom-[20px] left-[4%] z-30 w-[190px] rounded-2xl p-4 ${THEME.cardBg}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500">Your progress</p>
                  <span className="text-xs font-black text-cyan-600">78%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full w-[78%] rounded-full ${THEME.progressGradient}`} />
                </div>
                <p className="mt-2 text-[10px] font-medium text-slate-400">Keep going — doing great</p>
              </div>

              {/* Decorative dots */}
              <div className="absolute right-[12%] top-[24%] grid grid-cols-4 gap-2 opacity-60">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                ))}
              </div>

              {/* Falling Assets from original Hero (adapted) */}
              <img
                src="/assets/hero/1.svg"
                className="absolute w-12 sm:w-16 animate-[fall_10s_infinite_linear] opacity-80"
                style={{ left: "5%", top: "-100px" }}
                alt=""
              />
              <img
                src="/assets/hero/2.svg"
                className="absolute w-16 sm:w-20 animate-[fall_7s_infinite_linear] opacity-80"
                style={{ right: "8%", top: "-40px", animationDelay: "1.5s" }}
                alt=""
              />
              <img
                src="/assets/hero/3.svg"
                className="absolute w-10 sm:w-14 animate-[fall_5s_infinite_linear] opacity-80"
                style={{ left: "15%", top: "-80px", animationDelay: "3s" }}
                alt=""
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom stats strip */}
      <div className="absolute bottom-0 left-0 right-0 hidden border-t border-slate-100/80 bg-white/45 backdrop-blur-md lg:block">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-16 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Learn from anywhere</p>
          <div className="flex items-center gap-12 text-sm font-bold text-slate-500">
            <span>Industry Experts</span>
            <span>Real Projects</span>
            <span>Career Focused</span>
            <span>Lifetime Access</span>
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultMode="signup" />

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(400px) rotate(180deg); opacity: 0; }
        }
      `}</style>
    </section>
  );
};

// ==========================================
// 2. MARQUEE SECTION
// ==========================================
const MarqueeSection = () => {
  const { agency, isMainSite } = useAgency();
  const academyName = !isMainSite && agency ? agency.name.toUpperCase() : "AI COURSES";
  const items = ["3D VIDEO MAKER", "AI COURSE", "2D CARTOON", "CARTOON VIDEO", academyName];

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
  const refs = useMemo(() => childArr.map(() => React.createRef()), [childArr.length]);
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
// 4. FEATURED COURSES SECTION
// ==========================================
const FeaturedProductCard = ({ product }) => {
  const { getPrice, isMainSite } = useAgency();
  const finalPrice = getPrice(product.id, product.price);

  return (
    <div className={`group flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 ${THEME.cardBg} hover:-translate-y-2`}>
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.title}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Course"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-bold text-white line-clamp-1">{product.title}</h3>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${THEME.accentText} bg-[var(--brand-color)]/10 px-2 py-1 rounded-md`}>
              Bestseller
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="size-3.5 fill-current" />
              <span className="text-xs font-bold text-slate-700">4.9</span>
            </div>
          </div>
          
          <p className={`text-sm leading-relaxed mb-6 line-clamp-3 ${THEME.textMuted}`}>{product.description}</p>
        </div>
        
        <div>
          <div className="w-full h-px bg-slate-100 mb-4" />
          <div className="flex items-center justify-between">
            {!isMainSite ? (
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Course Price</span>
                <span className={`text-2xl font-black ${THEME.textMain}`}>
                  {finalPrice == 0 || finalPrice === "Free" ? "Free" : `₹${finalPrice}`}
                </span>
              </div>
            ) : (
              <span className={`text-sm font-bold ${THEME.textMain}`}>Premium Course</span>
            )}
            
            <Link to={`/courses/${product.id}`}>
              <button className={`size-10 rounded-full flex items-center justify-center ${THEME.buttonPrimary}`}>
                <ArrowRight className="size-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedCoursesSection = () => {
  const [products, setProducts] = useState([]);
  const { isMainSite, agency } = useAgency();

  const getValidImageUrl = (url) => {
    if (!url) return "https://placehold.co/600x400?text=No+Cover";
    try {
      if (url.includes("drive.google.com")) {
        let id = "";
        if (url.includes("/file/d/")) id = url.split("/file/d/")[1].split("/")[0];
        else if (url.includes("id=")) id = url.split("id=")[1].split("&")[0];
        if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
      }
    } catch (e) { console.error(e); }
    return url;
  };

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "courseVideos"));
        let data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data(), image: getValidImageUrl(doc.data().image) }));
        data = isMainSite ? data.filter(c => !c.partnerId || c.partnerId === "admin") : data.filter(c => !c.partnerId || c.partnerId === "admin" || c.partnerId === agency?.id);
        data.sort((a, b) => (parseInt(a.priority) || 9999) - (parseInt(b.priority) || 9999));
        setProducts(data.slice(0, 3));
      } catch (error) { console.error(error); }
    };
    fetchTopProducts();
  }, [isMainSite, agency?.id]);

  if (products.length === 0) return null;

  return (
    <section className="relative w-full py-16 md:py-24 px-4 overflow-hidden font-sans">
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full ${THEME.cyanGlow} opacity-40`} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className={`inline-block py-1 px-3 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 ${THEME.badgeBg}`}>
            Unlock Your Potential
          </span>
          <h2 className={`text-3xl md:text-5xl font-bold mb-3 tracking-tight ${THEME.textMain}`}>
            Featured <span className={THEME.gradientText}>Courses</span>
          </h2>
          <p className={`text-sm md:text-base max-w-md mx-auto ${THEME.textMuted}`}>
            Top-rated courses handpicked to jumpstart your career in tech and design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={index === 1 ? "md:-mt-6 md:-mb-6" : ""}
            >
              <FeaturedProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/courses" className={`inline-flex items-center gap-2 font-bold text-sm hover:underline ${THEME.accentText}`}>
            View All Courses <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 5. ROADMAP SECTION
// ==========================================
const RoadmapSection = () => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section className="w-full relative font-sans py-16 md:py-24 px-4 overflow-hidden border-t border-slate-100">
      <div className={`absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-100/40 via-transparent to-transparent opacity-80 pointer-events-none`} />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`max-w-6xl mx-auto rounded-3xl md:rounded-[3rem] p-6 md:p-12 relative z-10 ${THEME.glassPanel}`}
      >
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit mb-4 ${THEME.badgeBg}`}>
                <Sparkles className="size-3 animate-pulse" />
                <span className="text-xs font-bold tracking-wide uppercase">How it works</span>
              </div>
              <h2 className={`text-3xl md:text-5xl font-bold leading-tight ${THEME.textMain}`}>
                Your Roadmap to <span className={THEME.gradientText}>Success.</span>
              </h2>
              <p className={`mt-4 text-base md:text-lg leading-relaxed font-medium ${THEME.textMuted}`}>
                A structured path designed to take you from a beginner to an industry-ready professional in 4 strategic steps.
              </p>
            </motion.div>

            <div className="flex flex-col gap-3 mt-4">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`group relative flex items-center justify-between p-4 rounded-2xl text-left transition-all duration-300 border cursor-pointer outline-none ${
                    activeStep === step.id ? "bg-white border-cyan-300 shadow-xl scale-[1.02]" : "bg-white/50 border-white hover:border-cyan-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`size-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                      activeStep === step.id ? "bg-cyan-500 text-white shadow-md" : "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100"
                    }`}>
                      0{step.id}
                    </div>
                    <span className={`text-lg font-bold block transition-colors ${activeStep === step.id ? THEME.textMain : "text-slate-600 group-hover:text-[#101828]"}`}>
                      {step.title}
                    </span>
                  </div>
                  <ArrowRight className={`size-5 transition-all ${activeStep === step.id ? "text-cyan-500 opacity-100 translate-x-0" : "text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-[350px] md:h-[500px] w-full flex items-center justify-center order-1 lg:order-2">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [0.9, 1.1, 0.9] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-tr from-cyan-100 to-blue-100 rounded-4xl blur-3xl opacity-60" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative size-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
              <AnimatePresence mode="wait">
                <motion.div key={activeStep} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="size-full">
                  <img src={steps[activeStep - 1].image} alt={steps[activeStep - 1].title} className="size-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101828]/90 via-[#101828]/20 to-transparent" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                <motion.div key={`content-${activeStep}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-cyan-400 text-[#101828] text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-lg">
                      {steps[activeStep - 1].stat}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{steps[activeStep - 1].title}</h3>
                  <p className="text-slate-200 text-sm leading-relaxed max-w-sm">{steps[activeStep - 1].description}</p>
                </motion.div>
              </div>
              <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }} className="absolute -right-2 top-8 bg-white p-3 rounded-xl shadow-lg border border-slate-100 w-36 hidden sm:block">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="size-4 text-cyan-600" />
                  <span className="font-bold text-slate-800 text-[10px]">Step Complete</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(activeStep / steps.length) * 100}%` }} transition={{ duration: 0.8 }} className="bg-cyan-400 h-full" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/courses">
            <button className={`group relative px-10 py-4 rounded-full font-bold text-lg overflow-hidden ${THEME.buttonPrimary}`}>
              <span className="relative z-10 flex items-center gap-3">
                Launch Your Career <ArrowRight className="size-5 text-cyan-300 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

// ==========================================
// 6. FAQ SECTION
// ==========================================
const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="w-full relative py-20 px-4 font-sans overflow-hidden">
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

        {/* Support Box */}
        <div className="mt-16 text-center">
          <div className={`rounded-4xl p-8 md:p-12 relative overflow-hidden ${THEME.glassPanel}`}>
            <div className="relative z-10 flex flex-col items-center">
              <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${THEME.textMain}`}>Still have questions?</h3>
              <p className={`mb-8 max-w-md text-sm md:text-base ${THEME.textMuted}`}>
                Can't find the answer you're looking for? Chat to our friendly team.
              </p>
              <Link to="/contact">
                <button className={`px-8 py-3.5 rounded-full font-bold text-sm ${THEME.buttonPrimary}`}>
                  Get in Touch
                </button>
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
      <MarqueeSection />
      <CardsSwapSection />
      <FeaturedCoursesSection />
      <FAQSection />
    </main>
  );
};

export default Home;