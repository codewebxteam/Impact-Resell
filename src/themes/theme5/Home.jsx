/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Play,
  Star,
  Users,
  Clock,
  CheckCircle2,
  GraduationCap,
  FileCheck,
  FolderGit2,
  Award,
  Infinity,
  Layers,
  Video,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X,
  PlayCircle
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAgency } from "../../context/AgencyContext";
import { useAuth } from "../../context/AuthContext";
import { useCourse } from "../../context/CourseContext";
import AuthModal from "../../components/AuthModal";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

// Curated masterclasses for AI Video Creation
const fallbackCoursesData = [
  {
    id: "ai-historical-documentary",
    title: "AI Historical Documentary Creation",
    lectures: "12+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.8,
    students: "2.1k",
    image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&q=80",
    description: "Learn to research historical scripts, generate cinematic character visuals, and edit documentary reels with AI.",
  },
  {
    id: "ai-influencer-ugc-ads",
    title: "AI Influencer UGC Ads Mastery",
    lectures: "14+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "1.8k",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    description: "Create hyper-realistic virtual human influencers, UGC video advertisements, and monetize automated Instagram pages.",
  },
  {
    id: "2d-animation-course",
    title: "2D Animation Course",
    lectures: "10+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.8,
    students: "1.4k",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&q=80",
    description: "Master prompt-based 2D cartoon characters, Japanese anime scene transitions, and YouTube storytelling.",
  },
  {
    id: "3d-animation-course",
    title: "3D Animation Course",
    lectures: "11+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "1.9k",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
    description: "Produce Hollywood Pixar-style 3D animated shorts, camera angles, lighting, and realistic physics motion.",
  },
  {
    id: "food-ai-video-mastery",
    title: "Food AI Video Mastery",
    lectures: "8+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.8,
    students: "2.0k",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    description: "Create mouth-watering culinary AI videos, sizzling recipe commercials, and viral restaurant promotional clips.",
  },
  {
    id: "cute-ai-baby-dance",
    title: "Cute AI Baby Dance Video Mastery",
    lectures: "10+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "3.1k",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80",
    description: "Create viral dancing babies, funny baby reels, and adorable animated characters that explode on social media.",
  },
  {
    id: "mastery-in-ai-influencers",
    title: "Mastery In AI Influencers",
    lectures: "10+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "1.7k",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80",
    description: "Build, grow, and monetize completely virtual Instagram & YouTube influencers with consistent faces and voices.",
  },
  {
    id: "junk-food-video-course",
    title: "Junk Food Video Course",
    lectures: "8+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.7,
    students: "820+",
    image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&q=80",
    description: "Learn fast-food AI commercials, sizzling visual effects, and hyper-engaging fast food advertising.",
  },
  {
    id: "spiritual-ai-influencers",
    title: "Spiritual AI Influencers Video Course",
    lectures: "10+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "1.9k",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
    description: "Design calm, spiritual AI monks, devotional shorts, and mindfulness narration channels.",
  },
];

const faqsData = [
  {
    q: "Do I need any prior video editing or AI experience?",
    a: "None at all! Our masterclasses are designed specifically from zero to advanced. We guide you step-by-step through tool setup, prompt formulas, and beginner-friendly editing.",
  },
  {
    q: "Which tools are covered in the courses?",
    a: "You will master the industry-leading AI creative stack including Runway Gen-3, Midjourney v6, HeyGen, ElevenLabs Voice AI, Leonardo AI, Luma Dream Machine, and CapCut Pro.",
  },
  {
    q: "Will I receive an official certificate upon completion?",
    a: "Yes! Once you complete any masterclass and submit your hands-on project, you receive a verified digital certificate with a unique credential ID and verification QR code.",
  },
  {
    q: "Do you provide mentor support if I get stuck?",
    a: "Absolutely. You get 24/7 student community access and direct WhatsApp mentor guidance to help you resolve prompt issues or creative challenges anytime.",
  },
  {
    q: "How long do I get access to the course materials?",
    a: "You receive lifetime access! This includes all current video lessons, prompt templates, drive assets, and all future updates whenever new AI video models launch.",
  },
  {
    q: "Can I start with just one course or buy a full pass?",
    a: "You can purchase individual masterclasses or take advantage of our partner promotions (like Buy 1 Get All Free or All-Courses Bundle) if available on this academy.",
  },
];

