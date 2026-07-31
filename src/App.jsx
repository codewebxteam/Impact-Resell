import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useAgency, AgencyProvider } from "./context/AgencyContext";
import { EBookProvider } from "./context/EBookContext";
import { CourseProvider } from "./context/CourseContext";
import { db } from "./firebase/config";

// --- Dev Helpers ---
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

const FixDemoStudent = () => {
  useEffect(() => {
    const fixDemo = async () => {
      try {
        // 1. Find a real partner
        const pQ = query(collection(db, "users"), where("role", "==", "partner"));
        const pSnap = await getDocs(pQ);
        if (pSnap.empty) {
          console.log("FIX_DEMO: No partners found in DB to link to.");
          return;
        }
        const partnerId = pSnap.docs[0].id; // first partner found

        // 2. Find ALL demo student documents
        const q = query(collection(db, "users"), where("email", "==", "demostudent1@gmail.com"));
        const snap = await getDocs(q);
        
        let updatedCount = 0;
        for (const studentDoc of snap.docs) {
          const currentPartnerId = studentDoc.data().partnerId;
          if (currentPartnerId === "direct" || !currentPartnerId) {
            await updateDoc(doc(db, "users", studentDoc.id), {
              partnerId: partnerId
            });
            updatedCount++;
          }
        }
        
        if (updatedCount > 0) {
          console.log(`✅ FIX_DEMO: Successfully updated ${updatedCount} documents for demostudent1@gmail.com to partner ${partnerId}`);
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (e) {
        console.error("FIX_DEMO ERROR:", e);
      }
    };
    fixDemo();
  }, []);
  return null;
};

// --- Components ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// --- Public Pages ---
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import EBooks from "./pages/EBooks";
import EBookDetails from "./pages/EBookDetails";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import VerifyCertificate from "./pages/VerifyCertificate";

// --- Dashboard (Student) ---
import DashboardLayout from "./components/dashboard/DashboardLayout";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import MyCourses from "./pages/dashboard/MyCourses";
import EBookLibrary from "./pages/dashboard/EBookLibrary";
import ExploreCourses from "./pages/dashboard/ExploreCourses";
import Certificates from "./pages/dashboard/Certificates";
import Profile from "./pages/dashboard/Profile";

// --- Partner Pages ---
import PartnerLayout from "./pages/partner/PartnerLayout";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import Financials from "./pages/partner/Financials";
import AgencySetup from "./pages/partner/AgencySetup";
import CouponIntelligence from "./pages/partner/CouponIntelligence";
import SalesIntelligence from "./pages/partner/SalesIntelligence";
import StudentIntelligence from "./pages/partner/StudentIntelligence";
import PartnerCourseManager from "./components/dashboard/partner/PartnerCourseManager";
import PartnerMyCourses from "./components/dashboard/partner/PartnerMyCourses";

// --- Admin Pages ---
import AdminLayout from "./pages/Admin/AdminLayout";
import IntelligenceHub from "./components/Admin/IntelligenceHub";
import PartnerIntelligence from "./components/Admin/PartnerIntelligence";
import StudentData from "./components/Admin/StudentData";
import SalesManager from "./components/Admin/SalesManager";
import PaymentManager from "./components/Admin/PaymentManager";
import CourseManager from "./components/Admin/CourseManager";
import EBookManager from "./components/Admin/EBookManager";
import ResellManager from "./components/Admin/ResellManager";

// --- Scroll To Top Helper ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return null;
  if (!currentUser) return <Navigate to="/" replace />;

  if (userData && userData.role === "partner") {
    return <Navigate to="/partner" replace />;
  }

  if (userData && userData.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// --- Partner Route Wrapper ---
const PartnerRoute = ({ children }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return null;
  if (!currentUser) return <Navigate to="/" replace />;

  if (userData && userData.role !== "partner") {
    if (userData && userData.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// --- Admin Route Wrapper ---
const AdminRoute = ({ children }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return null;
  if (!currentUser) return <Navigate to="/" replace />;

  if (userData && userData.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent = () => {
  const { loading: agencyLoading, isMainSite, agency } = useAgency();

  if (agencyLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5edff4]"></div>
          <p className="text-slate-400 font-bold animate-pulse">
            {!isMainSite ? "Loading Academy..." : "Initializing Academy..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />

        {/* VERIFICATION ROUTES (Publicly Accessible) */}
        <Route
          path="/verify"
          element={
            <>
              <Navbar />
              <VerifyCertificate />
              <Footer />
            </>
          }
        />
        <Route
          path="/verify/:certificateId"
          element={
            <>
              <Navbar />
              <VerifyCertificate />
              <Footer />
            </>
          }
        />

        <Route
          path="/courses"
          element={
            <>
              <Navbar />
              <Courses />
              <Footer />
            </>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <>
              <Navbar />
              <CourseDetails />
              <Footer />
            </>
          }
        />
        {/* <Route
          path="/ebooks"
          element={
            <>
              <Navbar />
              <EBooks />
              <Footer />
            </>
          }
        />
        <Route
          path="/ebooks/:id"
          element={
            <>
              <Navbar />
              <EBookDetails />
              <Footer />
            </>
          }
        /> */}
        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <AboutUs />
              <Footer />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <Navbar />
              <ContactUs />
              <Footer />
            </>
          }
        />

        {/* AGENCY SETUP */}
        <Route
          path="/agency-setup"
          element={
            <PartnerRoute>
              <Navbar />
              <AgencySetup />
              <Footer />
            </PartnerRoute>
          }
        />

        {/* PARTNER CONSOLE ROUTES */}
        <Route
          path="/partner"
          element={
            <PartnerRoute>
              <PartnerLayout />
            </PartnerRoute>
          }
        >
          <Route index element={<PartnerDashboard />} />
          <Route path="financials" element={<Financials />} />
          <Route path="students" element={<StudentIntelligence />} />
          <Route path="coupons" element={<CouponIntelligence />} />
          <Route path="sales" element={<SalesIntelligence />} />
          <Route path="courses" element={<PartnerCourseManager />} />
          <Route path="my-courses" element={<PartnerMyCourses />} />
          <Route path="settings" element={<AgencySetup />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ADMIN DASHBOARD ROUTES */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<IntelligenceHub />} />
          <Route path="partners" element={<PartnerIntelligence />} />
          <Route path="students" element={<StudentData />} />
          <Route path="sales" element={<SalesManager />} />
          <Route path="payments" element={<PaymentManager />} />
          <Route path="courses" element={<CourseManager />} />
          {/* <Route path="ebooks" element={<EBookManager />} /> */}
          <Route path="partner-access" element={<ResellManager/>}/>
        </Route>

        {/* STUDENT DASHBOARD ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="my-courses" element={<MyCourses />} />
          {/* <Route path="ebooks" element={<EBookLibrary />} /> */}
          <Route path="explore" element={<ExploreCourses />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AgencyProvider>
        <FixDemoStudent />
        <ScrollToTop />
        <EBookProvider>
          <CourseProvider>
            <AppContent />
          </CourseProvider>
        </EBookProvider>
      </AgencyProvider>
    </Router>
  );
};

export default App;
