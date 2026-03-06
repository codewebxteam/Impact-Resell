import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAgency } from "../context/AgencyContext"; // Logic Import

const MarqueeSection = () => {
  const { agency, isMainSite } = useAgency();

  // [LOGIC] Dynamic Name Logic
  // Agar Partner (Subdomain) hai to Agency Name, nahi to Default Academy Name
  const academyName =
    !isMainSite && agency ? agency.name.toUpperCase() : "Impact School Of AI";

  // Design wale items (Updated with Dynamic Name)
  const items = [
    "3D VIDEO MAKER",
    "AI COURSE",
    "2D CARTOON",
    "CARTOON VIDEO",
    academyName, // Yahan dynamic naam aayega
  ];

  return (
    // [DESIGN] White Theme & Borders
    <section className="relative w-full bg-white py-3 overflow-hidden border-y border-slate-100">
      {/* Side Fade Gradients (White) */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Scrolling Content Implementation using Framer Motion */}
      <div className="flex whitespace-nowrap select-none">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            duration: 40, // Speed adjust kar sakte hain
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex items-center"
        >
          {/* Repeating content multiple times for seamless loop */}
          {[...Array(10)].map((_, iter) => (
            <div key={iter} className="flex items-center shrink-0">
              {items.map((text, index) => {
                // Check agar ye text hamara Brand Name hai
                const isBrand = text === academyName;

                return (
                  <React.Fragment key={index}>
                    {/* Icon with Dynamic Color */}
                    <Sparkles
                      className={`mx-6 size-3 md:size-4 ${
                        isBrand ? "text-[#5edff4]" : "text-slate-300"
                      } opacity-100`}
                    />

                    {/* Text Styling */}
                    <span
                      className={`
                        font-bold tracking-[0.2em] uppercase
                        text-sm md:text-base
                        ${isBrand ? "text-slate-900" : "text-slate-700"}
                      `}
                    >
                      {text}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MarqueeSection;
