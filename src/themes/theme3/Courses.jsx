/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, BookOpen, Clock, Play, Loader2, Sparkles, ArrowRight, GraduationCap, Zap, ShieldCheck, MessageCircle } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCourse } from "../../context/CourseContext";
import { useAgency } from "../../context/AgencyContext"; 
import AuthModal from "../../components/AuthModal";
import CourseVideoPlayer from "../../components/CourseVideoPlayer";
import DemoVideoSection from "../../components/DemoVideoSection";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

// ==========================================
// THEME CONFIGURATION (#fedc5c Driven)
// ==========================================
const THEME = {
  bg: "bg-slate-50",
  textMain: "text-slate-950",
  textMuted: "text-slate-600",
  
  cardOuter: "bg-white p-2.5 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_30px_60px_rgba(254,220,92,0.2)] transition-all duration-500 hover:-translate-y-2",
  cardImageWrap: "relative h-56 rounded-[2rem] overflow-hidden bg-slate-100",
  
  buttonPrimary: "bg-[#fedc5c] text-slate-950 font-black shadow-lg shadow-amber-400/30 hover:bg-amber-400 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]",
  buttonOutline: "bg-white border-2 border-slate-200 text-slate-800 hover:border-amber-400 hover:bg-amber-50 transition-all font-extrabold shadow-sm",
  
  badgeBg: "bg-white border border-amber-400/40 text-slate-950 shadow-sm backdrop-blur font-black",
  promoBundleBg: "bg-slate-950",
  promoBogoBg: "bg-gradient-to-br from-amber-400 to-[#fedc5c]",
};

