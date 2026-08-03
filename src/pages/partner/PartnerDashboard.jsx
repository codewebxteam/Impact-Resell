import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  TrendingUp,
  ChevronDown,
  Plus,
  X,
  DollarSign,
  Briefcase,
  FileText,
  GraduationCap,
  BookOpen, // [ADDED] Icon for Courses
} from "lucide-react";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
  orderBy,
  updateDoc,
  arrayUnion,
  doc,
  setDoc, // [CRITICAL ADDITION]
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const partnerId = currentUser?.uid;

  // --- STATES ---
  const [orders, setOrders] = useState([]);
  const [courses, setCourses] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [registeredStudentEmails, setRegisteredStudentEmails] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [graphData, setGraphData] = useState([]);

  // Enroll Form State
  const [enrollData, setEnrollData] = useState({
    productType: "Course",
    studentEmail: "",
    selectedProductId: "",
    sellingPrice: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchInitialData();
  }, [partnerId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const coursesSnap = await getDocs(collection(db, "courseVideos"));
      let coursesList = coursesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "Course",
      }));
      if (partnerId) {
        coursesList = coursesList.filter(
          (c) => !c.partnerId || c.partnerId === "admin" || c.partnerId === partnerId
        );
      }
      setCourses(coursesList);

      // 2. Fetch E-Books
      const ebooksSnap = await getDocs(collection(db, "ebooks"));
      const ebooksList = ebooksSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "E-Book",
      }));
      setEbooks(ebooksList);

      // 3. Fetch Orders
      if (partnerId) {
        const q = query(
          collection(db, "orders"),
          where("partnerId", "==", partnerId),
          orderBy("createdAt", "desc")
        );
        const ordersSnap = await getDocs(q);
        const ordersList = ordersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAtDate: doc.data().createdAt?.toDate
            ? doc.data().createdAt.toDate()
            : new Date(),
        }));
        setOrders(ordersList);
        processGraphData(ordersList);

        // 4. Fetch Registered Students under this Partner
        const usersQ = query(
          collection(db, "users"),
          where("partnerId", "==", partnerId)
        );
        const usersSnap = await getDocs(usersQ);
        const studentEmails = new Set();
        usersSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (data.role === "student" && data.email) {
            studentEmails.add(data.email);
          }
        });
        setRegisteredStudentEmails(studentEmails);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- REAL-TIME GRAPH LOGIC ---
  const processGraphData = (data) => {
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        return d;
      })
      .reverse();

    const chartData = last7Days.map((date) => {
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const dayOrders = data.filter((o) => {
        const orderDate = new Date(o.createdAtDate);
        return orderDate.toDateString() === date.toDateString();
      });
      const revenue = dayOrders.reduce(
        (sum, o) => sum + Number(o.sellingPrice || 0),
        0
      );
      const profit = dayOrders.reduce(
        (sum, o) => sum + Number(o.profit || 0),
        0
      );
      return { name: dayName, revenue, profit };
    });

    setGraphData(chartData);
  };

  // --- CALCULATE METRICS (Fixed Count Logic) ---
  const metrics = useMemo(() => {
    // Combine student emails from both orders and registered users
    const allStudentEmails = new Set(orders.map((o) => o.studentEmail).filter(Boolean));
    registeredStudentEmails.forEach(email => allStudentEmails.add(email));
    let totalStudents = allStudentEmails.size;
    let totalRevenue = 0;
    let totalCost = 0;

    let ebookCount = 0;
    let courseCount = 0;

    orders.forEach((order) => {
      totalRevenue += Number(order.sellingPrice || 0);
      totalCost += Number(order.adminPrice || 0);

      const pType = (order.productType || "").toLowerCase();
      if (pType.includes("book")) {
        ebookCount += 1;
      } else {
        courseCount += 1;
      }
    });

    return {
      students: totalStudents,
      revenue: totalRevenue,
      profit: totalRevenue - totalCost,
      ebooksSold: ebookCount,
      coursesSold: courseCount,
    };
  }, [orders, registeredStudentEmails]);

  // --- [FIXED] HANDLE ENROLLMENT WITH FULL OBJECT LOGIC ---
  const handleEnrollSubmit = async () => {
    if (
      !enrollData.studentEmail ||
      !enrollData.selectedProductId ||
      !enrollData.sellingPrice
    ) {
      alert("⚠️ Please fill all fields properly.");
      return;
    }

    let selectedProduct;
    if (enrollData.productType === "Course" && enrollData.selectedProductId === "bundle") {
      selectedProduct = {
        id: "bundle",
        title: "All Courses Bundle Access",
        price: 0,
        image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80",
        instructor: "Partner Access",
        duration: "Lifetime",
        category: "Bundle",
        lectures: [],
      };
    } else {
      const productList = enrollData.productType === "Course" ? courses : ebooks;
      selectedProduct = productList.find(
        (p) => p.id === enrollData.selectedProductId
      );
    }

    if (!selectedProduct) {
      alert("⚠️ Product not found in database.");
      return;
    }

    setIsProcessing(true);
    try {
      console.log("🚀 Starting Enrollment...");

      // 1. Find Student
      const safeEmail = enrollData.studentEmail.trim();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", safeEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("❌ Student Not Found! Ask them to register first.");
        setIsProcessing(false);
        return;
      }

      const studentDoc = querySnapshot.docs[0];
      const studentId = studentDoc.id; // UID
      const studentData = studentDoc.data();
      const studentRef = doc(db, "users", studentId);

      console.log(`✅ Student Found: ${studentId}`);

      const adminPrice = Number(
        selectedProduct.price || selectedProduct.discountPrice || 0
      );
      const sellingPrice = Number(enrollData.sellingPrice);

      // =========================================================
      // STEP A: GRANT ACCESS (MIMIC COURSE CONTEXT)
      // =========================================================

      if (enrollData.productType === "Course") {
        // [CRITICAL FIX] Create FULL Course Object like Context
        let safeLectures = [];
        if (
          selectedProduct.lectures &&
          Array.isArray(selectedProduct.lectures)
        ) {
          safeLectures = selectedProduct.lectures;
        } else if (selectedProduct.videoId) {
          safeLectures = [
            {
              id: Date.now(),
              videoId: selectedProduct.videoId,
              title: selectedProduct.title,
              url: selectedProduct.url || "",
            },
          ];
        }

        const newCourseObject = {
          courseId: String(selectedProduct.id),
          title: String(selectedProduct.title || "Untitled Course"),
          image: String(
            selectedProduct.image || selectedProduct.thumbnail || ""
          ),
          instructor: String(selectedProduct.instructor || "Unknown"),
          progress: 0,
          status: "in-progress",
          enrolledAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          videoProgress: 0,
          totalDuration: String(selectedProduct.duration || "Self Paced"),
          watchedDuration: 0,
          price: String(sellingPrice),
          originalPrice: String(selectedProduct.price || "Free"),
          category: String(selectedProduct.category || "General"),
          lectures: safeLectures, // Array!
          rating: Number(selectedProduct.rating || 0),
          level: String(selectedProduct.level || "Beginner"),
          videoUrl: String(selectedProduct.videoUrl || ""),
          youtubeId: String(
            selectedProduct.youtubeId || selectedProduct.videoId || ""
          ),
        };

        // Write to 'enrolledCourses' Collection (This is what Main Site uses!)
        const enrolledCoursesRef = doc(db, "enrolledCourses", studentId);
        await setDoc(
          enrolledCoursesRef,
          {
            courses: arrayUnion(newCourseObject),
          },
          { merge: true }
        );

        console.log("✅ Written Full Object to enrolledCourses Collection");
      } else {
        // Handle E-Books (Simple Array in Users)
        await updateDoc(studentRef, {
          purchasedBooks: arrayUnion(String(selectedProduct.id)),
        });
        console.log("✅ Updated E-Book Access in User Profile");
      }

      // =========================================================
      // STEP B: WRITE TO 'enrollments' (For Record)
      // =========================================================
      const enrollmentPayload = {
        courseId: String(selectedProduct.id),
        courseName: selectedProduct.title,
        studentId: studentId,
        price: sellingPrice,
        source: "partner",
        createdAt: serverTimestamp(),
        type: enrollData.productType,
      };
      await addDoc(collection(db, "enrollments"), enrollmentPayload);
      console.log("✅ Written to enrollments collection");

      // =========================================================
      // STEP C: CREATE 'orders' RECORD (For Dashboard)
      // =========================================================
      const orderPayload = {
        partnerId: partnerId,
        partnerName: currentUser?.displayName || "Partner",
        studentEmail: safeEmail,
        studentName: studentData.displayName || safeEmail.split("@")[0],
        courseId: String(selectedProduct.id),
        courseTitle: selectedProduct.title,
        productType: enrollData.productType, 
        adminPrice: 0, // Admin cut is 0
        sellingPrice: sellingPrice,
        profit: sellingPrice, // 100% Profit
        status: "Success",
        createdAt: serverTimestamp(),
        type: "Enrollment",
      };

      await addDoc(collection(db, "orders"), orderPayload);
      console.log("✅ Order History Created");

      // 6. Success
      setShowEnrollModal(false);
      setEnrollData({
        productType: "Course",
        studentEmail: "",
        selectedProductId: "",
        sellingPrice: "",
      });
      fetchInitialData();

      alert(`🎉 Success! Access Granted to: ${safeEmail}`);
    } catch (error) {
      console.error("Enrollment Error:", error);
      alert(`❌ Failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getSelectedProductDetails = () => {
    const list = enrollData.productType === "Course" ? courses : ebooks;
    return list.find((p) => p.id === enrollData.selectedProductId);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Partner Command Center
          </h2>
          <p className="text-sm text-slate-400 font-medium italic">
            Manage Enrollments & Track Profit
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-xl"
          >
            <Plus size={16} /> New Enroll
          </button>
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1: Students */}
        <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="size-12 bg-blue-50 text-blue-600 rounded-2xl mb-4 flex items-center justify-center">
            <Users size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Total Students
          </p>
          <h3 className="text-3xl font-black text-slate-900">
            {metrics.students}
          </h3>
        </div>

        {/* KPI 2: Courses & E-Books (UPDATED) */}
        <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="size-12 bg-orange-50 text-orange-600 rounded-2xl mb-4 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Courses Sold
          </p>
          <div className="flex flex-col">
            <h3 className="text-3xl font-black text-slate-900 leading-none">
              {metrics.coursesSold}
            </h3>
          </div>
        </div>

        {/* KPI 3: Revenue */}
        <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="size-12 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 flex items-center justify-center">
            <Briefcase size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Total Revenue
          </p>
          <h3 className="text-3xl font-black text-slate-900">
            ₹{metrics.revenue.toLocaleString()}
          </h3>
        </div>

        {/* KPI 4: Profit */}
        <div className="bg-slate-900 p-6 rounded-[30px] border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="size-12 bg-white/10 text-emerald-400 rounded-2xl mb-4 flex items-center justify-center backdrop-blur-sm">
            <DollarSign size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Net Profit
          </p>
          <h3 className="text-3xl font-black text-white">
            ₹{metrics.profit.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* --- CHART & TABLE GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">
              Performance Pulse
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData.length > 0 ? graphData : []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
                  }}
                  itemStyle={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Recent Enrollments
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar max-h-[300px]">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[24px] border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="size-10 rounded-2xl flex items-center justify-center font-black shadow-sm border border-slate-100 bg-white text-slate-900">
                    {order.studentName ? order.studentName[0] : "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {order.studentName}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 truncate flex items-center gap-1">
                      {order.courseTitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-600">
                      +₹{order.profit}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400">
                      Profit
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-300">
                <Users size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-[10px] font-bold uppercase">
                  No enrollments yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- ENROLLMENT MODAL --- */}
      <AnimatePresence>
        {showEnrollModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEnrollModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-slate-900 p-8 text-white relative shrink-0">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <GraduationCap size={100} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">
                  Fulfill Order
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Pay Admin & Grant Student Access
                </p>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                    Student Details (From WhatsApp)
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="email"
                      placeholder="Student Registered Email Address"
                      className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-indigo-100 focus:bg-white transition-all"
                      value={enrollData.studentEmail}
                      onChange={(e) =>
                        setEnrollData({
                          ...enrollData,
                          studentEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Product Requested
                    </p>
                  </div>

                  <div className="relative">
                    <select
                      className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-indigo-100 focus:bg-white transition-all appearance-none cursor-pointer"
                      value={enrollData.selectedProductId}
                      onChange={(e) =>
                        setEnrollData({
                          ...enrollData,
                          selectedProductId: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Course</option>
                      <option value="bundle" className="font-bold text-indigo-600">
                        🎁 Buy 1 Get All / Bundle Access
                      </option>
                      {courses.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                    Payment Collection
                  </p>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                      Sold Price (What Student Paid You)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-emerald-50/50 p-4 pl-10 rounded-2xl text-sm font-black outline-none border border-transparent focus:border-emerald-200 transition-all text-emerald-900"
                        value={enrollData.sellingPrice}
                        onChange={(e) =>
                          setEnrollData({
                            ...enrollData,
                            sellingPrice: e.target.value,
                          })
                        }
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 font-bold">
                        ₹
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleEnrollSubmit}
                  disabled={isProcessing}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing
                    ? "Granting Access..."
                    : "Grant Access"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerDashboard;
