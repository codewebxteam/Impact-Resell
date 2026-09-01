import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowRight,
  CheckCircle2,
  Globe,
  MessageCircleQuestion,
  Minus,
  Plus
} from "lucide-react";
import { useAgency } from "../../context/AgencyContext";

// ==========================================
// THEME CONFIGURATION (Centralized Colors)
// ==========================================
const THEME = {
  // Base Colors
  bg: "bg-[#f7fbff]",
  textMain: "text-[#101828]",
  textMuted: "text-slate-500",
  accentText: "text-[#1679a8]",
  
  // Gradients
  gradientText: "bg-gradient-to-r from-[#101828] via-[#1679a8] to-[#45cbe8] bg-clip-text text-transparent",
  
  // Glass & Cards
  glassPanel: "bg-white/35 backdrop-blur-[3px] border border-white/80 shadow-[0_30px_100px_rgba(39,116,145,0.12)]",
  cardBg: "bg-white/90 backdrop-blur border border-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]",
  
  // Buttons
  buttonPrimary: "bg-[#101828] text-white shadow-xl shadow-slate-300/50 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300",
  buttonSecondary: "bg-white/80 border border-slate-200 text-slate-700 shadow-sm backdrop-blur transition-all hover:border-slate-300 hover:bg-white",
  buttonAccent: "bg-cyan-400 text-[#101828] hover:bg-cyan-300 shadow-lg shadow-cyan-200/50 transition-all hover:-translate-y-1",
  
  // Ambient Glows
  cyanGlow: "bg-cyan-200/30 blur-[100px]",
  blueGlow: "bg-blue-200/40 blur-[120px]",
  indigoGlow: "bg-indigo-100/60 blur-[100px]",
  
  // UI Accents
  iconBg: "bg-cyan-50 text-cyan-600",
  badgeBg: "bg-white/80 border border-cyan-200 text-cyan-700 shadow-sm backdrop-blur",
};

// --- FAQ Data ---
const faqs = [
  { q: "Who is this course for?", a: "This course is designed for beginners, students, working professionals, and creators who want to build industry-ready skills from scratch." },
  { q: "Do I need any prior experience?", a: "No prior experience is required. The course starts from the basics and gradually moves to advanced, practical concepts." },
  { q: "How will I access the course after enrollment?", a: "You’ll get instant access to all course content after successful payment. Learn anytime, at your own pace." },
  { q: "Is this course online or offline?", a: "This is a 100% online course, accessible from anywhere using a mobile, tablet, or computer." },
  { q: "Will I get a certificate after completing the course?", a: "Yes, you’ll receive a certificate of completion after finishing the course." },
  { q: "Will I get support if I face issues?", a: "Yes. You’ll have access to WhatsApp & Email support and guidance from our team." },
];

