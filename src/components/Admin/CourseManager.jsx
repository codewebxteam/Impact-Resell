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
  Video,
  GraduationCap,
  FileText, // Added for Notes icon
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

  // Initial form state with Demo & Drive Support
  const initialFormState = {
    title: "",
    description: "",
    syllabus: "",
    price: 299,
    discountPrice: 999,
    paymentLink: "",
    introVideoUrl: "",
    lectures: [],
    demoVideos: [],
    tempDemoTitle: "",
    driveLink: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [tempVideoUrl, setTempVideoUrl] = useState("");
  const [tempDemoUrl, setTempDemoUrl] = useState("");

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
      courseList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
      demoVideos: course.demoVideos || [],
      tempDemoTitle: "",
      driveLink: course.driveLink || "",
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

  const removeVideo = (id) => {
    setFormData({
      ...formData,
      lectures: formData.lectures.filter((l) => l.id !== id),
    });
  };

  const removeDemoVideo = (id) => {
    setFormData({
      ...formData,
      demoVideos: formData.demoVideos.filter((l) => l.id !== id),
    });
  };

  const handleFinalSubmit = async () => {
    if (!formData.title || formData.lectures.length === 0 || !formData.price) {
      alert("⚠️ Title, Price and at least one Video are required!");
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
        demoVideos: formData.demoVideos,
        url: firstVid.url,
        videoId: firstVid.videoId,
        driveLink: formData.driveLink, // Correctly mapped to Firestore
        price: formData.price.toString(),
        originalPrice: formData.discountPrice.toString(),
        paymentLink: formData.paymentLink,
        mainVideoId: introId,
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
    { id: 3, label: "Demo", icon: <Video size={18} /> },
    { id: 4, label: "Price", icon: <DollarSign size={18} /> },
    { id: 5, label: "Launch", icon: <Rocket size={18} /> },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="flex items-center gap-4">
          <div className="size-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Mission Control{" "}
              <Rocket className="text-indigo-500 animate-pulse" size={24} />
            </h1>
            <p className="text-slate-500 font-medium">
              Manage your courses and launch new content.
            </p>
          </div>
        </div>
        <button
          onClick={handleLaunchNew}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all active:scale-95 group"
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
            Active Inventory:
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
            {currentCourses.map((course) => (
              <motion.div
                layout
                key={course.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden relative mb-4">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt="Thumbnail"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50"
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
              className="bg-white w-full max-w-3xl max-h-[90vh] sm:rounded-[32px] rounded-t-[32px] shadow-2xl relative z-10 flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingId ? "Edit Course" : "New Course"}
                  </h3>
                  <div className="flex gap-1 mt-1">
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        className={`h-1 w-6 rounded-full transition-colors ${currentStep >= step.id ? "bg-indigo-500" : "bg-slate-200"}`}
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

              <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Title *
                          </label>
                          <input
                            type="text"
                            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none font-bold"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                          <label className="text-xs font-black text-indigo-700 uppercase mb-2 block">
                            Course Intro Video Link (YouTube)
                          </label>
                          <input
                            type="text"
                            placeholder="https://..."
                            className="w-full bg-white p-3 rounded-xl border border-indigo-200 outline-none font-bold"
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
                            rows="2"
                            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none"
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Paste YouTube Link..."
                            className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none font-bold"
                            value={tempVideoUrl}
                            onChange={(e) => setTempVideoUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addVideo()}
                          />
                          <button
                            onClick={addVideo}
                            className="bg-slate-900 text-white px-4 rounded-xl font-bold"
                          >
                            Add
                          </button>
                        </div>
                        <div className="space-y-2">
                          {formData.lectures.map((lecture, index) => (
                            <div
                              key={lecture.id}
                              className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-xl"
                            >
                              <span className="w-6 text-xs font-black text-slate-300">
                                #{index + 1}
                              </span>
                              <p className="text-xs font-bold text-slate-700 flex-1 truncate">
                                {lecture.url}
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

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Demo Title (e.g., Intro Lesson)"
                            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none font-bold"
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
                              className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none font-bold"
                              value={tempDemoUrl}
                              onChange={(e) => setTempDemoUrl(e.target.value)}
                            />
                            <button
                              onClick={addDemoVideo}
                              className="bg-blue-600 text-white px-6 rounded-xl font-bold"
                            >
                              Add Demo
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {formData.demoVideos.map((video, index) => (
                            <div
                              key={video.id}
                              className="flex items-center gap-3 p-2 bg-white border border-blue-100 rounded-xl"
                            >
                              <span className="w-6 text-xs font-black text-blue-300">
                                D{index + 1}
                              </span>
                              <p className="text-xs font-bold text-slate-700 flex-1 truncate">
                                {video.title}
                              </p>
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

                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="text-center mb-4">
                          <h3 className="text-xl font-black text-slate-900">
                            Pricing & Resources
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
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

                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Payment Link *
                          </label>
                          <input
                            type="text"
                            placeholder="Razorpay/Stripe link..."
                            className="w-full bg-emerald-50 p-3 rounded-xl border border-emerald-200 outline-none font-bold"
                            value={formData.paymentLink}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                paymentLink: e.target.value,
                              })
                            }
                          />
                        </div>

                        {/* STUDY MATERIAL / NOTES SECTION */}
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                          <label className="text-xs font-black text-indigo-700 uppercase mb-2 flex items-center gap-2">
                            <FileText size={14} /> Study Material / Notes Link
                            (Google Drive)
                          </label>
                          <input
                            type="text"
                            placeholder="https://drive.google.com/..."
                            className="w-full bg-white p-3 rounded-xl border border-indigo-200 outline-none font-bold text-slate-700"
                            value={formData.driveLink}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                driveLink: e.target.value,
                              })
                            }
                          />
                          <p className="text-[10px] text-indigo-400 mt-2 font-bold italic">
                            * Ye link sirf enrolled students ko hi dikhega.
                          </p>
                        </div>
                      </div>
                    )}

                    {currentStep === 5 && (
                      <div className="text-center py-8">
                        <div className="size-24 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200">
                          <Rocket size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">
                          Ready for Liftoff? 🚀
                        </h3>
                        <p className="text-slate-500 font-medium text-sm">
                          Publishing <strong>{formData.title}</strong> with{" "}
                          {formData.lectures.length} lectures and{" "}
                          {formData.demoVideos.length} demos.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

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
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
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
