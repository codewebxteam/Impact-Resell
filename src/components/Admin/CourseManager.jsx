import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  DollarSign,
  Rocket,
  Layout,
  Youtube,
  Link as LinkIcon,
  List,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  Sparkles,
  BookOpen,
  PlayCircle,
  Video, // Added for Demo icon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Initial form state
  const initialFormState = {
    title: "",
    description: "",
    syllabus: "",
    price: 299,
    discountPrice: 999,
    paymentLink: "",
    introVideoUrl: "",
    lectures: [],
    demoVideos: [], // [NEW] Demo videos array
    tempDemoTitle: "", // [NEW] Temp title for adding demos
    driveLink: "",
    isComingSoon: false, // [NEW] Coming soon toggle
    priority: 0, // Priority field for sorting
  };

  const [formData, setFormData] = useState(initialFormState);
  const [tempVideoUrl, setTempVideoUrl] = useState("");
  const [tempDemoUrl, setTempDemoUrl] = useState(""); // [NEW] Temp URL for demos

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "courseVideos"));
      const courseList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = filteredCourses.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

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

  const handleLaunchNew = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setTempVideoUrl("");
    setTempDemoUrl("");
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setEditingId(course.id);
    let existingLectures = course.lectures || [];
    if (existingLectures.length === 0 && course.videoId) {
      existingLectures = [
        {
          id: Date.now(),
          url: course.url || "",
          videoId: course.videoId,
          title: "Lecture 1",
        },
      ];
    }

    setFormData({
      title: course.title || "",
      description: course.description || "",
      syllabus: course.syllabus || "",
      price: course.price || 299,
      discountPrice: course.originalPrice || 999,
      paymentLink: course.paymentLink || "",
      introVideoUrl: course.mainVideoId
        ? `https://www.youtube.com/watch?v=${course.mainVideoId}`
        : "",
      lectures: existingLectures,
      demoVideos: course.demoVideos || [], // Load existing demos
      tempDemoTitle: "",
      driveLink: course.driveLink || "",
      isComingSoon: course.isComingSoon || false, // Load coming soon status
      priority: course.priority || 0,
    });
    setTempVideoUrl("");
    setTempDemoUrl("");
    setCurrentStep(1);
    setShowModal(true);
  };

  const addVideo = () => {
    const vidId = extractVideoId(tempVideoUrl);
    if (!vidId) return alert("Invalid Link");
    const newItem = {
      id: Date.now(),
      videoId: vidId,
      url: tempVideoUrl,
      title: `Lecture ${formData.lectures.length + 1}`,
    };
    setFormData({ ...formData, lectures: [...formData.lectures, newItem] });
    setTempVideoUrl("");
  };

  // [NEW] Add Demo Video Function
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
      tempDemoUrl: "",
    });
    setTempDemoUrl("");
  };

  const removeVideo = (id) => {
    setFormData({
      ...formData,
      lectures: formData.lectures.filter((l) => l.id !== id),
    });
  };

  // [NEW] Remove Demo Video Function
  const removeDemoVideo = (id) => {
    setFormData({
      ...formData,
      demoVideos: formData.demoVideos.filter((l) => l.id !== id),
    });
  };

  const handleFinalSubmit = async () => {
    if (!formData.title || formData.lectures.length === 0 || !formData.price) {
      alert("⚠️ Please fill all required fields marked with *");
      return;
    }

    setLoading(true);
    try {
      const firstVid = formData.lectures[0];
      const thumbUrl = `https://img.youtube.com/vi/${firstVid.videoId}/maxresdefault.jpg`;
      const introId = extractVideoId(formData.introVideoUrl);

      const courseData = {
        title: formData.title,
        description: formData.description,
        syllabus: formData.syllabus,
        lectures: formData.lectures,
        demoVideos: formData.demoVideos, // [NEW] Save Demos
        url: firstVid.url,
        videoId: firstVid.videoId,
        driveLink: formData.driveLink,
        price: formData.price.toString(),
        originalPrice: formData.discountPrice.toString(),
        paymentLink: formData.paymentLink,
        mainVideoId: introId,
        isComingSoon: formData.isComingSoon, // Save coming soon status
        priority: parseInt(formData.priority, 10) || 0,
        updatedAt: new Date().toISOString(),
        image: thumbUrl,
        instructor: "Admin",
        rating: 4.8,
        lecturesCount: `${formData.lectures.length} Lectures`,
        duration: "Self Paced",
      };

      if (editingId) {
        await updateDoc(doc(db, "courseVideos", editingId), courseData);
      } else {
        await addDoc(collection(db, "courseVideos"), {
          ...courseData,
          createdAt: new Date().toISOString(),
        });
      }

      setShowModal(false);
      fetchCourses();
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure? This will delete the course permanently.")
    )
      return;
    try {
      await deleteDoc(doc(db, "courseVideos", id));
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const steps = [
    { id: 1, label: "Info", icon: <Layout size={18} /> },
    { id: 2, label: "Content", icon: <Youtube size={18} /> },
    { id: 3, label: "Demo", icon: <Video size={18} /> }, // [NEW] Added Demo Step
    { id: 4, label: "Price", icon: <DollarSign size={18} /> },
    { id: 5, label: "Launch", icon: <Rocket size={18} /> },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Mission Control{" "}
            <Rocket className="text-indigo-500 animate-pulse" size={24} />
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your courses and launch new content.
          </p>
        </div>
        <button
          onClick={handleLaunchNew}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 group"
        >
          <Plus
            size={18}
            className="group-hover:rotate-90 transition-transform"
          />
          Launch New Course
        </button>
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
            Active Courses:
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
            {currentCourses.length > 0 ? (
              currentCourses.map((course) => (
                <motion.div
                  layout
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative"
                >
                  {/* [NEW] Coming Soon Badge Indicator in Admin Panel */}
                  {course.isComingSoon && (
                    <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-[10px] uppercase font-black px-2 py-1 rounded-md shadow-sm">
                      Coming Soon
                    </div>
                  )}

                  <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden relative mb-4">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt="Thumbnail"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src =
                            "https://img.youtube.com/vi/default/maxresdefault.jpg";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">
                        <List size={32} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      {course.lectures ? course.lectures.length : 1} Videos
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 line-clamp-2">
                      {course.title || "Untitled Course"}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                      {course.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                    <span className="text-lg font-black text-slate-900">
                      ₹{course.price}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
                <p className="text-slate-400 text-sm">
                  Create your first course to get started.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50"
          >
            <ChevronRight size={20} />
          </button>
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
                    {editingId ? "Edit Course" : "New Course"}
                  </h3>
                  <div className="flex gap-1 mt-1">
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        className={`h-1 w-6 rounded-full transition-colors ${
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
                    {/* STEP 1: INFO */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        {/* [NEW] Coming Soon Toggle */}
                        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                          <div>
                            <label className="text-sm font-black text-amber-900 block">
                              Coming Soon Status
                            </label>
                            <p className="text-xs text-amber-700 font-medium">
                              If enabled, users will see a "Coming Soon"
                              watermark and won't be able to purchase or access
                              the course yet.
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={formData.isComingSoon}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  isComingSoon: e.target.checked,
                                })
                              }
                            />
                            <div className="w-11 h-6 bg-amber-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                          </label>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex gap-1">
                            Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Master React JS"
                            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-900"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex gap-1">
                            Priority
                          </label>
                          <input
                            type="number"
                            placeholder="Higher number = higher priority"
                            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-900"
                            value={formData.priority}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                priority: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                          <label className="text-xs font-black text-indigo-700 uppercase mb-2 flex items-center gap-2">
                            <PlayCircle size={14} /> Course Intro Video Link
                            (YouTube)
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
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Description
                          </label>
                          <textarea
                            rows="3"
                            placeholder="Brief overview..."
                            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-slate-700"
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Syllabus
                          </label>
                          <textarea
                            rows="4"
                            placeholder="• Topic 1&#10;• Topic 2"
                            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-slate-700 font-mono text-sm"
                            value={formData.syllabus}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                syllabus: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: CONTENT */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="bg-indigo-50 p-4 rounded-xl text-indigo-800 text-xs font-bold flex items-center gap-2">
                          <Youtube size={16} /> Add Course Lectures.
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Paste YouTube Link..."
                            className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-sm"
                            value={tempVideoUrl}
                            onChange={(e) => setTempVideoUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addVideo()}
                          />
                          <button
                            onClick={addVideo}
                            className="bg-slate-900 text-white px-4 rounded-xl font-bold hover:bg-indigo-600 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        <div className="space-y-2">
                          {formData.lectures.map((lecture, index) => (
                            <div
                              key={lecture.id}
                              className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-xl shadow-sm"
                            >
                              <span className="w-6 text-center text-xs font-black text-slate-300">
                                #{index + 1}
                              </span>
                              <p className="text-xs font-bold text-slate-700 flex-1 truncate">
                                {lecture.title}
                              </p>
                              <button
                                onClick={() => removeVideo(lecture.id)}
                                className="text-slate-400 hover:text-red-500 p-2"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* [NEW] STEP 3: DEMO VIDEOS */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-xs font-bold flex items-center gap-2">
                          <Video size={16} /> Add Free Starter Lessons / Demo
                          Videos.
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
                        <div className="space-y-2">
                          {formData.demoVideos.map((video, index) => (
                            <div
                              key={video.id}
                              className="flex items-center gap-3 p-2 bg-white border border-blue-100 rounded-xl shadow-sm"
                            >
                              <span className="w-6 text-center text-xs font-black text-blue-300">
                                Demo {index + 1}
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
                        </div>
                      </div>
                    )}

                    {/* STEP 4: PRICE & LINKS */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1">
                              Selling Price (₹) *
                            </label>
                            <input
                              type="number"
                              className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none font-bold"
                              value={formData.price}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  price: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                              Original Price (₹)
                            </label>
                            <input
                              type="number"
                              className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none font-bold"
                              value={formData.discountPrice}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  discountPrice: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                          <label className="text-xs font-black text-emerald-700 uppercase mb-2">
                            Payment Link *
                          </label>
                          <input
                            type="text"
                            placeholder="https://..."
                            className="w-full bg-white p-3 rounded-xl border border-emerald-200 outline-none font-bold"
                            value={formData.paymentLink}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                paymentLink: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1">
                            Drive Link (Resources)
                          </label>
                          <input
                            type="text"
                            placeholder="Resource Link"
                            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none"
                            value={formData.driveLink}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                driveLink: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 5: LAUNCH */}
                    {currentStep === 5 && (
                      <div className="text-center py-8">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="size-24 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200"
                        >
                          <Rocket size={40} className="ml-1 -mt-1" />
                        </motion.div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">
                          Ready for Liftoff? 🚀
                        </h3>
                        <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto">
                          Publishing <strong>{formData.title}</strong> with{" "}
                          {formData.demoVideos.length} demo videos.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer Buttons */}
              <div className="p-4 border-t border-slate-100 flex justify-between bg-slate-50/50">
                <button
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                  disabled={currentStep === 1}
                  className="px-4 py-2 text-slate-400 font-bold text-xs uppercase disabled:opacity-0"
                >
                  Back
                </button>
                {currentStep < 5 ? (
                  <button
                    onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
                    className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-xl"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        Launch Course <Sparkles size={16} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseManager;
