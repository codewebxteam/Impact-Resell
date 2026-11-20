/* eslint-disable react-refresh/only-export-components */
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
  theme: "theme1",
  themeColor: "#0f172a",
  accentColor: "#5edff4",
  email: "support@alifestable.com",
  whatsapp: "",
  address: "",
  tagline: "",
  logo: "",
  customPrices: {},
  customPaymentLinks: {},
  bundlePaymentLink: "",
  paymentLink: "",
  promoType: "none",
  bundlePrice: "",
  demoVideoLink: "",
};

// Helper to build compliant PWA icons for any image format or CDN
const getManifestIcons = (rawLogo) => {
  if (!rawLogo) {
    return [
      {
        src: "/vite.svg",
        sizes: "192x192 512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ];
  }

  const isSvg = rawLogo.endsWith(".svg") || rawLogo.includes(".svg?");
  if (isSvg) {
    return [
      {
        src: rawLogo,
        sizes: "192x192 512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ];
  }

  const isImageKit = rawLogo.includes("imagekit.io");
  const icon192 = isImageKit
    ? (rawLogo.includes("?") ? `${rawLogo}&tr=w-192,h-192,cm-pad_resize` : `${rawLogo}?tr=w-192,h-192,cm-pad_resize`)
    : rawLogo;
  const icon512 = isImageKit
    ? (rawLogo.includes("?") ? `${rawLogo}&tr=w-512,h-512,cm-pad_resize` : `${rawLogo}?tr=w-512,h-512,cm-pad_resize`)
    : rawLogo;

  return [
    {
      src: icon192,
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: icon512,
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: icon512,
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ];
};

export const AgencyProvider = ({ children }) => {
  const [agency, setAgency] = useState(DEFAULT_AGENCY);
  const [isMainSite, setIsMainSite] = useState(true);
  const [loading, setLoading] = useState(true);

  // --- PWA Native Install States ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setCanInstall(false);
    };

    const checkIOS =
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !window.MSStream;
    setIsIOS(Boolean(checkIOS));

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installPWA = useCallback(async () => {
    const appDisplayName = !isMainSite && agency?.name ? agency.name : "AI Courses";

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setDeferredPrompt(null);
          setCanInstall(false);
        }
      } catch (err) {
        console.warn("PWA Prompt error:", err);
      }
    } else if (isIOS) {
      alert(
        `To download & install ${appDisplayName} App on iPhone/iPad:\n\n1. Tap the Share button (square with arrow pointing up) at the bottom of Safari.\n2. Scroll down and tap "Add to Home Screen".\n3. Tap "Add" at top right.`
      );
    } else {
      alert(
        `To download & install ${appDisplayName} App:\n\nTap your browser menu (⋮) at top-right and select "Install app" or "Add to Home screen".`
      );
    }
  }, [deferredPrompt, isIOS, isMainSite, agency]);

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
      } catch {
        try {
          subSnap = await getDocFromServer(subDocRef);
        } catch {
          // Fallback handled below
        }
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
        } catch {
          try {
            agencySnap = await getDocFromServer(agencyDocRef);
          } catch {
            // Fallback handled below
          }
        }

        if (agencySnap && agencySnap.exists()) {
          const data = agencySnap.data();
          setAgency({
            ...data,
            id: ownerId,
            name: data.name || "Academy",
            theme: data.theme || "theme1",
            email: data.email,
            whatsapp: data.whatsapp,
            address: data.address || "",
            tagline: data.tagline || "",
            logo: data.logo || data.logoUrl || "",
            logoUrl: data.logoUrl || data.logo || "",
            upi: data.upi,
            customPrices: data.customPrices || {},
            customPaymentLinks: data.customPaymentLinks || {},
            bundlePaymentLink: data.bundlePaymentLink || data.customPaymentLinks?.["bundle"] || "",
            paymentLink: data.paymentLink || "",
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
        : `${agency?.name || "Academy"} | Learning Portal`;

      // --- DYNAMIC PWA MANIFEST (Native Chrome / Browser Install) ---
      try {
        const appName = !isMainSite && agency?.name ? agency.name : "AI Courses";
        const shortName =
          !isMainSite && agency?.name
            ? agency.name.length > 15
              ? agency.name.substring(0, 15)
              : agency.name
            : "AI Courses";
        const rawLogo = agency?.logoUrl || agency?.logo || "";
        const logoUrl = rawLogo || "/vite.svg";
        const themeColor = agency?.themeColor || "#0f172a";
        const tagline =
          agency?.tagline ||
          (!isMainSite && agency?.name
            ? `Learn & Grow with ${agency.name}`
            : "Explore and master top AI tools and skills");

        const manifestData = {
          name: appName,
          short_name: shortName,
          description: tagline,
          start_url: window.location.origin + "/",
          scope: window.location.origin + "/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: themeColor,
          orientation: "portrait-primary",
          icons: getManifestIcons(rawLogo),
        };

        // 1. Data URI update for immediate DOM recognition
        const encodedManifest =
          "data:application/manifest+json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(manifestData));

        let manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
          manifestLink.setAttribute("href", encodedManifest);
        } else {
          manifestLink = document.createElement("link");
          manifestLink.id = "app-manifest";
          manifestLink.rel = "manifest";
          manifestLink.href = encodedManifest;
          document.head.appendChild(manifestLink);
        }

        // 2. Put into CacheStorage so Service Worker serves dynamic /manifest.json
        if ("caches" in window) {
          caches.open("pwa-dynamic-manifest-v2").then((cache) => {
            cache.put(
              "/manifest.json",
              new Response(JSON.stringify(manifestData), {
                headers: {
                  "Content-Type": "application/manifest+json; charset=utf-8",
                  "Cache-Control": "public, max-age=0, must-revalidate",
                },
              })
            );
          }).catch((err) => {
            console.warn("Failed to put dynamic manifest into CacheStorage:", err);
          });
        }

        // 3. Post to active Service Worker controller
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "SET_DYNAMIC_MANIFEST",
            manifest: manifestData,
          });
        }

        // 4. Dynamic Favicon, Apple Touch Icon & Shortcut Icon (iOS & Desktop)
        if (logoUrl) {
          let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
          if (!appleIcon) {
            appleIcon = document.createElement("link");
            appleIcon.id = "apple-touch-icon";
            appleIcon.rel = "apple-touch-icon";
            document.head.appendChild(appleIcon);
          }
          appleIcon.href = logoUrl;

          let favIcon = document.querySelector("link[rel='icon']");
          if (favIcon) {
            favIcon.href = logoUrl;
          }

          let shortcutIcon = document.querySelector("link[rel='shortcut icon']");
          if (!shortcutIcon) {
            shortcutIcon = document.createElement("link");
            shortcutIcon.rel = "shortcut icon";
            document.head.appendChild(shortcutIcon);
          }
          shortcutIcon.href = logoUrl;
        }

        // 5. Meta Tags for Native PWA Install & iOS Home Screen Title
        let metaTheme = document.querySelector("meta[name='theme-color']");
        if (!metaTheme) {
          metaTheme = document.createElement("meta");
          metaTheme.name = "theme-color";
          document.head.appendChild(metaTheme);
        }
        metaTheme.content = themeColor;

        let metaAppName = document.querySelector("meta[name='application-name']");
        if (!metaAppName) {
          metaAppName = document.createElement("meta");
          metaAppName.name = "application-name";
          document.head.appendChild(metaAppName);
        }
        metaAppName.content = appName;

        let metaAppleTitle = document.querySelector(
          "meta[name='apple-mobile-web-app-title']"
        );
        if (!metaAppleTitle) {
          metaAppleTitle = document.createElement("meta");
          metaAppleTitle.name = "apple-mobile-web-app-title";
          document.head.appendChild(metaAppleTitle);
        }
        metaAppleTitle.content = appName;
      } catch (err) {
        console.warn("Dynamic manifest error:", err);
      }
    }
  }, [agency, isMainSite, loading]);

  const getPrice = (courseId, originalPrice) => {
    if (!isMainSite && agency?.customPrices) {
      const customPrice = agency.customPrices[courseId];
      if (
        customPrice !== undefined &&
        customPrice !== "" &&
        Number(customPrice) > 0
      ) {
        return String(customPrice);
      }
    }
    const num = Number(originalPrice);
    if (!isNaN(num) && num > 0) {
      return String(originalPrice);
    }
    return "499";
  };

  const hasPartnerSetPrice = (courseId) => {
    if (isMainSite || !agency?.customPrices) return false;
    const cp = agency.customPrices[courseId];
    return cp !== undefined && cp !== "" && Number(cp) > 0;
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
        hasPartnerSetPrice,
        canInstall,
        isIOS,
        installPWA,
      }}
    >
      {children}
    </AgencyContext.Provider>
  );
};
