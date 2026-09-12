/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Twitter,
  Linkedin,
  Instagram,
  Heart,
  X,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useAgency } from "../../../context/AgencyContext";

const SocialIcon = ({ Icon, href }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noreferrer"
    whileHover={{
      scale: 1.1,
      y: -3,
      backgroundColor: "#fedc5c",
      color: "#090d16",
      borderColor: "#fedc5c",
    }}
    whileTap={{ scale: 0.9 }}
    className="size-9 sm:size-10 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center text-slate-400 transition-all duration-300 hover:shadow-md cursor-pointer"
  >
    <Icon className="size-4 sm:size-4.5" />
  </motion.a>
);

const Theme3Footer = ({ currentTheme = "theme3" }) => {
  const [activePolicy, setActivePolicy] = useState(null);
  const { agency, isMainSite } = useAgency();

  const academyName = !isMainSite && agency ? agency.name : "AI Courses";
  const supportEmail = !isMainSite && agency?.email ? agency.email : "support@alifestable.com";
  const supportPhone = !isMainSite && agency?.whatsapp ? agency.whatsapp : "+91 74818 96182";
  const whatsappLink = `https://wa.me/${supportPhone.replace(/\D/g, "")}?text=${encodeURIComponent("Hello! I need some information.")}`;
  const instaLink = !isMainSite && agency?.instagram ? agency.instagram : "https://www.instagram.com/";
  const currentYear = new Date().getFullYear();

  const POLICY_CONTENT = {
    privacy: {
      title: "Privacy Policy",
      content: (
        <div className="space-y-5 text-slate-300 text-sm md:text-base leading-relaxed">
          <section>
            <h4 className="text-white font-bold mb-1.5">Information Collection</h4>
            <p>We collect personal information such as name, email, phone number, and payment details for the purpose of course enrollment and support.</p>
          </section>
          <section>
            <h4 className="text-white font-bold mb-1.5">How We Use Information</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and manage access to courses.</li>
              <li>To communicate course updates and announcements.</li>
              <li>To process payments securely via Razorpay.</li>
            </ul>
          </section>
          <section>
            <h4 className="text-white font-bold mb-1.5">Your Rights</h4>
            <p>
              You may request access, correction, or deletion of your data by contacting us at{" "}
              <a href={`mailto:${supportEmail}`} className="text-amber-300 hover:underline">{supportEmail}</a> or WhatsApp us at{" "}
              <a href={whatsappLink} className="text-amber-300 hover:underline">{supportPhone}</a>.
            </p>
          </section>
        </div>
      ),
    },
    refund: {
      title: "Refund Policy",
      content: (
        <div className="space-y-5 text-slate-300 text-sm md:text-base leading-relaxed">
          <section>
            <h4 className="text-white font-bold mb-1.5">Digital Product Disclaimer</h4>
            <p>All courses sold on {academyName} are digital products with instant access after purchase. Once delivered, course fees are non-refundable.</p>
          </section>
        </div>
      ),
    },
  };

  const footerLinks = {
    Academy: [
      { name: "Courses", href: currentTheme ? `/dev/${currentTheme}/courses` : "/courses" },
    ],
    Company: [
      { name: "About Us", href: currentTheme ? `/dev/${currentTheme}/about` : "/about" },
      { name: "Contact Us", href: currentTheme ? `/dev/${currentTheme}/contact` : "/contact" },
      ...(isMainSite ? [{ name: "Register as a Partner", href: "#", isPartner: true }] : []),
    ],
    Resources: [
      { name: "Verify Certificate", href: "/verify" },
      { name: "Blog", href: "/blog" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#", type: "privacy" },
      { name: "Refund Policy", href: "#", type: "refund" },
    ],
  };

  return (
    <footer className="relative bg-[#090d16] text-white pt-10 sm:pt-14 pb-20 lg:pb-10 overflow-hidden font-sans border-t border-slate-800/80">
      <div className="absolute top-0 left-0 size-160 bg-amber-400/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 size-120 bg-yellow-500/10 rounded-full blur-[90px] pointer-events-none translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-10 pb-8 border-b border-slate-800/60">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="size-9 sm:size-10 bg-[#fedc5c] rounded-xl flex items-center justify-center shadow-md shadow-amber-400/30">
                <span className="text-slate-950 font-black text-lg uppercase">
                  {academyName.charAt(0)}
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {academyName}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight tracking-tight">
              Start your journey <br className="hidden sm:block" /> toward{" "}
              <span className="text-[#fedc5c]">mastering AI Video Creation</span>.
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md font-medium leading-relaxed">
              Learn AI avatar vlogging, 2D/3D animation, and viral video creation with our community.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col justify-center"
          >
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 sm:p-6 relative overflow-hidden group shadow-lg backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <h4 className="text-white font-bold text-base sm:text-lg mb-1 relative z-10">
                Need Help?
              </h4>
              <p className="text-slate-400 mb-4 text-xs sm:text-sm relative z-10 leading-relaxed font-medium">
                Have questions? Clear your doubts instantly by reaching out to our support team on WhatsApp.
              </p>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#fedc5c] hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-400/25 cursor-pointer relative z-10 text-xs sm:text-sm active:scale-98"
              >
                <MessageCircle className="size-4 stroke-[2.5]" /> Message on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-10">
          {Object.entries(footerLinks).map(([title, links], categoryIndex) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: categoryIndex * 0.08 }}
            >
              <h4 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider mb-3.5">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (link.isPartner) {
                          e.preventDefault();
                          window.dispatchEvent(new CustomEvent("openPartnerModal"));
                        }
                        if (link.type) {
                          e.preventDefault();
                          setActivePolicy(link.type);
                        }
                      }}
                      className={`group flex items-center gap-2 transition-colors text-xs sm:text-sm font-medium ${
                        link.isPartner || link.type
                          ? "text-[#fedc5c] hover:text-amber-300 font-bold cursor-pointer"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="relative flex items-center gap-1.5">
                        {link.isPartner && <ShieldCheck className="size-3.5" />}
                        {link.name}
                        <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#fedc5c] transition-all group-hover:w-full"></span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-800/60 gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <span>© {currentYear} {academyName}. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <span>Made with</span>
            <Heart className="size-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <a href="https://www.codewebx.in/" target="_blank" rel="noreferrer" className="text-[#fedc5c] hover:text-amber-300 transition-colors font-bold">
              CodeWebX
            </a>
          </div>

          <div className="flex items-center gap-3">
            <SocialIcon Icon={Twitter} href="#" />
            <SocialIcon Icon={Linkedin} href="#" />
            <SocialIcon Icon={Instagram} href={instaLink} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 w-full text-center pointer-events-none select-none overflow-hidden">
        <motion.h1
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.04 }}
          transition={{ duration: 1.5 }}
          className="text-[12vw] sm:text-[8vw] md:text-[6vw] lg:text-[5.5vw] font-black text-white leading-none tracking-tighter whitespace-nowrap uppercase"
        >
          {academyName}
        </motion.h1>
      </div>

      <AnimatePresence>
        {activePolicy && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActivePolicy(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }} className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl z-10">
                <h3 className="text-lg sm:text-xl font-bold text-white">{POLICY_CONTENT[activePolicy].title}</h3>
                <button onClick={() => setActivePolicy(null)} className="size-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-[#fedc5c] hover:text-slate-950 transition-colors cursor-pointer">
                  <X className="size-4" />
                </button>
              </div>
              <div className="p-5 sm:p-7 overflow-y-auto custom-scrollbar">{POLICY_CONTENT[activePolicy].content}</div>
              <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-center">
                <button onClick={() => setActivePolicy(null)} className="px-6 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs sm:text-sm hover:bg-slate-700 transition-colors cursor-pointer">Close Policy</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Theme3Footer;
