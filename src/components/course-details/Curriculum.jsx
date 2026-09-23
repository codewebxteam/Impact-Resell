import React, { useState } from "react";
import { ChevronDown, PlayCircle, Lock, BookOpen } from "lucide-react";

const Curriculum = ({ syllabus, course }) => {
  // Determine raw syllabus or fallback from course
  let content = syllabus;
  if (!content || content === "No syllabus provided.") {
    if (course?.syllabus && course.syllabus !== "No syllabus provided.") {
      content = course.syllabus;
    } else if (course?.syllabusContent && course.syllabusContent !== "No syllabus provided.") {
      content = course.syllabusContent;
    }
  }

  // Fallback to course.lectures if syllabus is missing
  if ((!content || content === "No syllabus provided.") && Array.isArray(course?.lectures) && course.lectures.length > 0) {
    content = course.lectures.map((l, i) =>
      typeof l === "string" ? l : (l.title || `Lesson ${i + 1}`)
    );
  }

  // 1. Handle String Syllabus (From Admin Panel / Firestore)
  if (typeof content === "string") {
    const lines = content.split("\n").filter((line) => line.trim() !== "");

    return (
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Course Syllabus</h3>
            <p className="text-sm text-slate-500 mt-1">
              {lines.length > 0 ? `${lines.length} Topics / Lessons • Overview & Key Topics` : "Overview & Key Topics"}
            </p>
          </div>
          {lines.length > 0 && (
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              {lines.length} Lessons
            </span>
          )}
        </div>
        <div className="p-6 max-h-[600px] overflow-y-auto">
          {lines.length > 0 ? (
            <ul className="space-y-2.5">
              {lines.map((line, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3.5 text-slate-700 text-sm leading-relaxed p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span className="mt-0.5 size-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5 font-medium text-slate-800">{line.replace(/^[•-]\s*/, "")}</span>
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

  // 2. Handle Array Syllabus (Strings or Structured Sections)
  if (Array.isArray(content)) {
    // If it is an array of plain strings (e.g. from lectures or plain list)
    if (content.length > 0 && typeof content[0] === "string") {
      return (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Course Syllabus</h3>
              <p className="text-sm text-slate-500 mt-1">
                {content.length} Lessons • Overview & Key Topics
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              {content.length} Lessons
            </span>
          </div>
          <div className="p-6 max-h-[600px] overflow-y-auto">
            <ul className="space-y-2.5">
              {content.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3.5 text-slate-700 text-sm leading-relaxed p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span className="mt-0.5 size-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5 font-medium text-slate-800">{item.replace(/^[•-]\s*/, "")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
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
