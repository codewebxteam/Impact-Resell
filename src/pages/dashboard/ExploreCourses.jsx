import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Star, CheckCircle } from "lucide-react"; // [UPDATED] Added CheckCircle
import { Link } from "react-router-dom";
import { useCourse } from "../../context/CourseContext";
import { useAgency } from "../../context/AgencyContext"; // [ADDED] Import Agency Context
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

const ExploreCourses = () => {
  const { isEnrolled } = useCourse();
  const [searchQuery, setSearchQuery] = useState("");
  const [liveCourses, setLiveCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isMainSite, agency } = useAgency();

  // --- Fetch Courses from Firebase ---
  useEffect(() => {
    const fetchLiveCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courseVideos"));
        let courses = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Filter based on Main Site vs Subdomain
        if (isMainSite) {
           courses = courses.filter(c => !c.partnerId || c.partnerId === "admin");
        } else {
           courses = courses.filter(c => !c.partnerId || c.partnerId === "admin" || c.partnerId === agency?.id);
        }

        setLiveCourses(courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveCourses();
  }, [isMainSite, agency?.id]);

  // [UPDATED] Filter: Now shows Enrolled courses too (Only filters by search)
  const availableCourses = liveCourses.filter((course) => {
    // Removed: const notEnrolled = !isEnrolled(course.id);
    const matchesSearch = (course.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Explore New Skills
        </h1>
        <p className="text-slate-500 text-lg">
          Discover premium courses curated for your career growth.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-3.5 size-5 text-slate-400" />
          <input
            type="text"
            placeholder="What do you want to learn?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 shadow-lg shadow-slate-200/20 outline-none focus:border-[#5edff4] focus:ring-2 focus:ring-[#5edff4]/20 transition-all"
          />
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          Loading courses...
        </div>
      ) : (
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {availableCourses.length > 0 ? (
              availableCourses.map((course) => (
                <ExploreCard
                  key={course.id}
                  course={course}
                  isUserEnrolled={isEnrolled(course.id)} // [ADDED] Pass Enrollment Status
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-500">
                  No courses found matching your search.
                </p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

// Specialized Card Component
const ExploreCard = ({ course, isUserEnrolled }) => {
  // [ADDED] Prop
  const { getPrice } = useAgency(); // [ADDED] Get Helper

  // [LOGIC] Calculate Dynamic Price
  const finalPrice = getPrice(course.id, course.price);
  const isFree =
    String(finalPrice).toLowerCase() === "free" ||
    finalPrice === 0 ||
    finalPrice === "0";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8 }}
      className={`bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group ${
        isUserEnrolled
          ? "border-emerald-200 ring-1 ring-emerald-100"
          : "border-slate-100"
      }`}
    >
      {/* Image */}
      <div className={`relative h-48 overflow-hidden ${course.isComingSoon ? "grayscale-[20%] opacity-80" : ""}`}>
        {course.isComingSoon && (
          <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-lg text-[10px] uppercase font-black shadow-sm tracking-wider z-20">
            Coming Soon
          </div>
        )}
        <img
          src={
            course.image ||
            course.thumbnail ||
            `https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg`
          }
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* [ADDED] Enrolled Badge on Top */}
        {isUserEnrolled && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg z-10">
            <CheckCircle className="size-3" /> Enrolled
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <span className="text-[10px] font-bold text-[#0891b2] uppercase tracking-wider">
            {course.category || "General"}
          </span>
          <h3 className="text-lg font-bold text-slate-900 leading-tight mt-1 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-xs text-slate-500 mt-2 line-clamp-2">
            By {course.instructor || "Alife Academy"}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
          <div>
            {/* [UPDATED] Hide Price if Enrolled */}
            {isUserEnrolled ? (
              <span className="block text-lg font-bold text-emerald-600">
                Purchased
              </span>
            ) : (
                <span
                  className={`block text-lg font-bold ${
                    isFree ? "text-green-600" : "text-slate-900"
                  }`}
                >
                  {isFree ? "Free" : `₹${finalPrice}`}
                </span>
            )}
          </div>

          <Link
            to={course.isComingSoon ? "#" : `/courses/${course.id}`}
            onClick={(e) => course.isComingSoon && e.preventDefault()}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 ${
              isUserEnrolled
                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:shadow-emerald-100"
                : course.isComingSoon
                ? "bg-amber-50 text-amber-500 border border-amber-200 shadow-none cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-[#5edff4] hover:text-slate-900 hover:shadow-[#5edff4]/20"
            }`}
          >
            {isUserEnrolled ? (
              <>View Course</>
            ) : course.isComingSoon ? (
              <>Coming Soon</>
            ) : (
              <>
                <ShoppingCart className="size-4" />{" "}
                {isFree ? "Enroll" : "Buy Now"}
              </>
            )}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ExploreCourses;
