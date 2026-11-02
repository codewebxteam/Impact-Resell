import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  Play,
  Clock,
  FileVideo,
  ChevronRight,
  List,
} from "lucide-react";
import { Link } from "react-router-dom";
import CourseCard from "../../components/dashboard/CourseCard";
import CourseVideoPlayer from "../../components/CourseVideoPlayer";
import { useCourse } from "../../context/CourseContext";

const MyCourses = () => {
  const { enrolledCourses } = useCourse();
  const [filterStatus, setFilterStatus] = useState("all");

  // State for Playlist & Player
  const [selectedCourse, setSelectedCourse] = useState(null); // Playlist Modal ke liye
  const [playingVideoIndex, setPlayingVideoIndex] = useState(null); // Player ke liye

  const filteredCourses = enrolledCourses.filter((course) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "in-progress") return course.status === "in-progress";
    if (filterStatus === "completed") return course.status === "completed";
    return true;
  });

  const inProgressCount = enrolledCourses.filter(
    (c) => c.status === "in-progress"
  ).length;
  const completedCount = enrolledCourses.filter(
    (c) => c.status === "completed"
  ).length;

  // --- [FIXED] DATA EXTRACTOR ---
  // Ye function check karega ki course me 'lectures' array hai ya nahi
  const getLecturesList = (course) => {
    if (!course) return [];

    // 1. Agar DB me lectures array hai (3 Videos wala case)
    if (
      course.lectures &&
      Array.isArray(course.lectures) &&
      course.lectures.length > 0
    ) {
      return course.lectures;
    }

    // 2. Agar purana single video hai
    if (course.videoId) {
      return [
        {
          id: "legacy",
          videoId: course.videoId,
          title: course.title || "Full Class",
          url: course.url || "",
        },
      ];
    }

    return [];
  };

  // Click on Course Card -> Open Playlist Modal
  const handleOpenCourse = (course) => {
    setSelectedCourse(course);
    setPlayingVideoIndex(null);
  };

  // Click on Video inside List -> Open Player
  const handlePlayVideo = (index) => {
    setPlayingVideoIndex(index);
  };

  // Close everything
  const handleCloseAll = () => {
    setSelectedCourse(null);
    setPlayingVideoIndex(null);
  };

  // Safe Image Function
  const getThumbnail = (vidId) => {
    return vidId
      ? `https://img.youtube.com/vi/${vidId}/mqdefault.jpg`
      : "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80";
  };

  // Get current active list
  const currentLectures = getLecturesList(selectedCourse);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Learning</h1>
          <p className="text-slate-500 mt-1">
            Manage your courses and track progress.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-3 size-4 text-slate-400 group-focus-within:text-emerald-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none w-full sm:w-64 transition-all"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600">
            <Filter className="size-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200">
        <button
          onClick={() => setFilterStatus("all")}
          className={`pb-3 text-sm font-bold ${
            filterStatus === "all"
              ? "text-emerald-600 border-b-2 border-emerald-500"
              : "text-slate-500"
          }`}
        >
          All Courses ({enrolledCourses.length})
        </button>
        <button
          onClick={() => setFilterStatus("in-progress")}
          className={`pb-3 text-sm font-bold ${
            filterStatus === "in-progress"
              ? "text-emerald-600 border-b-2 border-emerald-500"
              : "text-slate-500"
          }`}
        >
          In Progress ({inProgressCount})
        </button>
      </div>

      {/* Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.courseId}
              course={course}
              onPlay={handleOpenCourse}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-500 mb-4">No courses found.</p>
          <Link
            to="/courses"
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold"
          >
            Explore Courses
          </Link>
        </div>
      )}

      {/* === 1. PLAYLIST MODAL (Video List) === */}
      <AnimatePresence>
        {selectedCourse && playingVideoIndex === null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseAll}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl relative z-10 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-white">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                    {selectedCourse.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                    <List size={16} />
                    <span className="font-bold">
                      {currentLectures.length} Videos Available
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseAll}
                  className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* List Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-slate-50">
                {currentLectures.length > 0 ? (
                  currentLectures.map((video, idx) => (
                    <div
                      key={idx}
                      onClick={() => handlePlayVideo(idx)}
                      className="group bg-white p-3 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex gap-4 items-center"
                    >
                      {/* Thumb */}
                      <div className="relative w-28 h-16 md:w-36 md:h-20 bg-slate-900 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={getThumbnail(video.videoId)}
                          className="w-full h-full object-cover opacity-90"
                          alt=""
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-all">
                          <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-full text-white">
                            <Play size={14} fill="currentColor" />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 block">
                          Lesson {idx + 1}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                          {video.title || `Video Part ${idx + 1}`}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">
                            <FileVideo size={10} /> Video
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-slate-300 group-hover:text-emerald-500"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-400 font-medium">
                      No videos found in this course.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* === 2. VIDEO PLAYER (List bhej rahe hain taaki Next/Prev kaam kare) === */}
      {selectedCourse && playingVideoIndex !== null && (
        <CourseVideoPlayer
          course={selectedCourse}
          playlist={currentLectures} // Sending Full List
          initialIndex={playingVideoIndex}
          onClose={() => setPlayingVideoIndex(null)} // Back to List
        />
      )}
    </div>
  );
};

export default MyCourses;
