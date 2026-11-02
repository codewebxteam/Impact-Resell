import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Filter,
  Check,
  X,
  Timer,
  Video,
  Sparkles,
  Download,
  ShieldCheck,
  CalendarCheck,
  UserCheck,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  increment,
  query,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const HOURS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const PERIODS = ["AM", "PM"];

export default function DemoManager() {
  // Slots & Bookings data
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Active view tab: 'slots' | 'bookings'
  const [activeTab, setActiveTab] = useState("slots");

  // Filters & Search
  const [selectedSlotFilter, setSelectedSlotFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create / Edit Slot Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  // Start Time State (12-hour government style dropdowns + manual toggle)
  const [startHour, setStartHour] = useState("04");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState("PM");
  const [startTimeManual, setStartTimeManual] = useState(false);
  const [startManualText, setStartManualText] = useState("");

  // End Time State (Optional, empty by default)
  const [endHour, setEndHour] = useState("");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState("PM");
  const [endTimeManual, setEndTimeManual] = useState(false);
  const [endManualText, setEndManualText] = useState("");

  const effectiveStartTime = startTimeManual
    ? startManualText.trim()
    : startHour
    ? `${startHour}:${startMinute} ${startPeriod}`
    : "";

  const effectiveEndTime = endTimeManual
    ? endManualText.trim()
    : endHour
    ? `${endHour}:${endMinute} ${endPeriod}`
    : "";

  const [slotForm, setSlotForm] = useState({
    date: new Date().toISOString().split("T")[0],
    duration: "45 Mins",
    topic: "",
    meetingLink: "",
    maxCapacity: "10",
  });

  // Real-time listener for demo_slots
  useEffect(() => {
    const q = query(collection(db, "demo_slots"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedSlots = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        // Sort descending by date
        loadedSlots.sort((a, b) => {
          if (a.date && b.date) {
            return b.date.localeCompare(a.date);
          }
          return 0;
        });
        setSlots(loadedSlots);
        setLoadingSlots(false);
      },
      (err) => {
        console.error("Error loading demo slots:", err);
        setLoadingSlots(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time listener for demo_bookings
  useEffect(() => {
    const q = query(collection(db, "demo_bookings"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedBookings = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        // Sort descending by createdAt
        loadedBookings.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        setBookings(loadedBookings);
        setLoadingBookings(false);
      },
      (err) => {
        console.error("Error loading demo bookings:", err);
        setLoadingBookings(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Quick duration helper
  const handleDurationChange = (duration) => {
    setSlotForm((prev) => ({
      ...prev,
      duration,
    }));
  };

  // Parse 12-hour formatted time (e.g. "04:30 PM") into parts
  const parseTime12h = (timeStr) => {
    if (!timeStr) return null;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      const h = match[1].padStart(2, "0");
      const m = match[2];
      const p = match[3].toUpperCase();
      return { hour: h, minute: m, period: p };
    }
    return null;
  };

  // Open modal in Create mode
  const handleOpenCreateModal = () => {
    setEditingSlotId(null);
    setFormError("");
    setStartHour("04");
    setStartMinute("00");
    setStartPeriod("PM");
    setStartTimeManual(false);
    setStartManualText("");
    setEndHour("");
    setEndMinute("00");
    setEndPeriod("PM");
    setEndTimeManual(false);
    setEndManualText("");
    setSlotForm({
      date: new Date().toISOString().split("T")[0],
      duration: "45 Mins",
      topic: "",
      meetingLink: "",
      maxCapacity: "10",
    });
    setIsCreateModalOpen(true);
  };

  // Open modal in Edit mode
  const handleOpenEditModal = (slot) => {
    setEditingSlotId(slot.id);
    setFormError("");

    // Parse start time
    const parsedStart = parseTime12h(slot.startTime);
    if (parsedStart && HOURS.includes(parsedStart.hour)) {
      setStartHour(parsedStart.hour);
      setStartMinute(parsedStart.minute);
      setStartPeriod(parsedStart.period);
      setStartTimeManual(false);
      setStartManualText("");
    } else if (slot.startTime) {
      setStartTimeManual(true);
      setStartManualText(slot.startTime);
    } else {
      setStartHour("04");
      setStartMinute("00");
      setStartPeriod("PM");
      setStartTimeManual(false);
      setStartManualText("");
    }

    // Parse end time (optional)
    const parsedEnd = parseTime12h(slot.endTime);
    if (parsedEnd && HOURS.includes(parsedEnd.hour)) {
      setEndHour(parsedEnd.hour);
      setEndMinute(parsedEnd.minute);
      setEndPeriod(parsedEnd.period);
      setEndTimeManual(false);
      setEndManualText("");
    } else if (slot.endTime) {
      setEndTimeManual(true);
      setEndManualText(slot.endTime);
    } else {
      setEndHour("");
      setEndMinute("00");
      setEndPeriod("PM");
      setEndTimeManual(false);
      setEndManualText("");
    }

    setSlotForm({
      date: slot.date || new Date().toISOString().split("T")[0],
      duration: slot.duration || "45 Mins",
      topic: slot.topic || "",
      meetingLink: slot.meetingLink || "",
      maxCapacity: String(slot.maxCapacity || 10),
    });

    setIsCreateModalOpen(true);
  };

  // Create or Update Slot Submit
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!slotForm.date || !effectiveStartTime || !slotForm.duration) {
      setFormError("Please select date, start time, and duration.");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        date: slotForm.date,
        startTime: effectiveStartTime,
        duration: slotForm.duration,
        endTime: effectiveEndTime || "",
        topic: slotForm.topic ? slotForm.topic.trim() : "",
        meetingLink: slotForm.meetingLink ? slotForm.meetingLink.trim() : "",
        maxCapacity: parseInt(slotForm.maxCapacity, 10) || 10,
      };

      if (editingSlotId) {
        // Update existing slot
        const slotRef = doc(db, "demo_slots", editingSlotId);
        await updateDoc(slotRef, {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new slot
        await addDoc(collection(db, "demo_slots"), {
          ...payload,
          bookedCount: 0,
          isActive: true,
          createdAt: serverTimestamp(),
        });
      }

      setIsCreateModalOpen(false);
      setEditingSlotId(null);
      setStartHour("04");
      setStartMinute("00");
      setStartPeriod("PM");
      setStartTimeManual(false);
      setStartManualText("");
      setEndHour("");
      setEndMinute("00");
      setEndPeriod("PM");
      setEndTimeManual(false);
      setEndManualText("");
      setSlotForm({
        date: new Date().toISOString().split("T")[0],
        duration: "45 Mins",
        topic: "",
        meetingLink: "",
        maxCapacity: "10",
      });
    } catch (err) {
      console.error("Error saving slot:", err);
      setFormError("Failed to save time slot: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  // Toggle slot active state
  const handleToggleActive = async (slotId, currentStatus) => {
    try {
      const slotRef = doc(db, "demo_slots", slotId);
      await updateDoc(slotRef, {
        isActive: !currentStatus,
      });
    } catch (err) {
      console.error("Error toggling slot active state:", err);
    }
  };

  // Delete slot
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to permanently delete this demo time slot?")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "demo_slots", slotId));
    } catch (err) {
      console.error("Error deleting slot:", err);
    }
  };

  // Update booking status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, "demo_bookings", bookingId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error updating booking status:", err);
    }
  };

  // Delete booking
  const handleDeleteBooking = async (bookingId, slotId) => {
    if (!window.confirm("Are you sure you want to delete this booking record?")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "demo_bookings", bookingId));
      if (slotId) {
        try {
          await updateDoc(doc(db, "demo_slots", slotId), {
            bookedCount: increment(-1),
          });
        } catch (_) {}
      }
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
  };

  // Count bookings for a specific slot
  const getSlotBookingsCount = (slotId) => {
    return bookings.filter((b) => b.slotId === slotId).length;
  };

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (selectedSlotFilter !== "all" && b.slotId !== selectedSlotFilter) {
        return false;
      }
      if (statusFilter !== "all" && b.status !== statusFilter) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const nameMatch = b.name?.toLowerCase().includes(term);
        const phoneMatch = b.phone?.includes(term);
        if (!nameMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [bookings, selectedSlotFilter, statusFilter, searchTerm]);

  // Total stats
  const activeSlotsCount = slots.filter((s) => s.isActive).length;
  const totalBookingsCount = bookings.length;
  const confirmedBookingsCount = bookings.filter((b) => b.status === "confirmed" || !b.status).length;
  const attendedBookingsCount = bookings.filter((b) => b.status === "attended").length;

  // Export Bookings CSV
  const handleExportCSV = () => {
    const headers = "ID,Name,Phone,Slot Date,Slot Time,Duration,Status,Booked At\n";
    const rows = filteredBookings
      .map((b) => {
        const dateStr = b.createdAt?.toDate ? b.createdAt.toDate().toISOString() : "";
        return `"${b.id}","${b.name || ""}","${b.phone || ""}","${b.slotDate || ""}","${
          b.slotStartTime || ""
        }","${b.slotDuration || ""}","${b.status || "confirmed"}","${dateStr}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `demo_bookings_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-emerald-600" />
              Alife Stable • Demo Hub
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Live Demo Slots & Bookings
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1 max-w-2xl">
            Configure live demonstration time slots, manage slot durations, and track incoming student and partner booking requests in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {bookings.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export CSV
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Demo Slot
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (Light Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Slots */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Time Slots
            </p>
            <p className="text-3xl font-black text-slate-900 mt-1">
              {activeSlotsCount}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {slots.length} total scheduled
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Total Bookings */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Demo Bookings
            </p>
            <p className="text-3xl font-black text-indigo-600 mt-1">
              {totalBookingsCount}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Registered from website
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Confirmed Bookings */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Confirmed Queue
            </p>
            <p className="text-3xl font-black text-amber-600 mt-1">
              {confirmedBookingsCount}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Ready for walkthrough
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Attended Sessions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Attended Demos
            </p>
            <p className="text-3xl font-black text-sky-600 mt-1">
              {attendedBookingsCount}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Completed walkthroughs
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-xs">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Pill Style) */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab("slots")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "slots"
              ? "border-emerald-600 text-emerald-700 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Configured Slots</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 font-bold">
            {slots.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("bookings")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "bookings"
              ? "border-emerald-600 text-emerald-700 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Bookings</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 font-bold">
            {bookings.length}
          </span>
        </button>
      </div>

      {/* TAB 1: SLOTS MANAGEMENT (LIGHT THEME) */}
      {activeTab === "slots" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Available Time Slots</h2>
              <p className="text-xs text-slate-500 font-medium">
                These slots dynamically appear on the Alife Stable booking modal for visitors.
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Another Slot
            </button>
          </div>

          {loadingSlots ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="font-semibold text-xs">Loading slots from database...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">No Demo Time Slots Configured Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Create your first time slot with date, time, and session duration. Website visitors will immediately see and book it.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create First Time Slot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => {
                const bookedCount = getSlotBookingsCount(slot.id);
                const isFull = slot.maxCapacity && bookedCount >= slot.maxCapacity;

                return (
                  <div
                    key={slot.id}
                    className={`bg-white border rounded-2xl p-5 space-y-4 transition-all duration-200 shadow-xs relative overflow-hidden ${
                      slot.isActive
                        ? "border-slate-200/90 hover:border-emerald-500 hover:shadow-md"
                        : "border-slate-200/60 opacity-60 bg-slate-50/50"
                    }`}
                  >
                    {/* Status Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            slot.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                          }`}
                        />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                          {slot.isActive ? "Live on Website" : "Paused"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(slot)}
                          title="Edit Time Slot"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(slot.id, slot.isActive)}
                          title={slot.isActive ? "Pause Slot" : "Activate Slot"}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            slot.isActive
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {slot.isActive ? "Pause" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          title="Delete Slot"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div>
                      <div className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <span>{slot.startTime}</span>
                        {slot.endTime && (
                          <>
                            <span className="text-slate-400 text-sm font-normal">–</span>
                            <span className="text-slate-600 text-base font-bold">{slot.endTime}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          {slot.date}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                          <Timer className="w-3 h-3 text-sky-600" />
                          Duration: {slot.duration || "45 Mins"}
                        </span>
                      </div>
                    </div>

                    {/* Topic Note */}
                    {slot.topic && (
                      <p className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 font-medium truncate">
                        📌 {slot.topic}
                      </p>
                    )}

                    {/* Booked Attendees Counter */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          Registered Attendees:
                        </span>
                        <span
                          className={`font-black ${
                            bookedCount > 0 ? "text-indigo-600" : "text-slate-400"
                          }`}
                        >
                          {bookedCount} {slot.maxCapacity ? `/ ${slot.maxCapacity}` : "users"}
                        </span>
                      </div>

                      {/* View Users Button */}
                      <button
                        onClick={() => {
                          setSelectedSlotFilter(slot.id);
                          setActiveTab("bookings");
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        View Booked Users ({bookedCount})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BOOKINGS LIST (LIGHT THEME TABLE) */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search attendee by Name or Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Slot:</span>
              </div>
              <select
                value={selectedSlotFilter}
                onChange={(e) => setSelectedSlotFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">All Time Slots ({bookings.length})</option>
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} • {s.startTime} ({s.duration}) - [{getSlotBookingsCount(s.id)} booked]
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="attended">Attended</option>
                <option value="converted">Converted to Partner</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          {loadingBookings ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="font-semibold text-xs">Loading attendee bookings...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-2 shadow-xs">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-base font-black text-slate-800">No Booking Records Found</p>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                No users have booked for this filtered criteria yet.
              </p>
              {selectedSlotFilter !== "all" && (
                <button
                  onClick={() => setSelectedSlotFilter("all")}
                  className="mt-2 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  View all slot bookings
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Attendee Details</th>
                      <th className="py-3.5 px-4">Scheduled Slot</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Booking Time</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Direct Contact & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredBookings.map((b) => {
                      const cleanPhone = (b.phone || "").replace(/\D/g, "");
                      const waLink = `https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(
                        b.name || "Student"
                      )},%20I%20am%20from%20Alife%20Stable.%20Regarding%20your%20free%20demo%20booking%20for%20${encodeURIComponent(
                        b.slotDate || ""
                      )}%20${encodeURIComponent(b.slotStartTime || "")}.`;

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Attendee Name & Phone */}
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-sm text-slate-900">{b.name}</div>
                            <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              {b.phone}
                            </div>
                          </td>

                          {/* Slot Info */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                              {b.slotDate || b.slotTitle || "Flexible Slot"}
                            </div>
                            <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-sky-600" />
                              {b.slotStartTime || "Direct Callback"}
                            </div>
                          </td>

                          {/* Duration Badge */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-extrabold text-[11px] border border-sky-200">
                              <Timer className="w-3 h-3 text-sky-600" />
                              {b.slotDuration || "45 Mins"}
                            </span>
                          </td>

                          {/* Timestamp */}
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {b.createdAt?.toDate
                              ? b.createdAt.toDate().toLocaleString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Just now"}
                          </td>

                          {/* Status Dropdown */}
                          <td className="py-3.5 px-4">
                            <select
                              value={b.status || "confirmed"}
                              onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="attended">Attended</option>
                              <option value="converted">Converted</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>

                          {/* Contact Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* WhatsApp Direct */}
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all shadow-2xs"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                WhatsApp
                              </a>

                              {/* Direct Phone Call */}
                              <a
                                href={`tel:${cleanPhone}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold transition-all shadow-2xs"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                Call
                              </a>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteBooking(b.id, b.slotId)}
                                title="Delete Booking Record"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE SLOT MODAL (LIGHT THEME) */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {editingSlotId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingSlotId ? "Edit Demo Time Slot" : "Create New Demo Slot"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {editingSlotId
                      ? "Update slot date, time, duration, and capacity."
                      : "Set up a time slot and duration for live demos."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
              {/* Field 1: Date */}
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1.5">
                  Slot Date <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split("T")[0];
                      setSlotForm((prev) => ({ ...prev, date: today }));
                    }}
                    className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition-colors ${
                      slotForm.date === new Date().toISOString().split("T")[0]
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setSlotForm((prev) => ({
                        ...prev,
                        date: tomorrow.toISOString().split("T")[0],
                      }));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white font-bold cursor-pointer"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const dayAfter = new Date();
                      dayAfter.setDate(dayAfter.getDate() + 2);
                      setSlotForm((prev) => ({
                        ...prev,
                        date: dayAfter.toISOString().split("T")[0],
                      }));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white font-bold cursor-pointer"
                  >
                    Day After
                  </button>
                </div>
                <input
                  type="date"
                  required
                  value={slotForm.date}
                  onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                />
              </div>

              {/* Field 2: Start Time & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-700 font-bold uppercase tracking-wider text-xs">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setStartTimeManual(!startTimeManual)}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      {startTimeManual ? "Use Dropdown (HH:MM)" : "Type Manually"}
                    </button>
                  </div>

                  {!startTimeManual ? (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-3 gap-1.5">
                        {/* Hour */}
                        <div>
                          <select
                            value={startHour}
                            onChange={(e) => setStartHour(e.target.value)}
                            className="w-full px-2 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer text-center"
                          >
                            {HOURS.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                          <span className="block text-[9px] text-center text-slate-400 mt-0.5">Hour</span>
                        </div>

                        {/* Minute */}
                        <div>
                          <select
                            value={startMinute}
                            onChange={(e) => setStartMinute(e.target.value)}
                            className="w-full px-2 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer text-center"
                          >
                            {MINUTES.map((m) => (
                              <option key={m} value={m}>
                                :{m}
                              </option>
                            ))}
                          </select>
                          <span className="block text-[9px] text-center text-slate-400 mt-0.5">Minute</span>
                        </div>

                        {/* AM/PM */}
                        <div>
                          <select
                            value={startPeriod}
                            onChange={(e) => setStartPeriod(e.target.value)}
                            className="w-full px-2 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-black focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer text-center"
                          >
                            {PERIODS.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                          <span className="block text-[9px] text-center text-slate-400 mt-0.5">AM/PM</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 font-medium">
                        Selected: <strong className="text-slate-900 font-extrabold">{effectiveStartTime}</strong>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 04:00 PM"
                        value={startManualText}
                        onChange={(e) => setStartManualText(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">12-hour format with AM/PM (e.g. 04:00 PM)</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1.5 text-xs">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={slotForm.duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors font-bold cursor-pointer text-xs"
                  >
                    <option value="30 Mins">30 Mins (Quick Overview)</option>
                    <option value="45 Mins">45 Mins (Standard Complete Demo)</option>
                    <option value="60 Mins">60 Mins (Deep Dive + Q&A)</option>
                    <option value="90 Mins">90 Mins (Workshop Session)</option>
                  </select>
                </div>
              </div>

              {/* Field 3: End Time & Max Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-700 font-bold uppercase tracking-wider text-xs">
                      End Time (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      {endHour && !endTimeManual && (
                        <button
                          type="button"
                          onClick={() => setEndHour("")}
                          className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEndTimeManual(!endTimeManual)}
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                      >
                        {endTimeManual ? "Use Dropdown" : "Type Manually"}
                      </button>
                    </div>
                  </div>

                  {!endTimeManual ? (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-3 gap-1.5">
                        {/* Hour */}
                        <div>
                          <select
                            value={endHour}
                            onChange={(e) => setEndHour(e.target.value)}
                            className="w-full px-2 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer text-center"
                          >
                            <option value="">--</option>
                            {HOURS.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                          <span className="block text-[9px] text-center text-slate-400 mt-0.5">Hour</span>
                        </div>

                        {/* Minute */}
                        <div>
                          <select
                            value={endMinute}
                            onChange={(e) => setEndMinute(e.target.value)}
                            disabled={!endHour}
                            className="w-full px-2 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer text-center disabled:opacity-40"
                          >
                            {MINUTES.map((m) => (
                              <option key={m} value={m}>
                                :{m}
                              </option>
                            ))}
                          </select>
                          <span className="block text-[9px] text-center text-slate-400 mt-0.5">Minute</span>
                        </div>

                        {/* AM/PM */}
                        <div>
                          <select
                            value={endPeriod}
                            onChange={(e) => setEndPeriod(e.target.value)}
                            disabled={!endHour}
                            className="w-full px-2 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-black focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer text-center disabled:opacity-40"
                          >
                            {PERIODS.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                          <span className="block text-[9px] text-center text-slate-400 mt-0.5">AM/PM</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 font-medium">
                        Selected: <strong className="text-slate-900 font-extrabold">{effectiveEndTime || "None (Optional)"}</strong>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="e.g. 04:45 PM"
                        value={endManualText}
                        onChange={(e) => setEndManualText(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Leave blank or type in 12-hour format</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1.5">
                    Max Capacity (Max Bookings)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    value={slotForm.maxCapacity}
                    onChange={(e) => setSlotForm({ ...slotForm, maxCapacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
                  />
                </div>
              </div>

              {/* Field 4: Topic / Title (No prefilled data) */}
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1.5">
                  Demo Session Title / Topic (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alife Stable Turnkey Platform Demo"
                  value={slotForm.topic}
                  onChange={(e) => setSlotForm({ ...slotForm, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors font-medium text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/30 disabled:opacity-50 transition-all active:scale-95"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {editingSlotId ? "Saving Changes..." : "Publishing Slot..."}
                    </>
                  ) : editingSlotId ? (
                    "Save Changes"
                  ) : (
                    "Publish Time Slot"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
