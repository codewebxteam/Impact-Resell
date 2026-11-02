import React, { createContext, useContext, useState, useEffect } from "react";

const AdminModeContext = createContext({
  adminMode: "new",
  toggleAdminMode: () => {},
});

export const useAdminMode = () => useContext(AdminModeContext);

export const AdminModeProvider = ({ children }) => {
  const [adminMode, setAdminMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("impact_admin_version") || "new";
    }
    return "new";
  });

  const toggleAdminMode = () => {
    setAdminMode((prev) => {
      const next = prev === "new" ? "classic" : "new";
      if (typeof window !== "undefined") {
        localStorage.setItem("impact_admin_version", next);
      }
      return next;
    });
  };

  return (
    <AdminModeContext.Provider value={{ adminMode, setAdminMode, toggleAdminMode }}>
      {children}
    </AdminModeContext.Provider>
  );
};
