import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { useAgency } from "./AgencyContext";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  collection,
  Timestamp,
  getDoc,
  getDocs,
} from "firebase/firestore"; // [FIX] Added getDoc
import { db } from "../firebase/config";
import {
  createOrder,
  updateCourseProgress as updateOrderProgress,
} from "../firebase/orders.service";

const CourseContext = createContext();

export const useCourse = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { isPartner, agency } = useAgency();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const updateTimeoutRef = useRef(null);

  const resolveBundleCourses = async (coursesData) => {
    const hasBundle = coursesData.some(c => c.courseId === "bundle");
    if (!hasBundle) return coursesData;

    try {
      const coursesSnap = await getDocs(collection(db, "courseVideos"));
      const allCourses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const dynamicCourses = allCourses.map(c => {
        const existing = coursesData.find(ec => ec.courseId === c.id);
        if (existing) return existing;

        let safeLectures = [];
        if (c.lectures && Array.isArray(c.lectures)) {
          safeLectures = c.lectures;
        } else if (c.videoId) {
          safeLectures = [{ id: Date.now(), videoId: c.videoId, title: c.title, url: c.url || "" }];
        }

        return {
          courseId: c.id,
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
          price: String(c.price || "Free"),
          category: String(c.category || "General"),
          lectures: safeLectures,
          rating: Number(c.rating || 0),
          level: String(c.level || "Beginner")
        };
      });

      return [
        ...dynamicCourses,
        coursesData.find(c => c.courseId === "bundle")
      ];
    } catch (err) {
      console.error("Failed to dynamically load bundle courses", err);
      return coursesData;
    }
  };

  useEffect(() => {
    if (currentUser) {
      const docRef = doc(db, "enrolledCourses", currentUser.uid);

      const unsubscribe = onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
          const coursesData = docSnap.data().courses || [];
          const resolvedData = await resolveBundleCourses(coursesData);
          setEnrolledCourses(resolvedData);
        } else {
          setEnrolledCourses([]);
        }
      });

      return () => unsubscribe();
    } else {
      setEnrolledCourses([]);
    }
  }, [currentUser]);

  const loadEnrolledCourses = async () => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, "enrolledCourses", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const coursesData = docSnap.data().courses || [];
        const resolvedData = await resolveBundleCourses(coursesData);
        setEnrolledCourses(resolvedData);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  const enrollCourse = async (course) => {
    if (!currentUser) return;

    const courseId = String(course.id || course.courseId || "");
    const alreadyEnrolled = enrolledCourses.some(
      (c) => c.courseId === courseId
    );
    if (alreadyEnrolled) {
      throw new Error("Already enrolled in this course");
    }

    // Calculate actual price - ALWAYS use offer price (course.price)
    const offerPriceStr = String(course.price || "Free");
    let actualPrice = 0;
    if (offerPriceStr !== "Free") {
      const numericPrice = parseInt(offerPriceStr.replace(/[^0-9]/g, ""));
      actualPrice = isPartner
        ? Math.round(numericPrice * (agency.pricingMultiplier || 1))
        : numericPrice;
    }

    // --- [CRITICAL FIX] Ensure lectures is ALWAYS an Array ---
    let safeLectures = [];
    if (course.lectures && Array.isArray(course.lectures)) {
      safeLectures = course.lectures;
    } else if (course.videoId) {
      // Fallback: If single video, create a list of 1
      safeLectures = [
        {
          id: Date.now(),
          videoId: course.videoId,
          title: course.title,
          url: course.url || "",
        },
      ];
    }

    const newCourse = {
      courseId,
      title: String(course.title || "Untitled Course"),
      image: String(course.image || course.thumbnail || ""),
      instructor: String(course.instructor || "Unknown"),
      progress: 0,
      status: "in-progress",
      enrolledAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      videoProgress: 0,
      totalDuration: String(course.duration || "Self Paced"), // Updated default
      watchedDuration: 0,
      price: String(course.price || "Free"),
      originalPrice: String(course.originalPrice || course.price || "Free"),
      category: String(course.category || "General"),

      // [FIXED] Saving lectures as Array, NOT String
      lectures: safeLectures,

      rating: Number(course.rating || 0),
      level: String(course.level || "Beginner"),
      videoUrl: String(course.videoUrl || ""),
      youtubeId: String(course.youtubeId || course.videoId || ""),
    };

    const updatedCourses = [...enrolledCourses, newCourse];
    setEnrolledCourses(updatedCourses);

    const docRef = doc(db, "enrolledCourses", currentUser.uid);
    await setDoc(docRef, { courses: updatedCourses }, { merge: true });

    // Add payment entry for Intelligence Hub (using OFFER PRICE)
    if (actualPrice > 0) {
      await addDoc(collection(db, "payments"), {
        amount: actualPrice,
        status: "completed",
        source: isPartner ? "partner" : "direct",
        partnerId: isPartner ? agency.id : null,
        partnerName: isPartner ? agency.name : null,
        type: "purchase",
        courseId: courseId,
        courseName: course.title,
        studentId: currentUser.uid,
        studentEmail: currentUser.email,
        createdAt: Timestamp.now(),
      });
    }

    // Add enrollment entry
    await addDoc(collection(db, "enrollments"), {
      courseName: course.title,
      source: isPartner ? "partner" : "direct",
      studentId: currentUser.uid,
      courseId: courseId,
      price: actualPrice,
      createdAt: Timestamp.now(),
    });

    // Add to orders collection for admin tracking
    await createOrder({
      studentName: currentUser.displayName || currentUser.email,
      studentEmail: currentUser.email,
      userId: currentUser.uid,
      assetName: course.title,
      type: "course",
      saleValue: actualPrice,
      commission: isPartner ? Math.round(actualPrice * 0.1) : 0,
      partnerId: isPartner ? agency.id : "direct",
      partnerName: isPartner ? agency.name : "Direct",
      courseId: courseId,
      ebookId: null,
    });
  };

  const updateCourseProgress = useCallback(
    async (courseId, progress, watchedDuration) => {
      if (!currentUser) return;

      setEnrolledCourses((prevCourses) => {
        const updatedCourses = prevCourses.map((course) => {
          if (course.courseId === courseId) {
            return {
              ...course,
              progress: Math.min(Math.round(progress), 100),
              watchedDuration: watchedDuration,
              status: progress >= 100 ? "completed" : "in-progress",
              lastAccessed: new Date().toISOString(),
            };
          }
          return course;
        });

        // Debounce Firebase update
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(async () => {
          try {
            const docRef = doc(db, "enrolledCourses", currentUser.uid);
            await updateDoc(docRef, { courses: updatedCourses });

            // Update progress in orders collection
            await updateOrderProgress(
              currentUser.uid,
              courseId,
              Math.min(Math.round(progress), 100)
            );
          } catch (error) {
            console.error("Error updating progress:", error);
          }
        }, 3000);

        return updatedCourses;
      });
    },
    [currentUser]
  );

  const isEnrolled = useCallback(
    (courseId) => {
      return enrolledCourses.some((course) => course.courseId === courseId);
    },
    [enrolledCourses]
  );

  const getCourseProgress = useCallback(
    (courseId) => {
      const course = enrolledCourses.find((c) => c.courseId === courseId);
      return course ? course.progress : 0;
    },
    [enrolledCourses]
  );

  const getEnrolledCourse = useCallback(
    (courseId) => {
      return enrolledCourses.find((c) => c.courseId === courseId);
    },
    [enrolledCourses]
  );

  return (
    <CourseContext.Provider
      value={{
        enrolledCourses,
        enrollCourse,
        updateCourseProgress,
        isEnrolled,
        getCourseProgress,
        getEnrolledCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
