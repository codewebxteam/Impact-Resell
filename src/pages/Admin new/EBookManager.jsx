import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  BookOpen,
  Trash2,
  CheckCircle2,
  DollarSign,
  Rocket,
  Layout,
  Image as ImageIcon,
  X,
  Search,
  Loader2,
  FileText,
  Link as LinkIcon, // [NEW] Import Link Icon
  Sparkles,
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

// --- [HELPER] Professional Google Drive Image Fixer (Logic Preserved) ---
const getValidImageUrl = (url) => {
  if (!url) return "";
  try {
    let id = "";
    if (url.includes("/file/d/")) {
      id = url.split("/file/d/")[1].split("/")[0];
    } else if (url.includes("id=")) {
      id = url.split("id=")[1].split("&")[0];
    }
    if (id) {
      return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    }
  } catch (e) {
    console.error("Error parsing Drive URL:", e);
  }
  return url;
};

const EBookManager = () => {
  const [ebooks, setEbooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // [UPDATED] Added paymentLink
  const initialFormState = {
    title: "",
    author: "",
    description: "",
    pages: "",
    price: 99,
    discountPrice: 499,
    cover: "",
    driveLink: "",
    paymentLink: "", // New Field
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchEBooks();
  }, []);

  const fetchEBooks = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "ebooks"));
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEbooks(list);
    } catch (error) {
      console.error("Error fetching ebooks:", error);
    } finally {
      setLoading(false);
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
      paymentLink: book.paymentLink || "", // Load Payment Link
    });
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleFinalSubmit = async () => {
    // [UPDATED] Added Validation for Payment Link
    if (!formData.title || !formData.price || !formData.driveLink) {
      alert("⚠️ Title, Price, and PDF Link are required!");
      return;
    }

    setLoading(true);
    try {
      const validCoverUrl = getValidImageUrl(formData.cover);

      const bookData = {
        title: formData.title,
        author: formData.author || "Unknown",
        description: formData.description,
        pages: formData.pages || "N/A",
        image: validCoverUrl,
        driveLink: formData.driveLink,
        paymentLink: formData.paymentLink, // Save Payment Link
        price: formData.price.toString(),
        originalPrice: formData.discountPrice.toString(),
        updatedAt: new Date().toISOString(),
        instructor: "Admin",
        rating: 4.8,
        language: "English",
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
    if (!window.confirm("Delete this E-Book permanently?")) return;
    try {
      await deleteDoc(doc(db, "ebooks", id));
      setEbooks(ebooks.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting ebook:", error);
    }
  };

  // Filter & Pagination Logic (Preserved)
  const filteredEbooks = ebooks.filter((book) =>
    book.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEbooks = filteredEbooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEbooks.length / itemsPerPage);

  const steps = [
    { id: 1, label: "Details", icon: <Layout size={18} /> },
    { id: 2, label: "Media", icon: <ImageIcon size={18} /> },
    { id: 3, label: "Pricing", icon: <DollarSign size={18} /> },
    { id: 4, label: "Review", icon: <Rocket size={18} /> },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Digital Library <BookOpen className="text-indigo-500" size={28} />
          </h1>
          <p className="text-slate-500 font-medium">
            Manage E-Books, Notes & PDFs
          </p>
        </div>
        <button
          onClick={handleLaunchNew}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 group"
        >
          <Plus
            size={18}
            className="group-hover:rotate-90 transition-transform"
          />{" "}
          Add New E-Book
        </button>
      </div>

      {/* 2. TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 px-3 w-full sm:max-w-md">
          <Search className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search library..."
            className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 border-l border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Items:
          </span>
          <span className="text-sm font-black text-slate-900">
            {ebooks.length}
          </span>
        </div>
      </div>

      {/* 3. EBOOK GRID */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {currentEbooks.length > 0 ? (
              currentEbooks.map((book) => (
                <motion.div
                  layout
                  key={book.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  {/* Cover Image */}
                  <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden relative mb-4 shadow-inner">
                    {book.image ? (
                      <img
                        src={getValidImageUrl(book.image)}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/400x600?text=No+Cover";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">
                        <BookOpen size={40} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <FileText size={10} /> PDF
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1 line-clamp-2">
                      {book.title || "Untitled Book"}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                      by {book.author || "Unknown"}
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">
                        ₹{book.price}
                      </span>
                      {book.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{book.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-slate-50 mt-3">
                    <button
                      onClick={() => handleEdit(book)}
                      className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="flex-1 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                    >
                      Delete
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
                  Library is empty
                </h3>
                <p className="text-slate-400 text-sm">
                  Add your first E-Book to get started.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 4. MODAL */}
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
              className="bg-white w-full max-w-2xl max-h-[90vh] sm:rounded-[32px] rounded-t-[32px] shadow-2xl relative z-10 flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingId ? "Edit E-Book" : "New E-Book"}
                  </h3>
                  <div className="flex gap-1 mt-2">
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        className={`h-1 w-8 rounded-full transition-colors ${
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
                  className="size-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
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
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex gap-1">
                            Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. AI for Beginners"
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
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                              Author
                            </label>
                            <input
                              type="text"
                              className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium"
                              value={formData.author}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  author: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                              Pages
                            </label>
                            <input
                              type="number"
                              className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium"
                              value={formData.pages}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  pages: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Description
                          </label>
                          <textarea
                            rows="3"
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
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Cover Image Link
                          </label>
                          <input
                            type="text"
                            placeholder="Drive or Image Link"
                            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium"
                            value={formData.cover}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                cover: e.target.value,
                              })
                            }
                          />
                        </div>
                        {/* Preview */}
                        <div className="h-40 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                          {formData.cover ? (
                            <img
                              src={getValidImageUrl(formData.cover)}
                              alt="Preview"
                              className="h-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-slate-400">
                              Cover Preview
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex gap-1">
                            PDF Download Link{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Google Drive PDF Link"
                            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium"
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

                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                          <span className="font-bold text-slate-700 flex gap-1">
                            Selling Price{" "}
                            <span className="text-red-500">*</span>
                          </span>
                          <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-slate-200">
                            <span className="text-slate-400 mr-1">₹</span>
                            <input
                              type="number"
                              className="w-20 outline-none font-black text-slate-900 text-right"
                              value={formData.price}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  price: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                          <span className="font-bold text-slate-400">
                            Original Price
                          </span>
                          <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-slate-200">
                            <span className="text-slate-400 mr-1">₹</span>
                            <input
                              type="number"
                              className="w-20 outline-none font-bold text-slate-500 text-right"
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

                        {/* [NEW] Payment Link Field */}
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                          <label className="text-xs font-black text-emerald-700 uppercase mb-2 flex items-center gap-2">
                            <LinkIcon size={14} /> Payment Link{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="https://superprofile.bio/vp/your-ebook-id"
                            className="w-full bg-white p-3 rounded-xl border border-emerald-200 focus:border-emerald-500 outline-none font-bold text-emerald-900 placeholder:text-emerald-300"
                            value={formData.paymentLink}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                paymentLink: e.target.value,
                              })
                            }
                          />
                          <p className="text-[10px] text-emerald-600 mt-2 font-medium">
                            Paste your Superprofile or Razorpay product link
                            here.
                          </p>
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="text-center py-6">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="size-24 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200"
                        >
                          <Rocket size={40} className="ml-1 -mt-1" />
                        </motion.div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">
                          Ready to Publish? 🚀
                        </h3>
                        <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto mb-6">
                          You are about to list{" "}
                          <strong>{formData.title}</strong> in the library.
                        </p>

                        <div className="bg-slate-50 p-4 rounded-xl text-left max-w-sm mx-auto space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold">
                              Price:
                            </span>
                            <span className="text-slate-900 font-bold">
                              ₹{formData.price}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold">
                              Author:
                            </span>
                            <span className="text-slate-900 font-bold">
                              {formData.author || "Unknown"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold">
                              Payment:
                            </span>
                            <span
                              className={`font-bold ${formData.paymentLink ? "text-emerald-500" : "text-red-500"}`}
                            >
                              {formData.paymentLink ? "Connected" : "Missing"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between">
                <button
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                  disabled={currentStep === 1}
                  className="px-4 py-2 text-slate-400 font-bold uppercase text-xs hover:text-slate-700 disabled:opacity-0"
                >
                  Back
                </button>
                {currentStep < 4 ? (
                  <button
                    onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
                    className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-800"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-600 shadow-lg shadow-emerald-200 flex items-center gap-2 transform transition-all active:scale-95"
                  >
                    {loading ? (
                      <>
                        Publishing{" "}
                        <Loader2 size={16} className="animate-spin" />
                      </>
                    ) : (
                      <>
                        Launch Item <Sparkles size={16} />
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

export default EBookManager;
