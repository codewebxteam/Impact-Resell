import { db } from "../firebase/config";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Dynamically loads the Razorpay checkout script if not present.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Automatically allocates a course or bundle to the student in Firestore,
 * and logs the transaction in 'enrollments' and 'orders' for partner intelligence.
 */
export const allocateCourseAccess = async ({
  studentUser,
  course,
  agency,
  paymentId,
  amount,
  isBundle = false,
}) => {
  if (!studentUser?.uid) {
    throw new Error("Student UID is required for course allocation");
  }

  const studentId = studentUser.uid;
  const safeEmail = studentUser.email || "student@example.com";
  const studentName = studentUser.displayName || safeEmail.split("@")[0];
  const partnerId = agency?.id || agency?.ownerId || "partner";
  const partnerName = agency?.name || "Partner Academy";
  const isBundlePurchase =
    isBundle ||
    course.isBundle ||
    course.id === "bundle" ||
    course.courseId === "bundle" ||
    (course.title && course.title.toLowerCase().includes("bundle"));

  const enrolledCoursesRef = doc(db, "enrolledCourses", studentId);
  const studentRef = doc(db, "users", studentId);

  if (isBundlePurchase) {
    // 1. Fetch all available courses for this agency / main site
    let allCourses = [];
    try {
      const coursesSnap = await getDocs(collection(db, "courseVideos"));
      allCourses = coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      allCourses = allCourses.filter(
        (c) => !c.partnerId || c.partnerId === "admin" || c.partnerId === partnerId
      );
    } catch (e) {
      console.warn("Could not fetch full course list for bundle:", e);
    }

    const bundleCourseObjects = allCourses.map((c) => {
      let safeLectures = [];
      if (Array.isArray(c.lectures)) {
        safeLectures = c.lectures;
      } else if (c.videoId) {
        safeLectures = [
          { id: Date.now(), videoId: c.videoId, title: c.title, url: c.url || "" },
        ];
      }
      return {
        courseId: String(c.id),
        title: String(c.title || "Untitled Course"),
        image: String(c.image || c.thumbnail || ""),
        instructor: String(c.instructor || "Unknown"),
        progress: 0,
        status: "in-progress",
        enrolledAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        videoProgress: 0,
        totalDuration: String(c.duration || "Self Paced"),
        watchedDuration: 0,
        price: String(amount || "499"),
        originalPrice: String(c.originalPrice || c.price || "2499"),
        category: String(c.category || "General"),
        lectures: safeLectures,
        rating: Number(c.rating || 0),
        level: String(c.level || "Beginner"),
        videoUrl: String(c.videoUrl || ""),
        youtubeId: String(c.youtubeId || c.videoId || ""),
      };
    });

    // Also include explicit bundle tag for CourseContext bundle resolution
    const bundleMarker = {
      courseId: "bundle",
      title: "All Courses Lifetime Bundle",
      enrolledAt: new Date().toISOString(),
      status: "active",
      price: String(amount),
    };

    const finalCoursesToEnroll = [bundleMarker, ...bundleCourseObjects];

    await setDoc(
      enrolledCoursesRef,
      {
        courses: arrayUnion(...finalCoursesToEnroll),
      },
      { merge: true }
    );

    // Update user document
    await updateDoc(studentRef, {
      hasBundleAccess: true,
      enrolledCourses: arrayUnion("bundle", ...allCourses.map((c) => String(c.id))),
    }).catch(() => {});
  } else {
    // Single course allocation
    let safeLectures = [];
    if (Array.isArray(course.lectures)) {
      safeLectures = course.lectures;
    } else if (course.videoId) {
      safeLectures = [
        {
          id: Date.now(),
          videoId: course.videoId,
          title: course.title,
          url: course.url || "",
        },
      ];
    }

    const newCourseObject = {
      courseId: String(course.id || course.courseId),
      title: String(course.title || "Untitled Course"),
      image: String(course.image || course.thumbnail || ""),
      instructor: String(course.instructor || "Unknown"),
      progress: 0,
      status: "in-progress",
      enrolledAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      videoProgress: 0,
      totalDuration: String(course.duration || "Self Paced"),
      watchedDuration: 0,
      price: String(amount || course.price || "499"),
      originalPrice: String(course.originalPrice || course.price || "2499"),
      category: String(course.category || "General"),
      lectures: safeLectures,
      rating: Number(course.rating || 0),
      level: String(course.level || "Beginner"),
      videoUrl: String(course.videoUrl || ""),
      youtubeId: String(course.youtubeId || course.videoId || ""),
    };

    await setDoc(
      enrolledCoursesRef,
      {
        courses: arrayUnion(newCourseObject),
      },
      { merge: true }
    );

    await updateDoc(studentRef, {
      enrolledCourses: arrayUnion(String(course.id || course.courseId)),
    }).catch(() => {});
  }

  // Record in 'enrollments' collection
  try {
    await addDoc(collection(db, "enrollments"), {
      courseId: String(course.id || (isBundlePurchase ? "bundle" : "direct")),
      courseName: course.title || (isBundlePurchase ? "All Courses Bundle" : "Course Enrollment"),
      studentId,
      studentEmail: safeEmail,
      studentName,
      price: Number(amount),
      partnerId,
      partnerName,
      source: "razorpay_direct",
      paymentId: paymentId || `pay_${Date.now()}`,
      createdAt: serverTimestamp(),
      type: isBundlePurchase ? "bundle" : "course",
    });
  } catch (e) {
    console.warn("Failed to write to enrollments collection:", e);
  }

  // Record in 'orders' collection (for Partner Sales & Revenue Dashboard)
  try {
    await addDoc(collection(db, "orders"), {
      partnerId,
      partnerName,
      studentEmail: safeEmail,
      studentName,
      courseId: String(course.id || (isBundlePurchase ? "bundle" : "direct")),
      courseTitle: course.title || (isBundlePurchase ? "All Courses Bundle" : "Course Enrollment"),
      productType: isBundlePurchase ? "bundle" : "course",
      adminPrice: 0,
      sellingPrice: Number(amount),
      profit: Number(amount),
      status: "Success",
      paymentId: paymentId || `pay_${Date.now()}`,
      createdAt: serverTimestamp(),
      type: "Enrollment",
    });
  } catch (e) {
    console.warn("Failed to write to orders collection:", e);
  }

  return { success: true, paymentId, isBundle: isBundlePurchase };
};

