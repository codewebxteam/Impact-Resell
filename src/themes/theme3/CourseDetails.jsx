/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  GraduationCap,
  ShieldCheck,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

// Components
import CourseHero from "../../components/course-details/CourseHero";
import Curriculum from "../../components/course-details/Curriculum";
import PricingCard from "../../components/course-details/PricingCard";
import AuthModal from "../../components/AuthModal";
import CourseVideoPlayer from "../../components/CourseVideoPlayer";

// ==========================================
// THEME 3 CONFIGURATION (Aesthetic: #fedc5c & Slate-950)
// ==========================================
const THEME = {
  bg: "bg-slate-50",
  textMain: "text-slate-950",
  textMuted: "text-slate-600",
  accentText: "text-amber-600",
  
  cardOuter: "bg-white p-3 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_25px_50px_rgba(254,220,92,0.2)] transition-all duration-500",
  cardInner: "bg-slate-50/70 w-full h-full rounded-[2rem] p-6 md:p-8 flex flex-col",
  
  buttonPrimary: "bg-[#fedc5c] text-slate-950 font-black shadow-lg shadow-amber-400/30 hover:bg-amber-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
  buttonOutline: "bg-white border-2 border-slate-200 text-slate-900 hover:border-amber-400 hover:bg-amber-50 transition-all font-black shadow-xs",
  
  iconBg: "bg-[#fedc5c] text-slate-950",
  badgeBg: "bg-white border border-amber-400/40 text-slate-950 shadow-sm backdrop-blur font-black",
};

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isEnrolled, enrollCourse } = useCourse();
  const { loading: agencyLoading, isMainSite, agency, getPrice } = useAgency();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeVideoPlaylist, setActiveVideoPlaylist] = useState(null);
  const [startIndex, setStartIndex] = useState(0);

  const userHasAccess = course ? isEnrolled(course.id) : false;

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

          // Access control check
          const coursePartnerId = data.partnerId;
          const isOwner = currentUser?.uid && coursePartnerId === currentUser.uid;
          const allowed = !coursePartnerId || coursePartnerId === "admin" || isOwner || (!isMainSite && coursePartnerId === agency?.id);

          if (!allowed) {
            setError("Course not found");
            setLoading(false);
            return;
          }

          // Partner demo overrides logic
          let overridesToApply = null;

          if (!isMainSite && agency?.courseDemoOverrides?.[docSnap.id]) {
            overridesToApply = agency.courseDemoOverrides[docSnap.id];
          } else if (isMainSite && currentUser) {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && userSnap.data().role === "partner") {
              const agencyRef = doc(db, "agencies", currentUser.uid);
              const agencySnap = await getDoc(agencyRef);
              if (agencySnap.exists() && agencySnap.data().courseDemoOverrides?.[docSnap.id]) {
                overridesToApply = agencySnap.data().courseDemoOverrides[docSnap.id];
              }
            }
          }

          if (overridesToApply) {
            if (overridesToApply.mainVideoId !== undefined && overridesToApply.mainVideoId !== "") {
              data.mainVideoId = overridesToApply.mainVideoId;
            }
            if (overridesToApply.demoVideos !== undefined && overridesToApply.demoVideos.length > 0) {
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

  const handleEnroll = async () => {
    const finalPrice = course?.price !== undefined && getPrice ? getPrice(course.id, course.price) : (course?.price || 0);
    const partnerCoursePaymentLink = agency?.customPaymentLinks?.[course.id];
    const finalPaymentLink = partnerCoursePaymentLink || course?.paymentLink;

    if (finalPaymentLink) {
      if (!currentUser) {
        localStorage.setItem("pendingCheckoutCourse", JSON.stringify({ ...course, finalPrice }));
        setIsAuthOpen(true);
        return;
      }
      window.open(finalPaymentLink, "_blank");
      return;
    }

    if (!isMainSite && agency?.whatsapp) {
      if (!currentUser) {
        localStorage.setItem("pendingCheckoutCourse", JSON.stringify({ ...course, finalPrice }));
        setIsAuthOpen(true);
        return;
      }
      const cleanPhone = agency.whatsapp.replace(/[^0-9]/g, "");
      const promoText = agency.isBogoActive
        ? "\n🎁 Offer: Buy 1 Get All Free (BOGO Applied)"
        : agency.bundleDiscountActive
        ? "\n🎁 Offer: All Courses Bundle Special"
        : "";
      const text = `Hello ${agency.name},\n\nI want to enroll in the course:\n📚 *${course.title}*\n🆔 Course ID: ${course.id}\n💰 Price: ₹${finalPrice}${promoText}\n\n*My Details:*\n👤 Name: ${currentUser?.displayName || "Student"}\n📧 Email: ${currentUser?.email}\n\nPlease share the payment details/QR code so I can complete my enrollment.`;
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
      return;
    }

    // Direct enrollment if on main site or free
    if (!currentUser) {
      localStorage.setItem("pendingCheckoutCourse", JSON.stringify({ ...course, finalPrice }));
      setIsAuthOpen(true);
      return;
    }

    try {
      await enrollCourse(course);
      navigate("/dashboard");
    } catch (e) {
      alert("Enrollment failed: " + e.message);
    }
  };

  const openPlayer = (playlist, index = 0) => {
    setActiveVideoPlaylist(playlist);
    setStartIndex(index);
  };

  const handleClosePlayer = () => {
    setActiveVideoPlaylist(null);
    window.location.reload();
  };

  if (loading || agencyLoading) {
    return (
      <div className={`h-screen w-screen flex items-center justify-center ${THEME.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin size-12 text-amber-500" />
          <p className={`${THEME.textMain} font-black animate-pulse text-lg`}>
            {!isMainSite && agency ? `Loading ${agency.name}...` : "Initializing Academy..."}
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${THEME.bg}`}>
        <div className={THEME.cardOuter}>
          <div className={`${THEME.cardInner} text-center items-center justify-center p-12`}>
            <p className={`font-black text-2xl ${THEME.textMain}`}>Course data is unavailable.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden font-sans pb-20 ${THEME.bg}`}>
      
      {/* Background Subtle Amber Glows */}
      <div className="absolute top-20 -left-40 h-[500px] w-[500px] rounded-full bg-amber-300/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] -right-40 h-[600px] w-[600px] rounded-full bg-yellow-400/10 blur-[140px] pointer-events-none" />

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

        <div className="max-w-7xl mx-auto px-6 lg:mt-16">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: Main Content */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* 1. Introduction Video */}
              {course?.mainVideoId && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={THEME.cardOuter}>
                  <div className={`${THEME.cardInner} p-4 md:p-5`}>
                    <div className="flex items-center gap-3 mb-4 px-2">
                      <div className={`size-12 rounded-xl flex items-center justify-center shadow-sm ${THEME.iconBg}`}>
                        <PlayCircle className="size-6 stroke-[2.5]" />
                      </div>
                      <h2 className={`text-2xl font-black tracking-tight ${THEME.textMain}`}>
                        Course Introduction
                      </h2>
                    </div>
                    
                    <div
                      className="relative aspect-video rounded-[1.5rem] bg-slate-900 group cursor-pointer overflow-hidden shadow-inner border border-slate-200"
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
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-60 transition-opacity duration-700 group-hover:scale-105"
                        alt="Intro"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-20 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                          <PlayCircle className="text-amber-500 size-10 ml-1 stroke-[2.5]" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. Study Material Section */}
              {course?.driveLink && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={THEME.cardOuter}>
                  <div className={`${THEME.cardInner} flex-col md:flex-row items-center justify-between gap-6`}>
                    <div className="flex items-center gap-5 w-full md:w-auto text-center md:text-left">
                      <div className={`size-16 rounded-2xl flex items-center justify-center shrink-0 shadow-md mx-auto md:mx-0 ${THEME.iconBg}`}>
                        <FileText size={32} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h2 className={`text-xl font-black ${THEME.textMain}`}>
                          Study Material & Resources
                        </h2>
                        <p className={`text-sm font-bold mt-1 ${THEME.textMuted}`}>
                          Ready prompts, scripts & animation templates included
                        </p>
                      </div>
                    </div>
                    <div className="w-full md:w-auto shrink-0">
                      {userHasAccess ? (
                        <a
                          href={course.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-sm ${THEME.buttonPrimary} w-full`}
                        >
                          <Download size={18} /> Download Now
                        </a>
                      ) : (
                        <button
                          disabled
                          className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-200 text-slate-500 rounded-full font-bold text-sm cursor-not-allowed w-full shadow-inner"
                        >
                          <Lock size={18} /> Enroll to Access
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3. Demo Lessons Grid */}
              {demoVideos.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6 pt-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className={`size-10 rounded-xl flex items-center justify-center ${THEME.iconBg}`}>
                      <PlayCircle className="size-5 stroke-[2.5]" />
                    </div>
                    <h2 className={`text-3xl font-black tracking-tight ${THEME.textMain}`}>
                      Free Starter Lessons
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {demoVideos.map((video, idx) => (
                      <div key={idx} className={THEME.cardOuter}>
                        <div
                          className="w-full h-full bg-slate-50 rounded-[2rem] p-2 pb-0 flex flex-col group cursor-pointer overflow-hidden"
                          onClick={() => openPlayer(demoVideos, idx)}
                        >
                          <div className="aspect-video relative rounded-[1.5rem] bg-slate-900 overflow-hidden shadow-inner">
                            <img
                              src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                              className="w-full h-full object-cover opacity-90 group-hover:opacity-70 transition-all duration-500 group-hover:scale-105"
                              alt={video.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-60" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="size-14 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <PlayCircle className="text-amber-500 size-7 ml-0.5 stroke-[2.5]" fill="currentColor" />
                              </div>
                            </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-center">
                            <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${THEME.accentText}`}>
                              Lesson {idx + 1}
                            </p>
                            <h3 className={`font-black text-sm line-clamp-2 leading-tight ${THEME.textMain}`}>
                              {video.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Unlock Access CTA Card */}
                    {!userHasAccess && (
                      <div className={THEME.cardOuter}>
                        <div
                          onClick={handleEnroll}
                          className="w-full h-full bg-slate-950 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 group relative overflow-hidden"
                        >
                          <div className="size-16 bg-white/10 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/10">
                            <Sparkles className="text-amber-400 size-8 fill-amber-400" />
                          </div>
                          <h3 className="text-white font-black text-xl mb-2 tracking-tight">
                            Unlock Full Access
                          </h3>
                          <p className="text-slate-400 font-bold text-xs mb-6 max-w-[220px]">
                            Enroll now to access all lessons, project prompts, and resources.
                          </p>
                          <button className={`px-8 py-3.5 rounded-full font-black text-sm w-full flex items-center justify-center gap-2 ${THEME.buttonPrimary}`}>
                            Enroll Now <ArrowRight className="size-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Curriculum Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={THEME.cardOuter}>
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  <Curriculum course={course} syllabus={course.syllabusContent} />
                </div>
              </motion.div>

            </div>

            {/* RIGHT COLUMN: Desktop Pricing Sticky */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-28 z-20">
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
