import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, BookOpen, Clock, Play, Loader2, Sparkles, ArrowUpRight, GraduationCap } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCourse } from "../../context/CourseContext";
import { useAgency } from "../../context/AgencyContext"; 
import AuthModal from "../../components/AuthModal";
import FAQSection from "../../components/FAQSection";
import CourseVideoPlayer from "../../components/CourseVideoPlayer";
import DemoVideoSection from "../../components/DemoVideoSection";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

// ==========================================
// THEME CONFIGURATION (Driven by CSS Variables)
// ==========================================
const THEME = {
  bg: "bg-slate-50",
  textMain: "text-slate-900",
  textMuted: "text-slate-500",
  accentText: "text-[var(--brand-color)]",
  gradientText: "bg-gradient-to-r from-slate-900 via-[var(--brand-color)] to-[var(--accent-color)] bg-clip-text text-transparent",
  
  // New Ultra-Modern Card Style
  cardOuter: "bg-white p-2.5 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2",
  cardImageWrap: "relative h-56 rounded-[2rem] overflow-hidden bg-slate-100",
  
  // Buttons
  buttonPrimary: "bg-gradient-to-r from-[var(--brand-color)] to-[var(--accent-color)] text-white shadow-lg shadow-[var(--brand-color)]/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]",
  buttonOutline: "bg-white border border-slate-200 text-slate-700 hover:border-[var(--brand-color)] hover:text-[var(--brand-color)] transition-all shadow-sm",
  
  // Ambient Glows
  accentGlow: "bg-[var(--accent-color)]/10 blur-[120px]",
  brandGlow: "bg-[var(--brand-color)]/10 blur-[120px]",
  
  // UI Accents
  iconBg: "bg-[var(--brand-color)]/10 text-[var(--brand-color)]",
  badgeBg: "bg-white border border-[var(--brand-color)]/20 text-[var(--brand-color)] shadow-sm backdrop-blur",
  
  // Custom Promos
  promoBundleBg: "bg-slate-900",
  promoBogoBg: "bg-gradient-to-br from-[var(--brand-color)] to-[var(--accent-color)]",
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
    if (!currentUser) {
      setIsAuthOpen(true);
      return; 
    }

    const priceDisplay =
      rawPrice === "Free" || rawPrice === 0 || rawPrice === "0"
        ? "Free"
        : `₹${rawPrice}`;

    if (!isMainSite && priceDisplay !== "Free") {
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
      
      {/* Abstract Background Elements */}
      <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--brand-color)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none`} />
      <div className={`absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--accent-color)]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none`} />

      <div className="pt-24 md:pt-32 pb-20 relative z-10">
        
        {/* --- Header Section (Redesigned) --- */}
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {!isMainSite && agency ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 ${THEME.badgeBg}`}>
                  <Sparkles className="size-4" /> Exclusive Partner
                </div>
                <h1 className={`text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1] ${THEME.textMain}`}>
                  Learn with <br />
                  <span className={THEME.gradientText}>{agency.name}</span>
                </h1>
                <p className={`text-lg md:text-xl font-medium max-w-2xl mx-auto ${THEME.textMuted}`}>
                  Your trusted learning partner. Start your journey today and master the skills of tomorrow.
                </p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 ${THEME.badgeBg}`}>
                  <GraduationCap className="size-4 text-[var(--brand-color)]" /> Academy Syllabus
                </div>
                <h1 className={`text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1] ${THEME.textMain}`}>
                  Discover Our <br />
                  <span className={THEME.gradientText}>Premium Courses</span>
                </h1>
                <p className={`text-lg md:text-xl font-medium max-w-2xl mx-auto ${THEME.textMuted}`}>
                  Transform your career with industry-leading skills, real projects, and expert guidance.
                </p>
              </motion.div>
            )}

            {/* Search Bar - Modern Floating Style */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="relative w-full max-w-xl mt-10 group"
            >
              <div className="absolute inset-y-0 left-2 pl-4 flex items-center pointer-events-none">
                <Search className="size-6 text-slate-400 group-focus-within:text-[var(--brand-color)] transition-colors" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="What do you want to learn today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-white border border-slate-100 focus:outline-none focus:ring-4 focus:ring-[var(--brand-color)]/20 focus:border-[var(--brand-color)] transition-all font-semibold text-lg text-slate-800 placeholder-slate-400 shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
              />
            </motion.div>
          </div>
        </div>

        {/* --- Promotional Banners --- */}
        {!isMainSite && agency?.promoType === "bundle" && agency?.bundlePrice && (
          <div className="max-w-7xl mx-auto px-6 mb-16 animate-in fade-in slide-in-from-bottom-4">
            <div className={`${THEME.promoBundleBg} rounded-[3rem] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group`}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
              
              <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left mb-8 md:mb-0">
                <div className="flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <Star className="text-yellow-400 size-4" fill="currentColor" />
                  <span className="text-xs font-black uppercase tracking-widest text-yellow-400">Special Offer</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">All Courses Bundle</h2>
                <p className="text-slate-300 font-medium text-base md:text-lg max-w-md leading-relaxed">
                  Get lifetime access to our entire library of premium courses at one unbelievable price.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-5 bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-xl">
                <div className="text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-md">₹{agency.bundlePrice}</div>
                <button 
                  onClick={() => handleBuyClick({ id: 'bundle', title: 'All Courses Bundle' }, agency.bundlePrice)}
                  className={`w-full px-8 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${THEME.buttonPrimary}`}>
                  <BookOpen className="size-5" />
                  Get Full Bundle
                </button>
              </div>
            </div>
          </div>
        )}

        {!isMainSite && agency?.promoType === "bogo" && (
          <div className="max-w-7xl mx-auto px-6 mb-16 animate-in fade-in slide-in-from-bottom-4">
            <div className={`${THEME.promoBogoBg} rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between text-white shadow-2xl shadow-[var(--brand-color)]/20 relative overflow-hidden group`}>
              <div className="absolute inset-0 bg-white/5 transition-opacity group-hover:bg-white/0"></div>
              
              <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left w-full">
                <div className="flex items-center gap-2 mb-6 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/30 self-center md:self-start shadow-sm">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-white">Mega Offer Active</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight">
                  Buy ANY 1 Course <br className="hidden md:block"/>
                  <span className="text-yellow-300 relative inline-block mt-2">
                    Get ALL Courses FREE!
                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-300" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path d="M0,10 Q50,20 100,10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
                    </svg>
                  </span>
                </h2>
                <p className="text-white/90 font-medium text-base md:text-lg max-w-2xl mt-6">
                  Purchase any single course below and automatically unlock lifetime access to our entire premium library at no extra cost.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- Demo Video Section --- */}
        <DemoVideoSection />

        {/* --- Courses Grid (New Design) --- */}
        <div className="max-w-7xl mx-auto px-6 mt-16">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="size-12 animate-spin text-[var(--brand-color)]" />
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
                  <div className={`size-24 rounded-3xl flex items-center justify-center mx-auto mb-6 ${THEME.iconBg}`}>
                    <Search className="size-10" />
                  </div>
                  <h3 className={`text-3xl font-extrabold mb-3 ${THEME.textMain}`}>No courses found</h3>
                  <p className={`text-lg font-medium ${THEME.textMuted}`}>Try adjusting your search keywords.</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <FAQSection />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultMode="login" />

      {showVideoPlayer && playingCourse && (
        <CourseVideoPlayer course={playingCourse} onClose={() => setShowVideoPlayer(false)} />
      )}
    </div>
  );
};

// --- REDESIGNED COURSE CARD COMPONENT ---
const CourseCard = ({ course, isEnrolled, onBuy, onPlay, displayPrice, isMainSite }) => {
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev/");
  const themeName = isDev ? location.pathname.split("/")[2] : "";
  const courseUrl = isDev ? `/dev/${themeName}/coursedetails/${course.id}` : `/courses/${course.id}`;

  const imageUrl = course.image || (course.videoId ? `https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg` : "https://placehold.co/600x400?text=No+Image");
  const finalPrice = displayPrice !== undefined && displayPrice !== null ? displayPrice : course.price;
  const priceDisplay = finalPrice === "Free" || finalPrice === 0 || finalPrice === "0" ? "Free" : `₹${finalPrice}`;
  const rating = course.rating || 4.5;
  const reviews = course.reviews || 0;
  const instructor = course.instructor || "Mentor";
  const duration = course.duration || "Flexible";
  const category = course.category || "General";

  let lecturesCount = "1 Module";
  if (course.lectures && Array.isArray(course.lectures)) {
    lecturesCount = `${course.lectures.length} Lectures`;
  } else if (typeof course.lectures === "string" || typeof course.lectures === "number") {
    lecturesCount = course.lectures;
  }

  return (
    <div className={`group flex flex-col h-full ${THEME.cardOuter}`}>
      <Link
        to={course.isComingSoon ? "#" : courseUrl}
        onClick={(e) => course.isComingSoon && e.preventDefault()}
        className={`block ${course.isComingSoon ? "cursor-default opacity-80" : "cursor-pointer"}`}
      >
        <div className={`${THEME.cardImageWrap} group-hover:shadow-inner`}>
          {course.isComingSoon && (
            <div className="absolute top-4 left-4 z-20 bg-slate-900 text-white text-[10px] uppercase font-black px-3 py-1.5 rounded-full shadow-lg tracking-wider">
              Coming Soon
            </div>
          )}
          
          <img
            src={imageUrl}
            alt={course.title}
            className={`size-full object-cover transition-transform duration-700 group-hover:scale-110 ${course.isComingSoon ? "grayscale-[50%]" : ""}`}
          />
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/60 opacity-80" />
          
          {/* Top Badges */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-sm border border-white/50">
            <Star className="size-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-black text-slate-800">{rating}</span>
          </div>

          <div className="absolute bottom-4 left-4">
            <span className="text-[10px] font-black text-[var(--brand-color)] bg-white px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm border border-white/50">
              {category}
            </span>
          </div>

          {/* Floating Instructor Avatar */}
          <div className="absolute -bottom-4 right-6 size-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shadow-md overflow-hidden z-20">
             <div className="size-full flex items-center justify-center font-black text-sm text-slate-500 bg-slate-200">
                {instructor[0]}
             </div>
          </div>
        </div>
      </Link>

      <div className="px-5 pt-6 pb-4 flex flex-col flex-1">
        <Link to={courseUrl} className="block mb-4">
          <h3 className={`text-xl font-extrabold line-clamp-2 min-h-[56px] leading-snug transition-colors ${THEME.textMain} group-hover:text-[var(--brand-color)]`}>
            {course.title || "Untitled Course"}
          </h3>
        </Link>

        {/* Clean Meta Info Grid */}
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

        {/* Footer Area */}
        <div className="mt-auto pt-5 border-t border-slate-100 border-dashed flex flex-col gap-4">
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mentor</span>
               <span className={`text-xs font-extrabold ${THEME.textMain}`}>{instructor}</span>
            </div>

            {!isMainSite && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Price</span>
                <span className={`text-xl font-black ${priceDisplay === "Free" ? "text-emerald-500" : THEME.textMain}`}>
                  {priceDisplay}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              to={courseUrl}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-bold text-center ${THEME.buttonOutline} ${isMainSite && !isEnrolled ? "col-span-2" : ""}`}
            >
              Details
            </Link>

            {isEnrolled ? (
              <button onClick={onPlay} className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-bold ${THEME.buttonPrimary}`}>
                <Play className="size-4" fill="currentColor" /> Watch
              </button>
            ) : (
              !isMainSite && (
                course.isComingSoon ? (
                  <button disabled className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-50 text-slate-400 border border-slate-200 text-sm font-bold cursor-not-allowed">
                    Coming Soon
                  </button>
                ) : (
                  <button onClick={onBuy} className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-bold ${THEME.buttonPrimary}`}>
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