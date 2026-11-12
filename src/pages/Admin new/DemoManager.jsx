import React, { useState, useEffect, useMemo, useRef } from "react";
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
  ChevronLeft,
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
  Mail,
  TrendingUp,
  Briefcase,
  GraduationCap,
  SlidersHorizontal,
  Ban,
  PlusCircle,
  Copy,
  Link2,
  Utensils,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  serverTimestamp,
  increment,
  query,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  DAY_KEYS,
  DAY_LABELS,
  DEFAULT_SCHEDULE_CONFIG,
  TIME_OPTIONS,
  generateUpcomingSlots,
  generateSlotsForDate,
} from "../../utils/demoSchedule";

const HOURS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const PERIODS = ["AM", "PM"];

const REMARK_OPTIONS = [
  "Pending",
  "Completed",
  "Partnership Enrolled",
  "Student Enrolled",
  "Demo no show",
  "Reschedule",
  "Cancelled",
];

const REMARK_STYLES = {
  Pending: "bg-slate-100 text-slate-700 border-slate-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Partnership Enrolled": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Student Enrolled": "bg-sky-50 text-sky-700 border-sky-200",
  "Demo no show": "bg-amber-50 text-amber-700 border-amber-200",
  Reschedule: "bg-purple-50 text-purple-700 border-purple-200",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const isIsoDate = (str) => typeof str === "string" && /^\d{4}-\d{2}-\d{2}$/.test(str);

const getLocalDateStr = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getNormalizedRemark = (booking) => {
  const raw = (booking?.remark || "").trim();
  if (raw) {
    if (raw === "Partnership Ernrolled") return "Partnership Enrolled";
    return raw;
  }
  const legacyStatus = (booking?.status || "").toLowerCase();
  if (legacyStatus === "attended") return "Completed";
  if (legacyStatus === "converted") return "Partnership Enrolled";
  if (legacyStatus === "cancelled") return "Cancelled";
  return "Pending";
};

export default function DemoManager() {
  // Slots & Bookings data
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [scheduleConfig, setScheduleConfig] = useState(DEFAULT_SCHEDULE_CONFIG);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Google Calendar-Style Schedule Builder Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState(DEFAULT_SCHEDULE_CONFIG);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [copiedDayToast, setCopiedDayToast] = useState(null);
  const [copiedLinkToast, setCopiedLinkToast] = useState(false);

  // Date & Table Filters
  const [dateFilter, setDateFilter] = useState("all"); // all | today | yesterday | 7days | 30days | month | specific | custom
  const [specificDate, setSpecificDate] = useState(() => getLocalDateStr());
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [remarkFilter, setRemarkFilter] = useState("all");
  const [stripFilter, setStripFilter] = useState("all"); // all | attending_today | upcoming | Demo no show | Reschedule | Cancelled
  const [selectedSlotFilter, setSelectedSlotFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Inline Staff Name editing state
  const [staffDrafts, setStaffDrafts] = useState({});
  const [savedStaffId, setSavedStaffId] = useState(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState(null);

  const handleCopyPhone = (bookingId, phoneStr) => {
    if (!phoneStr) return;
    navigator.clipboard?.writeText(phoneStr);
    setCopiedPhoneId(bookingId);
    setTimeout(() => {
      setCopiedPhoneId((prev) => (prev === bookingId ? null : prev));
    }, 1500);
  };

  // Horizontal slots container ref
  const slotsScrollRef = useRef(null);

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

  // Real-time listener for demo_slots (including schedule_config & manual slots)
  useEffect(() => {
    const q = query(collection(db, "demo_slots"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let foundSchedule = null;
        const manualSlots = [];

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (docSnap.id === "schedule_config" || data.type === "schedule_config") {
            foundSchedule = {
              ...DEFAULT_SCHEDULE_CONFIG,
              ...data,
              availability: {
                ...DEFAULT_SCHEDULE_CONFIG.availability,
                ...(data.availability || {}),
              },
            };
          } else if (data.type !== "slot_counter") {
            manualSlots.push({
              id: docSnap.id,
              ...data,
            });
          }
        });

        if (foundSchedule) {
          setScheduleConfig(foundSchedule);
        }

        manualSlots.sort((a, b) => {
          if (a.date && b.date) {
            return b.date.localeCompare(a.date);
          }
          return 0;
        });
        setSlots(manualSlots);
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

  // Update Demo Remarks (and sync legacy status)
  const handleUpdateRemark = async (bookingId, newRemark) => {
    try {
      let mappedStatus = "confirmed";
      if (newRemark === "Completed") mappedStatus = "attended";
      else if (newRemark === "Partnership Enrolled" || newRemark === "Student Enrolled") mappedStatus = "converted";
      else if (newRemark === "Cancelled") mappedStatus = "cancelled";

      await updateDoc(doc(db, "demo_bookings", bookingId), {
        remark: newRemark,
        status: mappedStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error updating demo remark:", err);
    }
  };

  // Save Staff Name inline
  const handleSaveStaffName = async (bookingId, newName) => {
    const clean = (newName || "").trim();
    try {
      await updateDoc(doc(db, "demo_bookings", bookingId), {
        staffName: clean,
        updatedAt: serverTimestamp(),
      });
      setSavedStaffId(bookingId);
      setTimeout(() => {
        setSavedStaffId((prev) => (prev === bookingId ? null : prev));
      }, 1500);
    } catch (err) {
      console.error("Error updating staff name:", err);
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

  // Horizontal scroll helper for slots
  const scrollSlots = (offset) => {
    if (slotsScrollRef.current) {
      slotsScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const todayStr = getLocalDateStr();

  // Extract date string for a booking (prefer slotDate if YYYY-MM-DD, fallback to createdAt)
  const getBookingDateStr = (b) => {
    if (isIsoDate(b.slotDate)) return b.slotDate;
    if (b.createdAt?.toDate) return getLocalDateStr(b.createdAt.toDate());
    return "";
  };

  const getBookedOnDateStr = (b) => {
    if (b.createdAt?.toDate) return getLocalDateStr(b.createdAt.toDate());
    if (isIsoDate(b.slotDate)) return b.slotDate;
    return "";
  };

  // 1. Date Filtered Bookings (drives all KPI cards, status strip, and table)
  const dateFilteredBookings = useMemo(() => {
    if (dateFilter === "all") return bookings;

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = getLocalDateStr(yesterday);

    const last7 = new Date(now);
    last7.setDate(now.getDate() - 6);
    const last7Str = getLocalDateStr(last7);

    const last30 = new Date(now);
    last30.setDate(now.getDate() - 29);
    const last30Str = getLocalDateStr(last30);

    const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    return bookings.filter((b) => {
      const targetDate = getBookingDateStr(b);
      if (!targetDate) return false;

      if (dateFilter === "today") return targetDate === todayStr;
      if (dateFilter === "yesterday") return targetDate === yesterdayStr;
      if (dateFilter === "7days") return targetDate >= last7Str && targetDate <= todayStr;
      if (dateFilter === "30days") return targetDate >= last30Str && targetDate <= todayStr;
      if (dateFilter === "month") return targetDate >= monthStartStr;
      if (dateFilter === "specific") return specificDate ? targetDate === specificDate : true;
      if (dateFilter === "custom") {
        if (customStartDate && targetDate < customStartDate) return false;
        if (customEndDate && targetDate > customEndDate) return false;
        return true;
      }
      return true;
    });
  }, [bookings, dateFilter, specificDate, customStartDate, customEndDate, todayStr]);

  // 2. KPI Metrics computed from dateFilteredBookings
  const metrics = useMemo(() => {
    const total = dateFilteredBookings.length;
    const todayCount = dateFilteredBookings.filter(
      (b) => getBookedOnDateStr(b) === todayStr
    ).length;

    let completedOnly = 0;
    let studentEnrolled = 0;
    let partnershipEnrolled = 0;
    let noShow = 0;
    let reschedule = 0;
    let cancelled = 0;
    let attendingToday = 0;
    let upcoming = 0;

    dateFilteredBookings.forEach((b) => {
      const remark = getNormalizedRemark(b);
      const slotDate = isIsoDate(b.slotDate) ? b.slotDate : "";

      if (remark === "Completed") completedOnly++;
      else if (remark === "Student Enrolled") studentEnrolled++;
      else if (remark === "Partnership Enrolled") partnershipEnrolled++;
      else if (remark === "Demo no show") noShow++;
      else if (remark === "Reschedule") reschedule++;
      else if (remark === "Cancelled") cancelled++;

      if (
        slotDate === todayStr &&
        !["Demo no show", "Cancelled"].includes(remark)
      ) {
        attendingToday++;
      }

      if (
        slotDate > todayStr &&
        !["Demo no show", "Cancelled"].includes(remark)
      ) {
        upcoming++;
      }
    });

    // All who completed the demo (Completed + Student Enrolled + Partnership Enrolled)
    const totalCompleted = completedOnly + studentEnrolled + partnershipEnrolled;
    const completedPct =
      total > 0 ? Number(((totalCompleted / total) * 100).toFixed(1)) : 0;
    const studentPct =
      totalCompleted > 0
        ? Number(((studentEnrolled / totalCompleted) * 100).toFixed(1))
        : 0;
    const partnershipPct =
      totalCompleted > 0
        ? Number(((partnershipEnrolled / totalCompleted) * 100).toFixed(1))
        : 0;

    return {
      total,
      todayCount,
      totalCompleted,
      completedPct,
      studentEnrolled,
      studentPct,
      partnershipEnrolled,
      partnershipPct,
      attendingToday,
      upcoming,
      noShow,
      reschedule,
      cancelled,
    };
  }, [dateFilteredBookings, todayStr]);

  // Schedule Builder Modal Handlers (Google Calendar-style)
  const handleOpenScheduleModal = () => {
    setScheduleDraft(JSON.parse(JSON.stringify(scheduleConfig)));
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setSavingSchedule(true);
    try {
      await setDoc(doc(db, "demo_slots", "schedule_config"), {
        ...scheduleDraft,
        type: "schedule_config",
        isActive: true,
        updatedAt: serverTimestamp(),
      });
      setIsScheduleModalOpen(false);
    } catch (err) {
      console.error("Error saving demo schedule:", err);
      alert("Failed to save schedule: " + err.message);
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleAddWindow = (dayKey) => {
    setScheduleDraft((prev) => {
      const existing = prev.availability?.[dayKey] || [];
      const nextWindow =
        existing.length === 0
          ? { start: "10:00", end: "18:00" }
          : { start: "14:00", end: "18:30" };
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [dayKey]: [...existing, nextWindow],
        },
      };
    });
  };

  const handleRemoveWindow = (dayKey, index) => {
    setScheduleDraft((prev) => {
      const existing = prev.availability?.[dayKey] || [];
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [dayKey]: existing.filter((_, idx) => idx !== index),
        },
      };
    });
  };

  const handleUpdateWindow = (dayKey, index, field, value) => {
    setScheduleDraft((prev) => {
      const existing = [...(prev.availability?.[dayKey] || [])];
      existing[index] = { ...existing[index], [field]: value };
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [dayKey]: existing,
        },
      };
    });
  };

  const handleCopyToAllDays = (sourceDayKey) => {
    setScheduleDraft((prev) => {
      const sourceWindows = prev.availability?.[sourceDayKey] || [];
      const updatedAvailability = { ...prev.availability };
      DAY_KEYS.forEach((dk) => {
        // Copy to Mon-Sat by default, or all if Sunday itself has windows
        if (dk !== "sun" || sourceDayKey === "sun") {
          updatedAvailability[dk] = sourceWindows.map((w) => ({ ...w }));
        }
      });
      return {
        ...prev,
        availability: updatedAvailability,
      };
    });
    setCopiedDayToast(sourceDayKey);
    setTimeout(() => setCopiedDayToast(null), 1500);
  };

  const handleApplyLunchBreak = () => {
    setScheduleDraft((prev) => {
      const updatedAvailability = { ...prev.availability };
      DAY_KEYS.forEach((dk) => {
        const list = updatedAvailability[dk] || [];
        if (list.length > 0) {
          updatedAvailability[dk] = [
            { start: list[0].start || "10:00", end: "13:00" },
            { start: "14:00", end: list[list.length - 1].end || "18:30" },
          ];
        }
      });
      return { ...prev, availability: updatedAvailability };
    });
  };

  const handleCopyBookingLink = () => {
    const link = "https://www.alifestable.com/book-demo";
    navigator.clipboard?.writeText(link);
    setCopiedLinkToast(true);
    setTimeout(() => setCopiedLinkToast(false), 2000);
  };

  // Count bookings for a specific slot
  const getSlotBookingsCount = (slotId) => {
    return dateFilteredBookings.filter(
      (b) =>
        (b.slotKey === slotId || b.slotId === slotId) &&
        getNormalizedRemark(b) !== "Cancelled"
    ).length;
  };

  // Upcoming & Available Slots (Generated from Google Calendar Schedule + any manual slots)
  const sortedSlots = useMemo(() => {
    const generated = generateUpcomingSlots(scheduleConfig, 7).map((s) => ({
      ...s,
      isGenerated: true,
      isActive: true,
    }));

    const manualUpcoming = slots
      .filter((s) => (s.date || "") >= todayStr)
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

    return [...generated, ...manualUpcoming];
  }, [scheduleConfig, slots, todayStr]);

  // 3. Final Filtered Bookings for Table (Date + Slot + Strip + Remarks + Search)
  const filteredBookings = useMemo(() => {
    return dateFilteredBookings.filter((b) => {
      const remark = getNormalizedRemark(b);
      const slotDate = isIsoDate(b.slotDate) ? b.slotDate : "";

      if (
        selectedSlotFilter !== "all" &&
        b.slotId !== selectedSlotFilter &&
        b.slotKey !== selectedSlotFilter
      ) {
        return false;
      }

      if (remarkFilter !== "all" && remark !== remarkFilter) {
        return false;
      }

      if (stripFilter !== "all") {
        if (stripFilter === "attending_today") {
          if (
            !(
              slotDate === todayStr &&
              !["Demo no show", "Cancelled"].includes(remark)
            )
          ) {
            return false;
          }
        } else if (stripFilter === "upcoming") {
          if (
            !(
              slotDate > todayStr &&
              !["Demo no show", "Cancelled"].includes(remark)
            )
          ) {
            return false;
          }
        } else if (remark !== stripFilter) {
          return false;
        }
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const nameMatch = b.name?.toLowerCase().includes(term);
        const phoneMatch = b.phone?.toLowerCase().includes(term);
        const emailMatch = b.email?.toLowerCase().includes(term);
        const staffMatch = b.staffName?.toLowerCase().includes(term);
        if (!nameMatch && !phoneMatch && !emailMatch && !staffMatch) return false;
      }

      return true;
    });
  }, [dateFilteredBookings, selectedSlotFilter, remarkFilter, stripFilter, searchTerm, todayStr]);

  // Export Bookings CSV
  const handleExportCSV = () => {
    const headers = "Name,WhatsApp,Email,Slot Time,Slot Date,Duration,Staff Name,Demo Remarks,Booked At\n";
    const rows = filteredBookings
      .map((b) => {
        const dateStr = b.createdAt?.toDate ? b.createdAt.toDate().toISOString() : "";
        const slotTime = b.slotEndTime
          ? `${b.slotStartTime || ""} - ${b.slotEndTime}`
          : b.slotStartTime || "";
        return `"${b.name || ""}","${b.phone || ""}","${b.email || ""}","${slotTime}","${
          b.slotDate || ""
        }","${b.slotDuration || ""}","${b.staffName || ""}","${getNormalizedRemark(b)}","${dateStr}"`;
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
      {/* Top Header + Filter by Date */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-emerald-600" />
              Alife Stable • Demo Manager
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Demo Manager & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl">
            Configure weekly availability, lunch breaks, buffer time & capacity like Google Calendar, and track attendee remarks in real time.
          </p>
        </div>

        {/* Right Controls: Filter by Date + Export + Copy Link + Schedule */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-start xl:justify-end">
          {/* Filter by Date */}
          <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-600">Filter by Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="month">This Month</option>
              <option value="specific">Specific Date</option>
              <option value="custom">Custom Range</option>
            </select>

            {dateFilter === "specific" && (
              <input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
              />
            )}

            {dateFilter === "custom" && (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopyBookingLink}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            {copiedLinkToast ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 text-slate-500" />
                <span>Copy Booking Link</span>
              </>
            )}
          </button>

          {filteredBookings.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export CSV
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenScheduleModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Set Demo Schedule
          </button>
        </div>
      </div>

      {/* 5 KPI CARDS ROW (Matches Wireframe) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Booking */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-2 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Booking
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {metrics.total}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {dateFilter === "all" ? "All time bookings" : "In selected date range"}
            </p>
          </div>
        </div>

        {/* Card 2: Today Booking */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-2 hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Today Booking
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">
              {metrics.todayCount}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Booked today ({todayStr})
            </p>
          </div>
        </div>

        {/* Card 3: Demo Completed (%) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-2 hover:border-teal-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Demo Completed (%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-black text-teal-700">
                {metrics.completedPct}%
              </p>
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                {metrics.totalCompleted}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {metrics.totalCompleted} of {metrics.total} total bookings
            </p>
          </div>
        </div>

        {/* Card 4: Enrolled Student (%) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-2 hover:border-sky-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Student (%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-black text-sky-600">
                {metrics.studentPct}%
              </p>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                {metrics.studentEnrolled}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {metrics.studentEnrolled} of {metrics.totalCompleted} completed demos
            </p>
          </div>
        </div>

        {/* Card 5: Enrolled Partnership (%) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-2 hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Partnership (%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">
                {metrics.partnershipPct}%
              </p>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                {metrics.partnershipEnrolled}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {metrics.partnershipEnrolled} of {metrics.totalCompleted} completed demos
            </p>
          </div>
        </div>
      </div>

      {/* STATUS SUMMARY BAR: Attending Today : Upcoming Booking : Demo no show : Reschedule : Cancelled */}
      <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full justify-between">
          {[
            { key: "attending_today", label: "Attending Today", count: metrics.attendingToday, dot: "bg-emerald-400" },
            { key: "upcoming", label: "Upcoming Booking", count: metrics.upcoming, dot: "bg-sky-400" },
            { key: "Demo no show", label: "Demo no show", count: metrics.noShow, dot: "bg-amber-400" },
            { key: "Reschedule", label: "Reschedule", count: metrics.reschedule, dot: "bg-purple-400" },
            { key: "Cancelled", label: "Cancelled", count: metrics.cancelled, dot: "bg-rose-400" },
          ].map((item) => {
            const isSelected = stripFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setStripFilter(isSelected ? "all" : item.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-xs"
                    : "bg-white/10 hover:bg-white/15 text-slate-100"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                <span>
                  {item.label} ({item.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* UPCOMING & AVAILABLE TIME SLOTS (HORIZONTAL SCROLLABLE SECTION) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Available & Upcoming Slots
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {sortedSlots.length}
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 font-semibold">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                ⏱ Duration: {scheduleConfig.durationMinutes} Mins
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                ⏸ Buffer:{" "}
                {scheduleConfig.bufferEnabled
                  ? `${scheduleConfig.bufferValue} ${scheduleConfig.bufferUnit}`
                  : "None"}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                👥 Max Capacity: {scheduleConfig.maxCapacity}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                ⏳ Min Notice:{" "}
                {scheduleConfig.minNoticeEnabled
                  ? `${scheduleConfig.minNoticeValue} ${scheduleConfig.minNoticeUnit}`
                  : "None"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sortedSlots.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollSlots(-320)}
                  aria-label="Scroll slots left"
                  className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlots(320)}
                  aria-label="Scroll slots right"
                  className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleOpenScheduleModal}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Edit Schedule
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Custom Slot
            </button>
          </div>
        </div>

        {loadingSlots ? (
          <div className="py-8 text-center text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span className="font-semibold text-xs">Loading slots...</span>
          </div>
        ) : sortedSlots.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm font-black text-slate-800">No Upcoming Slots Available</p>
            <p className="text-xs text-slate-500">
              Set your weekly availability in Demo Schedule so slots automatically generate for visitors.
            </p>
            <button
              type="button"
              onClick={handleOpenScheduleModal}
              className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Configure Demo Schedule
            </button>
          </div>
        ) : (
          <div
            ref={slotsScrollRef}
            className="flex gap-3.5 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory"
          >
            {sortedSlots.map((slot) => {
              const bookedCount = getSlotBookingsCount(slot.id);
              const capacity = slot.maxCapacity || 10;
              const fillPct = Math.min(100, Math.round((bookedCount / capacity) * 100));
              const isSelected = selectedSlotFilter === slot.id;

              return (
                <div
                  key={slot.id}
                  className={`min-w-[260px] sm:min-w-[280px] shrink-0 snap-start border rounded-2xl p-4 space-y-3 transition-all duration-200 ${
                    isSelected
                      ? "bg-emerald-50/40 border-emerald-500 ring-2 ring-emerald-500/20"
                      : slot.isActive
                      ? "bg-slate-50/50 border-slate-200 hover:border-emerald-400 hover:bg-white"
                      : "bg-slate-50 border-slate-200/70 opacity-65"
                  }`}
                >
                  {/* Card Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          slot.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                        }`}
                      />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                        {slot.isGenerated ? "Auto Schedule" : slot.isActive ? "Custom Live" : "Paused"}
                      </span>
                    </div>

                    {!slot.isGenerated && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(slot)}
                          title="Edit Slot"
                          className="p-1 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(slot.id, slot.isActive)}
                          className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          {slot.isActive ? "Pause" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(slot.id)}
                          title="Delete Slot"
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Time & Date */}
                  <div>
                    <div className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                      <span>{slot.startTime}</span>
                      {slot.endTime && (
                        <span className="text-slate-500 text-xs font-bold">– {slot.endTime}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        {slot.date === todayStr ? `Today (${slot.date})` : slot.date}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-sky-700 font-bold">{slot.duration || "30 Mins"}</span>
                    </div>
                  </div>

                  {/* Bookings Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-500">Slot Bookings</span>
                      <span className="font-black text-indigo-600">
                        {bookedCount} / {capacity} booked
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Filter Table by Slot */}
                  <button
                    type="button"
                    onClick={() => setSelectedSlotFilter(isSelected ? "all" : slot.id)}
                    className={`w-full py-2 px-3 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    {isSelected ? "Showing This Slot (Clear)" : `View Bookings (${bookedCount})`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOOKINGS TABLE SECTION WITH REMARKS FILTER */}
      <div className="space-y-3">
        {/* Search & Filter (Remarks) Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Name, WhatsApp, Email, Staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Active Filter Badges */}
            {selectedSlotFilter !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedSlotFilter("all")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold cursor-pointer hover:bg-emerald-100"
              >
                <span>Slot Filter Active</span>
                <X className="w-3 h-3" />
              </button>
            )}

            {stripFilter !== "all" && (
              <button
                type="button"
                onClick={() => setStripFilter("all")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold cursor-pointer hover:bg-slate-800"
              >
                <span>{stripFilter.replace("_", " ")}</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Right Filter: Filter (Remarks) */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-xs font-extrabold text-emerald-800">Filter (Remarks):</span>
              <select
                value={remarkFilter}
                onChange={(e) => setRemarkFilter(e.target.value)}
                className="text-xs font-bold text-emerald-900 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="all">All Remarks ({dateFilteredBookings.length})</option>
                {REMARK_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Data Table */}
        {loadingBookings ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="font-semibold text-xs">Loading demo bookings...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-2 shadow-xs">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-base font-black text-slate-800">No Booking Records Found</p>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
              No demo bookings match the selected date, slot, or remark filter.
            </p>
            {(selectedSlotFilter !== "all" || remarkFilter !== "all" || stripFilter !== "all" || dateFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSlotFilter("all");
                  setRemarkFilter("all");
                  setStripFilter("all");
                  setDateFilter("all");
                  setSearchTerm("");
                }}
                className="mt-2 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Whatsapp & Email</th>
                    <th className="py-3.5 px-4">Slot time</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Staff Name</th>
                    <th className="py-3.5 px-4">Demo Remarks</th>
                    <th className="py-3.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredBookings.map((b) => {
                    const cleanPhone = (b.phone || "").replace(/\D/g, "");
                    const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                    const waLink = `https://wa.me/${waNumber}?text=Hello%20${encodeURIComponent(
                      b.name || "Partner"
                    )},%20I%20am%20from%20Alife%20Stable.%20Regarding%20your%20free%20demo%20booking%20for%20${encodeURIComponent(
                      b.slotDate || ""
                    )}%20${encodeURIComponent(b.slotStartTime || "")}.`;

                    const currentRemark = getNormalizedRemark(b);
                    const remarkStyle =
                      REMARK_STYLES[currentRemark] || REMARK_STYLES.Pending;
                    const staffValue =
                      staffDrafts[b.id] !== undefined
                        ? staffDrafts[b.id]
                        : b.staffName || "";

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* 1. Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 uppercase">
                              {(b.name || "U").charAt(0)}
                            </div>
                            <div className="font-extrabold text-sm text-slate-900">
                              {b.name || "Unnamed"}
                            </div>
                          </div>
                        </td>

                        {/* 2. Whatsapp & Email */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-800">
                                {b.phone || "—"}
                              </span>
                              {cleanPhone && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPhone(b.id, b.phone)}
                                    title="Copy Number"
                                    className="p-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                                  >
                                    {copiedPhoneId === b.id ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Open in WhatsApp"
                                    className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {b.email || "No email provided"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Slot time */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span>
                              {b.slotStartTime || "Flexible"}
                              {b.slotEndTime ? ` – ${b.slotEndTime}` : ""}
                            </span>
                          </div>
                          {b.slotDuration && (
                            <span className="inline-block mt-0.5 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                              {b.slotDuration}
                            </span>
                          )}
                        </td>

                        {/* 4. Date */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>{b.slotDate || "Flexible"}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Booked:{" "}
                            {b.createdAt?.toDate
                              ? b.createdAt.toDate().toLocaleString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Just now"}
                          </div>
                        </td>

                        {/* 5. Staff Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 max-w-[160px]">
                            <input
                              type="text"
                              placeholder="Assign staff..."
                              value={staffValue}
                              onChange={(e) =>
                                setStaffDrafts((prev) => ({
                                  ...prev,
                                  [b.id]: e.target.value,
                                }))
                              }
                              onBlur={() => {
                                if (
                                  staffDrafts[b.id] !== undefined &&
                                  staffDrafts[b.id] !== (b.staffName || "")
                                ) {
                                  handleSaveStaffName(b.id, staffDrafts[b.id]);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.target.blur();
                                }
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                            {savedStaffId === b.id && (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                        </td>

                        {/* 6. Demo Remarks */}
                        <td className="py-3.5 px-4">
                          <select
                            value={currentRemark}
                            onChange={(e) => handleUpdateRemark(b.id, e.target.value)}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold focus:outline-none cursor-pointer transition-colors ${remarkStyle}`}
                          >
                            {REMARK_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="bg-white text-slate-800">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Delete */}
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(b.id, b.slotId)}
                            title="Delete Booking Record"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* GOOGLE CALENDAR-STYLE DEMO SCHEDULE BUILDER MODAL */}
      {isScheduleModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/55 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsScheduleModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Customize Demo Booking Schedule
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Google Calendar-style availability, lunch breaks, buffer time, capacity & advance notice.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSaveSchedule} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
              {/* Booking Page Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Booking Page Title
                  </label>
                  <input
                    type="text"
                    value={scheduleDraft.title || ""}
                    onChange={(e) =>
                      setScheduleDraft((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Alife Stable — Live 1-on-1 Demo"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Booking Window (Days Ahead)
                  </label>
                  <select
                    value={scheduleDraft.bookingWindowDays || 14}
                    onChange={(e) =>
                      setScheduleDraft((prev) => ({
                        ...prev,
                        bookingWindowDays: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value={7}>Next 7 Days</option>
                    <option value={14}>Next 14 Days</option>
                    <option value={30}>Next 30 Days</option>
                  </select>
                </div>
              </div>

              {/* 1. Appointment Duration */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Appointment duration</h4>
                      <p className="text-[11px] text-slate-500">
                        How long should each appointment last?
                      </p>
                    </div>
                    <select
                      value={scheduleDraft.durationMinutes}
                      onChange={(e) =>
                        setScheduleDraft((prev) => ({
                          ...prev,
                          durationMinutes: Number(e.target.value),
                        }))
                      }
                      className="w-full sm:w-56 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. General Availability (Weekly + Multiple Windows for Lunch Break) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">General availability</h4>
                      <p className="text-[11px] text-slate-500">
                        Set when you&apos;re regularly available. Add multiple periods per day for lunch breaks.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyLunchBreak}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold cursor-pointer shrink-0 self-start sm:self-center"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    Add 1–2 PM Lunch Break
                  </button>
                </div>

                <div className="pl-0 sm:pl-7 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                    <span>Repeat weekly</span>
                  </div>

                  {/* Day Rows: Mon to Sun */}
                  <div className="space-y-2.5">
                    {DAY_KEYS.map((dayKey) => {
                      const windows = scheduleDraft.availability?.[dayKey] || [];
                      return (
                        <div
                          key={dayKey}
                          className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 py-1.5 border-b border-slate-100 last:border-b-0"
                        >
                          <div className="w-12 pt-1.5 font-extrabold text-xs text-slate-700 shrink-0">
                            {DAY_LABELS[dayKey]}
                          </div>

                          {windows.length === 0 ? (
                            <div className="flex items-center justify-between flex-1 py-1">
                              <span className="text-xs font-semibold text-slate-400">
                                Unavailable
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddWindow(dayKey)}
                                title={`Add availability for ${DAY_LABELS[dayKey]}`}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              >
                                <PlusCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1 space-y-2">
                              {windows.map((win, idx) => (
                                <div key={idx} className="flex flex-wrap items-center gap-2">
                                  <select
                                    value={win.start}
                                    onChange={(e) =>
                                      handleUpdateWindow(dayKey, idx, "start", e.target.value)
                                    }
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                                  >
                                    {TIME_OPTIONS.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>

                                  <span className="text-slate-400 font-bold">–</span>

                                  <select
                                    value={win.end}
                                    onChange={(e) =>
                                      handleUpdateWindow(dayKey, idx, "end", e.target.value)
                                    }
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                                  >
                                    {TIME_OPTIONS.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>

                                  {/* Action icons matching Google Calendar */}
                                  <div className="flex items-center gap-1 ml-1">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveWindow(dayKey, idx)}
                                      title="Unavailable / Remove period"
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    >
                                      <Ban className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAddWindow(dayKey)}
                                      title="Add another period (e.g. after lunch break)"
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                    >
                                      <PlusCircle className="w-4 h-4" />
                                    </button>
                                    {idx === 0 && (
                                      <button
                                        type="button"
                                        onClick={() => handleCopyToAllDays(dayKey)}
                                        title="Copy time to all weekdays (Mon–Sat)"
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer flex items-center gap-1"
                                      >
                                        <Copy className="w-4 h-4" />
                                        {copiedDayToast === dayKey && (
                                          <span className="text-[10px] font-bold text-emerald-600">
                                            Copied!
                                          </span>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Buffer Time & 4. Max Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Buffer Time */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Buffer time</h4>
                    <p className="text-[11px] text-slate-500">
                      Add break time between appointment slots
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="bufferEnabled"
                      checked={!!scheduleDraft.bufferEnabled}
                      onChange={(e) =>
                        setScheduleDraft((prev) => ({
                          ...prev,
                          bufferEnabled: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      disabled={!scheduleDraft.bufferEnabled}
                      value={scheduleDraft.bufferValue}
                      onChange={(e) =>
                        setScheduleDraft((prev) => ({
                          ...prev,
                          bufferValue: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      className="w-16 px-2.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-900 text-center disabled:opacity-40 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <select
                      disabled={!scheduleDraft.bufferEnabled}
                      value={scheduleDraft.bufferUnit}
                      onChange={(e) =>
                        setScheduleDraft((prev) => ({
                          ...prev,
                          bufferUnit: e.target.value,
                        }))
                      }
                      className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 disabled:opacity-40 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="minutes">minutes</option>
                      <option value="hours">hours</option>
                    </select>
                  </div>
                </div>

                {/* Max Capacity */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Max Capacity (Max Bookings)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Maximum attendees allowed per time slot
                    </p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={scheduleDraft.maxCapacity}
                    onChange={(e) =>
                      setScheduleDraft((prev) => ({
                        ...prev,
                        maxCapacity: Math.max(1, Number(e.target.value) || 1),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm font-black text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* 5. Minimum Notice Before Appointment */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Minimum time before the appointment start that it can be booked
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Prevent last-minute bookings (e.g. leads must book at least 20 minutes before slot starts).
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="minNoticeEnabled"
                    checked={!!scheduleDraft.minNoticeEnabled}
                    onChange={(e) =>
                      setScheduleDraft((prev) => ({
                        ...prev,
                        minNoticeEnabled: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    disabled={!scheduleDraft.minNoticeEnabled}
                    value={scheduleDraft.minNoticeValue}
                    onChange={(e) =>
                      setScheduleDraft((prev) => ({
                        ...prev,
                        minNoticeValue: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className="w-20 px-2.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-900 text-center disabled:opacity-40 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    disabled={!scheduleDraft.minNoticeEnabled}
                    value={scheduleDraft.minNoticeUnit}
                    onChange={(e) =>
                      setScheduleDraft((prev) => ({
                        ...prev,
                        minNoticeUnit: e.target.value,
                      }))
                    }
                    className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 disabled:opacity-40 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="minutes">minutes</option>
                    <option value="hours">hours</option>
                  </select>
                </div>
              </div>

              {/* Live Preview Count */}
              <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900">
                  Live Preview (Today&apos;s Remaining Slots):
                </span>
                <span className="font-black text-emerald-700">
                  {generateSlotsForDate(scheduleDraft, todayStr).length} slots available today
                </span>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/30 disabled:opacity-50"
                >
                  {savingSchedule ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving Schedule...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Save & Publish Schedule
                    </>
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
