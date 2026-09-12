/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Mail,
  MapPin,
  Send,
  Sparkles,
  Phone,
  Clock,
  CheckCircle2,
  HelpCircle,
  Plus,
  Minus
} from "lucide-react";
import { useAgency } from "../../context/AgencyContext";

const ContactUs = () => {
  const { agency, isMainSite } = useAgency();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Course Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const brandName = !isMainSite && agency?.name ? agency.name : (agency?.name || "AIFlix");
  const supportPhone = !isMainSite && agency?.whatsapp ? agency.whatsapp : "+91 74818 96182";
  const supportEmail = !isMainSite && agency?.email ? agency.email : "support@alifestable.com";
  const supportAddress = !isMainSite && agency?.address ? agency.address : "Tech Creative District, Digital Hub";

  const whatsappLink = `https://wa.me/${supportPhone.replace(/\D/g, "")}?text=${encodeURIComponent("Hello! I have a question regarding courses on " + brandName)}`;

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedMessage =
      `*New Student Inquiry via Website* 📩\n\n` +
      `👤 *Name:* ${formData.name}\n` +
      `📧 *Email:* ${formData.email}\n` +
      `📌 *Subject:* ${formData.subject}\n` +
      `💬 *Message:* ${formData.message}\n\n` +
      `Sent from ${brandName} Academy contact desk.`;

    const targetUrl = `https://wa.me/${supportPhone.replace(/\D/g, "")}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(targetUrl, "_blank");

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "Course Inquiry", message: "" });
    }, 4000);
  };

  const quickFaqs = [
    {
      q: "How soon do I get access after payment?",
      a: "Immediately! As soon as your payment is verified, you receive your student portal login to start watching lessons right away.",
    },
    {
      q: "Can I watch the lessons on mobile?",
      a: "Yes! Our course dashboard is 100% responsive and works seamlessly on Android, iOS phones, iPads, laptops, and desktop browsers.",
    },
    {
      q: "Do the courses get updated when new AI tools release?",
      a: "Yes! All course owners receive free lifetime updates whenever new major models (such as Runway, Midjourney, or HeyGen updates) are launched.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9fe] font-sans pb-24 pt-24 sm:pt-28 text-slate-800">
      
      {/* Top Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-16">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-indigo-50 shadow-sm text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-black uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>We're Here To Help</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Get In Touch With{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                {brandName}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl mx-auto">
              Have questions about courses, bundle promotions, certificate verification, or mentor guidance? Reach out anytime.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Contact Info Cards */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: WhatsApp Support */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all text-center flex flex-col items-center group cursor-pointer"
          >
            <div className="size-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <MessageCircle className="size-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">WhatsApp Helpline</h3>
            <p className="text-xs text-slate-400 font-medium mb-3">Fastest response for queries</p>
            <span className="text-sm font-bold text-emerald-600">{supportPhone}</span>
          </a>

          {/* Card 2: Email Support */}
          <a
            href={`mailto:${supportEmail}`}
            className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-purple-300 transition-all text-center flex flex-col items-center group cursor-pointer"
          >
            <div className="size-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Mail className="size-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Official Email</h3>
            <p className="text-xs text-slate-400 font-medium mb-3">Support & partnerships</p>
            <span className="text-sm font-bold text-purple-600">{supportEmail}</span>
          </a>

          {/* Card 3: Help Desk Hours */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center flex flex-col items-center">
            <div className="size-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <Clock className="size-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Support Hours</h3>
            <p className="text-xs text-slate-400 font-medium mb-3">Monday to Saturday</p>
            <span className="text-sm font-bold text-amber-600">10:00 AM – 7:00 PM IST</span>
          </div>

        </div>
      </div>

      {/* Main Interactive Form & FAQs Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Left: Message Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                Send Us A Direct Message
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Fill out this quick form and our mentor desk will answer on WhatsApp right away.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3 rounded-xl bg-[#faf9fe] border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#faf9fe] border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Inquiry Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#faf9fe] border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="Course Inquiry">Course & Syllabus Inquiry</option>
                  <option value="Bundle Offer">All-Courses Bundle Offer</option>
                  <option value="Certificate Verification">Certificate Verification</option>
                  <option value="Technical Support">Login / Access Support</option>
                  <option value="Other">Other Query</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Your Message</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you today? Ask any questions about courses..."
                  className="w-full px-4 py-3 rounded-xl bg-[#faf9fe] border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-sm shadow-xl shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="size-4" />
                <span>Send Message via WhatsApp</span>
              </button>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2"
                >
                  <CheckCircle2 className="size-4" />
                  Your message was drafted! Opening WhatsApp now...
                </motion.div>
              )}
            </form>
          </div>

          {/* Right: Quick FAQs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                Quick Answers
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Frequently asked questions from prospective students.
              </p>
            </div>

            <div className="space-y-3">
              {quickFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-black text-slate-900 text-xs sm:text-sm hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <div className="size-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                        {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 sm:px-5 pb-4 text-xs text-slate-500 font-medium leading-relaxed border-t border-slate-100 pt-2.5"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ContactUs;
