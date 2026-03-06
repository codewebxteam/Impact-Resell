import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCourse } from "../context/CourseContext";
import { useAgency } from "../context/AgencyContext"; // [KEEP] Subdomain Logic untouched
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import {
  Loader2,
  FileText,
  Download,
  Lock,
  PlayCircle,
  Sparkles,
} from "lucide-react";

// Components
import CourseHero from "../components/course-details/CourseHero";
import Curriculum from "../components/course-details/Curriculum";
import PricingCard from "../components/course-details/PricingCard";
import AuthModal from "../components/AuthModal";
import CourseVideoPlayer from "../components/CourseVideoPlayer";

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
          const data = docSnap.data();
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
  }, [id]);

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

  // UI loading check with Subdomain Logic
  if (loading || agencyLoading)
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5edff4]"></div>
          <p className="text-slate-400 font-bold animate-pulse">
            {!isMainSite && agency
              ? `Loading ${agency.name}...`
              : "Initializing Academy..."}
          </p>
        </div>
      </div>
    );

  if (!course)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Course data is unavailable.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
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
              <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
                <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                  <PlayCircle className="text-[#0891b2]" size={24} />
                  <h2 className="text-xl font-bold text-slate-900">
                    Course Introduction
                  </h2>
                </div>
                <div
                  className="relative aspect-video bg-black group cursor-pointer"
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
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                    alt="Intro"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                      <PlayCircle className="text-white size-12" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Study Material Section */}
            {course?.driveLink && (
              <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="size-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Study Material & Notes
                      </h2>
                      <p className="text-sm text-slate-500">
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
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100"
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
                <h2 className="text-2xl font-bold text-slate-900 px-2">
                  Free Starter Lessons
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {demoVideos.map((video, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm group cursor-pointer"
                      onClick={() => openPlayer(demoVideos, idx)}
                    >
                      <div className="aspect-video relative bg-slate-900">
                        <img
                          src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-all"
                          alt={video.title}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayCircle className="text-white size-12 opacity-80 group-hover:scale-110 transition-transform" />
                        </div>
                      </div>
                      <div className="p-4 bg-white border-t border-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-1">
                          {video.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                          Lesson {idx + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                  {!userHasAccess && (
                    <div
                      onClick={handleEnroll}
                      className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[24px] p-6 flex flex-col items-center justify-center text-center border border-slate-700 cursor-pointer hover:scale-[1.02] transition-transform group"
                    >
                      <div className="size-12 bg-[#5edff4]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                        <Sparkles className="text-[#5edff4] size-6" />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        Unlock Full Access
                      </h3>
                      <button className="px-6 py-2 bg-[#5edff4] text-slate-900 rounded-xl font-bold text-sm mt-4">
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
          onClose={() => setActiveVideoPlaylist(null)}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="login"
      />
    </div>
  );
};

export default CourseDetails;
