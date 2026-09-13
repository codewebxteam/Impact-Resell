// src/themes/themeMap.js

// Theme 1
import Theme1Home from "./theme1/Home";
import Theme1Courses from "./theme1/Courses";
import Theme1CourseDetails from "./theme1/CourseDetails";
import Theme1AboutUs from "./theme1/AboutUs";
import Theme1ContactUs from "./theme1/ContactUs";

// Theme 2
import Theme2Home from "./theme2/Home";
import Theme2Courses from "./theme2/Courses";
import Theme2CourseDetails from "./theme2/CourseDetails";
import Theme2AboutUs from "./theme2/AboutUs";
import Theme2ContactUs from "./theme2/ContactUs";

// Theme 3
import Theme3Home from "./theme3/Home";
import Theme3Courses from "./theme3/Courses";
import Theme3CourseDetails from "./theme3/CourseDetails";
import Theme3AboutUs from "./theme3/AboutUs";
import Theme3ContactUs from "./theme3/ContactUs";

// Theme 4
import Theme4Home from "./theme4/Home";
import Theme4Courses from "./theme4/Courses";
import Theme4CourseDetails from "./theme4/CourseDetails";
import Theme4AboutUs from "./theme4/AboutUs";
import Theme4ContactUs from "./theme4/ContactUs";

// Theme 5
import Theme5Home from "./theme5/Home";
import Theme5Courses from "./theme5/Courses";
import Theme5CourseDetails from "./theme5/CourseDetails";
import Theme5AboutUs from "./theme5/AboutUs";
import Theme5ContactUs from "./theme5/ContactUs";

export const themeMap = {
  theme1: {
    home: Theme1Home,
    courses: Theme1Courses,
    coursedetails: Theme1CourseDetails,
    about: Theme1AboutUs,
    contact: Theme1ContactUs,
  },
  theme2: {
    home: Theme2Home,
    courses: Theme2Courses,
    coursedetails: Theme2CourseDetails,
    about: Theme2AboutUs,
    contact: Theme2ContactUs,
  },
  theme3: {
    home: Theme3Home,
    courses: Theme3Courses,
    coursedetails: Theme3CourseDetails,
    about: Theme3AboutUs,
    contact: Theme3ContactUs,
  },
  theme4: {
    home: Theme4Home,
    courses: Theme4Courses,
    coursedetails: Theme4CourseDetails,
    about: Theme4AboutUs,
    contact: Theme4ContactUs,
  },
  theme5: {
    home: Theme5Home,
    courses: Theme5Courses,
    coursedetails: Theme5CourseDetails,
    about: Theme5AboutUs,
    contact: Theme5ContactUs,
  },
};

export const THEMES_METADATA = [
  {
    id: "theme1",
    name: "Cyber Neon",
    badge: "Most Popular",
    description: "Futuristic dark UI with high-contrast cyan & electric blue accents.",
    previewBg: "bg-slate-950",
    borderAccent: "border-cyan-500",
    colors: ["#0B0F19", "#06B6D4", "#3B82F6"],
  },
  {
    id: "theme2",
    name: "Midnight Indigo",
    badge: "Modern Sleek",
    description: "Deep obsidian aesthetic with smooth purple & indigo gradients.",
    previewBg: "bg-[#070913]",
    borderAccent: "border-indigo-500",
    colors: ["#070913", "#6366F1", "#8B5CF6"],
  },
  {
    id: "theme3",
    name: "Obsidian Gold",
    badge: "Luxury Elite",
    description: "Ultra-premium dark design with glowing gold & amber accents.",
    previewBg: "bg-zinc-950",
    borderAccent: "border-amber-500",
    colors: ["#09090b", "#F59E0B", "#FEDC5C"],
  },
  {
    id: "theme4",
    name: "Corporate Horizon",
    badge: "Enterprise Tech",
    description: "Clean tech structure with sharp cards and vibrant indigo branding.",
    previewBg: "bg-[#0A0D14]",
    borderAccent: "border-blue-500",
    colors: ["#0A0D14", "#4F46E5", "#38BDF8"],
  },
  {
    id: "theme5",
    name: "Emerald Matrix",
    badge: "Vibrant Cyber",
    description: "Dynamic glassmorphic design powered by cyber-emerald neon glows.",
    previewBg: "bg-[#050B09]",
    borderAccent: "border-emerald-500",
    colors: ["#050B09", "#10B981", "#34D399"],
  },
];
