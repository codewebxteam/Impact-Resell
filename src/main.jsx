import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AgencyProvider } from "./context/AgencyContext.jsx"; // [NEW IMPORT]

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* AgencyProvider sabse bahar hona chahiye taaki Auth aur App ko agency ka pata rahe */}
    <AgencyProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AgencyProvider>
  </React.StrictMode>
);

// Register PWA Service Worker
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("PWA Service Worker registered:", reg.scope);
      })
      .catch((err) => {
        console.warn("PWA Service Worker registration failed:", err);
      });
  });
} else if ("serviceWorker" in navigator) {
  // In dev mode also allow SW testing if needed
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {});
  });
}

