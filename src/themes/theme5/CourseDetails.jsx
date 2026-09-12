/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCourse } from "../../context/CourseContext";
import { useAgency } from "../../context/AgencyContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  PlayCircle,
  ShieldCheck,
  Infinity,
  Trophy,
  Smartphone,
  FileText,
  CheckCircle,
  CheckCircle2,
  Globe,
  Clock,
  Sparkles,
  Award,
  Video,
  ChevronDown,
  ArrowRight,
  Gift,
  Lock,
  Download,
  Share2,
  Star
} from "lucide-react";
import AuthModal from "../../components/AuthModal";
import CourseVideoPlayer from "../../components/CourseVideoPlayer";

const fallbackCourse = {
  id: "ai-historical-documentary",
  title: "AI Historical Documentary Creation",
  category: "Documentary",
  instructor: "Vikram Malhotra",
  lastUpdated: "Recently",
  rating: 4.8,
  students: "2,100+",
  price: "499",
  originalPrice: "2499",
  image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=80",
  description:
    "Master the complete end-to-end blueprint for crafting viral, studio-grade AI historical documentaries. Learn deep historical research workflows, cinematic character prompting, realistic voiceovers, and dynamic camera choreography.",
  syllabus: [
    {
      title: "Module 1: Historical Research & Scripting",
      lessons: [
        "Finding high-retention untold historical events",
        "ChatGPT-4o prompt engineering for captivating storytelling",
        "Pacing and hook formulas for 60-second shorts vs 10-minute long-form",
      ],
    },
    {
      title: "Module 2: Photorealistic Character & Scene Generation",
      lessons: [
        "Midjourney v6: Ancient warrior and ruler portrait prompts",
        "Maintaining facial and clothing consistency across scenes",
        "Generating historically accurate battlefield environments",
      ],
    },
    {
      title: "Module 3: Cinematic Video Generation & Motion",
      lessons: [
        "Runway Gen-3 Alpha: Controlling 3D camera sweeps and smoke FX",
        "Luma Dream Machine & Kling AI for complex human motion",
        "Upscaling output to crisp 4K resolution",
      ],
    },
    {
      title: "Module 4: Voiceover, Sound Design & Editing",
      lessons: [
        "ElevenLabs deep voice narration cloning and tone modulation",
        "Layering epic orchestral battle scores and ambient foley effects",
        "CapCut Pro & Premiere final assembly with subtitles",
      ],
    },
  ],
};

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { isEnrolled, enrollCourse } = useCourse();
  const { agency, isMainSite, getPrice } = useAgency();

  const [course, setCourse] = useState(fallbackCourse);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [openModule, setOpenModule] = useState(0);

  const isDev = location.pathname.startsWith("/dev/");
  const currentTheme = isDev ? location.pathname.split("/")[2] : "theme5";
  const getRoute = (path) => (isDev ? `/dev/${currentTheme}${path}` : path);

  const userHasAccess = Boolean(course?.id && typeof isEnrolled === "function" && isEnrolled(course.id));

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!id) {
          setCourse(fallbackCourse);
          setLoading(false);
          return;
        }

        const docRef = doc(db, "courseVideos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setCourse({
            ...fallbackCourse,
            ...data,
            title: data.title || fallbackCourse.title,
            description: data.description || fallbackCourse.description,
            price: data.price || fallbackCourse.price,
            originalPrice: data.originalPrice || fallbackCourse.originalPrice,
            image: data.image || fallbackCourse.image,
            syllabus: Array.isArray(data.syllabus) && data.syllabus.length > 0 ? data.syllabus : fallbackCourse.syllabus,
          });
        } else {
          setCourse(fallbackCourse);
        }
      } catch (err) {
        console.error("Course fetch error:", err);
        setCourse(fallbackCourse);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const rawPrice = course && typeof getPrice === "function" ? getPrice(course.id, course.price || "499") : (course?.price || "499");
  const displayPrice =
    rawPrice === "Free" || rawPrice === 0 || rawPrice === "0"
      ? "Free"
      : `₹${rawPrice}`;
  const originalPrice = course?.originalPrice ? `₹${course.originalPrice}` : "₹2,499";

  const normalizedSyllabus = useMemo(() => {
    if (Array.isArray(course?.syllabus) && course.syllabus.length > 0) {
      return course.syllabus.map((mod, idx) => ({
        title: typeof mod === "object" ? (mod.title || `Module ${idx + 1}`) : String(mod),
        lessons: Array.isArray(mod?.lessons)
          ? mod.lessons.map((l, lIdx) =>
              typeof l === "object" ? (l.title || l.name || `Lesson ${lIdx + 1}`) : String(l)
            )
          : [],
      }));
    }
    if (Array.isArray(course?.lectures) && course.lectures.length > 0) {
      return [
        {
          title: "Course Curriculum & Video Masterclasses",
          lessons: course.lectures.map((l, lIdx) =>
            typeof l === "object" ? (l.title || l.name || `Lesson ${lIdx + 1}`) : String(l)
          ),
        },
      ];
    }
    return fallbackCourse.syllabus;
  }, [course?.syllabus, course?.lectures]);

  const handleEnroll = async () => {
    if (!isMainSite && displayPrice !== "Free") {
      // 1. Direct payment link redirection if set by partner
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

      // 2. WhatsApp fallback
      if (!agency?.whatsapp) {
        alert("Partner WhatsApp contact not configured.");
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

  const handleAlreadyPaid = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const studentName = currentUser?.displayName || "Student";
    const studentEmail = currentUser?.email || "No email";
    const message =
      `*Payment Confirmation & Access Activation* 🧾\n\n` +
      `Hello! I have completed the payment for this course. Here are my details:\n\n` +
      `👤 *Student Name:* ${studentName}\n` +
      `📧 *Registered Email:* ${studentEmail}\n` +
      `📚 *Course Name:* ${course.title}\n` +
      `💰 *Amount Paid:* ${displayPrice}\n` +
      `🆔 *Course ID:* ${course.id}\n\n` +
      `I have attached my payment screenshot / transaction reference. Please verify and activate my course access.`;

    const phone = !isMainSite && agency?.whatsapp ? agency.whatsapp : "+91 74818 96182";
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#faf9fe] font-sans pb-24 pt-20 sm:pt-24 text-slate-800">
      
      {/* Course Hero Banner */}
      <div className="bg-slate-900 text-white py-12 lg:py-16 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-10 size-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 size-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-12 gap-10 items-center relative z-10">
          
          <div className="lg:col-span-8 space-y-5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Link to={getRoute("/home")} className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link to={getRoute("/courses")} className="hover:text-white transition-colors">
                Courses
              </Link>
              <span>/</span>
              <span className="text-purple-400 truncate max-w-xs">{course.title}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-bold text-slate-300 pt-2">
              <div className="flex items-center gap-1.5">
                <Globe className="size-4 text-slate-400" />
                <span>Hindi / English Audio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-4 text-slate-400" />
                <span>Last updated {course.lastUpdated || "Recently"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <div className="size-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                {course.instructor ? course.instructor[0] : "M"}
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Instructor</p>
                <p className="text-sm font-bold text-white">{course.instructor || "Master Mentor"}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 hidden lg:block">
            {/* Reserved for desktop layout balance */}
          </div>

        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mt-8 lg:-mt-20 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Details, Syllabus & Guarantee (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Promo Banner if Active */}
            {agency?.promoType === "bogo" && (
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 text-white shadow-xl flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Gift className="size-6 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-base font-black text-amber-300">
                    Buy 1 Get All Free Offer Active!
                  </h4>
                  <p className="text-xs text-purple-100 font-medium">
                    Enrolling in this masterclass gives you automatic access to all 15+ AI Video Creation courses.
                  </p>
                </div>
              </div>
            )}

            {/* Curriculum Accordion */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-50/80 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Course Curriculum
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Step-by-step video masterclasses, prompt blueprints & project assets
                  </p>
                </div>
                <div className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
                  12+ Lessons
                </div>
              </div>

              <div className="space-y-3">
                {normalizedSyllabus.map((mod, idx) => {
                  const isOpen = openModule === idx;

                  return (
                    <div
                      key={idx}
                      className="border border-slate-200/80 rounded-2xl overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setOpenModule(isOpen ? null : idx)}
                        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-sm sm:text-base hover:text-purple-600 transition-colors cursor-pointer bg-[#faf9fe]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black shrink-0">
                            {idx + 1}
                          </div>
                          <span>{mod.title}</span>
                        </div>
                        <ChevronDown className={`size-4.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 sm:p-5 bg-white border-t border-slate-100 space-y-2.5"
                          >
                            {mod.lessons.map((lesson, lIdx) => (
                              <div key={lIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600 font-medium">
                                <PlayCircle className="size-4 text-purple-500 shrink-0" />
                                <span>{lesson}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verifiable Certificate Guarantee Box */}
            <div className="bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Award className="size-3.5" />
                  <span>Official Certificate</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight">
                  Earn Your Industry-Recognized Credential
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  Complete all modules and submit your project to receive a verified digital completion certificate with online QR verification.
                </p>
                <div className="pt-2">
                  <Link
                    to="/verify"
                    className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-white transition-colors"
                  >
                    <span>Check Certificate Verification System</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>

              <div className="size-40 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 p-4 shadow-lg flex flex-col items-center justify-center text-center shrink-0">
                <Award className="size-14 text-amber-300 mb-2" />
                <span className="text-xs font-black uppercase">Verified Pass</span>
                <span className="text-[10px] text-slate-300">ISO Certified ID</span>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Pricing Card (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white rounded-3xl border border-indigo-50/90 shadow-2xl p-6 sm:p-8 space-y-6">
              
              {/* Preview Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 group">
                <img
                  src={course.image || fallbackCourse.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                  <div className="size-14 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-purple-600 shadow-xl group-hover:scale-110 transition-transform">
                    <PlayCircle className="size-8 ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    {displayPrice}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Instant Lifetime Access • No Recurring Fees
                </p>
              </div>

              {/* Action Button */}
              {userHasAccess ? (
                <button
                  onClick={() => navigate("/dashboard/my-courses")}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  Access Your Course
                </button>
              ) : (
                <div className="space-y-2.5">
                  <button
                    onClick={handleEnroll}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-sm shadow-xl shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Enroll Now - Instant Access</span>
                    <ArrowRight className="size-4" />
                  </button>
                  <button
                    onClick={handleAlreadyPaid}
                    className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span>Already Paid? Confirm on WhatsApp</span>
                  </button>
                </div>
              )}

              {/* Course Inclusions */}
              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs sm:text-sm font-semibold text-slate-600">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  This Masterclass Includes:
                </h4>
                <div className="flex items-center gap-2.5">
                  <Video className="size-4 text-purple-600 shrink-0" />
                  <span>12+ Full HD Video Masterclasses</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Infinity className="size-4 text-purple-600 shrink-0" />
                  <span>Full Lifetime Access & Updates</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FileText className="size-4 text-purple-600 shrink-0" />
                  <span>Ready-to-Use AI Prompt Blueprints</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="size-4 text-purple-600 shrink-0" />
                  <span>Official Certificate of Completion</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="size-4 text-purple-600 shrink-0" />
                  <span>Direct WhatsApp Mentorship Desk</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="login"
      />
    </div>
  );
};

export default CourseDetails;
