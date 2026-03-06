import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, MessageCircleQuestion } from "lucide-react";
import { Link } from "react-router-dom";

// --- FAQ Data (Strictly from your Uploaded File) ---
const faqs = [
  {
    id: 1,
    question: "Who is this course for?",
    answer:
      "This course is designed for beginners, students, working professionals, and creators who want to build industry-ready skills from scratch.",
  },
  {
    id: 2,
    question: "Do I need any prior experience?",
    answer:
      "No prior experience is required. The course starts from the basics and gradually moves to advanced, practical concepts.",
  },
  {
    id: 3,
    question: "How will I access the course after enrollment?",
    answer:
      "You’ll get instant access to all course content after successful payment. Learn anytime, at your own pace.",
  },
  {
    id: 4,
    question: "Is this course online or offline?",
    answer:
      "This is a 100% online course, accessible from anywhere using a mobile, tablet, or computer.",
  },
  {
    id: 5,
    question: "Will I get a certificate after completing the course?",
    answer:
      "Yes, you’ll receive a certificate of completion after finishing the course.",
  },
  {
    id: 6,
    question: "Will I get support if I face issues?",
    answer:
      "Yes. You’ll have access to WhatsApp & Email support and guidance from our team.",
  },
];

const FAQSection = () => {
  // First item open by default
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    // Updated: bg-linear-to-b for Tailwind 4.1 consistency
    <section className="w-full relative bg-linear-to-b from-[#f0fdff] to-white py-20 px-4 font-sans overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 size-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 size-64 bg-[#5edff4]/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-10 right-10 size-80 bg-[#0891b2]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#cff9fe] shadow-sm mb-4">
            <MessageCircleQuestion className="size-4 text-[#5edff4]" />
            <span className="text-xs font-bold text-[#0891b2] tracking-wider uppercase">
              Got Questions?
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#5edff4] to-[#0891b2]">
              Questions
            </span>
          </h2>
          <p className="text-slate-500 mt-4 max-w-lg mx-auto text-sm md:text-base">
            Everything you need to know about the academy and your learning
            journey.
          </p>
        </div>

        {/* FAQ List */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              // Updated Styling: rounded-3xl with group hover effects
              className={`group border rounded-3xl overflow-hidden transition-all duration-300
                ${
                  activeIndex === index
                    ? "bg-white border-[#5edff4] shadow-lg shadow-[#5edff4]/10"
                    : "bg-white/60 border-transparent hover:bg-white hover:border-[#cff9fe]"
                }
              `}
            >
              {/* Question Header */}
              <button
                onClick={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
                className="w-full flex items-center justify-between p-6 md:p-8 text-left cursor-pointer outline-none"
              >
                <span
                  className={`text-base md:text-lg font-bold transition-colors pr-4 ${
                    activeIndex === index
                      ? "text-slate-900"
                      : "text-slate-600 group-hover:text-slate-900"
                  }`}
                >
                  {faq.question}
                </span>

                {/* Animated Icon Wrapper */}
                <div
                  className={`size-8 md:size-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0
                  ${
                    activeIndex === index
                      ? "bg-linear-to-r from-[#5edff4] to-[#0891b2] text-white rotate-180"
                      : "bg-[#f0fdff] text-[#0891b2] group-hover:scale-110"
                  }`}
                >
                  {activeIndex === index ? (
                    <Minus className="size-4 md:size-5" />
                  ) : (
                    <Plus className="size-4 md:size-5" />
                  )}
                </div>
              </button>

              {/* Answer Content */}
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 md:px-8 pb-8 pt-0">
                      <div className="w-full h-px bg-slate-100 mb-4" />
                      <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Support Box */}
        <div className="mt-16 text-center">
          <div className="bg-slate-900 rounded-4xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 size-64 bg-[#5edff4]/20 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Still have questions?
              </h3>
              <p className="text-slate-400 mb-8 max-w-md text-sm md:text-base">
                Can't find the answer you're looking for? Chat to our friendly
                team.
              </p>
              <Link to="/contact">
                <button className="px-8 py-3.5 rounded-full bg-[#5edff4] text-slate-900 font-bold text-sm hover:bg-white transition-all shadow-lg shadow-[#5edff4]/20 active:scale-95 cursor-pointer">
                  Get in Touch
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
