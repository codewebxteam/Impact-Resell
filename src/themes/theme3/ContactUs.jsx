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
import { useAgency } from "../../context/AgencyContext";

// ==========================================
// THEME CONFIGURATION (#fedc5c Driven)
// ==========================================
const THEME = {
  bg: "bg-slate-50",
  textMain: "text-slate-950",
  textMuted: "text-slate-600",
  
  formCard: "bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden",
  infoCard: "bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_20px_50px_rgba(254,220,92,0.18)] hover:-translate-y-1 transition-all duration-300 flex items-start gap-5 group",
  
  buttonPrimary: "bg-[#fedc5c] text-slate-950 font-black shadow-lg shadow-amber-400/30 hover:bg-amber-400 transition-all duration-300 hover:scale-[1.02]",
  buttonSecondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 transition-all font-black",
  
  iconBg: "bg-[#fedc5c] text-slate-950",
  badgeBg: "bg-white border border-amber-400/40 text-slate-950 shadow-sm backdrop-blur font-black",
  
  inputBase: "w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:ring-4 focus:ring-amber-400/30 focus:border-amber-400 transition-all font-bold text-slate-900 placeholder-slate-400",
  labelBase: "text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1",
};

const faqs = [
  { q: "Do I need a high-end PC or camera to create AI videos and avatars?", a: "No! All AI video generation, avatar creation, and 2D/3D animations can be done using cloud-based AI tools on any mobile or computer." },
  { q: "What video styles will I learn in this academy?", a: "You will master AI Avatar Vlogging, 2D/3D Animation, AI Influencer UGC Ads, Historical Documentaries, Anime, Stickman, Baby Podcast, and Business Promos." },
  { q: "Can I monetize these AI videos on YouTube, Instagram, or sell to clients?", a: "Yes! We teach you exact strategies to build viral YouTube Shorts, Instagram Reels, grow AI channels, and land paying clients." },
  { q: "Are the AI video tools free to use?", a: "We cover completely free AI tools as well as top-tier paid AI platforms with free credits and trial workflows." },
  { q: "Will I get step-by-step AI prompts and project templates?", a: "Yes! You get ready-to-use AI text prompts, voiceover setups, animation workflows, and lifetime updates." },
  { q: "Will I get support if I face issues while generating videos?", a: "Yes! You’ll have direct access to WhatsApp & Email support from our team to guide you step-by-step." },
];

const ContactUs = () => {
  const [formState, setFormState] = useState("idle");

  const { agency, isMainSite } = useAgency();

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
      
      <div className="pt-24 md:pt-32 pb-0 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] uppercase mb-6 ${THEME.badgeBg}`}>
              <Sparkles className="size-4 text-amber-500 fill-amber-400" /> Get in Touch
            </div>
            <h1 className={`text-5xl md:text-7xl font-black mb-6 tracking-tight ${THEME.textMain} leading-[1.1]`}>
              We're Here To <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-600 bg-clip-text text-transparent">Help You Grow.</span>
            </h1>
            <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-bold ${THEME.textMuted}`}>
              Whether you have a question about our AI video courses, pricing, or partnerships, the <span className={`font-black ${THEME.textMain}`}>{!isMainSite && agency ? agency.name : "academy"}</span> team is ready to answer.
            </p>
          </motion.div>
        </div>

        {/* DETACHED GRID INTERFACE */}
        <div className="max-w-7xl mx-auto px-6 mb-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* LEFT COLUMN */}
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

              <div className="bg-[#fedc5c]/20 border border-amber-400/30 rounded-[2rem] p-6 mt-8 flex items-center gap-4">
                <Clock className="size-8 text-slate-950 shrink-0 stroke-[2.5]" />
                <div>
                  <h4 className={`font-black ${THEME.textMain}`}>Response Time</h4>
                  <p className={`text-sm font-bold ${THEME.textMuted}`}>We typically reply within 2-4 hours during business days.</p>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN */}
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
                  <h3 className={`text-4xl font-black mb-4 tracking-tight ${THEME.textMain}`}>Message Sent!</h3>
                  <p className={`max-w-sm font-bold text-lg ${THEME.textMuted}`}>
                    Opening WhatsApp to connect with our team. We'll get back to you shortly!
                  </p>
                  <button onClick={() => setFormState("idle")} className={`mt-10 px-8 py-4 rounded-2xl ${THEME.buttonSecondary}`}>
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-10">
                    <h3 className={`text-2xl font-black mb-2 ${THEME.textMain}`}>Send us a message</h3>
                    <p className={`font-bold ${THEME.textMuted}`}>Fill out the form below and we'll get right back to you.</p>
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
                        <label className={THEME.labelBase}>Phone <span className="text-slate-400 font-normal lowercase">(Optional)</span></label>
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

                    <button disabled={formState === "submitting"} className={`w-full py-5 rounded-2xl font-black text-base flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed ${THEME.buttonPrimary}`}>
                      {formState === "submitting" ? <>Processing...</> : <>Send Message <Send className="size-5 stroke-[2.5]" /></>}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <div className="border-t border-slate-200/50 bg-white py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${THEME.badgeBg}`}>
                <MessageCircleQuestion className="size-4 text-amber-500" />
                <span className="text-[10px] font-black tracking-widest uppercase">Quick Answers</span>
              </div>
              <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight ${THEME.textMain}`}>
                Frequently Asked <span className="bg-gradient-to-r from-slate-950 to-amber-600 bg-clip-text text-transparent">Questions</span>
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

const ContactItem = ({ icon: Icon, title, subtitle, value, link }) => (
  <div className={THEME.infoCard}>
    <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 ${THEME.iconBg}`}>
      <Icon className="size-6 stroke-[2.5]" />
    </div>
    <div className="pt-0.5 break-all">
      <h4 className={`text-xl font-black mb-1 ${THEME.textMain}`}>{title}</h4>
      <p className={`text-sm font-bold mb-3 ${THEME.textMuted}`}>{subtitle}</p>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="inline-block text-base font-black text-amber-600 hover:text-slate-950 transition-colors">
          {value}
        </a>
      ) : (
        <p className="text-base font-black text-slate-800">{value}</p>
      )}
    </div>
  </div>
);

const FAQItem = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`group rounded-[2rem] overflow-hidden transition-all duration-300 bg-slate-50 border border-slate-100 ${isOpen ? 'ring-2 ring-amber-400/40 shadow-md' : 'hover:shadow-md hover:border-slate-200'}`}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-6 md:p-8 text-left cursor-pointer outline-none">
        <span className={`text-lg font-black transition-colors pr-4 ${isOpen ? THEME.textMain : "text-slate-700 group-hover:text-slate-950"}`}>
          {q}
        </span>
        <div className={`size-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${isOpen ? "bg-[#fedc5c] text-slate-950 rotate-180 shadow-md" : "bg-white border border-slate-200 text-slate-400 group-hover:scale-110 group-hover:text-slate-950 group-hover:border-amber-400"}`}>
          {isOpen ? <Minus className="size-5 stroke-[2.5]" /> : <Plus className="size-5 stroke-[2.5]" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
            <div className="px-6 md:px-8 pb-8 pt-0">
              <div className="w-full h-px bg-slate-200/60 mb-6" />
              <p className={`text-base leading-relaxed font-bold ${THEME.textMuted}`}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactUs;
