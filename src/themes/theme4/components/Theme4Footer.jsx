/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  X,
  MessageCircle,
  Heart,
  FileCheck,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAgency } from "../../../context/AgencyContext";

const SocialIcon = ({ Icon, href, title }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noreferrer"
    title={title}
    whileHover={{
      scale: 1.1,
      y: -2,
    }}
    whileTap={{ scale: 0.9 }}
    className="size-9 sm:size-10 rounded-full bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-600 hover:text-violet-600 hover:border-violet-300 transition-all duration-300 cursor-pointer"
  >
    <Icon className="size-4 sm:size-4.5" />
  </motion.a>
);

const Theme4Footer = ({ currentTheme = "theme4" }) => {
  const [activePolicy, setActivePolicy] = useState(null);
  const { agency, isMainSite } = useAgency();

  // Dynamic Agency Data (Synced with Subdomain & Partner config)
  const academyName = !isMainSite && agency?.name ? agency.name : (agency?.name || "AIFlix Academy");
  const supportEmail = !isMainSite && agency?.email ? agency.email : "support@alifestable.com";
  const supportPhone = !isMainSite && agency?.whatsapp ? agency.whatsapp : "+91 74818 96182";
  const whatsappLink = `https://wa.me/${supportPhone.replace(/\D/g, "")}?text=${encodeURIComponent("Hello! I need some information regarding courses.")}`;
  const instaLink = !isMainSite && agency?.instagram ? agency.instagram : "https://www.instagram.com/";
  const currentYear = new Date().getFullYear();

  const POLICY_CONTENT = {
    privacy: {
      title: "Privacy Policy",
      content: (
        <div className="space-y-5 text-slate-600 text-sm md:text-base leading-relaxed">
          <section>
            <h4 className="text-slate-900 font-black mb-1.5">Information Collection</h4>
            <p>
              We collect personal information such as name, email, phone number, and payment details for the purpose of course enrollment and student support.
            </p>
          </section>

          <section>
            <h4 className="text-slate-900 font-black mb-1.5">How We Use Information</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and manage access to online AI video courses.</li>
              <li>To communicate important curriculum updates and announcements.</li>
              <li>To process payments securely via authorized gateways.</li>
            </ul>
          </section>

          <section>
            <h4 className="text-slate-900 font-black mb-1.5">Information Sharing</h4>
            <p className="mb-2">We do not sell or share your personal information with third parties, except:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To comply with legal regulations.</li>
              <li>To process payments via authorized payment processors.</li>
            </ul>
          </section>

          <section>
            <h4 className="text-slate-900 font-black mb-1.5">Your Rights</h4>
            <p>
              You may request access, correction, or deletion of your personal data by contacting us at{" "}
              <a href={`mailto:${supportEmail}`} className="text-violet-600 font-bold hover:underline">
                {supportEmail}
              </a>{" "}
              or WhatsApp us at{" "}
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="text-violet-600 font-bold hover:underline">
                {supportPhone}
              </a>.
            </p>
          </section>
        </div>
      ),
    },
    refund: {
      title: "Refund Policy",
      content: (
        <div className="space-y-5 text-slate-600 text-sm md:text-base leading-relaxed">
          <section>
            <h4 className="text-slate-900 font-black mb-1.5">Digital Product Disclaimer</h4>
            <p>
              All courses sold on {academyName} are digital products with instant access upon enrollment. By completing an enrollment, you acknowledge that digital goods cannot be returned once access is delivered.
            </p>
          </section>

          <section>
            <h4 className="text-slate-900 font-black mb-1.5">No Refunds on Completed Access</h4>
            <p>
              Due to the immediate delivery of digital course materials and video lessons, course fees are non-refundable once accessed.
            </p>
          </section>

          <section>
            <h4 className="text-slate-900 font-black mb-1.5">Support & Assistance</h4>
            <p>
              If you experience any technical difficulty accessing course lessons, please reach out directly at{" "}
              <a href={`mailto:${supportEmail}`} className="text-violet-600 font-bold hover:underline">
                {supportEmail}
              </a>{" "}
              or WhatsApp us at{" "}
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="text-violet-600 font-bold hover:underline">
                {supportPhone}
              </a>. Our support team is dedicated to resolving any access issues promptly.
            </p>
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
      { name: "Verify Certificate", href: "/verify", isVerify: true },
      { name: "Blog", href: "/blog" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#", type: "privacy" },
      { name: "Refund Policy", href: "#", type: "refund" },
    ],
  };

  return (
    <footer className="relative bg-slate-50 text-slate-800 pt-16 pb-12 font-sans overflow-hidden border-t border-slate-200/80">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 left-1/4 size-96 bg-violet-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 size-96 bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1450px] mx-auto px-5 sm:px-10 lg:px-16 relative z-10">
        
        {/* Top Section: Brand Info + Need Help WhatsApp Card */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-12 pb-10 border-b border-slate-200/80">
          
          {/* Brand Info */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to={currentTheme ? `/dev/${currentTheme}/home` : "/"} className="flex items-center gap-3 mb-4 group">
              <div className="size-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-violet-500/25">
                <GraduationCap className="size-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                  {academyName}
                </span>
                <span className="text-[11px] font-bold text-violet-600 leading-tight">
                  {agency?.tagline || "Learn Today. Create Tomorrow."}
                </span>
              </div>
            </Link>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 leading-tight tracking-tight">
              Start your journey toward{" "}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                mastering AI Video Creation
              </span>.
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md font-bold leading-relaxed">
              Empowering creators, students, and professionals to create high-impact viral videos, 2D/3D animation, and AI influencers.
            </p>
          </motion.div>

          {/* Need Help WhatsApp Card */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col justify-center"
          >
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 relative overflow-hidden group shadow-lg shadow-slate-200/50">
              <div className="absolute top-0 right-0 size-32 bg-violet-100/50 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-slate-900 font-black text-base sm:text-lg">
                  Need Help or Have Questions?
                </h4>
              </div>
              
              <p className="text-slate-500 mb-5 text-xs sm:text-sm leading-relaxed font-bold">
                Clear all your doubts instantly by chatting with our friendly support team on WhatsApp.
              </p>
              
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md shadow-emerald-600/20 active:scale-98 text-xs sm:text-sm cursor-pointer"
              >
                <MessageCircle className="size-4.5" />
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </motion.div>

        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-12">
          {Object.entries(footerLinks).map(([title, links], categoryIndex) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: categoryIndex * 0.08 }}
            >
              <h4 className="text-slate-900 font-black text-xs sm:text-sm uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
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
                      className={`group flex items-center gap-2 transition-colors text-xs sm:text-sm font-bold ${
                        link.isPartner || link.type
                          ? "text-violet-600 hover:text-indigo-600 cursor-pointer"
                          : "text-slate-600 hover:text-violet-600"
                      }`}
                    >
                      <span className="relative flex items-center gap-1.5">
                        {link.isPartner && <ShieldCheck className="size-3.5 text-violet-600" />}
                        {link.isVerify && <FileCheck className="size-3.5 text-indigo-600" />}
                        {link.name}
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-violet-600 transition-all group-hover:w-full rounded-full"></span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-200/80 gap-4 text-xs sm:text-sm font-bold">
          
          <div className="flex items-center gap-2 text-slate-500">
            <span>© {currentYear} {academyName}. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Made with</span>
            <Heart className="size-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <a
              href="https://www.codewebx.in/"
              target="_blank"
              rel="noreferrer"
              className="text-violet-600 hover:text-indigo-600 transition-colors font-black"
            >
              CodeWebX
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            <SocialIcon Icon={Instagram} href={instaLink} title="Instagram" />
            <SocialIcon Icon={Twitter} href="#" title="Twitter" />
            <SocialIcon Icon={Linkedin} href="#" title="LinkedIn" />
          </div>

        </div>

      </div>

      {/* Background Watermark */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-full text-center pointer-events-none select-none overflow-hidden">
        <motion.h1
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.035 }}
          transition={{ duration: 1.5 }}
          className="text-[12vw] sm:text-[8vw] md:text-[6vw] lg:text-[5.5vw] font-black text-slate-900 leading-none tracking-tighter whitespace-nowrap uppercase"
        >
          {academyName}
        </motion.h1>
      </div>

      {/* Policy Modal */}
      <AnimatePresence>
        {activePolicy && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePolicy(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
            >
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/80 backdrop-blur-xl">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {POLICY_CONTENT[activePolicy].title}
                </h3>
                <button
                  onClick={() => setActivePolicy(null)}
                  className="size-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-violet-100 hover:text-violet-600 transition-colors cursor-pointer"
                >
                  <X className="size-4 stroke-[2.5]" />
                </button>
              </div>

              <div className="p-5 sm:p-7 overflow-y-auto">
                {POLICY_CONTENT[activePolicy].content}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/80 text-center">
                <button
                  onClick={() => setActivePolicy(null)}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 text-white font-black text-xs sm:text-sm hover:bg-violet-700 transition-colors cursor-pointer shadow-md shadow-violet-500/20"
                >
                  Close Policy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Theme4Footer;
