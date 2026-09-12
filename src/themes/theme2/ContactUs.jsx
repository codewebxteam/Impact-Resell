/* eslint-disable no-unused-vars */
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
  Plus,
  Sparkles,
  Clock
} from "lucide-react";
import { useAgency } from "../../context/AgencyContext"; // [KEEP] Subdomain Logic untouched

// ==========================================
// THEME CONFIGURATION (Driven by CSS Variables)
// ==========================================
const THEME = {
  // Base Colors
  bg: "bg-slate-50",
  textMain: "text-slate-900",
  textMuted: "text-slate-500",
  accentText: "text-[var(--brand-color)]",
  
  // Gradients
  gradientText: "bg-gradient-to-r from-slate-900 via-[var(--brand-color)] to-[var(--accent-color)] bg-clip-text text-transparent",
  
  // Floating Cards
  formCard: "bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden",
  infoCard: "bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex items-start gap-5 group",
  
  // Buttons
  buttonPrimary: "bg-gradient-to-r from-[var(--brand-color)] to-[var(--accent-color)] text-white shadow-lg shadow-[var(--brand-color)]/25 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]",
  buttonSecondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all font-bold",
  
  // Ambient Glows
  accentGlow: "bg-[var(--accent-color)]/10 blur-[130px]",
  brandGlow: "bg-[var(--brand-color)]/15 blur-[140px]",
  
  // UI Accents
  iconBg: "bg-[var(--brand-color)]/10 text-[var(--brand-color)] group-hover:bg-[var(--brand-color)] group-hover:text-white transition-colors duration-300",
  badgeBg: "bg-white border border-[var(--brand-color)]/20 text-[var(--brand-color)] shadow-sm backdrop-blur",
  
  // Form Inputs
  inputBase: "w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:ring-4 focus:ring-[var(--brand-color)]/10 focus:border-[var(--brand-color)] transition-all font-semibold text-slate-800 placeholder-slate-400",
  labelBase: "text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 block ml-1",
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
  const [formState, setFormState] = useState("idle"); // idle, submitting, success

  // Agency Context Hook
  const { agency, isMainSite } = useAgency();

  // Dynamic Data Selection
  const contactEmail = !isMainSite && agency?.email ? agency.email : "support@alifestable.com";
  const contactPhone = !isMainSite && agency?.whatsapp ? agency.whatsapp : "+91 80840 37252";
  const contactAddress = isMainSite ? "Near Metro Station, Nirman Vihar, East Delhi 110092" : (agency?.address || "Digital Campus (Online)");

  // Handle Submit to Send WhatsApp Message
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
    <div
      className={`min-h-screen w-full relative overflow-hidden font-roboto-condensed ${THEME.bg}`}
      style={{
        '--brand-color': '#6366f1',
        '--accent-color': '#ec4899'
      }}
    >
      
      {/* Abstract Background Shapes */}
      <div className={`absolute top-[-10%] right-[-5%] h-[700px] w-[700px] rounded-full ${THEME.brandGlow} pointer-events-none`} />
      <div className={`absolute bottom-[10%] left-[-10%] h-[600px] w-[600px] rounded-full ${THEME.accentGlow} pointer-events-none`} />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      <div className="pt-24 md:pt-32 pb-0 relative z-10">
        
        {/* =========================================
            1. HEADER SECTION
        ========================================= */}
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 ${THEME.badgeBg}`}>
              <Sparkles className="size-4" /> Get in Touch
            </div>
            <h1 className={`text-5xl md:text-7xl font-extrabold mb-6 tracking-tight ${THEME.textMain} leading-[1.1]`}>
              We're Here To <br className="hidden md:block" />
              <span className={THEME.gradientText}>Help You Grow.</span>
            </h1>
            <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium ${THEME.textMuted}`}>
              Whether you have a question about our courses, pricing, or partnerships, the <span className={`font-bold ${THEME.textMain}`}>{!isMainSite && agency ? agency.name : "academy"}</span> team is ready to answer.
            </p>
          </motion.div>
        </div>

        {/* =========================================
            2. DETACHED GRID INTERFACE
        ========================================= */}
        <div className="max-w-7xl mx-auto px-6 mb-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* --- LEFT COLUMN: Floating Info Cards --- */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 space-y-6"
            >
              <ContactItem 
                icon={Mail} 
                title="Email Us" 
                subtitle="Drop us a line anytime."
                value={contactEmail} 
                link={`mailto:${contactEmail}`} 
              />
              <ContactItem 
                icon={Phone} 
                title="Call / WhatsApp" 
                subtitle="We're available Mon-Sat."
                value={contactPhone} 
                link={`https://wa.me/${contactPhone.replace(/\D/g, "")}`} 
              />
              <ContactItem 
                icon={MapPin} 
                title="Location" 
                subtitle="Visit our campus."
                value={contactAddress} 
              />

              <div className="bg-[var(--brand-color)]/5 border border-[var(--brand-color)]/20 rounded-[2rem] p-6 mt-8 flex items-center gap-4">
                <Clock className="size-8 text-[var(--brand-color)] shrink-0" />
                <div>
                  <h4 className={`font-bold ${THEME.textMain}`}>Response Time</h4>
                  <p className={`text-sm font-medium ${THEME.textMuted}`}>We typically reply within 2-4 hours during business days.</p>
                </div>
              </div>
            </motion.div>

            {/* --- RIGHT COLUMN: The Form --- */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`lg:col-span-7 ${THEME.formCard}`}
            >
              {formState === "success" ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{type: "spring"}} className="size-28 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-8 shadow-inner">
                    <CheckCircle2 className="size-14 text-emerald-500" />
                  </motion.div>
                  <h3 className={`text-4xl font-extrabold mb-4 tracking-tight ${THEME.textMain}`}>Message Sent!</h3>
                  <p className={`max-w-sm font-medium text-lg ${THEME.textMuted}`}>
                    Opening WhatsApp to connect with our team. We'll get back to you shortly!
                  </p>
                  <button onClick={() => setFormState("idle")} className={`mt-10 px-8 py-4 rounded-2xl ${THEME.buttonSecondary}`}>
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-10">
                    <h3 className={`text-2xl font-extrabold mb-2 ${THEME.textMain}`}>Send us a message</h3>
                    <p className={`font-medium ${THEME.textMuted}`}>Fill out the form below and we'll get right back to you.</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className={THEME.labelBase}>First Name</label>
                        <input required name="firstName" type="text" placeholder="John" className={THEME.inputBase} />
                      </div>
                      <div>
                        <label className={THEME.labelBase}>Last Name</label>
                        <input required name="lastName" type="text" placeholder="Doe" className={THEME.inputBase} />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className={THEME.labelBase}>Email Address</label>
                        <input required name="email" type="email" placeholder="john@example.com" className={THEME.inputBase} />
                      </div>
                      <div>
                        <label className={THEME.labelBase}>Phone <span className="text-slate-300 font-normal lowercase">(Optional)</span></label>
                        <input name="phone" type="tel" placeholder="+91..." className={THEME.inputBase} />
                      </div>
                    </div>

                    <div>
                      <label className={THEME.labelBase}>Subject</label>
                      <div className="relative">
                        <select name="subject" className={`${THEME.inputBase} cursor-pointer appearance-none`}>
                          <option>General Inquiry</option>
                          <option>Course Support</option>
                          <option>Business Partnership</option>
                          <option>Report a Bug</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={THEME.labelBase}>Message</label>
                      <textarea required name="message" rows="5" placeholder="How can we help you today?" className={`${THEME.inputBase} resize-none`}></textarea>
                    </div>

                    <button disabled={formState === "submitting"} className={`w-full py-5 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed ${THEME.buttonPrimary}`}>
                      {formState === "submitting" ? <>Processing...</> : <>Send Message <Send className="size-5" /></>}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* =========================================
            3. FREQUENTLY ASKED QUESTIONS
        ========================================= */}
        <div className="border-t border-slate-200/50 bg-white py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${THEME.badgeBg}`}>
                <MessageCircleQuestion className="size-4" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Quick Answers</span>
              </div>
              <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 tracking-tight ${THEME.textMain}`}>
                Frequently Asked <span className={THEME.gradientText}>Questions</span>
              </h2>
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

const ContactItem = ({ icon: Icon, title, subtitle, value, link }) => (
  <div className={THEME.infoCard}>
    <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 ${THEME.iconBg}`}>
      <Icon className="size-6" strokeWidth={2} />
    </div>
    <div className="pt-0.5 break-all">
      <h4 className={`text-xl font-extrabold mb-1 ${THEME.textMain}`}>{title}</h4>
      <p className={`text-sm font-medium mb-3 ${THEME.textMuted}`}>{subtitle}</p>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="inline-block text-base font-bold text-[var(--brand-color)] hover:text-[var(--accent-color)] transition-colors">
          {value}
        </a>
      ) : (
        <p className="text-base font-bold text-slate-700">{value}</p>
      )}
    </div>
  </div>
);

