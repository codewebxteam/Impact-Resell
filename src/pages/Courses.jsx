import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, BookOpen, Clock, Play, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCourse } from "../context/CourseContext";
import { useAgency } from "../context/AgencyContext"; // [ADDED] Import Agency Context
import AuthModal from "../components/AuthModal";
import FAQSection from "../components/FAQSection";
import CourseVideoPlayer from "../components/CourseVideoPlayer";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

const Courses = () => {
  const { currentUser } = useAuth();
  const { enrollCourse, isEnrolled, getEnrolledCourse } = useCourse();
  const { agency, isMainSite, getPrice } = useAgency(); // [ADDED] Get Agency Data
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
        const courseList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
  }, []);

  const handlePlayVideo = (courseId) => {
    const enrolledCourse = getEnrolledCourse(courseId);
    if (enrolledCourse) {
      setPlayingCourse(enrolledCourse);
      setShowVideoPlayer(true);
    }
  };

  // --- [UPDATED] Handle Buy/Enroll Logic ---
  const handleBuyClick = async (course, rawPrice) => {
    // 1. Check Login First (Global Rule)
    if (!currentUser) {
      setIsAuthOpen(true);
      return; // Stop here if not logged in
    }

    const priceDisplay =
      rawPrice === "Free" || rawPrice === 0 || rawPrice === "0"
        ? "Free"
        : `₹${rawPrice}`;

    // 2. Partner Site Logic (WhatsApp Redirect with Details)
    if (!isMainSite && priceDisplay !== "Free") {
      if (!agency?.whatsapp) {
        return alert(
          "Partner contact number not found. Please contact support."
        );
      }

      // Prepare Student Details (User is definitely logged in here)
      const studentName = currentUser?.displayName || "Student";
      const studentEmail = currentUser?.email || "Email Not Provided";

      // Construct "Sundar" Message 📝
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

      const whatsappUrl = `https://wa.me/${agency.whatsapp.replace(
        /\D/g,
        ""
      )}?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank");
      return;
    }

    // 3. Main Site / Free Course Logic (Direct Enrollment)
    try {
      await enrollCourse(course);
      navigate("/dashboard/my-courses");
    } catch (error) {
      console.error("Enrollment error:", error);
      alert(error.message);
    }
  };

  // Filter Logic
  const filteredCourses = courses.filter((course) => {
    const title = course.title || "";
    const instructor = course.instructor || "";

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans">
      <div className="pt-20 md:pt-32 pb-20">
        {/* --- Header Section --- */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              {/* Dynamic Header Logic */}
              {!isMainSite && agency ? (
                <>
                  <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-2">
                    Welcome to{" "}
                    <span className="text-indigo-600">{agency.name}</span>
                  </h1>
                  <p className="text-slate-500">
                    Your trusted learning partner. Start your journey today.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-2">
                    Explore Our{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5edff4] to-[#0891b2]">
                      Courses
                    </span>
                  </h1>
                  <p className="text-slate-500">
                    Transform your career with industry-leading skills.
                  </p>
                </>
              )}
            </div>

            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="size-5 text-slate-400 group-focus-within:text-[#5edff4] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search courses, mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 bg-white shadow-sm focus:outline-none focus:border-[#5edff4] focus:ring-1 focus:ring-[#5edff4] transition-all"
              />
            </div>
          </div>
        </div>

        {/* --- Promotional Banners --- */}
        {!isMainSite && agency?.promoType === "bundle" && agency?.bundlePrice && (
          <div className="max-w-7xl mx-auto px-6 mb-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/0"></div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left mb-8 md:mb-0">
                <div className="flex items-center gap-2 mb-3 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                  <Star className="text-yellow-300 size-4" fill="currentColor" />
                  <span className="text-sm font-black uppercase tracking-widest text-yellow-300">Special Offer</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/90">All Courses Bundle</h2>
                <p className="text-indigo-100 font-medium text-base md:text-lg max-w-md leading-relaxed">
                  Get lifetime access to our entire library of premium courses at one unbelievable price.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-4 bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-sm">
                <div className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-lg">₹{agency.bundlePrice}</div>
                <button 
                  onClick={() => handleBuyClick({ id: 'bundle', title: 'All Courses Bundle' }, agency.bundlePrice)}
                  className="w-full px-8 py-4 bg-white text-indigo-600 hover:text-indigo-700 rounded-full font-black text-lg shadow-[0_8px_30px_rgb(255,255,255,0.2)] hover:shadow-[0_8px_40px_rgb(255,255,255,0.3)] hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <BookOpen className="size-5" />
                  Get Full Bundle
                </button>
              </div>
            </div>
          </div>
        )}

        {!isMainSite && agency?.promoType === "bogo" && (
          <div className="max-w-7xl mx-auto px-6 mb-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/0"></div>
              
              <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left mb-6 md:mb-0 w-full">
                <div className="flex items-center gap-2 mb-4 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 self-center md:self-start">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
                  </span>
                  <span className="text-sm font-black uppercase tracking-widest text-yellow-300">Mega Offer Active</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-3">Buy ANY 1 Course <span className="text-yellow-300 drop-shadow-md border-b-4 border-yellow-300 pb-1 inline-block mt-2">Get ALL Courses FREE!</span></h2>
                <p className="text-emerald-100 font-bold text-lg max-w-2xl mt-4">
                  Purchase any single course below and automatically unlock lifetime access to our entire premium library at no extra cost.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- Courses Grid --- */}
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="size-10 text-[#5edff4] animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {filteredCourses.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filteredCourses.map((course) => {
                    // [IMPORTANT] Get Price Here to pass to both Display & Handler
                    const dynamicPrice = getPrice(course.id, course.price);

                    return (
                      <CourseCard
                        key={course.id}
                        course={course}
                        isEnrolled={isEnrolled(course.id)}
                        // Pass dynamicPrice to handleBuyClick
                        onBuy={() => handleBuyClick(course, dynamicPrice)}
                        onPlay={() => handlePlayVideo(course.id)}
                        displayPrice={dynamicPrice}
                        isMainSite={isMainSite}
                      />
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="size-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    No courses found
                  </h3>
                  <p className="text-slate-500">Try adjusting your search.</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <FAQSection />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="login"
      />

      {showVideoPlayer && playingCourse && (
        <CourseVideoPlayer
          course={playingCourse}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}
    </div>
  );
};

// --- COURSE CARD COMPONENT ---
const CourseCard = ({ course, isEnrolled, onBuy, onPlay, displayPrice, isMainSite }) => {
  const imageUrl =
    course.image ||
    (course.videoId
      ? `https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg`
      : "https://placehold.co/600x400?text=No+Image");

  // [LOGIC] Use Custom Price if available, otherwise Original Price
  const finalPrice =
    displayPrice !== undefined && displayPrice !== null
      ? displayPrice
      : course.price;

  const priceDisplay =
    finalPrice === "Free" || finalPrice === 0 || finalPrice === "0"
      ? "Free"
      : `₹${finalPrice}`;
  const originalPrice = course.originalPrice
    ? `₹${course.originalPrice}`
    : null;
  const rating = course.rating || 4.5;
  const reviews = course.reviews || 0;
  const instructor = course.instructor || "Mentor";
  const duration = course.duration || "Flexible";
  const category = course.category || "General";

  // Lectures count logic
  let lecturesCount = "1 Module";
  if (course.lectures && Array.isArray(course.lectures)) {
    lecturesCount = `${course.lectures.length} Lectures`;
  } else if (
    typeof course.lectures === "string" ||
    typeof course.lectures === "number"
  ) {
    lecturesCount = course.lectures;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 group hover:shadow-2xl hover:shadow-[#5edff4]/10 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
    >
      <Link
        to={course.isComingSoon ? "#" : `/courses/${course.id}`}
        onClick={(e) => course.isComingSoon && e.preventDefault()}
        className={`relative h-48 overflow-hidden shrink-0 block ${course.isComingSoon ? "cursor-default opacity-80 grayscale-[20%]" : "cursor-pointer"}`}
      >
        {course.isComingSoon && (
          <div className="absolute top-4 left-4 z-20 bg-amber-500 text-white text-[10px] uppercase font-black px-3 py-1.5 rounded-md shadow-sm drop-shadow-md tracking-wider">
            Coming Soon
          </div>
        )}
        <img
          src={imageUrl}
          alt={course.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60" />
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#0891b2] bg-[#f0fdff] px-2 py-1 rounded-md uppercase tracking-wider">
            {category}
          </span>
          <div className="flex items-center gap-1">
            <Star className="size-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-slate-700">{rating}</span>
            <span className="text-xs text-slate-400">({reviews})</span>
          </div>
        </div>

        <Link to={`/courses/${course.id}`} className="block">
          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 min-h-14 leading-tight group-hover:text-[#0891b2] transition-colors">
            {course.title || "Untitled Course"}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {duration}
          </div>
          <div className="size-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1">
            <BookOpen className="size-3.5" />
            {lecturesCount}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <div className="size-8 rounded-full bg-slate-100 overflow-hidden border border-white shadow-sm flex items-center justify-center font-bold text-xs text-slate-500">
            {instructor[0]}
          </div>
          <span className="text-xs font-medium text-slate-600">
            By {instructor}
          </span>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3 min-h-[28px]">
            <div className="flex flex-col">
              {!isMainSite && (
                <>
                  {/* PRICE DISPLAY */}
                  <span
                    className={`text-xl font-bold ${
                      priceDisplay === "Free" ? "text-green-600" : "text-slate-900"
                    }`}
                  >
                    {priceDisplay}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to={`/courses/${course.id}`}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 hover:text-slate-900 transition-all text-center ${isMainSite && !isEnrolled ? "col-span-2" : ""}`}
            >
              Explore
            </Link>

            {/* Buy / Watch buttons */}
            {isEnrolled ? (
              <button
                onClick={onPlay}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5edff4] text-slate-900 text-xs font-bold hover:bg-[#4ecee4] transition-all shadow-lg cursor-pointer"
              >
                <Play className="size-4" /> Watch Now
              </button>
            ) : (
              !isMainSite && (
                course.isComingSoon ? (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 text-amber-500 border border-amber-200 text-xs font-bold shadow-none cursor-not-allowed col-span-1"
                  >
                    Coming Soon
                  </button>
                ) : (
                  <button
                    onClick={onBuy}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-lg cursor-pointer
                      ${
                        priceDisplay === "Free"
                          ? "bg-green-600 hover:bg-green-500 shadow-green-600/20"
                          : "bg-slate-900 hover:bg-[#5edff4] hover:text-slate-900 shadow-slate-900/10 hover:shadow-[#5edff4]/30"
                      }`}
                  >
                    {priceDisplay === "Free" ? "Enroll" : "Buy Now"}
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
