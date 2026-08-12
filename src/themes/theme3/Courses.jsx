import React from 'react';
import { useAgency } from '../../context/AgencyContext';

const Courses = () => {
  const { agency } = useAgency();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4">
          {agency?.name || "Academy"} - Theme 3 Courses
        </h1>
        <p className="text-slate-500">
          Design your custom Courses component here for Theme 3.
        </p>
      </div>
    </div>
  );
};

export default Courses;