const testimonialsData = [
  {
    name: "Rohit Sharma",
    role: "YouTuber",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80",
    rating: 5,
    quote:
      "The courses are easy to follow and very practical. I created my first AI historical video in just 2 weeks!",
  },
  {
    name: "Priya Verma",
    role: "Entrepreneur",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    rating: 5,
    quote:
      "Amazing content and great support. Now I create UGC ads for my brand using AI!",
  },
  {
    name: "Aman Khan",
    role: "Student",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    rating: 5,
    quote:
      "Best investment ever! The support team is also very helpful.",
  },
];

const Home = () => {
  const { agency, isMainSite, getPrice } = useAgency();
  const { currentUser } = useAuth();
  const { enrollCourse } = useCourse();
  const location = useLocation();
  const navigate = useNavigate();

  const [courses, setCourses] = useState(fallbackCoursesData);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // Carousel slider state
  const [currentIndex, setCurrentIndex] = useState(0);

  const isDev = location.pathname.startsWith("/dev/");
  const currentTheme = isDev ? location.pathname.split("/")[2] : "theme5";
  const getRoute = (path) => (isDev ? `/dev/${currentTheme}${path}` : path);

  const brandName = !isMainSite && agency?.name ? agency.name : (agency?.name || "AIFlix");

  // Fetch only authentic admin courses from Firestore, filtering out test documents
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courseVideos"));
        let courseList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter: only official courses where partnerId is empty or admin, or matching this partner
        courseList = courseList.filter((c) => {
          const isOwner = !c.partnerId || c.partnerId === "admin" || (!isMainSite && c.partnerId === agency?.id);
          const title = (c.title || "").toLowerCase().trim();
          const isJunk = !title || title === "test" || title === "jkh" || title.startsWith("demo ") || title === "demo" || title.length < 3;
          return isOwner && !isJunk;
        });

        courseList.sort((a, b) => {
          const pA = parseInt(a.priority) || 9999;
          const pB = parseInt(b.priority) || 9999;
          if (pA !== pB) return pA - pB;
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        setCourses(courseList.length > 0 ? courseList : fallbackCoursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses(fallbackCoursesData);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [isMainSite, agency?.id]);

  // Payment Link & Enrollment Handler
  const handleBuyClick = async (course, rawPrice) => {
    const priceDisplay =
      rawPrice === "Free" || rawPrice === 0 || rawPrice === "0"
        ? "Free"
        : `₹${rawPrice}`;

    if (!isMainSite && priceDisplay !== "Free") {
      // 1. Check custom payment link configured by partner
      const customPaymentLink =
        agency?.customPaymentLinks?.[course.id] ||
        (course.id === "bundle" ? (agency?.customPaymentLinks?.["bundle"] || agency?.bundlePaymentLink) : null);
      const partnerCoursePaymentLink =
        course.partnerId && course.partnerId !== "admin" ? course.paymentLink : null;
      const finalPaymentLink = customPaymentLink || partnerCoursePaymentLink || course.paymentLink;

      if (finalPaymentLink) {
        window.open(finalPaymentLink, "_blank");
        return;
      }

      if (!currentUser) {
        setIsAuthOpen(true);
        return;
      }

      // 2. Fallback to WhatsApp if no payment link configured
      if (!agency?.whatsapp) {
        alert("Partner WhatsApp number not configured.");
        return;
      }

      const studentName = currentUser?.displayName || "Student";
      const studentEmail = currentUser?.email || "No email";

      let offerText = "";
      if (agency?.promoType === "bogo" && course.id !== "bundle") {
        offerText = `\n🎁 *Promo Applied:* Buy 1 Get All Free! 🎉`;
      } else if (course.id === "bundle") {
        offerText = `\n🎁 *Promo Applied:* All Courses Bundle`;
      }

      const message =
        `*New Course Enrollment Request* 🎓\n\n` +
        `Hello, I want to enroll in this course. Here are my details:\n\n` +
        `👤 *Student Name:* ${studentName}\n` +
        `📧 *Email:* ${studentEmail}\n\n` +
        `📚 *Course Name:* ${course.title}\n` +
        `💰 *Price:* ${priceDisplay}\n` +
        `🆔 *Course ID:* ${course.id}\n` +
        offerText +
        `\n\nPlease guide me with the immediate payment and access process.`;

      const whatsappUrl = `https://wa.me/${agency.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      return;
    }

    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      await enrollCourse(course);
      navigate("/dashboard/my-courses");
    } catch (error) {
      console.error("Enrollment error:", error);
      alert(error.message);
    }
  };

  const visibleCourses = courses.slice(currentIndex, currentIndex + 5);
  const nextSlide = () => {
    if (currentIndex + 1 < courses.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(Math.max(0, courses.length - 5));
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9fe] font-sans overflow-x-hidden text-slate-800">
      
      {/* ========================================================= */}
      {/* SECTION 1: HERO (Desktop + Mobile Responsive Full Screen) */}
      {/* ========================================================= */}
      <section className="relative w-full overflow-hidden mt-16 sm:mt-20 bg-white flex items-start md:items-center min-h-[620px] sm:min-h-[680px] md:min-h-[640px] xl:min-h-[700px]">
        
        {/* DESKTOP BACKGROUND IMAGE (md and above) */}
        <img
          src="https://ik.imagekit.io/0s0fb4b2b/Theme/hero5theme.webp"
          alt="Theme 5 Hero Desktop Background"
          className="hidden md:block absolute inset-0 w-full h-full object-cover object-left lg:object-center pointer-events-none select-none z-0"
        />

        {/* PHONE / MOBILE BACKGROUND IMAGE (below md) */}
        <img
          src="https://ik.imagekit.io/0s0fb4b2b/Theme/hero5themeP.webp"
          alt="Theme 5 Hero Mobile Background"
          className="block md:hidden absolute inset-0 w-full h-full object-cover object-top pointer-events-none select-none z-0"
        />

        {/* HERO CONTENT CONTAINER (OVERLAYED ON TOP OF IMAGE) */}
        <div className="relative z-10 w-full max-w-[1500px] mx-auto px-5 sm:px-10 lg:px-16 pt-20 pb-8 sm:pt-24 sm:pb-12 md:py-20 lg:py-24 flex flex-col justify-start md:justify-center">
          <div className="w-full max-w-[540px] lg:max-w-[600px] xl:max-w-[650px]">
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-start"
            >
              {/* Pill badge */}
              <div className="mb-3.5 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11.5px] font-black uppercase tracking-[0.14em] bg-white/95 border border-purple-200/90 text-purple-700 shadow-sm backdrop-blur-md">
                <Sparkles size={12} className="text-amber-500 fill-amber-400" />
                <span>AI Powered Learning For Everyone</span>
              </div>

              {/* Heading */}
              <h1 className="text-[29px] sm:text-[46px] md:text-[54px] lg:text-[66px] font-black leading-[1.22] sm:leading-[1.12] tracking-[-0.02em] text-slate-950">
                Turn Your Ideas Into <br />
                <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                  Stunning Videos
                </span>
              </h1>

              {/* Description */}
              <p className="mt-3 sm:mt-5 max-w-[560px] text-[13px] sm:text-[16px] font-bold leading-relaxed sm:leading-7 text-slate-700 md:text-slate-600">
                Learn AI video creation step by step, even if you're a complete beginner. Create, grow and bring your imagination to life.
              </p>

              {/* Action Buttons */}
              <div className="mt-5 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Link 
                  to={getRoute("/courses")}
                  className="group flex-1 sm:flex-initial flex items-center justify-center gap-2.5 rounded-full px-5 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/35 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  <span>Explore Courses</span>
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>

                <button
                  onClick={() => setDemoModalOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-full px-4.5 sm:px-7 py-3 sm:py-4 text-xs sm:text-sm font-bold bg-white/90 backdrop-blur-md border-2 border-slate-200 text-slate-800 hover:border-purple-400 hover:text-purple-600 hover:-translate-y-0.5 transition-all shadow-xs cursor-pointer"
                >
                  <div className="size-4.5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Play size={9} className="fill-purple-600 ml-0.5" />
                  </div>
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* 4-Counter Stats Row (Hidden on Phone View, Visible on Desktop) */}
              <div className="hidden md:grid grid-cols-4 gap-6 mt-8 sm:mt-10 pt-6 border-t border-slate-200/80 w-full">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950">10K+</div>
                  <div className="text-xs font-bold text-slate-500">Happy Learners</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950">15+</div>
                  <div className="text-xs font-bold text-slate-500">Specialized Courses</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950">4.8/5</div>
                  <div className="text-xs font-bold text-slate-500">Student Rating</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950">100%</div>
                  <div className="text-xs font-bold text-slate-500">Practical Learning</div>
                </div>
              </div>

            </motion.div>
          </div>
        </div>

      </section>

      {/* ========================================================= */}
      {/* SECTION 2: FLOATING 6-FEATURE PILLS STRIP (HIDDEN ON PHONE/MOBILE) */}
      {/* ========================================================= */}
      <section className="hidden lg:block max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 -mt-4 sm:-mt-8 mb-16 relative z-20">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-indigo-50/90 shadow-xl shadow-purple-500/5 p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            
            {/* 1. Beginner Friendly */}
            <div className="flex flex-col items-center text-center p-2">
              <div className="size-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 shadow-2xs">
                <GraduationCap className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Beginner</h4>
              <p className="text-xs text-slate-500 font-medium">Friendly</p>
            </div>

            {/* 2. Step-by-Step Learning */}
            <div className="flex flex-col items-center text-center p-2 pt-4 sm:pt-2">
              <div className="size-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3 shadow-2xs">
                <FileCheck className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Step-by-Step</h4>
              <p className="text-xs text-slate-500 font-medium">Learning</p>
            </div>

            {/* 3. Practical Projects */}
            <div className="flex flex-col items-center text-center p-2 pt-4 sm:pt-2">
              <div className="size-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 shadow-2xs">
                <FolderGit2 className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Practical</h4>
              <p className="text-xs text-slate-500 font-medium">Projects</p>
            </div>

            {/* 4. Completion Certificate */}
            <div className="flex flex-col items-center text-center p-2 pt-4 sm:pt-2">
              <div className="size-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-2xs">
                <Award className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Completion</h4>
              <p className="text-xs text-slate-500 font-medium">Certificate</p>
            </div>

            {/* 5. Lifetime Access */}
            <div className="flex flex-col items-center text-center p-2 pt-4 sm:pt-2">
              <div className="size-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 shadow-2xs">
                <Infinity className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Lifetime</h4>
              <p className="text-xs text-slate-500 font-medium">Access</p>
            </div>

            {/* 6. Community Support */}
            <div className="flex flex-col items-center text-center p-2 pt-4 sm:pt-2">
              <div className="size-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 shadow-2xs">
                <Users className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Community</h4>
              <p className="text-xs text-slate-500 font-medium">Support</p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: POPULAR AI VIDEO CREATION COURSES              */}
      {/* ========================================================= */}
      <section className="py-10 sm:py-14 px-4 sm:px-8 lg:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Popular{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                AI Video Creation
              </span>{" "}
              Courses
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium mt-2">
              Choose from our most loved courses and start creating amazing videos today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                aria-label="Previous courses"
                className="size-10 rounded-full bg-white border border-slate-200/90 shadow-2xs hover:border-purple-300 hover:text-purple-600 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next courses"
                className="size-10 rounded-full bg-white border border-slate-200/90 shadow-2xs hover:border-purple-300 hover:text-purple-600 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <Link
              to={getRoute("/courses")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-purple-200 text-xs sm:text-sm font-bold text-purple-700 hover:bg-purple-50 transition-colors shadow-2xs shrink-0"
            >
              <span>View All Courses</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Courses Cards Grid - 4 on mobile (2x2), 5 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {(visibleCourses.length >= 5 ? visibleCourses : courses.slice(0, 5)).map((course, idx) => {
            const rawPrice = typeof getPrice === "function" ? getPrice(course.id, course.price || "499") : (course.price || "499");
            const displayPrice =
              rawPrice === "Free" || rawPrice === 0 || rawPrice === "0"
                ? "Free"
                : `₹${rawPrice}`;
            const originalPrice = course.originalPrice ? `₹${course.originalPrice}` : "₹2,499";

            return (
              <div
                key={course.id}
                className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-purple-200 transition-all duration-300 flex flex-col overflow-hidden group ${
                  idx >= 4 ? "hidden lg:flex" : "flex"
                }`}
              >
                {/* Thumbnail with Play Overlay */}
                <Link
                  to={getRoute(`/coursedetails/${course.id}`)}
                  className="relative aspect-4/3 w-full bg-slate-900 overflow-hidden block"
                >
                  <img
                    src={course.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                    <div className="size-9 sm:size-11 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-900 shadow-md group-hover:scale-110 transition-transform">
                      <Play className="size-3.5 sm:size-4 fill-slate-900 ml-0.5" />
                    </div>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-3.5 sm:p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <Link
                      to={getRoute(`/coursedetails/${course.id}`)}
                      className="text-xs sm:text-base font-black text-slate-900 hover:text-indigo-600 line-clamp-2 transition-colors mb-1.5 sm:mb-2 min-h-[32px] sm:min-h-[44px]"
                    >
                      {course.title}
                    </Link>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <div>
                      <span className="text-sm sm:text-lg font-black text-slate-900">
                        {displayPrice}
                      </span>
                    </div>

                    <button
                      onClick={() => handleBuyClick(course, rawPrice)}
                      className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] sm:text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: NO TECHNICAL SKILLS BANNER (sectionthme5.webp) */}
      {/* ========================================================= */}
      <section className="py-8 sm:py-12 px-4 sm:px-8 lg:px-12 max-w-[1440px] mx-auto">
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-indigo-50 group">
          <Link to={getRoute("/courses")} className="block w-full cursor-pointer">
            <img
              src="https://ik.imagekit.io/0s0fb4b2b/Theme/sectionthme5.webp"
              alt="No Technical Skills No Problem Banner"
              className="w-full h-auto object-cover select-none"
            />
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: WHY CHOOSE AIFLIX?                             */}
      {/* ========================================================= */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-12 max-w-[1440px] mx-auto text-center">
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {brandName}
            </span>
            ?
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-2">
            Everything you need to master AI video creation, in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Learn from Experts */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-xs hover:shadow-xl hover:border-pink-200 transition-all duration-300 text-left group">
            <div className="size-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Video className="size-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Learn from Experts
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              Get step-by-step guidance from industry professionals who create viral AI reels daily.
            </p>
          </div>

          {/* Card 2: Hands-on Projects */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-xs hover:shadow-xl hover:border-purple-200 transition-all duration-300 text-left group">
            <div className="size-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Layers className="size-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Hands-on Projects
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              Build real-world videos during the course so you finish with a client-ready portfolio.
            </p>
          </div>

          {/* Card 3: Lifetime Access */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-xs hover:shadow-xl hover:border-amber-200 transition-all duration-300 text-left group">
            <div className="size-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Infinity className="size-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Lifetime Access
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              Learn at your own pace, anytime, anywhere. All future model updates are included free.
            </p>
          </div>

          {/* Card 4: Certificate of Completion */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-xs hover:shadow-xl hover:border-emerald-200 transition-all duration-300 text-left group">
            <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Award className="size-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Completion Certificate
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              Showcase your verifiable credential on LinkedIn, resumes, and freelance portfolios.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: READY TO CREATE YOUR OWN AMAZING VIDEOS? (CTA) */}
      {/* ========================================================= */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-12 max-w-[1440px] mx-auto">
        <div className="bg-gradient-to-r from-purple-100/90 via-pink-50 to-indigo-100/80 border border-purple-100 rounded-3xl p-8 sm:p-12 lg:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left Decorative Text */}
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="text-xs font-black tracking-widest text-purple-600 uppercase">
              Your Creative Journey Starts Here!
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              Ready to Create Your Own <br className="hidden sm:inline" />
              Amazing Videos?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Join now and get lifetime access to all courses, updates, prompts, and mentor community support.
            </p>

            <div className="pt-2">
              <Link
                to={getRoute("/courses")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:scale-105 active:scale-95 text-white font-bold px-8 py-3.5 rounded-2xl shadow-xl shadow-purple-500/25 transition-all cursor-pointer text-sm sm:text-base"
              >
                <span>Start Learning Now</span>
                <ArrowRight className="size-4.5" />
              </Link>
            </div>
          </div>

          {/* Right Mascot Illustration */}
          <div className="relative shrink-0">
            <div className="size-48 sm:size-56 rounded-3xl bg-white/70 backdrop-blur-xs border border-white p-4 shadow-xl flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="size-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <Play className="size-10 fill-white ml-1" />
                </div>
                <h4 className="text-sm font-black text-slate-900">AI Video Pass</h4>
                <p className="text-[11px] text-slate-500 font-bold">15+ Masterclasses</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8: FREQUENTLY ASKED QUESTIONS                     */}
      {/* ========================================================= */}
      <section id="faqs" className="py-12 sm:py-16 px-4 sm:px-8 lg:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-black uppercase tracking-wider mb-3">
              <span>• Frequently Asked Questions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Got Questions? We've Got Answers.
            </h2>
          </div>

          <Link
            to={getRoute("/contact")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200/90 text-xs sm:text-sm font-bold text-slate-700 hover:border-purple-300 hover:text-purple-600 transition-colors shadow-2xs shrink-0"
          >
            <span>Ask A Question</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* 2-Column FAQ Accordion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqsData.map((faq, idx) => {
            const isOpen = openFaq === idx;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-sm sm:text-base hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                    {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 sm:px-6 pb-5 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-100 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Video Demo Modal */}
      <AnimatePresence>
        {demoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full relative border border-slate-800"
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-800">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Play className="size-4 text-purple-400 fill-purple-400" />
                  AI Video Creation Workflow Preview
                </h3>
                <button
                  onClick={() => setDemoModalOpen(false)}
                  className="size-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="relative aspect-video w-full bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Demo Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="login"
      />
    </div>
  );
};

export default Home;
