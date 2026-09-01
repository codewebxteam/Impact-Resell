import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, BookOpen, Clock, Play, Loader2, Sparkles } from "lucide-react";
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
// THEME CONFIGURATION (Centralized Colors)
// ==========================================
const THEME = {
  // Base Colors
  bg: "bg-[#f7fbff]",
  textMain: "text-[#101828]",
  textMuted: "text-slate-500",
  accentText: "text-[#1679a8]",
  
  // Gradients
  gradientText: "bg-gradient-to-r from-[#101828] via-[#1679a8] to-[#45cbe8] bg-clip-text text-transparent",
  
  // Glass & Cards
  glassPanel: "bg-white/35 backdrop-blur-[3px] border border-white/80 shadow-[0_30px_100px_rgba(39,116,145,0.12)]",
  cardBg: "bg-white/90 backdrop-blur border border-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]",
  
  // Buttons
  buttonPrimary: "bg-[#101828] text-white shadow-xl shadow-slate-300/50 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300",
  buttonSecondary: "bg-white/80 border border-slate-200 text-slate-700 shadow-sm backdrop-blur transition-all hover:border-slate-300 hover:bg-white",
  buttonAccent: "bg-cyan-400 text-[#101828] hover:bg-cyan-300 shadow-lg shadow-cyan-200/50 transition-all hover:-translate-y-1",
  
  // Ambient Glows
  cyanGlow: "bg-cyan-200/30 blur-[100px]",
  blueGlow: "bg-blue-200/40 blur-[120px]",
  indigoGlow: "bg-indigo-100/60 blur-[100px]",
  
  // UI Accents
  iconBg: "bg-cyan-50 text-cyan-600",
  badgeBg: "bg-white/80 border border-cyan-200 text-cyan-700 shadow-sm backdrop-blur",
  
  // Custom Promos
  promoBundleBg: "bg-gradient-to-r from-[#101828] via-[#1679a8] to-[#45cbe8]",
  promoBogoBg: "bg-gradient-to-r from-[#45cbe8] via-[#1679a8] to-[#101828]",
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
      
      {/* Background Ambient Glows */}
      <div className={`absolute -left-40 top-20 h-[500px] w-[500px] rounded-full ${THEME.cyanGlow} pointer-events-none`} />
      <div className={`absolute right-[-100px] top-[40%] h-[600px] w-[600px] rounded-full ${THEME.blueGlow} pointer-events-none`} />

      <div className="pt-20 md:pt-32 pb-20 relative z-10">
        {/* --- Header Section --- */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left max-w-2xl">
              {!isMainSite && agency ? (
                <>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase mb-4 ${THEME.badgeBg}`}>
                    <Sparkles className="size-3" /> Learning Partner
                  </div>
                  <h1 className={`text-4xl md:text-6xl font-black mb-4 ${THEME.textMain} tracking-tight leading-tight`}>
                    Welcome to <br />
                    <span className={THEME.gradientText}>{agency.name}</span>
                  </h1>
                  <p className={`text-base md:text-lg font-medium ${THEME.textMuted}`}>
                    Your trusted learning partner. Start your journey today and build your future.
                  </p>
                </>
              ) : (
                <>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-wider uppercase mb-4 ${THEME.badgeBg}`}>
                    <Sparkles className="size-3" /> The Syllabus
                  </div>
                  <h1 className={`text-4xl md:text-6xl font-black mb-4 ${THEME.textMain} tracking-tight leading-tight`}>
                    Explore Our <br />
                    <span className={THEME.gradientText}>Premium Courses</span>
                  </h1>
                  <p className={`text-base md:text-lg font-medium ${THEME.textMuted}`}>
                    Transform your career with industry-leading skills, real projects, and expert guidance.
                  </p>
                </>
              )}
            </div>

            <div className="relative w-full md:w-[400px] group mt-6 md:mt-0">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className={`size-5 transition-colors ${THEME.accentText}`} />
              </div>
              <input
                type="text"
                placeholder="Search courses, mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-14 pr-6 py-4 rounded-2xl ${THEME.cardBg} focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-all font-medium text-slate-700 placeholder-slate-400 shadow-lg`}
              />
            </div>
          </div>
        </div>

        {/* --- Promotional Banners --- */}
        {!isMainSite && agency?.promoType === "bundle" && agency?.bundlePrice && (
          <div className="max-w-7xl mx-auto px-6 mb-16 animate-in fade-in slide-in-from-bottom-4">
            <div className={`${THEME.promoBundleBg} rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between text-white shadow-2xl relative overflow-hidden group border border-white/20`}>
              <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/0"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left mb-8 md:mb-0">
                <div className="flex items-center gap-2 mb-4 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                  <Star className="text-yellow-300 size-4" fill="currentColor" />
                  <span className="text-xs font-black uppercase tracking-widest text-yellow-300">Special Offer</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-md">All Courses Bundle</h2>
                <p className="text-cyan-50 font-medium text-base md:text-lg max-w-md leading-relaxed">
                  Get lifetime access to our entire library of premium courses at one unbelievable price.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-5 bg-white/10 p-8 rounded-3xl border border-white/30 backdrop-blur-md">
                <div className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-xl">₹{agency.bundlePrice}</div>
                <button 
                  onClick={() => handleBuyClick({ id: 'bundle', title: 'All Courses Bundle' }, agency.bundlePrice)}
                  className={`w-full px-8 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 ${THEME.buttonAccent}`}>
                  <BookOpen className="size-5" />
                  Get Full Bundle
                </button>
              </div>
            </div>
          </div>
        )}

        {!isMainSite && agency?.promoType === "bogo" && (
          <div className="max-w-7xl mx-auto px-6 mb-16 animate-in fade-in slide-in-from-bottom-4">
            <div className={`${THEME.promoBogoBg} rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between text-white shadow-2xl relative overflow-hidden group border border-white/20`}>
              <div className="absolute inset-0 bg-white/5 transition-opacity group-hover:bg-white/0"></div>
              
              <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left w-full">
                <div className="flex items-center gap-2 mb-5 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/30 self-center md:self-start">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-300"></span>
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-cyan-100">Mega Offer Active</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                  Buy ANY 1 Course <br className="hidden md:block"/>
                  <span className="text-cyan-300 drop-shadow-md border-b-4 border-cyan-300 pb-1 inline-block mt-2">Get ALL Courses FREE!</span>
                </h2>
                <p className="text-cyan-50 font-medium text-base md:text-lg max-w-2xl mt-4">
                  Purchase any single course below and automatically unlock lifetime access to our entire premium library at no extra cost.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- Demo Video Section --- */}
        <DemoVideoSection />

        {/* --- Courses Grid --- */}
        <div className="max-w-7xl mx-auto px-6 mt-12">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className={`size-12 animate-spin ${THEME.accentText}`} />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {filteredCourses.length > 0 ? (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCourses.map((course) => {
                    const dynamicPrice = getPrice(course.id, course.price);
                    return (
                      <CourseCard
                        key={course.id}
                        course={course}
                        isEnrolled={isEnrolled(course.id)}
                        onBuy={() => handleBuyClick(course, dynamicPrice)}
                        onPlay={() => handlePlayVideo(course.id)}
                        displayPrice={dynamicPrice}
                        isMainSite={isMainSite}
                      />
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-center py-24 rounded-4xl ${THEME.cardBg}`}>
                  <div className={`size-20 rounded-full flex items-center justify-center mx-auto mb-6 ${THEME.iconBg}`}>
                    <Search className="size-8" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${THEME.textMain}`}>No courses found</h3>
                  <p className={THEME.textMuted}>Try adjusting your search criteria.</p>
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

// --- COURSE CARD COMPONENT ---
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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`group flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-y-2 rounded-3xl ${THEME.cardBg} hover:shadow-[0_30px_60px_rgba(39,116,145,0.15)]`}
    >
      <Link
        to={course.isComingSoon ? "#" : courseUrl}
        onClick={(e) => course.isComingSoon && e.preventDefault()}
        className={`relative h-56 overflow-hidden shrink-0 block ${course.isComingSoon ? "cursor-default opacity-80 grayscale-[20%]" : "cursor-pointer"}`}
      >
        {course.isComingSoon && (
          <div className="absolute top-4 left-4 z-20 bg-amber-500 text-white text-[10px] uppercase font-black px-3 py-1.5 rounded-md shadow-sm drop-shadow-md tracking-wider">
            Coming Soon
          </div>
        )}
        <img
          src={imageUrl}
          alt={course.title}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101828]/80 via-[#101828]/20 to-transparent opacity-80" />
        
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
           <span className="text-[10px] font-black text-[#101828] bg-cyan-300 px-2.5 py-1 rounded-md uppercase tracking-wider shadow-lg">
            {category}
          </span>

        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <Link to={courseUrl} className="block mb-4">
          <h3 className={`text-xl font-bold line-clamp-2 min-h-[56px] leading-tight transition-colors ${THEME.textMain} group-hover:text-[#1679a8]`}>
            {course.title || "Untitled Course"}
          </h3>
        </Link>

        <div className={`flex items-center gap-3 mb-6 text-xs font-medium ${THEME.textMuted}`}>
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg">
            <Clock className="size-3.5 text-cyan-600" />
            {duration}
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg">
            <BookOpen className="size-3.5 text-cyan-600" />
            {lecturesCount}
          </div>
        </div>

        <div className="mt-auto pt-5 border-t border-slate-100/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${THEME.iconBg}`}>
                {instructor[0]}
              </div>
              <span className={`text-xs font-bold ${THEME.textMain}`}>
                {instructor}
              </span>
            </div>
            {!isMainSite && (
              <span className={`text-2xl font-black ${priceDisplay === "Free" ? "text-cyan-600" : THEME.textMain}`}>
                {priceDisplay}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to={courseUrl}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-center ${THEME.buttonSecondary} ${isMainSite && !isEnrolled ? "col-span-2" : ""}`}
            >
              Explore
            </Link>

            {isEnrolled ? (
              <button onClick={onPlay} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold ${THEME.buttonAccent}`}>
                <Play className="size-4" fill="currentColor" /> Watch Now
              </button>
            ) : (
              !isMainSite && (
                course.isComingSoon ? (
                  <button disabled className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed">
                    Coming Soon
                  </button>
                ) : (
                  <button onClick={onBuy} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold ${THEME.buttonPrimary}`}>
                    {priceDisplay === "Free" ? "Enroll Free" : "Buy Now"}
                  </button>
                )
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Courses;