const ContactUs = () => {
  const [formState, setFormState] = useState("idle"); 

  const { agency, isMainSite } = useAgency();

  // [LOGIC] Dynamic Data Selection
  const contactEmail = !isMainSite && agency?.email ? agency.email : "support@alifestable.com";
  const contactPhone = !isMainSite && agency?.whatsapp ? agency.whatsapp : "+91 80840 37252";
  const contactAddress = isMainSite ? "Near Metro Station, Nirman Vihar, East Delhi 110092" : (agency?.address || "Digital Campus (Online)");

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormState("submitting");

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const message =
      `*New Contact Inquiry* 📩\n\n` +
      `*Name:* ${data.firstName} ${data.lastName}\n` +
      `*Email:* ${data.email}\n` +
      `*Phone:* ${data.phone || "N/A"}\n` +
      `*Subject:* ${data.subject}\n` +
      `--------------------------------\n` +
      `*Message:* \n${data.message}`;

    const cleanPhone = contactPhone.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
    setFormState("success");
  };

  return (
    <div className={`min-h-screen w-full relative overflow-hidden font-sans ${THEME.bg}`}>
      
      {/* Background Ambient Glows */}
      <div className={`absolute top-0 right-[-100px] h-[500px] w-[500px] rounded-full ${THEME.blueGlow} pointer-events-none`} />
      <div className={`absolute bottom-[-100px] left-[-100px] h-[600px] w-[600px] rounded-full ${THEME.cyanGlow} pointer-events-none`} />

      <div className="pt-24 md:pt-32 pb-0 relative z-10">
        
        {/* =========================================
            1. HEADER SECTION
        ========================================= */}
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className={`text-4xl md:text-6xl font-black mb-6 tracking-tight ${THEME.textMain}`}>
              Let's Start a <br />
              <span className={THEME.gradientText}>Conversation.</span>
            </h1>
            <p className={`text-lg max-w-2xl mx-auto leading-relaxed font-medium ${THEME.textMuted}`}>
              Questions for <span className={`font-bold ${THEME.textMain}`}>{!isMainSite && agency ? agency.name : "us"}</span>? 
              We’re here to help you grow.
            </p>
          </motion.div>
        </div>

        {/* =========================================
            2. MAIN CONTACT INTERFACE
        ========================================= */}
        <div className="max-w-7xl mx-auto px-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row ${THEME.cardBg}`}
          >
            {/* --- LEFT COLUMN: Info --- */}
            <div className="lg:w-2/5 p-10 md:p-14 relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#101828] to-[#1679a8] text-white">
              <div className="absolute top-0 right-0 size-64 bg-cyan-400/20 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 size-64 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-2 tracking-tight">Contact Information</h3>
                <p className="text-cyan-50/80 mb-10 text-sm font-medium leading-relaxed">
                  Reach out to {!isMainSite && agency ? agency.name : "us"} directly through these channels.
                </p>

                <div className="space-y-8">
                  <ContactItem icon={Mail} title="Email Us" value={contactEmail} link={`mailto:${contactEmail}`} />
                  <ContactItem icon={Phone} title="Call / WhatsApp" value={contactPhone} link={`https://wa.me/${contactPhone.replace(/\D/g, "")}`} />
                  <ContactItem icon={MapPin} title="Location" value={contactAddress} />
                </div>
              </div>

              <div className="relative z-10 mt-12 pt-10 border-t border-white/20">
                <div className="flex gap-4">
                  <SocialIcon />
                  <SocialIcon />
                  <SocialIcon />
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN: Form --- */}
            <div className="lg:w-3/5 p-10 md:p-14 relative">
              {formState === "success" ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`size-24 rounded-full flex items-center justify-center mb-6 shadow-md ${THEME.iconBg}`}>
                    <CheckCircle2 className="size-12" />
                  </motion.div>
                  <h3 className={`text-3xl font-black mb-3 ${THEME.textMain}`}>Message Sent!</h3>
                  <p className={`max-w-md font-medium ${THEME.textMuted}`}>
                    Opening WhatsApp to send your inquiry. We'll get back to you shortly!
                  </p>
                  <button onClick={() => setFormState("idle")} className={`mt-8 px-8 py-3.5 rounded-xl font-bold text-sm ${THEME.buttonSecondary}`}>
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</label>
                      <input required name="firstName" type="text" placeholder="John" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 transition-all font-medium text-slate-700 placeholder-slate-400" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</label>
                      <input required name="lastName" type="text" placeholder="Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 transition-all font-medium text-slate-700 placeholder-slate-400" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                      <input required name="email" type="email" placeholder="john@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 transition-all font-medium text-slate-700 placeholder-slate-400" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone (Optional)</label>
                      <input name="phone" type="tel" placeholder="+91..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 transition-all font-medium text-slate-700 placeholder-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</label>
                    <select name="subject" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 transition-all cursor-pointer font-medium text-slate-700">
                      <option>General Inquiry</option>
                      <option>Course Support</option>
                      <option>Business Partnership</option>
                      <option>Report a Bug</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message</label>
                    <textarea required name="message" rows="4" placeholder="How can we help you?" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 transition-all resize-none font-medium text-slate-700 placeholder-slate-400"></textarea>
                  </div>

                  <button disabled={formState === "submitting"} className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${THEME.buttonPrimary}`}>
                    {formState === "submitting" ? <>Processing...</> : <>Send Message <Send className="size-4" /></>}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        {/* =========================================
            3. FREQUENTLY ASKED QUESTIONS (Redesigned)
        ========================================= */}
        <div className="border-t border-white/40 py-20 md:py-32 relative">
          <div className={`absolute inset-0 ${THEME.glassPanel} rounded-none border-x-0 -z-10`} />
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 ${THEME.badgeBg}`}>
                <MessageCircleQuestion className="size-4" />
                <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Got Questions?</span>
              </div>
              <h2 className={`text-3xl md:text-5xl font-black mb-4 tracking-tight ${THEME.textMain}`}>
                Frequently Asked <span className={THEME.gradientText}>Questions</span>
              </h2>
              <p className={`max-w-lg mx-auto text-sm md:text-base font-medium ${THEME.textMuted}`}>
                Quick answers to questions you might have. Can't find what you're looking for? Email us.
              </p>
            </div>

            <div className="grid gap-4">
              {faqs.map((faq, index) => (
                <FAQItem key={index} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const ContactItem = ({ icon: Icon, title, value, link }) => (
  <div className="flex items-start gap-4 group cursor-default">
    <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center text-cyan-300 group-hover:bg-cyan-400 group-hover:text-[#101828] transition-all duration-300 shadow-sm border border-white/5">
      <Icon className="size-6" />
    </div>
    <div className="pt-1">
      <p className="text-cyan-100/70 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-white hover:text-cyan-300 transition-colors break-all">
          {value}
        </a>
      ) : (
        <p className="text-lg font-bold text-white">{value}</p>
      )}
    </div>
  </div>
);

const SocialIcon = () => (
  <div className="size-12 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#101828] hover:scale-105 transition-all cursor-pointer shadow-sm">
    <Globe className="size-5" />
  </div>
);

const FAQItem = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`group rounded-3xl overflow-hidden transition-all duration-300 border ${isOpen ? "bg-white border-cyan-200 shadow-xl shadow-cyan-100/50" : "bg-white/60 border-white hover:bg-white hover:border-cyan-100 shadow-sm"}`}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-6 md:p-8 text-left cursor-pointer outline-none">
        <span className={`text-base md:text-lg font-bold transition-colors pr-4 ${isOpen ? THEME.textMain : "text-slate-600 group-hover:text-[#101828]"}`}>
          {q}
        </span>
        <div className={`size-8 md:size-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${isOpen ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white rotate-180 shadow-md" : "bg-cyan-50 text-cyan-600 group-hover:scale-110"}`}>
          {isOpen ? <Minus className="size-4 md:size-5" /> : <Plus className="size-4 md:size-5" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
            <div className="px-6 md:px-8 pb-8 pt-0">
              <div className="w-full h-px bg-slate-100 mb-4" />
              <p className={`text-sm md:text-base leading-relaxed font-medium ${THEME.textMuted}`}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactUs;