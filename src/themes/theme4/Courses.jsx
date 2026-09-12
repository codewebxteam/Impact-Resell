/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  BookOpen,
  Clock,
  Play,
  Loader2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Zap,
  ShieldCheck,
  MessageCircle,
  CheckCircle2,
  Video,
  Layers,
  Award,
  Users,
  ChevronDown,
  Gift,
  Tv,
  Film
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCourse } from "../../context/CourseContext";
import { useAgency } from "../../context/AgencyContext";
import AuthModal from "../../components/AuthModal";
import CourseVideoPlayer from "../../components/CourseVideoPlayer";
import DemoVideoSection from "../../components/DemoVideoSection";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

const fallbackCoursesData = [
  {
    id: "ai-historical-documentary",
    title: "AI Historical Documentary Creation Mastery",
    lectures: "8+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "1,420+",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&q=80",
    description: "Learn how to research historical stories, generate photorealistic ancient assets, and produce viral documentary reels.",
  },
  {
    id: "ai-influencer-ugc-ads",
    title: "AI Influencer UGC Ads Mastery",
    lectures: "10+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "2,150+",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    description: "Create hyper-realistic AI human models that pitch products, talk naturally, and generate high-converting social media ads.",
  },
  {
    id: "image-to-video-generation",
    title: "Image to Video Generation Mastery",
    lectures: "12+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.8,
    students: "1,890+",
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&q=80",
    description: "Turn static Midjourney or Leonardo AI images into cinematic, smooth 4K videos with Runway Gen-3 and Pika Labs.",
  },
  {
    id: "2d-animation-course",
    title: "2D Animation Course Mastery",
    lectures: "10+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "1,640+",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80",
    description: "Master 2D cartoon characters, facial expressions, fluid scene transitions, and complete cartoon storytelling with AI.",
  },
  {
    id: "3d-animation-course",
    title: "3D Animation Course Pro",
    lectures: "12+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "2,300+",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80",
    description: "Generate Pixar-grade 3D renders, realistic lighting, camera panning, and animated 3D short films effortlessly.",
  },
  {
    id: "food-ai-video-mastery",
    title: "Food AI Video Mastery",
    lectures: "8+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.8,
    students: "980+",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    description: "Create mouth-watering culinary AI videos, recipe tutorials, and viral restaurant commercial shorts.",
  },
  {
    id: "cute-ai-baby-dance",
    title: "Cute AI Baby Dance Video Mastery",
    lectures: "10+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "3,100+",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80",
    description: "Create viral dancing babies, funny baby reels, and adorable animated characters that explode on Instagram and TikTok.",
  },
  {
    id: "mastery-in-ai-influencers",
    title: "Mastery In AI Influencers",
    lectures: "10+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "1,750+",
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
    students: "1,940+",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
    description: "Create peaceful spiritual avatars, devotional music reels, chanting visuals, and motivational channels.",
  },
  {
    id: "baby-podcast-video-course",
    title: "Baby Podcast Video Course",
    lectures: "8+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.8,
    students: "1,220+",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80",
    description: "Craft entertaining talking baby podcast interviews, hilarious discussions, and trending shorts format.",
  },
  {
    id: "ai-motivational-video-course",
    title: "AI Motivational Video Course",
    lectures: "10+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "2,450+",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80",
    description: "Generate deep voiceover motivational videos, mindset speeches, and cinematic visuals with multi-million view potential.",
  },
  {
    id: "stickman-video-mastery",
    title: "Stickman Video Mastery Course",
    lectures: "8+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.8,
    students: "1,110+",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
    description: "Master viral Stickman fight animations, funny stickman stories, and meme animations in minutes using AI.",
  },
  {
    id: "anime-video-course-mastery",
    title: "Anime Video Course Mastery",
    lectures: "12+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 5.0,
    students: "3,800+",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
    description: "Create professional Shonen/Studio Ghibli style Japanese anime scenes, character transformations, and fight sequences.",
  },
  {
    id: "promotional-business-video",
    title: "Promotional Video For Businesses",
    lectures: "10+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "1,670+",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
    description: "Help real estate, e-commerce, and corporate clients scale their revenue with stunning AI-generated promo videos.",
  },
];

