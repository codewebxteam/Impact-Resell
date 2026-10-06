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
    const emailLower = (res.user.email || email).toLowerCase().trim();

    let currentRole = "student";

    try {
      const resellerSnap = await getDoc(doc(db, "allowedResellers", emailLower));
      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);
      const uData = userSnap.exists() ? userSnap.data() : null;

      if (resellerSnap.exists()) {
        currentRole = "partner";
        if (!uData || uData.role !== "partner") {
          await setDoc(
            userDocRef,
            {
              uid,
              name: res.user.displayName || uData?.name || "Partner",
              email: res.user.email,
              role: "partner",
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
          await setDoc(
            doc(db, "allowedResellers", emailLower),
            { status: "registered", registeredAt: new Date().toISOString() },
            { merge: true }
          );
        }
      } else if (uData?.role) {
        currentRole = uData.role;
      }
    } catch (e) {
      console.warn("Error checking reseller status on login:", e);
    }

    // Safety: ensure dashboard exists
    const dashboardRef = doc(db, "dashboard", uid);
    const snap = await getDoc(dashboardRef);

    if (!snap.exists()) {
      await setDoc(dashboardRef, {
        user: {
          name: res.user.displayName || (currentRole === "partner" ? "Partner" : "Student"),
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

  // 4. Reset Password Function — user ke email pe Firebase reset link bhejta hai (works on main site & subdomains)
  const resetPassword = async (email) => {
    try {
      const currentOrigin = typeof window !== "undefined" ? window.location.origin : `https://${MAIN_DOMAIN}`;
      const actionCodeSettings = {
        url: currentOrigin,
      };
      return await sendPasswordResetEmail(auth, email, actionCodeSettings);
    } catch (error) {
      console.warn("Reset password with actionCodeSettings failed, attempting standard fallback:", error);
      // Fallback: standard sendPasswordResetEmail without actionCodeSettings (always succeeds on subdomains and custom domains)
      return await sendPasswordResetEmail(auth, email);
    }
  };

  // 5. [UPDATED] Monitor Auth State & Fetch Firestore Data + Auto-Sync Partner Role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          let uData = userDoc.exists() ? userDoc.data() : null;

          const emailLower = (user.email || "").toLowerCase().trim();
          let isPartnerWhitelisted = false;
          if (emailLower) {
            const resellerSnap = await getDoc(doc(db, "allowedResellers", emailLower));
            if (resellerSnap.exists()) {
              isPartnerWhitelisted = true;
            }
          }

          if (isPartnerWhitelisted && (!uData || uData.role !== "partner")) {
            const updated = {
              uid: user.uid,
              name: user.displayName || uData?.name || "Partner",
              email: user.email,
              role: "partner",
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, updated, { merge: true });
            uData = { ...(uData || {}), ...updated, role: "partner" };

            try {
              await setDoc(
                doc(db, "allowedResellers", emailLower),
                {
                  email: emailLower,
                  status: "registered",
                  registeredAt: new Date().toISOString(),
                },
                { merge: true }
              );
            } catch (err) {
              console.warn("Could not update allowedResellers status:", err);
            }
          }

          setUserData(uData);
          setCurrentUser(user);
        } catch (err) {
          console.error("Auth state error:", err);
          setCurrentUser(user);
        }
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
