import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../firebase/config"; // [UPDATED] Import db for Firestore
import { doc, setDoc, getDoc, serverTimestamp} from "firebase/firestore"; // [NEW] Firestore methods
import { MAIN_DOMAIN } from "../utils/domainHelper";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); // [NEW] To store Firestore user data (role, etc.)
  const [loading, setLoading] = useState(true);

  // 1. [UPDATED] Signup Function with Role Management
  const signup = async (email, password, name, phone = "", role = "student", partnerId = "direct") => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;
    

    // Update Firebase Auth Profile
    await updateProfile(userCredential.user, { displayName: name });

    // [NEW] Save User Profile with Role in Firestore
    await setDoc(doc(db, "users", uid), {
      uid,
      name: name || "Unknown",
      email: email,
      phone: phone || "Not Provided",
      role: role, // 'student' or 'partner'
      partnerId: partnerId, // Added partnerId to track who referred them
      createdAt: new Date().toISOString(),
    });

     await setDoc(doc(db, "dashboard", uid), {
      user: {
        name,
        email,
        avatar: "",
      },

      stats: {
        enrolledCourses: 0,
        activeHours: 0,
        certificates: 0,
        ebooks: 0,
      },

      activity: [
        { day: "M", hours: 0 },
        { day: "T", hours: 0 },
        { day: "W", hours: 0 },
        { day: "T", hours: 0 },
        { day: "F", hours: 0 },
        { day: "S", hours: 0 },
        { day: "S", hours: 0 },
      ],

      currentCourse: null,

      gamification: {
        level: 1,
        xp: 0,
        streak: 0,
      },

      meta: {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      },
    });


    return userCredential;
  };

  // 2. Login Function
  const login = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const uid = res.user.uid;

    // Safety: ensure dashboard exists
    const dashboardRef = doc(db, "dashboard", uid);
    const snap = await getDoc(dashboardRef);

    if (!snap.exists()) {
      await setDoc(dashboardRef, {
        user: {
          name: res.user.displayName || "Student",
          email: res.user.email,
          avatar: "",
        },
        stats: {
          enrolledCourses: 0,
          activeHours: 0,
          certificates: 0,
          ebooks: 0,
        },
        activity: [
          { day: "M", hours: 0 },
          { day: "T", hours: 0 },
          { day: "W", hours: 0 },
          { day: "T", hours: 0 },
          { day: "F", hours: 0 },
          { day: "S", hours: 0 },
          { day: "S", hours: 0 },
        ],
        currentCourse: null,
        gamification: { level: 1, xp: 0, streak: 0 },
        meta: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      });
    }

    return res;
  };

  // 3. Logout Function
  const logout = () => {
    setUserData(null);
    return signOut(auth);
  };

  // 4. Reset Password Function — user ke email pe Firebase reset link bhejta hai
  const resetPassword = (email) => {
    const actionCodeSettings = {
      // Always route back to the main domain to bypass Firebase's unauthorized domain error for subdomains
      url: `https://${MAIN_DOMAIN}`, 
    };
    return sendPasswordResetEmail(auth, email, actionCodeSettings);
  };

  // 4. [UPDATED] Monitor Auth State & Fetch Firestore Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // [NEW] Fetch user role and extra data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData, // [NEW] Provide role/extra data globally
    signup,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