const Courses = () => {
  const { currentUser } = useAuth();
  const { enrollCourse, isEnrolled, getEnrolledCourse } = useCourse();
  const { agency, isMainSite, getPrice } = useAgency(); 
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [playingCourse, setPlayingCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courseVideos"));
        let courseList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        if (isMainSite) {
           courseList = courseList.filter(c => !c.partnerId || c.partnerId === "admin");
        } else {
           courseList = courseList.filter(c => !c.partnerId || c.partnerId === "admin" || c.partnerId === agency?.id);
        }

        courseList.sort((a, b) => {
          const pA = parseInt(a.priority) || 9999;
          const pB = parseInt(b.priority) || 9999;
          if (pA !== pB) return pA - pB;
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
        setCourses(courseList);
      } catch (error) {
        console.error("Error fetching courses:", error);
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

      if (!agency?.whatsapp) {
        return alert("Partner contact number not found. Please contact support.");
      }

      const studentName = currentUser?.displayName || "Student";
      const studentEmail = currentUser?.email || "Email Not Provided";

      let offerText = "";
      if (agency?.promoType === "bogo" && course.id !== "bundle") {
        offerText = `\n🎁 *Promo Applied:* Buy 1 Get All Free! 🎉`;
      } else if (course.id === "bundle") {
        offerText = `\n🎁 *Promo Applied:* All Courses Bundle`;
      }

      const message =
        `*New Course Enrollment Request* 🎓\n\n` +
        `Hello, I am interested in purchasing this course. Here are my details:\n\n` +
        `👤 *Student Name:* ${studentName}\n` +
        `📧 *Mail:* ${studentEmail}\n\n` +
        `📚 *Course Name:* ${course.title}\n` +
        `💰 *Price:* ${priceDisplay}\n` +
        `🆔 *Course ID:* ${course.id}\n` +
        offerText + `\n\n` +
        `Please guide me with the payment process.`;

      const whatsappUrl = `https://wa.me/${agency.whatsapp.replace(/\D/g,"")}?text=${encodeURIComponent(message)}`;
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
    const title = course.title || "";
    const instructor = course.instructor || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase()) || instructor.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className={`min-h-screen w-full relative overflow-hidden font-sans ${THEME.bg}`}>
      <div className="pt-24 md:pt-32 pb-20 relative z-10">
        
        {/* --- Theme 3 Light & Clean Courses Hero Section --- */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {!isMainSite && agency ? (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase mb-5 bg-white border border-amber-400/50 text-slate-950 shadow-sm">
                  <Sparkles className="size-4 text-amber-500 fill-amber-400" /> Exclusive Partner Academy
                </div>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-5 tracking-tight text-slate-950 leading-[1.08]">
                  Learn with <span className="bg-gradient-to-r from-slate-950 via-amber-600 to-amber-500 bg-clip-text text-transparent">{agency.name}</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl font-bold max-w-2xl mx-auto text-slate-600 leading-relaxed">
                  Your trusted AI learning partner. Master viral AI avatar vlogging, 2D/3D animation, and high-converting UGC video ads.
                </p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase mb-5 bg-white border border-amber-400/50 text-slate-950 shadow-sm">
                  <GraduationCap className="size-4 text-amber-500" /> AI Video Academy Syllabus
                </div>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-5 tracking-tight text-slate-950 leading-[1.08]">
                  Discover Our <span className="bg-gradient-to-r from-slate-950 via-amber-600 to-amber-500 bg-clip-text text-transparent">AI Video & Animation Courses</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl font-bold max-w-2xl mx-auto text-slate-600 leading-relaxed">
                  Master AI avatars, 2D/3D animation, AI influencers, historical documentaries, and viral video creation.
                </p>
              </motion.div>
            )}

            {/* Clean Light Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="relative w-full max-w-2xl mt-8 sm:mt-10 group"
            >
              <div className="absolute inset-y-0 left-2 pl-4 flex items-center pointer-events-none">
                <Search className="size-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Search AI courses (Avatar, 3D, UGC Ads, Anime)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-24 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] bg-white border border-slate-200/90 focus:outline-none focus:ring-4 focus:ring-amber-400/30 focus:border-amber-400 transition-all font-bold text-sm sm:text-base text-slate-900 placeholder-slate-400 shadow-[0_15px_40px_rgba(0,0,0,0.04)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg"
                >
                  Clear
                </button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Promotional Banners */}
        {!isMainSite && agency?.promoType === "bundle" && agency?.bundlePrice && (
          <div className="max-w-7xl mx-auto px-6 mb-16 animate-in fade-in slide-in-from-bottom-4">
            <div className={`${THEME.promoBundleBg} rounded-[3rem] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between text-white shadow-2xl shadow-slate-950/20 relative overflow-hidden group border border-amber-400/20`}>
              <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left mb-8 md:mb-0">
                <div className="flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <Star className="text-amber-400 size-4 fill-current" />
                  <span className="text-xs font-black uppercase tracking-widest text-amber-400">Special Offer</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">All Courses Bundle</h2>
                <p className="text-slate-300 font-medium text-base md:text-lg max-w-md leading-relaxed">
                  Get lifetime access to our entire library of premium AI video courses at one unbelievable price.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-5 bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl">
                <div className="text-5xl md:text-6xl font-black tracking-tight text-[#fedc5c] drop-shadow-md">₹{agency.bundlePrice}</div>
                <button 
                  onClick={() => handleBuyClick({ id: 'bundle', title: 'All Courses Bundle' }, agency.bundlePrice)}
                  className={`w-full px-8 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 ${THEME.buttonPrimary}`}>
                  <BookOpen className="size-5" />
                  Get Full Bundle
                </button>
              </div>
            </div>
          </div>
        )}

        {!isMainSite && agency?.promoType === "bogo" && (
          <div className="max-w-7xl mx-auto px-6 mb-16 animate-in fade-in slide-in-from-bottom-4">
            <div className={`${THEME.promoBogoBg} rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between text-slate-950 shadow-2xl shadow-amber-400/20 relative overflow-hidden group`}>
              <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left w-full">
                <div className="flex items-center gap-2 mb-6 bg-slate-950/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-950/20 self-center md:self-start shadow-sm">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-950">Mega Offer Active</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight text-slate-950">
                  Buy ANY 1 Course <br className="hidden md:block"/>
                  <span className="text-slate-950 relative inline-block mt-2 underline decoration-slate-950">
                    Get ALL Courses FREE!
                  </span>
                </h2>
                <p className="text-slate-900 font-bold text-base md:text-lg max-w-2xl mt-6">
                  Purchase any single course below and automatically unlock lifetime access to our entire premium library at no extra cost.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Demo Video Section */}
        <DemoVideoSection />

        {/* Courses Grid */}
        <div className="max-w-7xl mx-auto px-6 mt-16">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="size-12 animate-spin text-amber-500" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {filteredCourses.length > 0 ? (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCourses.map((course, index) => {
                    const dynamicPrice = getPrice(course.id, course.price);
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        key={course.id}
                      >
                        <CourseCard
                          course={course}
                          isEnrolled={isEnrolled(course.id)}
                          onBuy={() => handleBuyClick(course, dynamicPrice)}
                          onPlay={() => handlePlayVideo(course.id)}
                          displayPrice={dynamicPrice}
                          isMainSite={isMainSite}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-center py-24 rounded-[3rem] ${THEME.cardOuter}`}>
                  <div className="size-24 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-[#fedc5c] text-slate-950">
                    <Search className="size-10 stroke-[2.5]" />
                  </div>
                  <h3 className={`text-3xl font-black mb-3 ${THEME.textMain}`}>No courses found</h3>
                  <p className={`text-lg font-bold ${THEME.textMuted}`}>Try adjusting your search keywords.</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* --- Why Choose Us Section --- */}
        <div className="max-w-7xl mx-auto px-6 mt-24">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider bg-amber-100/80 border border-amber-300/60 text-slate-900 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              THE ACADEMY ADVANTAGE
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight">
              Everything You Need To Master AI Video
            </h2>
            <p className="mt-3 text-sm md:text-base font-bold text-slate-600">
              Join thousands of creators building viral YouTube Shorts, Reels, and monetized channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-[#fedc5c] text-slate-950 flex items-center justify-center mb-5 shadow-md shadow-amber-400/30">
                <Zap className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-slate-950 mb-2">100% Practical Projects</h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed">
                Step-by-step video creation workflows using top free & paid AI tools.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-[#fedc5c] text-slate-950 flex items-center justify-center mb-5 shadow-md shadow-amber-400/30">
                <GraduationCap className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-slate-950 mb-2">Beginner Friendly</h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed">
                No prior editing skills or camera confidence required. Learn from absolute zero.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-[#fedc5c] text-slate-950 flex items-center justify-center mb-5 shadow-md shadow-amber-400/30">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-slate-950 mb-2">Lifetime Access</h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed">
                Watch anytime, anywhere on mobile or laptop with free lifetime course updates.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-[#fedc5c] text-slate-950 flex items-center justify-center mb-5 shadow-md shadow-amber-400/30">
                <MessageCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-slate-950 mb-2">WhatsApp Support</h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed">
                Get fast personal guidance whenever you get stuck during video generation.
              </p>
            </div>
          </div>
        </div>

        {/* --- AI Skills Showcase Banner --- */}
        <div className="max-w-7xl mx-auto px-6 mt-20 mb-10">
          <div className="bg-[#fef9c3] border border-amber-200/90 rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
            <div className="max-w-xl">
              <span className="text-xs font-mono font-black text-amber-600 uppercase tracking-widest block mb-2">Master Modern AI Video Skills</span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 leading-snug mb-3">
                From Avatars to 3D Animation & UGC Viral Ads
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed mb-6">
                Our curriculum covers AI Avatars, 2D/3D Animations, Historical Documentaries, Anime, Baby Podcasts, and Business Promotional Videos.
              </p>

              <div className="flex flex-wrap gap-2">
                {["AI Avatars", "3D Animation", "Historical AI", "UGC Ads", "Anime Mastery", "Baby Podcast", "Stickman Videos"].map((skill, idx) => (
                  <span key={idx} className="bg-white border border-amber-300/80 px-3.5 py-1.5 rounded-full text-xs font-black text-slate-900 shadow-2xs">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0">
              <a
                href={agency?.whatsapp ? `https://wa.me/${agency.whatsapp.replace(/\D/g,"")}` : "#"}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 px-8 py-4 rounded-full font-black text-xs sm:text-sm bg-[#fedc5c] text-slate-950 shadow-md hover:bg-amber-400 transition-all hover:-translate-y-1 cursor-pointer"
              >
                <span>Have Questions? WhatsApp Us</span>
                <div className="size-6 bg-slate-950 text-[#fedc5c] rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform">
                  <ArrowRight className="size-3.5 stroke-[3]" />
                </div>
              </a>
            </div>
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

// COURSE CARD COMPONENT FOR THEME 3
const CourseCard = ({ course, isEnrolled, onBuy, onPlay, displayPrice, isMainSite }) => {
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const courseUrl = isDev ? `/dev/${themeName}/coursedetails/${course.id}` : `/courses/${course.id}`;

  const imageUrl = course.image || (course.videoId ? `https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg` : "https://placehold.co/600x400?text=No+Image");
  const duration = course.duration || "Flexible";

  let lecturesCount = "1 Module";
  if (course.lectures && Array.isArray(course.lectures)) {
    lecturesCount = `${course.lectures.length} Lectures`;
  } else if (typeof course.lectures === "string" || typeof course.lectures === "number") {
    lecturesCount = course.lectures;
  }

  const priceDisplay =
    displayPrice === "Free" || displayPrice === 0 || displayPrice === "0"
      ? "Free"
      : typeof displayPrice === "string" && displayPrice.startsWith("₹")
      ? displayPrice
      : `₹${displayPrice}`;

  return (
    <div className={`group flex flex-col h-full ${THEME.cardOuter}`}>
      <Link
        to={course.isComingSoon ? "#" : courseUrl}
        onClick={(e) => course.isComingSoon && e.preventDefault()}
        className={`block ${course.isComingSoon ? "cursor-default opacity-80" : "cursor-pointer"}`}
      >
        <div className={`${THEME.cardImageWrap} group-hover:shadow-inner`}>
          {course.isComingSoon && (
            <div className="absolute top-4 left-4 z-20 bg-slate-950 text-white text-[10px] uppercase font-black px-3 py-1.5 rounded-full shadow-lg tracking-wider">
              Coming Soon
            </div>
          )}
          
          <img
            src={imageUrl}
            alt={course.title}
            className={`size-full object-cover transition-transform duration-700 group-hover:scale-110 ${course.isComingSoon ? "grayscale-[50%]" : ""}`}
          />
          
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/60 opacity-80" />
        </div>
      </Link>

      <div className="px-5 pt-6 pb-4 flex flex-col flex-1">
        <Link to={courseUrl} className="block mb-4">
          <h3 className={`text-xl font-black line-clamp-2 min-h-[56px] leading-snug transition-colors ${THEME.textMain} group-hover:text-amber-600`}>
            {course.title || "Untitled Course"}
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

        <div className="mt-auto pt-5 border-t border-slate-100 border-dashed flex flex-col gap-4">
          
          {!isMainSite && (
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price</span>
              <span className={`text-xl font-black ${priceDisplay === "Free" ? "text-emerald-500" : THEME.textMain}`}>
                {priceDisplay}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              to={courseUrl}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-bold text-center ${THEME.buttonOutline} ${isMainSite && !isEnrolled ? "col-span-2" : ""}`}
            >
              Details
            </Link>

            {isEnrolled ? (
              <button onClick={onPlay} className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-bold ${THEME.buttonPrimary}`}>
                <Play className="size-4 stroke-[2.5]" fill="currentColor" /> Watch
              </button>
            ) : (
              !isMainSite && (
                course.isComingSoon ? (
                  <button disabled className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-50 text-slate-400 border border-slate-200 text-sm font-bold cursor-not-allowed">
                    Coming Soon
                  </button>
                ) : (
                  <button onClick={onBuy} className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-black ${THEME.buttonPrimary}`}>
                    {priceDisplay === "Free" ? "Enroll Free" : "Enroll Now"}
                  </button>
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
