import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  Eye,
  Lock,
  Loader2,
  X,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

const EBookLibrary = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allBooks, setAllBooks] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getValidImageUrl = (url) => {
    if (!url) return "https://placehold.co/400x600?text=No+Cover";
    try {
      if (url.includes("drive.google.com")) {
        let id = "";
        if (url.includes("/file/d/"))
          id = url.split("/file/d/")[1].split("/")[0];
        else if (url.includes("id=")) id = url.split("id=")[1].split("&")[0];
        if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
      }
    } catch (e) {
      console.error(e);
    }
    return url;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // 1. Get User's Purchased IDs
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        let pIds = [];
        if (userSnap.exists() && userSnap.data().purchasedBooks) {
          pIds = userSnap.data().purchasedBooks;
        }
        setPurchasedIds(pIds);

        // 2. Fetch ALL Books (No filtering)
        const booksRef = collection(db, "ebooks");
        const booksSnap = await getDocs(booksRef);

        const booksData = booksSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          image: getValidImageUrl(doc.data().image),
        }));

        setAllBooks(booksData);
      } catch (error) {
        console.error("Error fetching library:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const filteredBooks = allBooks.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" />
      </div>
    );

  return (
    <>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Digital Library
            </h1>
            <p className="text-slate-500 mt-1">
              Browse all available books and your collection.
            </p>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-3 size-4 text-slate-400 group-focus-within:text-emerald-500" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none w-full sm:w-64 transition-all"
            />
          </div>
        </div>

        {filteredBooks.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => {
              const isPurchased = purchasedIds.includes(book.id);
              const isFree =
                String(book.price).toLowerCase() === "free" || book.price === 0;
              const canAccess = isPurchased || isFree;

              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col"
                >
                  <div className="relative aspect-2/3 bg-slate-100 rounded-2xl overflow-hidden mb-4 shadow-inner">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                      {canAccess ? (
                        <button
                          onClick={() => setSelectedBook(book)}
                          className="px-4 py-2 bg-white text-slate-900 rounded-lg font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center gap-2"
                        >
                          <BookOpen className="size-4" /> Read Now
                        </button>
                      ) : (
                        <Link
                          to={`/ebooks/${book.id}`}
                          className="px-4 py-2 bg-white text-slate-900 rounded-lg font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center gap-2"
                        >
                          <ShoppingBag className="size-4" /> Buy Now
                        </Link>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 line-clamp-1 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">{book.author}</p>

                  <div className="mt-auto">
                    {canAccess ? (
                      <button
                        onClick={() => setSelectedBook(book)}
                        className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-emerald-600 transition-colors text-center shadow-lg hover:shadow-emerald-600/20 flex items-center justify-center gap-2"
                      >
                        <Eye className="size-4" /> Read Book
                      </button>
                    ) : (
                      <Link
                        to={`/ebooks/${book.id}`}
                        className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-sm hover:bg-slate-50 transition-colors text-center flex items-center justify-center gap-2"
                      >
                        <Lock className="size-4" /> Buy Now
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <BookOpen className="size-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-900 font-bold">No books found</h3>
            <p className="text-slate-500 text-sm">
              Try searching for something else.
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedBook && (
          <SecurePDFViewer
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const SecurePDFViewer = ({ book, onClose }) => {
  const getEmbedUrl = (url) => {
    if (!url) return "";
    try {
      if (url.includes("drive.google.com")) {
        let id = "";
        if (url.includes("/file/d/"))
          id = url.split("/file/d/")[1].split("/")[0];
        else if (url.includes("id=")) id = url.split("id=")[1].split("&")[0];
        if (id) return `https://drive.google.com/file/d/${id}/preview`;
      }
    } catch (e) {
      console.error(e);
    }
    return url;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-900 flex flex-col select-none"
    >
      <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 lg:px-8 z-50 shadow-md">
        <div className="flex items-center gap-4 text-white">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="size-6" />
          </button>
          <div className="flex flex-col">
            <span className="font-bold text-sm lg:text-base line-clamp-1">
              {book.title}
            </span>
            <span className="text-[10px] lg:text-xs text-slate-400">
              Reading Mode
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-slate-950 relative flex flex-col items-center justify-center p-0 lg:p-4">
        <div className="w-full h-full max-w-5xl bg-white lg:rounded-2xl overflow-hidden shadow-2xl relative">
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            onContextMenu={(e) => e.preventDefault()}
          ></div>
          <iframe
            src={getEmbedUrl(book.driveLink)}
            className="w-full h-full border-0"
            title="PDF Reader"
            allow="autoplay"
          ></iframe>
        </div>
      </div>
    </motion.div>
  );
};

export default EBookLibrary;
