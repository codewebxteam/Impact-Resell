import React from 'react';
import { useParams } from 'react-router-dom';

import { themeMap } from './themeMap';
import ThemeHeader from './components/ThemeHeader';
import ThemeFooter from './components/ThemeFooter';

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
    <div className="relative min-h-screen flex flex-col">
      {/* A small persistent badge so you know you're in dev mode */}
      <div className="fixed bottom-4 right-4 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl z-[9999] opacity-50 hover:opacity-100 transition-opacity">
        DEV MODE: {theme} / {page}
      </div>
      
      <ThemeHeader currentTheme={theme} />
      
      {/* Render the actual theme page */}
      <main className="flex-grow">
        <PageComponent />
      </main>
      
      <ThemeFooter currentTheme={theme} />
    </div>
  );
};

export default DevThemeViewer;
