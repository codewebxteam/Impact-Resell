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
  Gift,
  CheckCircle2,
  Filter,
  Check,
  Zap,
  PlayCircle
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCourse } from "../../context/CourseContext";
import { useAgency } from "../../context/AgencyContext";
import AuthModal from "../../components/AuthModal";
import CourseVideoPlayer from "../../components/CourseVideoPlayer";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

const fallbackCoursesData = [
  {
    id: "ai-historical-documentary",
    title: "AI Historical Documentary Creation",
    lectures: "12+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.8,
    students: "2,100+",
    image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&q=80",
    description: "Learn to research historical scripts, generate cinematic character visuals, and edit documentary reels with AI.",
    category: "Documentary",
  },
  {
    id: "ai-influencer-ugc-ads",
    title: "AI Influencer UGC Ads Mastery",
    lectures: "14+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "1,850+",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    description: "Create hyper-realistic virtual human influencers, UGC video advertisements, and monetize automated Instagram pages.",
    category: "AI Avatars",
  },
  {
    id: "2d-animation-course",
    title: "2D Animation Course",
    lectures: "10+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.8,
    students: "1,420+",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&q=80",
    description: "Master prompt-based 2D cartoon characters, Japanese anime scene transitions, and YouTube storytelling.",
    category: "Animation",
  },
  {
    id: "3d-animation-course",
    title: "3D Animation Course",
    lectures: "11+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.9,
    students: "1,980+",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
    description: "Produce Hollywood Pixar-style 3D animated shorts, camera angles, lighting, and realistic physics motion.",
    category: "Animation",
  },
  {
    id: "food-ai-video-mastery",
    title: "Food AI Video Mastery",
    lectures: "8+ Lessons",
    price: "499",
    originalPrice: "2499",
    rating: 4.8,
    students: "2,050+",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    description: "Create mouth-watering culinary AI videos, sizzling recipe commercials, and viral restaurant promotional clips.",
    category: "Niche",
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
    description: "Create viral dancing babies, funny baby reels, and adorable animated characters that explode on social media.",
    category: "Animation",
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
    category: "AI Avatars",
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
    category: "Niche",
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
    description: "Design calm, spiritual AI monks, devotional shorts, and mindfulness narration channels.",
    category: "AI Avatars",
  },
];