/**
 * Initiates Razorpay checkout using partner's BYOK API Key.
 * If payment is successful, instantly allocates course and triggers callback.
 */
export const openRazorpayCheckout = async ({
  course,
  agency,
  currentUser,
  rawPrice,
  onSuccess,
  onError,
  onDismiss,
}) => {
  const razorpayKey = (agency?.razorpayKeyId || "").trim();
  if (!razorpayKey) {
    throw new Error("Partner Razorpay Key ID not configured");
  }

  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    alert("Unable to load secure Razorpay gateway. Please check your internet connection.");
    return false;
  }

  // Parse numeric amount
  let numericAmount = 499;
  if (rawPrice !== undefined && rawPrice !== null) {
    const parsed = parseInt(String(rawPrice).replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0) {
      numericAmount = parsed;
    }
  } else if (course?.price) {
    const parsed = parseInt(String(course.price).replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0) {
      numericAmount = parsed;
    }
  }

  const isBundle =
    course.id === "bundle" ||
    course.isBundle ||
    (course.title && course.title.toLowerCase().includes("bundle"));

  const options = {
    key: razorpayKey,
    amount: Math.round(numericAmount * 100), // in paise
    currency: "INR",
    name: agency?.name || "Learning Academy",
    description: course.title ? `${course.title} Enrollment` : "Course Enrollment",
    image: agency?.logoUrl || agency?.logo || undefined,
    prefill: {
      name: currentUser?.displayName || "",
      email: currentUser?.email || "",
      contact: currentUser?.phoneNumber || currentUser?.phone || "",
    },
    theme: {
      color: agency?.themeColor || "#0f172a",
    },
    handler: async function (response) {
      try {
        const allocResult = await allocateCourseAccess({
          studentUser: currentUser,
          course,
          agency,
          paymentId: response.razorpay_payment_id,
          amount: numericAmount,
          isBundle,
        });

        if (onSuccess) {
          onSuccess(allocResult, response);
        }
      } catch (err) {
        console.error("Auto allocation error after payment:", err);
        if (onError) {
          onError(err);
        } else {
          alert("Payment received! Please refresh to access your course.");
        }
      }
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) onDismiss();
      },
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.open();
    return true;
  } catch (err) {
    console.error("Failed to initialize Razorpay:", err);
    if (onError) onError(err);
    return false;
  }
};
