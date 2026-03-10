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

const DEFAULT_AGENCY = {
  name: "Impact School Of AI",
  themeColor: "#0f172a",
  accentColor: "#5edff4",
  email: "support@alifestable.com",
  whatsapp: "",
  customPrices: {},
};

export const AgencyProvider = ({ children }) => {
  const [agency, setAgency] = useState(DEFAULT_AGENCY);
  const [isMainSite, setIsMainSite] = useState(true);
  const [loading, setLoading] = useState(true);

  const refreshAgency = useCallback(async () => {
    setLoading(true);

    // Timer taaki agar internet slow ho toh website stuck na ho
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("⏳ Agency fetch timed out, showing default site.");
        setAgency(DEFAULT_AGENCY);
        setIsMainSite(true);
        setLoading(false);
      }
    }, 5000); // 5 Seconds Timeout

    try {
      const hostname = window.location.hostname;
      let subdomain = null;

      // Subdomain extraction logic
      const parts = hostname.split(".");
      if (hostname.includes("localhost")) {
        if (parts.length > 1 && parts[0] !== "www")
          subdomain = parts[0].toLowerCase();
      } else {
        if (parts.length >= 3 && parts[0] !== "www")
          subdomain = parts[0].toLowerCase();
      }

      if (!subdomain) {
        setAgency(DEFAULT_AGENCY);
        setIsMainSite(true);
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

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

  // CSS Variables update logic
  useEffect(() => {
    if (!loading) {
      document.documentElement.style.setProperty(
        "--brand-color",
        agency?.themeColor,
      );
      document.documentElement.style.setProperty(
        "--accent-color",
        agency?.accentColor,
      );
      document.title = isMainSite
        ? "Impact School Of AI"
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
