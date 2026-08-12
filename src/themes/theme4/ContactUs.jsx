import React from 'react';
import { useAgency } from '../../context/AgencyContext';

const ContactUs = () => {
  const { agency } = useAgency();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4">
          {agency?.name || "Academy"} - Theme 4 ContactUs
        </h1>
        <p className="text-slate-500">
          Design your custom ContactUs component here for Theme 4.
        </p>
      </div>
    </div>
  );
};

export default ContactUs;
