import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useAgency } from "../context/AgencyContext";

const DemoVideoSection = () => {
  const { agency } = useAgency();
  const demoLink = agency?.demoVideoLink;

  if (!demoLink) return null;

  // Extract YouTube Video ID
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId(demoLink);
  if (!videoId) return null;

  return (
    <section className="w-full bg-slate-50 py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative w-full rounded-[24px] sm:rounded-[40px] overflow-hidden shadow-2xl bg-slate-900 border border-slate-800"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 sm:p-10 z-20 pointer-events-none bg-gradient-to-b from-slate-900/90 to-transparent">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="flex items-center justify-center size-10 sm:size-14 rounded-full bg-rose-500/20 backdrop-blur-md">
                <Play className="size-5 sm:size-7 text-rose-500 fill-rose-500" />
              </span>
              Academy Demo
            </h2>
            <p className="text-slate-300 font-medium text-sm sm:text-base mt-2 ml-1">
              Watch this quick overview of what we offer.
            </p>
          </div>

          {/* Video Container (Full width 16:9 aspect ratio) */}
          <div className="relative w-full aspect-video z-10 pt-20 sm:pt-0">
             {/* Small hack: using pt-20 on mobile to push video down slightly if needed, but absolute header means it overlays. We can just use aspect-video */}
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`}
              title="Academy Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full object-cover"
            ></iframe>
          </div>
          
          {/* Decorative glows */}
          <div className="absolute -top-32 -right-32 size-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="absolute -bottom-32 -left-32 size-96 bg-rose-500/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoVideoSection;
