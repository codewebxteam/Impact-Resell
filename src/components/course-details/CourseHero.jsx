import React from "react";
import { Globe, AlertCircle } from "lucide-react";

const CourseHero = ({ course }) => {
  return (
    // FIX APPLIED:
    // 1. Mobile ('mt-[70px]'): Keeps the White Bar layout you like on phones.
    // 2. Desktop ('lg:mt-0'): Removes the gap/margin so the Blue BG goes to the top.
    // 3. Desktop Padding ('lg:pt-48'): Pushes content down so it doesn't hide behind the Navbar.
    <div className="bg-slate-900 text-white mt-16 sm:mt-20 lg:mt-18 pt-8 sm:pt-12 lg:pt-24 pb-12 lg:pb-16 px-5 sm:px-6 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 p-22 bg-[#5edff4]/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
            <span className="text-[#5edff4]">{course.category}</span>
            <span>/</span>
            <span>{course.title}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {course.title}
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
            {course.description}
          </p>

          {/* Meta Data */}
          <div className="flex flex-wrap gap-6 text-sm font-medium pt-2">


            <div className="flex items-center gap-2 text-slate-300">
              <Globe className="size-4" />
              <span>Hindi</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <AlertCircle className="size-4" />
              <span>Last updated {course.lastUpdated}</span>
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
            <div className="size-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <img
                src={`https://ui-avatars.com/api/?name=${course.instructor}&background=random`}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm text-slate-400">Created by</p>
              <p className="font-bold text-[#5edff4] hover:underline cursor-pointer">
                {course.instructor}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHero;
