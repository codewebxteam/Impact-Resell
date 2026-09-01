import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCourse } from "../../context/CourseContext";
import { useAgency } from "../../context/AgencyContext"; // [KEEP] Subdomain Logic untouched
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  Loader2,
  FileText,
  Download,
  Lock,
  PlayCircle,
  Sparkles,
} from "lucide-react";

// Components
import CourseHero from "../../components/course-details/CourseHero";
import Curriculum from "../../components/course-details/Curriculum";
import PricingCard from "../../components/course-details/PricingCard";
import AuthModal from "../../components/AuthModal";
import CourseVideoPlayer from "../../components/CourseVideoPlayer";

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
};

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isEnrolled } = useCourse();
  const { loading: agencyLoading, isMainSite, agency } = useAgency(); // [KEEP] Subdomain Logic

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeVideoPlaylist, setActiveVideoPlaylist] = useState(null);
  const [startIndex, setStartIndex] = useState(0);

  const userHasAccess = course ? isEnrolled(course.id) : false;

  // Admin controlled Demo Videos logic
  const demoVideos = useMemo(() => {
    if (course?.demoVideos && Array.isArray(course.demoVideos)) {
      return course.demoVideos;
    }
    return [];
  }, [course?.demoVideos]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const docRef = doc(db, "courseVideos", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          let data = docSnap.data();

          // --- ACCESS CONTROL CHECK ---
          const coursePartnerId = data.partnerId;
          const isOwner = currentUser?.uid && coursePartnerId === currentUser.uid;
          const allowed = !coursePartnerId || coursePartnerId === "admin" || isOwner || (!isMainSite && coursePartnerId === agency?.id);

          if (!allowed) {
            setError("Course not found");
            setLoading(false);
            return;
          }

          // --- PARTNER DEMO OVERRIDE LOGIC ---
          let overridesToApply = null;

          if (!isMainSite && agency?.courseDemoOverrides?.[docSnap.id]) {
            // Live on subdomain
            overridesToApply = agency.courseDemoOverrides[docSnap.id];
          } else if (isMainSite && currentUser) {
             // Preview for Partner on Main Site
             const userRef = doc(db, "users", currentUser.uid);
             const userSnap = await getDoc(userRef);
             
             if (userSnap.exists()) {
                if (userSnap.data().role === "partner") {
                   const agencyRef = doc(db, "agencies", currentUser.uid);
                   const agencySnap = await getDoc(agencyRef);
                   
                   if (agencySnap.exists()) {
                      if (agencySnap.data().courseDemoOverrides?.[docSnap.id]) {
                         overridesToApply = agencySnap.data().courseDemoOverrides[docSnap.id];
                      }
                   }
                }
             }
          }

          if (overridesToApply) {
            if (overridesToApply.mainVideoId !== undefined && overridesToApply.mainVideoId !== "") {
              data.mainVideoId = overridesToApply.mainVideoId;
            }
            if (overridesToApply.demoVideos !== undefined && overridesToApply.demoVideos.length > 0) {
              // Combine Admin Demos and Partner Demos so all added videos show
              data.demoVideos = [...(data.demoVideos || []), ...overridesToApply.demoVideos];
            }
          }

          setCourse({
            id: docSnap.id,
            courseId: docSnap.id,
            ...data,
            instructor: data.instructor || "Mentor",
            category: data.category || "General",
            image:
              data.image ||
              (data.videoId
                ? `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`
                : "https://placehold.co/800x400"),
            syllabusContent: data.syllabus || "No syllabus provided.",
            driveLink: data.driveLink || "",
            paymentLink: data.paymentLink || "",
            mainVideoId: data.mainVideoId || null,
          });
        } else {
          setError("Course not found");
        }
      } catch (err) {
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id, isMainSite, agency, currentUser]);

  const handleEnroll = () => {
    if (!course?.paymentLink) return alert("Payment link not configured.");
    if (!currentUser) {
      localStorage.setItem("pendingCheckoutCourse", JSON.stringify(course));
      setIsAuthOpen(true);
      return;
    }
    window.location.href = course.paymentLink;
  };

  const openPlayer = (playlist, index = 0) => {
    setActiveVideoPlaylist(playlist);
    setStartIndex(index);
  };

  const handleClosePlayer = () => {
    setActiveVideoPlaylist(null);
    window.location.reload();
  };

  // UI loading check with Subdomain Logic
  if (loading || agencyLoading)
    return (
      <div className={`h-screen w-screen flex items-center justify-center ${THEME.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          <p className={`${THEME.textMain} font-bold animate-pulse`}>
            {!isMainSite && agency
              ? `Loading ${agency.name}...`
              : "Initializing Academy..."}
          </p>
        </div>
      </div>
    );

  if (!course)
    return (
      <div className={`min-h-screen flex items-center justify-center ${THEME.bg} ${THEME.textMain}`}>
        <p className="font-bold text-lg">Course data is unavailable.</p>
      </div>
    );

  return (
    <div className={`min-h-screen relative overflow-hidden font-sans pb-20 ${THEME.bg}`}>
      
      {/* Background Ambient Glows */}
      <div className={`absolute -left-40 top-40 h-[500px] w-[500px] rounded-full ${THEME.cyanGlow} pointer-events-none`} />
      <div className={`absolute right-[-100px] top-[20%] h-[600px] w-[600px] rounded-full ${THEME.blueGlow} pointer-events-none`} />

      <div className="relative z-10">
        <CourseHero course={course} />

        {/* Mobile Pricing Sticky */}
        <div className="px-6 lg:hidden relative z-20 -mt-10 mb-8">
          <PricingCard
            course={course}
            onEnroll={handleEnroll}
            isEnrolled={userHasAccess}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:mt-12">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-12">
              
              {/* 1. Introduction Video */}
              {course?.mainVideoId && (
                <div className={`rounded-[32px] overflow-hidden transition-all hover:shadow-[0_30px_60px_rgba(39,116,145,0.15)] ${THEME.cardBg}`}>
                  <div className="p-6 border-b border-slate-100/50 flex items-center gap-3">
                    <PlayCircle className="text-cyan-500" size={24} />
                    <h2 className={`text-xl font-bold ${THEME.textMain}`}>
                      Course Introduction
                    </h2>
                  </div>
                  <div
                    className="relative aspect-video bg-slate-900 group cursor-pointer"
                    onClick={() =>
                      openPlayer([
                        {
                          videoId: course.mainVideoId,
                          title: "Course Introduction",
                        },
                      ])
                    }
                  >
                    <img
                      src={`https://img.youtube.com/vi/${course.mainVideoId}/maxresdefault.jpg`}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-500"
                      alt="Intro"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                        <PlayCircle className="text-white size-10" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Study Material Section */}
              {course?.driveLink && (
                <div className={`rounded-[32px] p-8 transition-all hover:shadow-[0_30px_60px_rgba(39,116,145,0.15)] ${THEME.cardBg}`}>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 ${THEME.iconBg}`}>
                        <FileText size={28} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${THEME.textMain}`}>
                          Study Material & Notes
                        </h2>
                        <p className={`text-sm ${THEME.textMuted}`}>
                          Premium resources included with enrollment
                        </p>
                      </div>
                    </div>
                    <div className="w-full md:w-auto">
                      {userHasAccess ? (
                        <a
                          href={course.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold ${THEME.buttonPrimary}`}
                        >
                          <Download size={18} /> Download Now
                        </a>
                      ) : (
                        <button
                          disabled
                          className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 text-slate-400 rounded-xl font-bold border border-slate-200 cursor-not-allowed w-full"
                        >
                          <Lock size={18} /> Enroll to Access
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Demo Lessons Grid */}
              {demoVideos.length > 0 && (
                <div className="space-y-6">
                  <h2 className={`text-2xl font-bold px-2 ${THEME.textMain}`}>
                    Free Starter Lessons
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {demoVideos.map((video, idx) => (
                      <div
                        key={idx}
                        className={`rounded-[24px] overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(39,116,145,0.12)] group cursor-pointer ${THEME.cardBg}`}
                        onClick={() => openPlayer(demoVideos, idx)}
                      >
                        <div className="aspect-video relative bg-slate-900">
                          <img
                            src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-all duration-500"
                            alt={video.title}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="size-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                              <PlayCircle className="text-white size-8" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                        <div className="p-5 border-t border-slate-100/50">
                          <h3 className={`font-bold text-sm line-clamp-1 ${THEME.textMain}`}>
                            {video.title}
                          </h3>
                          <p className={`text-[10px] mt-1 uppercase font-bold ${THEME.accentText}`}>
                            Lesson {idx + 1}
                          </p>
                        </div>
                      </div>
                    ))}
                    {!userHasAccess && (
                      <div
                        onClick={handleEnroll}
                        className="rounded-[24px] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl bg-gradient-to-br from-[#101828] to-[#1679a8] border border-[#1679a8]/50 group"
                      >
                        <div className="size-14 bg-cyan-400/20 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                          <Sparkles className="text-cyan-300 size-7" />
                        </div>
                        <h3 className="text-white font-bold text-xl mb-1">
                          Unlock Full Access
                        </h3>
                        <p className="text-cyan-100/70 text-xs mb-4">Get access to all premium lessons</p>
                        <button className={`px-8 py-3 rounded-xl font-bold text-sm ${THEME.buttonAccent}`}>
                          Enroll Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Curriculum course={course} syllabus={course.syllabusContent} />
            </div>

            {/* Desktop Pricing Sticky */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24">
                <PricingCard
                  course={course}
                  onEnroll={handleEnroll}
                  isEnrolled={userHasAccess}
                />
              </div>
            </div>
          </div>
        </div>

        {activeVideoPlaylist && (
          <CourseVideoPlayer
            course={course}
            playlist={activeVideoPlaylist}
            initialIndex={startIndex}
            onClose={handleClosePlayer}
          />
        )}

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          defaultMode="login"
        />
      </div>
    </div>
  );
};

export default CourseDetails;
