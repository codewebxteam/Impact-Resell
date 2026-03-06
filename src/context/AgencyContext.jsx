import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

const AgencyContext = createContext();

export const useAgency = () => useContext(AgencyContext);

// --- DEFAULT AGENCY DATA (For Main Site) ---
// ताकी App कभी Crash न हो अगर agency null हो
const DEFAULT_AGENCY = {
  name: "Impact School Of AI",
  themeColor: "#0f172a", // Navy Blue (Default)
  accentColor: "#5edff4", // Cyan (Default)
  email: "support@alifestable.com",
  whatsapp: "",
  customPrices: {},
};

export const AgencyProvider = ({ children }) => {
  // --- STATE ---
  // Default data se shuru karein (null se nahi)
  const [agency, setAgency] = useState(DEFAULT_AGENCY);
  const [isMainSite, setIsMainSite] = useState(true);
  const [loading, setLoading] = useState(true);

  // --- REFRESH LOGIC ---
  const refreshAgency = useCallback(async () => {
    setLoading(true);
    try {
      const hostname = window.location.hostname;
      let subdomain = null;

      if (hostname.includes("localhost")) {
        const parts = hostname.split(".");
        if (parts.length > 1 && parts[0] !== "www") {
          subdomain = parts[0].toLowerCase();
        }
      } else {
        const parts = hostname.split(".");
        if (parts.length >= 3 && parts[0] !== "www") {
          subdomain = parts[0].toLowerCase();
        }
      }

      // 1. If NO Subdomain -> Load Main Site Data (Not NULL)
      if (!subdomain) {
        console.log("Loading Main Site");
        setAgency(DEFAULT_AGENCY); // [FIX] Null ki jagah Default Object
        setIsMainSite(true);
        setLoading(false);
        return;
      }

      console.log("🔍 Checking Agency for:", subdomain);
      const subDocRef = doc(db, "subdomains", subdomain);
      const subSnap = await getDoc(subDocRef);

      if (subSnap.exists()) {
        const { ownerId } = subSnap.data();
        const agencyDocRef = doc(db, "agencies", ownerId);
        const agencySnap = await getDoc(agencyDocRef);

        if (agencySnap.exists()) {
          const data = agencySnap.data();
          setAgency({
            id: ownerId,
            name: data.name || "Academy",
            email: data.email,
            whatsapp: data.whatsapp,
            upi: data.upi,
            customPrices: data.customPrices || {},
            themeColor: data.themeColor || "#0f172a",
            accentColor: data.accentColor || "#5edff4",
            subdomain: subdomain,
          });
          setIsMainSite(false);
        } else {
          setAgency(DEFAULT_AGENCY); // Fallback
          setIsMainSite(true);
        }
      } else {
        setAgency(DEFAULT_AGENCY); // Fallback
        setIsMainSite(true);
      }
    } catch (error) {
      console.error("❌ Agency Context Error:", error);
      setAgency(DEFAULT_AGENCY);
      setIsMainSite(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAgency();
  }, [refreshAgency]);

  // --- DYNAMIC TITLE & THEME ---
  useEffect(() => {
    if (!loading) {
      // Colors Set karein (Chahe Main ho ya Partner)
      document.documentElement.style.setProperty(
        "--brand-color",
        agency?.themeColor || "#0f172a"
      );
      document.documentElement.style.setProperty(
        "--accent-color",
        agency?.accentColor || "#5edff4"
      );

      if (!isMainSite) {
        // Partner Title
        document.title = `${agency?.name} | Learning Portal`;
      } else {
        // Main Site Title
        document.title = "Impact School Of AI";
      }
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
        agency, // Ab ye kabhi NULL nahi hoga -> Crash Fixed!
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
