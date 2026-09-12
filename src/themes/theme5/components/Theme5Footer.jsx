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
  Sparkles,
  Send,
  Play
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAgency } from "../../../context/AgencyContext";

const SocialIcon = ({ Icon, href, title }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noreferrer"
    title={title}
    whileHover={{ scale: 1.1, y: -2 }}
    whileTap={{ scale: 0.9 }}
    className="size-9 sm:size-10 rounded-xl bg-slate-100/80 hover:bg-white border border-slate-200/80 hover:border-indigo-300 shadow-2xs flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all duration-300 cursor-pointer"
  >
    <Icon className="size-4 sm:size-4.5" />
  </motion.a>
);

const Theme5Footer = ({ currentTheme = "theme5" }) => {
  const [activePolicy, setActivePolicy] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { agency, isMainSite } = useAgency();

  // Dynamic Agency Data (Synced with Subdomain & Partner config)
  const academyName = !isMainSite && agency?.name ? agency.name : (agency?.name || "AIFlix");
  const supportEmail = !isMainSite && agency?.email ? agency.email : "support@alifestable.com";
  const supportPhone = !isMainSite && agency?.whatsapp ? agency.whatsapp : "+91 74818 96182";
  const whatsappLink = `https://wa.me/${supportPhone.replace(/\D/g, "")}?text=${encodeURIComponent("Hello! I need some information regarding courses.")}`;
  const instaLink = !isMainSite && agency?.instagram ? agency.instagram : "https://www.instagram.com/";
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmailInput("");
      setSubscribed(false);
    }, 4000);
  };

  const POLICY_CONTENT = {
    privacy: {
      title: "Privacy Policy",
      content: (
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
          <section>
            <h4 className="text-slate-900 font-bold mb-1">Information Collection</h4>
            <p>
              We collect personal details such as your name, email address, contact number, and payment references strictly for educational enrollment and learner mentorship.
            </p>
          </section>

          <section>
            <h4 className="text-slate-900 font-bold mb-1">How We Use Information</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide instant access to high-definition AI video training tutorials.</li>
              <li>To send critical curriculum improvements, AI tool updates, and project assets.</li>
              <li>To issue verified and verifiable completion certificates.</li>
            </ul>
          </section>

          <section>
            <h4 className="text-slate-900 font-bold mb-1">Information Sharing & Protection</h4>
            <p>
              We never sell or rent your personal information to third-party advertisers. All transaction data is processed securely via industry-standard encrypted channels.
            </p>
          </section>

          <section>
            <h4 className="text-slate-900 font-bold mb-1">Contact & Data Requests</h4>
            <p>
              For inquiries regarding your student record, reach out to us at{" "}
              <a href={`mailto:${supportEmail}`} className="text-indigo-600 font-bold hover:underline">
                {supportEmail}
              </a>.
            </p>
          </section>
        </div>
      ),
    },
    refund: {
      title: "Refund Policy",
      content: (
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
          <section>
            <h4 className="text-slate-900 font-bold mb-1">Digital Course Delivery</h4>
            <p>
              Due to the immediate digital nature of video tutorials, prompt templates, and AI workflows, access is provided instantly upon successful enrollment.
            </p>
          </section>

          <section>
            <h4 className="text-slate-900 font-bold mb-1">Refund Eligibility</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Refund requests are considered within 24 hours of purchase if access technical issues cannot be resolved by support.</li>
              <li>Courses with over 20% progress or downloaded source assets are non-refundable.</li>
            </ul>
          </section>

          <section>
            <h4 className="text-slate-900 font-bold mb-1">Contact Support</h4>
            <p>
              Contact our help desk at{" "}
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">
                WhatsApp Support
              </a>{" "}
              with your order reference.
            </p>
          </section>
        </div>
      ),
    },
    terms: {
      title: "Terms & Conditions",
      content: (
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
          <section>
            <h4 className="text-slate-900 font-bold mb-1">License & Access</h4>
            <p>
              Enrollment grants single-user, non-transferable lifetime access to the purchased video courses and resources for personal educational use.
            </p>
          </section>

          <section>
            <h4 className="text-slate-900 font-bold mb-1">Intellectual Property</h4>
            <p>
              All video lessons, proprietary prompt blueprints, and project materials are protected copyright. Unauthorized distribution, screen recording, or reselling is strictly prohibited.
            </p>
          </section>

          <section>
            <h4 className="text-slate-900 font-bold mb-1">Platform Disclaimer</h4>
            <p>
              We provide practical training on contemporary third-party AI software. External tool pricing, API credits, and model updates are subject to their respective independent providers.
            </p>
          </section>
        </div>
      ),
    },
  };

  const getRoute = (path) => (currentTheme ? `/dev/${currentTheme}${path}` : path);

  return (
    <footer className="w-full bg-[#f8f9fd] border-t border-indigo-50/80 pt-16 pb-12 font-sans relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-0 left-1/4 size-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 size-96 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-slate-200/60">
          
          {/* Column 1: Brand & Socials (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to={getRoute("/home")} className="flex items-center gap-3 group inline-flex">
              <div className="size-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                  <div className="size-6 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white">
                    <Play className="size-3.5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {academyName}
                  </span>
                  <span className="inline-block size-2 rounded-full bg-pink-500" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase -mt-1">
                  Learn Today, Create Tomorrow
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              Helping creators, students, and professionals learn AI video creation and turn ideas into reality. Master prompt craft, avatars, and animations.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <SocialIcon Icon={Youtube} href="https://youtube.com" title="YouTube" />
              <SocialIcon Icon={Instagram} href={instaLink} title="Instagram" />
              <SocialIcon Icon={Facebook} href="https://facebook.com" title="Facebook" />
              <SocialIcon Icon={Twitter} href="https://twitter.com" title="X (Twitter)" />
              <SocialIcon Icon={Linkedin} href="https://linkedin.com" title="LinkedIn" />
            </div>
          </div>

          {/* Column 2: Quick Links (2.5 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-slate-600">
              <li>
                <Link to={getRoute("/home")} className="hover:text-indigo-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to={getRoute("/courses")} className="hover:text-indigo-600 transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link to={getRoute("/about")} className="hover:text-indigo-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-indigo-600 transition-colors">
                  Success Stories
                </a>
              </li>
              <li>
                <Link to={getRoute("/contact")} className="hover:text-indigo-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support & Policies (2.5 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-slate-600">
              <li>
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-indigo-600 transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy("terms")}
                  className="hover:text-indigo-600 transition-colors text-left cursor-pointer"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy("privacy")}
                  className="hover:text-indigo-600 transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy("refund")}
                  className="hover:text-indigo-600 transition-colors text-left cursor-pointer"
                >
                  Refund Policy
                </button>
              </li>
              <li>
                <Link to="/verify" className="text-indigo-600 font-bold hover:underline flex items-center gap-1.5 pt-1">
                  <FileCheck className="size-3.5" />
                  Verify Certificate
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter / Subscribe (3.5 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
              Subscribe to Updates
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get the latest courses, tips, prompts, and AI video creation tools straight to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex items-center rounded-xl bg-white border border-slate-200/90 p-1.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-2xs">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 bg-transparent outline-none"
                  required
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="size-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-sm transition-colors cursor-pointer"
                >
                  <Send className="size-3.5" />
                </button>
              </div>

              {subscribed && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-bold text-emerald-600 flex items-center gap-1"
                >
                  <Sparkles className="size-3" /> Thank you for subscribing!
                </motion.p>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Watermark */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400">
          <p>© {currentYear} {academyName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Create Today. Inspire Tomorrow.</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-slate-500 font-bold">Powered by {academyName}</span>
          </div>
        </div>

      </div>

      {/* Policy Modal */}
      <AnimatePresence>
        {activePolicy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl relative border border-slate-100"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900">
                  {POLICY_CONTENT[activePolicy]?.title}
                </h3>
                <button
                  onClick={() => setActivePolicy(null)}
                  className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-2">
                {POLICY_CONTENT[activePolicy]?.content}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActivePolicy(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-indigo-600 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Theme5Footer;