const SocialIcon = () => (
  <div className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[var(--brand-color)] hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer shadow-sm">
    <Globe className="size-5" />
  </div>
);

const FAQItem = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`group rounded-[2rem] overflow-hidden transition-all duration-300 bg-slate-50 border border-slate-100 ${isOpen ? 'ring-2 ring-[var(--brand-color)]/20 shadow-md' : 'hover:shadow-md hover:border-slate-200'}`}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-6 md:p-8 text-left cursor-pointer outline-none">
        <span className={`text-lg font-extrabold transition-colors pr-4 ${isOpen ? THEME.textMain : "text-slate-600 group-hover:text-[var(--brand-color)]"}`}>
          {q}
        </span>
        <div className={`size-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${isOpen ? "bg-[var(--brand-color)] text-white rotate-180 shadow-md" : "bg-white border border-slate-200 text-slate-400 group-hover:scale-110 group-hover:text-[var(--brand-color)] group-hover:border-[var(--brand-color)]/30"}`}>
          {isOpen ? <Minus className="size-5" /> : <Plus className="size-5" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
            <div className="px-6 md:px-8 pb-8 pt-0">
              <div className="w-full h-px bg-slate-200/60 mb-6" />
              <p className={`text-base leading-relaxed font-medium ${THEME.textMuted}`}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactUs;