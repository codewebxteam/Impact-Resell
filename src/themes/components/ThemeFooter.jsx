import React from "react";
import Theme1Footer from "../theme1/components/Theme1Footer";
import Theme2Footer from "../theme2/components/Theme2Footer";
import Theme3Footer from "../theme3/components/Theme3Footer";
import Theme4Footer from "../theme4/components/Theme4Footer";
import Theme5Footer from "../theme5/components/Theme5Footer";

const ThemeFooter = ({ currentTheme = "theme1" }) => {
  switch (currentTheme) {
    case "theme1":
      return <Theme1Footer currentTheme="theme1" />;
    case "theme2":
      return <Theme2Footer currentTheme="theme2" />;
    case "theme3":
      return <Theme3Footer currentTheme="theme3" />;
    case "theme4":
      return <Theme4Footer currentTheme="theme4" />;
    case "theme5":
      return <Theme5Footer currentTheme="theme5" />;
    default:
      return <Theme1Footer currentTheme={currentTheme} />;
  }
};

export default ThemeFooter;
