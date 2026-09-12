/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCourse } from "../../context/CourseContext";
import { useAgency } from "../../context/AgencyContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  Loader2,
  FileText,
  Download,
  Lock,
  PlayCircle,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Globe,
  AlertCircle,
  Users,
  ShieldCheck,
  Zap,
  MessageCircle,
  Share2,
  ChevronDown,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "../../components/AuthModal";
import CourseVideoPlayer from "../../components/CourseVideoPlayer";

const fallbackCourse = {
  id: "ai-historical-documentary",
  title: "AI Historical Documentary Creation Mastery",
  category: "Documentary",
  lectures: "8+ Lessons",
  price: "499",
  originalPrice: "2499",
  rating: 4.9,
  students: "1,420+",
  instructor: "AIFlix Expert Team",
  lastUpdated: "September 2024",
  image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
  description: "Learn how to research captivating historical stories, generate photorealistic ancient assets, create cinematic camera movements, and produce viral documentary reels with AI.",
  learningOutcomes: [
    "Write high-retention viral documentary scripts with ChatGPT & Claude",
    "Generate consistent historical characters & ancient battle scenes in Midjourney",
    "Bring still images to life with cinematic camera panning in Runway Gen-3",
    "Clone realistic cinematic narrators and voiceovers with ElevenLabs",
    "Add dramatic sound effects, historical ambient audio, and subtitles in CapCut",
    "Monetize and grow a faceless historical documentary YouTube/Reels channel"
  ],
  modules: [
    {
      title: "Module 1: Introduction to AI Historical Video Creation",
      duration: "45 mins",
      lessons: [
        { title: "Niche Research & Viral Story Concepts", duration: "12:30", isPreview: true },
        { title: "Prompting ChatGPT for Accurate Historical Scripts", duration: "18:15", isPreview: true },
        { title: "Creating Scene-by-Scene Visual Storyboards", duration: "14:40", isPreview: false }
      ]
    },
    {
      title: "Module 2: Midjourney Masterclass for Photoreal Historic Visuals",
      duration: "1 hr 15 mins",
      lessons: [
        { title: "Historical Character Consistency Prompts", duration: "22:10", isPreview: false },
        { title: "Ancient Architecture, Costumes & Battle Lighting", duration: "25:40", isPreview: false },
        { title: "Upscaling and 4K Asset Preparation", duration: "27:00", isPreview: false }
      ]
    },
    {
      title: "Module 3: Video Animation & Camera Motion with Runway Gen-3",
      duration: "1 hr 30 mins",
      lessons: [
        { title: "Image-to-Video Physics & Cinematic Motion Brushes", duration: "28:15", isPreview: false },
        { title: "Camera Panning, Drone Shots & Zoom Effects", duration: "32:10", isPreview: false },
        { title: "Generating Smoke, Fire, and Battle Effects", duration: "29:35", isPreview: false }
      ]
    },
    {
      title: "Module 4: Voiceover Synthesis, Sound Design & Final Export",
      duration: "1 hr 10 mins",
      lessons: [
        { title: "Voice Cloning & Emotion Modulation in ElevenLabs", duration: "21:30", isPreview: false },
        { title: "Cinematic Background Score & Sound Effects Layering", duration: "24:50", isPreview: false },
        { title: "Auto Subtitles, Color Grading & Viral Export Settings", duration: "23:40", isPreview: false }
      ]
    }
  ]
};

