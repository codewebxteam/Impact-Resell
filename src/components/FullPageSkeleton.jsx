import React from "react";

const FullPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Navbar Skeleton */}
      <header className="h-20 border-b border-slate-200/80 px-6 max-w-7xl mx-auto flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-slate-200 animate-pulse" />
          <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="hidden md:flex items-center gap-8">
          <div className="h-4 w-16 bg-slate-200/80 rounded-md animate-pulse" />
          <div className="h-4 w-20 bg-slate-200/80 rounded-md animate-pulse" />
          <div className="h-4 w-16 bg-slate-200/80 rounded-md animate-pulse" />
          <div className="h-4 w-24 bg-slate-200/80 rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-28 bg-[#5edff4]/30 rounded-xl animate-pulse" />
      </header>

      {/* Hero Section Skeleton */}
      <section className="relative px-6 pt-16 pb-20 max-w-7xl mx-auto">
        {/* Glow */}
        <div className="absolute top-10 right-10 size-96 bg-[#5edff4]/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-3xl space-y-6">
          {/* Badge Skeleton */}
          <div className="h-8 w-44 bg-slate-200/90 rounded-full animate-pulse border border-slate-300/50" />

          {/* Title Lines Skeleton */}
          <div className="space-y-3 pt-2">
            <div className="h-12 w-full md:w-4/5 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-12 w-3/4 bg-slate-200/80 rounded-2xl animate-pulse" />
          </div>

          {/* Subtitle Skeleton */}
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full max-w-xl bg-slate-200/60 rounded-md animate-pulse" />
            <div className="h-4 w-4/5 max-w-lg bg-slate-200/60 rounded-md animate-pulse" />
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="h-12 w-36 bg-[#5edff4]/40 rounded-xl animate-pulse" />
            <div className="h-12 w-32 bg-slate-200/90 rounded-xl animate-pulse border border-slate-300/50" />
          </div>
        </div>
      </section>

      {/* Cards Grid Skeleton */}
      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-4 w-24 bg-slate-200/60 rounded-md animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 p-5 space-y-4 shadow-sm"
            >
              {/* Card Image Skeleton */}
              <div className="h-48 w-full bg-slate-200 rounded-2xl animate-pulse relative">
                <div className="absolute top-3 right-3 h-6 w-16 bg-slate-300/60 rounded-lg animate-pulse" />
              </div>

              {/* Category Skeleton */}
              <div className="h-4 w-20 bg-slate-200/80 rounded-md animate-pulse" />

              {/* Card Title Skeleton */}
              <div className="space-y-2">
                <div className="h-5 w-full bg-slate-200 rounded-md animate-pulse" />
                <div className="h-5 w-2/3 bg-slate-200/80 rounded-md animate-pulse" />
              </div>

              {/* Price & Button Footer Skeleton */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="h-6 w-16 bg-slate-200 rounded-md animate-pulse" />
                <div className="h-10 w-24 bg-[#5edff4]/30 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FullPageSkeleton;
