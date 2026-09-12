/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Headphones,
  FileCheck
} from "lucide-react";
import { useAgency } from "../../context/AgencyContext";

const ContactUs = () => {
  const { agency, isMainSite } = useAgency();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    courseInterest: "General Inquiry",
    message: ""
  });
  const [status, setStatus] = useState("idle");
  const [openFaq, setOpenFaq] = useState(null);

  const academyName = !isMainSite && agency?.name ? agency.name : (agency?.name || "AIFlix Academy");
  const supportEmail = !isMainSite && agency?.email ? agency.email : "support@alifestable.com";
  const supportPhone = !isMainSite && agency?.whatsapp ? agency.whatsapp : "+91 74818 96182";
  const cleanPhone = supportPhone.replace(/\D/g, "");
  
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${academyName}! I have an inquiry regarding your AI Video Creation courses.`
  )}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("loading");

    // Format WhatsApp direct message link as well
    const customMessage = `*New Contact Form Inquiry* 📩\n\n👤 *Name:* ${formData.name}\n📧 *Email:* ${formData.email}\n📱 *Phone:* ${formData.phone || "Not provided"}\n🎯 *Interest:* ${formData.courseInterest}\n💬 *Message:* ${formData.message}`;
    const directWhatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`;

    setTimeout(() => {
      setStatus("success");
      // Open WhatsApp with prefilled message
      window.open(directWhatsappUrl, "_blank");
      setFormData({ name: "", email: "", phone: "", courseInterest: "General Inquiry", message: "" });
    }, 800);
  };

  const quickFaqs = [
    {
      q: "How fast do I get access after enrolling?",
      a: "Instant! As soon as your payment or WhatsApp verification is completed, your account is activated and all video modules & prompts are immediately accessible in your dashboard."
    },
    {
      q: "How do I contact my mentor if I get stuck?",
      a: "You receive direct access to our WhatsApp support desk where our lead video creators answer prompt queries and technical troubleshooting."
    },
    {
      q: "Can I get a tax invoice or GST bill?",
      a: "Yes! If you require a business tax invoice or company receipt, simply mention your GST/billing details in your WhatsApp message."
    },
    {
      q: "Is payment 100% secure?",
      a: "Yes! All online transactions are processed through encrypted, industry-standard payment gateways and verified payment links."
    }
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans bg-slate-50">
      <div className="pt-24 md:pt-32 pb-24 relative z-10">
        
        {/* ================= 1. HEADER SECTION ================= */}
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider bg-white border border-violet-200 text-violet-700 shadow-xs mb-5">
              <Headphones className="size-4 text-violet-600" />
              24/7 DEDICATED STUDENT SUPPORT
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 mb-4 leading-[1.08]">
              We're Here to <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Help You Succeed</span>
            </h1>
            
            <p className="text-base sm:text-lg font-bold text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Have questions about course syllabi, payment options, or need personal learning advice? Our team is always ready to guide you.
            </p>
          </motion.div>
        </div>

        {/* ================= 2. 3 CONTACT METHOD CARDS ================= */}
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* WhatsApp Card */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all duration-300 hover:-translate-y-1.5 group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <MessageCircle className="size-6 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-slate-950 mb-1">WhatsApp Fast Support</h3>
                <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed mb-4">
                  Chat directly with our AI learning consultant for instant answers.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600">Reply in &lt; 15 mins</span>
                <div className="size-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ArrowRight className="size-3.5 stroke-[3]" />
                </div>
              </div>
            </a>

            {/* Email Card */}
            <a
              href={`mailto:${supportEmail}`}
              className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-violet-400 transition-all duration-300 hover:-translate-y-1.5 group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="size-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Mail className="size-6 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-slate-950 mb-1">Official Email Desk</h3>
                <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed mb-4">
                  For formal inquiries, corporate workshops, and billing support.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black text-violet-600 truncate max-w-[180px]">{supportEmail}</span>
                <div className="size-7 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors">
                  <ArrowRight className="size-3.5 stroke-[3]" />
                </div>
              </div>
            </a>

            {/* Operating Hours Card */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="size-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                  <Clock className="size-6 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-slate-950 mb-1">Support Hours</h3>
                <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed mb-4">
                  Monday to Sunday <br />
                  <span className="text-slate-900 font-black">9:00 AM – 10:00 PM IST</span>
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-500">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>365 Days Active Support</span>
              </div>
            </div>

          </div>
        </div>

        {/* ================= 3. CONTACT FORM + FAQ SECTION ================= */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10">
            
            {/* Left Contact Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="size-5 text-violet-600 fill-violet-400" />
                <h3 className="text-2xl font-black text-slate-950">Send Us a Direct Message</h3>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-500 mb-6">
                Fill out the quick form below and our mentor will connect with you immediately.
              </p>

              {status === "success" ? (
                <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200">
                  <CheckCircle2 className="size-12 text-emerald-600 mx-auto mb-3" />
                  <h4 className="text-lg font-black text-emerald-900 mb-1">Inquiry Sent Successfully!</h4>
                  <p className="text-xs sm:text-sm font-bold text-emerald-700 mb-4">
                    WhatsApp has been opened with your inquiry details. Our support team is ready to assist you.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs cursor-pointer hover:bg-emerald-700"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rahul@example.com"
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">WhatsApp / Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Course of Interest</label>
                    <select
                      value={formData.courseInterest}
                      onChange={(e) => setFormData({ ...formData, courseInterest: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                    >
                      <option value="General Inquiry">General Inquiry / Need Advice</option>
                      <option value="All Courses VIP Bundle">All Courses VIP Bundle</option>
                      <option value="AI Historical Documentary">AI Historical Documentary Creation</option>
                      <option value="AI Influencer UGC Ads">AI Influencer UGC Ads Mastery</option>
                      <option value="2D/3D Animation">2D / 3D Animation Mastery</option>
                      <option value="Anime Video Course">Anime Video Course Mastery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Your Message *</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your question or request here..."
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-violet-500/25 hover:shadow-xl hover:scale-101 active:scale-99 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{status === "loading" ? "Submitting..." : "Send Message & Open WhatsApp"}</span>
                    <Send className="size-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Right Quick FAQ Accordion (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="size-5 text-indigo-600" />
                  <h3 className="text-xl font-black text-slate-950">Quick Assistance FAQ</h3>
                </div>
                
                <div className="space-y-3">
                  {quickFaqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-black text-xs sm:text-sm text-slate-900 hover:text-violet-600 transition-colors cursor-pointer bg-white"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`size-4 text-slate-400 transition-transform ${
                            openFaq === idx ? "rotate-180 text-violet-600" : ""
                          }`}
                        />
                      </button>

                      {openFaq === idx && (
                        <div className="p-4 text-xs font-bold text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct WhatsApp Emergency Help Badge */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-7 text-white shadow-lg">
                <h4 className="text-base font-black mb-1">Need Urgent Assistance?</h4>
                <p className="text-xs font-bold text-emerald-100 mb-4 leading-relaxed">
                  Our WhatsApp desk is active right now. Send us a message for immediate support.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 font-black text-xs hover:bg-emerald-50 transition-all shadow-sm"
                >
                  <MessageCircle className="size-3.5 text-emerald-600" />
                  <span>Start WhatsApp Chat</span>
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactUs;