const Courses = () => {
  const { currentUser } = useAuth();
  const { enrollCourse, isEnrolled, getEnrolledCourse } = useCourse();
  const { agency, isMainSite, getPrice } = useAgency();
  const navigate = useNavigate();
  const location = useLocation();

  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "theme4";

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [playingCourse, setPlayingCourse] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const supportPhone = !isMainSite && agency?.whatsapp ? agency.whatsapp : "+91 74818 96182";
  const whatsappLink = `https://wa.me/${supportPhone.replace(/\D/g, "")}?text=${encodeURIComponent("Hello! I want to inquire about the AI Video Creation courses.")}`;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courseVideos"));
        let courseList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (isMainSite) {
          courseList = courseList.filter((c) => !c.partnerId || c.partnerId === "admin");
        } else {
          courseList = courseList.filter(
            (c) => !c.partnerId || c.partnerId === "admin" || c.partnerId === agency?.id
          );
        }

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

  const handlePlayVideo = (courseId) => {
    const enrolledCourse = getEnrolledCourse(courseId);
    if (enrolledCourse) {
      setPlayingCourse(enrolledCourse);
      setShowVideoPlayer(true);
    }
  };

  const handleBuyClick = async (course, rawPrice) => {
    const priceDisplay =
      rawPrice === "Free" || rawPrice === 0 || rawPrice === "0"
        ? "Free"
        : `₹${rawPrice}`;

    if (!isMainSite && priceDisplay !== "Free") {
      // 1. If partner set a custom payment link, open it directly
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

      const studentName = currentUser.displayName || "Student";
      const studentEmail = currentUser.email || "No email";

      let offerText = "";
      if (agency?.promoType === "bogo" && course.id !== "bundle") {
        offerText = `\n🎁 *Promo Applied:* Buy 1 Get All Free! 🎉`;
      } else if (course.id === "bundle") {
        offerText = `\n🎁 *Promo Applied:* All Courses Bundle`;
      } else if (agency?.courseDiscount && agency.courseDiscount > 0) {
        offerText = `\n🎁 *Special Discount:* ${agency.courseDiscount}% applied!`;
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

  const filteredCourses = courses.filter((course) => {
    const title = (course.title || "").toLowerCase();
    const instructor = (course.instructor || "").toLowerCase();
    return title.includes(searchQuery.toLowerCase()) || instructor.includes(searchQuery.toLowerCase());
  });

  const faqs = [
    {
      q: "Do I need any previous video editing or coding experience?",
      a: "No! Every course in our academy is designed from ground zero. You will learn step-by-step using modern generative AI tools that do not require any manual animation coding or complex timelines."
    },
    {
      q: "Which AI tools are taught across these courses?",
      a: "You'll master Runway Gen-3, Midjourney v6, Leonardo AI, HeyGen, ElevenLabs, D-ID, Pika Labs, CapCut Pro, and ChatGPT prompting techniques."
    },
    {
      q: "Can I watch the lessons on my mobile phone?",
      a: "Yes! All lessons are fully responsive and accessible on mobile, tablet, and PC with fast streaming and lifetime access."
    },
    {
      q: "Will I receive a verified certificate upon completion?",
      a: "Yes! Completing any course earns you a verifiable digital certificate that you can showcase on LinkedIn, your resume, or client portfolios."
    },
    {
      q: "How does the WhatsApp support work?",
      a: "Whenever you encounter an issue or need guidance on prompt generation or video exports, you can directly message our dedicated support team on WhatsApp."
    },
    {
      q: "Are software tools free or paid?",
      a: "We teach both 100% free workflows as well as premium tool pipelines with money-saving hacks and free credit tricks."
    }
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans bg-slate-50">
      <div className="pt-24 md:pt-32 pb-24 relative z-10">
        
        {/* ================= 1. HERO HEADER SECTION ================= */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase mb-5 bg-white border border-violet-200 text-violet-700 shadow-xs">
                <Sparkles className="size-4 text-violet-600 fill-violet-400" /> Complete AI Video Syllabus
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-5 tracking-tight text-slate-950 leading-[1.08]">
                Explore Our <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">AI Video Creation</span> Courses
              </h1>
              <p className="text-base sm:text-lg md:text-xl font-bold max-w-2xl mx-auto text-slate-600 leading-relaxed">
                Master AI avatars, 2D/3D animation, UGC influencer ads, historical documentaries, and viral video creation.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="relative w-full max-w-2xl mt-8 group"
            >
              <div className="absolute inset-y-0 left-2 pl-4 flex items-center pointer-events-none">
                <Search className="size-5 text-slate-400 group-focus-within:text-violet-600 transition-colors" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Search AI courses (Avatar, 3D, UGC Ads, Anime, Prompting)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-24 py-4 sm:py-5 rounded-2xl bg-white border border-slate-200/90 focus:outline-none focus:ring-4 focus:ring-violet-400/20 focus:border-violet-500 transition-all font-bold text-sm sm:text-base text-slate-900 placeholder-slate-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Clear
                </button>
              )}
            </motion.div>

          </div>
        </div>

        {/* Demo Video Section */}
        <DemoVideoSection />

        {/* ================= 2. CONDITIONAL PROMOTIONAL BUNDLE / BOGO ================= */}
        {!isMainSite && agency?.promoType === "bundle" && agency?.bundlePrice && (
          <div className="max-w-[1450px] mx-auto px-5 sm:px-10 lg:px-16 mt-16 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-purple-950 text-white rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-14 relative overflow-hidden border border-violet-500/30 shadow-2xl">
              <div className="absolute top-0 right-0 size-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-violet-500/20 border border-violet-400/40 text-violet-300 mb-5">
                    <Gift className="size-4 text-violet-300" /> Limited Time VIP Bundle
                  </div>
                  
                  <h3 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
                    Get Lifetime Access To All <br />
                    <span className="bg-gradient-to-r from-violet-400 via-pink-300 to-amber-300 bg-clip-text text-transparent">
                      15+ AI Video Courses
                    </span>
                  </h3>
                  
                  <p className="text-slate-300 text-sm sm:text-base font-bold max-w-xl mb-6 leading-relaxed">
                    Unlock everything from AI Avatar Vlogging and Pixar-Style 3D Animation to High-Converting UGC Ads and Anime series creation in one single pass.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-8 max-w-lg">
                    {[
                      "15+ Complete Masterclasses",
                      "Lifetime Free Updates",
                      "Direct WhatsApp Mentorship",
                      "Official Completion Certificates",
                    ].map((perk, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-200">
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-xl hover:bg-amber-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Sparkles className="size-4.5" />
                    <span>Claim All-In-One Pass on WhatsApp</span>
                    <ArrowRight className="size-4 stroke-[3]" />
                  </a>
                </div>

                <div className="flex justify-center">
                  <div className="relative w-full max-w-[340px] bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 shadow-2xl">
                    <div className="bg-slate-900 rounded-2xl p-5 text-white text-center">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-violet-400 uppercase tracking-wider">VIP BUNDLE PASS</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black">SAVE 85%</span>
                      </div>
                      <h4 className="text-xl font-black mb-1">AIFlix All Masterclasses</h4>
                      <p className="text-xs font-bold text-slate-400 mb-4">Instant Access to all 15+ specialized video creation modules</p>
                      
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-black text-white">₹{agency.bundlePrice}</div>
                        </div>
                        <button
                          onClick={() => handleBuyClick({ id: 'bundle', title: 'All Courses Bundle' }, agency.bundlePrice)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs hover:bg-amber-300 transition-all cursor-pointer shadow-md"
                        >
                          Enroll Bundle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isMainSite && agency?.promoType === "bogo" && (
          <div className="max-w-[1450px] mx-auto px-5 sm:px-10 lg:px-16 mt-16 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between text-slate-950 shadow-2xl shadow-amber-500/20 relative overflow-hidden group border border-amber-300">
              <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left w-full">
                <div className="flex items-center gap-2 mb-4 bg-slate-950/10 backdrop-blur-md px-4 py-2 rounded-full border border-slate-950/15 self-center md:self-start">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-950">Special Mega Offer Active</span>
                </div>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-3 leading-tight tracking-tight text-slate-950">
                  Buy ANY 1 Course <br className="hidden md:block"/>
                  <span className="text-slate-950 relative inline-block underline decoration-slate-950">
                    Get ALL Courses FREE!
                  </span>
                </h2>
                <p className="text-slate-900 font-bold text-sm sm:text-base md:text-lg max-w-2xl mt-2">
                  Purchase any single course below and automatically unlock lifetime access to our entire library of premium AI video creation courses at no extra cost.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. 3-COURSES PER ROW GRID ================= */}
        <div className="max-w-[1450px] mx-auto px-5 sm:px-10 lg:px-16 mt-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                All Available Courses ({filteredCourses.length})
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="size-12 animate-spin text-violet-600" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {filteredCourses.length > 0 ? (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredCourses.map((course, index) => {
                    const dynamicPrice = getPrice(course.id, course.price);
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        key={course.id}
                      >
                        <Theme4CourseCardFull
                          course={course}
                          isEnrolled={isEnrolled(course.id)}
                          onBuy={() => handleBuyClick(course, dynamicPrice)}
                          onPlay={() => handlePlayVideo(course.id)}
                          displayPrice={dynamicPrice}
                          isMainSite={isMainSite}
                          currentTheme={themeName}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <div className="size-20 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-violet-50 text-violet-600">
                    <Search className="size-8 stroke-[2.5]" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 text-slate-900">No courses found</h3>
                  <p className="text-base font-bold text-slate-500">Try adjusting your search keywords.</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* ================= 4. 4-STEP LEARNING ROADMAP ================= */}
        <div className="max-w-[1450px] mx-auto px-5 sm:px-10 lg:px-16 mt-24">
          <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-14 border border-slate-200/80 shadow-sm">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-black uppercase tracking-wider text-violet-600">THE PROVEN ROADMAP</span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-1">
                From Zero to Viral Video Creator in 4 Steps
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "Script & Concept",
                  desc: "Learn ChatGPT & Claude prompt engineering to write high-retention viral scripts and storyboards.",
                  icon: BookOpen,
                },
                {
                  step: "02",
                  title: "Asset Generation",
                  desc: "Generate consistent AI characters, backgrounds, and voiceovers using Midjourney & ElevenLabs.",
                  icon: Sparkles,
                },
                {
                  step: "03",
                  title: "Motion & Animation",
                  desc: "Animate assets into fluid 2D/3D video clips with Runway Gen-3, Pika, and HeyGen avatars.",
                  icon: Film,
                },
                {
                  step: "04",
                  title: "Edit & Monetize",
                  desc: "Add cinematic sound FX, trending transitions in CapCut, and launch your YouTube/client business.",
                  icon: Award,
                },
              ].map((item, idx) => (
                <div key={idx} className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-black text-violet-600/30">{item.step}</span>
                      <div className="size-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                        <item.icon className="size-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= 5. FREQUENTLY ASKED QUESTIONS ================= */}
        <div className="max-w-4xl mx-auto px-6 mt-24">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-violet-600">GOT QUESTIONS?</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-black text-sm sm:text-base text-slate-900 hover:text-violet-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`size-5 text-slate-400 transition-transform duration-300 shrink-0 ml-4 ${
                      openFaq === idx ? "rotate-180 text-violet-600" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm font-bold text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ================= 6. WHATSAPP MENTOR SUPPORT CARD ================= */}
        <div className="max-w-4xl mx-auto px-6 mt-16 text-center">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-violet-500/20">
            <h3 className="text-2xl sm:text-3xl font-black mb-2">Still Have Questions?</h3>
            <p className="text-xs sm:text-sm font-bold text-violet-100 max-w-md mx-auto mb-6">
              Connect directly with our AI learning consultant on WhatsApp and get personalized guidance.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-black text-xs sm:text-sm bg-white text-slate-950 hover:bg-slate-100 transition-all hover:scale-105 shadow-md cursor-pointer"
            >
              <MessageCircle className="size-4 text-emerald-600" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultMode="login" />

      {showVideoPlayer && playingCourse && (
        <CourseVideoPlayer course={playingCourse} onClose={() => setShowVideoPlayer(false)} />
      )}
    </div>
  );
};

// ==========================================
// THEME 4 COURSE CARD (3-COL FULL CARD)
// ==========================================
const Theme4CourseCardFull = ({ course, isEnrolled, onBuy, onPlay, displayPrice, isMainSite, currentTheme = "theme4" }) => {
  const courseUrl = currentTheme ? `/dev/${currentTheme}/coursedetails/${course.id}` : `/courses/${course.id}`;

  const imageUrl =
    course.image ||
    (course.videoId
      ? `https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg`
      : "https://placehold.co/600x400?text=AI+Course");

  let lecturesCount = "8+ Lessons";
  if (course.lectures && Array.isArray(course.lectures)) {
    lecturesCount = `${course.lectures.length} Lessons`;
  } else if (typeof course.lectures === "string" || typeof course.lectures === "number") {
    lecturesCount = course.lectures;
  }

  const priceDisplay =
    displayPrice === "Free" || displayPrice === 0 || displayPrice === "0"
      ? "Free"
      : typeof displayPrice === "string" && displayPrice.startsWith("₹")
      ? displayPrice
      : `₹${displayPrice}`;

  const originalPriceDisplay = course.originalPrice ? `₹${course.originalPrice}` : "₹2,499";
  const rating = course.rating || 4.9;

  return (
    <div className="group flex flex-col bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-violet-300 transition-all duration-300 hover:-translate-y-1.5 h-full justify-between">
      
      <div>
        {/* Course Thumbnail */}
        <Link to={courseUrl} className="block cursor-pointer relative mb-4">
          <div className="relative h-48 sm:h-52 rounded-2xl overflow-hidden bg-slate-100">
            <img
              src={imageUrl}
              alt={course.title}
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

            {/* Top Right Rating Badge */}
            <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-md">
              <Star size={11} className="fill-slate-950 text-slate-950" /> {rating}
            </div>

            {/* Bottom Lessons count inside banner */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
              <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <BookOpen size={12} /> {lecturesCount}
              </span>
            </div>
          </div>
        </Link>

        {/* Title */}
        <Link to={courseUrl} className="block mb-2">
          <h3 className="text-base sm:text-lg font-black text-slate-950 line-clamp-2 leading-snug group-hover:text-violet-600 transition-colors min-h-[44px]">
            {course.title || "AI Video Creation Course"}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-xs font-bold text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {course.description || "Master industry leading AI video tools, prompt engineering, and viral content production."}
        </p>
      </div>

      {/* Pricing & CTA Row */}
      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-slate-950">{priceDisplay}</span>
            {priceDisplay !== "Free" && (
              <span className="text-xs font-bold text-slate-400 line-through">
                {originalPriceDisplay}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEnrolled ? (
            <button
              onClick={onPlay}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Play className="size-3.5 fill-white" />
              <span>Watch</span>
            </button>
          ) : (
            <button
              onClick={onBuy}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-violet-500/20 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Enroll Now</span>
              <ArrowRight className="size-3.5 stroke-[3]" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default Courses;
