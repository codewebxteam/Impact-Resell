import React, { useState } from "react";
import { ChevronDown, PlayCircle, Lock, BookOpen } from "lucide-react";

const Curriculum = ({ syllabus }) => {
  // 1. Handle String Syllabus (From Admin Panel)
  if (typeof syllabus === "string") {
    const lines = syllabus.split("\n").filter((line) => line.trim() !== "");

    return (
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-900">Course Syllabus</h3>
          <p className="text-sm text-slate-500 mt-1">Overview & Key Topics</p>
        </div>
        <div className="p-6">
          {lines.length > 0 ? (
            <ul className="space-y-3">
              {lines.map((line, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed"
                >
                  <div className="mt-1.5 size-1.5 rounded-full bg-[#0891b2] shrink-0" />
                  <span>{line.replace(/^[•-]\s*/, "")}</span>{" "}
                  {/* Remove existing bullets if any */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 italic text-sm">
              No syllabus details available.
            </p>
          )}
        </div>
      </div>
    );
  }

  // 2. Handle Array Syllabus (Old Static Data / Structured Data)
  if (Array.isArray(syllabus)) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-900">Course Content</h3>
          <p className="text-sm text-slate-500 mt-1">
            {syllabus.length} sections •{" "}
            {syllabus.reduce(
              (acc, curr) => acc + (curr.lessons?.length || 0),
              0
            )}{" "}
            lectures
          </p>
        </div>

        <div>
          {syllabus.map((section, idx) => (
            <AccordionSection
              key={idx}
              section={section}
              isOpenDefault={idx === 0}
            />
          ))}
        </div>
      </div>
    );
  }

  // 3. Fallback for Null/Undefined
  return null;
};

const AccordionSection = ({ section, isOpenDefault }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <ChevronDown
            className={`size-5 text-slate-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
          <span className="font-bold text-slate-800">{section.title}</span>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {section.lessons?.length || 0} lectures
        </span>
      </button>

      {isOpen && (
        <div className="bg-slate-50/80 px-5 pb-5 pt-2 space-y-2">
          {section.lessons?.map((lesson, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 text-sm pl-9"
            >
              <div className="flex items-center gap-3 text-slate-600">
                <PlayCircle className="size-4 text-slate-400" />
                <span>{typeof lesson === "object" ? (lesson.title || lesson.name || "Lesson") : String(lesson)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 hidden sm:block">
                  {lesson.title === "Introduction to Javascript" ? (
                    <span className="text-[#0891b2] font-bold">Preview</span>
                  ) : (
                    lesson.time
                  )}
                </span>
                {lesson.title === "Introduction to Javascript" ? null : (
                  <Lock className="size-3.5 text-slate-300" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Curriculum;
