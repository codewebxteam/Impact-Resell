import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PieChart,
  Settings,
  LogOut,
  ShieldCheck,
  Globe,
  DollarSign,
  HelpCircle,
} from "lucide-react";
import { useAgency } from "../../context/AgencyContext";
import { useAuth } from "../../context/AuthContext";

const AgencySidebar = () => {
  const { agency } = useAgency();
  const { logout } = useAuth();

  // Dedicated menu structure for partner console
  const menuItems = [
    {
      name: "Intelligence Overview",
      path: "/partner",
      icon: LayoutDashboard,
    },
    {
      name: "Financials",
      path: "/partner/financials",
      icon: DollarSign,
    },
    {
      name: "Student Acquisition",
      path: "/partner/students",
      icon: Users,
    },
    {
      name: "Academy Settings",
      path: "/partner/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 1. BRANDING SECTION */}
      <div className="p-8 border-b border-slate-50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="size-11 bg-slate-900 rounded-2xl flex items-center justify-center text-[#5edff4] shadow-lg shadow-slate-200 transition-transform group-hover:rotate-6">
              <ShieldCheck size={26} />
            </div>
            <div className="absolute -bottom-1 -right-1 size-4 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <p className="font-black text-slate-900 leading-none tracking-tight">
              {agency.agencyName.split(" ")[0]}{" "}
              <span className="text-slate-400 font-medium text-xs">
                Partner
              </span>
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Console v2.4
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION LINKS */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 group
              ${
                isActive
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-300"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  className={`${
                    isActive ? "text-[#5edff4]" : "group-hover:text-slate-900"
                  }`}
                />
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto size-1.5 rounded-full bg-[#5edff4] shadow-[0_0_8px_#5edff4]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 3. PRO SYSTEM FOOTER */}
      <div className="p-6 space-y-4">
        {/* Support Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <HelpCircle size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Support Node
            </span>
          </div>
          <p className="text-[11px] font-mono font-bold text-slate-700 truncate">
            ID: AS-{agency.subdomain?.toUpperCase() || "MASTER"}
          </p>
        </div>

        {/* Logout Action */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-4 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all cursor-pointer"
        >
          <LogOut size={18} />
          Sign Out Console
        </button>
      </div>
    </div>
  );
};

export default AgencySidebar;