const Theme4CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { isEnrolled, enrollCourse, getEnrolledCourse } = useCourse();
  const { loading: agencyLoading, isMainSite, agency, getPrice } = useAgency();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModule, setOpenModule] = useState(0);

  const [activeVideoPlaylist, setActiveVideoPlaylist] = useState(null);
  const [startIndex, setStartIndex] = useState(0);

  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "theme4";
  const coursesUrl = isDev ? `/dev/${themeName}/courses` : "/courses";

  const userHasAccess = course ? isEnrolled(course.id) : false;

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        if (!id) {
          setCourse(fallbackCourse);
          setLoading(false);
          return;
        }

        const docRef = doc(db, "courseVideos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          let data = { id: docSnap.id, ...docSnap.data() };

          // ACCESS CONTROL
          const coursePartnerId = data.partnerId;
          const isOwner = currentUser?.uid && coursePartnerId === currentUser.uid;
          const allowed =
            !coursePartnerId ||
            coursePartnerId === "admin" ||
            isOwner ||
            (!isMainSite && coursePartnerId === agency?.id);

          if (!allowed) {
            setError("Course not found or access restricted");
            setLoading(false);
            return;
          }

          setCourse(data);
        } else {
          // Check if fallback course matches id
          setCourse(fallbackCourse);
        }
      } catch (err) {
        console.error("Error loading course details:", err);
        setCourse(fallbackCourse);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, isMainSite, agency, currentUser]);

  const rawPrice = course ? getPrice(course.id, course.price || "499") : "499";
  const displayPrice =
    rawPrice === "Free" || rawPrice === 0 || rawPrice === "0"
      ? "Free"
      : typeof rawPrice === "string" && rawPrice.startsWith("₹")
      ? rawPrice
      : `₹${rawPrice}`;

  const originalPrice = course?.originalPrice ? `₹${course.originalPrice}` : "₹2,499";

  const handleEnroll = async () => {
    if (!isMainSite && displayPrice !== "Free") {
      // 1. If partner set a custom payment link, open it directly
      const customPaymentLink = agency?.customPaymentLinks?.[course.id];
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
      if (agency?.promoType === "bogo") {
        offerText = `\n🎁 *Promo Applied:* Buy 1 Get All Free! 🎉`;
      } else if (agency?.courseDiscount && agency.courseDiscount > 0) {
        offerText = `\n🎁 *Special Discount:* ${agency.courseDiscount}% applied!`;
      }

      const message =
        `*New Course Enrollment Request* 🎓\n\n` +
        `Hello, I want to enroll in this course. Here are my details:\n\n` +
        `👤 *Student Name:* ${studentName}\n` +
        `📧 *Email:* ${studentEmail}\n\n` +
        `📚 *Course Name:* ${course.title}\n` +
        `💰 *Price:* ${displayPrice}\n` +
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

  const openPlayer = (playlist, index = 0) => {
    setActiveVideoPlaylist(playlist);
    setStartIndex(index);
  };

  if (loading || agencyLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-12 animate-spin text-violet-600" />
          <p className="font-bold text-slate-700 animate-pulse text-base">Loading Course Details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 text-center max-w-md border border-slate-200 shadow-xl">
          <AlertCircle className="size-12 text-violet-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Course Unavailable</h2>
          <p className="text-slate-500 font-bold mb-6">The requested course could not be loaded.</p>
          <Link to={coursesUrl} className="px-6 py-3 rounded-full bg-violet-600 text-white font-black text-sm">
            Browse All Courses
          </Link>
        </div>
      </div>
    );
  }

  const learningList = course.learningOutcomes || fallbackCourse.learningOutcomes;
  const curriculumModules = course.modules || fallbackCourse.modules;

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans bg-slate-50">
      
      {/* ================= HERO BANNER ================= */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white pt-28 sm:pt-32 lg:pt-36 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 size-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 size-80 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 relative z-10 items-center">
          
          <div className="lg:col-span-8 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400">
              <Link to={coursesUrl} className="hover:text-violet-400 transition-colors">Courses</Link>
              <span>/</span>
              <span className="text-violet-400">{course.category || "AI Video"}</span>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-violet-500/20 border border-violet-400/30 text-violet-300">
              <Sparkles className="size-3.5 text-violet-300 fill-violet-300" /> Professional AI Video Syllabus
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              {course.title}
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-sm sm:text-lg font-bold leading-relaxed max-w-2xl">
              {course.description || fallbackCourse.description}
            </p>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-8 pt-2 text-xs sm:text-sm font-bold text-slate-300 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="size-4 fill-amber-400" />
                <span>4.9 Star Rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="size-4 text-violet-400" />
                <span>1,400+ Enrolled Students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="size-4 text-emerald-400" />
                <span>Hindi & English Prompts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-4 text-indigo-400" />
                <span>Lifetime Access</span>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-3 pt-2">
              <div className="size-11 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md">
                AI
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Created by</p>
                <p className="font-black text-sm text-white">
                  {course.instructor || "AIFlix Academy Master Creators"}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ================= MAIN CONTENT + STICKY SIDEBAR ================= */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* LEFT CONTENT (8 cols) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* 1. What You Will Learn Card */}
            <div className="bg-white rounded-3xl p-7 sm:p-10 border border-slate-200/90 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="size-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Zap className="size-5 stroke-[2.5]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                  What You'll Master in This Course
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {learningList.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-bold text-slate-700 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Course Curriculum Accordion */}
            <div className="bg-white rounded-3xl p-7 sm:p-10 border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                    Course Curriculum
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
                    {curriculumModules.length} Modules • Complete Step-by-Step Training
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {curriculumModules.map((module, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50"
                  >
                    <button
                      onClick={() => setOpenModule(openModule === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-black text-sm sm:text-base text-slate-900 hover:text-violet-600 transition-colors cursor-pointer bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <span className="size-7 rounded-lg bg-violet-100 text-violet-700 font-black text-xs flex items-center justify-center">
                          0{idx + 1}
                        </span>
                        <span>{module.title}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-slate-400 hidden sm:inline">{module.duration}</span>
                        <ChevronDown
                          className={`size-4 text-slate-400 transition-transform ${
                            openModule === idx ? "rotate-180 text-violet-600" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {openModule === idx && (
                      <div className="p-4 sm:p-5 space-y-2.5 border-t border-slate-100 bg-slate-50">
                        {module.lessons.map((lesson, lIdx) => (
                          <div
                            key={lIdx}
                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 text-xs sm:text-sm font-bold text-slate-700"
                          >
                            <div className="flex items-center gap-2.5">
                              {lesson.isPreview ? (
                                <Play className="size-3.5 text-violet-600 fill-violet-600" />
                              ) : (
                                <Lock className="size-3.5 text-slate-400" />
                              )}
                              <span>{lesson.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-black">
                              {lesson.isPreview && (
                                <span className="text-[10px] bg-violet-50 text-violet-600 px-2 py-0.5 rounded">Preview</span>
                              )}
                              <span className="text-slate-400">{lesson.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Certificate of Completion */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="grid sm:grid-cols-[1.2fr_0.8fr] gap-6 items-center">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 mb-4">
                    <Award className="size-3.5 text-amber-300" /> Official Credential
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-3">Earn an Industry Recognized Certificate</h3>
                  <p className="text-xs sm:text-sm text-violet-100 font-bold leading-relaxed">
                    Complete all modules and assignments to receive your verified digital certificate for your portfolio and clients.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl text-center">
                    <Award className="size-16 text-amber-300 mx-auto mb-2" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">Verified Certificate</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT STICKY SIDEBAR (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/50">
                {/* Image Preview */}
                <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-900 mb-6 group">
                  <img
                    src={course.image || fallbackCourse.image}
                    alt={course.title}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                    <div className="size-12 rounded-full bg-white/90 text-violet-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="size-5 fill-violet-600 ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950">{displayPrice}</span>
                  {displayPrice !== "Free" && (
                    <span className="text-sm font-bold text-slate-400 line-through">{originalPrice}</span>
                  )}
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    80% OFF
                  </span>
                </div>

                {!isMainSite && agency?.promoType === "bogo" && (
                  <div className="mb-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>🎁 Buy 1 Get ALL Courses Free Active!</span>
                  </div>
                )}

                {/* Enroll CTA */}
                {userHasAccess ? (
                  <button
                    onClick={() => {
                      const enrolled = getEnrolledCourse(course.id);
                      if (enrolled) openPlayer([{ videoId: enrolled.videoId, title: enrolled.title }]);
                    }}
                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 mb-4 cursor-pointer"
                  >
                    <Play className="size-4 fill-white" />
                    <span>Watch Course Now</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-xl shadow-violet-500/25 hover:scale-102 active:scale-98 mb-4 cursor-pointer"
                  >
                    <span>Enroll Now (Instant Access)</span>
                    <ArrowRight className="size-4 stroke-[3]" />
                  </button>
                )}

                {/* Guarantee */}
                <div className="text-center text-xs font-bold text-slate-400 mb-6 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <span>100% Secure Checkout & Lifetime Access</span>
                </div>

                {/* Includes List */}
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">This Course Includes:</h4>
                  {[
                    "Full Lifetime Video Access",
                    "All Ready-Made Prompts & Project Files",
                    "Access on Mobile & Laptop",
                    "Dedicated WhatsApp Mentorship",
                    "Certificate of Completion",
                  ].map((inc, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-slate-600">
                      <CheckCircle2 className="size-4 text-violet-600 shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>

                {/* WhatsApp Support Box */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <a
                    href={`https://wa.me/${(agency?.whatsapp || "+917481896182").replace(/\D/g,"")}?text=${encodeURIComponent(`Hello, I have a query about ${course.title}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 text-xs font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 py-3 rounded-xl transition-colors"
                  >
                    <MessageCircle className="size-4" />
                    <span>Have Questions? Chat on WhatsApp</span>
                  </a>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultMode="login" />

      {activeVideoPlaylist && (
        <CourseVideoPlayer
          course={{ videos: activeVideoPlaylist }}
          startIndex={startIndex}
          onClose={() => setActiveVideoPlaylist(null)}
        />
      )}

    </div>
  );
};

export default Theme4CourseDetails;
