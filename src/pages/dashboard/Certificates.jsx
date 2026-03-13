import React, { useState, useEffect } from "react";
import {
  Award,
  Download,
  Lock,
  PlayCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCourse } from "../../context/CourseContext";
import { useAgency } from "../../context/AgencyContext"; // [ADDED] Agency Context
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import jsPDF from "jspdf";

// Ensure 'impact-logo.png' exists in 'src/assets/' folder
import impactLogo from "../../assets/impact-logo.png";

const Certificates = () => {
  const { enrolledCourses } = useCourse();

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          My Certificates
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Track your progress and download official credentials.
        </p>
      </div>

      <div className="grid gap-8">
        {enrolledCourses && enrolledCourses.length > 0 ? (
          enrolledCourses.map((course) => (
            <CertificateItem
              key={course.courseId || course.id}
              courseData={course}
            />
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="bg-slate-50 size-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Enrollments Found
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Enroll in a course to start your journey towards certification.
            </p>
            <Link
              to="/dashboard/explore"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#5edff4] text-slate-900 rounded-xl font-bold hover:bg-[#4ecee4] hover:scale-105 transition-all shadow-lg shadow-[#5edff4]/20"
            >
              Start Learning <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SMART COMPONENT ---
const CertificateItem = ({ courseData }) => {
  const { currentUser } = useAuth();
  const { agency, isMainSite } = useAgency(); // [ADDED] Hook for Agency Data
  const [certDetails, setCertDetails] = useState(null);

  const courseId = courseData.courseId || courseData.id;
  const title = courseData.title || "Untitled Course";

  // [LOGIC] Dynamic Issuer Name & Link
  const issuerName =
    !isMainSite && agency ? agency.name : "Impact School Of AI";
  const verificationLink = `${window.location.origin}/verify`; // Current Domain Link

  // Progress Logic (Rounded)
  const rawProgress = courseData.progress || 0;
  const progress = Math.round(rawProgress);
  const isEligible = progress >= 100;

  useEffect(() => {
    if (currentUser) {
      checkAndGenerateCertificate();
    }
  }, [courseId, isEligible, currentUser]);

  const checkAndGenerateCertificate = async () => {
    try {
      if (!currentUser) return;

      // Document ID: UserID_CourseID
      const fixedDocId = `${currentUser.uid}_${courseId}`;
      const docRef = doc(db, "certificates", fixedDocId);

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCertDetails(docSnap.data());
      } else if (isEligible) {
        await generateNewCertificate(fixedDocId);
      }
    } catch (error) {
      console.error("Cert Error:", error);
    }
  };

  const generateNewCertificate = async (fixedDocId) => {
    try {
      const studentName =
        currentUser.displayName || currentUser.email.split("@")[0];

      // [UPDATED] Unique ID with Agency Prefix
      // Example: IMP-REA-123456 or COD-REA-123456 (if Agency is CodeWebX)
      const prefix = issuerName
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, "A");
      const uniqueCertId = `${prefix}-${courseId.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const issueDate = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const newCertData = {
        certificateId: uniqueCertId,
        studentName: studentName,
        courseTitle: title,
        userId: currentUser.uid,
        courseId: courseId,
        issueDate: issueDate,
        issuedBy: issuerName, // [UPDATED] Dynamic Agency Name
        createdAt: serverTimestamp(),
        status: "Verified",
      };

      setCertDetails(newCertData);

      await setDoc(doc(db, "certificates", fixedDocId), newCertData, {
        merge: true,
      });
    } catch (err) {
      console.error("Save Failed:", err);
    }
  };

  const displayData = {
    courseTitle: title,
    studentName:
      certDetails?.studentName || currentUser?.displayName || "Student",
    issueDate: certDetails?.issueDate || new Date().toLocaleDateString("en-GB"),
    certificateId: certDetails?.certificateId || "Generating ID...",
    progress: progress,
  };

  const isUnlocked = isEligible;
  const [downloading, setDownloading] = useState(false);

  // --- PDF GENERATOR (UPDATED FOR DYNAMIC DATA) ---
  const generatePDF = () => {
    setDownloading(true);
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const centerX = width / 2;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = impactLogo;

    img.onload = () => {
      // 1. CLEAN WHITE BACKGROUND
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, width, height, "F");

      // 2. ORNAMENTAL BORDER
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(1.5);
      doc.rect(10, 10, width - 20, height - 20);
      doc.setDrawColor(94, 223, 244);
      doc.setLineWidth(0.8);
      doc.rect(13, 13, width - 26, height - 26);

      // Corner Decorations
      doc.setFillColor(15, 23, 42);
      const cS = 15;
      doc.triangle(10, 10, 10 + cS, 10, 10, 10 + cS, "F");
      doc.triangle(
        width - 10,
        10,
        width - (10 + cS),
        10,
        width - 10,
        10 + cS,
        "F",
      );
      doc.triangle(
        10,
        height - 10,
        10 + cS,
        height - 10,
        10,
        height - (10 + cS),
        "F",
      );
      doc.triangle(
        width - 10,
        height - 10,
        width - (10 + cS),
        height - 10,
        width - 10,
        height - (10 + cS),
        "F",
      );

      const logoSize = 30;
      doc.addImage(
        img,
        "PNG",
        centerX - logoSize / 2,
        20,
        logoSize,
        logoSize,
        undefined,
        "FAST",
      );

      doc.setTextColor(15, 23, 42);
      doc.setFont("times", "bold");
      doc.setFontSize(40);
      doc.text("CERTIFICATE", centerX, 65, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(94, 223, 244);
      doc.text("OF EXCELLENCE", centerX, 71, { align: "center", charSpace: 4 });

      doc.setTextColor(100, 110, 120);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("This certificate is proudly presented to", centerX, 90, {
        align: "center",
      });

      doc.setTextColor(15, 23, 42);
      doc.setFont("times", "bolditalic");
      doc.setFontSize(45);
      doc.text(displayData.studentName, centerX, 110, { align: "center" });
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(centerX - 70, 113, centerX + 70, 113);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(8, 145, 178);
      doc.text(displayData.courseTitle, centerX, 128, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      // [UPDATED] Dynamic Organization Name in Body Text
      const longText = `This certifies that the recipient has demonstrated exceptional dedication and has successfully mastered the comprehensive curriculum of the above-mentioned course. This achievement reflects a deep understanding of the subject matter and a commitment to excellence in the field of Artificial Intelligence and Technology, as verified by the standards of ${issuerName}.`;
      const splitText = doc.splitTextToSize(longText, width - 60);
      doc.text(splitText, centerX, 142, {
        align: "center",
        lineHeightFactor: 1.5,
      });

      const lineY = 175;
      const leftCenterX = 60;
      const rightCenterX = width - 60;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(displayData.issueDate, leftCenterX, lineY - 3, {
        align: "center",
      });
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.5);
      doc.line(leftCenterX - 30, lineY, leftCenterX + 30, lineY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("DATE ISSUED", leftCenterX, lineY + 6, { align: "center" });

      doc.setFont("times", "bolditalic");
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      // [UPDATED] Dynamic Signature Name
      doc.text(issuerName, rightCenterX, lineY - 3, {
        align: "center",
      });
      doc.setLineWidth(0.5);
      doc.line(rightCenterX - 30, lineY, rightCenterX + 30, lineY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("AUTHORIZED SIGNATORY", rightCenterX, lineY + 6, {
        align: "center",
      });

      doc.setFillColor(248, 250, 252);
      doc.rect(10, height - 18, width - 20, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`CERTIFICATE ID: ${displayData.certificateId}`, 15, height - 13);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      // [UPDATED] Dynamic Verification Link
      doc.text(
        `Verify authenticity at: ${verificationLink}`,
        width - 15,
        height - 13,
        { align: "right" },
      );

      doc.save(
        `Certificate_${displayData.studentName.replace(/\s/g, "_")}.pdf`,
      );
      setDownloading(false);
    };

    img.onerror = () => {
      alert("Logo Error! Please check src/assets/impact-logo.png");
      setDownloading(false);
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-3xl p-1 shadow-sm transition-all group ${
        isUnlocked
          ? "bg-gradient-to-br from-slate-200 to-white"
          : "bg-slate-100 opacity-90"
      }`}
    >
      <div
        className={`rounded-[22px] p-6 h-full flex flex-col md:flex-row items-center gap-8 ${isUnlocked ? "bg-white" : "bg-slate-50"}`}
      >
        <div className="w-full md:w-56 aspect-[4/3] rounded-2xl flex items-center justify-center border border-slate-100 relative overflow-hidden shrink-0 shadow-inner bg-slate-50">
          {isUnlocked ? (
            <div className="flex flex-col items-center gap-3">
              <div className="size-16 rounded-full bg-[#5edff4]/10 flex items-center justify-center mb-1">
                <img
                  src={impactLogo}
                  alt="Logo"
                  className="size-10 object-contain opacity-90"
                />
              </div>
              <div className="text-center">
                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg shadow-slate-900/20">
                  Official
                </span>
              </div>
            </div>
          ) : (
            <Lock className="size-10 text-slate-300" />
          )}
        </div>

        <div className="flex-1 text-center md:text-left w-full">
          <div className="mb-4 flex justify-center md:justify-start">
            {isUnlocked ? (
              <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-wider border border-emerald-100 flex items-center gap-1.5">
                <CheckCircle2
                  size={14}
                  className="fill-emerald-600 text-white"
                />{" "}
                Verified & Earned
              </span>
            ) : (
              <span className="px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-black uppercase tracking-wider border border-amber-100">
                In Progress
              </span>
            )}
          </div>

          <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">
            {displayData.courseTitle}
          </h3>
          <p className="text-sm text-slate-500 mb-8 font-medium">
            Issued to{" "}
            <span className="text-slate-900 font-bold">
              {displayData.studentName}
            </span>
          </p>

          {isUnlocked ? (
            <div className="flex flex-col sm:flex-row gap-5 items-center md:items-start mt-auto border-t border-slate-100 pt-6">
              <button
                onClick={generatePDF}
                disabled={downloading}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-[#5edff4] hover:text-slate-900 transition-all shadow-xl hover:shadow-[#5edff4]/20 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 group-hover:scale-105"
              >
                {downloading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                {downloading ? "Generating..." : "Download Certificate"}
              </button>

              <div className="text-center sm:text-left w-full sm:w-auto mt-4 sm:mt-0">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Credential ID
                </p>
                <p className="font-mono text-xs text-slate-600 font-bold tracking-wide break-all">
                  {displayData.certificateId}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Course Progress</span>
                <span>{displayData.progress}%</span>
              </div>

              <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-6 border border-slate-200 relative">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes-light.png')]" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${displayData.progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-slate-700 to-slate-900 rounded-full relative"
                >
                  <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 opacity-50" />
                </motion.div>
              </div>

              <Link
                to="/dashboard/my-courses"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0891b2] hover:text-slate-900 transition-colors"
              >
                <PlayCircle size={16} /> Resume Learning to Unlock
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Certificates;
