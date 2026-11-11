export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const DAY_LABELS = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

// Map JS Date.getDay() (0=Sun..6=Sat) to our day keys
const JS_DAY_TO_KEY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const DEFAULT_SCHEDULE_CONFIG = {
  type: "schedule_config",
  title: "Alife Stable - Partnership Meeting",
  subtitle:
    "Book a live 1-on-1 walkthrough to see how you can launch your own branded AI course academy in 24 hours. Our partnership specialist will guide you through platform features, pricing, and complete onboarding.",
  durationMinutes: 30,
  repeatMode: "weekly",
  bookingWindowDays: 14,
  availability: {
    mon: [
      { start: "10:00", end: "13:00" },
      { start: "14:00", end: "18:30" },
    ],
    tue: [
      { start: "10:00", end: "13:00" },
      { start: "14:00", end: "18:30" },
    ],
    wed: [
      { start: "10:00", end: "13:00" },
      { start: "14:00", end: "18:30" },
    ],
    thu: [
      { start: "10:00", end: "13:00" },
      { start: "14:00", end: "18:30" },
    ],
    fri: [
      { start: "10:00", end: "13:00" },
      { start: "14:00", end: "18:30" },
    ],
    sat: [
      { start: "10:00", end: "13:00" },
      { start: "14:00", end: "17:00" },
    ],
    sun: [],
  },
  bufferEnabled: true,
  bufferValue: 15,
  bufferUnit: "minutes",
  maxCapacity: 10,
  minNoticeEnabled: true,
  minNoticeValue: 20,
  minNoticeUnit: "minutes",
  isActive: true,
};

export function timeStrToMinutes(hhmm) {
  if (!hhmm || typeof hhmm !== "string") return 0;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

export function minutesToTimeStr(totalMins) {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatTime12h(hhmm) {
  if (!hhmm || typeof hhmm !== "string") return "";
  const [hRaw, mRaw] = hhmm.split(":").map(Number);
  if (Number.isNaN(hRaw) || Number.isNaN(mRaw)) return hhmm;
  const period = hRaw >= 12 ? "PM" : "AM";
  const h12 = hRaw % 12 === 0 ? 12 : hRaw % 12;
  return `${String(h12).padStart(2, "0")}:${String(mRaw).padStart(2, "0")} ${period}`;
}

// 15-minute increment dropdown options from 06:00 AM to 11:45 PM
export const TIME_OPTIONS = (() => {
  const opts = [];
  for (let mins = 6 * 60; mins <= 23 * 60 + 45; mins += 15) {
    const value = minutesToTimeStr(mins);
    opts.push({ value, label: formatTime12h(value) });
  }
  return opts;
})();

export function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function generateSlotsForDate(schedule, dateStr, now = new Date()) {
  if (!schedule || schedule.isActive === false || !dateStr) return [];

  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return [];
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  if (Number.isNaN(dateObj.getTime())) return [];

  const dayKey = JS_DAY_TO_KEY[dateObj.getDay()];
  const windows = schedule.availability?.[dayKey] || [];
  if (!Array.isArray(windows) || windows.length === 0) return [];

  const durationMins = Math.max(5, Number(schedule.durationMinutes) || 30);
  const bufferMins = schedule.bufferEnabled
    ? Math.max(0, Number(schedule.bufferValue) || 0) *
      (schedule.bufferUnit === "hours" ? 60 : 1)
    : 0;
  const minNoticeMins = schedule.minNoticeEnabled
    ? Math.max(0, Number(schedule.minNoticeValue) || 0) *
      (schedule.minNoticeUnit === "hours" ? 60 : 1)
    : 0;

  const stepMins = Math.max(5, durationMins + bufferMins);
  const cutoffMs = now.getTime() + minNoticeMins * 60 * 1000;
  const maxCapacity = Math.max(1, Number(schedule.maxCapacity) || 10);

  const generated = [];
  const seenKeys = new Set();

  // Sort windows chronologically
  const sortedWindows = [...windows].sort(
    (a, b) => timeStrToMinutes(a.start) - timeStrToMinutes(b.start)
  );

  for (const win of sortedWindows) {
    const startM = timeStrToMinutes(win.start);
    const endM = timeStrToMinutes(win.end);
    if (endM <= startM) continue;

    let cursor = startM;
    while (cursor + durationMins <= endM) {
      const slotStartDt = new Date(
        parts[0],
        parts[1] - 1,
        parts[2],
        Math.floor(cursor / 60),
        cursor % 60,
        0,
        0
      );

      if (slotStartDt.getTime() >= cutoffMs) {
        const startHHMM = minutesToTimeStr(cursor);
        const endHHMM = minutesToTimeStr(cursor + durationMins);
        const slotKey = `${dateStr}_${startHHMM}`;

        if (!seenKeys.has(slotKey)) {
          seenKeys.add(slotKey);
          generated.push({
            id: slotKey,
            slotKey,
            date: dateStr,
            startHHMM,
            endHHMM,
            startTime: formatTime12h(startHHMM),
            endTime: formatTime12h(endHHMM),
            duration: `${durationMins} Mins`,
            durationMinutes: durationMins,
            maxCapacity,
          });
        }
      }

      cursor += stepMins;
    }
  }

  return generated.sort(
    (a, b) => timeStrToMinutes(a.startHHMM) - timeStrToMinutes(b.startHHMM)
  );
}

export function generateUpcomingSlots(schedule, daysCount = null) {
  if (!schedule || schedule.isActive === false) return [];
  const totalDays = daysCount || Number(schedule.bookingWindowDays) || 14;
  const now = new Date();
  const allSlots = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dateStr = getLocalDateString(d);
    const daySlots = generateSlotsForDate(schedule, dateStr, now);
    allSlots.push(...daySlots);
  }

  return allSlots;
}

