/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Award,
  Video,
  Users,
  Infinity,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Target,
  Lightbulb,
  Heart
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAgency } from "../../context/AgencyContext";

const AboutUs = () => {
  const { agency, isMainSite } = useAgency();
  const location = useLocation();

  const isDev = location.pathname.startsWith("/dev/");
  const currentTheme = isDev ? location.pathname.split("/")[2] : "theme5";
  const getRoute = (path) => (isDev ? `/dev/${currentTheme}${path}` : path);

  const brandName = !isMainSite && agency?.name ? agency.name : (agency?.name || "AIFlix");

  return (
    <div className="min-h-screen bg-[#faf9fe] font-sans pb-24 pt-24 sm:pt-28 text-slate-800">
      
      {/* Hero Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-16">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-indigo-50 shadow-sm text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-black uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              <span>About {brandName}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Empowering The Next Generation of{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                AI Video Creators
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              We bridge the gap between complex artificial intelligence tools and practical, monetizable content creation for creators, students, and businesses worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision Cards */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Mission */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-purple-200 transition-all">
            <div className="size-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <Target className="size-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Our Mission</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              To demystify artificial intelligence video generation and give creators actionable step-by-step masterclasses, prompt blueprints, and direct mentorship so anyone can create studio-quality animations.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-pink-200 transition-all">
            <div className="size-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-6">
              <Lightbulb className="size-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Our Vision</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              A future where technical video production barriers disappear, allowing pure imagination to turn into cinematic shorts, viral ads, and full animated masterworks with a few keystrokes.
            </p>
          </div>

        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Our Core Principles
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-2">
            Built by active creators who test every AI model and workflow daily.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center flex flex-col items-center">
            <div className="size-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <Video className="size-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2">100% Practical</h4>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              No boring theory. Every lesson builds a real project—from prompt formulation to 4K resolution upscaling.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center flex flex-col items-center">
            <div className="size-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
              <Award className="size-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2">Verifiable Credential</h4>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Every graduate receives an authenticated digital completion certificate with instant QR code online verification.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center flex flex-col items-center">
            <div className="size-16 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-5">
              <Users className="size-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2">Continuous Updates</h4>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              AI evolves every month. Whenever new tools like Runway, Midjourney, or Sora launch, new modules are added free.
            </p>
          </div>

        </div>
      </div>

      {/* CTA Box */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black">
              Start Your AI Video Creation Journey Today
            </h3>
            <p className="text-xs sm:text-sm text-purple-100 font-medium">
              Join thousands of creators turning ideas into viral videos with lifetime course access.
            </p>
          </div>

          <Link
            to={getRoute("/courses")}
            className="px-8 py-3.5 rounded-2xl bg-white text-purple-700 font-black text-sm hover:bg-purple-50 shadow-lg transition-colors shrink-0"
          >
            Browse Masterclasses →
          </Link>
        </div>
      </div>

    </div>
  );
};

export default AboutUs;
