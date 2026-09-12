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
  Plus,
  Minus,
  GraduationCap,
  Clock,
  Play,
  Award,
  Zap,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  Video,
  Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAgency } from "../../context/AgencyContext";

// ==========================================
// 15 TOP AI VIDEO CREATION COURSES DATA
// ==========================================
const fallbackCoursesData = [
  {
    id: "ai-historical-documentary",
    title: "AI Historical Documentary Creation Mastery",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&q=80",
    lectures: "8+ Lessons",
    price: "499",
  },
  {
    id: "ai-influencer-ugc-ads",
    title: "AI Influencer UGC Ads Mastery",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    lectures: "10+ Lessons",
    price: "499",
  },
  {
    id: "image-to-video-generation",
    title: "Image to Video Generation Mastery",
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&q=80",
    lectures: "12+ Lessons",
    price: "499",
  },
  {
    id: "2d-animation-course",
    title: "2D Animation Course Mastery",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80",
    lectures: "10+ Lessons",
    price: "499",
  },
  {
    id: "3d-animation-course",
    title: "3D Animation Course Pro",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80",
    lectures: "12+ Lessons",
    price: "499",
  },
  {
    id: "food-ai-video-mastery",
    title: "Food AI Video Mastery",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    lectures: "8+ Lessons",
    price: "499",
  },
  {
    id: "cute-ai-baby-dance",
    title: "Cute AI Baby Dance Video Mastery",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80",
    lectures: "10+ Lessons",
    price: "499",
  },
  {
    id: "mastery-in-ai-influencers",
    title: "Mastery In AI Influencers",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80",
    lectures: "10+ Lessons",
    price: "499",
  },
  {
    id: "junk-food-video-course",
    title: "Junk Food Video Course",
    image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&q=80",
    lectures: "8+ Lessons",
    price: "499",
  },
  {
    id: "spiritual-ai-influencers",
    title: "Spiritual AI Influencers Video Course",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
    lectures: "10+ Lessons",
    price: "499",
  },
  {
    id: "baby-podcast-video-course",
    title: "Baby Podcast Video Course",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80",
    lectures: "8+ Lessons",
    price: "499",
  },
  {
    id: "ai-motivational-video-course",
    title: "AI Motivational Video Course",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80",
    lectures: "10+ Lessons",
    price: "499",
  },
  {
    id: "stickman-video-mastery",
    title: "Stickman Video Mastery Course",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
    lectures: "8+ Lessons",
    price: "499",
  },
  {
    id: "anime-video-course-mastery",
    title: "Anime Video Course Mastery",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
    lectures: "12+ Lessons",
    price: "499",
  },
  {
    id: "promotional-video-for-businesses",
    title: "Promotional Video For Businesses",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
    lectures: "10+ Lessons",
    price: "499",
  },
];

