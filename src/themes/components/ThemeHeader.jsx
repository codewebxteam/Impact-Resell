import React from "react";
import Theme1Header from "../theme1/components/Theme1Header";
import Theme2Header from "../theme2/components/Theme2Header";
import Theme3Header from "../theme3/components/Theme3Header";
import Theme4Header from "../theme4/components/Theme4Header";
import Theme5Header from "../theme5/components/Theme5Header";

const ThemeHeader = ({ currentTheme = "theme1" }) => {
  switch (currentTheme) {
    case "theme1":
      return <Theme1Header currentTheme="theme1" />;
    case "theme2":
      return <Theme2Header currentTheme="theme2" />;
    case "theme3":
      return <Theme3Header currentTheme="theme3" />;
    case "theme4":
      return <Theme4Header currentTheme="theme4" />;
    case "theme5":
      return <Theme5Header currentTheme="theme5" />;
    default:
      return <Theme1Header currentTheme={currentTheme} />;
  }
};

export default ThemeHeader;
