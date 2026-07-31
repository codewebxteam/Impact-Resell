import React, { useState, useEffect } from "react";
import {
  Edit3,
  X,
  Layout,
  Youtube,
  Video,
  Search,
  Loader2,
  BookOpen,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useAuth } from "../../../context/AuthContext";

const PartnerCourseManager = () => {
  const { currentUser } = useAuth();
  const partnerId = currentUser?.uid;

  const [courses, setCourses] = useState([]);
  const [partnerAgency, setPartnerAgency] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    introVideoUrl: "",
    demoVideos: [],
    tempDemoTitle: "",
  });
  const [tempDemoUrl, setTempDemoUrl] = useState("");

  useEffect(() => {
    if (partnerId) {
      fetchData();
    }
  }, [partnerId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Partner Agency data to get overrides
      const agencyDocRef = doc(db, "agencies", partnerId);
      const agencyDocSnap = await getDoc(agencyDocRef);
      let overrides = {};
      if (agencyDocSnap.exists()) {
        const agencyData = agencyDocSnap.data();
        setPartnerAgency(agencyData);
        if (agencyData.courseDemoOverrides) {
          overrides = agencyData.courseDemoOverrides;
        }
      }

      // 2. Fetch Courses
      const querySnapshot = await getDocs(collection(db, "courseVideos"));
      const courseList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Check if there is an override for this course
        const override = overrides[doc.id];
        return {
          id: doc.id,
          ...data,
          // We will store the override data in a special property so we know what is overridden
          overrideData: override || null,
        };
      });
      
      courseList.sort((a, b) => {
        const priorityA = parseInt(a.priority) || 0;
        const priorityB = parseInt(b.priority) || 0;
        if (priorityB !== priorityA) {
          return priorityB - priorityA;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setCourses(courseList);
    } catch (error) {
      console.error("Error fetching courses for partner:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const extractVideoId = (url) => {
    if (!url) return null;
    let videoId = null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("youtube.com")) {
        videoId = urlObj.searchParams.get("v");
      } else if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1);
      }
    } catch (e) {
      if (url.length === 11) return url;
    }
    return videoId;
  };

  const handleEdit = (course) => {
    setEditingId(course.id);
    
    // Determine the intro video url (either overridden or default)
    let currentIntroUrl = "";
    if (course.overrideData?.mainVideoId) {
      currentIntroUrl = `https://www.youtube.com/watch?v=${course.overrideData.mainVideoId}`;
    } else if (course.mainVideoId) {
      currentIntroUrl = `https://www.youtube.com/watch?v=${course.mainVideoId}`;
    }

    // Determine demo videos (either overridden or default)
    let currentDemos = [];
    if (course.overrideData?.demoVideos) {
      currentDemos = course.overrideData.demoVideos;
    } else if (course.demoVideos) {
      currentDemos = course.demoVideos;
    }

    setFormData({
      title: course.title || "",
      description: course.description || "",
      introVideoUrl: currentIntroUrl,
      demoVideos: currentDemos,
      tempDemoTitle: "",
    });
    
    setTempDemoUrl("");
    setCurrentStep(1);
    setShowModal(true);
  };

  const addDemoVideo = () => {
    const vidId = extractVideoId(tempDemoUrl);
    if (!vidId) return alert("Invalid Demo Link");
    if (!formData.tempDemoTitle)
      return alert("Please enter a title for the demo");

    const newItem = {
      id: Date.now(),
      videoId: vidId,
      url: tempDemoUrl,
      title: formData.tempDemoTitle,
    };
    setFormData({
      ...formData,
      demoVideos: [...formData.demoVideos, newItem],
      tempDemoTitle: "",
    });
    setTempDemoUrl("");
  };

  const removeDemoVideo = (id) => {
    setFormData({
      ...formData,
      demoVideos: formData.demoVideos.filter((l) => l.id !== id),
    });
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const introId = extractVideoId(formData.introVideoUrl);
      
      const newOverrideData = {
        mainVideoId: introId,
        demoVideos: formData.demoVideos,
      };

      const agencyRef = doc(db, "agencies", partnerId);
      
      // We update the specific course override in the agency doc
      await setDoc(agencyRef, {
        courseDemoOverrides: {
          [editingId]: newOverrideData
        }
      }, { merge: true });

      setShowModal(false);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Error saving overrides:", error);
      alert("Failed to save custom demo settings");
    }
    setLoading(false);
  };

  // Steps for modal
  const steps = [
    { id: 1, label: "Info (Read-Only)", icon: <Layout size={18} /> },
    { id: 2, label: "Custom Intro", icon: <Youtube size={18} /> },
    { id: 3, label: "Custom Demos", icon: <Video size={18} /> },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Course Demos
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your custom intro and demo videos for courses.
          </p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 px-3 w-full sm:max-w-md">
          <Search className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 border-l border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Courses:
          </span>
          <span className="text-sm font-black text-slate-900">
            {courses.length}
          </span>
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <motion.div
                  layout
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative"
                >
                  {course.overrideData && (
                    <div className="absolute top-4 left-4 z-10 bg-indigo-500 text-white text-[10px] uppercase font-black px-2 py-1 rounded-md shadow-sm">
                      Custom Demo Active
                    </div>
                  )}

                  <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden relative mb-4">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt="Thumbnail"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = "https://img.youtube.com/vi/default/maxresdefault.jpg";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">
                        <BookOpen size={32} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 line-clamp-2">
                      {course.title || "Untitled Course"}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                    <span className="text-sm font-bold text-slate-500">
                      ₹{course.price}
                    </span>
                    <button
                      onClick={() => handleEdit(course)}
                      className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors flex items-center gap-2"
                    >
                      <Edit3 size={14} /> Edit Demo
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  No courses found
                </h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-3xl max-h-[90vh] sm:rounded-[32px] rounded-t-[32px] shadow-2xl relative z-10 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Edit Course Demos
                  </h3>
                  <div className="flex gap-1 mt-1">
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        onClick={() => setCurrentStep(step.id)}
                        className={`h-1 w-6 rounded-full transition-colors cursor-pointer ${
                          currentStep >= step.id
                            ? "bg-indigo-500"
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="size-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    {/* STEP 1: INFO (Locked) */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-4">
                          <p className="text-xs font-bold text-amber-700">
                            Course details cannot be modified here. You can only customize the Introduction Video and Free Starter Lessons for your domain.
                          </p>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase mb-1 flex gap-1">
                            Title
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full bg-slate-100 p-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-500 cursor-not-allowed"
                            value={formData.title}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">
                            Description
                          </label>
                          <textarea
                            rows="3"
                            readOnly
                            className="w-full bg-slate-100 p-3 rounded-xl border border-slate-200 outline-none font-medium text-slate-500 cursor-not-allowed"
                            value={formData.description}
                          />
                        </div>
                        
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition"
                        >
                          Next: Custom Intro Video
                        </button>
                      </div>
                    )}

                    {/* STEP 2: CUSTOM INTRO */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                          <label className="text-xs font-black text-indigo-700 uppercase mb-2 flex items-center gap-2">
                            <PlayCircle size={14} /> Custom Course Intro Video Link (YouTube)
                          </label>
                          <input
                            type="text"
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full bg-white p-3 rounded-xl border border-indigo-200 focus:border-indigo-500 outline-none font-bold text-indigo-900 placeholder:text-indigo-300"
                            value={formData.introVideoUrl}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                introVideoUrl: e.target.value,
                              })
                            }
                          />
                          <p className="text-[10px] mt-2 text-indigo-600">
                            Leave blank or keep as is to use the default Admin video.
                          </p>
                        </div>
                        
                        <div className="flex gap-4">
                          <button
                            onClick={() => setCurrentStep(1)}
                            className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => setCurrentStep(3)}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition"
                          >
                            Next: Custom Demos
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: CUSTOM DEMO VIDEOS */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-xs font-bold flex items-center gap-2">
                          <Video size={16} /> Customize Free Starter Lessons / Demo Videos
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Demo Title (e.g., Intro to UI Design)"
                            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-sm"
                            value={formData.tempDemoTitle}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                tempDemoTitle: e.target.value,
                              })
                            }
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="YouTube Link..."
                              className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-sm"
                              value={tempDemoUrl}
                              onChange={(e) => setTempDemoUrl(e.target.value)}
                            />
                            <button
                              onClick={addDemoVideo}
                              className="bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                            >
                              Add Demo
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                          {formData.demoVideos.map((video, index) => (
                            <div
                              key={video.id || index}
                              className="flex items-center gap-3 p-2 bg-white border border-blue-100 rounded-xl shadow-sm"
                            >
                              <span className="w-6 text-center text-xs font-black text-blue-300">
                                #{index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-700 truncate">
                                  {video.title}
                                </p>
                              </div>
                              <button
                                onClick={() => removeDemoVideo(video.id)}
                                className="text-slate-400 hover:text-red-500 p-2"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          {formData.demoVideos.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-4">No custom demo videos added.</p>
                          )}
                        </div>
                        
                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                          <button
                            onClick={() => setCurrentStep(2)}
                            className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleFinalSubmit}
                            disabled={loading}
                            className="w-full bg-indigo-900 text-white font-bold py-3 rounded-xl hover:bg-indigo-800 transition flex items-center justify-center gap-2"
                          >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Overrides"}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerCourseManager;