// ==========================================
// 1. HERO SECTION
// ==========================================
const HeroSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const coursesUrl = isDev ? `/dev/${themeName}/courses` : "/courses";

  return (
    <section className="relative w-full overflow-hidden flex items-center mt-16 sm:mt-20 bg-white">
      {/* LAPTOP / DESKTOP FULL SCREEN BACKGROUND (md and above) - Full left-right coverage edge to edge */}
      <img
        src="https://ik.imagekit.io/0s0fb4b2b/Theme/hero4theme.webp"
        alt="Theme 4 Hero Desktop Background"
        className="hidden md:block absolute inset-0 w-full h-full object-cover object-left lg:object-center pointer-events-none select-none z-0"
      />

      {/* PHONE / MOBILE FULL SCREEN BACKGROUND (below md) - Full coverage */}
      <img
        src="https://ik.imagekit.io/0s0fb4b2b/Theme/hero4themeP.webp"
        alt="Theme 4 Hero Mobile Background"
        className="block md:hidden absolute inset-0 w-full h-full object-cover object-top pointer-events-none select-none z-0"
      />

      {/* CONTENT CONTAINER */}
      <div className="relative z-10 w-full max-w-[1500px] mx-auto px-5 sm:px-10 lg:px-16 pt-8 pb-72 sm:pb-80 md:py-16 lg:py-20 flex flex-col justify-start md:justify-center min-h-[640px] sm:min-h-[720px] md:min-h-[600px] lg:min-h-[660px] xl:min-h-[720px]">
        <div className="w-full max-w-[540px] lg:max-w-[600px] xl:max-w-[650px]">
          
          {/* TEXT CONTENT ANIMATION */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start"
          >
            {/* Small badge */}
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11.5px] font-black uppercase tracking-[0.16em] bg-violet-50/90 border border-violet-200/90 text-violet-700 shadow-xs backdrop-blur-md">
              <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-violet-600 animate-pulse" />
              #1 AI Video & Animation Creation Academy
              <Sparkles size={13} className="text-violet-600 fill-violet-400" />
            </div>

            {/* Heading */}
            <h1 className="text-[32px] sm:text-[54px] md:text-[62px] lg:text-[72px] font-black leading-[1.05] tracking-[-0.03em] text-slate-950">
              Turn Your Ideas Into <br />
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Stunning Videos
              </span> <br />
              with the Power of AI.
            </h1>

            {/* Description */}
            <p className="mt-3 sm:mt-5 max-w-[560px] text-[13.5px] sm:text-[16.5px] font-bold leading-relaxed sm:leading-7 text-slate-600">
              Learn AI tools, master video creation, and bring your imagination to life. No technical skills needed — just creativity and the right guidance.
            </p>

            {/* Action Buttons */}
            <div className="mt-5 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link 
                to={coursesUrl}
                className="group flex items-center gap-2.5 rounded-full px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-black bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/35 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span>Explore Courses</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                onClick={() => setShowDemoModal(true)}
                className="flex items-center gap-2 rounded-full px-6 sm:px-7 py-3 sm:py-4 text-xs sm:text-sm font-bold bg-white border-2 border-slate-200 text-slate-800 hover:border-violet-400 hover:text-violet-600 hover:-translate-y-0.5 transition-all shadow-xs"
              >
                <div className="size-4.5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                  <Play size={10} className="fill-violet-600 ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Four Value Props Strip */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-6 sm:mt-8 w-full">
              {[
                { label: "Beginner Friendly", icon: GraduationCap, color: "text-violet-600 bg-violet-50" },
                { label: "Practical Learning", icon: FileText, color: "text-pink-600 bg-pink-50" },
                { label: "Completion Certificate", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" },
                { label: "Lifetime Support", icon: Users, color: "text-amber-600 bg-amber-50" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 border border-slate-100 shadow-2xs">
                  <div className={`size-7 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                    <item.icon className="size-4" strokeWidth={2.5} />
                  </div>
                  <span className="text-[11px] font-black text-slate-800 truncate">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Bottom 4-Counter Stats Row */}
            <div className="hidden md:grid grid-cols-4 gap-6 mt-8 sm:mt-10 pt-6 border-t border-slate-200/60 w-full">
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
                <div className="text-xs font-bold text-slate-500">Average Rating</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950">100%</div>
                <div className="text-xs font-bold text-slate-500">Practical Learning</div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* Demo Video Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-video flex items-center justify-center"
            >
              <button
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 z-10 size-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-violet-600"
              >
                ✕
              </button>
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Demo Video"
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

// ==========================================
// 2. COURSES SECTION (5-Column Modern Grid)
// ==========================================
const CoursesSection = () => {
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
        
        if (data.length > 0) {
          setCourses(data);
        } else {
          setCourses(fallbackCoursesData);
        }
      } catch (e) {
        console.error(e);
        setCourses(fallbackCoursesData);
      }
    };
    fetchCourses();
  }, [isMainSite, agency?.id]);

  return (
    <section className="w-full bg-white py-20 md:py-28 overflow-hidden relative border-t border-slate-100">
      <div className="max-w-[1450px] mx-auto px-5 sm:px-10 lg:px-16 relative z-10">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider bg-violet-50 border border-violet-200 text-violet-700 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              OUR COURSES
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950">
              Explore Our <span className="bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">AI Video Creation</span> Courses
            </h2>
            <p className="mt-2.5 text-xs sm:text-base font-bold text-slate-500 max-w-xl">
              Choose from our industry-focused courses and start creating amazing videos today.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              to={coursesUrl}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs sm:text-sm bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition-all hover:-translate-y-0.5"
            >
              <span>View All Courses</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* Courses Grid: 2 items on mobile (1 row), 3 items on desktop (1 row) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
          {courses.slice(0, 3).map((course, idx) => (
            <Theme4CourseCard
              key={course.id}
              data={course}
              className={idx === 2 ? "hidden md:flex" : "flex"}
            />
          ))}
        </div>

        {/* Arrow button to courses page */}
        <div className="mt-8 sm:mt-12 flex justify-center">
          <Link
            to={coursesUrl}
            className="group inline-flex items-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-black text-xs sm:text-sm bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            <span>Explore All AI Video Courses</span>
            <div className="size-5 sm:size-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="size-3 sm:size-3.5 stroke-[3] text-white" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

const Theme4CourseCard = ({ data, className = "" }) => {
  const { isMainSite, getPrice } = useAgency();
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const courseUrl = isDev ? `/dev/${themeName}/coursedetails/${data?.id}` : `/courses/${data?.id}`;

  const imageUrl = data?.image || (data?.videoId ? `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg` : "https://placehold.co/600x400?text=AI+Course");
  
  let lecturesCount = "8+ Lessons";
  if (data?.lectures && Array.isArray(data.lectures)) {
    lecturesCount = `${data.lectures.length} Lessons`;
  } else if (typeof data?.lectures === "string" || typeof data?.lectures === "number") {
    lecturesCount = data.lectures;
  }

  return (
    <div className={`group flex flex-col bg-white rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-violet-300 transition-all duration-300 hover:-translate-y-1.5 h-full ${className}`}>
      <Link to={courseUrl} className="block cursor-pointer relative">
        <div className="relative h-32 sm:h-44 md:h-52 rounded-xl overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={data?.title}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/60 opacity-60" />
        </div>
      </Link>

      <div className="p-2 sm:p-3 flex flex-col flex-1 justify-between">
        <Link to={courseUrl} className="block mb-2 sm:mb-3">
          <h3 className="text-xs sm:text-base font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-violet-600 transition-colors min-h-[32px] sm:min-h-[44px]">
            {data?.title || "AI Video Course"}
          </h3>
        </Link>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500">
            {lecturesCount}
          </span>

          <Link
            to={courseUrl}
            className="size-7 sm:size-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all shadow-2xs"
            title="View Course"
          >
            <ArrowRight className="size-3.5 sm:size-4 stroke-[3]" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. WHY CHOOSE US SECTION
// ==========================================
const WhyChooseUsSection = () => {
  const perks = [
    {
      title: "Learn from Experts",
      desc: "Get step-by-step guidance from industry professionals.",
      icon: Users,
      badgeColor: "bg-violet-50 text-violet-600",
    },
    {
      title: "Hands-on Projects",
      desc: "Build real-world videos during the course.",
      icon: Video,
      badgeColor: "bg-pink-50 text-pink-600",
    },
    {
      title: "Lifetime Access",
      desc: "Learn at your own pace, anytime, anywhere.",
      icon: Clock,
      badgeColor: "bg-amber-50 text-amber-600",
    },
    {
      title: "Certificate of Completion",
      desc: "Showcase your skills with an industry-recognized certificate.",
      icon: Award,
      badgeColor: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <section className="w-full bg-[#fafafa] py-20 md:py-28 overflow-hidden relative border-t border-slate-100">
      <div className="max-w-[1450px] mx-auto px-5 sm:px-10 lg:px-16 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto relative">
          {/* Hand-drawn doodle */}
          <div className="hidden lg:flex absolute right-[-80px] top-[-10px] items-center gap-2">
            <svg
              width="50"
              height="40"
              viewBox="0 0 100 50"
              fill="none"
              className="text-violet-600 stroke-current -rotate-12"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 10 40 Q 45 5 85 25" />
              <path d="M 70 18 L 85 25 L 75 35" />
            </svg>
            <span className="font-sans font-black text-slate-800 text-xs leading-tight text-left select-none italic">
              Learn<br />Create<br />Grow
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider bg-violet-50 border border-violet-200 text-violet-700 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
            WHY CHOOSE US
            <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950 mb-3">
            Everything You <span className="text-violet-600">Need to Become a Pro</span>
          </h2>
          <p className="text-xs sm:text-base font-bold text-slate-500">
            We make AI video creation simple, practical, and result-driven.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className={`size-12 rounded-2xl ${item.badgeColor} flex items-center justify-center mb-6 shadow-xs`}>
                    <Icon className="size-6 stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-black text-slate-950 mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 4. TESTIMONIALS SECTION
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
      quote: "Best investment ever! The support team is also very helpful.",
      stars: 5,
    },
  ];

  return (
    <section id="testimonials" className="w-full bg-white py-20 md:py-28 overflow-hidden relative border-t border-slate-100">
      <div className="max-w-[1450px] mx-auto px-5 sm:px-10 lg:px-16 relative z-10">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider bg-violet-50 border border-violet-200 text-violet-700 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              STUDENT SUCCESS
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950">
              What Our <span className="text-violet-600">Learners Say</span>
            </h2>
            <p className="mt-2 text-xs sm:text-base font-bold text-slate-500 max-w-xl">
              Join thousands of creators who are already turning their ideas into amazing videos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="size-10 rounded-full bg-slate-100 hover:bg-violet-100 text-slate-600 hover:text-violet-600 flex items-center justify-center transition-colors">
              <ChevronLeft className="size-5" />
            </button>
            <button className="size-10 rounded-full bg-slate-100 hover:bg-violet-100 text-slate-600 hover:text-violet-600 flex items-center justify-center transition-colors">
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/80 rounded-3xl p-7 border border-slate-200/80 flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* Avatar + Stars */}
                <div className="flex items-center justify-between mb-5">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="size-12 rounded-full object-cover border-2 border-white shadow-sm"
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
// 5. CALL TO ACTION BANNER
// ==========================================
const CallToActionSection = () => {
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const coursesUrl = isDev ? `/dev/${themeName}/courses` : "/courses";

  return (
    <section className="w-full bg-white pb-20 md:pb-28 px-5 sm:px-10 lg:px-16">
      <div className="max-w-[1450px] mx-auto">
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-violet-500/20">
          
          {/* Left Content */}
          <div className="w-full md:w-3/5 flex flex-col items-start text-left z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-3">
              Ready to Create Your Own <br />
              Amazing Videos?
            </h2>
            <p className="text-xs sm:text-base font-bold text-violet-100 leading-relaxed mb-8 max-w-lg">
              Join now and get lifetime access to all courses, updates, and community support.
            </p>

            <Link to={coursesUrl}>
              <button className="flex items-center gap-2.5 px-8 py-4 rounded-full font-black text-xs sm:text-sm bg-[#fedc5c] text-slate-950 shadow-xl hover:bg-amber-400 transition-all hover:-translate-y-1 cursor-pointer">
                <span>Start Learning Now</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </Link>
          </div>

          {/* Right Course Image */}
          <div className="w-full md:w-2/5 flex items-center justify-center relative">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative w-full max-w-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-950/40 border-4 border-white/30"
            >
              <img
                src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80"
                alt="AI Video Creation Course"
                className="w-full h-56 sm:h-64 md:h-72 object-cover"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

// ==========================================
// 6. FAQ SECTION (2-Column Grid Accordion)
// ==========================================
const FAQSection = () => {
  const [openId, setOpenId] = useState(null);

  const leftFaqs = [
    {
      id: 1,
      q: "Do I need any prior experience?",
      a: "No! All courses are beginner-friendly. We guide you step-by-step from zero to pro.",
    },
    {
      id: 2,
      q: "Will I get a certificate?",
      a: "Yes! You receive an industry-recognized certificate upon successfully completing each course.",
    },
    {
      id: 3,
      q: "How long do I get access to the courses?",
      a: "You get lifetime access to all lectures, prompts, workflows, and future course updates.",
    },
  ];

  const rightFaqs = [
    {
      id: 4,
      q: "Which tools are covered in the courses?",
      a: "We cover top AI video tools including Midjourney, Runway, Kling AI, Luma Dream Machine, ElevenLabs, and CapCut.",
    },
    {
      id: 5,
      q: "Do you provide support if I get stuck?",
      a: "Yes! You get direct access to our WhatsApp and creator community support for any questions.",
    },
    {
      id: 6,
      q: "Can I start with just one course?",
      a: "Yes! You can enroll in any specific course or get access to all courses through our bundle.",
    },
  ];

  return (
    <section id="faq" className="w-full bg-slate-50/70 py-20 md:py-28 overflow-hidden relative border-t border-slate-100">
      <div className="max-w-[1450px] mx-auto px-5 sm:px-10 lg:px-16 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider bg-violet-50 border border-violet-200 text-violet-700 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              FREQUENTLY ASKED QUESTIONS
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950">
              Got Questions? We've Got Answers.
            </h2>
          </div>

          <div className="shrink-0">
            <a
              href="#faq"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs sm:text-sm bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition-all hover:-translate-y-0.5"
            >
              <span>View All FAQs</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </a>
          </div>
        </div>

        {/* 2-Column FAQ Accordions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {leftFaqs.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="w-full p-5 flex items-center justify-between text-left font-black text-sm sm:text-base text-slate-900 cursor-pointer group"
                  >
                    <span className="group-hover:text-violet-600 transition-colors">{item.q}</span>
                    <div className={`size-6 rounded-full flex items-center justify-center transition-transform shrink-0 ml-3 ${isOpen ? "rotate-45 bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Plus className="size-3.5 stroke-[3]" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                        <div className="px-5 pb-5 text-xs sm:text-sm font-bold text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {rightFaqs.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="w-full p-5 flex items-center justify-between text-left font-black text-sm sm:text-base text-slate-900 cursor-pointer group"
                  >
                    <span className="group-hover:text-violet-600 transition-colors">{item.q}</span>
                    <div className={`size-6 rounded-full flex items-center justify-center transition-transform shrink-0 ml-3 ${isOpen ? "rotate-45 bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Plus className="size-3.5 stroke-[3]" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                        <div className="px-5 pb-5 text-xs sm:text-sm font-bold text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
    <main className="min-h-screen w-full overflow-x-hidden text-slate-950 font-sans">
      <HeroSection />
      <CoursesSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <CallToActionSection />
      <FAQSection />
    </main>
  );
};

export default Home;
