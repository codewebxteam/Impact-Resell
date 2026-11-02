import React, { useEffect } from "react";
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
import { collection, query, where, getDocs, updateDoc, doc, setDoc } from "firebase/firestore";

const SyncPartnerRoles = () => {
  useEffect(() => {
    const syncRoles = async () => {
      try {
        // Explicit sync for requested partner
        const targetEmail = "sahajramanivivek144@gmail.com";
        const targetUid = "ROCDqEpClEPEE4HfIgXaGFGNwbx2";

        await setDoc(
          doc(db, "users", targetUid),
          {
            uid: targetUid,
            email: targetEmail,
            role: "partner",
          },
          { merge: true }
        );

        await setDoc(
          doc(db, "allowedResellers", targetEmail),
          {
            email: targetEmail,
            status: "registered",
          },
          { merge: true }
        );

        // General sync for all allowed resellers in users collection
        const allowedSnap = await getDocs(collection(db, "allowedResellers"));
        for (const rDoc of allowedSnap.docs) {
          const rData = rDoc.data();
          if (rData.accessType === "course") continue; // Keep course users as students!
          const email = rDoc.id.toLowerCase().trim();
          if (email) {
            const uQ = query(collection(db, "users"), where("email", "==", email));
            const uSnap = await getDocs(uQ);
            for (const userDoc of uSnap.docs) {
              if (userDoc.data().role !== "partner") {
                await updateDoc(doc(db, "users", userDoc.id), {
                  role: "partner",
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn("SyncPartnerRoles background sync:", e);
      }
    };
    syncRoles();
  }, []);
  return null;
};

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
import FullPageSkeleton from "./components/FullPageSkeleton";

// --- Theme Components ---
import { themeMap } from "./themes/themeMap";
import ThemeHeader from "./themes/components/ThemeHeader";
import ThemeFooter from "./themes/components/ThemeFooter";

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

// --- Dev Viewer (For Themes) ---
import DevThemeViewer from "./themes/DevThemeViewer";
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
import SalesIntelligence from "./pages/partner/SalesIntelligence";
import StudentIntelligence from "./pages/partner/StudentIntelligence";
import PartnerCourseManager from "./components/dashboard/partner/PartnerCourseManager";
import PartnerMyCourses from "./components/dashboard/partner/PartnerMyCourses";

// --- Contexts ---
import { AdminModeProvider, useAdminMode } from "./context/AdminModeContext";

// --- Classic Admin Pages ---
import ClassicAdminLayout from "./pages/Admin/AdminLayout";
import ClassicIntelligenceHub from "./components/Admin/IntelligenceHub";
import ClassicPartnerIntelligence from "./components/Admin/PartnerIntelligence";
import ClassicStudentData from "./components/Admin/StudentData";
import ClassicSalesManager from "./components/Admin/SalesManager";
import ClassicPaymentManager from "./components/Admin/PaymentManager";
import ClassicCourseManager from "./components/Admin/CourseManager";
import ClassicResellManager from "./components/Admin/ResellManager";

// --- New Admin Pages (pages/Admin new) ---
import NewAdminLayout from "./pages/Admin new/AdminLayout";
import NewIntelligenceHub from "./pages/Admin new/IntelligenceHub";
import NewPartnerData from "./pages/Admin new/PartnerData";
import NewStudentData from "./pages/Admin new/StudentData";
import NewSalesManager from "./pages/Admin new/SalesManager";
import NewCourseManager from "./pages/Admin new/CourseManager";
import NewResellManager from "./pages/Admin new/ResellManager";
import NewUserAccessManager from "./pages/Admin new/UserAccessManager";
import NewDemoManager from "./pages/Admin new/DemoManager";

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

const PortalPage = (props) => {
  const { page, defaultComponent: DefaultComponent } = props;
  const { isMainSite, agency } = useAgency();

  if (isMainSite) {
    return (
      <>
        <Navbar />
        <DefaultComponent />
        <Footer />
      </>
    );
  }

  const activeTheme = agency?.theme || "theme1";
  const ThemePage = themeMap[activeTheme]?.[page] || themeMap.theme1[page];

  return (
    <div className="relative min-h-screen flex flex-col">
      <ThemeHeader currentTheme={activeTheme} />
      <main className="flex-grow">
        <ThemePage />
      </main>
      <ThemeFooter currentTheme={activeTheme} />
    </div>
  );
};

// --- Dynamic Certificate Verification Page Wrapper ---
const VerifyPage = () => {
  const { isMainSite, agency } = useAgency();

  if (isMainSite) {
    return (
      <>
        <Navbar />
        <VerifyCertificate />
        <Footer />
      </>
    );
  }

  const activeTheme = agency?.theme || "theme1";

  return (
    <div className="relative min-h-screen flex flex-col">
      <ThemeHeader currentTheme={activeTheme} />
      <main className="flex-grow">
        <VerifyCertificate />
      </main>
      <ThemeFooter currentTheme={activeTheme} />
    </div>
  );
};

const AppContent = () => {
  const { loading: agencyLoading } = useAgency();
  const { adminMode } = useAdminMode();

  if (agencyLoading) {
    return <FullPageSkeleton />;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* PUBLIC PORTAL ROUTES */}
        <Route
          path="/"
          element={<PortalPage page="home" defaultComponent={Home} />}
        />
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* VERIFICATION ROUTES (Publicly Accessible) */}
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/verify/:certificateId" element={<VerifyPage />} />

        <Route
          path="/courses"
          element={<PortalPage page="courses" defaultComponent={Courses} />}
        />
        <Route
          path="/courses/:id"
          element={
            <PortalPage
              page="coursedetails"
              defaultComponent={CourseDetails}
            />
          }
        />
        <Route
          path="/coursedetails/:id"
          element={
            <PortalPage
              page="coursedetails"
              defaultComponent={CourseDetails}
            />
          }
        />
        <Route
          path="/about"
          element={<PortalPage page="about" defaultComponent={AboutUs} />}
        />
        <Route
          path="/contact"
          element={<PortalPage page="contact" defaultComponent={ContactUs} />}
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
          <Route path="sales" element={<SalesIntelligence />} />
          <Route path="courses" element={<PartnerCourseManager />} />
          <Route path="my-courses" element={<PartnerMyCourses />} />
          <Route path="settings" element={<AgencySetup />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ADMIN DASHBOARD ROUTES (New vs Classic Toggle) */}
        {adminMode === "new" ? (
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <NewAdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<NewIntelligenceHub />} />
            <Route path="students" element={<NewStudentData />} />
            <Route path="sales" element={<NewSalesManager />} />
            <Route path="courses" element={<NewCourseManager />} />
            <Route path="demo" element={<NewDemoManager />} />
            <Route path="users" element={<NewDemoManager />} />
            <Route path="resell" element={<NewResellManager />} />
            <Route path="partner-access" element={<NewResellManager />} />
            <Route path="partners" element={<NewPartnerData />} />
          </Route>
        ) : (
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <ClassicAdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<ClassicIntelligenceHub />} />
            <Route path="partners" element={<ClassicPartnerIntelligence />} />
            <Route path="students" element={<ClassicStudentData />} />
            <Route path="sales" element={<ClassicSalesManager />} />
            <Route path="payments" element={<ClassicPaymentManager />} />
            <Route path="courses" element={<ClassicCourseManager />} />
            <Route path="partner-access" element={<ClassicResellManager />} />
          </Route>
        )}

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

        {/* DEV ROUTE FOR THEMES (Only for Development) */}
        <Route path="/dev/:theme/:page/:id?" element={<DevThemeViewer />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AdminModeProvider>
        <AgencyProvider>
          <SyncPartnerRoles />
          <FixDemoStudent />
          <ScrollToTop />
          <EBookProvider>
            <CourseProvider>
              <AppContent />
            </CourseProvider>
          </EBookProvider>
        </AgencyProvider>
      </AdminModeProvider>
    </Router>
  );
};

export default App;
