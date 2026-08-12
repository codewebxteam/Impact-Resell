import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

// Theme 1
import Theme1Home from './theme1/Home';
import Theme1Courses from './theme1/Courses';
import Theme1AboutUs from './theme1/AboutUs';
import Theme1ContactUs from './theme1/ContactUs';

// Theme 2
import Theme2Home from './theme2/Home';
import Theme2Courses from './theme2/Courses';
import Theme2AboutUs from './theme2/AboutUs';
import Theme2ContactUs from './theme2/ContactUs';

// Theme 3
import Theme3Home from './theme3/Home';
import Theme3Courses from './theme3/Courses';
import Theme3AboutUs from './theme3/AboutUs';
import Theme3ContactUs from './theme3/ContactUs';

// Theme 4
import Theme4Home from './theme4/Home';
import Theme4Courses from './theme4/Courses';
import Theme4AboutUs from './theme4/AboutUs';
import Theme4ContactUs from './theme4/ContactUs';

// Theme 5
import Theme5Home from './theme5/Home';
import Theme5Courses from './theme5/Courses';
import Theme5AboutUs from './theme5/AboutUs';
import Theme5ContactUs from './theme5/ContactUs';

const themeMap = {
  theme1: {
    home: Theme1Home,
    courses: Theme1Courses,
    about: Theme1AboutUs,
    contact: Theme1ContactUs,
  },
  theme2: {
    home: Theme2Home,
    courses: Theme2Courses,
    about: Theme2AboutUs,
    contact: Theme2ContactUs,
  },
  theme3: {
    home: Theme3Home,
    courses: Theme3Courses,
    about: Theme3AboutUs,
    contact: Theme3ContactUs,
  },
  theme4: {
    home: Theme4Home,
    courses: Theme4Courses,
    about: Theme4AboutUs,
    contact: Theme4ContactUs,
  },
  theme5: {
    home: Theme5Home,
    courses: Theme5Courses,
    about: Theme5AboutUs,
    contact: Theme5ContactUs,
  }
};

const DevThemeViewer = () => {
  const { theme, page } = useParams();

  const SelectedTheme = themeMap[theme];
  if (!SelectedTheme) {
    return <div className="p-10 text-center text-red-500">Invalid Theme: {theme}</div>;
  }

  const PageComponent = SelectedTheme[page];
  if (!PageComponent) {
    return <div className="p-10 text-center text-red-500">Invalid Page: {page}. Try 'home', 'courses', 'about', or 'contact'.</div>;
  }

  return (
    <div className="relative">
      {/* A small persistent badge so you know you're in dev mode */}
      <div className="fixed bottom-4 right-4 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl z-[9999] opacity-50 hover:opacity-100 transition-opacity">
        DEV MODE: {theme} / {page}
      </div>
      
      {/* Render the actual theme page */}
      <PageComponent />
    </div>
  );
};

export default DevThemeViewer;
