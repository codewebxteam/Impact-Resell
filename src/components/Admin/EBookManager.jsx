import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  BookOpen,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Rocket,
  ChevronUp,
  ChevronDown,
  Layout,
  Image as ImageIcon,
  X,
  Check, // Added for the progress bar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

// --- [HELPER] Professional Google Drive Image Fixer (UPDATED) ---
const getValidImageUrl = (url) => {
  if (!url) return "";
  try {
    let id = "";
    // Case 1: Standard Sharing Link (.../file/d/ID/view...)
    if (url.includes("/file/d/")) {
      id = url.split("/file/d/")[1].split("/")[0];
    }
    // Case 2: ID based Link (...id=ID...)
    else if (url.includes("id=")) {
      id = url.split("id=")[1].split("&")[0];
    }

    // [FIX] Use Google Drive Thumbnail API for reliable loading
    if (id) {
      return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    }
  } catch (e) {
    console.error("Error parsing URL", e);
  }
  return url;
};

const EBookManager = () => {
  const [ebooks, setEbooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const initialFormState = {
    title: "",
    author: "",
    description: "",
    pages: "",
    price: 99,
    discountPrice: 499,
    cover: "",
    driveLink: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchEBooks();
  }, []);

  const fetchEBooks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "ebooks"));
      const booksList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEbooks(booksList);
    } catch (error) {
      console.error("Error fetching ebooks:", error);
    }
  };

  const handleLaunchNew = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setFormData({
      title: book.title || "",
      author: book.author || "",
      description: book.description || "",
      pages: book.pages || "",
      price: book.price || 99,
      discountPrice: book.originalPrice || 499,
      cover: book.image || "",
      driveLink: book.driveLink || "",
    });
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!formData.title || !formData.cover || !formData.price) {
      alert("⚠️ Book Title, Cover Image, and Price are required!");
      return;
    }

    setLoading(true);
    try {
      // [IMPORTANT] Convert Drive Link to Direct Image before saving
      const validCoverUrl = getValidImageUrl(formData.cover);

      const bookData = {
        title: formData.title,
        author: formData.author || "Unknown Author",
        description: formData.description,
        pages: formData.pages || "Unknown",
        image: validCoverUrl, // Saving the fixed URL
        driveLink: formData.driveLink,
        price: formData.price.toString(),
        originalPrice: formData.discountPrice.toString(),
        updatedAt: new Date().toISOString(),
        rating: 4.5,
        language: "Hindi",
      };

      if (editingId) {
        await updateDoc(doc(db, "ebooks", editingId), bookData);
      } else {
        await addDoc(collection(db, "ebooks"), {
          ...bookData,
          createdAt: new Date().toISOString(),
        });
      }
      setShowModal(false);
      fetchEBooks();
    } catch (error) {
      console.error("Error saving ebook:", error);
      alert("Failed to save ebook");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this E-Book?")) return;
    try {
      await deleteDoc(doc(db, "ebooks", id));
      fetchEBooks();
    } catch (error) {
      console.error("Error deleting ebook:", error);
    }
  };

  const steps = [
    { id: 1, label: "Info", icon: <Layout size={16} /> },
    { id: 2, label: "Assets", icon: <ImageIcon size={16} /> },
    { id: 3, label: "Pricing", icon: <DollarSign size={16} /> },
    { id: 4, label: "Review", icon: <Rocket size={16} /> },
  ];

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6">
      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-none">
              Library
            </h2>
            <p className="text-xs text-slate-400 font-bold">
              {ebooks.length} Books
            </p>
          </div>
        </div>
        <button
          onClick={handleLaunchNew}
          className="size-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex w-[350px] flex-col">
        <div className="bg-slate-950 p-8 rounded-[40px] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden h-[500px] sticky top-0">
          <div className="absolute top-0 right-0 size-64 bg-orange-500/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          <div className="relative z-10">
            <div className="size-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-orange-500/20">
              <BookOpen size={32} className="text-white" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter mb-4 leading-none uppercase">
              E-Book <br /> <span className="text-orange-400">Manager</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
              "Publish digital resources and guides."
            </p>
          </div>
          <button
            onClick={handleLaunchNew}
            className="mt-auto flex items-center justify-center gap-3 w-full py-5 bg-white text-slate-950 rounded-[24px] font-black uppercase text-[11px] tracking-widest hover:bg-orange-400 hover:text-white transition-all duration-500 shadow-xl"
          >
            <Plus size={18} /> Add New E-Book
          </button>
        </div>
      </div>

      {/* BOOK LIST AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 lg:pb-0">
        <div className="hidden lg:flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Digital Library ({ebooks.length})
          </h3>
          <Layout size={16} className="text-slate-300" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {ebooks.map((book) => (
              <motion.div
                layout
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-4 rounded-[24px] border border-slate-100 flex flex-col gap-4 group hover:shadow-xl hover:border-orange-100 transition-all duration-300"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-28 sm:w-24 sm:h-32 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative shadow-md">
                    {/* List Preview with Fix */}
                    {book.image ? (
                      <img
                        src={getValidImageUrl(book.image)}
                        alt="Cover"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/400x600?text=No+Cover";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">
                        <BookOpen size={24} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="mb-1">
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        PDF
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight line-clamp-2 mb-1">
                      {book.title || "Untitled Book"}
                    </h4>
                    <p className="text-xs text-slate-500 mb-auto">
                      by {book.author || "Unknown"}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-sm font-black text-emerald-600">
                        ₹{book.price}
                      </span>
                      {book.pages && (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {book.pages} Pages
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-50">
                  <button
                    onClick={() => handleEdit(book)}
                    className="flex-1 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="flex-1 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {ebooks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen size={24} />
            </div>
            <p className="text-sm font-medium">No ebooks found.</p>
            <button
              onClick={handleLaunchNew}
              className="mt-4 text-orange-500 text-sm font-bold hover:underline lg:hidden"
            >
              Add your first ebook
            </button>
          </div>
        )}
      </div>

      {/* RESPONSIVE MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-4xl h-[95vh] sm:h-[85vh] sm:rounded-[40px] rounded-t-[32px] shadow-2xl relative z-10 flex flex-col overflow-hidden"
            >
              {/* MODAL HEADER - NEW BEAUTIFUL PROGRESS BAR */}
              <div className="p-6 border-b border-slate-100 flex flex-col gap-6 bg-white z-20">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900">
                    {editingId ? "Edit E-Book" : "New E-Book"}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="size-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* STEPS INDICATOR CONTAINER */}
                <div className="relative px-2">
                  {/* Background Grey Line */}
                  <div className="absolute left-0 top-5 w-full h-1 bg-slate-100 rounded-full -z-10" />

                  {/* Steps Loop */}
                  <div className="flex justify-between items-start">
                    {steps.map((step) => {
                      const isCompleted = currentStep > step.id;
                      const isActive = currentStep === step.id;

                      return (
                        <div
                          key={step.id}
                          className="flex flex-col items-center gap-2 group cursor-default"
                        >
                          {/* Circle */}
                          <div
                            className={`size-10 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-white
                                  ${
                                    isActive
                                      ? "bg-orange-500 text-white shadow-lg shadow-orange-200 scale-110"
                                      : isCompleted
                                      ? "bg-emerald-500 text-white"
                                      : "bg-slate-200 text-slate-400"
                                  }
                                `}
                          >
                            {isCompleted ? (
                              <Check size={16} strokeWidth={3} />
                            ) : (
                              step.icon
                            )}
                          </div>

                          {/* Label (Name) */}
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 
                                ${
                                  isActive
                                    ? "text-slate-900"
                                    : isCompleted
                                    ? "text-emerald-600"
                                    : "text-slate-300"
                                }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* MODAL CONTENT */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-10 custom-scrollbar bg-white">
                <div className="max-w-xl mx-auto pb-20 sm:pb-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {currentStep === 1 && (
                        <InfoTab
                          formData={formData}
                          setFormData={setFormData}
                        />
                      )}
                      {currentStep === 2 && (
                        <AssetsTab
                          formData={formData}
                          setFormData={setFormData}
                        />
                      )}
                      {currentStep === 3 && (
                        <PricingTab
                          formData={formData}
                          setFormData={setFormData}
                        />
                      )}
                      {currentStep === 4 && <ReviewTab formData={formData} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="p-4 sm:p-6 border-t border-slate-100 bg-white flex justify-between items-center z-20">
                <button
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                  disabled={currentStep === 1}
                  className="px-4 py-2 sm:px-6 sm:py-3 text-slate-400 font-bold uppercase text-xs flex items-center gap-2 disabled:opacity-0 hover:text-slate-900 transition-all"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
                    className="px-6 py-3 sm:px-8 sm:py-3.5 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2"
                  >
                    Next <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    className="px-6 py-3 sm:px-8 sm:py-3.5 bg-emerald-500 text-white rounded-xl sm:rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-emerald-200 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    {loading ? "Saving..." : "Publish"}{" "}
                    <CheckCircle2 size={16} />
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

// --- SUB-COMPONENTS ---

const InfoTab = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h3 className="text-xl sm:text-2xl font-black text-slate-900">
        Book Details
      </h3>
      <p className="text-slate-400 text-xs">
        Basic information about the ebook
      </p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block ml-1">
          Book Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. The Ultimate React Guide"
          className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 focus:border-orange-500 focus:bg-white outline-none font-bold text-slate-900 transition-all text-sm"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block ml-1">
            Author Name
          </label>
          <input
            type="text"
            placeholder="e.g. John Doe"
            className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 focus:border-orange-500 focus:bg-white outline-none font-bold text-slate-900 transition-all text-sm"
            value={formData.author}
            onChange={(e) =>
              setFormData({ ...formData, author: e.target.value })
            }
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block ml-1">
            No. of Pages
          </label>
          <input
            type="number"
            placeholder="e.g. 150"
            className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 focus:border-orange-500 focus:bg-white outline-none font-bold text-slate-900 transition-all text-sm"
            value={formData.pages}
            onChange={(e) =>
              setFormData({ ...formData, pages: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block ml-1">
          Description
        </label>
        <textarea
          rows="4"
          placeholder="What is this book about?"
          className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 focus:border-orange-500 focus:bg-white outline-none font-medium text-slate-700 transition-all text-sm resize-none"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>
    </div>
  </div>
);

const AssetsTab = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h3 className="text-xl sm:text-2xl font-black text-slate-900">Assets</h3>
      <p className="text-slate-400 text-xs">Cover image and download link</p>
    </div>

    <div>
      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block ml-1">
        Cover Image Link (Drive/Imgur) <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        placeholder="https://drive.google.com/..."
        className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 focus:border-orange-500 focus:bg-white outline-none font-bold text-slate-900 transition-all text-sm"
        value={formData.cover}
        onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
      />

      {/* Live Preview (With Auto Fixer) */}
      <div className="mt-4 h-48 sm:h-56 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
        {formData.cover ? (
          <img
            src={getValidImageUrl(formData.cover)}
            alt="Preview"
            className="h-full object-contain shadow-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400?text=Invalid+Link";
            }}
          />
        ) : (
          <div className="text-center text-slate-400">
            <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">Preview will appear here</p>
          </div>
        )}
      </div>
    </div>

    <div>
      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block ml-1">
        Book PDF Link <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        placeholder="https://drive.google.com/..."
        className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-900 transition-all text-sm"
        value={formData.driveLink}
        onChange={(e) =>
          setFormData({ ...formData, driveLink: e.target.value })
        }
      />
    </div>
  </div>
);

const PricingTab = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h3 className="text-xl sm:text-2xl font-black text-slate-900">Pricing</h3>
      <p className="text-slate-400 text-xs">Set your book value</p>
    </div>

    <div className="grid grid-cols-1 gap-4">
      <PriceControl
        label="Selling Price"
        value={formData.price}
        color="emerald"
        onChange={(v) => setFormData({ ...formData, price: v })}
      />
      <PriceControl
        label="Original Price (Strike-through)"
        value={formData.discountPrice}
        color="slate"
        onChange={(v) => setFormData({ ...formData, discountPrice: v })}
      />
    </div>
  </div>
);

const PriceControl = ({ label, value, onChange, color }) => (
  <div
    className={`p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl flex items-center justify-between`}
  >
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
      <p
        className={`text-2xl sm:text-3xl font-black text-${
          color === "emerald" ? "emerald-600" : "slate-900"
        }`}
      >
        ₹{value}
      </p>
    </div>
    <div className="flex flex-col gap-1">
      <button
        onClick={() => onChange(Number(value) + 50)}
        className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg"
      >
        <ChevronUp size={16} />
      </button>
      <button
        onClick={() => onChange(Math.max(0, Number(value) - 50))}
        className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg"
      >
        <ChevronDown size={16} />
      </button>
    </div>
  </div>
);

const ReviewTab = ({ formData }) => (
  <div className="text-center space-y-6 py-4">
    <div className="size-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
      <Rocket size={32} />
    </div>
    <h3 className="text-2xl font-black text-slate-900">Ready to Publish?</h3>

    <div className="bg-slate-50 p-6 rounded-2xl text-left space-y-3 border border-slate-100 max-w-sm mx-auto flex items-start gap-4">
      <div className="w-16 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0">
        {formData.cover && (
          <img
            src={getValidImageUrl(formData.cover)}
            className="w-full h-full object-cover"
            alt=""
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400?text=Error";
            }}
          />
        )}
      </div>
      <div className="flex-1">
        <p className="font-bold text-slate-900 line-clamp-2 leading-tight">
          {formData.title || "Untitled"}
        </p>
        <p className="text-xs text-slate-500 mb-2">{formData.pages} Pages</p>
        <p className="font-black text-emerald-600 text-lg">₹{formData.price}</p>
      </div>
    </div>
  </div>
);

export default EBookManager;
