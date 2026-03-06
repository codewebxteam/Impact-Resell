import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Twitter,
  Linkedin,
  Instagram,
  Heart,
  X,
  MessageCircle,
  ShieldCheck, // Icon for Partner Link
} from "lucide-react";
import { useAgency } from "../context/AgencyContext";

const SocialIcon = ({ Icon, href }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noreferrer"
    whileHover={{
      scale: 1.1,
      y: -3,
      backgroundColor: "#5edff4",
      color: "#0f172a",
      borderColor: "#5edff4",
    }}
    whileTap={{ scale: 0.9 }}
    className="size-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(94,223,244,0.5)] cursor-pointer"
  >
    <Icon className="size-5" />
  </motion.a>
);

const Footer = () => {
  const [activePolicy, setActivePolicy] = useState(null);

  // [LOGIC] Agency Context Hook
  const { agency, isMainSite } = useAgency();

  // [LOGIC] Dynamic Data Variables
  const academyName =
    !isMainSite && agency ? agency.name : "Impact School Of AI";

  const supportEmail =
    !isMainSite && agency?.email ? agency.email : "support@alifestable.com";

  const supportPhone =
    !isMainSite && agency?.whatsapp ? agency.whatsapp : "+91 74818 96182";

  const whatsappLink = `https://wa.me/${supportPhone.replace(/\D/g, "")}`;

  const instaLink =
    !isMainSite && agency?.instagram
      ? agency.instagram
      : "https://www.instagram.com/";

  // [LOGIC] Dynamic Year
  const currentYear = new Date().getFullYear();

  // [CONTENT] Policy Content
  const POLICY_CONTENT = {
    privacy: {
      title: "Privacy Policy",
      content: (
        <div className="space-y-6 text-slate-300 text-sm md:text-base leading-relaxed">
          <section>
            <h4 className="text-white font-bold mb-2">
              Information Collection
            </h4>
            <p>
              We collect personal information such as name, email, phone number,
              and payment details for the purpose of course enrollment and
              support.
            </p>
          </section>

          <section>
            <h4 className="text-white font-bold mb-2">
              How We Use Information
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and manage access to courses.</li>
              <li>To communicate course updates and announcements.</li>
              <li>To process payments securely via Razorpay.</li>
            </ul>
          </section>

          <section>
            <h4 className="text-white font-bold mb-2">Information Sharing</h4>
            <p className="mb-2">
              We do not sell or share your personal information with third
              parties, except:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To comply with legal requirements.</li>
              <li>
                To process payments via Razorpay or other authorized payment
                processors.
              </li>
            </ul>
          </section>

          <section>
            <h4 className="text-white font-bold mb-2">Cookies & Analytics</h4>
            <p>
              We may use cookies and analytics tools to improve website
              experience and track course progress.
            </p>
          </section>

          <section>
            <h4 className="text-white font-bold mb-2">Data Security</h4>
            <p>
              We implement reasonable security measures to protect your personal
              information from unauthorized access.
            </p>
          </section>

          <section>
            <h4 className="text-white font-bold mb-2">Your Rights</h4>
            <p>
              You may request access, correction, or deletion of your personal
              data by contacting us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-[#5edff4] hover:underline"
              >
                {supportEmail}
              </a>{" "}
              or WhatsApp us at{" "}
              <a href={whatsappLink} className="text-[#5edff4] hover:underline">
                {supportPhone}
              </a>
              .
            </p>
          </section>

          <section>
            <h4 className="text-white font-bold mb-2">Policy Updates</h4>
            <p>
              We may update this privacy policy from time to time. Updates will
              be posted on this page.
            </p>
          </section>
        </div>
      ),
    },
    refund: {
      title: "Refund Policy",
      content: (
        <div className="space-y-6 text-slate-300 text-sm md:text-base leading-relaxed">
          <section>
            <h4 className="text-white font-bold mb-2">
              Digital Product Disclaimer
            </h4>
            <p>
              All courses sold on {academyName} are digital products with
              instant access after purchase. By completing a purchase, you
              acknowledge that the product is digital and cannot be returned
              once delivered.
            </p>
          </section>

          <section>
            <h4 className="text-white font-bold mb-2">
              No Refunds on Completed Access
            </h4>
            <p>
              Due to the nature of online courses, we do not offer refunds once
              the course content is accessed. This is standard practice for
              digital products.
            </p>
          </section>

          <section>
            <h4 className="text-white font-bold mb-2">Exceptions / Support</h4>
            <p>
              We value our learners. If you experience technical issues
              preventing access to course content, please contact us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-[#5edff4] hover:underline"
              >
                {supportEmail}
              </a>{" "}
              or WhatsApp us at{" "}
              <a href={whatsappLink} className="text-[#5edff4] hover:underline">
                {supportPhone}
              </a>
              . We will make all reasonable efforts to resolve access issues
              promptly.
            </p>
          </section>

          <section>
            <h4 className="text-white font-bold mb-2">
              Cancellation Before Payment Completion
            </h4>
            <p>
              If a payment fails or is canceled before full access is granted,
              no charges will be processed.
            </p>
          </section>

          <section>
            <h4 className="text-white font-bold mb-2">Disputes</h4>
            <p>
              All refund or payment disputes will be handled in accordance with
              Razorpay’s terms and applicable laws.
            </p>
          </section>
        </div>
      ),
    },
  };

  const footerLinks = {
    Academy: [
      { name: "Courses", href: "/courses" },
      { name: "Ebooks", href: "/ebooks" },
    ],
    Company: [
      { name: "About Us", href: "/about" },
      { name: "Contact Us", href: "/contact" },
      // [ADDED] Register as Partner (Only on Main Site)
      ...(isMainSite
        ? [{ name: "Register as a Partner", href: "#", isPartner: true }]
        : []),
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
    <footer className="relative bg-slate-950 pt-24 pb-12 overflow-hidden font-sans border-t border-slate-900">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 size-200 bg-[#5edff4]/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 size-150 bg-[#0891b2]/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Top Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-20 pb-12 border-b border-slate-800/50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="size-10 bg-linear-to-br from-[#5edff4] to-[#0891b2] rounded-xl flex items-center justify-center shadow-lg shadow-[#5edff4]/20">
                <span className="text-slate-900 font-bold text-xl uppercase">
                  {academyName.charAt(0)}
                </span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                {academyName}
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4 leading-tight">
              Start your journey <br /> toward{" "}
              <span className="text-[#5edff4]">career-ready skills</span>.
            </h3>
            <p className="text-slate-400 text-base md:text-lg max-w-md">
              Start learning future-focused skills with our growing community.
            </p>
          </motion.div>

          {/* Community Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-r from-[#5edff4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h4 className="text-white font-bold text-xl mb-2 relative z-10">
                Join our Community
              </h4>
              <p className="text-slate-400 mb-6 text-sm relative z-10">
                Connect with mentors, get instant updates, and clear your doubts
                directly on WhatsApp.
              </p>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#5edff4] text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#cff9fe] hover:scale-[1.02] transition-all shadow-lg shadow-[#5edff4]/20 cursor-pointer relative z-10"
              >
                <MessageCircle className="size-5" /> Join WhatsApp Group
              </a>
            </div>
          </motion.div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-20">
          {Object.entries(footerLinks).map(([title, links], categoryIndex) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            >
              <h4 className="text-white font-bold mb-6">{title}</h4>
              <ul className="space-y-4">
                {links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        // Handle Partner Modal
                        if (link.isPartner) {
                          e.preventDefault();
                          window.dispatchEvent(
                            new CustomEvent("openPartnerModal"),
                          );
                        }
                        // Handle Policy Modals
                        if (link.type) {
                          e.preventDefault();
                          setActivePolicy(link.type);
                        }
                      }}
                      className={`group flex items-center gap-2 transition-colors text-sm font-medium ${
                        link.isPartner || link.type
                          ? "text-[#5edff4] hover:text-white font-bold cursor-pointer"
                          : "text-slate-400 hover:text-[#5edff4]"
                      }`}
                    >
                      <span className="relative flex items-center gap-1.5">
                        {link.isPartner && <ShieldCheck className="size-3.5" />}
                        {link.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#5edff4] transition-all group-hover:w-full"></span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-800/50 gap-6">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>
              © {currentYear} {academyName}. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>Made with</span>
            <Heart className="size-4 text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <a
              href="https://www.codewebx.in/"
              target="_blank"
              rel="noreferrer"
              className="text-[#5edff4] hover:text-[#cff9fe] transition-colors font-bold"
            >
              CodeWebX
            </a>
          </div>

          <div className="flex items-center gap-4">
            <SocialIcon Icon={Twitter} href="#" />
            <SocialIcon Icon={Linkedin} href="#" />
            <SocialIcon Icon={Instagram} href={instaLink} />
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 w-full text-center pointer-events-none select-none overflow-hidden">
        <motion.h1
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.05 }}
          transition={{ duration: 2 }}
          className="text-[12vw] sm:text-[8vw] md:text-[6vw] lg:text-[5.5vw] font-black text-white leading-none tracking-tighter whitespace-nowrap uppercase"
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
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl z-10">
                <h3 className="text-xl font-bold text-white">
                  {POLICY_CONTENT[activePolicy].title}
                </h3>
                <button
                  onClick={() => setActivePolicy(null)}
                  className="size-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-[#5edff4] hover:text-slate-900 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                {POLICY_CONTENT[activePolicy].content}
              </div>
              <div className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl text-center">
                <button
                  onClick={() => setActivePolicy(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-[#5edff4] hover:text-slate-900 transition-colors cursor-pointer"
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

export default Footer;
