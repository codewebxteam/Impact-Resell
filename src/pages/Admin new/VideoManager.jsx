import React, { useState, useEffect } from "react";
import {
  Video,
  Plus,
  Trash2,
  X,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const VideoManager = () => {
  const [videos, setVideos] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [newVideo, setNewVideo] = useState({
    title: "",
    price: "299",
    originalPrice: "999",
    lectures: [],
  });

  const [tempUrl, setTempUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courseVideos"));
      const videoList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by newest first
      videoList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setVideos(videoList);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVideos = videos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(videos.length / itemsPerPage);

  const extractVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleAddLink = () => {
    const videoId = extractVideoId(tempUrl);
    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }
    const lecture = {
      id: Date.now(),
      videoId,
      url: tempUrl,
      title: `Part ${newVideo.lectures.length + 1}`,
    };
    setNewVideo({ ...newVideo, lectures: [...newVideo.lectures, lecture] });
    setTempUrl("");
  };

  const handleRemoveLink = (id) => {
    setNewVideo({
      ...newVideo,
      lectures: newVideo.lectures.filter((l) => l.id !== id),
    });
  };

  const handleAddVideo = async () => {
    if (!newVideo.title || newVideo.lectures.length === 0 || !newVideo.price) {
      alert("Please fill all fields and add at least one video");
      return;
    }

    setLoading(true);
    try {
      // [LOGIC] Thumbnail from 1st video
      const firstVid = newVideo.lectures[0];
      const thumbUrl = `https://img.youtube.com/vi/${firstVid.videoId}/maxresdefault.jpg`;

      await addDoc(collection(db, "courseVideos"), {
        title: newVideo.title,
        lectures: newVideo.lectures, // Saving list

        // Backward compatibility
        url: firstVid.url,
        videoId: firstVid.videoId,

        image: thumbUrl, // Saving thumbnail
        price: newVideo.price,
        originalPrice: newVideo.originalPrice,
        uploadedBy: "admin",
        uploaderRole: "admin",
        partnerId: "admin",
        createdByAdmin: true,
        instructor: "Admin",
        createdAt: new Date().toISOString(),
        lecturesCount: newVideo.lectures.length + " Parts",
      });

      setNewVideo({
        title: "",
        price: "299",
        originalPrice: "999",
        lectures: [],
      });
      setTempUrl("");
      setShowAddForm(false);
      fetchVideos();
    } catch (error) {
      console.error("Error adding video:", error);
      alert("Failed to add video");
    }
    setLoading(false);
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm("Delete this video package permanently?")) return;
    try {
      await deleteDoc(doc(db, "courseVideos", id));
      // Immediate UI update
      setVideos(videos.filter((v) => v.id !== id));
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            YouTube Videos
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage videos displayed on courses page
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? "Cancel" : "Add Video"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Add New Video Package
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newVideo.title}
                onChange={(e) =>
                  setNewVideo({ ...newVideo, title: e.target.value })
                }
                placeholder="Enter title"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Add Videos Section */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Add Videos (One by One)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="YouTube Link..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
                />
                <button
                  onClick={handleAddLink}
                  className="bg-slate-900 text-white px-4 rounded-xl font-bold"
                >
                  Add
                </button>
              </div>

              {/* List */}
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {newVideo.lectures.map((l, i) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <span className="text-xs font-bold text-slate-400">
                      #{i + 1}
                    </span>
                    <p className="text-xs font-medium truncate flex-1">
                      {l.url}
                    </p>
                    <button onClick={() => handleRemoveLink(l.id)}>
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                ))}
                {newVideo.lectures.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">
                    No videos added.
                  </p>
                )}
              </div>

              {/* Thumbnail Notice */}
              {newVideo.lectures.length > 0 && (
                <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Thumbnail will be set from Video #1
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={newVideo.price}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, price: e.target.value })
                  }
                  placeholder="299"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Original Price (₹)
                </label>
                <input
                  type="number"
                  value={newVideo.originalPrice}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, originalPrice: e.target.value })
                  }
                  placeholder="999"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <button
              onClick={handleAddVideo}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Videos"}
            </button>
          </div>
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentVideos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="aspect-video bg-slate-100 relative">
              <img
                src={
                  video.image ||
                  `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`
                }
                alt={video.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://img.youtube.com/vi/default/maxresdefault.jpg";
                }}
              />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">
                {video.lecturesCount ||
                  (video.lectures ? video.lectures.length : 1)}{" "}
                Videos
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-slate-900 mb-2 line-clamp-2">
                {video.title}
              </h4>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-bold text-slate-900">
                  ₹{video.price}
                </span>
                {video.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{video.originalPrice}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteVideo(video.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all text-sm w-full justify-center"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {videos.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-4 mt-8 pb-8">
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

      {videos.length === 0 && !showAddForm && (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <Video size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            No Videos Yet
          </h3>
          <p className="text-slate-500">Add your first YouTube video</p>
        </div>
      )}
    </div>
  );
};

export default VideoManager;
