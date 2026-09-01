import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const AgencyContext = createContext();

export const useAgency = () => useContext(AgencyContext);

const DEFAULT_AGENCY = {
  name: "AI Courses",
  themeColor: "#0f172a",
  accentColor: "#5edff4",
  email: "support@alifestable.com",
  whatsapp: "",
  address: "",
  customPrices: {},
  customPaymentLinks: {},
  promoType: "none",
  bundlePrice: "",
  demoVideoLink: "",
};

export const AgencyProvider = ({ children }) => {
  const [agency, setAgency] = useState(DEFAULT_AGENCY);
  const [isMainSite, setIsMainSite] = useState(true);
  const [loading, setLoading] = useState(true);

  const refreshAgency = useCallback(async () => {
    setLoading(true);

    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("⏳ Agency fetch timed out, showing default site.");
        setAgency(DEFAULT_AGENCY);
        setIsMainSite(true);
        setLoading(false);
      }
    }, 8000); // Increased to 8 seconds for better reliability

    try {
      const hostname = window.location.hostname.toLowerCase();
      let lookupKey = null;

      const parts = hostname.split(".");
      if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
        if (parts.length > 1 && parts[0] !== "www") {
          lookupKey = parts[0];
        }
      } else if (
        hostname === "i-cpp.com" ||
        hostname === "www.i-cpp.com" ||
        hostname === "impact-resell.vercel.app"
      ) {
        lookupKey = null;
      } else if (parts.length >= 3 && hostname.endsWith("i-cpp.com")) {
        if (parts[0] !== "www") {
          lookupKey = parts[0];
        }
      } else {
        // Custom domain (e.g. gyanjyoti.com or www.gyanjyoti.com)
        lookupKey = hostname.replace(/^www\./, "");
      }

      if (!lookupKey) {
        setAgency(DEFAULT_AGENCY);
        setIsMainSite(true);
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      // Step A: Try direct lookup in "subdomains" collection (e.g. "gyan" or "gyanjyoti.com")
      const subDocRef = doc(db, "subdomains", lookupKey);
      let subSnap = null;
      try {
        subSnap = await getDocFromCache(subDocRef);
      } catch (e) {
        try {
          subSnap = await getDocFromServer(subDocRef);
        } catch (err) {}
      }

      let ownerId = null;

      if (subSnap && subSnap.exists()) {
        ownerId = subSnap.data().ownerId;
      } else {
        // Step B: Search "agencies" collection where customDomain == lookupKey
        try {
          const q = query(
            collection(db, "agencies"),
            where("customDomain", "==", lookupKey)
          );
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            ownerId = querySnap.docs[0].id;
          }
        } catch (err) {
          console.error("❌ Custom domain query error:", err);
        }
      }

      if (ownerId) {
        const agencyDocRef = doc(db, "agencies", ownerId);
        let agencySnap = null;
        try {
          agencySnap = await getDocFromCache(agencyDocRef);
        } catch (e) {
          try {
            agencySnap = await getDocFromServer(agencyDocRef);
          } catch (err) {}
        }

        if (agencySnap && agencySnap.exists()) {
          const data = agencySnap.data();
          setAgency({
            id: ownerId,
            name: data.name || "Academy",
            email: data.email,
            whatsapp: data.whatsapp,
            address: data.address || "",
            upi: data.upi,
            customPrices: data.customPrices || {},
            customPaymentLinks: data.customPaymentLinks || {},
            promoType: data.promoType || "none",
            bundlePrice: data.bundlePrice || "",
            themeColor: data.themeColor || "#0f172a",
            accentColor: data.accentColor || "#5edff4",
            subdomain: data.subdomain || lookupKey,
            customDomain: data.customDomain || "",
            demoVideoLink: data.demoVideoLink || "",
            courseDemoOverrides: data.courseDemoOverrides || {},
          });
          setIsMainSite(false);
        } else {
          setAgency(DEFAULT_AGENCY);
          setIsMainSite(true);
        }
      } else {
        setAgency(DEFAULT_AGENCY);
        setIsMainSite(true);
      }
    } catch (error) {
      console.error("❌ Agency Context Error:", error);
      setAgency(DEFAULT_AGENCY);
      setIsMainSite(true);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAgency();
  }, [refreshAgency]);

  useEffect(() => {
    if (!loading) {
      document.documentElement.style.setProperty(
        "--brand-color",
        agency?.themeColor || "#0f172a",
      );
      document.documentElement.style.setProperty(
        "--accent-color",
        agency?.accentColor || "#5edff4",
      );
      document.title = isMainSite
        ? "AI Courses"
        : `${agency?.name} | Learning Portal`;
    }
  }, [agency, isMainSite, loading]);

  const getPrice = (courseId, originalPrice) => {
    if (isMainSite || !agency?.customPrices) return originalPrice;
    const customPrice = agency.customPrices[courseId];
    return customPrice !== undefined && customPrice !== ""
      ? customPrice
      : originalPrice;
  };

  return (
    <AgencyContext.Provider
      value={{
        agency,
        isMainSite,
        isPartner: !isMainSite,
        loading,
        refreshAgency,
        getPrice,
      }}
    >
      {children}
    </AgencyContext.Provider>
  );
};