const Courses = () => {
  const [courses, setCourses] = useState(fallbackCoursesData);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [playingCourse, setPlayingCourse] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const { currentUser } = useAuth();
  const { enrollCourse, isEnrolled, getEnrolledCourse } = useCourse();
  const { agency, isMainSite, getPrice } = useAgency();
  const navigate = useNavigate();
  const location = useLocation();

  const isDev = location.pathname.startsWith("/dev/");
  const currentTheme = isDev ? location.pathname.split("/")[2] : "theme5";
  const getRoute = (path) => (isDev ? `/dev/${currentTheme}${path}` : path);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courseVideos"));
        let courseList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

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

  const handleAlreadyPaidClick = (course = null) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const studentName = currentUser?.displayName || "Student";
    const studentEmail = currentUser?.email || "No email";
    const targetTitle = course ? course.title : (agency?.promoType === "bundle" ? "All Courses VIP Bundle" : "Course Enrollment");
    const targetId = course ? course.id : (agency?.promoType === "bundle" ? "bundle" : "all");
    const targetPrice = course 
      ? (typeof getPrice === "function" ? getPrice(course.id, course.price || "499") : (course.price || "499"))
      : (agency?.promoType === "bundle" ? (agency?.bundlePrice || "499") : "");

    const priceText = targetPrice ? `💰 *Amount Paid:* ₹${targetPrice}\n` : "";

    const message =
      `*Payment Confirmation & Access Activation* 🧾\n\n` +
      `Hello! I have completed the payment. Here are my enrollment details:\n\n` +
      `👤 *Student Name:* ${studentName}\n` +
      `📧 *Registered Email:* ${studentEmail}\n` +
      `📚 *Course/Bundle:* ${targetTitle}\n` +
      priceText +
      `🆔 *Reference ID:* ${targetId}\n\n` +
      `I have attached my payment screenshot / transaction reference. Please verify and activate my course access.`;

    const phone = !isMainSite && agency?.whatsapp ? agency.whatsapp : "+91 74818 96182";
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const categories = ["All", "AI Video", "Animation", "AI Avatars", "Documentary", "Niche"];

  const filteredCourses = courses.filter((course) => {
    const title = (course.title || "").toLowerCase();
    const desc = (course.description || "").toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#faf9fe] font-sans pb-24 pt-24 sm:pt-28 text-slate-800">
      
      {/* Top Header Banner */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-10">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-indigo-50 shadow-sm text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-black uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>Full Masterclass Catalog</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Explore Our{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                AI Video Creation
              </span>{" "}
              Courses
            </h1>

            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl mx-auto">
              Choose from industry-focused courses, prompt blueprints, and video workflows to monetize your content.
            </p>

            {/* Search Bar */}
            <div className="pt-2 max-w-lg mx-auto">
              <div className="flex items-center bg-[#faf9fe] border border-slate-200/90 rounded-2xl p-2 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all shadow-2xs">
                <Search className="size-5 text-slate-400 ml-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search course title, animation, prompts..."
                  className="w-full px-3 py-1.5 text-xs sm:text-sm font-semibold bg-transparent outline-none text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Banners: BOGO or Bundle Offer if active */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-10">
        {agency?.promoType === "bogo" && (
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="size-14 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0">
                <Gift className="size-7 text-amber-300" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                  Special Academy Offer
                </span>
                <h3 className="text-xl sm:text-2xl font-black">
                  Buy 1 Get All Courses FREE!
                </h3>
                <p className="text-xs sm:text-sm text-purple-100 font-medium">
                  Enroll in any single course today and automatically get unlocked access to our entire 15+ course catalog.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
              <button
                onClick={() => {
                  const firstCourse = courses[0] || fallbackCoursesData[0];
                  handleBuyClick(firstCourse, getPrice(firstCourse.id, firstCourse.price || "499"));
                }}
                className="px-6 py-3 rounded-2xl bg-white text-purple-700 font-black text-xs sm:text-sm shadow-lg hover:bg-purple-50 transition-colors cursor-pointer"
              >
                Claim BOGO Pass
              </button>
              <button
                onClick={() => handleAlreadyPaidClick()}
                className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-xs sm:text-sm border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="size-4 text-emerald-300" />
                <span>Already Paid?</span>
              </button>
            </div>
          </div>
        )}

        {agency?.promoType === "bundle" && (
          <div className="bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="size-14 rounded-2xl bg-purple-500/20 backdrop-blur-xs flex items-center justify-center shrink-0 text-amber-400">
                <Zap className="size-7" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                  Mega Bundle Offer
                </span>
                <h3 className="text-xl sm:text-2xl font-black">
                  All Courses Bundle for Just ₹{agency?.bundlePrice || "499"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  Get full lifetime access to all 15+ AI Video Creation masterclasses, updates, and community support in one single pass.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
              <button
                onClick={() => {
                  handleBuyClick({ id: "bundle", title: "All Courses Bundle", price: agency?.bundlePrice || "499" }, agency?.bundlePrice || "499");
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:brightness-110 transition-all cursor-pointer"
              >
                Unlock All for ₹{agency?.bundlePrice || "499"}
              </button>
              <button
                onClick={() => handleAlreadyPaidClick({ id: "bundle", title: "All Courses Bundle" })}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>Already Paid?</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Courses Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const rawPrice = typeof getPrice === "function" ? getPrice(course.id, course.price || "499") : (course.price || "499");
            const displayPrice =
              rawPrice === "Free" || rawPrice === 0 || rawPrice === "0"
                ? "Free"
                : `₹${rawPrice}`;
            const userOwns = Boolean(course?.id && typeof isEnrolled === "function" && isEnrolled(course.id));

            return (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-2xl hover:border-purple-200 transition-all duration-300 flex flex-col overflow-hidden group justify-between"
              >
                <div>
                  {/* Image / Video Thumbnail */}
                  <Link
                    to={getRoute(`/coursedetails/${course.id}`)}
                    className="relative aspect-16/10 w-full bg-slate-900 overflow-hidden block"
                  >
                    <img
                      src={course.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                      <div className="size-12 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-900 shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="size-5 fill-slate-900 ml-0.5" />
                      </div>
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="p-6 pb-2 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-bold text-slate-500">
                      <span className="text-purple-600 font-bold bg-purple-50 px-2.5 py-1 rounded-full">
                        {Array.isArray(course.lectures)
                          ? `${course.lectures.length} Lessons`
                          : typeof course.lectures === "string" || typeof course.lectures === "number"
                          ? course.lectures
                          : "12+ Lessons"}
                      </span>

                      {/* BOGO offer badge if active */}
                      {agency?.promoType === "bogo" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                          <Gift className="size-3 text-amber-600" /> Buy 1 Get All Free
                        </span>
                      )}
                    </div>

                    <Link
                      to={getRoute(`/coursedetails/${course.id}`)}
                      className="text-lg font-black text-slate-900 hover:text-purple-600 transition-colors line-clamp-2 leading-snug block"
                    >
                      {course.title}
                    </Link>

                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                </div>

                {/* Price and Enroll / Action Buttons Footer */}
                <div className="p-6 pt-0 space-y-3">
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xl font-black text-slate-900">
                        {displayPrice}
                      </div>
                    </div>

                    {userOwns ? (
                      <Link
                        to="/dashboard/my-courses"
                        className="px-5 py-2.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-200 hover:bg-emerald-600 transition-colors"
                      >
                        Go to Dashboard
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleBuyClick(course, rawPrice)}
                        className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>

                  {!userOwns && (
                    <button
                      onClick={() => handleAlreadyPaidClick(course)}
                      className="w-full text-center text-[11px] font-bold text-slate-400 hover:text-emerald-600 flex items-center justify-center gap-1 transition-colors cursor-pointer py-1"
                    >
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                      <span>Already Paid? Confirm on WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Help / Payment Verification Banner */}
        <div className="mt-14 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                Already made a payment via UPI or Payment Link?
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Send your payment screenshot to our support team on WhatsApp for immediate course access.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleAlreadyPaidClick()}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Send Payment Proof</span>
            <ArrowRight className="size-4" />
          </button>
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

export default Courses;
